import { createContext, useContext, useState } from 'react';

enum Provider {
  Facebook = 'facebook',
}

const CreatePostContext = createContext({});

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
