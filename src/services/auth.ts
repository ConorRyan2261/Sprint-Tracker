import { signInAnonymously, onAuthStateChanged, User } from 'firebase/auth';
import { auth } from '../config/firebase';

export const signInAsAnonymous = async (): Promise<User> => {
  const result = await signInAnonymously(auth);
  console.log('Signed in as:', result.user.uid);
  return result.user;
};

export const getCurrentUser = (): User | null => {
  return auth.currentUser;
};

export const onAuthChange = (callback: (user: User | null) => void) => {
  return onAuthStateChanged(auth, callback);
};
