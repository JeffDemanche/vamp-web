import React from 'react'
import { connect } from 'react-redux'

import styles from './play-stop-button.less'

const mapStateToProps = state => {
  return { playing: state.playing }
}

const ConnectedPlayStopButton = ({ playing }) => {
  const image = playing ? require('../../../img/vector/stop.svg')
                        : require('../../../img/vector/play.svg')
  return (
    <div className={styles['play-stop-button']}>
      <img src={image}/>
    </div>
  )
}

const PlayStopButton = connect(mapStateToProps)(ConnectedPlayStopButton)

export { PlayStopButton }