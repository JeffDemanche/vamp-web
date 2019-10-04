import React from 'react'

import { Clip } from './clip'

import styles from './view-workspace.less'

const ViewWorkspace = () => {
  return (
    <div className={styles['workspace']}>
      <div className={styles['play-and-tracks']}>
        <div className={styles['play-panel']}>
          
        </div>
        <div className={styles['clips-panel']}>
          <Clip></Clip>
        </div>
      </div>
    </div>
  )
}

export { ViewWorkspace }