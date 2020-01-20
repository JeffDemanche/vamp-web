import { UserActionTypes } from "../actions/user";
import { USER } from "../action-types";

const intialUserState: UserType = null;

/**
 * A user is the object that defines the logged-in user.
 */
export interface User {
  username: string;
  email: string;
}

/**
 * UserType defines the Redux state of this reducer, which contains a user, who
 * is currently logged in.
 */
export interface UserType {
  user: User;
}

export const user = (
  state = intialUserState,
  action: UserActionTypes
): UserType => {
  switch (action.type) {
    case USER.LOGIN_USER:
      return { user: action.payload, ...state };
    case USER.LOGOUT_USER:
      return { user: action.payload, ...state };
    default:
      return state;
  }
};
