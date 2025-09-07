import React, { useState } from 'react';
import Modal from './Modal';
import styles from './CreatePostModal.module.css';

interface CreatePostModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CreatePostModal: React.FC<CreatePostModalProps> = ({ isOpen, onClose }) => {
  const [postContent, setPostContent] = useState('');

  const handlePublish = () => {
    console.log('Publishing post:', postContent);
    setPostContent('');
    onClose();
  };

  const handleClose = () => {
    setPostContent('');
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Create Post" size="medium">
      <div className={styles.container}>
        <textarea
          className={styles.textEditor}
          value={postContent}
          onChange={(e) => setPostContent(e.target.value)}
          placeholder="What's on your mind?"
          rows={6}
          cols={5}
        />
        <div className={styles.buttonContainer}>
          <button className={styles.cancelButton} onClick={handleClose}>
            Cancel
          </button>
          <button
            className={styles.publishButton}
            onClick={handlePublish}
            disabled={!postContent.trim()}
          >
            Publish
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default CreatePostModal;
