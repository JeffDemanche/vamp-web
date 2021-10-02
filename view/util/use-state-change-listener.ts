import { useEffect } from "react";
import { usePrevious } from "./react-hooks";

/**
 * Listens for changes to a value and runs some function when a change happens.
 *
 * @param value Value to listen to changes for.
 * @param onValueChanged A function that's run when the previous `value` and
 * current `value` are not equal. If `comparator` is defined, this will use that
 * function, otherwise will use default equality.
 * @param comparator An optional custom comparator function.
 */
export const useStateChangeListener = <T>(
  value: T,
  onValueChanged: (before: T, after: T) => void,
  comparator?: (before: T, after: T) => boolean
): void => {
  const prevValue = usePrevious(value);
  useEffect(() => {
    if (comparator && !comparator(prevValue, value)) {
      onValueChanged(prevValue, value);
    } else if (prevValue !== value) {
      onValueChanged(prevValue, value);
    }
  }, [value, prevValue, onValueChanged, comparator]);
};
