// Child2
import { Input } from 'antd'
import { FC } from 'react'
import { useNavigate } from 'react-router-dom'

const Child2: FC<{}> = () => {
	const navigate = useNavigate()
	return (
		<div className=" tw-font-bold">
			<span onClick={() => navigate('/parent/child1/1/哈哈')}>Child2</span>
			 <Input placeholder="请输入" />
		</div>
	)
}

export default Child2
