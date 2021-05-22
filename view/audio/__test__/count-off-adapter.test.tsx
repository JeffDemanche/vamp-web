import * as React from "react";
import { useContext } from "react";
import { CountOffAdapter } from "../adapter/count-off-adapter";
import { mount } from "enzyme";
import { useQuery } from "@apollo/client";
import { SchedulerInstance } from "../scheduler";
import { useUpdateCountOff } from "../../util/count-off-hooks";

jest.mock("../../util/react-hooks");
jest.mock("../../util/count-off-hooks");
jest.mock("@apollo/client", () => ({
  ...jest.requireActual("@apollo/client"),
  useQuery: jest.fn()
}));
jest.mock("react", () => ({
  ...jest.requireActual("react"),
  useContext: jest.fn()
}));
jest.mock("../scheduler");

const useMeasuresReturnFour = {
  measureMap: {
    "-1": {
      num: -1,
      timeStart: -2,
      section: { bpm: 120, beatsPerBar: 4, metronomeSound: "Beep" }
    },
    "0": {
      num: 0,
      timeStart: 0,
      section: { bpm: 120, beatsPerBar: 4, metronomeSound: "Beep" }
    }
  }
};

const useMeasuresReturnThree = {
  measureMap: {
    "2": {
      num: 2,
      timeStart: 1.5,
      section: { bpm: 120, beatsPerBar: 3, metronomeSound: "Beep" }
    }
  }
};

describe("Count Off Adapter", () => {
  beforeEach(() => {
    SchedulerInstance.clearEvents();
    SchedulerInstance.giveContext(null);
  });

  it("calls scheduler countOff method when countOff becomes true in state", () => {
    const countOffSpy = jest.spyOn(SchedulerInstance, "countOff");
    (useQuery as jest.Mock)
      .mockImplementationOnce(() => ({
        data: {
          vamp: {
            playPosition: 0,
            countingOff: false,
            countingOffStartTime: -1
          }
        }
      }))
      .mockImplementationOnce(() => ({
        data: {
          vamp: {
            playPosition: 0,
            countingOff: true,
            countingOffStartTime: 1234
          }
        }
      }));
    (useContext as jest.Mock).mockImplementation(() => ({
      getMeasureMap: (): unknown => useMeasuresReturnFour.measureMap
    }));

    const component = mount(
      <CountOffAdapter scheduler={SchedulerInstance}></CountOffAdapter>
    );

    // Hacky way to make sure the second useQuery mock is used.
    component.setProps({});

    expect(countOffSpy).toBeCalled();
  });

  describe("CountOff Generation", () => {
    it("generates correct countOff on first render", () => {
      const updateCountOffFn = jest.fn();
      (useUpdateCountOff as jest.Mock).mockImplementationOnce(
        () => updateCountOffFn
      );
      (useQuery as jest.Mock).mockImplementationOnce(() => ({
        data: {
          vamp: {
            playPosition: 0,
            countingOff: false,
            countingOffStartTime: -1
          }
        }
      }));
      (useContext as jest.Mock).mockImplementation(() => ({
        getMeasureMap: (): unknown => useMeasuresReturnFour.measureMap
      }));

      mount(<CountOffAdapter scheduler={SchedulerInstance}></CountOffAdapter>);

      expect(updateCountOffFn).toHaveBeenCalledWith({
        duration: 2,
        measures: [
          { repetitions: 1, bpm: 120, beats: 4, metronomeSound: "Beep" }
        ]
      });
    });

    it("generates correct countOff when playPosition is into measure", () => {
      const updateCountOffFn = jest.fn();
      (useUpdateCountOff as jest.Mock).mockImplementationOnce(
        () => updateCountOffFn
      );
      (useQuery as jest.Mock).mockImplementationOnce(() => ({
        data: {
          vamp: {
            playPosition: 0.73,
            countingOff: false,
            countingOffStartTime: -1
          }
        }
      }));
      (useContext as jest.Mock).mockImplementation(() => ({
        getMeasureMap: (): unknown => useMeasuresReturnFour.measureMap
      }));

      mount(<CountOffAdapter scheduler={SchedulerInstance}></CountOffAdapter>);

      expect(updateCountOffFn).toHaveBeenCalledWith({
        duration: 2.73,
        measures: [
          { repetitions: 1, bpm: 120, beats: 4, metronomeSound: "Beep" },
          { repetitions: 1, bpm: 120, beats: 2, metronomeSound: "Beep" }
        ]
      });
    });

    it("generates correct countOff when playPosition is negative", () => {
      const updateCountOffFn = jest.fn();
      (useUpdateCountOff as jest.Mock).mockImplementationOnce(
        () => updateCountOffFn
      );
      (useQuery as jest.Mock).mockImplementationOnce(() => ({
        data: {
          vamp: {
            playPosition: -0.5,
            countingOff: false,
            countingOffStartTime: -1
          }
        }
      }));
      (useContext as jest.Mock).mockImplementation(() => ({
        getMeasureMap: (): unknown => useMeasuresReturnFour.measureMap
      }));

      mount(<CountOffAdapter scheduler={SchedulerInstance}></CountOffAdapter>);

      expect(updateCountOffFn).toHaveBeenCalledWith({
        duration: 3.5,
        measures: [
          { repetitions: 1, bpm: 120, beats: 4, metronomeSound: "Beep" },
          { repetitions: 1, bpm: 120, beats: 3, metronomeSound: "Beep" }
        ]
      });
    });

    it("generates correct countOff in three", () => {
      const updateCountOffFn = jest.fn();
      (useUpdateCountOff as jest.Mock).mockImplementationOnce(
        () => updateCountOffFn
      );
      (useQuery as jest.Mock).mockImplementationOnce(() => ({
        data: {
          vamp: {
            playPosition: 2,
            countingOff: false,
            countingOffStartTime: -1
          }
        }
      }));
      (useContext as jest.Mock).mockImplementation(() => ({
        getMeasureMap: (): unknown => useMeasuresReturnThree.measureMap
      }));

      mount(<CountOffAdapter scheduler={SchedulerInstance}></CountOffAdapter>);

      expect(updateCountOffFn).toHaveBeenCalledWith({
        duration: 2,
        measures: [
          { repetitions: 1, bpm: 120, beats: 3, metronomeSound: "Beep" },
          { repetitions: 1, bpm: 120, beats: 1, metronomeSound: "Beep" }
        ]
      });
    });
  });
});
