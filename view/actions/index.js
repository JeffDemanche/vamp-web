import { ADD_CLIP } from '../constants/action-types'

export const addClip = (payload) => {
  return { type: ADD_CLIP, payload }
}