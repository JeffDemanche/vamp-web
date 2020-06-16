import { User } from "./user-queries";
import { gql } from "apollo-boost";

/**
 *
 */

export interface Vamp {
  id: string;
  name?: string;
  bpm?: number;
  beatsPerBar?: number;
  metronomeSound?: string;
  creatorId?: User;
}

export const VAMP = gql`
  query GetVamp($id: ID!) {
    geVamp(id: $id) {
      id
    }
  }
`;
