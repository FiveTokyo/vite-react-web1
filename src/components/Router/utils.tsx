// 路由表工具

import { AddItemArgs, DeepSeparateArgs, RouteConfig, Routes } from './type'
import { ItemType, SubMenuType } from 'antd/lib/menu/hooks/useItems'
import { LazyExoticComponent, ReactNode, Suspense } from 'react'
import { cloneDeep, isObject } from 'lodash-es'

import { Link, matchPath, useMatch, useParams } from 'react-router-dom'
import { ProcessLoading } from '@/components/Loading'
import { removeAllPendingRequestsRecord } from '@/api/request'
import routes from '@/routes'

// 过滤路由配置权限
// export function filterRoutesAccess(routes: Routes, checkFn: (access: string) => boolean) {
// 	const _deep = (list: Routes) => {
// 		for (let i = 0; i < list.length; i++) {
// 			const curRoute = list[i]
// 			const { access, children } = curRoute

// 			const isNext = children?.length

// 			if (!access) {
// 				isNext && _deep(children)
// 				continue
// 			}

// 			if (checkFn(access)) {
// 				isNext && _deep(children)
// 			} else {
// 				list.splice(i, 1)
// 				i--
// 			}
// 		}
// 	}

// 	_deep(routes)
// }

/**
 * @description 路由懒加载
 * @param {Element} Com 需要访问的组件
 * @returns element
 */
export const lazyLoad = (Com: LazyExoticComponent<any>): ReactNode => {
	//跳转页面时取消上一个页面未完成的请求
	removeAllPendingRequestsRecord()
	return (
		<Suspense fallback={<ProcessLoading />}>
			<Com />
		</Suspense>
	)
}

/**
 * @description 递归查询对应的路由
 * @param {String} path 当前访问地址
 * @param {Array} routers 路由列表
 * @returns RouteConfig
 */
export const searchRoute = (
	pathname: string,
	routers: RouteConfig | RouteConfig[] = routes
): RouteConfig => {
	//处理动态路由
	const _deep = (routes: (RouteConfig | RouteConfig[] ), name = '') => {
		let result: RouteConfig = {}
		const _routes = Array.isArray(routes) ? routes : routes.children as RouteConfig[]
		for (let i = 0; i < _routes.length; i++) {
			const item = _routes[i]
			const prev = name + '/'
			if (
				matchPath({ path: prev + item.path, end: true, caseSensitive: false }, pathname)
			)
				return { ...item, key: prev + item.path }
			if (item.children?.length) {
				const res = _deep(item.children, prev + item.path)
				if (Object.keys(res).length) result = res
			}
		}
		return result
	}
	return _deep(routers || [])
}
