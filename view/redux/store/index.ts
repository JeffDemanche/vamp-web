import { createStore, combineReducers } from "redux";
import { workspace, WorkspaceType } from "../reducers/workspace";
import { user, UserType } from "../reducers/user";
import { client } from "../../component/vamp-app";

// Notes on Redux:
//  - Important functions are getState, dispatch, and subscribe.
//  - For react-redux specifically, the connect function is most important.
//  - https://www.valentinog.com/blog/redux/

export interface StateType {
  workspace: WorkspaceType;
  user: UserType;
}

const store = createStore(combineReducers({ workspace, user }));

export default store;
