import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import styles from './Calendar.module.css';
import { useState } from 'react';
import CreatePostModal from './CreatePostModal';
import { useGetPosts } from '../api/post';
import { calendarEventForPost } from '../lib/posts';

const Calendar: React.FC = () => {
  const posts = useGetPosts();

  return (
    <div className={styles.container}>
      <CalendarHeader />
      <FullCalendar
        loading={() => posts.isLoading}
        height="auto"
        events={posts.data?.length ? posts.data.map(calendarEventForPost) : []}
        plugins={[dayGridPlugin]}
        initialView="dayGridMonth"
      />
    </div>
  );
};

export default Calendar;

const CalendarHeader: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const onClick = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  return (
    <>
      <header className={styles.header}>
        <button onClick={onClick}>+ Create post</button>
      </header>
      <CreatePostModal isOpen={isModalOpen} onClose={handleCloseModal} />
    </>
  );
};
