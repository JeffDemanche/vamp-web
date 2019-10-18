import * as React from "react";
import { useState, useEffect, useRef, MouseEvent } from "react";
import * as PropTypes from "prop-types";

const _ = require("underscore");

const styles = require("./setting-select.less");

const useOutsideClick = (ref: any, setEditing: (editing: boolean) => any) => {
  const handleClickOutside = (e: any) => {
    if (ref.current && !ref.current.contains(e.target)) {
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
  initValue: string;
  options: {
    index: number;
    value: string;
  }[];
}

const SettingSelect = ({ initValue, options }: SettingSelectProps) => {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(initValue);

  const selectOptions = options.map(option => (
    <option key={option.index} value={option.value}>
      {option.value}
    </option>
  ));

  const wrapperRef = useRef(null);
  useOutsideClick(wrapperRef, setEditing);

  if (editing)
    return (
      <select
        ref={wrapperRef}
        value={value}
        onChange={e => setValue(e.target.value)}
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
