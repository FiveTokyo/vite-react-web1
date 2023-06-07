// 路由守卫组件
import { Navigate, useLocation } from 'react-router-dom'
import routes from '@/routes'
import { searchRoute } from '../utils'
import { ReactElement, memo } from 'react'
import { getLocal } from '@/utils/storage'

export interface BeforeRouterProps {
	children: ReactElement | null
}

const BeforeRouter = (props: BeforeRouterProps) => {
	const { children } = props
	const { pathname } = useLocation()
	const route = searchRoute(pathname)
	const { access } = route

	// 判断是否登录
	if (!getLocal('token') && route.path !== 'login') {
		return <Navigate to="/login" replace />
	}

	// 判断是否有权限
	if (access && route.path !== '403') {
		return <Navigate to="/403" replace />
	}

	// 正常访问页面
	return children
}

export default memo(BeforeRouter)
