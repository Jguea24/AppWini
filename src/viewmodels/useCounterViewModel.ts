import { useCallback, useMemo, useState } from 'react';
import { CounterService } from '../services/CounterService';

export function useCounterViewModel() {
  const [count, setCount] = useState(0);

  const increment = useCallback(() => {
    setCount(current => CounterService.increment(current));
  }, []);

  const decrement = useCallback(() => {
    setCount(current => CounterService.decrement(current));
  }, []);

  const reset = useCallback(() => {
    setCount(() => CounterService.reset());
  }, []);

  return useMemo(
    () => ({
      title: 'Wini',
      count,
      increment,
      decrement,
      reset,
    }),
    [count, decrement, increment, reset]
  );
}
