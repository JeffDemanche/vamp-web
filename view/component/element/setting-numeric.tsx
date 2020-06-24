import * as React from "react";
import { useState, useRef, useEffect } from "react";

import * as styles from "./setting-numeric.less";

/**
 * Ensures input is a valid integer, then calls back to redux action for
 * state change (see bpm-setting.tsx for example).
 */
const validateAndUpdateState = (
  input: string,
  integer: boolean,
  minValue: number,
  maxValue: number,
  fallback: number,
  onChange: (payload: number) => void
): void => {
  const parsed = parseInt(input);
  const clamped = Math.min(
    Math.max(isNaN(parsed) ? fallback : parsed, minValue),
    maxValue
  );
  const newVal = integer ? Math.round(clamped) : clamped;

  if (newVal != fallback) {
    onChange(newVal);
  }
};

interface SettingNumeric {
  value: number;
  integer: boolean;
  minValue: number;
  maxValue: number;
  text: string;
  onChange?: (payload: number) => void;
}

/**
 * Registers clicks outside the text input element, updates state and
 * calls back accordingly.
 */
const useOutsideClick = (
  ref: React.MutableRefObject<any>,
  setEditing: (editing: boolean) => void,
  onOutsideClick: (target: HTMLInputElement) => void
): void => {
  const handleClickOutside = (e: KeyboardEvent): void => {
    if (ref.current && !ref.current.contains(e.target)) {
      onOutsideClick(ref.current);
      setEditing(false);
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return (): void => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  });
};

const SettingNumeric: React.FunctionComponent<SettingNumeric> = ({
  value,
  integer,
  minValue,
  maxValue,
  text,
  onChange
}) => {
  const [editing, setEditing] = useState(false);

  const onOutsideClick = (inputTarget: HTMLInputElement): void => {
    validateAndUpdateState(
      inputTarget.value,
      integer,
      minValue,
      maxValue,
      value,
      onChange
    );
  };

  // Use the input text field as a ref, clicks outside the ref are observed in useOutsideClick.
  const wrapperRef = useRef(null);
  useOutsideClick(wrapperRef, setEditing, onOutsideClick);

  if (editing)
    return (
      <div className={styles["setting-numeric"]}>
        <input
          ref={wrapperRef}
          type="text"
          onKeyPress={(e): void => {
            if (e.which == 13) {
              onOutsideClick(e.target as HTMLInputElement);
              setEditing(false);
            }
          }}
        />{" "}
        {text}
      </div>
    );
  else
    return (
      <div
        className={styles["setting-numeric"]}
        onClick={(): void => {
          setEditing(true);
        }}
      >
        {value} {text}
      </div>
    );
};

export { SettingNumeric };
