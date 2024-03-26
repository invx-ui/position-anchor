// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const debounce = <F extends (...args: any[]) => any>(fn: F, wait: number): ((...args: Parameters<F>) => void) => {
  let timeoutId: number | undefined;

  // eslint-disable-next-line func-names
  return function (this: ThisParameterType<F>, ...args: Parameters<F>) {
    if (timeoutId !== undefined) {
      clearTimeout(timeoutId);
    }

    timeoutId = setTimeout(() => fn.apply(this, args), wait) as unknown as number;
  };
};
