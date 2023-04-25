// 路由显示容器

import { FC, useEffect, useState } from 'react'
import { Route, Routes as RoutesCom } from 'react-router-dom'

import { Routes } from '../type'
import { getItems } from '../utils'
import routes from '@/routes'

const initState = {
	leftItems: [],
	topItems: [],
	routeAccess: {}
}

export type RouteContainerProps = {
	routes: Routes
	routeAccess: Record<string, boolean>
}

const RouterView: FC<any> = () => {
	// const element = useRoutes(routes)
	const [routeState, setRouteState] = useState<any>()

	useEffect(() => {
		if (!routes.length) {
			return
		}
		const layoutReoutes =
			routes.find(route => route.path === '/*' || route.path === '/')?.children || []
		// 获取菜单需要显示的items
		const o = getItems(layoutReoutes, {})
		setRouteState(o)
	}, [routes])

	return (
		<RoutesCom>
			{routes.map(route => (
				<Route key={route.path} path={route.path} element={route.element} />
			))}
		</RoutesCom>
	)
}

export default RouterView
