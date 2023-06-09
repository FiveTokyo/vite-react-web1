// Child1
import { JMTable } from '@/components'
import { Input } from 'antd'
import { FC } from 'react'
import { useParams } from 'react-router-dom'

const Child1 = () => {
	const params = useParams()
	console.log('Child1',params)
	return (
		<>
			<div className="tw-bg-primary tw-font-bold">开启了keepAlive</div>
			<JMTable
				title={'嘎嘎'}
				cols={[
					{
						dataIndex: 'test',
						title: '测试', 
						transformSearch: () => ({}),
						onDiyCell: (record, index, settingCols) => {
							return <div>sdasddasda阿萨达大多数 asd</div>	
						},
					},
					{ dataIndex: 'test1', title: '测试1' }
				]}
				data={{
					list: [{ test: 'adada', test1: 'asd', id: 1 }],
					total: 1,
					loading: false
				}}
				// request={function (params: any) {
				// 	throw new Error('Function not implemented.')
				// }}
			></JMTable>
			<Input placeholder="请输入" />
		</>
	)
}

export default Child1
