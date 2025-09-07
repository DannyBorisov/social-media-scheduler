import { useUser } from '../../contexts/UserContext';
import styles from './Header.module.css';

const Header: React.FC = () => {
  const { user } = useUser();

  let title = 'Social Scheduler';
  if (user) {
    title += ` - Welcome, ${user.email}`;
  }

  return <header className={styles.header}>{title}</header>;
};

export default Header;
