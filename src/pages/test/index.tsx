/**
 * @author tokyo
 * @date 2023-04-22 17:21
 * @since 0.0.0
 */

import { FC, useState, useEffect } from 'react'
import { useAsyncEffect } from 'ahooks'
// import classnames from 'classnames'
import styles from './style.module.less'

export interface TestProps {
    [key: string]: any
}

const Test: FC<TestProps> = (props) => {
	  useAsyncEffect(async () => {

	  },[])
    return (
        <div className={styles.pages}>
        Test
        </div>
    )
}

export default Test
