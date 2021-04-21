/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: PlayStopAdapterQuery
// ====================================================

export interface PlayStopAdapterQuery_vamp {
  __typename: "Vamp";
  id: string;
  playing: boolean | null;
  /**
   * Is the "count off" currently in process. This happens before playing, etc.
   * get changed in state.
   */
  countingOff: boolean | null;
}

export interface PlayStopAdapterQuery {
  vamp: PlayStopAdapterQuery_vamp | null;
}

export interface PlayStopAdapterQueryVariables {
  vampId: string;
}

/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: SeekAdapterQuery
// ====================================================

export interface SeekAdapterQuery_vamp {
  __typename: "Vamp";
  id: string;
  playing: boolean | null;
  /**
   * The position in seconds of the current position before play was pressed.
   */
  playPosition: number | null;
  /**
   * The Date.now() value of the instant when playing began, or -1 if not
   * playing. The true current time when playing will be playPosition +
   * (Date.now() - playStartTime) / 1000.
   */
  playStartTime: number | null;
}

export interface SeekAdapterQuery_userInVamp_cab {
  __typename: "Cab";
  start: number;
}

export interface SeekAdapterQuery_userInVamp {
  __typename: "UserInVamp";
  id: string;
  cab: SeekAdapterQuery_userInVamp_cab;
}

export interface SeekAdapterQuery {
  vamp: SeekAdapterQuery_vamp | null;
  /**
   * Tries to find a UserInVamp, or adds one if not found.
   */
  userInVamp: SeekAdapterQuery_userInVamp;
}

export interface SeekAdapterQueryVariables {
  vampId: string;
  userId: string;
}

/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: CountOffAdapterQuery
// ====================================================

export interface CountOffAdapterQuery_vamp_countOff {
  __typename: "CountOff";
  duration: number;
}

export interface CountOffAdapterQuery_vamp {
  __typename: "Vamp";
  id: string;
  /**
   * The position in seconds of the current position before play was pressed.
   */
  playPosition: number | null;
  /**
   * Contains the data about the count off
   */
  countOff: CountOffAdapterQuery_vamp_countOff | null;
  /**
   * Is the "count off" currently in process. This happens before playing, etc.
   * get changed in state.
   */
  countingOff: boolean | null;
  /**
   * Date.now() of when countdown began (see playStartTime, which is similar).
   */
  countingOffStartTime: number | null;
}

export interface CountOffAdapterQuery {
  vamp: CountOffAdapterQuery_vamp | null;
}

export interface CountOffAdapterQueryVariables {
  vampId: string;
}

/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: FloorAdapter
// ====================================================

export interface FloorAdapter_vamp {
  __typename: "Vamp";
  /**
   * Is the floor open in the workspace or not.
   */
  floorOpen: boolean | null;
}

export interface FloorAdapter {
  vamp: FloorAdapter_vamp | null;
}

export interface FloorAdapterVariables {
  vampId: string;
}

/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: WorkspaceAudioClient
// ====================================================

export interface WorkspaceAudioClient_vamp_clips_content_audio {
  __typename: "Audio";
  id: string;
  filename: string;
  localFilename: string;
  latencyCompensation: number;
  storedLocally: boolean;
  duration: number;
}

export interface WorkspaceAudioClient_vamp_clips_content {
  __typename: "ContentInClip";
  id: string;
  type: ClipContentType;
  start: number;
  duration: number;
  audio: WorkspaceAudioClient_vamp_clips_content_audio | null;
}

export interface WorkspaceAudioClient_vamp_clips {
  __typename: "Clip";
  id: string;
  start: number;
  duration: number;
  content: WorkspaceAudioClient_vamp_clips_content[];
}

export interface WorkspaceAudioClient_vamp_clientClips {
  __typename: "ClientClip";
  start: number;
  audioStoreKey: string;
  realClipId: string | null;
  inProgress: boolean;
  duration: number;
  latencyCompensation: number | null;
}

export interface WorkspaceAudioClient_vamp_sections_subSections {
  __typename: "Section";
  id: string;
}

export interface WorkspaceAudioClient_vamp_sections {
  __typename: "Section";
  id: string;
  name: string | null;
  bpm: number;
  beatsPerBar: number;
  metronomeSound: string;
  startMeasure: number;
  repetitions: number | null;
  subSections: WorkspaceAudioClient_vamp_sections_subSections[] | null;
}

