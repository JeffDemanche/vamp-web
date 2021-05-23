import * as React from "react";
import { gql, useQuery, useMutation } from "@apollo/client";
import { SettingSelect } from "../../element/setting-select";
import { useCurrentVampId } from "../../../util/react-hooks";
import {
  MetronomeSoundClient,
  UpdateMetronomeSound
} from "../../../state/apollotypes";

const METRONOME_SOUND_CLIENT = gql`
  query MetronomeSoundClient($vampId: ID!) {
    # loadedVampId @client @export(as: "vampId")
    vamp(id: $vampId) @client {
      sections {
        id
        metronomeSound
      }
      forms {
        preSection {
          id
        }
      }
    }
  }
`;

const UPDATE_METRONOME_SOUND = gql`
  mutation UpdateMetronomeSound(
    $vampId: ID!
    $formIndex: Int
    $metronomeSound: String!
  ) {
    updatePreSection(
      update: {
        vampId: $vampId
        formIndex: $formIndex
        sectionUpdate: { metronomeSound: $metronomeSound }
      }
    ) {
      metronomeSound
    }
  }
`;

export const MetronomeSetting = (): JSX.Element => {
  const vampId = useCurrentVampId();
  const { data, loading, error } = useQuery<MetronomeSoundClient>(
    METRONOME_SOUND_CLIENT,
    { variables: { vampId } }
  );
  const [
    updateMetronomeSound,
    { loading: updateLoading, error: updateError }
  ] = useMutation<UpdateMetronomeSound>(UPDATE_METRONOME_SOUND);

  if (error) console.log(error);
  if (updateError) console.log(updateError);

  if (!data || loading || updateLoading) {
    return <div>Loading</div>;
  }

  const preSectionId = data.vamp.forms[0].preSection.id;
  const preSectionMetronomeSound = data.vamp.sections.find(
    section => section.id === preSectionId
  ).metronomeSound;

  return (
    <SettingSelect
      value={preSectionMetronomeSound}
      options={[
        { index: 1, value: "Hi-Hat" },
        { index: 2, value: "Beep" }
      ]}
      onChange={(payload: string): void => {
        updateMetronomeSound({
          variables: { vampId, metronomeSound: payload }
        });
      }}
    ></SettingSelect>
  );
};
