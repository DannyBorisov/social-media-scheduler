import { createContext, useContext, useState } from 'react';

enum Provider {
  Facebook = 'facebook',
}

const CreatePostContext = createContext({
  text: '',
  setText: (_: string) => {},
  provider: undefined as Provider | undefined,
  setProvider: (_: Provider) => {},
  images: [] as File[],
  setImages: (_: File[]) => {},
  scheduleTime: undefined as Date | undefined,
  setScheduleTime: (_?: Date | undefined) => {},
  isModalOpen: false,
  setModalOpen: (_: boolean) => {},
  channel: undefined as string | undefined,
  setChannel: (_: string) => {},
});

const CreatePostProvider = ({ children }: { children: React.ReactNode }) => {
  const [provider, setProvider] = useState<Provider>();
  const [text, setText] = useState('');
  const [images, setImages] = useState<File[]>([]);
  const [scheduleTime, setScheduleTime] = useState<Date | undefined>();
  const [isModalOpen, setModalOpen] = useState(false);
  const [channel, setChannel] = useState('');

  return (
    <CreatePostContext.Provider
      value={{
        text,
        setText,
        provider,
        setProvider,
        images,
        setImages,
        scheduleTime,
        setScheduleTime,
        isModalOpen,
        setModalOpen,
        channel,
        setChannel,
      }}
    >
      {children}
    </CreatePostContext.Provider>
  );
};

const useCreatePost = () => useContext(CreatePostContext);

export { useCreatePost, CreatePostProvider };
