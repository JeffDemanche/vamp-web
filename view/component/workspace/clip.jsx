import React from 'react'

import { connect } from 'react-redux'
import { setPlaying } from '../../actions/index'

import styles from './clip.less'

const mapStateToProps = state => {
  return { playing: state.playing }
}

const mapDispatchToProps = dispatch => {
  return {
    setPlaying: playing => dispatch(setPlaying(playing))
  }
}

const handleClick = (playing, setPlaying) => {
  setPlaying(!playing)
}

const ConenctedClip = ({ playing, setPlaying }) => {
  console.log(playing)
  return (
    <div className={styles['clip']}
         onClick={(e) => { handleClick(playing, setPlaying) }}>
      <img src="../../img/vector/record.svg"/>
    </div>
  )
}

const Clip = connect(mapStateToProps, mapDispatchToProps)(ConenctedClip)

export { Clip }