/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: ContentAudioSchedulerAdapterQuery
// ====================================================

export interface ContentAudioSchedulerAdapterQuery_vamp_clips_content_audio {
  __typename: "Audio";
  id: string;
}

export interface ContentAudioSchedulerAdapterQuery_vamp_clips_content {
  __typename: "ContentInClip";
  id: string;
  type: ClipContentType;
  start: number;
  duration: number;
  offset: number | null;
  audio: ContentAudioSchedulerAdapterQuery_vamp_clips_content_audio | null;
}

export interface ContentAudioSchedulerAdapterQuery_vamp_clips {
  __typename: "Clip";
  id: string;
  start: number;
  duration: number;
  content: ContentAudioSchedulerAdapterQuery_vamp_clips_content[];
}

export interface ContentAudioSchedulerAdapterQuery_vamp {
  __typename: "Vamp";
  id: string;
  clips: ContentAudioSchedulerAdapterQuery_vamp_clips[];
}

export interface ContentAudioSchedulerAdapterQuery {
  vamp: ContentAudioSchedulerAdapterQuery_vamp | null;
}

export interface ContentAudioSchedulerAdapterQueryVariables {
  vampId: string;
}

/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL mutation operation: EmptyVampAdapterUpdateCab
// ====================================================

export interface EmptyVampAdapterUpdateCab_updateUserInVamp {
  __typename: "UserInVamp";
  id: string;
}

export interface EmptyVampAdapterUpdateCab {
  updateUserInVamp: EmptyVampAdapterUpdateCab_updateUserInVamp;
}

export interface EmptyVampAdapterUpdateCabVariables {
  userId: string;
  vampId: string;
  start?: number | null;
  duration?: number | null;
}

/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: SeekAdapterQuery
// ====================================================

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
// GraphQL mutation operation: UpdateCabNewRecordingMutation
// ====================================================

export interface UpdateCabNewRecordingMutation_updateUserInVamp {
  __typename: "UserInVamp";
  id: string;
}

export interface UpdateCabNewRecordingMutation {
  updateUserInVamp: UpdateCabNewRecordingMutation_updateUserInVamp;
}

export interface UpdateCabNewRecordingMutationVariables {
  userId: string;
  vampId: string;
  start?: number | null;
  duration?: number | null;
}

/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL mutation operation: AddClipNewRecordingMutation
// ====================================================

export interface AddClipNewRecordingMutation_addClip {
  __typename: "Clip";
  id: string;
}

export interface AddClipNewRecordingMutation {
  /**
   * Adds a clip and puts the new clip in the Vamp specfied.
   */
  addClip: AddClipNewRecordingMutation_addClip;
}

export interface AddClipNewRecordingMutationVariables {
  userId: string;
  vampId: string;
  file: any;
  recordingProgram: RecordingProgramInput;
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
  storedLocally: boolean;
  duration: number;
}

export interface WorkspaceAudioClient_vamp_clips_content {
  __typename: "ContentInClip";
  id: string;
  type: ClipContentType;
  start: number;
  duration: number;
  offset: number | null;
  audio: WorkspaceAudioClient_vamp_clips_content_audio | null;
}

export interface WorkspaceAudioClient_vamp_clips {
  __typename: "Clip";
  id: string;
  start: number;
  duration: number;
  content: WorkspaceAudioClient_vamp_clips_content[];
}

