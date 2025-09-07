import './App.css';
import Calendar from './components/Calendar';
import CreatePost from './components/CreatePost';
import Layout from './components/Layout';
import Modal from './components/Modal';
import { useCreatePost } from './contexts/CreatePostContext';

function App() {
  const { isModalOpen, setModalOpen, channel } = useCreatePost();

  return (
    <>
      <Layout>
        <Calendar />
      </Layout>
      <Modal isOpen={isModalOpen} onClose={() => setModalOpen(false)}>
        <CreatePost channel={channel!} />
      </Modal>
    </>
  );
}

export default App;
