import { useUser } from '../../contexts/UserContext';

const Header: React.FC = () => {
  const { user } = useUser();

  if (user) {
    return <header className="header">Social Scheduler - Welcome, {user.email}</header>;
  }

  return <header className="header">Social Scheduler</header>;
};

export default Header;
