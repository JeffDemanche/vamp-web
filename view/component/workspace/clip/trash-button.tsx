import * as React from "react";
import { VampButton } from "../../element/button";
import { REMOVE_CLIP_SERVER } from "../../../state/queries/clips-mutations";
import { useMutation } from "@apollo/client";
import { RemoveClipServer } from "../../../state/apollotypes";
import { useCurrentVampId } from "../../../util/react-hooks";

interface TrashButtonProps {
  clipId: string;
}

const TrashButton: React.FC<TrashButtonProps> = ({
  clipId
}: TrashButtonProps) => {
  const vampId = useCurrentVampId();

  const style: React.CSSProperties = {
    position: "absolute",
    padding: "0px",
    height: "30px",
    width: "30px",
    right: "15px",
    bottom: "15px"
  };

  const [removeClip] = useMutation<RemoveClipServer>(REMOVE_CLIP_SERVER);

  return (
    <VampButton
      style={style}
      variant="secondary"
      onClick={(): void => {
        removeClip({ variables: { clipId, vampId } });
      }}
    >
      <i className="ri-delete-bin-2-line"></i>
    </VampButton>
  );
};

export default TrashButton;
