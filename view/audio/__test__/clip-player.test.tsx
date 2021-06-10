/* eslint-disable max-len */
import * as React from "react";

import { mount } from "enzyme";
import { ClipPlayer } from "../clip-player";
import { audioStore } from "../audio-store";
import { SchedulerInstance } from "../scheduler";

jest.mock("../../util/client-clip-state-hooks");
jest.mock("../../util/react-hooks");
jest.mock("@apollo/client", () => ({
  ...jest.requireActual("@apollo/client"),
  useQuery: jest.fn(() => ({ data: { vamp: { countOff: { duration: 2 } } } }))
}));

const clipMocks = [
  {
    id: "clip1id",
    start: 0,
    duration: 2,
    content: [
      {
        id: "content1id",
        type: "audio",
        start: 0,
        duration: 2,
        audio: {
          id: "audio1id",
          latencyCompensation: 0.16,
          storedLocally: true
        }
      }
    ]
  }
];

const clientClipMocks = [
  {
    start: 0,
    audioStoreKey: "cc1key",
    realClipId: "cc1realclip",
    inProgress: true,
    latencyCompensation: 0.16
  }
];

describe("Clip Player (Scheduler adapter)", () => {
  beforeEach(() => {
    SchedulerInstance.clearEvents();
  });

  describe("Real clips", () => {
    it("adds clip content to scheduler when clip is initially added", () => {
      const clipPlayer = mount(
        <ClipPlayer
          clips={[]}
          clientClips={[]}
          audioStore={audioStore}
          scheduler={SchedulerInstance}
        ></ClipPlayer>
      );

      clipPlayer.setProps({ clips: clipMocks });

      expect(Object.keys(SchedulerInstance.events).length).toEqual(1);
      expect(SchedulerInstance.events["content1id"]).toBeDefined();
    });

    it("adds clip content to scheduler when a second clip is added", () => {
      const clipPlayer = mount(
        <ClipPlayer
          clips={clipMocks}
          clientClips={[]}
          audioStore={audioStore}
          scheduler={SchedulerInstance}
        ></ClipPlayer>
      );

      expect(Object.keys(SchedulerInstance.events).length).toEqual(1);

      const newClipMocks = JSON.parse(JSON.stringify(clipMocks));
      newClipMocks.push({
        id: "clip2id",
        start: 0,
        duration: 2,
        content: [
          {
            id: "content2id",
            type: "audio",
            start: 0.5,
            duration: 2.5,
            audio: {
              id: "audio2id",
              latencyCompensation: 0.16,
              storedLocally: true
            }
          }
        ]
      });

      clipPlayer.setProps({ clips: newClipMocks });

      expect(Object.keys(SchedulerInstance.events).length).toEqual(2);
      expect(SchedulerInstance.events["content1id"].start).toBeCloseTo(0);
      expect(SchedulerInstance.events["content2id"].start).toBeCloseTo(0.34);
    });

    it("adds clip content to scheduler when new content is added", () => {
      const clipPlayer = mount(
        <ClipPlayer
          clips={clipMocks}
          clientClips={[]}
          audioStore={audioStore}
          scheduler={SchedulerInstance}
        ></ClipPlayer>
      );

      expect(Object.keys(SchedulerInstance.events).length).toEqual(1);
      expect(SchedulerInstance.events["content1id"]).toBeDefined();

      const newClipMocks = JSON.parse(JSON.stringify(clipMocks));
      newClipMocks[0].content.push({
        id: "content2id",
        type: "audio",
        start: 1.5,
        duration: 6,
        audio: {
          id: "audio2id",
          latencyCompensation: 0.16,
          storedLocally: true
        }
      });

      clipPlayer.setProps({ clips: newClipMocks });

      expect(Object.keys(SchedulerInstance.events).length).toEqual(2);
      expect(SchedulerInstance.events["content2id"]).toBeDefined();
      expect(SchedulerInstance.events["content2id"].start).toBeCloseTo(1.34);
      expect(SchedulerInstance.events["content1id"]).toBeDefined();
      expect(SchedulerInstance.events["content1id"].start).toBeCloseTo(0);
    });

    it("when added, end of clip content is cut off if clip ends first", () => {
      mount(
        <ClipPlayer
          clips={[
            {
              id: "clip1id",
              start: 0,
              duration: 1,
              content: [
                {
                  id: "content1id",
                  type: "audio",
                  start: 0,
                  duration: 2,
                  audio: {
                    id: "audio1id",
                    latencyCompensation: 0.16,
                    storedLocally: true
                  }
                }
              ]
            }
          ]}
          clientClips={[]}
          audioStore={audioStore}
          scheduler={SchedulerInstance}
        ></ClipPlayer>
      );

      expect(SchedulerInstance.events["content1id"].duration).toBeDefined();
      expect(SchedulerInstance.events["content1id"].duration).toEqual(1);
    });

    it("when added, start of clip content is cut off if content start is negative", () => {
      mount(
        <ClipPlayer
          clips={[
            {
              id: "clip1id",
              start: 0,
              duration: 1,
              content: [
                {
                  id: "content1id",
                  type: "audio",
                  start: -2.16,
                  duration: 5,
                  audio: {
                    id: "audio1id",
                    latencyCompensation: 0.16,
                    storedLocally: true
                  }
                }
              ]
            }
          ]}
          clientClips={[]}
          audioStore={audioStore}
          scheduler={SchedulerInstance}
        ></ClipPlayer>
      );

      expect(SchedulerInstance.events["content1id"].duration).toBeDefined();
      expect(SchedulerInstance.events["content1id"].duration).toBeCloseTo(1);
      expect(SchedulerInstance.events["content1id"].start).toEqual(0);
    });

    it("removes all clip content from scheduler when the clip is removed", () => {
      const clipPlayer = mount(
        <ClipPlayer
          clips={clipMocks}
          clientClips={[]}
          audioStore={audioStore}
          scheduler={SchedulerInstance}
        ></ClipPlayer>
      );

      const newClipMocks = JSON.parse(JSON.stringify(clipMocks));
      newClipMocks.push({
        id: "clip2id",
        start: 0,
        duration: 2,
        content: [
          {
            id: "content2id",
            type: "audio",
            start: 0.5,
            duration: 2.5,
            audio: {
              id: "audio2id",
              latencyCompensation: 0.16,
              storedLocally: true
            }
          }
        ]
      });

      clipPlayer.setProps({ clips: newClipMocks });

      expect(Object.keys(SchedulerInstance.events).length).toEqual(2);

      clipPlayer.setProps({ clips: [] });

      expect(Object.keys(SchedulerInstance.events).length).toEqual(0);
    });

    it("removes clip content from scheduler when content is removed", () => {
      const clipPlayer = mount(
        <ClipPlayer
          clips={clipMocks}
          clientClips={[]}
          audioStore={audioStore}
          scheduler={SchedulerInstance}
        ></ClipPlayer>
      );

      expect(Object.keys(SchedulerInstance.events).length).toEqual(1);

      const newClipMocks = JSON.parse(JSON.stringify(clipMocks));
      newClipMocks[0].content = [];

      clipPlayer.setProps({ clips: newClipMocks });

      expect(Object.keys(SchedulerInstance.events).length).toEqual(0);
    });

    it("updates scheduler events for all content when clip start is changed", () => {
      const clipPlayer = mount(
        <ClipPlayer
          clips={clipMocks}
          clientClips={[]}
          audioStore={audioStore}
          scheduler={SchedulerInstance}
        ></ClipPlayer>
      );

      const newClipMocks = JSON.parse(JSON.stringify(clipMocks));
      newClipMocks[0].content.push({
        id: "content2id",
        type: "audio",
        start: 1.5,
        duration: 6,
        audio: {
          id: "audio2id",
          latencyCompensation: 0.16,
          storedLocally: true
        }
      });

      clipPlayer.setProps({ clips: newClipMocks });

      expect(SchedulerInstance.events["content1id"].start).toBeCloseTo(0);
      expect(SchedulerInstance.events["content1id"].duration).toBeCloseTo(2);
      expect(SchedulerInstance.events["content2id"].start).toBeCloseTo(1.34);
      expect(SchedulerInstance.events["content2id"].duration).toBeCloseTo(0.66);

      const newClipMocks2 = JSON.parse(JSON.stringify(newClipMocks));
      newClipMocks2[0].start = 1;

      clipPlayer.setProps({ clips: newClipMocks2 });

      expect(SchedulerInstance.events["content1id"].start).toBeCloseTo(0.84);
      expect(SchedulerInstance.events["content2id"].start).toBeCloseTo(2.34);
    });

    it("updates scheduler events for all content when clip duration is changed", () => {
      const clipPlayer = mount(
        <ClipPlayer
          clips={clipMocks}
          clientClips={[]}
          audioStore={audioStore}
          scheduler={SchedulerInstance}
        ></ClipPlayer>
      );

      const newClipMocks = JSON.parse(JSON.stringify(clipMocks));

      newClipMocks[0].duration = 1;

      clipPlayer.setProps({ clips: newClipMocks });

      expect(SchedulerInstance.events["content1id"].duration).toEqual(1);
    });

    it("updates scheduler event duration for content if content start changed", () => {
      const clipPlayer = mount(
        <ClipPlayer
          clips={clipMocks}
          clientClips={[]}
          audioStore={audioStore}
          scheduler={SchedulerInstance}
        ></ClipPlayer>
      );

      const newClipMocks = JSON.parse(JSON.stringify(clipMocks));
      newClipMocks[0].content[0].start = -1;
      clipPlayer.setProps({ clips: newClipMocks });
      expect(SchedulerInstance.events["content1id"].start).toBeCloseTo(0);
    });

    it("updates scheduler event duration for content if content duration changed", () => {
      const clipPlayer = mount(
        <ClipPlayer
          clips={clipMocks}
          clientClips={[]}
          audioStore={audioStore}
          scheduler={SchedulerInstance}
        ></ClipPlayer>
      );

      const newClipMocks = JSON.parse(JSON.stringify(clipMocks));
      newClipMocks[0].content[0].duration = 1;
      clipPlayer.setProps({ clips: newClipMocks });
      expect(SchedulerInstance.events["content1id"].duration).toEqual(1);

      const newClipMocks2 = JSON.parse(JSON.stringify(newClipMocks));
      newClipMocks2[0].content[0].duration = 3;
      clipPlayer.setProps({ clips: newClipMocks2 });
      expect(SchedulerInstance.events["content1id"].duration).toEqual(2);
    });
  });

  describe("Client clips", () => {
    it("adds scheduler event when client clip inProgress is switched to false", () => {
      const clipPlayer = mount(
        <ClipPlayer
          clips={[]}
          clientClips={clientClipMocks}
          audioStore={audioStore}
          scheduler={SchedulerInstance}
        ></ClipPlayer>
      );

      expect(Object.keys(SchedulerInstance.events).length).toEqual(0);

      const newClientClipMocks = JSON.parse(JSON.stringify(clientClipMocks));
      newClientClipMocks[0].inProgress = false;
      clipPlayer.setProps({ clientClips: newClientClipMocks });

      expect(Object.keys(SchedulerInstance.events).length).toEqual(1);
      expect(SchedulerInstance.events["cc1key"]).toBeDefined();
      expect(SchedulerInstance.events["cc1key"].start).toBeCloseTo(0);
    });

    it("removes scheduler event when client clip is removed", () => {
      const clipPlayer = mount(
        <ClipPlayer
          clips={[]}
          clientClips={clientClipMocks}
          audioStore={audioStore}
          scheduler={SchedulerInstance}
        ></ClipPlayer>
      );

      const newClientClipMocks = JSON.parse(JSON.stringify(clientClipMocks));
      newClientClipMocks[0].inProgress = false;
      clipPlayer.setProps({ clientClips: newClientClipMocks });

      expect(Object.keys(SchedulerInstance.events).length).toEqual(1);

      clipPlayer.setProps({ clientClips: [] });

      expect(Object.keys(SchedulerInstance.events).length).toEqual(0);
    });
  });
});
