import { ConfigProvider } from 'antd'
import zhCN from 'antd/es/locale/zh_CN'
import { FC, useEffect, useMemo } from 'react'
import theme from './config/theme'
import { useLocation, useRoutes } from 'react-router-dom'
import { getRoutesBefore } from './routes'
import BeforeRouter from '@/components/Router/BeforeRouter'
import '@/assets/style/index.css'

const App: FC = () => {
	const { pathname } = useLocation()

	//根据菜单权限依赖过滤,监听当前权限变化，保存jotai里面用户权限
	const newRoutes = useMemo(() => {
		return getRoutesBefore()
	}, [getRoutesBefore])

	const element = useRoutes(newRoutes)

	return (
		<ConfigProvider locale={zhCN} theme={theme}>
			{/* <div className="tw-border-line tw-bg-primary tw-text-tc-secondary/50">123</div> */}
			<BeforeRouter>{element}</BeforeRouter>
		</ConfigProvider>
	)
}

export default App
