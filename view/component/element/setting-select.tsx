import * as React from "react";
import { useState, useEffect, useRef, MouseEvent } from "react";

const _ = require("underscore");

const styles = require("./setting-select.less");

const useOutsideClick = (
  ref: any,
  setEditing: (editing: boolean) => void,
  onOutsideChange: (payload: string) => void
) => {
  const handleClickOutside = (e: any) => {
    if (ref.current && !ref.current.contains(e.target)) {
      onOutsideChange(ref.current.value);
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

interface SettingSelectProps {
  value: string;
  options: {
    index: number;
    value: string;
  }[];
  reduxDispatch?: (payload: string) => void;
}

const SettingSelect = ({
  value,
  options,
  reduxDispatch
}: SettingSelectProps) => {
  const [editing, setEditing] = useState(false);

  const selectOptions = options.map(option => (
    <option key={option.index} value={option.value}>
      {option.value}
    </option>
  ));

  const wrapperRef = useRef(null);
  useOutsideClick(wrapperRef, setEditing, reduxDispatch);

  if (editing)
    return (
      <select
        ref={wrapperRef}
        value={value}
        onChange={e => reduxDispatch(e.target.value)}
      >
        {selectOptions}
      </select>
    );
  else
    return (
      <div
        className={styles["setting-select"]}
        onClick={e => {
          setEditing(true);
        }}
      >
        {value}
      </div>
    );
};

export { SettingSelect };
