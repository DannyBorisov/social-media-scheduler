import { useMutation, useQuery } from "@tanstack/react-query";
import apiClient from "./client";

export interface User {
  id: string;
  email: string;
  name?: string | null;
  createdAt: string;
  updatedAt: string;
  facebook?: string | null;
  instagram?: string | null;
  linkedin?: string | null;
  connectedChannels: {
    facebook: boolean;
    instagram: boolean;
    linkedin: boolean;
  };
}

export interface CreateUserRequest {
  id: string; // Firebase UID
  email: string;
  name?: string;
  facebook?: string;
  instagram?: string;
  linkedin?: string;
}

export const useCreateUser = () => {
  return useMutation({
    mutationFn: async (userData: CreateUserRequest): Promise<User> => {
      return await apiClient.post("/users", userData);
    },
    onError: (error) => {
      console.error("Error creating user:", error);
    },
  });
};

export const useGetUser = (userId?: string) => {
  return useQuery({
    queryKey: ["user", userId],
    queryFn: async (): Promise<User> => {
      if (!userId) throw new Error("User ID is required");
      console.log("Fetching user with ID:", userId, "Length:", userId.length);
      return await apiClient.get(`/users/${userId}`);
    },
    enabled: !!userId,
    retry: false, // Don't retry on 404 for user creation logic
  });
};
