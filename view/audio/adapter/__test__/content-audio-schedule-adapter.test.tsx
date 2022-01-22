import { mount } from "enzyme";
import * as React from "react";
import {
  calculateEventScheduling,
  ContentAudioScheduleAdapter
} from "../content-audio-schedule-adapter";
import { SchedulerInstance } from "../../scheduler";
import { useQuery } from "@apollo/client";

jest.mock("@apollo/client");
jest.mock("../../../util/react-hooks.ts");

const constructContent = (
  id: string,
  start: number,
  duration: number,
  offset: number
) => {
  return {
    __typename: "Content",
    id,
    type: "Audio",
    start,
    duration,
    offset,
    audio: {
      __typename: "Audio",
      id: "audio_id"
    }
  };
};

const constructClip = (
  id: string,
  start: number,
  duration: number,
  content: ReturnType<typeof constructContent>[]
) => {
  return {
    __typename: "Clip",
    id,
    start,
    duration,
    content
  };
};

const constructMocks = (clips: ReturnType<typeof constructClip>[]) => {
  return {
    loading: false,
    data: {
      __typename: "Query",
      vamp: {
        __typename: "Vamp",
        id: "vamp_1",
        clips
      }
    }
  };
};

describe("ContentAudioScheduleAdapter", () => {
  beforeEach(() => {
    SchedulerInstance.clearEvents();
    (useQuery as jest.Mock).mockClear;
  });

  describe("calculateContentScheduling", () => {
    const defaultInfo = {
      clipId: "",
      clipStart: 0,
      clipDuration: 4,
      contentId: "",
      contentStart: 0,
      contentDuration: 4,
      contentOffset: 0,
      audioId: ""
    };

    it("clips content from both sides", () => {
      const { start, duration, offset } = calculateEventScheduling({
        ...defaultInfo,
        clipStart: -2,
        clipDuration: 4,
        contentStart: -2,
        contentDuration: 8
      });

      expect(duration).toEqual(4);
      expect(start).toEqual(-2);
      expect(offset).toEqual(2);
    });

    it("sets offset to properly combine clipping and content offset value", () => {
      const { offset } = calculateEventScheduling({
        ...defaultInfo,
        clipStart: -2,
        clipDuration: 4,
        contentStart: -4,
        contentDuration: 8,
        contentOffset: 4
      });

      expect(offset).toEqual(8);
    });
  });

  describe("content added", () => {
    it("schedules clip with one content to scheduler when first added to state", () => {
      (useQuery as jest.Mock).mockReturnValueOnce(
        constructMocks([
          constructClip("clip_1", 0, 4, [
            constructContent("content_1", 0, 4, 0)
          ])
        ])
      );

      mount(
        <ContentAudioScheduleAdapter
          scheduler={SchedulerInstance}
        ></ContentAudioScheduleAdapter>
      );

      expect(SchedulerInstance.events["content_1"]).not.toBeUndefined();
      expect(SchedulerInstance.events["content_1"].start).toEqual(0);
      expect(SchedulerInstance.events["content_1"].duration).toEqual(4);
      expect(SchedulerInstance.events["content_1"].offset).toEqual(0);
    });

    it("schedules clip with multiple content (stacked) to scheduler when first added", () => {
      (useQuery as jest.Mock).mockReturnValueOnce(
        constructMocks([
          constructClip("clip_1", 0, 4, [
            constructContent("content_1", -0.5, 4.5, 0),
            constructContent("content_2", 0, 4, 4.5),
            constructContent("content_3", 0, 3, 9)
          ])
        ])
      );

      mount(
        <ContentAudioScheduleAdapter
          scheduler={SchedulerInstance}
        ></ContentAudioScheduleAdapter>
      );

      expect(SchedulerInstance.events["content_1"]).not.toBeUndefined();
      expect(SchedulerInstance.events["content_1"].start).toEqual(0);
      expect(SchedulerInstance.events["content_1"].duration).toEqual(4);
      expect(SchedulerInstance.events["content_1"].offset).toEqual(0.5);

      expect(SchedulerInstance.events["content_2"]).not.toBeUndefined();
      expect(SchedulerInstance.events["content_2"].start).toEqual(0);
      expect(SchedulerInstance.events["content_2"].duration).toEqual(4);
      expect(SchedulerInstance.events["content_2"].offset).toEqual(4.5);

      expect(SchedulerInstance.events["content_3"]).not.toBeUndefined();
      expect(SchedulerInstance.events["content_3"].start).toEqual(0);
      expect(SchedulerInstance.events["content_3"].duration).toEqual(3);
      expect(SchedulerInstance.events["content_3"].offset).toEqual(9);
    });

    it("schedules clip content for multiple query updates with new data", () => {
      (useQuery as jest.Mock).mockReturnValueOnce(
        constructMocks([
          constructClip("clip_1", 0, 4, [
            constructContent("content_1", -0.5, 4.5, 0)
          ])
        ])
      );
      (useQuery as jest.Mock).mockReturnValueOnce(
        constructMocks([
          constructClip("clip_1", 0, 4, [
            constructContent("content_1", -0.5, 4.5, 0)
          ]),
          constructClip("clip_2", 0, 4, [
            constructContent("content_2", 1, 2, 0.13)
          ])
        ])
      );

      const comp = mount(
        <ContentAudioScheduleAdapter
          scheduler={SchedulerInstance}
        ></ContentAudioScheduleAdapter>
      );

      expect(SchedulerInstance.events["content_1"]).not.toBeUndefined();
      expect(SchedulerInstance.events["content_1"].start).toEqual(0);

      expect(SchedulerInstance.events["content_2"]).toBeUndefined();

      comp.setProps({});

      expect(SchedulerInstance.events["content_2"]).not.toBeUndefined();
      expect(SchedulerInstance.events["content_2"].start).toEqual(1);
      expect(SchedulerInstance.events["content_2"].duration).toEqual(2);
      expect(SchedulerInstance.events["content_2"].offset).toEqual(0.13);
    });
  });

  describe("content changed", () => {
    it("updates scheduled event when content changes in a clip", () => {
      (useQuery as jest.Mock).mockReturnValueOnce(
        constructMocks([
          constructClip("clip_1", 0, 4, [
            constructContent("content_1", -0.5, 4.5, 0)
          ])
        ])
      );
      (useQuery as jest.Mock).mockReturnValueOnce(
        constructMocks([
          constructClip("clip_1", 0, 4, [
            constructContent("content_1", 1, 6, 2)
          ])
        ])
      );

      const comp = mount(
        <ContentAudioScheduleAdapter
          scheduler={SchedulerInstance}
        ></ContentAudioScheduleAdapter>
      );

      expect(SchedulerInstance.events["content_1"].start).toEqual(0);
      expect(SchedulerInstance.events["content_1"].duration).toEqual(4);
      expect(SchedulerInstance.events["content_1"].offset).toEqual(0.5);

      comp.setProps({});

      expect(SchedulerInstance.events["content_1"].start).toEqual(1);
      expect(SchedulerInstance.events["content_1"].duration).toEqual(3);
      expect(SchedulerInstance.events["content_1"].offset).toEqual(2);
    });

    it("updates multiple scheduled events when clip is shortened", () => {
      (useQuery as jest.Mock).mockReturnValueOnce(
        constructMocks([
          constructClip("clip_1", 0, 4, [
            constructContent("content_1", -0.5, 4.5, 0),
            constructContent("content_2", 0, 4, 4.5),
            constructContent("content_3", 0, 4, 9)
          ])
        ])
      );
      (useQuery as jest.Mock).mockReturnValueOnce(
        constructMocks([
          constructClip("clip_1", 1, 2, [
            constructContent("content_1", -0.5, 4.5, 0),
            constructContent("content_2", 0, 4, 4.5),
            constructContent("content_3", 0, 4, 9)
          ])
        ])
      );

      const comp = mount(
        <ContentAudioScheduleAdapter
          scheduler={SchedulerInstance}
        ></ContentAudioScheduleAdapter>
      );

      expect(SchedulerInstance.events["content_1"].start).toEqual(0);
      expect(SchedulerInstance.events["content_1"].duration).toEqual(4);
      expect(SchedulerInstance.events["content_1"].offset).toEqual(0.5);

      expect(SchedulerInstance.events["content_3"].start).toEqual(0);
      expect(SchedulerInstance.events["content_3"].duration).toEqual(4);
      expect(SchedulerInstance.events["content_3"].offset).toEqual(9);

      comp.setProps({});

      expect(SchedulerInstance.events["content_1"].start).toEqual(1);
      expect(SchedulerInstance.events["content_1"].duration).toEqual(2);
      expect(SchedulerInstance.events["content_1"].offset).toEqual(0.5);

      expect(SchedulerInstance.events["content_3"].start).toEqual(1);
      expect(SchedulerInstance.events["content_3"].duration).toEqual(2);
      expect(SchedulerInstance.events["content_3"].offset).toEqual(9);
    });

    it("doesn't update event when clip duration changes but it doesn't affect the event duration", () => {
      const updateEventSpy = jest.spyOn(SchedulerInstance, "updateEvent");

      (useQuery as jest.Mock).mockReturnValueOnce(
        constructMocks([
          constructClip("clip_1", 0, 4, [
            constructContent("content_1", 1, 2, 0)
          ])
        ])
      );
      (useQuery as jest.Mock).mockReturnValueOnce(
        constructMocks([
          constructClip("clip_1", 1, 2, [
            constructContent("content_1", 0, 2, 0)
          ])
        ])
      );

      const comp = mount(
        <ContentAudioScheduleAdapter
          scheduler={SchedulerInstance}
        ></ContentAudioScheduleAdapter>
      );

      comp.setProps({});

      expect(updateEventSpy).not.toHaveBeenCalled();
    });

    it("query update with no changes does nothing", () => {
      (useQuery as jest.Mock).mockReturnValueOnce(
        constructMocks([
          constructClip("clip_1", 0, 4, [
            constructContent("content_1", -0.5, 4.5, 0),
            constructContent("content_2", 0, 4, 4.5),
            constructContent("content_3", 0, 4, 9)
          ])
        ])
      );
      (useQuery as jest.Mock).mockReturnValueOnce(
        constructMocks([
          constructClip("clip_1", 0, 4, [
            constructContent("content_1", -0.5, 4.5, 0),
            constructContent("content_2", 0, 4, 4.5),
            constructContent("content_3", 0, 4, 9)
          ])
        ])
      );

      const comp = mount(
        <ContentAudioScheduleAdapter
          scheduler={SchedulerInstance}
        ></ContentAudioScheduleAdapter>
      );

      const events1 = JSON.parse(JSON.stringify(SchedulerInstance.events));

      comp.setProps({});

      const events2 = JSON.parse(JSON.stringify(SchedulerInstance.events));

      expect(events1).toEqual(events2);
    });
  });

  describe("content removed", () => {
    it("removes a scheduled event when clip is removed", () => {
      (useQuery as jest.Mock).mockReturnValueOnce(
        constructMocks([
          constructClip("clip_1", 0, 4, [
            constructContent("content_1", -0.5, 4.5, 0)
          ])
        ])
      );
      (useQuery as jest.Mock).mockReturnValueOnce(constructMocks([]));

      const comp = mount(
        <ContentAudioScheduleAdapter
          scheduler={SchedulerInstance}
        ></ContentAudioScheduleAdapter>
      );

      expect(SchedulerInstance.events["content_1"]).not.toBeUndefined();

      comp.setProps({});

      expect(SchedulerInstance.events["content_1"]).toBeUndefined();
    });

    it("removes a scheduled event when content is removed from clip", () => {
      (useQuery as jest.Mock).mockReturnValueOnce(
        constructMocks([
          constructClip("clip_1", 0, 4, [
            constructContent("content_1", -0.5, 4.5, 0),
            constructContent("content_2", -0.5, 4.5, 0)
          ])
        ])
      );
      (useQuery as jest.Mock).mockReturnValueOnce(
        constructMocks([
          constructClip("clip_1", 0, 4, [
            constructContent("content_2", -0.5, 4.5, 0)
          ])
        ])
      );

      const comp = mount(
        <ContentAudioScheduleAdapter
          scheduler={SchedulerInstance}
        ></ContentAudioScheduleAdapter>
      );

      expect(SchedulerInstance.events["content_1"]).not.toBeUndefined();
      expect(SchedulerInstance.events["content_2"]).not.toBeUndefined();

      comp.setProps({});

      expect(SchedulerInstance.events["content_1"]).toBeUndefined();
      expect(SchedulerInstance.events["content_2"]).not.toBeUndefined();
    });
  });

  describe("edge cases", () => {
    it("clip with content completely outside of clip bounds shouldn't add event for it, then moving the content into the clip bounds should add a new event", () => {
      (useQuery as jest.Mock).mockReturnValueOnce(
        constructMocks([
          constructClip("clip_1", 0, 4, [
            constructContent("content_1", -2.5, 2, 0)
          ])
        ])
      );
      (useQuery as jest.Mock).mockReturnValueOnce(
        constructMocks([
          constructClip("clip_1", 0, 4, [
            constructContent("content_1", -0.5, 2, 0)
          ])
        ])
      );

      const comp = mount(
        <ContentAudioScheduleAdapter
          scheduler={SchedulerInstance}
        ></ContentAudioScheduleAdapter>
      );

      expect(SchedulerInstance.events["content_1"]).toBeUndefined();

      comp.setProps({});

      expect(SchedulerInstance.events["content_1"]).not.toBeUndefined();
      expect(SchedulerInstance.events["content_1"].duration).toEqual(1.5);
    });
  });
});
