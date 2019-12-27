import { combineReducers } from "redux";

import { exclusive, ExclusiveType } from "./exclusive";
import { shared, SharedType } from "./shared";

export interface WorkspaceType {
  exclusive: ExclusiveType;
  shared: SharedType;
}

export const workspace = combineReducers({
  exclusive,
  shared
});
