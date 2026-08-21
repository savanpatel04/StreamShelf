import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { Platform } from 'react-native';
import { eventToDirection, findNeighbor, type Direction, type FocusRect } from './spatial';

type FocusableNode = FocusRect & {
  onSelect: () => void;
};

type FocusRegistry = {
  focusedId: string | null;
  register: (node: FocusableNode) => void;
  unregister: (id: string) => void;
  setFocused: (id: string) => void;
};

const FocusRegistryContext = createContext<FocusRegistry | undefined>(undefined);

export function DirectionalNavProvider({ children }: { children: ReactNode }) {
  const nodes = useRef(new Map<string, FocusableNode>());
  const [focusedId, setFocusedId] = useState<string | null>(null);

  const register = useCallback((node: FocusableNode) => {
    nodes.current.set(node.id, node);
    setFocusedId((current) => current ?? node.id);
  }, []);

  const unregister = useCallback((id: string) => {
    nodes.current.delete(id);
    setFocusedId((current) => (current === id ? nextId(nodes.current) : current));
  }, []);

  const move = useCallback((direction: Direction) => {
    setFocusedId((current) => {
      if (!current) {
        return nextId(nodes.current);
      }
      const origin = nodes.current.get(current);
      if (!origin) {
        return nextId(nodes.current);
      }
      const neighbor = findNeighbor(origin, direction, [...nodes.current.values()]);
      return neighbor?.id ?? current;
    });
  }, []);

  const selectFocused = useCallback(() => {
    setFocusedId((id) => {
      if (id) {
        nodes.current.get(id)?.onSelect();
      }
      return id;
    });
  }, []);

  useEffect(() => {
    if (Platform.OS !== 'web' || typeof window === 'undefined') {
      return;
    }
    const onKeyDown = (event: KeyboardEvent) => {
      const map: Record<string, Direction> = {
        ArrowLeft: 'left',
        ArrowRight: 'right',
        ArrowUp: 'up',
        ArrowDown: 'down',
      };
      const direction = map[event.key];
      if (direction) {
        event.preventDefault();
        move(direction);
        return;
      }
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        selectFocused();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [move, selectFocused]);

  const onRemoteEvent = useCallback(
    (eventType: string) => {
      const direction = eventToDirection(eventType);
      if (direction) {
        move(direction);
        return;
      }
      if (eventType === 'select') {
        selectFocused();
      }
    },
    [move, selectFocused],
  );

  useRemoteEvents(onRemoteEvent);

  const value = useMemo(
    () => ({
      focusedId,
      register,
      unregister,
      setFocused: setFocusedId,
    }),
    [focusedId, register, unregister],
  );

  return (
    <FocusRegistryContext.Provider value={value}>{children}</FocusRegistryContext.Provider>
  );
}

export function useFocusRegistry() {
  const value = useContext(FocusRegistryContext);
  if (!value) {
    throw new Error('useFocusRegistry must be used within DirectionalNavProvider');
  }
  return value;
}

function nextId(map: Map<string, FocusableNode>) {
  return map.keys().next().value ?? null;
}

function useRemoteEvents(onEvent: (eventType: string) => void) {
  useEffect(() => {
    type Handler = {
      enable: (
        component: unknown,
        callback: (_cmp: unknown, event: { eventType?: string }) => void,
      ) => void;
      disable: () => void;
    };
    const RN = require('react-native') as { TVEventHandler?: new () => Handler };
    if (typeof RN.TVEventHandler !== 'function') {
      return;
    }
    const handler = new RN.TVEventHandler();
    handler.enable(null, (_cmp, event) => {
      if (event?.eventType) {
        onEvent(event.eventType);
      }
    });
    return () => handler.disable();
  }, [onEvent]);
}
