import { ConfigProvider } from 'antd'
import zhCN from 'antd/es/locale/zh_CN'
import { FC, useEffect, useMemo } from 'react'
import theme from './config/theme'
import { Route, Routes, useLocation, useRoutes } from 'react-router-dom'
import routes, { getRoutesBefore } from './routes'
import BeforeRouter from '@/components/Router/BeforeRouter'
import '@/assets/style/index.css'

const App: FC = () => {

	return (
		<ConfigProvider locale={zhCN} theme={theme}>
			<BeforeRouter>
				<Routes>
					{routes.map(route => (
						<Route key={route.path} path={route.path} element={route.element} />
					))}
				</Routes>
			</BeforeRouter>
		</ConfigProvider>
	)
}

export default App
