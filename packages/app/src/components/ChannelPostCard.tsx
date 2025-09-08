import { EventImpl } from '@fullcalendar/core/internal';
import styles from './ChannelPostCard.module.css';
import { FaFacebook } from 'react-icons/fa';

interface Props {
  channel: 'FACEBOOK';
  event: EventImpl;
}

const ChannelPostCard: React.FC<Props> = (props) => {
  const ChannelIcon = () => {
    const map = {
      FACEBOOK: <FaFacebook />,
    };
    return map[props.event.extendedProps.channel];
  };

  console.log(props);

  const scheduleTime = new Date(props.event.start!);
  const timeString = scheduleTime.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });

  if (props.event.extendedProps.channel === 'FACEBOOK') {
    return (
      <div className={styles.eventCard}>
        <div className={styles.eventHeader}>
          <span className={styles.eventTime}>{timeString}</span>
          <ChannelIcon />
        </div>
        <div className={styles.eventContent}>{props.event.title}</div>
        {props.event.extendedProps.images?.map((img: string, index: number) => (
          <img width={20} key={index} src={img} className={styles.eventImage} />
        ))}
      </div>
    );
  }
};

export default ChannelPostCard;
