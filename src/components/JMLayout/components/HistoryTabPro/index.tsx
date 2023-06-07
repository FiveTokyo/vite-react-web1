// 浏览足迹页签
import { Dispatch, cloneElement, memo, useEffect, useMemo, useState } from 'react'
import { Dropdown, Tabs, TabsProps } from 'antd'
import { CloseOutlined } from '@ant-design/icons'
import { cloneDeep } from 'lodash-es'
import { CacheEle } from '@/components/Router/KeepAlive'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { searchRoute } from '@/components/Router/utils'
import { CSS } from '@dnd-kit/utilities'
import { css } from '@emotion/css'
import classNames from 'classnames'
import styles from './index.module.less'
import { DndContext, DragEndEvent, PointerSensor, useSensor } from '@dnd-kit/core'
import {
	SortableContext,
	arrayMove,
	horizontalListSortingStrategy,
	useSortable
} from '@dnd-kit/sortable'

type OperationType = 'RELOAD' | 'CLOSE' | 'CLOSE_LEFT' | 'CLOSE_RIGHT' | 'CLOSE_OTHER'

type GetArrayValue<T> = T extends (infer P)[] ? P : never

type Item = GetArrayValue<Required<TabsProps>['items']>

interface DraggableTabPaneProps extends React.HTMLAttributes<HTMLDivElement> {
	'data-node-key': string
	onActiveBarTransform: (className: string) => void
}

export const DraggableTabNode = ({
	className,
	onActiveBarTransform,
	...props
}: DraggableTabPaneProps) => {
	const { attributes, listeners, setNodeRef, transform, transition, isSorting } =
		useSortable({
			id: props['data-node-key']
		})

	const style: React.CSSProperties = {
		...props.style,
		transform: CSS.Transform.toString(transform),
		transition,
		cursor: 'move'
	}

	useEffect(() => {
		if (!isSorting) {
			onActiveBarTransform('')
		} else if (className?.includes('ant-tabs-tab-active')) {
			onActiveBarTransform(
				css`
					.ant-tabs-ink-bar {
						transform: ${CSS.Transform.toString(transform)};
						transition: ${transition} !important;
					}
				`
			)
		}
	}, [className, isSorting, transform])

	return cloneElement(props.children as React.ReactElement, {
		ref: setNodeRef,
		style,
		...attributes,
		...listeners
	})
}
export interface HistoryTabProProps {
	cacheEleList: CacheEle[]
	setCacheEleList: Dispatch<React.SetStateAction<CacheEle[]>>
}

