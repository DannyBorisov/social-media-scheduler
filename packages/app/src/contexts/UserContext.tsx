import React, { createContext, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import type { User as FirebaseUser } from 'firebase/auth';
import { onAuthStateChanged } from 'firebase/auth';
import { useQueryClient } from '@tanstack/react-query';
import { auth } from '../lib/firebase';
import type { User } from '../api/user';
import { useGetUser, useCreateUser } from '../api/user';

interface UserContextType {
  firebaseUser: FirebaseUser | null;
  dbUser: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  refreshUser: () => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

interface UserProviderProps {
  children: ReactNode;
}

export const UserProvider: React.FC<UserProviderProps> = ({ children }) => {
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  
  const queryClient = useQueryClient();
  const createUser = useCreateUser();
  
  // Get user from database when we have firebase user
  const { 
    data: dbUser, 
    isLoading: isDbUserLoading 
  } = useGetUser(firebaseUser?.uid);

  // Listen to Firebase auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setFirebaseUser(user);
      setIsAuthLoading(false);
    });

    return unsubscribe;
  }, []);

  // Create user automatically when Firebase user exists but DB user doesn't
  useEffect(() => {
    if (firebaseUser && !isDbUserLoading && !dbUser && !createUser.isPending) {
      console.log('User not found in database, creating...', firebaseUser.uid);
      
      createUser.mutate({
        id: firebaseUser.uid,
        email: firebaseUser.email!,
        name: firebaseUser.displayName || undefined,
      }, {
        onSuccess: () => {
          console.log('User created successfully, invalidating cache...');
          // Invalidate the user query to refetch the data
          queryClient.invalidateQueries({ queryKey: ['user', firebaseUser.uid] });
        },
        onError: (error) => {
          console.error('Failed to create user:', error);
        }
      });
    }
  }, [firebaseUser?.uid, isDbUserLoading, dbUser, createUser.isPending]);

  const value: UserContextType = {
    firebaseUser,
    dbUser: dbUser || null,
    isLoading: isAuthLoading || isDbUserLoading || createUser.isPending,
    isAuthenticated: !!firebaseUser,
    refreshUser: () => refreshUser(),
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};