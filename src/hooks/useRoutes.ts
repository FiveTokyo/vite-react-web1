import { RouteConfig } from "@/components/Router/type";
import routes from "@/routes";
import { getLocal } from "@/utils/storage";
import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

//权限路由 没有的就是notAccess
export default function useMyRoutes() {
	const defaultRoutes = routes.find(r => r.path === '/*')!.children as RouteConfig[]
	const [menuRoutes, setMenuRoutes] = useState<RouteConfig[]>(defaultRoutes);
	const { pathname } = useLocation()
	useEffect(() => {
		//如果有权限就获取接口路由进行过滤
		if (getLocal('token')) {
			updateMenuRoutes()
		}
	}, [getLocal('token')])

	const updateMenuRoutes = ()=> {
		console.log('token:', getLocal('token'));
	}

	return { menuRoutes, updateMenuRoutes }
}
