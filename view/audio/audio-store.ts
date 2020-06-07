/**
 * Downloaded audio needs to be stored in memory somehwere. There doesn't seem
 * to be much support for doing that in Apollo or Redux, so we're doing it here.
 */

import { ApolloClient, gql } from "apollo-boost";

interface StoredAudio {
  data: ArrayBuffer;
}

class AudioStore {
  private _store: { [audioId: string]: StoredAudio };

  constructor() {
    this._store = {};
  }

  async cacheClipAudio(
    clip: {
      id: string;
      audio: {
        id: string;
        filename: string;
        storedLocally: boolean;
      };
    },
    apolloClient: ApolloClient<object>
  ): Promise<void> {
    if (!clip.audio.storedLocally) {
      const res = await fetch(`/audio?filename=${clip.audio.id}.webm`);
      const buffer = await res.arrayBuffer();
      const blob = new Blob([buffer]);
      const audio = document.createElement("audio");
      audio.src = window.URL.createObjectURL(blob);
      audio.currentTime = 7 * 24 * 60 * 1000;
      audio.onseeked = (): void => {
        audio.onseeked = undefined;

        const currentClips = apolloClient.readQuery({
          query: gql`
            query GetClips {
              clips @client {
                id @client
                audio @client {
                  id @client
                  filename @client
                  storedLocally @client
                  duration @client
                }
              }
            }
          `
        });
        const newClips = [...currentClips.clips];
        newClips.forEach((c, index) => {
          if (c.id === clip.id) {
            newClips[index].audio.storedLocally = true;
            newClips[index].audio.duration = audio.duration;
          }
        });
        console.log(newClips);
        apolloClient.writeData({
          data: { clips: newClips }
        });
        this._store[clip.audio.id] = { data: buffer };
      };
    }
  }
}

export default AudioStore;
