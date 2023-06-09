// 左侧菜单栏

import { Layout, Menu } from 'antd'
import { LeftOutlined, RightOutlined } from '@ant-design/icons'
import styles from './index.module.less'
import { memo, useEffect, useMemo, useState } from 'react'
import { ItemType } from 'antd/lib/menu/hooks/useItems'
import { RouteConfig } from '@/components/Router/type'
import { useLocation, useNavigate } from 'react-router-dom'
import { isEqual, uniq } from 'lodash-es'
import { searchRoute } from '@/components/Router/utils'

const { Sider } = Layout

export interface LeftSiderProProps {
	routes: RouteConfig[]
	siderWidth?: number
	logo?: string
	title?: string
}

function routesToMenu(routes: RouteConfig[], path: string = '') {
	if (!routes) return []
	let result = routes
		.filter(
			(route: RouteConfig) =>
				route.hasOwnProperty('path') && !route.hideInMenu && !route.notAccess
		)!
		.map((route: RouteConfig) => {
			const newPath = path + '/' + route.path
			return {
				key: newPath,
				label: route.name,
				icon: route.icon,
				children: route.children && routesToMenu(route.children, newPath)
			}
		}) as ItemType[]
	return result
}

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
const LeftSiderPro = (props: LeftSiderProProps) => {
	const { routes, siderWidth, logo, title } = props
	const location = useLocation()
	const [openKeys, setOpenKeys] = useState<string[]>([])
	const [selectedKeys, setSelectedKeys] = useState<string[]>([])
	useEffect(() => {
		if (selectedKeys?.[0] || selectedKeys[0] !== location.pathname) {
			const item = searchRoute(location.pathname, routes)
			item && !item.hideInMenu && setSelectedKeys([item.key as string])
		}
		const newOpenKeys = uniq([...openKeys, ...getOpenKeys(location)])
		if (!isEqual([...newOpenKeys], [...openKeys])) {
			setOpenKeys(newOpenKeys)
		}
	}, [location.pathname, routes])

	const navigate = useNavigate()
	const [collapsed, setCollapsed] = useState(false)

	const menuItems: ItemType[] = useMemo(() => {
		const result = routesToMenu(routes)
		return result
	}, [routes])

	function onOpenChange(openKeys: string[]) {
		setOpenKeys(openKeys)
	}

	function onMenuClick({ key }: { key: string }) {
		setSelectedKeys([key])
		navigate(key)
	}

	return (
		<Sider
			className={styles.sider}
			collapsed={collapsed}
			trigger={null}
			width={siderWidth}
			theme="dark"
		>
			<div className={styles.nav}>
				<img src={logo} alt="系统icon" />
				{!collapsed && <span>{title}</span>}
			</div>
			<Menu
				mode="inline"
				className={styles['menu-border-none']}
				items={menuItems}
				theme="dark"
				selectedKeys={selectedKeys}
				onClick={onMenuClick}
				openKeys={openKeys}
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
