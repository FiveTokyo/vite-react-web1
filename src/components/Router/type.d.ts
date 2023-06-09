import { RouteObject } from 'react-router-dom'
import { ReactNode } from 'react'
import { Items } from '../context/router'

export type Merge<T, U, X = Pick<U, Exclude<keyof U, keyof T & keyof U>>> = Pick<
	T & X,
	keyof T | keyof X
>
interface RouteExtension {
	/* 路由显示icon */
	icon?: ReactNode
	/* 在菜单中显示的名称,如果没有name则不在菜单中显示 */
	name?: string
	/* 权限相关 */
	notAccess?: boolean
	/* 是否要开启keep-alive, 默认是false */
	keepAlive?: boolean
	/* 是否在菜单栏显示，默认true */
	layout?: boolean
	key?: string
	//菜单隐藏
	hideInMenu?: boolean
	/* 扩展的children */
	children?: RouteConfig[]
	params?: { [key: string]: any }
}

export type RouteConfig = Merge<RouteExtension, RouteObject>

export type Routes = RouteConfig[]
export type AddItemArgs = {
	route: RouteConfig
	curPath: string
}
export type DeepSeparateArgs = {
	route: RouteConfig
	leftItems?: Items
	topItems?: Items
	parentPath: string
	routeAccess: Record<string, boolean>
}
