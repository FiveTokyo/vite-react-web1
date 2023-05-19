import { useMemo, useRef } from 'react'

type noop = (...args: any[]) => any

function useMemoizedFn<T extends noop>(fn: T) {
  if (import.meta.env.NODE_ENV === 'development') {
    if (typeof fn !== 'function') {
      console.error(`useMemoizedFn expected parameter is a function, got ${typeof fn}`)
    }
  }

  const fnRef = useRef<T>(fn)

  // why not write `fnRef.current = fn`?
  // https://github.com/alibaba/hooks/issues/728
  fnRef.current = useMemo(() => fn, [fn])

  const memoizedFn: any = useRef<T>()
  if (!memoizedFn.current) {
    memoizedFn.current = function (...args) {
      return fnRef.current.apply(this, args)
    }
  }

  return memoizedFn.current
}

export { useMemoizedFn }
