import * as React from "react";
import { useState, useEffect, useRef } from "react";

const styles = require("./setting-numeric.less");

/**
 * Registers clicks outside the text input element, updates state and
 * calls back accordingly.
 */
const useOutsideClick = (
  ref: any,
  setEditing: (editing: boolean) => void,
  onOutsideClick: (target: HTMLInputElement) => void
) => {
  const handleClickOutside = (e: any) => {
    if (ref.current && !ref.current.contains(e.target)) {
      onOutsideClick(ref.current);
      setEditing(false);
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  });
};

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
  reduxDispatch: (payload: number) => void
) => {
  const parsed = parseInt(input);
  const clamped = Math.min(
    Math.max(isNaN(parsed) ? fallback : parsed, minValue),
    maxValue
  );
  const newVal = integer ? Math.round(clamped) : clamped;

  if (newVal != fallback) {
    reduxDispatch(newVal);
  }
};

interface SettingNumeric {
  value: number;
  integer: boolean;
  minValue: number;
  maxValue: number;
  text: string;
  reduxDispatch?: (payload: number) => void;
}

const SettingNumeric = ({
  value,
  integer,
  minValue,
  maxValue,
  text,
  reduxDispatch
}: SettingNumeric) => {
  const [editing, setEditing] = useState(false);

  const onOutsideClick = (inputTarget: HTMLInputElement) => {
    validateAndUpdateState(
      inputTarget.value,
      integer,
      minValue,
      maxValue,
      value,
      reduxDispatch
    );
  }

  // Use the input text field as a ref, clicks outside the ref are observed in useOutsideClick.
  const wrapperRef = useRef(null);
  useOutsideClick(wrapperRef, setEditing, onOutsideClick);

  useEffect(() => {
  });

  if (editing)
    return (
      <div className={styles["setting-numeric"]}>
        <input
          ref={wrapperRef}
          type="text"
          onKeyPress={e => {
            if (e.which == 13) {
              onOutsideClick((e.target as HTMLInputElement));
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
        onClick={e => {
          setEditing(true);
        }}
      >
        {value} {text}
      </div>
    );
};

export { SettingNumeric };
