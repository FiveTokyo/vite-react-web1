import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react-swc'
import legacy from '@vitejs/plugin-legacy'
import svgrPlugin from 'vite-plugin-svgr'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
	const env = loadEnv(mode, process.cwd());
	return {
		envPrefix: 'VITE_',
		resolve: {
			alias: [{ find: '@', replacement: path.resolve(__dirname, './src') }]
		},
		esbuild: {
      pure: [],
    },
		plugins: [
			react(),
			svgrPlugin({
				svgrOptions: { icon: true }
			}),
			mode === 'production' &&
				legacy({ modernPolyfills: true, renderLegacyChunks: false })
		].filter(Boolean),
		server: {
			host: '127.0.0.1',
			port: 3000,
			open: true,
			proxy: {
				'/api': {
					target: env.VITE_API_BASE_URL,
					changeOrigin: true,
					ws: true
				}
			}
		},
		css: {
			preprocessorOptions: {
				less: {
					javascriptEnabled: true,
					// additionalData: `@import "@/styles/var.less";`,
					// modifyVars: {
					//   "@primary-color": "#4377FE", //设置antd主题色
					// },
				},
			},
		},
		build: {
			target: 'es2015',
			reportCompressedSize: false,
			chunkSizeWarningLimit: 2000,
			outDir: "dist",
      rollupOptions: {
        output: {
          chunkFileNames: "assets/js/[name]-[hash].js",
          entryFileNames: "assets/js/[name]-[hash].js",
          assetFileNames: "assets/[ext]/[name]-[hash].[ext]",
        },
      },
			sourcemap: mode !== 'production',
			minify: 'esbuild'
		}
	}
})
