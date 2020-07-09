import * as React from "react";

interface VerticalSpacerProps {
  height: number;
}

/**
 * A simple component that will separate two components aligned vertically.
 */
const VerticalSpacer: React.FC<VerticalSpacerProps> = ({
  height
}: VerticalSpacerProps) => {
  return <div style={{ height }}></div>;
};

export default VerticalSpacer;
