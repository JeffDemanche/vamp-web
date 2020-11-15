import * as React from "react";
import { useState, useRef, useEffect } from "react";

import * as styles from "./setting-text.less";

const validateAndUpdateState = (
  input: string,
  fallback: string,
  onChange: (payload: string) => void
): void => {
  const newVal = !input || !input.trim() ? fallback : input.trim();
  if (newVal != fallback) {
    onChange(newVal);
  }
};

interface SettingTextProps {
  value: string;
  onChange?: (payload: string) => void;
}

/*
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

export const SettingText: React.FunctionComponent<SettingTextProps> = ({
  value,
  onChange
}) => {
  const [editing, setEditing] = useState(false);

  const onOutsideClick = (inputTarget: HTMLInputElement): void => {
    validateAndUpdateState(inputTarget.value, value, onChange);
  };

  // Use the input text field as a ref, clicks outside the ref are observed in useOutsideClick.
  const wrapperRef = useRef(null);
  useOutsideClick(wrapperRef, setEditing, onOutsideClick);

  if (editing)
    return (
      <div className={styles["setting-text"]}>
        <input
          ref={wrapperRef}
          type="text"
          onKeyPress={(e): void => {
            if (e.keyCode == 13) {
              onOutsideClick(e.target as HTMLInputElement);
              setEditing(false);
            }
          }}
        />{" "}
      </div>
    );
  else
    return (
      <div
        className={styles["setting-text"]}
        onClick={(): void => {
          setEditing(true);
        }}
      >
        {value}
      </div>
    );
};
