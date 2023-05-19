// 左侧菜单栏

import { Layout, Menu } from 'antd'
import { LeftOutlined, RightOutlined } from '@ant-design/icons'
import { MenuState } from '../..'
import { isFunction } from 'lodash-es'
import styles from './index.module.less'
import withRouter from '@/components/Router/withRouter'
import { memo, useEffect, useMemo, useState } from 'react'
import routes from '@/routes'
import logo from '@/assets/img/logo.svg'
import { ItemType } from 'antd/lib/menu/hooks/useItems'
import { RouteConfig } from '@/components/Router/type'
import { useLocation, useNavigate } from 'react-router-dom'
import { layoutSettings } from '@/config/defaultSetting'

const { Sider } = Layout


export interface LeftSiderProProps {
	/* 修改菜单状态 */
	menuState: MenuState
	/* 修改菜单状态回调 */
	onMenuStateChange: (curState: MenuState) => void
}

function routesToMenu(routes: any, path: string = '') {
	let result = routes!.children
		.filter((route: RouteConfig) => route.hasOwnProperty('name'))!
		.map((route: RouteConfig) => {
			const newPath = path + '/' + route.path
			return {
				key: newPath,
				label: route.name,
				icon: route.icon,
				children: route.children && routesToMenu(route, newPath)
			}
		}) as ItemType[]
	return result
}

const LeftSiderPro = (props: LeftSiderProProps) => {
	const {  menuState, onMenuStateChange } = props

	const location = useLocation()
	const navigate = useNavigate()
	const [collapsed, setCollapsed] = useState(false)

	useEffect(() => {}, [location.pathname])

	const menuItems: ItemType[] = useMemo(() => {
		const manageRoutes = routes.find(r => r.path === '/*') as RouteConfig
		const result = routesToMenu(manageRoutes)
		return result
	}, [routes])

	function onOpenChange(openKeys: string[]) {
		onMenuStateChange({ ...menuState, openKeys })
	}

	function onMenuClick({ key }: { key: string }) {
		navigate(key)
		// console.log('onMenuChange:', keys)
	}
	return (
		<Sider
			className={styles.sider}
			collapsed={collapsed}
			trigger={null}
			theme="dark"
		>
			<div className={styles.nav}>
				<img src={layoutSettings.logo} alt="系统icon" />
				{!collapsed && <span>{layoutSettings.title}</span>}
			</div>
			<Menu
				mode="inline"
				items={menuItems}
				theme="dark"
				className={styles['menu-border-none']}
				selectedKeys={menuState.selectedKeys}
				onClick={onMenuClick}
				openKeys={menuState.openKeys}
				onOpenChange={onOpenChange}
			/>
			<div className={styles.collapsed} onClick={() => setCollapsed(!collapsed)}>
				{collapsed ? (
					<RightOutlined className={styles.btn} />
				) : (
					<LeftOutlined className={styles.btn} />
				)}
			</div>
		</Sider>
	)
}

export default memo(LeftSiderPro)
