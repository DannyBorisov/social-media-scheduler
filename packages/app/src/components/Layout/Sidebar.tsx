import apiClient from '../../api/client';
import { useCreatePost } from '../../contexts/CreatePostContext';
import { useUser } from '../../contexts/UserContext';
import { Channels } from '../../lib/channels';
import styles from './Sidebar.module.css';
import { FaFacebook } from 'react-icons/fa';

const Sidebar: React.FC = () => {
  const { user } = useUser();

  if (!user) {
    return null;
  }

  return (
    <aside className={styles.sidebar}>
      <div className={styles.channelsGrid}>
        {Object.keys(Channels).map((channel) => (
          <ChannelCard key={channel} channel={channel} isConnected={!!user[channel]} />
        ))}
      </div>
    </aside>
  );
};

export default Sidebar;

const ChannelCard: React.FC<{
  channel: string;
  isConnected: boolean;
}> = (props) => {
  const { setUser, user } = useUser();
  const { setModalOpen, setChannel } = useCreatePost();
  const getChannelName = (channel: string) => {
    return channel.at(0)!.toUpperCase() + channel.slice(1);
  };

  async function onClick() {
    if (props.isConnected) {
      if (props.channel === Channels.facebook) {
        const { data: pages } = await apiClient.get('/facebook/pages');
        setUser({ ...user, facebookPages: pages });
        setChannel('facebook');
        setModalOpen(true);
      }
    } else {
      const { url } = await apiClient.get(`/channel/auth/${props.channel}`);
      window.location.href = url;
    }
  }

  return (
    <>
      <div role="button" onClick={onClick} className={styles.card}>
        <div className={`${styles.icon} ${styles[props.channel]}`}>
          <FaFacebook width={10} />
        </div>
        <div className={styles.channelInfo}>
          <div className={styles.channelName}>{getChannelName(props.channel)}</div>
          <div className={styles.channelStatus}>
            <small>{props.isConnected ? 'Connected' : 'Click to connect'}</small>
          </div>
        </div>
      </div>
    </>
  );
};
