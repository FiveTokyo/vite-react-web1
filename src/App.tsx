import { ConfigProvider } from 'antd'
import { Create } from './core'
import zhCN from 'antd/es/locale/zh_CN'
import { FC } from 'react'
import theme from './config/theme'
import '@/assets/style/index.css'
import { useRoutes } from 'react-router-dom'
import routes from './routes'
import BeforeRouter from './core/Router/BeforeRouter'

const App: FC<{}> = () => {
	const element = useRoutes(routes)
	return (
		<ConfigProvider locale={zhCN} theme={theme}>
			{/* <div className="tw-border-line tw-bg-primary tw-text-tc-secondary/50">123</div> */}
			<BeforeRouter>{element}</BeforeRouter>
		</ConfigProvider>
	)
}

export default App
