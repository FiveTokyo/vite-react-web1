import LeftSiderPro, { BaseLeftSiderProProps } from './components/LeftSiderPro'
import { useEffect, useState } from 'react'
import { useLocation, useOutlet, useRoutes } from 'react-router-dom'

import { Layout } from 'antd'
import { layoutSettings } from '@/config/core'
import routes from '@/routes'
import ContentPro from './components/ContentPro'
import withRouter from '../../core/Router/withRouter'

export interface LayoutProProps extends BaseLeftSiderProProps {
	/* 默认是否收起 */
	defaultCollapsed?: boolean
	/* 是否开启足迹标签  默认为true */
	isTabs?: boolean
	/* keepalive最大缓存数量 */
	maxLength?: number
}

export type MenuState = {
	selectedKeys: string[]
	openKeys: string[]
}

// 获取openKeys
function getOpenKeys(location: ReturnType<typeof useLocation>) {
	const { pathname } = location
	const pathList = pathname?.split('/') || []
	const keys = []
	while (pathList.pop()) {
		const prePath = pathList.join('/')
		prePath && keys.push(prePath)
	}
	return keys
}

const LayoutPro = withRouter(props => {
	const {
		siderWidth = 200,
		defaultCollapsed = false,
		isTabs = true,
		maxLength
	} = layoutSettings || props

	const { location } = props
	const layoutRoutes = routes.find(item => item.path === '/*')?.children || []
	const Outlet = useOutlet()
	console.log(Outlet)

	const [menuState, setMenuState] = useState<MenuState>({
		openKeys: [],
		selectedKeys: []
	})

	useEffect(() => {
		setMenuState(prev => {
			const next = {
				openKeys: [...prev.openKeys, ...getOpenKeys(location)],
				selectedKeys: [location.pathname]
			}
			return next
		})
	}, [location.pathname])

	return (
		<Layout style={{ height: '100vh', width: '100vw', position: 'fixed' }}>
			<LeftSiderPro
				siderWidth={siderWidth}
				menuState={menuState}
				onMenuStateChange={setMenuState}
			/>
			<ContentPro maxLength={maxLength} isTabs={isTabs}>
				{Outlet}
			</ContentPro>
		</Layout>
	)
})

export default LayoutPro
