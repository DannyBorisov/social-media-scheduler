import apiClient from '../../api/client';
import { useUser } from '../../contexts/UserContext';
import { Channels } from '../../lib/channels';
import styles from './Sidebar.module.css';

const Sidebar: React.FC = () => {
  const { user } = useUser();

  return (
    <aside className={styles.sidebar}>
      <h2>Connect Channels</h2>
      <div className={styles.channelsGrid}>
        {Object.keys(Channels).map((channel) => (
          <ConnectChannelCard key={channel} channel={channel} isConnected={false} />
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
  const onNotConnectedClick = async (e: any) => {
    e.preventDefault();
    const { url } = await apiClient.get(`/auth/${props.channel}/auth-url`);
    window.location.href = url;
  };

  const onClick = async () => {
    if (props.channel === Channels.facebook) {
      const pages = await apiClient.get('/facebook/pages');
      console.log(pages);
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
    switch (channel) {
      case 'facebook':
        return 'Facebook';
      case 'instagram':
        return 'Instagram';
      case 'linkedin':
        return 'LinkedIn';
      default:
        return channel;
    }
  };

  return (
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
  );
};
