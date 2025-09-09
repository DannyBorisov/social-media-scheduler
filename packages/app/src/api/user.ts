import { useMutation } from '@tanstack/react-query';
import apiClient from './client';

export interface FacebookIntegration {
  pages: string[];
}

export interface User {
  id: string;
  email: string;
  name?: string | null;
  facebook: FacebookIntegration | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateUserRequest {
  id: string;
  email: string;
  name?: string;
  facebook?: string;
  instagram?: string;
  linkedin?: string;
}

export const useCreateUser = () => {
  return useMutation({
    mutationFn: async (userData: CreateUserRequest): Promise<User> => {
      return await apiClient.post('/user', userData);
    },
    onError: (error) => {
      console.error('Error creating user:', error);
    },
  });
};

export const useGetUser = () => {
  return useMutation({
    mutationFn: async (userId: string) => {
      return await apiClient.get(`/user/${userId}`);
    },
    onError: (error) => {
      console.error('Error fetching user:', error);
    },
  });
};
