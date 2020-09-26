import { AppResolvers } from "./resolvers";
import { InMemoryCache } from "apollo-boost";
import {
  LOCAL_VAMP_ID_CLIENT,
  PLAY_POSITION_START_TIME_CLIENT,
  PLAYING_CLIENT,
  TEMPORAL_ZOOM_CLIENT,
  VIEW_LEFT_CLIENT
} from "../queries/vamp-queries";
import {
  LocalVampIdClient,
  PlayingClient,
  GetClientClipsClient,
  GetClientClipsClient_vamp_clientClips,
  GetClipsServer,
  GetClipsServer_clips,
  ViewStateClient,
  ViewLeftClient,
  CabClient,
  MeClient,
  BeginClientClip_beginClientClip
} from "../apollotypes";
import {
  GET_CLIENT_CLIPS_CLIENT,
  GET_CLIPS_SERVER
} from "../queries/clips-queries";
import ObjectID from "bson-objectid";
import { CAB_CLIENT } from "../queries/user-in-vamp-queries";
import { ME_CLIENT } from "../queries/user-queries";

const defaults = {
  Vamp: {
    playing: false,
    playPosition: 0,
    playStartTime: 0,
    start: 0,
    end: 0,
    loop: true,
    recording: false,
    viewState: {
      __typename: "ViewState",

      /**
       * Hundred pixels per second.
       */
      temporalZoom: 1,
      viewLeft: 0
    }
  }
};

