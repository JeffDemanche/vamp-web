import React from 'react'

import styles from './vamp-app.less'
import { VampHeader } from './header/vamp-header' 
import { ViewWorkspace } from './workspace/view-workspace'

const VampApp = () => {
  // ViewWorkspace should be able to be changed.
  return (
    <div className={styles['vamp-app']}>
      <VampHeader></VampHeader>
      <ViewWorkspace></ViewWorkspace>
    </div>
  );
}

export { VampApp }