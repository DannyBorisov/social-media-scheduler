import { createContext, useContext, useEffect, useState } from 'react';
import { type User } from 'firebase/auth';
import { useGetUser } from '../api/user';
import { auth } from '../lib/firebase';

const UserContext = createContext<{ user: User | null; setUser: (uuser: User) => void }>({
  user: null,
  setUser: () => {},
});

function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const getUser = useGetUser();

  useEffect(() => {
    if (user) {
      return;
    }

    auth.onAuthStateChanged(async (firebaseUser) => {
      if (firebaseUser) {
        const dbUser = await getUser.mutateAsync(firebaseUser.uid);
        setUser(dbUser);
      }
    });
  }, []);

  return <UserContext.Provider value={{ user, setUser }}>{children}</UserContext.Provider>;
}

const useUser = () => useContext(UserContext);

export { useUser, UserProvider };
