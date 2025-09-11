import React, { useState } from 'react';
import Editor from './Editor';
import { useCreatePost } from '../contexts/CreatePostContext';
import { cloudStorage } from '../lib/firebase';
import apiClient from '../api/client';
import { useUser } from '../contexts/UserContext';
import toast from 'react-hot-toast';
import { Channel } from '../lib/channels';
import { useGetPosts } from '../api/post';
import styles from './CreatePost.module.css';

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
      await posts.refetch();
      createPost.setModalOpen(false);
      createPost.setText('');
      createPost.setImages([]);
      createPost.setScheduleTime();
      toast.success('Post created successfully!');
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
        <div className={styles.pagesSection}>
          <h3 className={styles.pagesTitle}>
            <div className={styles.facebookIcon}>f</div>
            Select Facebook Page
          </h3>
          <ul className={styles.pagesGrid}>
            {user.facebook?.pages?.map((page: any) => (
              <li
                key={page.id}
                className={`${styles.pageCard} ${currentPage === page ? styles.selected : ''}`}
                onClick={() => setCurrentPage(page)}
              >
                <img src={page.picture} alt={page.name} className={styles.pageAvatar} />
                <div className={styles.pageInfo}>
                  <p className={styles.pageName}>{page.name}</p>
                </div>
                <input
                  onChange={onPageChange}
                  type="radio"
                  name="pages"
                  id={page.id}
                  className={styles.hiddenRadio}
                  checked={currentPage === page}
                  readOnly
                />
              </li>
            ))}
          </ul>
        </div>
      );
    } else {
      DynamicComponent = (
        <div className={styles.pagesSection}>
          <div className={styles.noPages}>
            <div className={styles.facebookIcon} style={{ margin: '0 auto 0.5rem' }}>
              f
            </div>
            <p>No Facebook pages connected yet</p>
          </div>
        </div>
      );
    }
  } else {
    DynamicComponent = <div></div>;
  }
  return (
    <div className={styles.container}>
      {DynamicComponent}
      <Editor onSubmit={onSubmit} />
    </div>
  );
};

export default CreatePost;
