import * as React from "react";
import { gql, useMutation } from "@apollo/client";
import { vampURL } from "../../scripts/urls";
import { useNavigate } from "react-router-dom";

interface NewVampPropsType {
  creatorId: string;
  children?: JSX.Element;
}

export const NewVamp = (props: NewVampPropsType): JSX.Element => {
  const ADD_VAMP = gql`
    mutation AddVamp($creatorId: ID!) {
      addVamp(creatorId: $creatorId) {
        id
      }
    }
  `;

  const [addVamp] = useMutation(ADD_VAMP);

  const navigate = useNavigate();

  return (
    <div
      onClick={(): void => {
        addVamp({ variables: { creatorId: props.creatorId } }).then(result => {
          navigate(vampURL(result.data.addVamp.id));
        });
      }}
    >
      {props.children}
    </div>
  );
};
