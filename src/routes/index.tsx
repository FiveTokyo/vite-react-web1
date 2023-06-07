import { Navigate, RouteObject } from 'react-router-dom'

import { RouteConfig } from '@/components/Router/type'
import { lazy } from 'react'
import {
	BoldOutlined,
	WifiOutlined,
	ThunderboltOutlined,
	CalendarOutlined
} from '@ant-design/icons'
import { lazyLoad } from '@/components/Router/utils'

const routes: RouteConfig[] = [
	{
		path: '/*',
		element: lazyLoad(lazy(() => import('@/components/JMLayout'))),
		children: [
			{
				index: true,
				element: <Navigate to={'/parent/child1'} />
			},
			{
				path: 'parent',
				name: '仅在左边显示',
				icon: <BoldOutlined />,
				children: [
					{
						path: 'child1/:id/:name',
						name: '子组件1',
						keepAlive: true,
						element: lazyLoad(lazy(() => import('@/pages/parent/Child1')))
					},
					{
						path: 'child2',
						name: '子组件2',
						keepAlive: true,
						element: lazyLoad(lazy(() => import('@/pages/parent/Child2')))
					}
				]
			},
			{
				path: 'head',
				name: '仅在头部显示',
				icon: <ThunderboltOutlined />,
				children: [
					{
						path: 'head1',
						name: '头部1',
						element: <div>头部1</div>
					},
					{
						path: 'head2',
						name: '头部2',
						element: <div>头部2</div>
					}
				]
			},
			{
				path: 'leftAndHead',
				name: '左侧和头部都显示',
				icon: <WifiOutlined />,
				children: [
					{
						path: 'common1',
						name: '共有共有1',
						element: <div>共有共有1</div>,
						children: [
							{
								path: 'commo2n2',
								name: '共有共有1',
								element: <div style={{color: 'red'}}>共有1</div>
							},
							{
								path: 'commo2n21',
								name: '共有共有2',
								element: <div style={{color: 'red'}}>共有2</div>
							},
							{
								path: 'commo2n21asd',
								name: '共有共有2asdasdasd',
								element: <div style={{color: 'red'}}>共有2</div>
							},
							{
								path: 'commo2n2da1',
								name: '共有共有2asdasd',
								element: <div style={{color: 'red'}}>共有2</div>
							},
							{
								path: 'commsado2n21',
								name: '共有共有2asdasd',
								element: <div style={{color: 'red'}}>共有2</div>
							},
							{
								path: 'commdadso2n21',
								name: '共有共有2asdasda',
								element: <div style={{color: 'red'}}>共有2</div>
							},
							{
								path: 'commdswao2n21',
								name: '共有共有2sadsad',
								element: <div style={{color: 'red'}}>共有2</div>
							},
							
							{
								path: 'commo2sdasn21',
								name: '共有共有2sdasdasd',
								element: <div style={{color: 'red'}}>共有2</div>
							},
							{
								path: 'commo2xzn21',
								name: '共有共有2asdas',
								element: <div style={{color: 'red'}}>共有2</div>
							},
							{
								path: 'commo2vdn21',
								name: '共有共有2sadas',
								element: <div style={{color: 'red'}}>共有2</div>
							},
							{
								path: 'commo2adn21',
								name: '共有共有2a',
								element: <div style={{color: 'red'}}>共有2</div>
							},
							{
								path: 'commo2sadn21',
								name: '共有共有2sda',
								element: <div style={{color: 'red'}}>共有2</div>
							},
						]
					},
					{
						path: 'common2',
						name: '共有2',
						element: <div>共有2</div>
					}
				]
			},
			{
				path: 'analyse',
				name: '数据看板',
				icon: <CalendarOutlined />,
				children: [
					{
						path: 'sell',
						name: '销售数据',
						element: lazyLoad(lazy(() => import('@/pages/analyse/Sell')))
					},
					{
						path: 'user',
						name: '用户统计',
						element: lazyLoad(lazy(() => import('@/pages/analyse/User')))
					}
				]
			}
		]
	},
	{
		path: 'login',
		element: lazyLoad(lazy(() => import('@/pages/login')))
	},
	{
		path: '/403',
		element: <div className="tw-font-bold">无权限</div>
	},
	{ path: '*', element: lazyLoad(lazy(() => import('@/pages/notFound'))) }
]

//获取路由之前处理
export function getRoutesBefore(): RouteObject[] {
	return routes as RouteObject[]
}
export default routes
