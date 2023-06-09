import LeftSiderPro, { LeftSiderProProps } from './components/LeftSiderPro'
import { FC, memo, useEffect } from 'react'
import { Routes, useLocation, useOutlet, useParams, useRoutes } from 'react-router-dom'

import { Layout } from 'antd'
import { layoutSettings } from '@/config/defaultSetting'
import ContentPro, { ContentProProps } from './components/ContentPro'
import { RouteConfig } from '../Router/type'
import routers from '@/routes'
import useCurrentUser from '@/hooks/useUser'
import useMyRoutes from '@/hooks/useRoutes'

type LayoutProProps = ContentProProps & LeftSiderProProps


const LayoutPro: FC<LayoutProProps> = props => {
	const { userLogout } = useCurrentUser()
	//过滤后的的权限路由
	const { menuRoutes } = useMyRoutes() as any
	const location = useLocation()
	const element = useRoutes(menuRoutes, location)
	const {
		routes = routers.find(route => route.path === '/*')?.children as RouteConfig[],
		title = layoutSettings.title,
		logo = layoutSettings.logo,
		AliveMaxLength = 10,
		siderWidth = 230,
		userName = 'tokyo',
		dropDownItems = [
			{
				key: '1',
				label: <a onClick={() => userLogout()}>退出登陆</a>
			}
		]
	} = props

	return (
		<Layout style={{ height: '100vh', width: '100vw', position: 'fixed' }}>
			<LeftSiderPro routes={routes} title={title} logo={logo} siderWidth={siderWidth} />
			<ContentPro
				routes={menuRoutes}
				maxLength={AliveMaxLength}
				userName={userName}
				dropDownItems={dropDownItems}
			>
				{element}
			</ContentPro>
		</Layout>
	)
}

export default memo(LayoutPro)
