import * as React from "react";
import { gql, useQuery, useMutation } from "@apollo/client";
import { SettingNumeric } from "../../element/setting-numeric";
import { useCurrentVampId } from "../../../util/react-hooks";
import {
  BeatsPerBarClient,
  UpdateBeatsPerBar
} from "../../../state/apollotypes";

const BEATS_PER_BAR_CLIENT = gql`
  query BeatsPerBarClient($vampId: ID!) {
    # loadedVampId @client @export(as: "vampId")
    vamp(id: $vampId) @client {
      sections {
        id
        beatsPerBar
      }
      forms {
        preSection {
          id
        }
      }
    }
  }
`;

const UPDATE_BEATS_PER_BAR = gql`
  mutation UpdateBeatsPerBar(
    $vampId: ID!
    $formIndex: Int
    $beatsPerBar: Int!
  ) {
    updatePreSection(
      update: {
        vampId: $vampId
        formIndex: $formIndex
        sectionUpdate: { beatsPerBar: $beatsPerBar }
      }
    ) {
      beatsPerBar
    }
  }
`;

export const BeatsPerBarSetting = (): JSX.Element => {
  const vampId = useCurrentVampId();
  const { data, loading, error } = useQuery<BeatsPerBarClient>(
    BEATS_PER_BAR_CLIENT,
    { variables: { vampId } }
  );
  const [
    updateBeatsPerBar,
    { loading: updateLoading, error: updateError }
  ] = useMutation<UpdateBeatsPerBar>(UPDATE_BEATS_PER_BAR);

  if (error) console.log(error);
  if (updateError) console.log(updateError);

  if (!data || loading || updateLoading) {
    return <div>Loading</div>;
  }

  const preSectionId = data.vamp.forms[0].preSection.id;
  const preSectionBeatsPerBar = data.vamp.sections.find(
    section => section.id === preSectionId
  ).beatsPerBar;

  return (
    <SettingNumeric
      value={preSectionBeatsPerBar}
      integer={true}
      minValue={1}
      maxValue={499}
      text="/ Bar"
      onChange={(payload: number): void => {
        updateBeatsPerBar({
          variables: { vampId, beatsPerBar: payload }
        });
      }}
    ></SettingNumeric>
  );
};