export interface WorkspaceAudioClient_vamp_forms_preSection {
  __typename: "Section";
  id: string;
}

export interface WorkspaceAudioClient_vamp_forms_insertedSections {
  __typename: "Section";
  id: string;
}

export interface WorkspaceAudioClient_vamp_forms_postSection {
  __typename: "Section";
  id: string;
}

export interface WorkspaceAudioClient_vamp_forms {
  __typename: "Form";
  preSection: WorkspaceAudioClient_vamp_forms_preSection;
  insertedSections: WorkspaceAudioClient_vamp_forms_insertedSections[];
  postSection: WorkspaceAudioClient_vamp_forms_postSection | null;
}

export interface WorkspaceAudioClient_vamp {
  __typename: "Vamp";
  id: string;
  bpm: number;
  beatsPerBar: number;
  playing: boolean | null;
  recording: boolean | null;
  metronomeSound: string;
  /**
   * The position in seconds of the current position before play was pressed.
   */
  playPosition: number | null;
  /**
   * The Date.now() value of the instant when playing began, or -1 if not
   * playing. The true current time when playing will be playPosition +
   * (Date.now() - playStartTime) / 1000.
   */
  playStartTime: number | null;
  start: number | null;
  end: number | null;
  loop: boolean | null;
  clips: WorkspaceAudioClient_vamp_clips[];
  clientClips: (WorkspaceAudioClient_vamp_clientClips | null)[] | null;
  sections: WorkspaceAudioClient_vamp_sections[];
  forms: WorkspaceAudioClient_vamp_forms[];
}

export interface WorkspaceAudioClient_userInVamp_cab {
  __typename: "Cab";
  start: number;
  duration: number;
  loops: boolean;
}

export interface WorkspaceAudioClient_userInVamp_prefs {
  __typename: "UserInVampPrefs";
  latencyCompensation: number;
}

export interface WorkspaceAudioClient_userInVamp {
  __typename: "UserInVamp";
  id: string;
  cab: WorkspaceAudioClient_userInVamp_cab;
  prefs: WorkspaceAudioClient_userInVamp_prefs;
}

export interface WorkspaceAudioClient {
  vamp: WorkspaceAudioClient_vamp | null;
  /**
   * Tries to find a UserInVamp, or adds one if not found.
   */
  userInVamp: WorkspaceAudioClient_userInVamp;
}

export interface WorkspaceAudioClientVariables {
  vampId: string;
  userId: string;
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
  /**
   * Adds a clip and puts the new clip in the Vamp specfied.
   */
  addClip: AddClip_addClip;
}

export interface AddClipVariables {
  userId: string;
  vampId: string;
  file: any;
  latencyCompensation?: number | null;
  referenceId?: string | null;
  start?: number | null;
  duration: number;
}

/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: CabMainRecording
// ====================================================

export interface CabMainRecording_userInVamp_cab_user {
  __typename: "User";
  id: string;
}

export interface CabMainRecording_userInVamp_cab {
  __typename: "Cab";
  user: CabMainRecording_userInVamp_cab_user;
  start: number;
  duration: number;
}

export interface CabMainRecording_userInVamp {
  __typename: "UserInVamp";
  id: string;
  cab: CabMainRecording_userInVamp_cab;
}

export interface CabMainRecording {
  /**
   * Tries to find a UserInVamp, or adds one if not found.
   */
  userInVamp: CabMainRecording_userInVamp;
}

export interface CabMainRecordingVariables {
  vampId: string;
  userId: string;
}

/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: CabMainQuery
// ====================================================

export interface CabMainQuery_userInVamp_cab_user {
  __typename: "User";
  id: string;
}

export interface CabMainQuery_userInVamp_cab {
  __typename: "Cab";
  user: CabMainQuery_userInVamp_cab_user;
  start: number;
  duration: number;
  loops: boolean;
}

export interface CabMainQuery_userInVamp {
  __typename: "UserInVamp";
  id: string;
  cab: CabMainQuery_userInVamp_cab;
}

export interface CabMainQuery {
  /**
   * Tries to find a UserInVamp, or adds one if not found.
   */
  userInVamp: CabMainQuery_userInVamp;
}

export interface CabMainQueryVariables {
  vampId: string;
  userId: string;
}

