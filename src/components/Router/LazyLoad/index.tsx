import { removeAllPendingRequestsRecord } from '@/api/request'
import { ProcessLoading } from '@/components/Loading'
import { LazyExoticComponent, ReactNode, Suspense } from 'react'

export default function LazyLoad(Com: LazyExoticComponent<any>): ReactNode {
	//跳转页面时取消上一个页面未完成的请求
	removeAllPendingRequestsRecord()
	return (
		<Suspense fallback={<ProcessLoading />}>
			<Com />
		</Suspense>
	)
}
