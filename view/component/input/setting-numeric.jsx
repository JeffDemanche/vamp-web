import React, { useState } from 'react'
import PropTypes from 'prop-types'

import styles from './setting-numeric.less'

const SettingNumeric = ({ initValue, minValue, maxValue, text }) => {
  const [value, setValue] = useState(initValue)

  return (
    <div className={styles['setting-numeric']}>
      { value } { text }
    </div>
  )
}

SettingNumeric.propTypes = {
  initValue: PropTypes.number,
  minValue: PropTypes.number,
  maxValue: PropTypes.number,
  text: PropTypes.string
}

export { SettingNumeric }