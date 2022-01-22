import { mount } from "enzyme";
import * as React from "react";
import { useContext } from "react";
import { SchedulerInstance } from "../../scheduler";
import { CabMode } from "../../../state/apollotypes";
import { SeekAdapter } from "../seek-adapter";
import { useQuery } from "@apollo/client";

jest.mock("../../../util/react-hooks");
jest.mock("react", () => ({
  ...(jest.requireActual("react") as object),
  useContext: jest.fn()
}));
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
    (useContext as jest.Mock).mockImplementationOnce(() => ({
      seek: jest.fn(),
      loopPointA: 0,
      loopPointB: 3,
      mode: CabMode.STACK
    }));

    mount(<SeekAdapter scheduler={SchedulerInstance}></SeekAdapter>);

    expect(seekSpy).toHaveBeenCalledWith(0, 3);
  });

  it("sets infinite loop", () => {
    const seekSpy = jest.spyOn(SchedulerInstance, "seek");

    (useContext as jest.Mock)
      .mockImplementationOnce(() => ({
        seek: jest.fn(),
        loopPointA: 0,
        loopPointB: 2,
        mode: CabMode.STACK
      }))
      .mockImplementationOnce(() => ({
        seek: jest.fn(),
        loopPointA: 0,
        loopPointB: undefined,
        mode: CabMode.INFINITE
      }));

    const c = mount(<SeekAdapter scheduler={SchedulerInstance}></SeekAdapter>);

    c.setProps({});

    expect(seekSpy).toHaveBeenNthCalledWith<number[]>(1, 0, 2);
    expect(seekSpy).toHaveBeenNthCalledWith<number[]>(2, 0, undefined);
  });

  it("sets loop mode in scheduler", () => {
    const seekSpy = jest.spyOn(SchedulerInstance, "seek");

    (useContext as jest.Mock)
      .mockImplementationOnce(() => ({
        seek: jest.fn(),
        loopPointA: 0,
        loopPointB: undefined,
        mode: CabMode.INFINITE
      }))
      .mockImplementationOnce(() => ({
        seek: jest.fn(),
        loopPointA: 0,
        loopPointB: 1,
        mode: CabMode.STACK
      }))
      .mockImplementationOnce(() => ({
        seek: jest.fn(),
        loopPointA: 0,
        loopPointB: 1,
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
