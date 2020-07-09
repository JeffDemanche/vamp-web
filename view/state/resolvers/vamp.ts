import { AppResolvers } from "./resolvers";
import { InMemoryCache } from "apollo-boost";
import {
  LOCAL_VAMP_ID_CLIENT,
  PLAY_POSITION_START_TIME_CLIENT,
  PLAYING_CLIENT,
  TEMPORAL_ZOOM_CLIENT,
  VIEW_STATE_CLIENT,
  VIEW_LEFT_CLIENT
} from "../queries/vamp-queries";
import {
  LocalVampIdClient,
  PlayingClient,
  GetClientClipsClient,
  AddClientClip_addClientClip,
  GetClientClipsClient_vamp_clientClips,
  GetClipsServer,
  GetClipsServer_clips,
  ViewStateClient,
  GetClipsClient,
  GetClipsClient_vamp,
  ViewLeftClient
} from "../apollotypes";
import {
  GET_CLIENT_CLIPS_CLIENT,
  GET_CLIPS_SERVER,
  GET_CLIPS_CLIENT
} from "../queries/clips-queries";
import ObjectID from "bson-objectid";

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
    stop: (parent, args, { cache }: { cache: InMemoryCache }): boolean => {
      const { loadedVampId: vampId } = cache.readQuery<LocalVampIdClient>({
        query: LOCAL_VAMP_ID_CLIENT
      });
      cache.writeData({
        data: {
          vamp: {
            __typename: "Vamp",
            id: vampId,
            playing: false,
            recording: false,
            playPosition: 0,
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

    addClientClip: (
      parent,
      args,
      { cache }: { cache: InMemoryCache }
    ): AddClientClip_addClientClip => {
      const { loadedVampId: vampId } = cache.readQuery<LocalVampIdClient>({
        query: LOCAL_VAMP_ID_CLIENT
      });
      const clipsData = cache.readQuery<GetClientClipsClient>({
        query: GET_CLIENT_CLIPS_CLIENT,
        variables: { vampId }
      });
      const clientClipsCopy = [...clipsData.vamp.clientClips];
      const newClientClip: GetClientClipsClient_vamp_clientClips = {
        __typename: "ClientClip",
        id: ObjectID.generate(),
        start: args.start,
        tempFilename: args.localFilename,
        duration: -1,
        storedLocally: false
      };
      clientClipsCopy.push(newClientClip);
      cache.writeData({
        data: {
          vamp: { __typename: "Vamp", id: vampId, clientClips: clientClipsCopy }
        }
      });
      return newClientClip;
    },
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
        if (clientClip.tempFilename == args.tempFilename) {
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
