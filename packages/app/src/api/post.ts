import { useQuery } from '@tanstack/react-query';
import apiClient from './client';
import { useUser } from '../contexts/UserContext';

export const useGetPosts = () => {
  const { user } = useUser();

  return useQuery({
    queryKey: ['posts', user?.id],
    queryFn: async () => {
      if (!user) return [];
      return await apiClient.get(`/posts?userId=${user.id}`);
    },
    enabled: !!user,
    refetchOnWindowFocus: false,
  });
};
