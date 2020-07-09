import { mount } from "enzyme";
// eslint-disable-next-line max-len
import { PlayStopButton } from "../view/component/workspace/play-panel/play-stop-button";
import * as React from "react";
import { ApolloMockedProvider } from "./test-utils/providers";
import {
  PLAY_CLIENT,
  PAUSE_CLIENT,
  STOP_CLIENT,
  SEEK_CLIENT
} from "../view/state/queries/vamp-mutations";
import { RecordingClient, PlayingClient } from "../view/state/apollotypes";

describe("Play/Stop Button functionality", () => {
  it("handles clicking", () => {
    //TODO
    expect(true).toBe(true);
  });
});