const HistoryTabPro = (props: HistoryTabProProps) => {
	const { cacheEleList, setCacheEleList } = props
	const location = useLocation()
	const navigate = useNavigate()
	const params = useParams()
	const { pathname } = location

	const [activeKey, setActiveKey] = useState(pathname)
	const [items, setItems] = useState<Item[]>([])
	const [pos, setPos] = useState<Item>()

	const [dropdownKey, setDropdownKey] = useState<string>('')

	const [className, setClassName] = useState('')

	const sensor = useSensor(PointerSensor, { activationConstraint: { distance: 10 } })

	useEffect(() => {
		// 判断是否添加
		const param = { ...params }
		delete param['*']
		const idx = items.findIndex(item => item.key === pathname)
		if (idx === -1) {
			const route = searchRoute(pathname)
			const { name, element } = route
			if (!name || !element) return
			const o = {
				key: pathname,
				label: name
			}
			const paramKeys = Object.keys(param)
			if (paramKeys.length > 0) {
				o.label = o.label + '-' + param[paramKeys[paramKeys.length - 1]]
			}
			const _items = [...items, o]
			setItems(_items)
		}
		setActiveKey(pathname)
	}, [pathname, params])

	const onChange = (newActiveKey: string) => {
		pos && setPos(undefined)
		setActiveKey(newActiveKey)
		navigate(newActiveKey)
	}

	const onDragEnd = ({ active, over }: DragEndEvent) => {
		if (active.id !== over?.id) {
			setItems(prev => {
				const activeIndex = prev.findIndex(i => i.key === active.id)
				const overIndex = prev.findIndex(i => i.key === over?.id)
				return arrayMove(prev, activeIndex, overIndex)
			})
		}
	}

	const remove = (targetKey: string) => {
		let newActiveKey = activeKey
		let lastIndex = -1
		items.forEach((item, i) => {
			if (item.key === targetKey) {
				lastIndex = i - 1
			}
		})
		const newPanes = items.filter(item => item.key !== targetKey)
		if (newPanes.length && newActiveKey === targetKey) {
			newActiveKey = lastIndex >= 0 ? newPanes[lastIndex].key : newPanes[0].key
		}
		setItems(newPanes)
		setActiveKey(newActiveKey)
		navigate(newActiveKey)
		// 删除缓存的dom
	}

	const OPERATION_MAP = new Map([
		[
			'RELOAD',
			() => {
				const newList = [...cacheEleList]
				const idx = newList.findIndex(cache => cache.key === pathname)
				if (~idx) {
					const tem = cloneDeep(newList[idx])
					newList[idx] = tem
					setCacheEleList(newList)
				} else {
					navigate('/')
					setTimeout(() => navigate(pathname), 0)
				}
			}
		],
		[
			'CLOSE',
			() => {
				// 删除此tab
				remove(pos!.key)
				// 清除缓存
				const newList = [...cacheEleList]
				const idx = newList.findIndex(cache => cache.key === pos!.key)
				newList.splice(idx, 1)
				setCacheEleList(newList)
			}
		],
		[
			'CLOSE_LEFT',
			() => {
				const _items = [...items]
				const idx = _items.findIndex(item => item.key === pos!.key)
				const newItems = _items.slice(idx)
				// 清除缓存
				const newList = [...cacheEleList].filter(cache =>
					newItems.find(item => item.key === cache.key)
				)
				if (!newItems.find(i => i.key === pathname)) {
					onChange(newItems[0].key)
					setActiveKey(newItems[0].key)
				}
				setItems(newItems)
				setCacheEleList(newList)
			}
		],
		[
			'CLOSE_RIGHT',
			() => {
				const _items = [...items]
				const idx = _items.findIndex(item => item.key === pos!.key)
				const newItems = _items.slice(0, idx + 1)
				// 清除缓存
				const newList = [...cacheEleList].filter(cache =>
					newItems.find(item => item.key === cache.key)
				)
				if (!newItems.find(i => i.key === pathname)) {
					onChange(newItems[newItems.length - 1].key)
				}
				setItems(newItems)
				setCacheEleList(newList)
			}
		],
		[
			'CLOSE_OTHER',
			() => {
				const _items = [...items]
				const idx = _items.findIndex(item => item.key === pathname)
				const newItems = [_items[idx]]
				// 清除缓存
				const cache = [...cacheEleList].find(cache => cache.key === pathname)
				setItems(newItems)
				setCacheEleList(cache ? [cache] : [])
			}
		]
	])

	// 是否可以关闭此卡片
	const disabledClose = items.length > 1
	// 是否禁用关闭左侧
	const disabledCloseLeft = items[0]?.key === pos?.key || items.length === 1
	// 是否禁用关闭右侧
	const disabledCloseRight = items.at(-1)?.key === pos?.key
	// 是否禁用关闭其他
	const disabledCloseOther = items.length <= 1

	const dropdownMenus = useMemo(() => {
		return [
			{
				key: 'CLOSE_LEFT',
				label: '关闭左侧',
				disabled: disabledCloseLeft
			},
			{
				key: 'CLOSE_RIGHT',
				label: '关闭右侧',
				disabled: disabledCloseRight
			},
			{
				key: 'CLOSE_OTHER',
				label: '关闭其他',
				disabled: disabledCloseOther
			},
			{
				label: '添加为常用菜单',
				key: 'fixed'
			},
			{
				key: 'RELOAD',
				label: '刷新',
				disabled: pos?.key !== pathname
			}
		]
	}, [pos, pathname, items])

	const historyTabs = useMemo(() => {
		return items.map(item => {
			const content = (
				<div
					className={classNames(styles.item, item.key === activeKey && styles.checked)}
					onClick={() => item.key !== pathname && onChange(item.key)}
				>
					<div>{item.label}</div>
					{disabledClose && (
						<CloseOutlined
							className={styles.closeIcon}
							onClick={e => {
								e.stopPropagation()
								remove(item.key)
							}}
						/>
					)}
				</div>
			)
			return {
				...item,
				label:
					dropdownKey === item.key ? (
						<Dropdown
							trigger={['contextMenu']}
							menu={{
								items: dropdownMenus,
								onClick: ({ key }) => {
									OPERATION_MAP.get(key as OperationType)?.()
								}
							}}
							onOpenChange={() => {
								setPos(item)
								setDropdownKey(item.key)
							}}
							placement="bottom"
						>
							{content}
						</Dropdown>
					) : (
						{ content }
					)
			}
		})
	}, [items, activeKey, dropdownMenus, dropdownKey])

	return (
		<div className={styles.tabsPro}>
			<Tabs
				className={`${className} ${styles.headerMenuTabs}`}
				items={historyTabs}
				tabBarGutter={0}
				tabBarStyle={{ height: '100%' }}
				renderTabBar={(tabBarProps, DefaultTabBar) => (
					<DndContext sensors={[sensor]} onDragEnd={onDragEnd}>
						<SortableContext
							items={items.map(i => i.key)}
							strategy={horizontalListSortingStrategy}
						>
							<DefaultTabBar {...tabBarProps}>
								{node => (
									<DraggableTabNode
										{...node.props}
										key={node.key}
										onActiveBarTransform={setClassName}
									>
										{node}
									</DraggableTabNode>
								)}
							</DefaultTabBar>
						</SortableContext>
					</DndContext>
				)}
			/>
		</div>
	)
}

export default memo(HistoryTabPro)
