import { FC, useState } from 'react'
import KeepAlive, { CacheEle, KeepAliveProps } from '@/components/Router/KeepAlive'
import { Content } from 'antd/es/layout/layout'
import HistoryTabPro from '../HistoryTabPro'
import styles from './index.module.less'
import { useOutlet, useRoutes } from 'react-router-dom'
import { Dropdown, Avatar, MenuProps } from 'antd'
import HeaderDropDown from '../HeaderDropDown'

export interface ContentProProps {
	isTabs?: boolean
	maxLength?: KeepAliveProps['maxLength']
	children: ReturnType<typeof useRoutes>
}

const ContentPro: FC<ContentProProps> = props => {
	const { maxLength, children } = props
	// 缓存的元素节点数组
	const [cacheEleList, setCacheEleList] = useState<CacheEle[]>([])

	return (
		<div className={styles.content}>
			<div className={styles.header}>
				<HistoryTabPro cacheEleList={cacheEleList} setCacheEleList={setCacheEleList} />
				<HeaderDropDown></HeaderDropDown>
			</div>
			<Content>
				<KeepAlive
					cacheEleList={cacheEleList}
					setCacheEleList={setCacheEleList}
					maxLength={maxLength}
				>
					{children}
				</KeepAlive>
			</Content>
		</div>
	)
}

export default ContentPro
