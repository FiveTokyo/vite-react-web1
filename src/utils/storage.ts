/*
 * @Author: 伍东京 15211420607@163.com
 * @Date: 2023-04-13 09:32:02
 * @LastEditors: 伍东京 15211420607@163.com
 */
//添加前缀,避免多个项目缓存命名冲突,还有缓存数据加密\安全数据问题 token等
import CryptoJS from 'crypto-js';
import myPackage from '../../package.json';

let prefix = 'other_env'
if (import.meta.env.MODE === 'development') {
	prefix = 'dev'
} else if (import.meta.env.MODE === 'test') {
	prefix = 'test'
} else if (import.meta.env.MODE === 'production') {
	prefix = 'prd'
}
//除了正式环境其他环境都不加密
const isPrd = import.meta.env.MODE === 'production'

//环境+项目名+版本号+缓存名
const prev = prefix + '_' + myPackage.name + '_' + myPackage.version + '_';

export function setLocal(name: string, value: string | undefined = '') {
	const result = isPrd ? encryptByAES(value) : value
	return localStorage.setItem(prev + name, result)
}

export function getLocal(name: string) {
	const result = localStorage.getItem(prev + name);
	if (!result) return ""
	return isPrd ? decryptByAES(result) : result
}

export function rmLocal(name: string) {
	return localStorage.removeItem(prev + name);
}

export function setSession(name: string, value: string | undefined = '') {
	const result = isPrd ? encryptByAES(value) : value
	return sessionStorage.setItem(prev + name, result)
}

export function getSession(name: string) {
	const result = sessionStorage.getItem(prev + name);
	if (!result) return ""
	return isPrd ? decryptByAES(result) : result
}

export function rmSession(name: string) {
	return sessionStorage.removeItem(prev + name);
}

//自定义密钥进制,16进制,32个编码
const key = CryptoJS.enc.Hex.parse("97d46447e8d0b3bc4fe4cff2ee3a8321");
const iv = CryptoJS.enc.Hex.parse("3f6d4d7247299bef5a1335a724743685");

//加密
/**
 * @param  {string} data 需要加密的数据
 * @returns string 加密后返回的数据
 */
export function encryptByAES(data = '') {
	return CryptoJS.AES.encrypt(data, key, {
		iv: iv,
		mode: CryptoJS.mode.CBC,
		padding: CryptoJS.pad.Pkcs7
	}).toString();
}

//解密
/**
 * @param  {string} encrypted //需要被解密的数据
 * @returns string  揭秘后的数据
 */
export function decryptByAES(encrypted = '') {
	const decrypt = CryptoJS.AES.decrypt(encrypted, key, {
		iv: iv, mode: CryptoJS.mode.CBC,
		padding: CryptoJS.pad.Pkcs7
	});
	return decrypt.toString(CryptoJS.enc.Utf8);
}

