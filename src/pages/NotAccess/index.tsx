// 无权限路由
import { Button, Result } from 'antd'
import { FC } from 'react'
import { useNavigate } from 'react-router-dom'

const NotAccess: FC<any> = () => {
	const navigate = useNavigate()
	return (
		<Result
			status="403"
			title="403"
			subTitle="您没有访问该页面的权限！请联系管理员添加权限，并重新登录！"
			extra={
				<Button type="primary" onClick={() => navigate(-1)}>
					返回
				</Button>
			}
		/>
	)
}

export default NotAccess
