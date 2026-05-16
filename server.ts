import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import admin from 'firebase-admin';
import axios from 'axios';
import crypto from 'crypto';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize firebase admin
const configPath = path.join(process.cwd(), 'firebase-applet-config.json');
const firebaseConfig = JSON.parse(fs.readFileSync(configPath, 'utf-8'));

if (admin.apps.length === 0) {
  admin.initializeApp({
    projectId: firebaseConfig.projectId,
  });
}

const db = admin.firestore();

async function startServer() {
  const app = express();
  app.use(express.json());
  const PORT = 3000;

  // API Route to shorten link
  app.post("/api/shorten", async (req, res) => {
    const { linkId, userId } = req.body;
    if (!linkId || !userId) return res.status(400).json({ error: "Missing linkId or userId" });

    try {
      const settingsSnap = await db.collection('settings').doc('config').get();
      const settings = settingsSnap.data();
      const shrinkearnKey = settings?.shrinkearn;
      
      if (!shrinkearnKey) throw new Error("ShrinkEarn API key not configured in Admin panel");

      const sessionToken = crypto.randomBytes(16).toString('hex');
      
      await db.collection('link_sessions').doc(sessionToken).set({
        userId,
        linkId,
        completed: false,
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      });

      const callbackUrl = `${req.protocol}://${req.get('host')}/shortlink/verify?token=${sessionToken}`;
      const shrinkEarnUrl = `https://shrinkearn.com/api?api=${shrinkearnKey}&url=${encodeURIComponent(callbackUrl)}`;
      
      const response = await axios.get(shrinkEarnUrl);
      if (response.data.status === 'success') {
        res.json({ shortenedUrl: response.data.shortenedUrl });
      } else {
        res.status(500).json({ error: response.data.message || "Failed to shorten link" });
      }
    } catch (error: any) {
      console.error("Shorten Error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // API Route to verify completion
  app.post("/api/verify-link", async (req, res) => {
    const { token, captchaResponse } = req.body;
    if (!token) return res.status(400).json({ error: "Missing token" });

    try {
      const sessionRef = db.collection('link_sessions').doc(token);
      const sessionSnap = await sessionRef.get();
      
      if (!sessionSnap.exists) return res.status(400).json({ error: "Invalid token" });
      const session = sessionSnap.data()!;
      
      if (session.completed) return res.status(400).json({ error: "Already claimed" });

      // Verify Captcha if configured
      const settingsSnap = await db.collection('settings').doc('config').get();
      const settings = settingsSnap.data();
      
      if (settings?.captchaSecretKey && captchaResponse) {
        const verifyUrl = `https://www.google.com/recaptcha/api/siteverify?secret=${settings.captchaSecretKey}&response=${captchaResponse}`;
        const capRes = await axios.post(verifyUrl);
        if (!capRes.data.success) {
          return res.status(400).json({ error: "Captcha verification failed" });
        }
      }

      // Reward User
      let reward = 100;
      const taskSnap = await db.collection('tasks').doc(session.linkId).get();
      if (taskSnap.exists) {
        reward = taskSnap.data()?.reward || 100;
      }

      await db.runTransaction(async (t) => {
        const userRef = db.collection('users').doc(session.userId);
        t.update(userRef, {
          points: admin.firestore.FieldValue.increment(reward),
          tasksCompleted: admin.firestore.FieldValue.increment(1),
          lastActiveAt: admin.firestore.FieldValue.serverTimestamp()
        });
        t.update(sessionRef, { completed: true });
        
        const claimRef = db.collection('users').doc(session.userId).collection('claims').doc();
        t.set(claimRef, {
          taskId: session.linkId,
          reward: reward,
          claimedAt: admin.firestore.FieldValue.serverTimestamp(),
          type: 'SHORTLINK',
          taskTitle: taskSnap.exists ? taskSnap.data()?.title : 'Shortlink Reward'
        });
      });

      res.json({ success: true, reward });
    } catch (error: any) {
      console.error("Verify Error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Vite middleware
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
