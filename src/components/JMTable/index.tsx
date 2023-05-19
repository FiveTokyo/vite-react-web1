import { Space, Button, Tooltip, TableProps } from 'antd'
import {
	forwardRef,
	useEffect,
	useMemo,
	useState,
	useImperativeHandle,
	useRef,
	createContext,
	CSSProperties,
	memo,
	ReactElement
} from 'react'
import { FilterFilled, ReloadOutlined } from '@ant-design/icons'
import TableSetting from './Setting/JMTableSetting'
import { cloneDeep, pickBy, uniqueId } from 'lodash-es'
import { findNode, renderNode } from '@/utils/tree'
import { useAntdResizableHeader } from './use-antd-resizable-header/index'
import JMPagination from './Pagination/JMPagination'
import AutoHeightTable from './AutoHeightTable'
import CommonInput from '../Input/JMInput'
import JMSearch from './Search/JMSearch'
import TableInlineSearch from './Search/TableInlineSearch'
import {
	formatDateRangeToArray,
	getLocationSearchParam,
	getPathName
} from '@/utils/common'
import { getLocal } from '@/utils/storage'
import { TableRowSelection } from 'antd/es/table/interface'
// import DaoChuButton from '../Button/daochu';
// import DateRangePicker from '../formItem/dateRangePicker';
// import CommonCascader from '../Cascader/CommonCascader';

export const JMTableContext = createContext({})

interface TableDataSource {
	list?: any[]
	loading?: boolean
	total?: number
}

export interface JMTableProps {
	//左侧表头，一般用于表格名称等
	title?:
		| ReactElement
		| string
		| ((action: { refresh?: (params: any) => void; reset?: () => void }) => any)
	//表头右侧附加内容，一般用于添加按钮等内容
	extra?:
		| ReactElement
		| string
		| ((action: { refresh?: (params: any) => void; reset?: () => void }) => any)
	//单独设置的数据，一般使用request使用data很少使用
	data?: TableDataSource
	//单独的搜索项集合
	searchCols?: any[]
	//表字段集合
	cols: {
		dataIndex: string
		title: string
		valueType?: 'select' | 'text' | 'cascader' | 'dateRange'
		fieldProps?: {
			showSearch?: boolean
			changeOnSelect?: boolean
			mode?: 'multiple'
			options?: any[],
			fieldNames?: {label: string, value: string}
			[propName: string]: any;
		}
		onDiyCell?: <T>(
			record: T,
			index: number,
			settingCols: any
		) => ReactElement | undefined | string
		onCell?: (
			record: any,
			index: number,
			settingCols: any
		) => ReactElement | undefined | string
		transformSearch?: (value: any) => { [key in string]: any }
	}[]
	//表格请求数据request
	request?: (params: any) => Promise<any>
	//是否显示表格头部
	showHeader?: boolean
	//表格配置，包含，是否分页，是否刷新，是否可设置等按钮
	options?: {
		page: boolean
		refresh: boolean
		setting: boolean
	}
	//表格样式，给到antd table
	style?: CSSProperties
	//每页条数
	pagesizeOptions?: String[]
	//表格选择项属性，可以参考andt table 属性
	rowSelectionProps?: TableRowSelection<any>
	//antd table 的属性
	tableProps?: TableProps<any>
	//表格数据唯一值字段名称
	rowKey?: string
	//是否默认使用url参数
	urlSearchParam?: boolean
	//是否手动请求
	manualRequest?: boolean
	tableTopRender?: ReactElement
	tableBottomRender?: ReactElement
	scrollY?: number
	showCommonSearch?: boolean
	saveKey?: string
}

export interface JMTableRef {
	selectedRowKeys?: string[],
	refresh?: (params: any) => void;
	reset?: (params: any) => void;
}


