import apiClient from '../../api/client';
import { useCreatePost } from '../../contexts/CreatePostContext';
import { useUser } from '../../contexts/UserContext';
import { Channel } from '../../lib/channels';
import styles from './Sidebar.module.css';
import { FaFacebook } from 'react-icons/fa';

const Sidebar: React.FC = () => {
  const { user } = useUser();

  if (!user) {
    return null;
  }

  const isConnected = {
    [Channel.Facebook]: !!user.facebook,
    [Channel.Instagram]: !!user.facebook?.scope?.includes('instagram_business_basic'),
    [Channel.LinkedIn]: false,
    [Channel.Tiktok]: false,
  };

  return (
    <aside className={styles.sidebar}>
      <div className={styles.channelsGrid}>
        {Object.values(Channel).map((channel) => (
          <ChannelCard
            key={channel}
            channel={channel}
            isConnected={isConnected[channel as Channel]}
          />
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
  const { setModalOpen, setChannel } = useCreatePost();
  const getChannelName = (channel: string) => {
    return channel.at(0)!.toUpperCase() + channel.slice(1);
  };

  async function onClick() {
    if (props.isConnected) {
      if (props.channel === Channel.Facebook) {
        setChannel(Channel.Facebook);
        setModalOpen(true);
        return;
      }

      if (props.channel === Channel.Instagram) {
        setChannel(Channel.Instagram);
      }
    } else {
      const name = props.channel.toLowerCase();
      const { url } = await apiClient.get(`/channel/auth/${name}`);
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
