import { useRef, useEffect, useCallback, DependencyList } from 'react'

export function usePrevious<T>(value: T) {
    const ref = useRef<T>();
    useEffect(() => {
        ref.current = value;
    });
    return ref.current;
}

export function useDebounce(effect: any, dependencies: DependencyList, delay: number) {
    const callback = useCallback(effect, dependencies);
  
    useEffect(() => {
        const timeout = setTimeout(callback, delay);
        return () => clearTimeout(timeout);
    }, [callback, delay]);
}