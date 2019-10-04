import { ADD_CLIP } from '../constants/action-types'

const initialState = {
  clips: []
}

// Notes on Redux:
//  - Important functions are getState, dispatch, and subscribe.
//  - For react-redux specifically, the connect function is most important.
//  - https://www.valentinog.com/blog/redux/

// This can be split into multiple reducers (see "comineReducers").
const rootReducer = (state = initialState, action) => {
  if (action.type === ADD_CLIP) {
    return Object.assign({}, state, {
      clips: state.clips.concat(action.payload)
    })
  }
  return state
}

export default rootReducer