import React from 'react'

import { Clip } from './clip'
import { PlayPanel } from './play-panel'

import styles from './view-workspace.less'

const ViewWorkspace = () => {
  return (
    <div className={styles['workspace']}>
      <div className={styles['play-and-tracks']}>
        <div className={styles['play-panel']}>
          <PlayPanel></PlayPanel>
        </div>
        <div className={styles['clips-panel']}>
          <Clip></Clip>
        </div>
      </div>
    </div>
  )
}

export { ViewWorkspace }