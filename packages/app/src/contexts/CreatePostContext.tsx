import { createContext, useContext, useState } from 'react';

enum Provider {
  Facebook = 'facebook',
}

const CreatePostContext = createContext({
  text: '',
  setText: (text: string) => {},
  provider: undefined as Provider | undefined,
  setProvider: (provider: Provider) => {},
});

const CreatePostProvider = ({ children }: { children: React.ReactNode }) => {
  const [provider, setProvider] = useState<Provider>();
  const [text, setText] = useState('');

  return (
    <CreatePostContext.Provider value={{ text, setText, provider, setProvider }}>
      {children}
    </CreatePostContext.Provider>
  );
};

const useCreatePost = () => useContext(CreatePostContext);

export { useCreatePost, CreatePostProvider };
