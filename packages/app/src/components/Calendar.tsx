import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import styles from './Calendar.module.css';
import { useGetPosts } from '../api/post';
import { calendarEventForPost } from '../lib/posts';

const Calendar: React.FC = () => {
  const posts = useGetPosts();

  return (
    <div className={styles.container}>
      <FullCalendar
        dayCellClassNames={styles.dayCell}
        dayCellContent={(args) => {
          return (
            <>
              <div>{args.dayNumberText}</div>
              <AddPostDayButton onClick={() => alert('Add post for ' + args.date)} />
            </>
          );
        }}
        viewClassNames={styles.calendar}
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

const AddPostDayButton: React.FC<{ onClick: () => void }> = (props) => {
  return (
    <button className={styles.addPostButton} onClick={props.onClick}>
      +
    </button>
  );
};
