import LeftSiderPro from './components/LeftSiderPro'
import { memo, useEffect, useState } from 'react'
import { useLocation, useOutlet, useRoutes } from 'react-router-dom'

import { Layout } from 'antd'
import { layoutSettings } from '@/config/defaultSetting'
import routes from '@/routes'
import ContentPro from './components/ContentPro'


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

const LayoutPro = () => {

	const location = useLocation()
	const Outlet = useOutlet()

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
				menuState={menuState}
				onMenuStateChange={setMenuState}
			/>
			<ContentPro >
				{Outlet}
			</ContentPro>
		</Layout>
	)
}

export default memo(LayoutPro)
