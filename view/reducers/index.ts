import { combineReducers } from "redux";

import { workspace, WorkspaceType } from "./workspace";

// Notes on Redux:
//  - Important functions are getState, dispatch, and subscribe.
//  - For react-redux specifically, the connect function is most important.
//  - https://www.valentinog.com/blog/redux/

export interface StateType {
  workspace: WorkspaceType;
}

export default combineReducers({ workspace });
