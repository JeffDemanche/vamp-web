import { SET_PLAYING } from '../constants/action-types'
import { SHARED } from '../constants/action-types'

const initialState = {
  playing: false,
  shared: {
    timeSettings: {
      bpm: 120,
      beatsPerBar: 4,
      metronomeSound: "Hi-Hat"
    }
  }
}

// Notes on Redux:
//  - Important functions are getState, dispatch, and subscribe.
//  - For react-redux specifically, the connect function is most important.
//  - https://www.valentinog.com/blog/redux/

// This can be split into multiple reducers (see "comineReducers").
const rootReducer = (state = initialState, action) => {
  switch(action.type) {
    case SET_PLAYING:
      return {
        ...state,
        playing: action.payload
      }
    case SHARED.SET_BPM:
      return {
        ...state,
        shared: {
          ...state.shared,
          timeSettings: {
            ...state.shared.timeSettings,
            bpm: action.payload
          }
        }
      }
  }
  return state
}

export default rootReducer