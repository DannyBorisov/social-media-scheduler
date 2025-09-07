import { useUser } from '../../contexts/UserContext';
import styles from './Header.module.css';

const Header: React.FC = () => {
  const { user, logout } = useUser();

  const getInitials = (name: string | null | undefined, email: string) => {
    if (name) {
      return name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
    }
    return email.slice(0, 2).toUpperCase();
  };

  const getDisplayName = (name: string | null | undefined, email: string) => {
    return name || email.split('@')[0];
  };

  return (
    <header className={styles.header}>
      <div className={styles.logo}>
        <h1>Social Scheduler</h1>
      </div>

      {user && (
        <div className={styles.userSection}>
          <div className={styles.userInfo}>
            <div className={styles.avatar}>{getInitials(user.name, user.email)}</div>
            <div className={styles.userDetails}>
              <span className={styles.userName}>{getDisplayName(user.name, user.email)}</span>
              <span className={styles.userEmail}>{user.email}</span>
            </div>
          </div>
          <button className={styles.signoutButton} onClick={logout}>
            Sign Out
          </button>
        </div>
      )}
    </header>
  );
};

export default Header;
