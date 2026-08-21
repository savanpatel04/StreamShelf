import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import type { Title } from '../types';
import { myListStorage, type MyListStorage } from '../storage/myListStorage';

type MyListContextValue = {
  titles: Title[];
  isReady: boolean;
  isSaved: (id: string) => boolean;
  toggle: (title: Title) => Promise<void>;
};

const MyListContext = createContext<MyListContextValue | undefined>(undefined);

type Props = {
  children: ReactNode;
  storage?: MyListStorage;
};

export function MyListProvider({ children, storage = myListStorage }: Props) {
  const [titles, setTitles] = useState<Title[]>([]);
  const titlesRef = useRef<Title[]>([]);
  const queueRef = useRef(Promise.resolve());
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    storage
      .load()
      .then((loaded) => {
        if (!cancelled) {
          titlesRef.current = loaded;
          setTitles(loaded);
        }
      })
      .finally(() => {
        if (!cancelled) {
          setIsReady(true);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [storage]);

  const isSaved = useCallback(
    (id: string) => titlesRef.current.some((title) => title.id === id),
    [],
  );

  const toggle = useCallback(
    async (title: Title) => {
      const task = queueRef.current.then(async () => {
        const current = titlesRef.current;
        const next = current.some((item) => item.id === title.id)
          ? current.filter((item) => item.id !== title.id)
          : [title, ...current];

        titlesRef.current = next;
        setTitles(next);
        await storage.save(next);
      });

      queueRef.current = task.then(() => undefined, () => undefined);
      await task;
    },
    [storage],
  );

  const value = useMemo(
    () => ({ titles, isReady, isSaved, toggle }),
    [isReady, isSaved, titles, toggle],
  );

  return <MyListContext.Provider value={value}>{children}</MyListContext.Provider>;
}

export function useMyList() {
  const value = useContext(MyListContext);
  if (!value) {
    throw new Error('useMyList must be used within MyListProvider');
  }
  return value;
}