export interface WorkspaceAudioClient_vamp {
  __typename: "Vamp";
  id: string;
  bpm: number;
  beatsPerBar: number;
  metronomeSound: string;
  clips: WorkspaceAudioClient_vamp_clips[];
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

export interface CabMainQuery_userInVamp_user {
  __typename: "User";
  id: string;
}

export interface CabMainQuery_userInVamp_vamp {
  __typename: "Vamp";
  id: string;
}

export interface CabMainQuery_userInVamp_cab_user {
  __typename: "User";
  id: string;
}

export interface CabMainQuery_userInVamp_cab {
  __typename: "Cab";
  user: CabMainQuery_userInVamp_cab_user;
  start: number;
  duration: number;
  mode: CabMode;
}

export interface CabMainQuery_userInVamp {
  __typename: "UserInVamp";
  user: CabMainQuery_userInVamp_user;
  vamp: CabMainQuery_userInVamp_vamp;
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

export interface UpdateCab_updateUserInVamp_user {
  __typename: "User";
  id: string;
}

export interface UpdateCab_updateUserInVamp_vamp {
  __typename: "Vamp";
  id: string;
}

export interface UpdateCab_updateUserInVamp_cab {
  __typename: "Cab";
  start: number;
  duration: number;
  mode: CabMode;
}

export interface UpdateCab_updateUserInVamp {
  __typename: "UserInVamp";
  user: UpdateCab_updateUserInVamp_user;
  vamp: UpdateCab_updateUserInVamp_vamp;
  cab: UpdateCab_updateUserInVamp_cab;
}

export interface UpdateCab {
  updateUserInVamp: UpdateCab_updateUserInVamp;
}

export interface UpdateCabVariables {
  userId: string;
  vampId: string;
  start?: number | null;
  duration?: number | null;
  mode?: CabMode | null;
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
// GraphQL query operation: PlaybackProviderQuery
// ====================================================

export interface PlaybackProviderQuery_userInVamp_cab {
  __typename: "Cab";
  start: number;
  duration: number;
  mode: CabMode;
}

export interface PlaybackProviderQuery_userInVamp {
  __typename: "UserInVamp";
  id: string;
  cab: PlaybackProviderQuery_userInVamp_cab;
}

export interface PlaybackProviderQuery {
  /**
   * Tries to find a UserInVamp, or adds one if not found.
   */
  userInVamp: PlaybackProviderQuery_userInVamp;
}

export interface PlaybackProviderQueryVariables {
  vampId: string;
  userId: string;
}

/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: RecordingProviderQuery
// ====================================================

export interface RecordingProviderQuery_vamp_clips {
  __typename: "Clip";
  id: string;
  recordingId: string | null;
}

export interface RecordingProviderQuery_vamp {
  __typename: "Vamp";
  clips: RecordingProviderQuery_vamp_clips[];
}

export interface RecordingProviderQuery_userInVamp_cab {
  __typename: "Cab";
  mode: CabMode;
  start: number;
  duration: number;
}

export interface RecordingProviderQuery_userInVamp_prefs {
  __typename: "UserInVampPrefs";
  latencyCompensation: number;
}

export interface RecordingProviderQuery_userInVamp {
  __typename: "UserInVamp";
  id: string;
  cab: RecordingProviderQuery_userInVamp_cab;
  prefs: RecordingProviderQuery_userInVamp_prefs;
}

export interface RecordingProviderQuery {
  vamp: RecordingProviderQuery_vamp | null;
  /**
   * Tries to find a UserInVamp, or adds one if not found.
   */
  userInVamp: RecordingProviderQuery_userInVamp;
}

export interface RecordingProviderQueryVariables {
  userId: string;
  vampId: string;
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
// GraphQL query operation: UseCabLoops
// ====================================================

export interface UseCabLoops_userInVamp_cab {
  __typename: "Cab";
  mode: CabMode;
}

export interface UseCabLoops_userInVamp {
  __typename: "UserInVamp";
  cab: UseCabLoops_userInVamp_cab;
}

export interface UseCabLoops {
  /**
   * Tries to find a UserInVamp, or adds one if not found.
   */
  userInVamp: UseCabLoops_userInVamp;
}

export interface UseCabLoopsVariables {
  vampId: string;
  userId: string;
}

/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: UseIsEmpty
// ====================================================

export interface UseIsEmpty_vamp_clips {
  __typename: "Clip";
  id: string;
}

export interface UseIsEmpty_vamp {
  __typename: "Vamp";
  clips: UseIsEmpty_vamp_clips[];
}

export interface UseIsEmpty {
  vamp: UseIsEmpty_vamp | null;
}

export interface UseIsEmptyVariables {
  vampId: string;
}

/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: BeatsPerBarClient
// ====================================================

export interface BeatsPerBarClient_vamp_sections {
  __typename: "Section";
  id: string;
  beatsPerBar: number;
}

export interface BeatsPerBarClient_vamp_forms_preSection {
  __typename: "Section";
  id: string;
}

export interface BeatsPerBarClient_vamp_forms {
  __typename: "Form";
  preSection: BeatsPerBarClient_vamp_forms_preSection;
}

export interface BeatsPerBarClient_vamp {
  __typename: "Vamp";
  sections: BeatsPerBarClient_vamp_sections[];
  forms: BeatsPerBarClient_vamp_forms[];
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

export interface UpdateBeatsPerBar_updatePreSection {
  __typename: "Section";
  beatsPerBar: number;
}

export interface UpdateBeatsPerBar {
  /**
   * Updates the preSection of the form. If there aren't any
   *     insertedSections, this is equivalent to updating the section properties for
   *     the entire Vamp.
   */
  updatePreSection: UpdateBeatsPerBar_updatePreSection;
}

export interface UpdateBeatsPerBarVariables {
  vampId: string;
  formIndex?: number | null;
  beatsPerBar: number;
}

/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: BPMClient
// ====================================================

export interface BPMClient_vamp_sections {
  __typename: "Section";
  id: string;
  bpm: number;
}

export interface BPMClient_vamp_forms_preSection {
  __typename: "Section";
  id: string;
}

export interface BPMClient_vamp_forms {
  __typename: "Form";
  preSection: BPMClient_vamp_forms_preSection;
}

export interface BPMClient_vamp {
  __typename: "Vamp";
  sections: BPMClient_vamp_sections[];
  forms: BPMClient_vamp_forms[];
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

export interface UpdateBPM_updatePreSection {
  __typename: "Section";
  bpm: number;
}

export interface UpdateBPM {
  /**
   * Updates the preSection of the form. If there aren't any
   *     insertedSections, this is equivalent to updating the section properties for
   *     the entire Vamp.
   */
  updatePreSection: UpdateBPM_updatePreSection;
}

export interface UpdateBPMVariables {
  vampId: string;
  formIndex?: number | null;
  bpm: number;
}

/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: MetronomeSoundClient
// ====================================================

export interface MetronomeSoundClient_vamp_sections {
  __typename: "Section";
  id: string;
  metronomeSound: string;
}

export interface MetronomeSoundClient_vamp_forms_preSection {
  __typename: "Section";
  id: string;
}

export interface MetronomeSoundClient_vamp_forms {
  __typename: "Form";
  preSection: MetronomeSoundClient_vamp_forms_preSection;
}

export interface MetronomeSoundClient_vamp {
  __typename: "Vamp";
  sections: MetronomeSoundClient_vamp_sections[];
  forms: MetronomeSoundClient_vamp_forms[];
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

export interface UpdateMetronomeSound_updatePreSection {
  __typename: "Section";
  metronomeSound: string;
}

export interface UpdateMetronomeSound {
  /**
   * Updates the preSection of the form. If there aren't any
   *     insertedSections, this is equivalent to updating the section properties for
   *     the entire Vamp.
   */
  updatePreSection: UpdateMetronomeSound_updatePreSection;
}

export interface UpdateMetronomeSoundVariables {
  vampId: string;
  formIndex?: number | null;
  metronomeSound: string;
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
// GraphQL query operation: MetronomeBarClient
// ====================================================

export interface MetronomeBarClient_vamp {
  __typename: "Vamp";
  bpm: number;
  beatsPerBar: number;
  metronomeSound: string;
}

export interface MetronomeBarClient {
  vamp: MetronomeBarClient_vamp | null;
}

export interface MetronomeBarClientVariables {
  vampId: string;
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
  duration: number;
  error: string | null;
}

export interface TimelineClient_vamp_clips_content {
  __typename: "ContentInClip";
  start: number;
  duration: number;
  offset: number | null;
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
  mode: CabMode;
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
  mode: CabMode;
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
  offset: number | null;
  audio: GetVamp_vamp_clips_content_audio | null;
}

export interface GetVamp_vamp_clips {
  __typename: "Clip";
  id: string;
  recordingId: string | null;
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
  /**
   * Is the floor open in the workspace or not.
   */
  floorOpen: boolean | null;
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
  offset: number | null;
  audio: VampSubscription_subVamp_vampPayload_clips_content_audio | null;
}

export interface VampSubscription_subVamp_vampPayload_clips {
  __typename: "Clip";
  id: string;
  recordingId: string | null;
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
  /**
   * Is the floor open in the workspace or not.
   */
  floorOpen: boolean | null;
}

export interface VampSubscription_subVamp {
  __typename: "VampSubscriptionOutput";
  vampPayload: VampSubscription_subVamp_vampPayload;
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

export interface ViewBoundsDataClient_vamp {
  __typename: "Vamp";
  id: string;
  clips: ViewBoundsDataClient_vamp_clips[];
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
// GraphQL query operation: UseSnapToBeatClient
// ====================================================

export interface UseSnapToBeatClient_vamp {
  __typename: "Vamp";
  bpm: number;
  beatsPerBar: number;
  metronomeSound: string;
}

export interface UseSnapToBeatClient {
  vamp: UseSnapToBeatClient_vamp | null;
}

export interface UseSnapToBeatClientVariables {
  vampId: string;
}

/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

//==============================================================
// START Enums and Input Objects
//==============================================================

/**
 * How the cab handles looping logic
 */
export enum CabMode {
  INFINITE = "INFINITE",
  STACK = "STACK",
  TELESCOPE = "TELESCOPE",
}

/**
 * The type of content contained in a clip
 */
export enum ClipContentType {
  AUDIO = "AUDIO",
}

export interface RecordingProgramInput {
  recordingId?: string | null;
  recordingStart: number;
  recordingDuration: number;
  cabStart: number;
  cabDuration?: number | null;
  cabMode: CabMode;
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
