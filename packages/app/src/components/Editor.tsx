import type React from 'react';
import { useCreatePost } from '../contexts/CreatePostContext';
import { useState, type FormEvent } from 'react';
import styles from './Editor.module.css';

interface Props {
  onSubmit: () => void;
}

const Editor: React.FC<Props> = (props) => {
  const { text, setText, images, setImages, scheduleTime, setScheduleTime } = useCreatePost();
  const [isPostNow, setIsPostNow] = useState(true);
  const [previews, setPreiviews] = useState<string[]>([]);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    props.onSubmit();
  }

  function onNewFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files![0];
    const fr = new FileReader();
    fr.onload = () => {
      if (fr.result) {
        const data = fr.result as string;
        setPreiviews((prev) => [...prev, data]);
      }
    };
    fr.readAsDataURL(file);
    setImages([...images, file]);
  }

  return (
    <form className={styles.container} onSubmit={handleSubmit}>
      <h2>Post Editor</h2>
      <div className={styles.editor}>
        <textarea
          className={styles.textarea}
          style={{ resize: 'none' }}
          onChange={(e) => setText(e.target.value)}
          value={text}
        />
        <div>
          {previews.length > 0 && (
            <div className={styles.imagesPreview}>
              {previews.map((img, idx) => (
                // eslint-disable-next-line react/no-array-index-key
                <img width={100} key={idx} src={img as string} alt={`preview-${idx}`} />
              ))}
            </div>
          )}
        </div>

        <div>
          <input onChange={onNewFile} id="image" hidden type="file" />
          <label className={styles.filedrop} htmlFor="image"></label>
        </div>

        <select
          onChange={(e) => setIsPostNow(e.target.value === 'now')}
          value={isPostNow ? 'now' : 'later'}
        >
          <option value="now">Post now</option>
          <option value="later">Schedule for later</option>
        </select>

        {!isPostNow && (
          <input
            type="datetime-local"
            value={scheduleTime?.toDateString() || ''}
            onChange={(e) => setScheduleTime(new Date(e.target.value))}
          />
        )}

        <button className={styles.button} type="submit">
          Post
        </button>
        {scheduleTime && <div>Scheduled for: {scheduleTime.toDateString()}</div>}
      </div>
    </form>
  );
};

export default Editor;
