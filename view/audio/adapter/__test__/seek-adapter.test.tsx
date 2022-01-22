import { mount } from "enzyme";
import * as React from "react";
import { SchedulerInstance } from "../../scheduler";
import { useLoopPoints } from "../../../component/workspace/hooks/use-loop-points";
import { CabMode } from "../../../state/apollotypes";
import { SeekAdapter } from "../seek-adapter";
import { useQuery } from "@apollo/client";

jest.mock("../../../util/react-hooks");
jest.mock("../../../component/workspace/hooks/use-loop-points");
jest.mock("@apollo/client", () => ({
  ...(jest.requireActual("@apollo/client") as object),
  useQuery: jest.fn()
}));

describe("SeekAdapter", () => {
  beforeEach(() => {
    SchedulerInstance.clearEvents();
    SchedulerInstance.giveContext(null);
    (useQuery as jest.Mock).mockClear();
    (useQuery as jest.Mock).mockImplementation(() => {
      return {
        data: {
          userInVamp: { cab: { start: 0 } }
        }
      };
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("sets loop point on first render", () => {
    const seekSpy = jest.spyOn(SchedulerInstance, "seek");
    (useLoopPoints as jest.Mock).mockImplementationOnce(() => ({
      loopPoints: [0, 3],
      mode: CabMode.STACK
    }));

    mount(<SeekAdapter scheduler={SchedulerInstance}></SeekAdapter>);

    expect(seekSpy).toHaveBeenCalledWith(0, 3);
  });

  it("sets infinite loop", () => {
    const seekSpy = jest.spyOn(SchedulerInstance, "seek");

    (useLoopPoints as jest.Mock)
      .mockImplementationOnce(() => ({
        loopPoints: [0, 2],
        mode: CabMode.STACK
      }))
      .mockImplementationOnce(() => ({
        loopPoints: [0, undefined],
        mode: CabMode.INFINITE
      }));

    const c = mount(<SeekAdapter scheduler={SchedulerInstance}></SeekAdapter>);

    c.setProps({});

    expect(seekSpy).toHaveBeenNthCalledWith<number[]>(1, 0, 2);
    expect(seekSpy).toHaveBeenNthCalledWith<number[]>(2, 0, undefined);
  });

  it("sets loop mode in scheduler", () => {
    const seekSpy = jest.spyOn(SchedulerInstance, "seek");

    (useLoopPoints as jest.Mock)
      .mockImplementationOnce(() => ({
        loopPoints: [0, undefined],
        mode: CabMode.INFINITE
      }))
      .mockImplementationOnce(() => ({
        loopPoints: [0, 1],
        mode: CabMode.STACK
      }))
      .mockImplementationOnce(() => ({
        loopPoints: [0, 1],
        mode: CabMode.TELESCOPE
      }));

    const c = mount(<SeekAdapter scheduler={SchedulerInstance}></SeekAdapter>);

    c.setProps({});
    c.setProps({});

    expect(seekSpy).toHaveBeenCalledTimes(2);
    expect(seekSpy).toHaveBeenNthCalledWith<number[]>(1, 0, undefined);
    expect(seekSpy).toHaveBeenNthCalledWith<number[]>(2, 0, 1);
  });
});
