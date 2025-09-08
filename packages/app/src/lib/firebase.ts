import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getDownloadURL, getStorage, ref, uploadBytes } from 'firebase/storage';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
const bucketName = import.meta.env.VITE_MEDIA_BUCKET_NAME;
const storage = getStorage(app, `gs://${bucketName}`);
const storageRef = ref(storage);

export const cloudStorage = {
  upload: async (file: File, path: string) => {
    const fileRef = ref(storageRef, path);
    await uploadBytes(fileRef, file);
    return `gs://${bucketName}/${path}`;
  },

  getDownloadUrl: async (path: string) => {
    const fileRef = ref(storage, path);
    return getDownloadURL(fileRef);
  },
};

export const auth = getAuth(app);
export default app;
