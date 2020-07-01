/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: MetronomeClient
// ====================================================

export interface MetronomeClient_vamp {
  __typename: "Vamp";
  bpm: number;
  beatsPerBar: number;
  playing: boolean | null;
  metronomeSound: string;
  playPosition: number | null;
  playStartTime: number | null;
}

export interface MetronomeClient {
  vamp: MetronomeClient_vamp | null;
}

export interface MetronomeClientVariables {
  vampId: string;
}

/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: WorkspaceAudioClient
// ====================================================

export interface WorkspaceAudioClient_vamp_clips_audio {
  __typename: "Audio";
  id: string;
  filename: string;
  localFilename: string;
  storedLocally: boolean;
  duration: number;
}

export interface WorkspaceAudioClient_vamp_clips {
  __typename: "Clip";
  id: string;
  start: number;
  audio: WorkspaceAudioClient_vamp_clips_audio;
}

export interface WorkspaceAudioClient_vamp_clientClips {
  __typename: "ClientClip";
  id: string;
  start: number;
  tempFilename: string;
  duration: number;
  storedLocally: boolean;
}

export interface WorkspaceAudioClient_vamp {
  __typename: "Vamp";
  id: string;
  bpm: number;
  beatsPerBar: number;
  playing: boolean | null;
  recording: boolean | null;
  metronomeSound: string;
  playPosition: number | null;
  playStartTime: number | null;
  start: number | null;
  end: number | null;
  loop: boolean | null;
  clips: WorkspaceAudioClient_vamp_clips[];
  clientClips: (WorkspaceAudioClient_vamp_clientClips | null)[] | null;
}

export interface WorkspaceAudioClient {
  vamp: WorkspaceAudioClient_vamp | null;
}

export interface WorkspaceAudioClientVariables {
  vampId: string;
}

/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL mutation operation: AddClip
// ====================================================

export interface AddClip_addClip {
  __typename: "Clip";
  id: string;
}

export interface AddClip {
  addClip: AddClip_addClip;
}

export interface AddClipVariables {
  userId: string;
  vampId: string;
  file: any;
  referenceId?: string | null;
}

/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL mutation operation: AddClientClip
// ====================================================

export interface AddClientClip_addClientClip {
  __typename: "ClientClip";
  id: string;
  tempFilename: string;
  storedLocally: boolean;
  start: number;
}

export interface AddClientClip {
  addClientClip: AddClientClip_addClientClip | null;
}

export interface AddClientClipVariables {
  localFilename: string;
  start: number;
}

/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: CabRecording
// ====================================================

export interface CabRecording_vamp_viewState {
  __typename: "ViewState";
  temporalZoom: number | null;
}

export interface CabRecording_vamp {
  __typename: "Vamp";
  start: number | null;
  end: number | null;
  playing: boolean | null;
  playPosition: number | null;
  playStartTime: number | null;
  recording: boolean | null;
  viewState: CabRecording_vamp_viewState | null;
}

export interface CabRecording {
  vamp: CabRecording_vamp | null;
}

export interface CabRecordingVariables {
  vampId: string;
}

/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL subscription operation: ClipsSubscription
// ====================================================

export interface ClipsSubscription_subClips_updatedClip_audio {
  __typename: "Audio";
  id: string;
  filename: string;
  localFilename: string;
  storedLocally: boolean;
  duration: number;
}

export interface ClipsSubscription_subClips_updatedClip_user {
  __typename: "User";
  id: string;
}

export interface ClipsSubscription_subClips_updatedClip_vamp {
  __typename: "Vamp";
  id: string;
}

export interface ClipsSubscription_subClips_updatedClip {
  __typename: "Clip";
  id: string;
  start: number;
  audio: ClipsSubscription_subClips_updatedClip_audio;
  user: ClipsSubscription_subClips_updatedClip_user;
  vamp: ClipsSubscription_subClips_updatedClip_vamp;
}

export interface ClipsSubscription_subClips {
  __typename: "ClipSubscriptionOutput";
  mutation: string;
  updatedClip: ClipsSubscription_subClips_updatedClip;
  referenceId: string | null;
}

export interface ClipsSubscription {
  subClips: ClipsSubscription_subClips;
}

export interface ClipsSubscriptionVariables {
  vampId: string;
}

/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL mutation operation: RemoveClientClip
// ====================================================

export interface RemoveClientClip {
  removeClientClip: boolean | null;
}

export interface RemoveClientClipVariables {
  tempFilename: string;
}

/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: BeatsPerBarClient
// ====================================================

export interface BeatsPerBarClient_vamp {
  __typename: "Vamp";
  beatsPerBar: number;
}

export interface BeatsPerBarClient {
  vamp: BeatsPerBarClient_vamp | null;
}

export interface BeatsPerBarClientVariables {
  vampId: string;
}

/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL mutation operation: UpdateBeatsPerBar
// ====================================================

export interface UpdateBeatsPerBar_updateVamp {
  __typename: "Vamp";
  beatsPerBar: number;
}

