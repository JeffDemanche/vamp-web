import { combineReducers } from "redux";

import { workspace, WorkspaceType } from "./workspace";
import { user, UserType } from "./user";

// Notes on Redux:
//  - Important functions are getState, dispatch, and subscribe.
//  - For react-redux specifically, the connect function is most important.
//  - https://www.valentinog.com/blog/redux/

export interface StateType {
  workspace: WorkspaceType;
  user: UserType;
}

export default combineReducers({ workspace, user });
