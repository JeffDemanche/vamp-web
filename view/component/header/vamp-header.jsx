import React from 'react'

import styles from './vamp-header.less'
import { VampLogo } from './vamp-logo'

const VampHeader = () => {
  return (
    <div className={styles['vamp-header']}>
      <VampLogo></VampLogo>
    </div>
  )
}

export { VampHeader }