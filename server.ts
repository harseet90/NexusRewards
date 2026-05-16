import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import admin from 'firebase-admin';
import { getFirestore } from 'firebase-admin/firestore';
import axios from 'axios';
import crypto from 'crypto';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize firebase admin
const configPath = path.join(process.cwd(), 'firebase-applet-config.json');
const firebaseConfig = JSON.parse(fs.readFileSync(configPath, 'utf-8'));

console.log("[Server] Initializing with Project ID:", firebaseConfig.projectId);
console.log("[Server] Using Database ID:", firebaseConfig.firestoreDatabaseId);

if (admin.apps.length === 0) {
  try {
    admin.initializeApp({
      projectId: firebaseConfig.projectId
    });
    console.log("[Server] Firebase Admin initialized with project:", firebaseConfig.projectId);
  } catch (err) {
    console.error("[Server] Firebase Admin init error:", err);
  }
}

// Ensure we use the correct database ID (AI Studio uses non-default databases)
const db = getFirestore(firebaseConfig.firestoreDatabaseId);

// Pre-initialize settings if they don't exist
const initializeSettings = async () => {
  try {
    const configRef = db.collection('settings').doc('config');
    const snap = await configRef.get();
    if (!snap.exists) {
      console.log("[Server] Pre-initializing settings/config...");
      await configRef.set({
        maintenanceMode: false,
        minWithdrawal: 1000,
        captchaSiteKey: '6LeklewsAAAAAA4owo2vnYC2sWt0nd-4RjWMSaSX',
        captchaSecretKey: '6LeklewsAAAAAD6ICI587fyBwMIfCiZUsNE3onVv',
        shrinkearn: 'YOUR_API_KEY_HERE',
        shortlinkApiUrl: 'https://shrinkme.io/api',
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });
      console.log("[Server] Settings initialized.");
    } else {
      // Ensure shortlinkApiUrl exists if doc already exists
      const data = snap.data();
      if (!data?.shortlinkApiUrl) {
        await configRef.update({
          shortlinkApiUrl: 'https://shrinkme.io/api'
        });
      }
    }

    // Check if tasks exist
    const tasksSnap = await db.collection('tasks').limit(1).get();
    if (tasksSnap.empty) {
      console.log("[Server] Pre-initializing default shortlinks...");
      await db.collection('tasks').doc('shrinkearn_default').set({
        id: 'shrinkearn_default',
        title: 'ShrinkEarn Official',
        description: 'Premium High-Reward Shortlink',
        reward: 150,
        type: 'SHORTLINK',
        provider: 'shrinkearn',
        isActive: true,
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      });
      await db.collection('tasks').doc('shrinkme_default').set({
        id: 'shrinkme_default',
        title: 'ShrinkMe Official',
        description: 'Global Premium Shortlink',
        reward: 120,
        type: 'SHORTLINK',
        provider: 'shrinkme',
        isActive: true,
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      });
    }
  } catch (err) {
    console.error("[Server] Error initializing settings:", err);
  }
};
initializeSettings();

async function startServer() {
  const app = express();
  app.use(express.json());
  const PORT = 3000;

  // Health check to test DB connectivity
  app.get("/api/health", async (req, res) => {
    try {
      await db.collection('settings').doc('health').get();
      res.json({ status: "ok", database: "connected" });
    } catch (error: any) {
      console.error("[Health] DB Error:", error);
      res.status(500).json({ status: "error", message: error.message });
    }
  });

  // API Route to shorten link
  app.post("/api/shorten", async (req, res) => {
    const { linkId, userId } = req.body;
    if (!linkId || !userId) return res.status(400).json({ error: "Missing linkId or userId" });

    try {
      console.log(`[Shorten] Attempting to fetch config...`);
      const settingsSnap = await db.collection('settings').doc('config').get();
      const settings = settingsSnap.data();
      
      const taskSnap = await db.collection('tasks').doc(linkId).get();
      const task = taskSnap.exists ? taskSnap.data() : null;
      
      // Use the 'shrinkearn' field as the key if that's where the user put it
      const apiKey = settings?.shrinkearn || settings?.shortlinkKeys?.shrinkearn;
      const apiUrl = settings?.shortlinkApiUrl || 'https://shrinkme.io/api';

      console.log(`[Shorten] Using API URL: ${apiUrl}`);
      
      if (!apiKey || apiKey === 'YOUR_API_KEY_HERE') {
        throw new Error(`Shortlink API key not configured. Please add your API key in the 'shrinkearn' field in Admin settings (Firestore: settings/config).`);
      }

      const sessionToken = crypto.randomBytes(16).toString('hex');
      
      console.log(`[Shorten] Creating session ${sessionToken}...`);
      await db.collection('link_sessions').doc(sessionToken).set({
        userId,
        linkId,
        completed: false,
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      });

      // Handle proxy headers for correct external URL
      let protocol = req.headers['x-forwarded-proto'] || req.protocol;
      if (Array.isArray(protocol)) protocol = protocol[0];
      
      let host = req.headers['x-forwarded-host'] || req.get('host');
      if (Array.isArray(host)) host = host[0];
      if (!host) host = 'localhost:3000'; // Fallback

      // In production/cloud environments, protocol is often reported as http inside the container
      // but the external URL is always https.
      if (process.env.NODE_ENV === 'production' || host.includes('aistudio.google') || host.includes('run.app')) {
        protocol = 'https';
      }
      
      const callbackUrl = `${protocol}://${host}/shortlink/verify?token=${sessionToken}`;
      
      const fullRequestUrl = `${apiUrl}?api=${apiKey}&url=${encodeURIComponent(callbackUrl)}`;
      
      console.log(`[Shorten] Requesting Shortlink: ${fullRequestUrl}`);
      
      const response = await axios.get(fullRequestUrl);
      const data = response.data;
      console.log(`[Shorten] API Response Data:`, data);
      
      if (data.status === 'success' || data.shortenedUrl || data.short_url) {
        const shortenedUrl = data.shortenedUrl || data.short_url;
        if (!shortenedUrl) throw new Error("API returned success but no shortened URL");
        res.json({ shortenedUrl });
      } else {
        console.error(`[Shorten] API Error:`, data);
        res.status(500).json({ error: data.message || `Shortlink API error. Check your API key.` });
      }
    } catch (error: any) {
      console.error("[Shorten] Top-level error:", error);
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
        console.log("[Verify] Validating Recaptcha...");
        const params = new URLSearchParams();
        params.append('secret', settings.captchaSecretKey);
        params.append('response', captchaResponse);
        
        const capRes = await axios.post('https://www.google.com/recaptcha/api/siteverify', params);
        
        if (!capRes.data.success) {
          console.error("[Verify] Recaptcha Failed:", capRes.data);
          return res.status(400).json({ error: "Captcha verification failed. Please try again." });
        }
        console.log("[Verify] Recaptcha Success");
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
