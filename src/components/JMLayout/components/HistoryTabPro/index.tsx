// 浏览足迹页签
import { Dispatch, memo, useEffect, useMemo, useState } from 'react'
import { Dropdown, Tabs, TabsProps } from 'antd'
import { CloseOutlined, PushpinOutlined } from '@ant-design/icons'
import { cloneDeep } from 'lodash-es'
import { CacheEle } from '@/components/Router/KeepAlive'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { searchRoute } from '@/components/Router/utils'
import classNames from 'classnames'
import styles from './index.module.less'
import { DndContext, DragEndEvent, PointerSensor, useSensor } from '@dnd-kit/core'
import {
	SortableContext,
	arrayMove,
	horizontalListSortingStrategy
} from '@dnd-kit/sortable'
import DraggableTabNode from '@/components/DraggableTabNode'
import { RouteConfig } from '@/components/Router/type'
import { getLocal, setLocal } from '@/utils/storage'

type OperationType = 'RELOAD' | 'CLOSE' | 'CLOSE_LEFT' | 'CLOSE_RIGHT' | 'CLOSE_OTHER'

type GetArrayValue<T> = T extends (infer P)[] ? P : never

type Item = GetArrayValue<Required<TabsProps>['items']> & { isSave?: boolean }

export interface HistoryTabProProps {
	cacheEleList: CacheEle[]
	setCacheEleList: Dispatch<React.SetStateAction<CacheEle[]>>
	routes: RouteConfig[]
}

const getLocalTabs = (): Item[] => {
	const tabs = JSON.parse(getLocal('shukong-history-tabs') || '[]')
	return tabs
}

const HistoryTabPro = (props: HistoryTabProProps) => {
	const { cacheEleList, setCacheEleList, routes } = props
	const location = useLocation()
	const navigate = useNavigate()
	const { pathname } = location

	const [items, setItems] = useState<Item[]>(() => {
		const localTabs = getLocalTabs()
		return localTabs
	})
	// const [pos, setPos] = useState<Item>()

	const [className, setClassName] = useState('')

	const sensor = useSensor(PointerSensor, { activationConstraint: { distance: 10 } })

	useEffect(() => {
		// 判断是否添加
		const idx = items.findIndex(item => item.key === pathname)
		if (idx === -1) {
			const route = searchRoute(pathname, routes)
			const { name, element, params = {} } = route
			if (!name || !element) return
			const o = {
				key: pathname,
				label: name
			}
			const paramKeys = Object.keys(params)
			if (paramKeys.length > 0) {
				o.label = o.label + '-' + params[paramKeys[paramKeys.length - 1]]
			}
			const _items = [...items, o]
			setItems(_items)
		}
	}, [pathname])

	const onChange = (newActiveKey: string) => {
		// pos && setPos(undefined)
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
		let newActiveKey = pathname
		let lastIndex = -1
		items.forEach((item, i) => {
			if (item.key === targetKey) {
				lastIndex = i - 1
			}
		})
		const newPanes = items.filter(item => item.key !== targetKey)
		if (newPanes.length && pathname === targetKey) {
			newActiveKey = lastIndex >= 0 ? newPanes[lastIndex].key : newPanes[0].key
		}
		setItems(newPanes)
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
			(item: Item) => {
				const { key } = item
				// 删除此tab
				remove(key)
				// 清除缓存
				const newList = [...cacheEleList]
				const idx = newList.findIndex(cache => cache.key === key)
				newList.splice(idx, 1)
				setCacheEleList(newList)
			}
		],
		[
			'CLOSE_LEFT',
			(item: Item) => {
				const { key } = item
				const _items = [...items]
				const idx = _items.findIndex(item => item.key === key)
				const newItems = _items.slice(idx)
				// 清除缓存
				const newList = [...cacheEleList].filter(cache =>
					newItems.find(item => item.key === cache.key)
				)
				if (!newItems.find(i => i.key === pathname)) {
					onChange(newItems[0].key)
				}
				setItems(newItems)
				setCacheEleList(newList)
			}
		],
		[
			'CLOSE_RIGHT',
			(item: Item) => {
				const { key } = item
				const _items = [...items]
				const idx = _items.findIndex(item => item.key === key)
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
			(item: Item) => {
				const { key } = item
				const _items = [...items]
				const newItems = _items.filter((it) => it.isSave || it.key === key)
				// 清除缓存
				const cache = [...cacheEleList].find(cache => cache.key === key)
				setItems(newItems)
				setCacheEleList(cache ? [cache] : [])
			}
		],
		[
			'STORAGE',
			(item: Item) => {
				const { key } = item
				const targetKeys = key
				const localTabs = getLocalTabs()
				const _item = { ...item }
				_item.isSave = _item?.isSave ? false : true
				if (item?.isSave) {
					const targetLocalIndex = localTabs.findIndex(tabs => tabs.key === item.key)
					localTabs.splice(targetLocalIndex, 1)
				} else {
					localTabs.push(_item)
				}
				setLocal('shukong-history-tabs', JSON.stringify(localTabs))
				const targetIndex = items.findIndex(tab => tab.key === targetKeys)
				const newItems = [...items]
				newItems.splice(targetIndex, 1, _item)
				setItems(newItems)
			}
		]
	])

	const historyTabs: { key: string; label: React.ReactNode }[] = useMemo(() => {
		return items
			.map(item => {
				const onClick = ({ key }: any, item: Item) => {
					OPERATION_MAP.get(key as OperationType)?.(item)
				}
				return {
					...item,
					label: (
						<HeaderMenuItem
							items={items}
							item={item}
							onChange={onChange}
							remove={remove}
							onClick={onClick}
						/>
					)
				}
			})
			.filter(item => {
				return item
			})
	}, [items])

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

const HeaderMenuItem = memo((props: any) => {
	const { item, onClick, remove, items, onChange } = props
	const dropdownMenus = () => {
		// 是否禁用关闭左侧
		const { key } = item
		const disabledCloseLeft = items[0]?.key === key || items.length === 1
		// 是否禁用关闭右侧
		const disabledCloseRight = items.at(-1)?.key === key
		// 是否禁用关闭其他
		const disabledCloseOther = items.length <= 1
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
				label: item.isSave ? '取消常用菜单' : '添加为常用菜单',
				key: 'STORAGE'
			},
			{
				key: 'RELOAD',
				label: '刷新',
				disabled: key !== pathname
			}
		]
	}
	const { pathname } = useLocation()
	const disabledClose = items.length > 1

	const content = (
		<div
			className={classNames(styles.item, pathname === item.key && styles.checked)}
			onClick={() => item.key !== pathname && onChange(item.key)}
		>
			<div>{item.label}</div>
			{disabledClose &&
				(item.isSave ? (
					<PushpinOutlined className={styles.closeIcon} />
				) : (
					<CloseOutlined
						className={styles.closeIcon}
						onClick={e => {
							e.stopPropagation()
							remove(item.key)
						}}
					/>
				))}
		</div>
	)

	return (
		<Dropdown
			trigger={['contextMenu']}
			menu={{
				items: dropdownMenus(),
				onClick: e => onClick(e, item)
			}}
			placement="bottom"
		>
			{content}
		</Dropdown>
	)
})