export interface UpdateBeatsPerBar {
  updateVamp: UpdateBeatsPerBar_updateVamp | null;
}

export interface UpdateBeatsPerBarVariables {
  update: VampUpdateInput;
}

/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: BPMClient
// ====================================================

export interface BPMClient_vamp {
  __typename: "Vamp";
  bpm: number;
}

export interface BPMClient {
  vamp: BPMClient_vamp | null;
}

export interface BPMClientVariables {
  vampId: string;
}

/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL mutation operation: UpdateBPM
// ====================================================

export interface UpdateBPM_updateVamp {
  __typename: "Vamp";
  bpm: number;
}

export interface UpdateBPM {
  updateVamp: UpdateBPM_updateVamp | null;
}

export interface UpdateBPMVariables {
  update: VampUpdateInput;
}

/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: MetronomeSoundClient
// ====================================================

export interface MetronomeSoundClient_vamp {
  __typename: "Vamp";
  metronomeSound: string;
}

export interface MetronomeSoundClient {
  vamp: MetronomeSoundClient_vamp | null;
}

export interface MetronomeSoundClientVariables {
  vampId: string;
}

/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL mutation operation: UpdateMetronomeSound
// ====================================================

export interface UpdateMetronomeSound_updateVamp {
  __typename: "Vamp";
  metronomeSound: string;
}

export interface UpdateMetronomeSound {
  updateVamp: UpdateMetronomeSound_updateVamp | null;
}

export interface UpdateMetronomeSoundVariables {
  update: VampUpdateInput;
}

/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: TimecodeClient
// ====================================================

export interface TimecodeClient_vamp {
  __typename: "Vamp";
  playing: boolean | null;
  playPosition: number | null;
  playStartTime: number | null;
  start: number | null;
  end: number | null;
}

export interface TimecodeClient {
  vamp: TimecodeClient_vamp | null;
}

export interface TimecodeClientVariables {
  vampId: string;
}

/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: TimelineClient
// ====================================================

export interface TimelineClient_vamp_clips_audio {
  __typename: "Audio";
  id: string;
  filename: string;
  localFilename: string;
  storedLocally: boolean;
  duration: number;
}

export interface TimelineClient_vamp_clips {
  __typename: "Clip";
  id: string;
  start: number;
  audio: TimelineClient_vamp_clips_audio;
}

export interface TimelineClient_vamp {
  __typename: "Vamp";
  clips: TimelineClient_vamp_clips[];
}

export interface TimelineClient {
  vamp: TimelineClient_vamp | null;
}

export interface TimelineClientVariables {
  vampId: string;
}

/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: GetVamp
// ====================================================

export interface GetVamp_vamp_clientClips {
  __typename: "ClientClip";
  id: string;
}

export interface GetVamp_vamp_viewState {
  __typename: "ViewState";
  temporalZoom: number | null;
}

export interface GetVamp_vamp {
  __typename: "Vamp";
  id: string;
  name: string;
  bpm: number;
  beatsPerBar: number;
  metronomeSound: string;
  clientClips: (GetVamp_vamp_clientClips | null)[] | null;
  playing: boolean | null;
  playPosition: number | null;
  playStartTime: number | null;
  start: number | null;
  end: number | null;
  loop: boolean | null;
  recording: boolean | null;
  viewState: GetVamp_vamp_viewState | null;
}

export interface GetVamp {
  vamp: GetVamp_vamp | null;
}

export interface GetVampVariables {
  id: string;
}

/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL subscription operation: VampSubscription
// ====================================================

export interface VampSubscription_subVamp_clientClips {
  __typename: "ClientClip";
  id: string;
}

export interface VampSubscription_subVamp_viewState {
  __typename: "ViewState";
  temporalZoom: number | null;
}

export interface VampSubscription_subVamp {
  __typename: "Vamp";
  id: string;
  name: string;
  bpm: number;
  beatsPerBar: number;
  metronomeSound: string;
  clientClips: (VampSubscription_subVamp_clientClips | null)[] | null;
  playing: boolean | null;
  playPosition: number | null;
  playStartTime: number | null;
  start: number | null;
  end: number | null;
  loop: boolean | null;
  recording: boolean | null;
  viewState: VampSubscription_subVamp_viewState | null;
}

export interface VampSubscription {
  subVamp: VampSubscription_subVamp;
}

export interface VampSubscriptionVariables {
  vampId: string;
}

/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL mutation operation: AddVamp
// ====================================================

export interface AddVamp_addVamp {
  __typename: "Vamp";
  id: string;
}

export interface AddVamp {
  addVamp: AddVamp_addVamp;
}

export interface AddVampVariables {
  creatorId: string;
}

/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: GetClipsServer
// ====================================================

export interface GetClipsServer_clips_vamp {
  __typename: "Vamp";
  id: string;
}

export interface GetClipsServer_clips_user {
  __typename: "User";
  id: string;
}

export interface GetClipsServer_clips_audio {
  __typename: "Audio";
  id: string;
  filename: string;
  localFilename: string;
  storedLocally: boolean;
  duration: number;
}