const JMTable = forwardRef<JMTableRef, JMTableProps>((props, ref) => {
	const {
		title,
		extra,
		data = {},
		searchCols = [],
		cols,
		request,
		showHeader = true,
		options = {
			page: true,
			refresh: true,
			setting: true
		},
		style = {},
		pagesizeOptions = ['30', '50', '100', '200', '1000'],
		rowSelectionProps,
		tableProps = {},
		rowKey,
		urlSearchParam = true, //是否默认使用url参数
		manualRequest = false, //是否手动请求
		tableTopRender,
		tableBottomRender,
		scrollY,
		showCommonSearch = true
	} = props
	let saveKey = props.saveKey
	if (urlSearchParam) {
		saveKey = getPathName()
	}

	const [selectedRowKeys, setSelectedRowKeys] = useState<string[]>([])
	const [dataSource, setDataSouce] = useState<TableDataSource>(data)
	const [settingCols, setSettingCols] = useState(() => {
		if (options.setting && saveKey && localStorage.getItem(`${saveKey || ''}_columns_setting`)) {
			return JSON.parse(localStorage.getItem(`${saveKey || ''}_columns_setting`) || "")
		}
		return []
	})
	const searchRef = useRef<any>()
	const pRef = useRef<any>({}) // 保证 param 每次更新后有值
	const currentFilterParam = useRef({})
	const [searchParams] = useState(() => {
		if (urlSearchParam) return getLocationSearchParam()
		return {}
	})
	const [commonSearchCols, setCommonSearchCols] = useState()

	const [rowKeys] = useState(() => {
		return (r: { [x: string]: any }) => {
			let key = 'itemid'
			if (typeof rowKey === 'string') {
				key = rowKey
			}
			if (rowKey || rowSelectionProps) {
				return r[key]
			}
			return r['id']
		}
	})
	const appendFieldProps = (d: any) => {
		if (!d) return
		d.fieldProps = d.fieldProps || {}
		if (typeof d.fieldProps !== 'function') {
			if (d.valueType === 'dateRange') {
				d.fieldProps.allowEmpty = [true, true]
				// Object.assign(d, {
				//   renderFormItem: () => <DateRangePicker {...d.fieldProps} />,
				// });
			} else if (d.valueType === 'select') {
				d.fieldProps.showSearch = true
			} else if (d.valueType === 'cascader') {
				d.fieldProps.changeOnSelect = d.fieldProps.changeOnSelect === false ? false : true
				d.fieldProps.showSearch = true
				// Object.assign(d, {
				//   renderFormItem: () => <CommonCascader {...d.fieldProps} />,
				// });
			} else if (d.valueType === 'text') {
				Object.assign(d, {
					renderFormItem: () => <CommonInput {...d.fieldProps} />
				})
			}
		}
	}

	const colMemo = useMemo(() => {
		const t = cloneDeep(cols.filter((d: any) => d))
		renderNode(t, d => {
			appendFieldProps(d)
			if (!d.width) {
				const length = typeof d.title === 'string' ? d.title?.length : 4
				d.width = 50 + (length - 2) * 10 + (d.valueType ? 20 : 0) + (d.sorter ? 20 : 0)
			}
			if (d.dataIndex === t[t.length - 1].dataIndex) {
				d.width = null
			}
			d.ellipsis = false
			d.render = (text: any, record: any, index: number) => {
				if (d.renderDiyCell) {
					return d.renderDiyCell(record, index, action)
				}
				return text || '-'
			}
		})
		return t
	}, [cols])

	const searchMemo = useMemo(() => {
		let result: any[] = []
		renderNode(colMemo, d => {
			if (d.valueType) {
				result.push(d)
			}
		})
		searchCols.forEach(d => appendFieldProps(d))
		result = [...result, ...searchCols].filter(d => d)
		return result
	}, [colMemo, searchCols])

	const defaultParam = useMemo(() => {
		let filter: any = {}
		searchMemo?.forEach(d => {
			if (d.initialValue) {
				filter[d.dataIndex] = d.initialValue
			}
		})
		return {
			paginate: {
				page: 1,
				pagesize: options.page ? pagesizeOptions[0] : 9999
			},
			filter,
			sort: {}
		}
	}, [searchMemo])

	const [param, setParam] = useState(() => {
		return searchParams?.param ? JSON.parse(searchParams?.param) : defaultParam
	})

	const { components, resizableColumns, tableWidth } = useAntdResizableHeader({
		columns: useMemo(() => {
			if (param) {
				const t = cloneDeep(colMemo)
				renderNode(t, d => {
					const value = param.filter[d.dataIndex]
					if (value) {
						d.filteredValue =
							Array.isArray(param.filter[d.dataIndex]) && value.length === 0
								? null
								: param.filter[d.dataIndex]
					} else {
						d.filteredValue = d.filterResetToDefaultFilteredValue ? d.initialValue : null
					}

					if (d.valueType) {
						const tdTitle = typeof d.title === 'function' ? d.title() : d.title
						d.title = (
							<div>
								{tdTitle}
								<FilterFilled
									style={{
										color: d.filteredValue ? '#1890ff' : '#999',
										cursor: 'pointer',
										marginLeft: 5
									}}
									onClick={e => {
										e.stopPropagation()
										searchRef.current?.addColumn(d.dataIndex)
									}}
								/>
							</div>
						)
					}
					if (d.sorter && param.sort?.field) {
						d.sortOrder = d.dataIndex === param.sort?.field ? param.sort.order : null
					}
				})
				if (settingCols?.length) {
					let s: any[] = []
					settingCols.forEach((k: any) => {
						if (!k) return
						const item = t.find((d: any) => d?.dataIndex === k.dataIndex)
						if (!k.hidden && item) {
							if (item.onDiyCell) {
								item.onCell = (record: any, index: any) =>
									item.onDiyCell && item.onDiyCell(record, index, settingCols)
							}
							s.push(item)
						}
					})
					return s
				}
				return t
			}
			return []
		}, [param, colMemo, settingCols]),
		columnsState: saveKey
			? {
					persistenceKey: `${saveKey}_columns`,
					persistenceType: 'localStorage'
			  }
			: undefined
	})

	useImperativeHandle(ref, () => ({
		selectedRowKeys,
		refresh,
		reset
	}))

	useEffect(() => {
		pRef.current = param || {}
		if (manualRequest) {
			return
		}
		requestData()
	}, [param])

	useEffect(() => {
		if (data) {
			setDataSouce(data)
		}
	}, [data])

	async function requestData() {
		if (!request) return
		setDataSouce((v: any) => ({
			...v,
			loading: true
		}))
		searchRef.current?.updateColumn(pRef.current?.filter)
		let d = await request(excurdParam())
		if (typeof d === 'string') {
			d = {}
		}
		d.loading = false
		if (!rowKey) {
			d.list?.forEach((k: { uniqueId: string }) => (k.uniqueId = `${uniqueId()}`))
		}
		setDataSouce(d)
		//同步参数到地址栏
		if (urlSearchParam) {
			const p = cloneDeep(pRef.current)
			p.filter = pickBy(p.filter, v => v !== null)
			window.history.pushState({}, '', `?param=${JSON.stringify(p)}`)
		}
	}

	const refresh = (p: any = {}) => {
		if (Object.keys(p).length > 0) {
			pRef.current.filter = {
				...(pRef.current.filter || {}),
				...(p?.filter || {})
			}
			setParam({ ...pRef.current })
			if (manualRequest) {
				requestData()
			}
		} else {
			requestData()
		}
	}

	const reset = () => {
		const dp = cloneDeep(defaultParam)
		searchMemo.forEach(d => {
			if (d.initialValue && !d.filterResetToDefaultFilteredValue) {
				dp.filter[d.dataIndex] = null
			}
		})
		const p = pickBy(dp, v => v !== null)
		pRef.current = p
		setParam(p)
		if (manualRequest) {
			requestData()
		}
	}

	const action = {
		refresh,
		reset
	}

	const rowSelection = () => {
		if (rowSelectionProps) {
			return {
				onChange: (v: string[]) => setSelectedRowKeys(v),
				selectedRowKeys,
				columnWidth: 36,
				...(rowSelectionProps || {})
			}
		}
		return null
	}

	const excurdParam = () => {
		const { page, pagesize } = pRef.current.paginate
		const filters = pRef.current.filter
		const { field, order } = pRef.current.sort
		let p: any = { page, pagesize }
		if (field) {
			let result: any[] = []
			renderNode(colMemo, d => {
				if (d.sorter) {
					result.push(d)
				}
			})
			const item = result.find(d => d.dataIndex === field)
			if (item?.transformSort) {
				p = { ...p, ...item.transformSort(order) }
			}
		}
		// console.log('filters =>', filters);
		if (filters) {
			Object.entries(filters).forEach(filterArr => {
				const key = filterArr[0]
				const item: any = findNode(searchMemo, key, 'dataIndex')
				if (!item) {
					if (filterArr[1]) {
						p[key] = filterArr[1]
					}
					return
				}

				let value = filterArr[1]

				const isEmptyArray = Array.isArray(value) && value.length === 0
				if ((!value && value !== 0) || isEmptyArray) return
				if (item.transformSearch) {
					const obj = item.transformSearch(value)
					if (obj && typeof obj === 'object') {
						Object.entries(obj).forEach((arr: any) => {
							if (p[arr[0]] && typeof p[arr[0]] === 'object') {
								p[arr[0]] = { ...p[arr[0]], ...arr[1] }
							} else {
								p[arr[0]] = arr[1]
							}
						})
					}
				} else {
					const searchKey = item.searchKey || item.dataIndex
					if (!p[searchKey]) {
						p[searchKey] = {}
					}
					if (item.valueType === 'dateRange') {
						p[searchKey] = formatDateRangeToArray(value, item.fieldProps?.format)
					} else {
						p[searchKey] = value
					}
				}
			})
		}
		return p
	}

	const handleTableChange = (_: any, filter: any = {}, sort: any = {}) => {
		currentFilterParam.current = sort.field
			? {
					sort: sort.field
			  }
			: {}
		setParam({
			paginate: { page: 1, pagesize: pRef.current?.paginate?.pagesize || 30 },
			filter: { ...pRef.current.filter, ...filter },
			sort: { field: sort.field, order: sort.order }
		})
	}

	const pagination = (
		<JMPagination
			pageSizeOptions={pagesizeOptions}
			pageSize={pRef.current.paginate?.pagesize}
			current={pRef.current.paginate?.page}
			total={dataSource?.total}
			onChange={(page: number, pagesize: number) => {
				pRef.current.paginate.page = page
				pRef.current.paginate.pagesize = pagesize
				setParam((v: any) => ({
					...v,
					paginate: { page, pagesize }
				}))
				if (manualRequest) {
					requestData()
				}
			}}
		/>
	)

	const table = (
		<AutoHeightTable
			rowKey={rowKeys}
			size="small"
			bordered
			pagination={false}
			scrollY={scrollY}
			tableWidth={tableWidth}
			columns={resizableColumns}
			dataSource={dataSource?.list || []}
			rowSelection={rowSelection()}
			loading={dataSource?.loading || false}
			components={{
				header: components.header,
				body: { cell: TdCell }
			}}
			onChange={handleTableChange}
			{...tableProps}
		/>
	)

	const header = useMemo(() => {
		return (
			<div
				style={{
					height: 44,
					display: 'flex',
					alignItems: 'center',
					justifyContent: title ? 'space-between' : 'flex-end'
				}}
			>
				{typeof title === 'function' ? title?.(action) : title}
				<Space size={8} style={{ justifyContent: 'end', flexShrink: 0 }}>
					{typeof extra === 'function' ? extra?.(action) : extra}
					{options.refresh !== false && (
						<Tooltip title="刷新" placement="bottom">
							<Button
								type="link"
								icon={<ReloadOutlined />}
								style={{ fontSize: 16, color: '#999' }}
								onClick={requestData}
							/>
						</Tooltip>
					)}
					<JMSearch ref={searchRef} reset={reset} showCommonSearch={showCommonSearch} />
					{options.setting !== false && (
						<TableSetting onConfire={(v: any) => setSettingCols(v)} />
					)}
					{/* {dataSource?.export_url && (
        <DaoChuButton
          url={dataSource?.export_url}
          param={excurdParam}
          tip={dataSource?.export_tip}
        />
      )} */}
					{options.page !== false && pagination}
				</Space>
			</div>
		)
	}, [options])

	return (
		<JMTableContext.Provider
			value={{
				colMemo,
				searchMemo,
				saveKey,
				commonSearchCols,
				currentFilterParam,
				setCommonSearchCols,
				param,
				setParam
			}}
		>
			<div className="list-content" style={style}>
				{showHeader && header}
				{<TableInlineSearch />}
				{tableTopRender}
				{table}
				{tableBottomRender}
			</div>
		</JMTableContext.Provider>
	)
})

const TdCell = (props: { [x: string]: any; onMouseEnter: any; onMouseLeave: any }) => {
	// onMouseEnter, onMouseLeave在数据量多的时候，会严重阻塞表格单元格渲染，严重影响性能
	const { onMouseEnter, onMouseLeave, ...restProps } = props
	return <td {...restProps} />
}

export default memo(JMTable)
