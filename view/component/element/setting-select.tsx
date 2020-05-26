import * as React from "react";
import { useState, useEffect, useRef } from "react";

import styles = require("./setting-select.less");

const useOutsideClick = (
  ref: React.MutableRefObject<any>,
  setEditing: (editing: boolean) => void,
  onOutsideChange: (payload: string) => void
): void => {
  const handleClickOutside = (e: KeyboardEvent): void => {
    if (ref.current && !ref.current.contains(e.target)) {
      onOutsideChange(ref.current.value);
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

interface SettingSelectProps {
  value: string;
  options: {
    index: number;
    value: string;
  }[];
  onChange?: (payload: string) => void;
}

const SettingSelect: React.FunctionComponent<SettingSelectProps> = ({
  value,
  options,
  onChange
}) => {
  const [editing, setEditing] = useState(false);

  const selectOptions = options.map(option => (
    <option key={option.index} value={option.value}>
      {option.value}
    </option>
  ));

  const wrapperRef = useRef(null);
  useOutsideClick(wrapperRef, setEditing, onChange);

  if (editing)
    return (
      <select
        ref={wrapperRef}
        value={value}
        onChange={(e): void => onChange(e.target.value)}
      >
        {selectOptions}
      </select>
    );
  else
    return (
      <div
        className={styles["setting-select"]}
        onClick={(): void => {
          setEditing(true);
        }}
      >
        {value}
      </div>
    );
};

export { SettingSelect };
