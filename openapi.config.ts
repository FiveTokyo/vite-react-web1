// import { GenerateServiceProps } from '@umijs/openapi';
// const { generateService, GenerateServiceProps } = require('./dist/index')
const { generateService } = require('@umijs/openapi')




generateService({
	schemaPath: 'https://yzy.qa8.chinabm.cn/swagger.json?0.8620900998062644',
	serversPath: './src/api/',
	// namespace: 'JMAPI',
	projectName: 'JMAPI',
	requestLibPath: '../request',
	hook: {
		/** 自定义函数名称 */
		// customFunctionName: (data: any) => {
		// 	if (data.hasOwnProperty('operationId')) {
		// 		return data.operationId.split('Using')[0]
		// 	}
		// 	console.log('customFunctionName:', data);
		// },
		// customTypeName: (data: any) => {
		// 	if (data.hasOwnProperty('operationId')) {
		// 		return data.operationId.split('Using')[0].replace(data.method, '')
		// 	}
		// 	console.log('customTypeName:', data)
		// },
		customClassName: (tagName: string) => {
			console.log('customClassName:',tagName)
		}

	}
})
