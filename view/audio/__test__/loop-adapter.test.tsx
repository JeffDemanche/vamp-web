import { mount } from "enzyme";
import * as React from "react";
import { LoopAdapter } from "../adapter/loop-adapter";
import { SchedulerInstance } from "../scheduler";
import { useLoopPoints } from "../../component/workspace/hooks/use-loop-points";
import { CabMode } from "../../state/apollotypes";

jest.mock("../../util/react-hooks");
jest.mock("../../component/workspace/hooks/use-loop-points");
jest.mock("@apollo/client", () => ({
  ...(jest.requireActual("@apollo/client") as object),
  useQuery: jest.fn()
}));

describe("Clip Player (Scheduler adapter)", () => {
  beforeEach(() => {
    SchedulerInstance.clearEvents();
    SchedulerInstance.giveContext(null);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("sets loop point on first render", () => {
    const setLoopPointsSpy = jest.spyOn(SchedulerInstance, "setLoopPoints");
    (useLoopPoints as jest.Mock).mockImplementationOnce(() => ({
      loopPoints: [0, 3],
      mode: CabMode.STACK
    }));

    mount(<LoopAdapter scheduler={SchedulerInstance}></LoopAdapter>);

    expect(setLoopPointsSpy).toHaveBeenCalledWith([0, 3]);
  });

  it("sets infinite loop", () => {
    const setLoopPointSpy = jest.spyOn(SchedulerInstance, "setLoopPoints");

    (useLoopPoints as jest.Mock)
      .mockImplementationOnce(() => ({
        loopPoints: [0, 2],
        mode: CabMode.STACK
      }))
      .mockImplementationOnce(() => ({
        loopPoints: [0, undefined],
        mode: CabMode.INFINITE
      }));

    const c = mount(<LoopAdapter scheduler={SchedulerInstance}></LoopAdapter>);

    c.setProps({});

    expect(setLoopPointSpy).toHaveBeenNthCalledWith<number[][]>(1, [0, 2]);
    expect(setLoopPointSpy).toHaveBeenNthCalledWith<number[][]>(2, [
      0,
      undefined
    ]);
  });

  it("sets loop mode in scheduler", () => {
    const setLoopModeSpy = jest.spyOn(SchedulerInstance, "setLoopMode");

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

    const c = mount(<LoopAdapter scheduler={SchedulerInstance}></LoopAdapter>);

    c.setProps({});
    c.setProps({});

    expect(setLoopModeSpy).toHaveBeenNthCalledWith<CabMode[]>(
      1,
      CabMode.INFINITE
    );
    expect(setLoopModeSpy).toHaveBeenNthCalledWith<CabMode[]>(2, CabMode.STACK);
    expect(setLoopModeSpy).toHaveBeenNthCalledWith<CabMode[]>(
      3,
      CabMode.TELESCOPE
    );
  });

  it("throws error if A comes after B", () => {
    jest.spyOn(console, "error");
    (console.error as jest.Mock).mockImplementation(() => {});

    (useLoopPoints as jest.Mock).mockImplementationOnce(() => ({
      loopPoints: [1, -1],
      mode: CabMode.STACK
    }));

    expect(() => {
      mount(<LoopAdapter scheduler={SchedulerInstance}></LoopAdapter>);
    }).toThrow("Loop point A must come before loop point B");
  });
});
