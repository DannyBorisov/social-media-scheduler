import { useState } from 'react';
import apiClient from '../../api/client';
import { useUser } from '../../contexts/UserContext';
import { Channels } from '../../lib/channels';
import styles from './Sidebar.module.css';
import Modal from '../Modal';

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
  const [isModalOpen, setIsModalOpen] = useState(false);

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
        {JSON.stringify(pages)}
      </Modal>
    </>
  );
};
