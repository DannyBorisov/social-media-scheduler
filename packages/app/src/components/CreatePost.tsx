import React, { useState } from 'react';
import Editor from './Editor';
import { useCreatePost } from '../contexts/CreatePostContext';
import { cloudStorage } from '../lib/firebase';
import apiClient from '../api/client';
import { useUser } from '../contexts/UserContext';
import toast from 'react-hot-toast';
import { Channel } from '../lib/channels';
import { useGetPosts } from '../api/post';

interface Props {
  channel: Channel;
}

const CreatePost: React.FC<Props> = ({ channel }) => {
  const createPost = useCreatePost();
  const posts = useGetPosts();

  const [currentPage, setCurrentPage] = useState<string>('');
  const { user } = useUser();

  async function onSubmit() {
    const imageURLs: string[] = [];

    if (createPost.images.length !== 0) {
      for (const img of createPost.images) {
        const path = `${user?.id}/medias/${Date.now()}-${Math.random()}.png`;
        await cloudStorage.upload(img, path);
        imageURLs.push(path);
      }
    }

    if (channel === Channel.Facebook) {
      const params = {
        message: createPost.text,
        page: currentPage,
        images: imageURLs,
        time: '',
      };

      if (createPost.scheduleTime) {
        params.time = createPost.scheduleTime.toISOString();
      }

      await apiClient.post('/channel/facebook/post', { params });
      toast.success('Post created successfully!');
      createPost.setModalOpen(false);
      createPost.setText('');
      createPost.setImages([]);
      createPost.setScheduleTime();
      posts.refetch();
    }
  }

  function onPageChange(e: React.FormEvent<HTMLInputElement>) {
    const page = user!.facebook?.pages.find((p) => p.id === e.currentTarget.id);

    if (!page) {
      return;
    }

    setCurrentPage(page);
  }

  let DynamicComponent;
  if (channel === Channel.Facebook) {
    const hasPages = !!user?.facebook?.pages?.length;

    if (hasPages) {
      DynamicComponent = (
        <div>
          <h3>Connected Facebook Pages:</h3>
          <ul>
            {user.facebook?.pages?.map((page: any) => (
              <li key={page.id}>
                <img src={page.picture} alt={page.name} width={20} height={20} />
                <input onChange={onPageChange} type="radio" name="pages" id={page.id} />
                <label htmlFor={page.id}>{page.name}</label>
              </li>
            ))}
          </ul>
        </div>
      );
    } else {
      DynamicComponent = <div>No pages yet</div>;
    }
  } else {
    DynamicComponent = <div></div>;
  }
  return (
    <div>
      {DynamicComponent}
      <Editor onSubmit={onSubmit} />
    </div>
  );
};

export default CreatePost;
