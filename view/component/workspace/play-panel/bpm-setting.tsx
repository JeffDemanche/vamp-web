import * as React from "react";
import { gql, useQuery, useMutation } from "@apollo/client";
import { SettingNumeric } from "../../element/setting-numeric";
import { useCurrentVampId } from "../../../util/react-hooks";
import { BPMClient, UpdateBPM } from "../../../state/apollotypes";

const BPM_CLIENT = gql`
  query BPMClient($vampId: ID!) {
    # loadedVampId @client @export(as: "vampId")
    vamp(id: $vampId) @client {
      sections {
        id
        bpm
      }
      forms {
        preSection {
          id
        }
      }
    }
  }
`;

const UPDATE_BPM_MUTATION = gql`
  # See server typedefs for VampUpdateInput.
  mutation UpdateBPM($vampId: ID!, $formIndex: Int, $bpm: Int!) {
    updatePreSection(
      update: {
        vampId: $vampId
        formIndex: $formIndex
        sectionUpdate: { bpm: $bpm }
      }
    ) {
      # It's not really necessary to select anything here. For now the mutation
      # returns all the Vamp data, but we don't need it.
      bpm
    }
  }
`;

export const BPMSetting = (): JSX.Element => {
  const vampId = useCurrentVampId();
  const { data, loading, error } = useQuery<BPMClient>(BPM_CLIENT, {
    variables: { vampId }
  });
  const [
    updateBPM,
    { loading: updateLoading, error: updateError }
  ] = useMutation<UpdateBPM>(UPDATE_BPM_MUTATION);

  if (error) console.log(error);
  if (updateError) console.log(updateError);

  if (!data || loading || updateLoading) {
    return <div>Loading</div>;
  }

  const preSectionId = data.vamp.forms[0].preSection.id;
  const preSectionBPM = data.vamp.sections.find(
    section => section.id === preSectionId
  ).bpm;

  return (
    <SettingNumeric
      value={preSectionBPM}
      integer={true}
      minValue={1}
      maxValue={499}
      text="BPM"
      onChange={(payload: number): void => {
        updateBPM({ variables: { vampId, bpm: payload } });
      }}
    ></SettingNumeric>
  );
};
