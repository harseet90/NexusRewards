import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, User, signInWithPopup, GoogleAuthProvider, signOut } from 'firebase/auth';
import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';

interface AuthContextType {
  user: User | null;
  profile: any | null;
  loading: boolean;
  signIn: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  loading: true,
  signIn: async () => {},
  logout: async () => {},
});

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
  }
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
    },
    operationType,
    path
  }
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      if (user) {
        // Sync profile
        const userRef = doc(db, 'users', user.uid);
        let userSnap;
        try {
          userSnap = await getDoc(userRef);
        } catch (err) {
          handleFirestoreError(err, OperationType.GET, `users/${user.uid}`);
          return;
        }
        
        if (!userSnap.exists()) {
          const isAdmin = user.email === 'tiwary.kris@gmail.com';
          const newProfile = {
            uid: user.uid,
            email: user.email,
            displayName: user.displayName,
            points: 0,
            referralCode: Math.random().toString(36).substring(2, 8).toUpperCase(),
            isAdmin: isAdmin,
            createdAt: new Date().toISOString(),
            lastActiveAt: new Date().toISOString(),
          };
          try {
            await setDoc(userRef, newProfile);
          } catch (err) {
            handleFirestoreError(err, OperationType.WRITE, `users/${user.uid}`);
          }
          setProfile(newProfile);
        } else {
          // Check if admin status needs to be forced for dev email
          const data = userSnap.data();
          if (user.email === 'tiwary.kris@gmail.com' && !data.isAdmin) {
             try {
                await setDoc(userRef, { isAdmin: true }, { merge: true });
             } catch (err) {
                handleFirestoreError(err, OperationType.WRITE, `users/${user.uid}`);
             }
          }
        }

        // Listen for balance updates
        const unsubProfile = onSnapshot(userRef, (snap) => {
          if (snap.exists()) {
            setProfile(snap.data());
          }
        }, (err) => {
          handleFirestoreError(err, OperationType.GET, `users/${user.uid}`);
        });
        
        setLoading(false);
        return () => unsubProfile();
      } else {
        setProfile(null);
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const signIn = async () => {
    const provider = new GoogleAuthProvider();
    await signInWithPopup(auth, provider);
  };

  const logout = async () => {
    await signOut(auth);
  };

  return (
    <AuthContext.Provider value={{ user, profile, loading, signIn, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
