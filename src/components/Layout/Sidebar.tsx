import apiClient from "../../api/client";
import { Channels } from "../../lib/channels";
import styles from "./Sidebar.module.css";

const Sidebar: React.FC = () => {
  return (
    <aside className="sidebar">
      <h2>Connect Channels</h2>
      {Object.keys(Channels).map((channel) => (
        <ConnectChannelCard key={channel} channel={channel}  />
      ))}
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
      const pages = await apiClient.get("/facebook/pages");
      console.log(pages);
    }
  };

  return (
    <div
      role="button"
      onClick={props.isConnected ? onClick : onNotConnectedClick}
      className={styles.card}
    >
      Connect {Channels[props.channel as keyof typeof Channels]}
    </div>
  );
};
