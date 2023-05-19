import { Button, Result } from 'antd'
import { FC } from 'react'
import { useNavigate } from 'react-router-dom'

const NotFound: FC<any> = () => {
	const navigate = useNavigate()
	return (
		<Result
			status="404"
			title="404"
			subTitle="当前访问的页面不存在！"
			extra={
				<Button type="primary" onClick={() => navigate(-1)}>
					返回
				</Button>
			}
		/>
	)
}

export default NotFound
