// 头部右侧用户登录信息

import { Avatar, Button, Popover, Space, Typography } from 'antd'

import { FC, useRef } from 'react'
import styles from './index.module.css'
// import { reqLoginOut } from '@/api'
import { useNavigate } from 'react-router-dom'
import UserModal, { UserModalRef } from '../UserModal'

const HeaderRight: FC<any> = () => {
	const userModalRef = useRef<UserModalRef>(null)
	const navigator = useNavigate()
	function handleLoginOut() {
		// reqLoginOut().then(() => navigator('/login'))

		setTimeout(() => navigator('/login'), 1000)
	}

	function handleOpenModal() {
		userModalRef.current?.open()
	}

	return (
		<>
			<Popover
				placement="bottom"
				content={<Button onClick={handleLoginOut}>退出登录</Button>}
			>
				<Space className={styles.drop} onClick={handleOpenModal}>
					<Avatar size={32} src='' />
					<Typography.Text>{'tokyo'}</Typography.Text>
				</Space>
			</Popover>

			<UserModal ref={userModalRef} />
		</>
	)
}

export default HeaderRight
