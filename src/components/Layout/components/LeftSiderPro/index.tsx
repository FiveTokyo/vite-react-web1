// 左侧菜单栏

import { Layout, Menu } from 'antd'
import { LeftOutlined, RightOutlined } from '@ant-design/icons'
import { MenuState } from '../..'
import { isFunction } from 'lodash-es'
import styles from './index.module.less'
import withRouter from '@/core/Router/withRouter'
import { useEffect, useMemo, useState } from 'react'
import routes from '@/routes'
import logo from '@/assets/img/logo.svg'
import { ItemType } from 'antd/lib/menu/hooks/useItems'
import { RouteConfig } from '@/core/Router/type'
import { useLocation } from 'react-router-dom'

const { Sider } = Layout

export interface BaseLeftSiderProProps {
	/* 收起后的宽度，默认80 */
	collapsedWidth?: number
	/* 侧边栏宽度，默认200 */
	siderWidth?: number
	/* 是否渲染侧边栏  默认为true */
}

export interface LeftSiderProProps extends BaseLeftSiderProProps {
	/* 修改菜单状态 */
	menuState: MenuState
	/* 修改菜单状态回调 */
	onMenuStateChange: (curState: MenuState) => void
}

function routesToMenu(routes: RouteConfig, path: string = '') {
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

const LeftSiderPro = withRouter<LeftSiderProProps>(props => {
	const {  siderWidth, menuState, onMenuStateChange } = props

	const location = useLocation()

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
		props.navigate(key)
		// console.log('onMenuChange:', keys)
	}

	return (
		<Sider
			className={styles.sider}
			collapsed={collapsed}
			trigger={null}
			// width={siderWidth}
			theme="dark"
		>
			<div className={styles.nav}>
				<img src={logo} alt="系统icon" />
				{!collapsed && <span>易招赢系统</span>}
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
})

export default LeftSiderPro
