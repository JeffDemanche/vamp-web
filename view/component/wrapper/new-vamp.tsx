import * as React from "react";
import { useState } from "react";
import { gql } from "apollo-boost";
import { useMutation } from "react-apollo";
import { useHistory } from "react-router-dom";
import { vampURL } from "../../scripts/urls";

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

  const [redirect, setRedirect] = useState(false);

  const [addVamp, { data: newVampData }] = useMutation(ADD_VAMP);

  const history = useHistory();

  if (redirect && newVampData) {
    history.push(vampURL(newVampData.addVamp.id));
    setRedirect(false);
  }

  return (
    <div
      onClick={(): void => {
        addVamp({ variables: { creatorId: props.creatorId } });
        setRedirect(true);
      }}
    >
      {props.children}
    </div>
  );
};
