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
});

const CreatePostProvider = ({ children }: { children: React.ReactNode }) => {
  const [provider, setProvider] = useState<Provider>();
  const [text, setText] = useState('');
  const [images, setImages] = useState<File[]>([]);

  return (
    <CreatePostContext.Provider value={{ text, setText, provider, setProvider, images, setImages }}>
      {children}
    </CreatePostContext.Provider>
  );
};

const useCreatePost = () => useContext(CreatePostContext);

export { useCreatePost, CreatePostProvider };
