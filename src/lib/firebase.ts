import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyAuur6nT1Js45wzQuMoQRk4dJfdwI0tvTo",
  authDomain: "printforge-d5472.firebaseapp.com",
  projectId: "printforge-d5472",
  storageBucket: "printforge-d5472.firebasestorage.app",
  messagingSenderId: "964877855951",
  appId: "1:964877855951:web:6b991e73e7be2811359bba",
};

export const firebaseApp = initializeApp(firebaseConfig);
export const auth = getAuth(firebaseApp);

// Hardcoded admin Firebase UIDs. Add more UIDs to this array to grant admin access.
export const ADMIN_UIDS = [
  "PjWhpms7NWRueIymevyWcAnXr9f2",
];

export const isAdminUid = (uid: string | undefined | null) =>
  !!uid && ADMIN_UIDS.includes(uid);
