import { AppResolvers } from "./resolvers";
import { InMemoryCache } from "apollo-boost";
import { LOCAL_VAMP_ID_CLIENT } from "../queries/vamp-queries";
import { LocalVampIdClient, GetClipsClient } from "../apollotypes";
import { GET_CLIPS_CLIENT } from "../queries/clips-queries";

const defaults = {
  Clip: {
    draggingInfo: {
      __typename: "ClipDraggingInfo",
      dragging: false,
      track: null as string,
      position: null as number
    }
  }
};

const resolvers: Partial<AppResolvers> = {
  Clip: {
    // Default resolvers
    draggingInfo: () => defaults.Clip.draggingInfo
  },

  Mutation: {
    setClipDraggingInfo: (
      parent,
      args,
      { cache }: { cache: InMemoryCache }
    ): boolean => {
      const { loadedVampId: vampId } = cache.readQuery<LocalVampIdClient>({
        query: LOCAL_VAMP_ID_CLIENT
      });
      const clipsData = cache.readQuery<GetClipsClient>({
        query: GET_CLIPS_CLIENT,
        variables: { vampId }
      });

      const info = args.info;

      let foundClip = false;
      const newClips = clipsData.vamp.clips.map(clip => {
        if (clip.id === args.clipId) {
          foundClip = true;
          return {
            ...clip,
            draggingInfo: {
              __typename: "ClipDraggingInfo",
              dragging:
                info.dragging !== undefined
                  ? info.dragging
                  : clip.draggingInfo.dragging,
              track:
                info.track !== undefined ? info.track : clip.draggingInfo.track,
              position:
                info.position !== undefined
                  ? info.position
                  : clip.draggingInfo.position
            }
          };
        }
        return clip;
      });
      cache.writeData({
        data: { vamp: { __typename: "Vamp", id: vampId, clips: newClips } }
      });
      return foundClip;
    }

    /**
     * Marks the clip as being dragged client-side so we can avoid redrawing it.
     */
    // setClipDragging: (
    //   parent,
    //   args,
    //   { cache }: { cache: InMemoryCache }
    // ): boolean => {
    //   const { loadedVampId: vampId } = cache.readQuery<LocalVampIdClient>({
    //     query: LOCAL_VAMP_ID_CLIENT
    //   });
    //   const clipsData = cache.readQuery<GetClipsClient>({
    //     query: GET_CLIPS_CLIENT,
    //     variables: { vampId }
    //   });
    //   let foundClip = false;
    //   const newClips = clipsData.vamp.clips.map(clip => {
    //     if (clip.id === args.clipId) {
    //       foundClip = true;
    //       return {
    //         ...clip,
    //         dragging: args.dragging,
    //         // Assign this to null for free when we stop dragging (drop, in
    //         // other words).
    //         draggingTrack: args.dragging ? clip.draggingTrack : null
    //       };
    //     }
    //     return clip;
    //   });
    //   cache.writeData({
    //     data: { vamp: { __typename: "Vamp", id: vampId, clips: newClips } }
    //   });
    //   return foundClip;
    // },
    // /**
    //  * Marks the track that this clip is being dragged over if it is currently
    //  * being dragged.
    //  */
    // setClipDraggingTrack: (
    //   parent,
    //   args,
    //   { cache }: { cache: InMemoryCache }
    // ): boolean => {
    //   const { loadedVampId: vampId } = cache.readQuery<LocalVampIdClient>({
    //     query: LOCAL_VAMP_ID_CLIENT
    //   });
    //   const clipsData = cache.readQuery<GetClipsClient>({
    //     query: GET_CLIPS_CLIENT,
    //     variables: { vampId }
    //   });
    //   let foundClip = false;
    //   const newClips = clipsData.vamp.clips.map(clip => {
    //     if (clip.id === args.clipId) {
    //       foundClip = true;
    //       return {
    //         ...clip,
    //         draggingTrack: args.trackId
    //       };
    //     }
    //     return clip;
    //   });
    //   cache.writeData({
    //     data: { vamp: { __typename: "Vamp", id: vampId, clips: newClips } }
    //   });
    //   return foundClip;
    // }
  }
};

export default resolvers;
