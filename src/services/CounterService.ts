export const CounterService = {
  increment(value: number) {
    return value + 1;
  },
  decrement(value: number) {
    return value - 1;
  },
  reset() {
    return 0;
  },
};
