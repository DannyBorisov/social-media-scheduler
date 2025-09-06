import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import styles from "./Calendar.module.css";
import { useState } from "react";
import CreatePostModal from "./CreatePostModal";

const Calendar: React.FC = () => {
  return (
    <div className={styles.container}>
      <CalendarHeader />
      <FullCalendar
        plugins={[dayGridPlugin]}
        initialView="dayGridMonth"
        height="auto"
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
