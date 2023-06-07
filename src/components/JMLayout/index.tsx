import LeftSiderPro from './components/LeftSiderPro'
import { memo } from 'react'
import { useOutlet } from 'react-router-dom'

import { Layout } from 'antd'
import { layoutSettings } from '@/config/defaultSetting'
import ContentPro from './components/ContentPro'


const LayoutPro = () => {
	const Outlet = useOutlet()
	return (
		<Layout style={{ height: '100vh', width: '100vw', position: 'fixed' }}>
			<LeftSiderPro />
			<ContentPro >{Outlet}</ContentPro>
		</Layout>
	)
}

export default memo(LayoutPro)
