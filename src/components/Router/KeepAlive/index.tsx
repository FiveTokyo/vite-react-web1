// keep-alive实现
import routes from '@/routes'
import {
	Dispatch,
	JSXElementConstructor,
	ReactElement,
	RefObject,
	useEffect,
	useMemo,
	useRef,
	useState
} from 'react'

import { createPortal } from 'react-dom'
import { useLocation } from 'react-router-dom'
import { searchRoute } from '../utils'

export interface CacheEle {
	key: string
	ele: ReactElement<any, string | JSXElementConstructor<any>> | null
}

interface AdditionalProps {
	children: ReactElement<any, string | JSXElementConstructor<any>> | null
	AliveMaxLength?: number
	cacheEleList: CacheEle[]
	setCacheEleList: Dispatch<React.SetStateAction<CacheEle[]>>
}

export type KeepAliveProps =  AdditionalProps

function KeepAlive(props: KeepAliveProps) {
	const { children, AliveMaxLength = 10 } = props
	const { pathname } = useLocation()

	// 缓存的元素节点数组
	const [internalCacheEleList, setInternalCacheEleList] = useState<CacheEle[]>([])

	// keepAlive容器
	const keepAliveContainer = useRef<HTMLDivElement>(null)
	// 是否受控
	const cacheEleList = 'cacheEleList' in props ? props.cacheEleList : internalCacheEleList
	const setCacheEleList =
		'setCacheEleList' in props ? props.setCacheEleList : setInternalCacheEleList

	const isNonKeepAlive = useMemo(() => {
		const { keepAlive } = searchRoute(pathname)
		return !keepAlive
	}, [pathname])

	useEffect(() => {
		if (!children || isNonKeepAlive) return

		setCacheEleList(cacheList => {
			const nextCacheList = [...cacheList]
			// 如果超出限制，删除第一个
			if (cacheList.length >= AliveMaxLength) {
				nextCacheList.shift()
			}

			const isPush = nextCacheList.findIndex(item => item.key === pathname) === -1

			// 添加新的元素
			isPush &&
				nextCacheList.push({
					key: pathname,
					ele: children
				})
			return nextCacheList
		})
	}, [children, AliveMaxLength])

	return (
		<>
			{/* 此路由无需保持keepalive */}
			{isNonKeepAlive && children}
			<div ref={keepAliveContainer}></div>
			{/* 渲染当前的所有缓存元素 */}
			{cacheEleList.map(item => (
				<Component
					key={item.key}
					active={item.key === pathname}
					container={keepAliveContainer}
				>
					{item.ele}
				</Component>
			))}
		</>
	)
}

// 渲染组件
interface ComponentProps {
	active: boolean
	container: RefObject<HTMLDivElement>
	children: ReactElement<any, string | JSXElementConstructor<any>> | null
}
function Component(props: ComponentProps) {
	const [targetElement] = useState(() => document.createElement('div'))
	const { container, active, children } = props

	useEffect(() => {
		active
			? container.current?.appendChild(targetElement)
			: (targetElement.parentNode && container.current?.removeChild(targetElement)) //有的会没有父元素开发环境保存就会报错添加个是否有父元素的判断
	}, [active, targetElement])

	return <>{createPortal(children, targetElement)}</>
}

export default KeepAlive