export interface GetClipsServer_clips {
  __typename: "Clip";
  id: string;
  start: number;
  vamp: GetClipsServer_clips_vamp;
  user: GetClipsServer_clips_user;
  audio: GetClipsServer_clips_audio;
}

export interface GetClipsServer {
  clips: GetClipsServer_clips[] | null;
}

export interface GetClipsServerVariables {
  vampId: string;
}

/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: GetClipsClient
// ====================================================

export interface GetClipsClient_vamp_clips_audio {
  __typename: "Audio";
  id: string;
  filename: string;
  localFilename: string;
  storedLocally: boolean;
  duration: number;
}

export interface GetClipsClient_vamp_clips {
  __typename: "Clip";
  id: string;
  start: number;
  audio: GetClipsClient_vamp_clips_audio;
}

export interface GetClipsClient_vamp {
  __typename: "Vamp";
  clips: GetClipsClient_vamp_clips[];
}

export interface GetClipsClient {
  vamp: GetClipsClient_vamp | null;
}

export interface GetClipsClientVariables {
  vampId: string;
}

/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: GetClientClipsClient
// ====================================================

export interface GetClientClipsClient_vamp_clientClips {
  __typename: "ClientClip";
  id: string;
  start: number;
  tempFilename: string;
  duration: number;
  storedLocally: boolean;
}

export interface GetClientClipsClient_vamp {
  __typename: "Vamp";
  clientClips: (GetClientClipsClient_vamp_clientClips | null)[] | null;
}

export interface GetClientClipsClient {
  vamp: GetClientClipsClient_vamp | null;
}

export interface GetClientClipsClientVariables {
  vampId: string;
}

/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL mutation operation: LogoutServer
// ====================================================

export interface LogoutServer_logout {
  __typename: "User";
  id: string;
}

export interface LogoutServer {
  logout: LogoutServer_logout;
}

/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: MeServer
// ====================================================

export interface MeServer_me {
  __typename: "User";
  id: string;
  username: string;
  email: string;
}

export interface MeServer {
  me: MeServer_me | null;
}

/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: MeClient
// ====================================================

export interface MeClient_me {
  __typename: "User";
  id: string;
  username: string;
  email: string;
}

export interface MeClient {
  me: MeClient_me | null;
}

/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL mutation operation: PlayClient
// ====================================================

export interface PlayClient {
  play: boolean | null;
}

/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL mutation operation: PauseClient
// ====================================================

export interface PauseClient {
  pause: boolean | null;
}

/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL mutation operation: StopClient
// ====================================================

export interface StopClient {
  stop: boolean | null;
}

/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL mutation operation: RecordClient
// ====================================================

export interface RecordClient {
  record: boolean | null;
}

/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL mutation operation: Seek
// ====================================================

export interface Seek {
  seek: boolean | null;
}

export interface SeekVariables {
  time: number;
}

/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: LocalVampIdClient
// ====================================================

export interface LocalVampIdClient {
  loadedVampId: string | null;
}

/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: PlayingClient
// ====================================================

export interface PlayingClient_vamp {
  __typename: "Vamp";
  playing: boolean | null;
}

export interface PlayingClient {
  vamp: PlayingClient_vamp | null;
}

export interface PlayingClientVariables {
  vampId: string;
}

/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: RecordingClient
// ====================================================

export interface RecordingClient_vamp {
  __typename: "Vamp";
  recording: boolean | null;
}

export interface RecordingClient {
  vamp: RecordingClient_vamp | null;
}

export interface RecordingClientVariables {
  vampId: string;
}

/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: ViewStateClient
// ====================================================

export interface ViewStateClient_vamp_viewState {
  __typename: "ViewState";
  temporalZoom: number | null;
}

export interface ViewStateClient_vamp {
  __typename: "Vamp";
  viewState: ViewStateClient_vamp_viewState | null;
}

export interface ViewStateClient {
  vamp: ViewStateClient_vamp | null;
}

export interface ViewStateClientVariables {
  vampId: string;
}

/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: PlayPositionStartTimeClient
// ====================================================

export interface PlayPositionStartTimeClient_vamp {
  __typename: "Vamp";
  playPosition: number | null;
  playStartTime: number | null;
}

export interface PlayPositionStartTimeClient {
  vamp: PlayPositionStartTimeClient_vamp | null;
}

export interface PlayPositionStartTimeClientVariables {
  vampId: string;
}

/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: GetCurrentUserId
// ====================================================

export interface GetCurrentUserId_me {
  __typename: "User";
  id: string;
}

export interface GetCurrentUserId {
  me: GetCurrentUserId_me | null;
}

/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

//==============================================================
// START Enums and Input Objects
//==============================================================

/**
 * Vamp update input
 */
export interface VampUpdateInput {
  id: string;
  name?: string | null;
  bpm?: number | null;
  beatsPerBar?: number | null;
  metronomeSound?: string | null;
}

//==============================================================
// END Enums and Input Objects
//==============================================================
