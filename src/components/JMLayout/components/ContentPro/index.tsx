import { FC, memo, useState } from 'react'
import KeepAlive, { CacheEle, KeepAliveProps } from '@/components/Router/KeepAlive'
import { Content } from 'antd/es/layout/layout'
import HistoryTabPro from '../HistoryTabPro'
import styles from './index.module.less'
import { useOutlet, useRoutes } from 'react-router-dom'
import { Dropdown, Avatar, MenuProps } from 'antd'
import HeaderDropDown, { HeaderDropDownProps } from '../HeaderDropDown'
import { RouteConfig } from '@/components/Router/type'

export type ContentProProps = HeaderDropDownProps & {
	AliveMaxLength?: KeepAliveProps['AliveMaxLength']
	children: ReturnType<typeof useRoutes>
	routes: RouteConfig[]
}

const ContentPro: FC<ContentProProps> = props => {
	const { AliveMaxLength, children, routes, userName, dropDownItems } = props
	// 缓存的元素节点数组
	const [cacheEleList, setCacheEleList] = useState<CacheEle[]>([])
	return (
		<div className={styles.content}>
			<div className={styles.header}>
				<HistoryTabPro routes={routes} cacheEleList={cacheEleList} setCacheEleList={setCacheEleList} />
				<HeaderDropDown userName={userName} dropDownItems={dropDownItems}></HeaderDropDown>
			</div>
			<Content>
				<KeepAlive
					cacheEleList={cacheEleList}
					setCacheEleList={setCacheEleList}
					AliveMaxLength={AliveMaxLength}
				>
					{children}
				</KeepAlive>
			</Content>
		</div>
	)
}

export default memo(ContentPro)
