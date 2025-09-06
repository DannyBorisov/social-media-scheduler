import { useState } from 'react';
import apiClient from '../../api/client';
import { useUser } from '../../contexts/UserContext';
import { Channels } from '../../lib/channels';
import styles from './Sidebar.module.css';
import Modal from '../Modal';
import { useCreatePost } from '../../contexts/CreatePostContext';
import Editor from '../Editor';

const Sidebar: React.FC = () => {
  const { user, setUser } = useUser();

  if (!user) {
    return null;
  }

  return (
    <aside className={styles.sidebar}>
      <h2>Connect Channels</h2>
      <div className={styles.channelsGrid}>
        {Object.keys(Channels).map((channel) => (
          <ConnectChannelCard key={channel} channel={channel} isConnected={!!user[channel]} />
        ))}
      </div>
    </aside>
  );
};

export default Sidebar;

const ConnectChannelCard: React.FC<{
  channel: string;
  isConnected: boolean;
}> = (props) => {
  const [pages, setPages] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState<string>('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const createPost = useCreatePost();

  const onNotConnectedClick = async (e: any) => {
    e.preventDefault();
    const { url } = await apiClient.get(`/channel/auth/${props.channel}`);
    window.location.href = url;
  };

  const onClick = async () => {
    if (props.channel === Channels.facebook) {
      const { data: pages } = await apiClient.get('/facebook/pages');
      console.log('Fetched Facebook pages:', pages);
      if (pages && pages.length > 0) {
        setPages(pages);
        setIsModalOpen(true);
      }
    }
  };

  const getChannelIcon = (channel: string) => {
    switch (channel) {
      case 'facebook':
        return '📘';
      case 'instagram':
        return '📷';
      case 'linkedin':
        return '💼';
      default:
        return '🔗';
    }
  };

  const getChannelName = (channel: string) => {
    return channel.at(0)!.toUpperCase() + channel.slice(1);
  };

  function onSubmit() {
    if (props.channel === Channels.facebook) {
      apiClient.post('/channel/facebook/post', {
        params: {
          message: createPost.text,
          page: currentPage,
          images: [
            'https://i.postimg.cc/qMKYk04S/IMG-0100.png',
            'https://i.postimg.cc/7h3WnMsD/544057022-1144200984263694-2719864190532806785-n.jpg',
          ],
        },
      });
    }
  }

  function onPageChange(e: React.FormEvent<HTMLInputElement>) {
    const page = pages.find((p) => p.id === e.currentTarget.id);
    setCurrentPage(page);
  }

  return (
    <>
      <div
        role="button"
        onClick={props.isConnected ? onClick : onNotConnectedClick}
        className={styles.card}
      >
        <div className={`${styles.icon} ${styles[props.channel]}`}>
          {getChannelIcon(props.channel)}
        </div>
        <div className={styles.channelInfo}>
          <div className={styles.channelName}>{getChannelName(props.channel)}</div>
          <div className={styles.channelStatus}>
            {props.isConnected ? 'Connected' : 'Click to connect'}
          </div>
        </div>
      </div>
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Channel Info">
        <p>More details about the {getChannelName(props.channel)} channel will go here.</p>
        {props.channel === Channels.facebook && pages.length > 0 && (
          <div>
            <h3>Connected Facebook Pages:</h3>
            <ul>
              {pages.map((page) => (
                <li key={page.id}>
                  <input onChange={onPageChange} type="radio" name="pages" id={page.id} />
                  <label htmlFor={page.id}>{page.name}</label>
                </li>
              ))}
            </ul>
            <Editor onSubmit={onSubmit} />
          </div>
        )}
      </Modal>
    </>
  );
};