const resolvers: Partial<AppResolvers> = {
  Vamp: {
    // Default resolvers.
    playing: (): boolean => defaults.Vamp.playing,
    playPosition: (): number => defaults.Vamp.playPosition,
    playStartTime: (): number => defaults.Vamp.playStartTime,
    start: (): number => defaults.Vamp.start,
    end: (): number => defaults.Vamp.end,
    loop: (): boolean => defaults.Vamp.loop,
    recording: (): boolean => defaults.Vamp.recording,
    viewState: (): typeof defaults.Vamp.viewState => defaults.Vamp.viewState,
    clientClips: () => []
  },

  Query: {
    empty: (parent, args, { cache }: { cache: InMemoryCache }): boolean => {
      const data: {
        clips: GetClipsServer_clips[];
      } = cache.readQuery<GetClipsServer>({ query: GET_CLIPS_SERVER });
      return data.clips.length == 0;
    }
  },

  Mutation: {
    play: (parent, args, { cache }: { cache: InMemoryCache }): boolean => {
      const { loadedVampId: vampId } = cache.readQuery<LocalVampIdClient>({
        query: LOCAL_VAMP_ID_CLIENT
      });
      cache.writeData({
        data: {
          vamp: {
            __typename: "Vamp",
            id: vampId,
            playing: true,
            playStartTime: Date.now()
          }
        }
      });
      return true;
    },
    pause: (parent, args, { cache }: { cache: InMemoryCache }): boolean => {
      const { loadedVampId: vampId } = cache.readQuery<LocalVampIdClient>({
        query: LOCAL_VAMP_ID_CLIENT
      });
      const data: {
        playPosition: number;
        playStartTime: number;
      } = cache.readQuery({
        query: PLAY_POSITION_START_TIME_CLIENT,
        variables: { vampId }
      });
      cache.writeData({
        data: {
          vamp: {
            __typename: "Vamp",
            id: vampId,
            playing: false,
            recording: false,
            playPosition:
              data.playPosition + (Date.now() - data.playStartTime) / 1000,
            playStartTime: -1
          }
        }
      });
      return true;
    },
    seek: (parent, args, { cache }: { cache: InMemoryCache }): boolean => {
      const { loadedVampId: vampId } = cache.readQuery<LocalVampIdClient>({
        query: LOCAL_VAMP_ID_CLIENT
      });
      const data: {
        vamp: {
          playing: boolean;
        };
      } = cache.readQuery<PlayingClient>({
        query: PLAYING_CLIENT,
        variables: { vampId }
      });
      cache.writeData({
        data: {
          vamp: {
            __typename: "Vamp",
            id: vampId,
            recording: false,
            playPosition: args.time,
            playStartTime: data.vamp.playing ? Date.now() : -1
          }
        }
      });
      return true;
    },
    setLoop: (parent, args, { cache }: { cache: InMemoryCache }): boolean => {
      const { loadedVampId: vampId } = cache.readQuery<LocalVampIdClient>({
        query: LOCAL_VAMP_ID_CLIENT
      });
      cache.writeData({
        data: {
          vamp: {
            __typename: "Vamp",
            id: vampId,
            loop: args.loop
          }
        }
      });
      return true;
    },
    stop: (parent, args, { cache }: { cache: InMemoryCache }): boolean => {
      const { loadedVampId: vampId } = cache.readQuery<LocalVampIdClient>({
        query: LOCAL_VAMP_ID_CLIENT
      });
      const { me } = cache.readQuery<MeClient>({
        query: ME_CLIENT
      });
      const {
        userInVamp: { cab }
      } = cache.readQuery<CabClient>({
        query: CAB_CLIENT,
        variables: { vampId, userId: me.id }
      });
      // TODO Right now this will seek to the cab position.
      cache.writeData({
        data: {
          vamp: {
            __typename: "Vamp",
            id: vampId,
            playing: false,
            recording: false,
            playPosition: cab.start,
            playStartTime: -1
          }
        }
      });
      return true;
    },
    record: (parent, args, { cache }: { cache: InMemoryCache }): boolean => {
      const { loadedVampId: vampId } = cache.readQuery<LocalVampIdClient>({
        query: LOCAL_VAMP_ID_CLIENT
      });
      cache.writeData({
        data: {
          vamp: {
            __typename: "Vamp",
            id: vampId,
            playing: true,
            recording: true,
            playStartTime: Date.now()
          }
        }
      });
      return true;
    },
    setTemporalZoom: (
      parent,
      args,
      { cache }: { cache: InMemoryCache }
    ): boolean => {
      const { loadedVampId: vampId } = cache.readQuery<LocalVampIdClient>({
        query: LOCAL_VAMP_ID_CLIENT
      });
      const {
        vamp: {
          viewState: { temporalZoom }
        }
      } = cache.readQuery<ViewStateClient>({
        query: TEMPORAL_ZOOM_CLIENT,
        variables: { vampId }
      });

      const newTemporalZoom = args.cumulative
        ? temporalZoom * args.temporalZoom
        : args.temporalZoom;
      const clampedZoom = newTemporalZoom > 0.05 ? newTemporalZoom : 0.05;

      cache.writeData({
        data: {
          vamp: {
            __typename: "Vamp",
            id: vampId,
            viewState: {
              __typename: "ViewState",
              temporalZoom: clampedZoom
            }
          }
        }
      });
      return true;
    },
    setViewLeft: (
      parent,
      args,
      { cache }: { cache: InMemoryCache }
    ): boolean => {
      const { loadedVampId: vampId } = cache.readQuery<LocalVampIdClient>({
        query: LOCAL_VAMP_ID_CLIENT
      });
      const {
        vamp: {
          viewState: { viewLeft }
        }
      } = cache.readQuery<ViewLeftClient>({
        query: VIEW_LEFT_CLIENT,
        variables: { vampId }
      });

      const newViewLeft = args.cumulative
        ? viewLeft + args.viewLeft
        : args.viewLeft;

      cache.writeData({
        data: {
          vamp: {
            __typename: "Vamp",
            id: vampId,
            viewState: { __typename: "ViewState", viewLeft: newViewLeft }
          }
        }
      });
      return true;
    },

    /**
     * Adds a new client clip to the store after recording begins. At this
     * state, the realClipId is null, meaning that a "real clip" doesn't exist
     * yet, and inProgress is true, meaning the client clip is currently being
     * recorded.
     */
    beginClientClip: (
      parent,
      args,
      { cache }: { cache: InMemoryCache }
    ): BeginClientClip_beginClientClip => {
      const { loadedVampId: vampId } = cache.readQuery<LocalVampIdClient>({
        query: LOCAL_VAMP_ID_CLIENT
      });
      const clientClipsData = cache.readQuery<GetClientClipsClient>({
        query: GET_CLIENT_CLIPS_CLIENT,
        variables: { vampId }
      });
      const clientClipsCopy = [...clientClipsData.vamp.clientClips];
      const newClientClip: GetClientClipsClient_vamp_clientClips = {
        __typename: "ClientClip",
        id: ObjectID.generate(),
        audioStoreKey: args.audioStoreKey,
        realClipId: null,
        start: args.start,
        duration: -1,
        inProgress: true
      };
      clientClipsCopy.push(newClientClip);
      cache.writeData({
        data: {
          vamp: { __typename: "Vamp", id: vampId, clientClips: clientClipsCopy }
        }
      });
      return newClientClip;
    },
    /**
     * Called when recording ends, sets a client clip's inProgress property to
     * false, signifying that it's not being recorded.
     */
    endClientClip: (
      parent,
      args,
      { cache }: { cache: InMemoryCache }
    ): boolean => {
      const { loadedVampId: vampId } = cache.readQuery<LocalVampIdClient>({
        query: LOCAL_VAMP_ID_CLIENT
      });
      const clientClipsData = cache.readQuery<GetClientClipsClient>({
        query: GET_CLIENT_CLIPS_CLIENT,
        variables: { vampId }
      });
      const clientClipsCopy: GetClientClipsClient_vamp_clientClips[] = [];
      clientClipsData.vamp.clientClips.forEach(clientClip => {
        if (clientClip.audioStoreKey == args.audioStoreKey) {
          clientClip.inProgress = false;
        }
        clientClipsCopy.push(clientClip);
      });
      cache.writeData({
        data: {
          vamp: { __typename: "Vamp", id: vampId, clientClips: clientClipsCopy }
        }
      });
      return true;
    },
    /**
     * Sets the realClipId property on a client clip, signifying that a "real
     * clip" has been recieved and is ready for playback. The ID of that real
     * clip is the value of realClipId.
     */
    handOffClientClip: (
      parent,
      args,
      { cache }: { cache: InMemoryCache }
    ): boolean => {
      const { loadedVampId: vampId } = cache.readQuery<LocalVampIdClient>({
        query: LOCAL_VAMP_ID_CLIENT
      });
      const clipsData = cache.readQuery<GetClientClipsClient>({
        query: GET_CLIENT_CLIPS_CLIENT,
        variables: { vampId }
      });
      const clientClipsCopy: GetClientClipsClient_vamp_clientClips[] = [];
      clipsData.vamp.clientClips.forEach(clientClip => {
        if (clientClip.audioStoreKey == args.audioStoreKey) {
          clientClipsCopy.push({ ...clientClip, realClipId: args.realClipId });
        } else {
          clientClipsCopy.push(clientClip);
        }
      });
      cache.writeData({
        data: {
          vamp: { __typename: "Vamp", id: vampId, clientClips: clientClipsCopy }
        }
      });
      return true;
    },
    /**
     * Called to remove a client clip from the cache.
     */
    removeClientClip: (
      parent,
      args,
      { cache }: { cache: InMemoryCache }
    ): boolean => {
      const { loadedVampId: vampId } = cache.readQuery<LocalVampIdClient>({
        query: LOCAL_VAMP_ID_CLIENT
      });
      let removed = false;
      const clipsData = cache.readQuery<GetClientClipsClient>({
        query: GET_CLIENT_CLIPS_CLIENT,
        variables: { vampId }
      });
      const clientClipsCopy: GetClientClipsClient_vamp_clientClips[] = [];
      clipsData.vamp.clientClips.forEach(clientClip => {
        if (clientClip.audioStoreKey == args.audioStoreKey) {
          removed = true;
        } else {
          clientClipsCopy.push(clientClip);
        }
      });
      cache.writeData({
        data: {
          vamp: { __typename: "Vamp", id: vampId, clientClips: clientClipsCopy }
        }
      });
      return removed;
    }
  }
};

export default resolvers;