/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL mutation operation: UpdateCab
// ====================================================

export interface UpdateCab_updateUserInVamp {
  __typename: "UserInVamp";
  id: string;
}

export interface UpdateCab {
  updateUserInVamp: UpdateCab_updateUserInVamp;
}

export interface UpdateCabVariables {
  userId: string;
  vampId: string;
  start?: number | null;
  duration?: number | null;
  loops?: boolean | null;
}

/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL mutation operation: UpdateClip
// ====================================================

export interface UpdateClip_updateClip {
  __typename: "Clip";
  id: string;
}

export interface UpdateClip {
  /**
   * Updates a clip and publishes subscriptions.
   */
  updateClip: UpdateClip_updateClip;
}

export interface UpdateClipVariables {
  clipUpdate: UpdateClipInput;
}

/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: FloorOverlayWrapper
// ====================================================

export interface FloorOverlayWrapper_vamp {
  __typename: "Vamp";
  /**
   * Is the floor open in the workspace or not.
   */
  floorOpen: boolean | null;
}

export interface FloorOverlayWrapper {
  vamp: FloorOverlayWrapper_vamp | null;
}

export interface FloorOverlayWrapperVariables {
  vampId: string;
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
// GraphQL query operation: PlayPanelQuery
// ====================================================

export interface PlayPanelQuery_vamp {
  __typename: "Vamp";
  /**
   * Is the "count off" currently in process. This happens before playing, etc.
   * get changed in state.
   */
  countingOff: boolean | null;
}

export interface PlayPanelQuery {
  vamp: PlayPanelQuery_vamp | null;
}

export interface PlayPanelQueryVariables {
  vampId: string;
}

/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: NameClient
// ====================================================

export interface NameClient_vamp {
  __typename: "Vamp";
  name: string;
}

export interface NameClient {
  vamp: NameClient_vamp | null;
}

export interface NameClientVariables {
  vampId: string;
}

/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL mutation operation: UpdateName
// ====================================================

export interface UpdateName_updateVamp {
  __typename: "Vamp";
  name: string;
}

export interface UpdateName {
  updateVamp: UpdateName_updateVamp | null;
}

export interface UpdateNameVariables {
  update: VampUpdateInput;
}

/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: TimelineClient
// ====================================================

export interface TimelineClient_vamp_tracks {
  __typename: "Track";
  id: string;
}

export interface TimelineClient_vamp_clips_track {
  __typename: "Track";
  id: string;
}

export interface TimelineClient_vamp_clips_content_audio {
  __typename: "Audio";
  id: string;
  filename: string;
  localFilename: string;
  storedLocally: boolean;
  latencyCompensation: number;
  duration: number;
  error: string | null;
}

export interface TimelineClient_vamp_clips_content {
  __typename: "ContentInClip";
  start: number;
  duration: number;
  type: ClipContentType;
  audio: TimelineClient_vamp_clips_content_audio | null;
}

export interface TimelineClient_vamp_clips {
  __typename: "Clip";
  id: string;
  start: number;
  duration: number;
  track: TimelineClient_vamp_clips_track | null;
  content: TimelineClient_vamp_clips_content[];
  draggingInfo: ClipDraggingInfo | null;
}

export interface TimelineClient_vamp {
  __typename: "Vamp";
  tracks: TimelineClient_vamp_tracks[];
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
// GraphQL query operation: GetUserInVamp
// ====================================================

export interface GetUserInVamp_userInVamp_vamp {
  __typename: "Vamp";
  id: string;
}

export interface GetUserInVamp_userInVamp_user {
  __typename: "User";
  id: string;
}

export interface GetUserInVamp_userInVamp_cab_user {
  __typename: "User";
  id: string;
}

export interface GetUserInVamp_userInVamp_cab {
  __typename: "Cab";
  user: GetUserInVamp_userInVamp_cab_user;
  start: number;
  duration: number;
  loops: boolean;
  countdown: number;
}

export interface GetUserInVamp_userInVamp_prefs {
  __typename: "UserInVampPrefs";
  latencyCompensation: number;
}

export interface GetUserInVamp_userInVamp {
  __typename: "UserInVamp";
  id: string;
  vamp: GetUserInVamp_userInVamp_vamp;
  user: GetUserInVamp_userInVamp_user;
  cab: GetUserInVamp_userInVamp_cab;
  prefs: GetUserInVamp_userInVamp_prefs;
}

export interface GetUserInVamp {
  /**
   * Tries to find a UserInVamp, or adds one if not found.
   */
  userInVamp: GetUserInVamp_userInVamp;
}

export interface GetUserInVampVariables {
  vampId: string;
  userId: string;
}

/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL subscription operation: UserInVampSubscription
// ====================================================

export interface UserInVampSubscription_subUserInVamp_vamp {
  __typename: "Vamp";
  id: string;
}

export interface UserInVampSubscription_subUserInVamp_user {
  __typename: "User";
  id: string;
}

export interface UserInVampSubscription_subUserInVamp_cab_user {
  __typename: "User";
  id: string;
}

export interface UserInVampSubscription_subUserInVamp_cab {
  __typename: "Cab";
  user: UserInVampSubscription_subUserInVamp_cab_user;
  start: number;
  duration: number;
  loops: boolean;
  countdown: number;
}

export interface UserInVampSubscription_subUserInVamp_prefs {
  __typename: "UserInVampPrefs";
  latencyCompensation: number;
}

export interface UserInVampSubscription_subUserInVamp {
  __typename: "UserInVamp";
  id: string;
  vamp: UserInVampSubscription_subUserInVamp_vamp;
  user: UserInVampSubscription_subUserInVamp_user;
  cab: UserInVampSubscription_subUserInVamp_cab;
  prefs: UserInVampSubscription_subUserInVamp_prefs;
}

export interface UserInVampSubscription {
  subUserInVamp: UserInVampSubscription_subUserInVamp;
}

export interface UserInVampSubscriptionVariables {
  userId: string;
  vampId: string;
}

/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: GetVamp
// ====================================================

export interface GetVamp_vamp_tracks {
  __typename: "Track";
  id: string;
}

export interface GetVamp_vamp_clips_track {
  __typename: "Track";
  id: string;
}

export interface GetVamp_vamp_clips_vamp {
  __typename: "Vamp";
  id: string;
}

export interface GetVamp_vamp_clips_user {
  __typename: "User";
  id: string;
}

export interface GetVamp_vamp_clips_content_audio {
  __typename: "Audio";
  id: string;
  filename: string;
  latencyCompensation: number;
  storedLocally: boolean;
  localFilename: string;
  duration: number;
  error: string | null;
}

export interface GetVamp_vamp_clips_content {
  __typename: "ContentInClip";
  id: string;
  type: ClipContentType;
  start: number;
  duration: number;
  audio: GetVamp_vamp_clips_content_audio | null;
}

export interface GetVamp_vamp_clips {
  __typename: "Clip";
  id: string;
  start: number;
  duration: number;
  track: GetVamp_vamp_clips_track | null;
  vamp: GetVamp_vamp_clips_vamp;
  user: GetVamp_vamp_clips_user;
  content: GetVamp_vamp_clips_content[];
}

export interface GetVamp_vamp_sections_subSections {
  __typename: "Section";
  id: string;
}

export interface GetVamp_vamp_sections {
  __typename: "Section";
  id: string;
  name: string | null;
  bpm: number;
  beatsPerBar: number;
  metronomeSound: string;
  startMeasure: number;
  repetitions: number | null;
  subSections: GetVamp_vamp_sections_subSections[] | null;
}

export interface GetVamp_vamp_forms_preSection {
  __typename: "Section";
  id: string;
}

export interface GetVamp_vamp_forms_insertedSections {
  __typename: "Section";
  id: string;
}

export interface GetVamp_vamp_forms_postSection {
  __typename: "Section";
  id: string;
}

export interface GetVamp_vamp_forms {
  __typename: "Form";
  preSection: GetVamp_vamp_forms_preSection;
  insertedSections: GetVamp_vamp_forms_insertedSections[];
  postSection: GetVamp_vamp_forms_postSection | null;
}

export interface GetVamp_vamp_countOff_measures {
  __typename: "CountOffMeasure";
  repetitions: number;
  bpm: number;
  beats: number;
  metronomeSound: string;
}

export interface GetVamp_vamp_countOff {
  __typename: "CountOff";
  duration: number;
  measures: GetVamp_vamp_countOff_measures[];
}

export interface GetVamp_vamp_clientClips {
  __typename: "ClientClip";
  audioStoreKey: string;
}

export interface GetVamp_vamp {
  __typename: "Vamp";
  id: string;
  name: string;
  bpm: number;
  beatsPerBar: number;
  metronomeSound: string;
  tracks: GetVamp_vamp_tracks[];
  clips: GetVamp_vamp_clips[];
  sections: GetVamp_vamp_sections[];
  forms: GetVamp_vamp_forms[];
  playing: boolean | null;
  /**
   * The position in seconds of the current position before play was pressed.
   */
  playPosition: number | null;
  /**
   * The Date.now() value of the instant when playing began, or -1 if not
   * playing. The true current time when playing will be playPosition +
   * (Date.now() - playStartTime) / 1000.
   */
  playStartTime: number | null;
  start: number | null;
  end: number | null;
  loop: boolean | null;
  recording: boolean | null;
  /**
   * Is the "count off" currently in process. This happens before playing, etc.
   * get changed in state.
   */
  countingOff: boolean | null;
  /**
   * Contains the data about the count off
   */
  countOff: GetVamp_vamp_countOff | null;
  /**
   * Date.now() of when countdown began (see playStartTime, which is similar).
   */
  countingOffStartTime: number | null;
  /**
   * Is the floor open in the workspace or not.
   */
  floorOpen: boolean | null;
  clientClips: (GetVamp_vamp_clientClips | null)[] | null;
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

export interface VampSubscription_subVamp_vampPayload_tracks {
  __typename: "Track";
  id: string;
}

export interface VampSubscription_subVamp_vampPayload_clips_track {
  __typename: "Track";
  id: string;
}

export interface VampSubscription_subVamp_vampPayload_clips_vamp {
  __typename: "Vamp";
  id: string;
}

export interface VampSubscription_subVamp_vampPayload_clips_user {
  __typename: "User";
  id: string;
}

export interface VampSubscription_subVamp_vampPayload_clips_content_audio {
  __typename: "Audio";
  id: string;
  filename: string;
  latencyCompensation: number;
  storedLocally: boolean;
  localFilename: string;
  duration: number;
  error: string | null;
}

export interface VampSubscription_subVamp_vampPayload_clips_content {
  __typename: "ContentInClip";
  id: string;
  type: ClipContentType;
  start: number;
  duration: number;
  audio: VampSubscription_subVamp_vampPayload_clips_content_audio | null;
}

export interface VampSubscription_subVamp_vampPayload_clips {
  __typename: "Clip";
  id: string;
  start: number;
  duration: number;
  track: VampSubscription_subVamp_vampPayload_clips_track | null;
  vamp: VampSubscription_subVamp_vampPayload_clips_vamp;
  user: VampSubscription_subVamp_vampPayload_clips_user;
  content: VampSubscription_subVamp_vampPayload_clips_content[];
}

export interface VampSubscription_subVamp_vampPayload_sections_subSections {
  __typename: "Section";
  id: string;
}

export interface VampSubscription_subVamp_vampPayload_sections {
  __typename: "Section";
  id: string;
  name: string | null;
  bpm: number;
  beatsPerBar: number;
  metronomeSound: string;
  startMeasure: number;
  repetitions: number | null;
  subSections: VampSubscription_subVamp_vampPayload_sections_subSections[] | null;
}

export interface VampSubscription_subVamp_vampPayload_forms_preSection {
  __typename: "Section";
  id: string;
}

export interface VampSubscription_subVamp_vampPayload_forms_insertedSections {
  __typename: "Section";
  id: string;
}

export interface VampSubscription_subVamp_vampPayload_forms_postSection {
  __typename: "Section";
  id: string;
}

export interface VampSubscription_subVamp_vampPayload_forms {
  __typename: "Form";
  preSection: VampSubscription_subVamp_vampPayload_forms_preSection;
  insertedSections: VampSubscription_subVamp_vampPayload_forms_insertedSections[];
  postSection: VampSubscription_subVamp_vampPayload_forms_postSection | null;
}

export interface VampSubscription_subVamp_vampPayload_countOff_measures {
  __typename: "CountOffMeasure";
  repetitions: number;
  bpm: number;
  beats: number;
  metronomeSound: string;
}

export interface VampSubscription_subVamp_vampPayload_countOff {
  __typename: "CountOff";
  duration: number;
  measures: VampSubscription_subVamp_vampPayload_countOff_measures[];
}

export interface VampSubscription_subVamp_vampPayload_clientClips {
  __typename: "ClientClip";
  audioStoreKey: string;
}

export interface VampSubscription_subVamp_vampPayload {
  __typename: "Vamp";
  id: string;
  name: string;
  bpm: number;
  beatsPerBar: number;
  metronomeSound: string;
  tracks: VampSubscription_subVamp_vampPayload_tracks[];
  clips: VampSubscription_subVamp_vampPayload_clips[];
  sections: VampSubscription_subVamp_vampPayload_sections[];
  forms: VampSubscription_subVamp_vampPayload_forms[];
  playing: boolean | null;
  /**
   * The position in seconds of the current position before play was pressed.
   */
  playPosition: number | null;
  /**
   * The Date.now() value of the instant when playing began, or -1 if not
   * playing. The true current time when playing will be playPosition +
   * (Date.now() - playStartTime) / 1000.
   */
  playStartTime: number | null;
  start: number | null;
  end: number | null;
  loop: boolean | null;
  recording: boolean | null;
  /**
   * Is the "count off" currently in process. This happens before playing, etc.
   * get changed in state.
   */
  countingOff: boolean | null;
  /**
   * Contains the data about the count off
   */
  countOff: VampSubscription_subVamp_vampPayload_countOff | null;
  /**
   * Date.now() of when countdown began (see playStartTime, which is similar).
   */
  countingOffStartTime: number | null;
  /**
   * Is the floor open in the workspace or not.
   */
  floorOpen: boolean | null;
  clientClips: (VampSubscription_subVamp_vampPayload_clientClips | null)[] | null;
}

export interface VampSubscription_subVamp {
  __typename: "VampSubscriptionOutput";
  vampPayload: VampSubscription_subVamp_vampPayload;
  addedClipId: string | null;
  /**
   * When we add a clip in the client we specify an ID that gets assigned to
   * the temporary client clip which plays while we wait for the actual clip
   * to make the round trip to and from the server. This value and addedClipId
   * tell us which client clip to replace with the real clip once it's
   * returned.
   */
  addedClipRefId: string | null;
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
// GraphQL query operation: WorkspaceContentClient
// ====================================================

export interface WorkspaceContentClient_vamp_tracks {
  __typename: "Track";
  id: string;
}

export interface WorkspaceContentClient_vamp {
  __typename: "Vamp";
  tracks: WorkspaceContentClient_vamp_tracks[];
}

export interface WorkspaceContentClient {
  vamp: WorkspaceContentClient_vamp | null;
}

export interface WorkspaceContentClientVariables {
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
// GraphQL mutation operation: RemoveClipServer
// ====================================================

export interface RemoveClipServer {
  /**
   * Removes the specified clip from the specified Vamp. Doesn't remove the clip
   * from the database.
   */
  removeClip: boolean;
}

export interface RemoveClipServerVariables {
  vampId: string;
  clipId: string;
}

/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: GetClipsServer
// ====================================================

export interface GetClipsServer_clips_track {
  __typename: "Track";
  id: string;
}

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
}

export interface GetClipsServer_clips {
  __typename: "Clip";
  id: string;
  start: number;
  track: GetClipsServer_clips_track | null;
  vamp: GetClipsServer_clips_vamp;
  user: GetClipsServer_clips_user;
  /**
   * Gets the first audio on this clip's content array.
   */
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
  /**
   * Gets the first audio on this clip's content array.
   */
  audio: GetClipsClient_vamp_clips_audio;
  draggingInfo: ClipDraggingInfo | null;
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
  start: number;
  audioStoreKey: string;
  realClipId: string | null;
  duration: number;
  inProgress: boolean;
  latencyCompensation: number | null;
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
// GraphQL query operation: UserInVampClient
// ====================================================

export interface UserInVampClient_userInVamp_user {
  __typename: "User";
  id: string;
}

export interface UserInVampClient_userInVamp_vamp {
  __typename: "Vamp";
  id: string;
}

export interface UserInVampClient_userInVamp_cab_user {
  __typename: "User";
  id: string;
}

export interface UserInVampClient_userInVamp_cab {
  __typename: "Cab";
  user: UserInVampClient_userInVamp_cab_user;
  start: number;
  duration: number;
}

export interface UserInVampClient_userInVamp {
  __typename: "UserInVamp";
  id: string;
  user: UserInVampClient_userInVamp_user;
  vamp: UserInVampClient_userInVamp_vamp;
  cab: UserInVampClient_userInVamp_cab;
}

export interface UserInVampClient {
  /**
   * Tries to find a UserInVamp, or adds one if not found.
   */
  userInVamp: UserInVampClient_userInVamp;
}

export interface UserInVampClientVariables {
  vampId: string;
  userId: string;
}

/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: CabClient
// ====================================================

export interface CabClient_userInVamp_cab {
  __typename: "Cab";
  start: number;
  duration: number;
  loops: boolean;
}

export interface CabClient_userInVamp {
  __typename: "UserInVamp";
  id: string;
  cab: CabClient_userInVamp_cab;
}

export interface CabClient {
  /**
   * Tries to find a UserInVamp, or adds one if not found.
   */
  userInVamp: CabClient_userInVamp;
}

export interface CabClientVariables {
  vampId: string;
  userId: string;
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
// GraphQL query operation: PlayPositionStartTimeClient
// ====================================================

export interface PlayPositionStartTimeClient_vamp {
  __typename: "Vamp";
  /**
   * The position in seconds of the current position before play was pressed.
   */
  playPosition: number | null;
  /**
   * The Date.now() value of the instant when playing began, or -1 if not
   * playing. The true current time when playing will be playPosition +
   * (Date.now() - playStartTime) / 1000.
   */
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
// GraphQL query operation: MetronomeInfoClient
// ====================================================

export interface MetronomeInfoClient_vamp {
  __typename: "Vamp";
  bpm: number;
  beatsPerBar: number;
  metronomeSound: string;
}

export interface MetronomeInfoClient {
  vamp: MetronomeInfoClient_vamp | null;
}

export interface MetronomeInfoClientVariables {
  vampId: string;
}

/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: CountOffDurationQuery
// ====================================================

export interface CountOffDurationQuery_vamp_countOff {
  __typename: "CountOff";
  duration: number;
}

export interface CountOffDurationQuery_vamp {
  __typename: "Vamp";
  /**
   * Contains the data about the count off
   */
  countOff: CountOffDurationQuery_vamp_countOff | null;
}

export interface CountOffDurationQuery {
  vamp: CountOffDurationQuery_vamp | null;
}

export interface CountOffDurationQueryVariables {
  vampId: string;
}

/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: CountOffReverseCounterQuery
// ====================================================

export interface CountOffReverseCounterQuery_vamp_countOff_measures {
  __typename: "CountOffMeasure";
  repetitions: number;
  beats: number;
  bpm: number;
}

export interface CountOffReverseCounterQuery_vamp_countOff {
  __typename: "CountOff";
  duration: number;
  measures: CountOffReverseCounterQuery_vamp_countOff_measures[];
}

export interface CountOffReverseCounterQuery_vamp {
  __typename: "Vamp";
  /**
   * Is the "count off" currently in process. This happens before playing, etc.
   * get changed in state.
   */
  countingOff: boolean | null;
  /**
   * Date.now() of when countdown began (see playStartTime, which is similar).
   */
  countingOffStartTime: number | null;
  /**
   * Contains the data about the count off
   */
  countOff: CountOffReverseCounterQuery_vamp_countOff | null;
}

export interface CountOffReverseCounterQuery {
  vamp: CountOffReverseCounterQuery_vamp | null;
}

export interface CountOffReverseCounterQueryVariables {
  vampId: string;
}

/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: MetronomeQuery
// ====================================================

export interface MetronomeQuery_vamp_sections_subSections {
  __typename: "Section";
  id: string;
}

export interface MetronomeQuery_vamp_sections {
  __typename: "Section";
  id: string;
  name: string | null;
  bpm: number;
  beatsPerBar: number;
  metronomeSound: string;
  startMeasure: number;
  repetitions: number | null;
  subSections: MetronomeQuery_vamp_sections_subSections[] | null;
}

export interface MetronomeQuery_vamp_forms_preSection {
  __typename: "Section";
  id: string;
}

export interface MetronomeQuery_vamp_forms_insertedSections {
  __typename: "Section";
  id: string;
}

export interface MetronomeQuery_vamp_forms_postSection {
  __typename: "Section";
  id: string;
}

export interface MetronomeQuery_vamp_forms {
  __typename: "Form";
  preSection: MetronomeQuery_vamp_forms_preSection;
  insertedSections: MetronomeQuery_vamp_forms_insertedSections[];
  postSection: MetronomeQuery_vamp_forms_postSection | null;
}

export interface MetronomeQuery_vamp {
  __typename: "Vamp";
  sections: MetronomeQuery_vamp_sections[];
  forms: MetronomeQuery_vamp_forms[];
}

export interface MetronomeQuery {
  vamp: MetronomeQuery_vamp | null;
}

export interface MetronomeQueryVariables {
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

// ====================================================
// GraphQL query operation: TrueTimeClient
// ====================================================

export interface TrueTimeClient_vamp {
  __typename: "Vamp";
  playing: boolean | null;
  /**
   * The position in seconds of the current position before play was pressed.
   */
  playPosition: number | null;
  /**
   * The Date.now() value of the instant when playing began, or -1 if not
   * playing. The true current time when playing will be playPosition +
   * (Date.now() - playStartTime) / 1000.
   */
  playStartTime: number | null;
  start: number | null;
  end: number | null;
}

export interface TrueTimeClient {
  vamp: TrueTimeClient_vamp | null;
}

export interface TrueTimeClientVariables {
  vampId: string;
}

/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: ViewBoundsDataClient
// ====================================================

export interface ViewBoundsDataClient_vamp_clips_audio {
  __typename: "Audio";
  id: string;
  duration: number;
}

export interface ViewBoundsDataClient_vamp_clips {
  __typename: "Clip";
  id: string;
  start: number;
  /**
   * Gets the first audio on this clip's content array.
   */
  audio: ViewBoundsDataClient_vamp_clips_audio;
}

export interface ViewBoundsDataClient_vamp_clientClips {
  __typename: "ClientClip";
  start: number;
  duration: number;
}

export interface ViewBoundsDataClient_vamp {
  __typename: "Vamp";
  id: string;
  clips: ViewBoundsDataClient_vamp_clips[];
  clientClips: (ViewBoundsDataClient_vamp_clientClips | null)[] | null;
}

export interface ViewBoundsDataClient_userInVamp_cab {
  __typename: "Cab";
  start: number;
  duration: number;
}

export interface ViewBoundsDataClient_userInVamp {
  __typename: "UserInVamp";
  id: string;
  cab: ViewBoundsDataClient_userInVamp_cab;
}

export interface ViewBoundsDataClient {
  vamp: ViewBoundsDataClient_vamp | null;
  /**
   * Tries to find a UserInVamp, or adds one if not found.
   */
  userInVamp: ViewBoundsDataClient_userInVamp;
}

export interface ViewBoundsDataClientVariables {
  vampId: string;
  userId: string;
}

/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL fragment: NewClientClip
// ====================================================

export interface NewClientClip {
  __typename: "ClientClip";
  audioStoreKey: string;
  realClipId: string | null;
  start: number;
  duration: number;
  inProgress: boolean;
  latencyCompensation: number | null;
}

/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL fragment: ClientClipInProgress
// ====================================================

export interface ClientClipInProgress {
  __typename: "ClientClip";
  audioStoreKey: string;
  inProgress: boolean;
}

/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL fragment: ClientClipRealClipId
// ====================================================

export interface ClientClipRealClipId {
  __typename: "ClientClip";
  audioStoreKey: string;
  realClipId: string | null;
}

/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

//==============================================================
// START Enums and Input Objects
//==============================================================

/**
 * The type of content contained in a clip
 */
export enum ClipContentType {
  AUDIO = "AUDIO",
}

export interface ClipDraggingInfo {
  dragging?: boolean | null;
  track?: string | null;
  position?: number | null;
  downPosX?: number | null;
}

export interface UpdateClipInput {
  vampId: string;
  clipId: string;
  start?: number | null;
  duration?: number | null;
  trackIndex?: number | null;
  trackId?: string | null;
}

/**
 * Vamp update input
 */
export interface VampUpdateInput {
  id: string;
  name?: string | null;
  bpm?: number | null;
  beatsPerBar?: number | null;
  metronomeSound?: string | null;
  allowedUsers?: string[] | null;
}

//==============================================================
// END Enums and Input Objects
//==============================================================
