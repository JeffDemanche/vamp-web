import * as React from "react";
import { SchedulerInstance } from "../scheduler";
import { useMutation, useQuery } from "@apollo/client";
import { RecordAdapter } from "../adapter/record-adapter";
import {
  useBeginClientClip,
  useEndClientClip
} from "../../util/client-clip-state-hooks";
import { mount } from "enzyme";

jest.mock("../../util/react-hooks");
jest.mock("../../util/vamp-state-hooks");
jest.mock("../recorder");
jest.mock("../../util/client-clip-state-hooks");
jest.mock("@apollo/client", () => ({
  ...jest.requireActual("@apollo/client"),
  useQuery: jest.fn(),
  useMutation: jest.fn(() => [(): void => {}])
}));

describe("Record Adapter", () => {
  beforeEach(() => {
    SchedulerInstance.clearEvents();
    SchedulerInstance.giveContext(null);
    (useMutation as jest.Mock).mockClear();
    (useQuery as jest.Mock).mockClear();
  });

  it("primes scheduler recorder when recording begins", () => {
    const primeRecorderSpy = jest.spyOn(SchedulerInstance, "primeRecorder");
    (useQuery as jest.Mock)
      .mockImplementationOnce(() => ({
        data: {
          vamp: {
            recording: false,
            playPosition: 0,
            countOff: {
              duration: 2
            }
          },
          userInVamp: {
            cab: { start: 0, duration: 4, loops: true },
            prefs: { latencyCompensation: 0 }
          }
        }
      }))
      .mockImplementation(() => ({
        data: {
          vamp: {
            recording: true,
            playPosition: 0,
            countOff: {
              duration: 2
            }
          },
          userInVamp: {
            cab: { start: 0, duration: 4, loops: true },
            prefs: { latencyCompensation: 0 }
          }
        }
      }));

    const component = mount(
      <RecordAdapter
        scheduler={SchedulerInstance}
        context={null}
      ></RecordAdapter>
    );

    component.setProps({});

    expect(primeRecorderSpy).toBeCalledWith(0, expect.anything());
  });

  it("begins client clip when recording begins", () => {
    const useBeginClientClipFn = jest.fn();
    (useBeginClientClip as jest.Mock).mockImplementation(
      () => useBeginClientClipFn
    );

    (useQuery as jest.Mock)
      .mockImplementationOnce(() => ({
        data: {
          vamp: {
            recording: false,
            playPosition: 0,
            countOff: {
              duration: 2
            }
          },
          userInVamp: {
            cab: { start: 0, duration: 4, loops: true },
            prefs: { latencyCompensation: 0 }
          }
        }
      }))
      .mockImplementation(() => ({
        data: {
          vamp: {
            recording: true,
            playPosition: 0,
            countOff: {
              duration: 2
            }
          },
          userInVamp: {
            cab: { start: 0, duration: 4, loops: true },
            prefs: { latencyCompensation: 0 }
          }
        }
      }));

    const component = mount(
      <RecordAdapter
        scheduler={SchedulerInstance}
        context={null}
      ></RecordAdapter>
    );

    component.setProps({});

    expect(useBeginClientClipFn).toBeCalledWith(0, expect.anything(), 0);
  });

  it("ends client clip when recording begins", () => {
    const useEndClientClipFn = jest.fn();
    (useEndClientClip as jest.Mock).mockImplementation(
      () => useEndClientClipFn
    );

    (useQuery as jest.Mock)
      .mockImplementationOnce(() => ({
        data: {
          vamp: {
            recording: false,
            playPosition: 0,
            countOff: {
              duration: 2
            }
          },
          userInVamp: {
            cab: { start: 0, duration: 4, loops: true },
            prefs: { latencyCompensation: 0 }
          }
        }
      }))
      .mockImplementationOnce(() => ({
        data: {
          vamp: {
            recording: true,
            playPosition: 0,
            countOff: {
              duration: 2
            }
          },
          userInVamp: {
            cab: { start: 0, duration: 4, loops: true },
            prefs: { latencyCompensation: 0 }
          }
        }
      }))
      .mockImplementation(() => ({
        data: {
          vamp: {
            recording: false,
            playPosition: 0,
            countOff: {
              duration: 2
            }
          },
          userInVamp: {
            cab: { start: 0, duration: 4, loops: true },
            prefs: { latencyCompensation: 0 }
          }
        }
      }));

    const component = mount(
      <RecordAdapter
        scheduler={SchedulerInstance}
        context={null}
      ></RecordAdapter>
    );

    component.setProps({});

    expect(useEndClientClipFn).toBeCalledWith(expect.anything());
  });
});
