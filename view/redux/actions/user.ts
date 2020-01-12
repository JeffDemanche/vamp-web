import { USER } from "../action-types";
import { User } from "../reducers/user";

export interface LoginUserAction {
  type: typeof USER.LOGIN_USER;
  payload: User;
}

export interface LogoutUserAction {
  type: typeof USER.LOGOUT_USER;
  payload: null;
}

export const loginUser = (payload: User) => {
  return { type: USER.LOGIN_USER, payload };
};

export const logoutUser = (payload: null) => {
  return { type: USER.LOGOUT_USER, payload };
};

export type UserActionTypes = LoginUserAction | LogoutUserAction;
