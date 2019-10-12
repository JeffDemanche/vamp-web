import { SET_PLAYING } from '../constants/action-types'

export const setPlaying = (payload) => {
  return { type: SET_PLAYING, payload }
}