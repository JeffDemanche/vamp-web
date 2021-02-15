import { FloorInstance } from "../audio/floor/floor";

export const useFloor = (): typeof FloorInstance => {
  return FloorInstance;
};
