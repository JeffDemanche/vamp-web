import * as React from "react";
import { useState, createContext } from "react";

interface GuidelineContextData {
  start: number;
  end: number;
  isShowing: boolean;
  setIsShowing: (showing: boolean) => void;
  setStart: (start: number) => void;
  setEnd: (end: number) => void;
}

export const GuidelineContext = createContext(null);

interface GuidelineProviderProps {
  children: React.ReactChild | React.ReactChildren;
}

export const GuidelineProvider: React.FC<GuidelineProviderProps> = ({
  children
}: GuidelineProviderProps) => {
  const [isShowing, setIsShowing] = useState(false);

  const [start, setStart] = useState(0);
  const [end, setEnd] = useState(0);

  const guidelineContext: GuidelineContextData = {
    start,
    end,
    isShowing,
    setIsShowing,
    setStart,
    setEnd
  };

  return (
    <GuidelineContext.Provider value={guidelineContext}>
      {children}
    </GuidelineContext.Provider>
  );
};
