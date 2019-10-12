import React from 'react'

import { connect } from 'react-redux'

import styles from './track-settings.less'

const mapStateToProps = state => {
  return {}
}

const mapDispatchToProps = dispatch => {
  return {}
}

const ConnectedTrackSettings = () => {
  return (
    <div className={styles['track-settings']}>
      <p>120 BPM</p>
      <p>4 / Bar</p>
      <p>Hi-Hat</p>
    </div>
  )
}

const TrackSettings = connect(mapStateToProps, mapDispatchToProps)(ConnectedTrackSettings)

export { TrackSettings }