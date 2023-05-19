import dayjs, { Dayjs } from 'dayjs';
import { getSession } from './storage';

export function getPathName() {
	let pathname = decodeURI(location.pathname);
	if (pathname.endsWith('/')) {
		pathname = pathname.substring(0, pathname.length - 1);
	}
	return pathname;
}

export function getLocationSearchParam() {
	const fixedMenu = getSession('fixedMenu') || '[]';
	const menuObj = JSON.parse(fixedMenu);
	const item = menuObj.find((d: { pathname: string; }) => d.pathname === getPathName());
	let search = decodeURI(location.search);
	if (item) {
		search = decodeURI(item.search);
	}
	let searchParam = new URLSearchParams(search);
	return Object.fromEntries(searchParam);
}

export function formatDateRange(
	value = [],
	keys = ['fromtime', 'totime'],
	fmt = 'YYYY-MM-DD'
) {
	let v = value;
	if (Array.isArray(value) && value.length === 0) {
		return null;
	}
	let obj: { [k in string]: string } = {};
	keys.forEach((d, i) => {
		let value: Dayjs | string | null = typeof v?.[i] === 'string' ? dayjs(v?.[i]) : v?.[i];
		value = value ? value.format(fmt) : null;
		if (!value) {
			value =
				i === 0 ? '2015-01-01 00:00:00' : dayjs().format('YYYY-MM-DD HH:mm:ss');
		}
		obj[d] = value;
	});
	return obj;
}

export function formatDateRangeToArray(value: any = [], fmt = 'YYYY-MM-DD') {
	let v = value;
	return v.map((d: string | number | dayjs.Dayjs | Date | null | undefined, i: number) => {
		let value: any = typeof d === 'string' ? dayjs(d) : d;
		value =
			value && typeof value.format === 'function' ? value.format(fmt) : null;
		if (!value) {
			value =
				i === 0 ? '2015-01-01 00:00:00' : dayjs().format('YYYY-MM-DD HH:mm:ss');
		}
		return value;
	});
}

export function formatArrayToSelect(v = [], label = 'label', value = 'value') {
	if (!v?.length) {
		return [];
	}
	if (
		v instanceof Array &&
		typeof v[0] !== 'object' &&
		typeof v[0] !== 'function'
	) {
		return v.map((d) => {
			const obj: { [k in string]: string } = {};
			obj[label] = d;
			obj[value] = d;
			return obj;
		});
	}
	return v;
}
