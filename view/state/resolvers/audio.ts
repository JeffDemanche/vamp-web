import { AppResolvers } from "./resolvers";

const defaults = {
  Audio: {
    localFilename: "",
    storedLocally: false,
    duration: -1
  }
};

const resolvers: Partial<AppResolvers> = {
  Audio: {
    localFilename: (): string => defaults.Audio.localFilename,
    storedLocally: (): boolean => defaults.Audio.storedLocally,
    duration: (): number => defaults.Audio.duration
  }
};

export default resolvers;
