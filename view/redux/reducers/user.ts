import { USER } from "../action-types";
import { Reducer } from "redux";

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

export const user: Reducer<UserType> = (state = intialUserState, action) => {
  switch (action.type) {
    case USER.LOGIN_USER:
      return { ...state, user: action.payload };
    case USER.LOGOUT_USER:
      return { ...state, user: action.payload };
    default:
      return state;
  }
};
