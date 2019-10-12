import React from 'react'

import { PlayStopButton } from './play-controls/play-stop-button'

import styles from './play-panel.less'

const PlayPanel = () => {
  return (
    <div className={styles['play-panel']}>
      <PlayStopButton></PlayStopButton>
    </div>
  )
}

export { PlayPanel }