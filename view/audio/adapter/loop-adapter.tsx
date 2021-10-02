import * as React from "react";
import { useLoopPoints } from "../../component/workspace/hooks/use-loop-points";
import { useStateChangeListener } from "../../util/use-state-change-listener";
import { SchedulerInstance } from "../scheduler";

interface LoopAdapterProps {
  scheduler: typeof SchedulerInstance;
}

/**
 * Listens to changes to the "loop points" or where the scheduler should seek
 * from and to.
 */
export const LoopAdapter: React.FC<LoopAdapterProps> = ({
  scheduler
}: LoopAdapterProps) => {
  const { loopPoints, mode } = useLoopPoints();

  useStateChangeListener(loopPoints, (before, after) => {
    scheduler.setLoopPoints(after);
  });
  useStateChangeListener(mode, (before, after) => {
    scheduler.setLoopMode(after);
  });

  return null;
};
