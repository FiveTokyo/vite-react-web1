/**
 * @author tokyo
 * @date 2023-04-23 15:08
 * @since 0.0.0
 */

import { memo, ReactElement, ReactNode } from 'react'
// import classnames from 'classnames'
import styles from './style.module.less'
import { Avatar, Dropdown, MenuProps } from 'antd'
import { DownOutlined, UserOutlined } from '@ant-design/icons'

export interface HeaderDropDownProps {
	dropDownItems?: MenuProps['items']
	userName?: String | undefined
	avatar?: ReactNode | string
	[key: string]: any
}

/**
interface HeaderDropDownRef {

}
*/

const HeaderDropDown = (props: HeaderDropDownProps): ReactElement => {
	const { dropDownItems, userName, avatar = <UserOutlined /> } = props

	return (
		<div className={styles.userInfo}>
			<Dropdown
				menu={{ items: dropDownItems }}
				placement="bottomRight"
				arrow
				trigger={['click']}
			>
				<div className={styles.info}>
					<Avatar style={{ backgroundColor: '#87d068' }} src={avatar} />
					<div className={styles.userName}>{userName}</div>
					<DownOutlined className={styles.icon} />
				</div>
			</Dropdown>
		</div>
	)
}

export default memo(HeaderDropDown)
