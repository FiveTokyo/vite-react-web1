/**
 * @author tokyo
 * @date 2023-06-08 16:21
 * @since 0.0.0
 */

import { cloneElement, memo, useEffect } from 'react'
// import classnames from 'classnames'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { css } from '@emotion/css'


interface DraggableTabPaneProps extends React.HTMLAttributes<HTMLDivElement> {
	'data-node-key': string
	onActiveBarTransform: (className: string) => void
}
/**
interface DraggableTabNodeRef {

}
*/

const DraggableTabNode = ({
	className,
	onActiveBarTransform,
	...props
}: DraggableTabPaneProps) => {
	const { attributes, listeners, setNodeRef, transform, transition, isSorting } =
		useSortable({
			id: props['data-node-key']
		})

	const style: React.CSSProperties = {
		...props.style,
		transform: CSS.Transform.toString(transform),
		transition,
		cursor: 'move'
	}

	useEffect(() => {
		if (!isSorting) {
			onActiveBarTransform('')
		} else if (className?.includes('ant-tabs-tab-active')) {
			onActiveBarTransform(
				css`
					.ant-tabs-ink-bar {
						transform: ${CSS.Transform.toString(transform)};
						transition: ${transition} !important;
					}
				`
			)
		}
	}, [className, isSorting, transform])

	return cloneElement(props.children as React.ReactElement, {
		ref: setNodeRef,
		style,
		...attributes,
		...listeners
	})
}

export default memo(DraggableTabNode)
