import { createContext, useContext, useEffect, useState } from 'react';
import { signOut } from 'firebase/auth';
import { useGetUser, type User } from '../api/user';
import { auth } from '../lib/firebase';

const UserContext = createContext<{
  user: User | null;
  setUser: (uuser: User) => void;
  logout: () => void;
}>({
  user: null,
  setUser: () => {},
  logout: () => {},
});

function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const getUser = useGetUser();

  const logout = async () => {
    try {
      await signOut(auth);
      setUser(null);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  useEffect(() => {
    if (user) {
      return;
    }

    auth.onAuthStateChanged(async (firebaseUser) => {
      if (firebaseUser) {
        const dbUser = await getUser.mutateAsync(firebaseUser.uid);
        setUser(dbUser);
      } else {
        setUser(null);
      }
    });
  }, []);

  return <UserContext.Provider value={{ user, setUser, logout }}>{children}</UserContext.Provider>;
}

const useUser = () => useContext(UserContext);

export { useUser, UserProvider };
