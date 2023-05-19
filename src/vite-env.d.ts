/// <reference types="vite/client" />

declare module '*.css'
declare module '*.less'
declare module '*.scss'
declare module '*.sass'
declare module '*.svg'
declare module '*.png'
declare module '*.jpg'
declare module '*.jpeg'
declare module '*.gif'
declare module '*.mp3'

declare module '*/JMTable'

interface ImportMetaEnv {
	readonly VITE_NODE_ENV: 'development' | 'test' | 'production'
	readonly VITE_PREFIX_URL: string
}

interface ImportMeta {
	readonly env: ImportMetaEnv
}
