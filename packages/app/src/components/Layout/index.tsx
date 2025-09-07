import Header from './Header';
import Sidebar from './Sidebar';
import styles from './Layout.module.css';

interface Props {
  children: React.ReactNode;
}

const Laoyut: React.FC<Props> = (props) => {
  return (
    <div style={{ height: '100vh' }}>
      <Header />
      <div className={styles.main}>
        <Sidebar />
        <div className="content">{props.children}</div>
      </div>
    </div>
  );
};

export default Laoyut;
