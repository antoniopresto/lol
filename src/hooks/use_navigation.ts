import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
} from 'react';

export interface BreadcrumbItem {
  label: string;
  onBack?: () => void;
}

export interface NavigationEntry<T = unknown> {
  title: string;
  data: T;
}

export type TransitionDirection = 'push' | 'pop' | 'none';

interface NavigationState<T> {
  stack: NavigationEntry<T>[];
  direction: TransitionDirection;
  counter: number;
}

export interface NavigationContext<T = unknown> {
  push: (title: string, data: T) => void;
  pop: () => void;
  popToRoot: () => void;
  currentEntry: NavigationEntry<T> | null;
  breadcrumbs: BreadcrumbItem[];
  canGoBack: boolean;
  direction: TransitionDirection;
  stackDepth: number;
  navKey: number;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const NavContext = createContext<NavigationContext<any> | null>(null);

export const NavigationContextProvider = NavContext.Provider;

export function useNavigation<T = unknown>(): NavigationContext<T> {
  const ctx = useContext(NavContext);
  if (!ctx) {
    throw new Error('useNavigation must be used within a NavigationProvider');
  }
  return ctx as NavigationContext<T>;
}

export function useNavigationStack<T = unknown>(
  rootTitle: string,
): NavigationContext<T> {
  const [state, setState] = useState<NavigationState<T>>({
    stack: [],
    direction: 'none',
    counter: 0,
  });

  const counterRef = useRef(0);

  const push = useCallback((title: string, data: T) => {
    counterRef.current += 1;
    const nextCounter = counterRef.current;
    setState(prev => ({
      stack: [
        ...prev.stack,
        {
          title,
          data,
        },
      ],
      direction: 'push',
      counter: nextCounter,
    }));
  }, []);

  const pop = useCallback(() => {
    counterRef.current += 1;
    const nextCounter = counterRef.current;
    setState(prev => {
      if (prev.stack.length === 0) return prev;
      return {
        stack: prev.stack.slice(0, -1),
        direction: 'pop',
        counter: nextCounter,
      };
    });
  }, []);

  const popToRoot = useCallback(() => {
    counterRef.current += 1;
    const nextCounter = counterRef.current;
    setState(prev => {
      if (prev.stack.length === 0) return prev;
      return {
        stack: [],
        direction: 'pop',
        counter: nextCounter,
      };
    });
  }, []);

  const currentEntry: NavigationEntry<T> | null =
    state.stack.length > 0 ? state.stack[state.stack.length - 1]! : null;

  const canGoBack = state.stack.length > 0;

  const breadcrumbs = useMemo(() => {
    if (state.stack.length === 0) return [];

    const crumbs: BreadcrumbItem[] = [
      {
        label: rootTitle,
        onBack: () => {
          counterRef.current += 1;
          const nextCounter = counterRef.current;
          setState(() => ({
            stack: [],
            direction: 'pop' as const,
            counter: nextCounter,
          }));
        },
      },
    ];

    for (let i = 0; i < state.stack.length; i++) {
      const entry = state.stack[i]!;
      const isLast = i === state.stack.length - 1;
      if (isLast) {
        crumbs.push({ label: entry.title });
      } else {
        const targetDepth = i + 1;
        crumbs.push({
          label: entry.title,
          onBack: () => {
            counterRef.current += 1;
            const nextCounter = counterRef.current;
            setState(prev => ({
              stack: prev.stack.slice(0, targetDepth),
              direction: 'pop' as const,
              counter: nextCounter,
            }));
          },
        });
      }
    }

    return crumbs;
  }, [
    state.stack,
    rootTitle,
  ]);

  return useMemo(
    () => ({
      push,
      pop,
      popToRoot,
      currentEntry,
      breadcrumbs,
      canGoBack,
      direction: state.direction,
      stackDepth: state.stack.length,
      navKey: state.counter,
    }),
    [
      push,
      pop,
      popToRoot,
      currentEntry,
      breadcrumbs,
      canGoBack,
      state.direction,
      state.stack.length,
      state.counter,
    ],
  );
}
