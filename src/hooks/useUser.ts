import { useNavigate } from 'react-router-dom';
import { userInfoAtom } from "@/constants/jotail";
import { getLocal, rmLocal, setLocal } from "@/utils/storage";
import { useAsyncEffect, useRequest } from "ahooks";
import { useAtom } from "jotai";
import { useState } from "react";

export default function useGetUser() {
	const [userInfo, setUserInfo] = useAtom(userInfoAtom)
	const navigate = useNavigate()
	const getUserInfo = async (): Promise<any> => {
		const { data } = { data: { name: Math.random().toString(36).substring(2, 8) } }
		setUserInfo(data)
	}

	useAsyncEffect(async () => {
		const auth = getLocal('token')
		if (!auth && !userInfo.hasOwnProperty('id')) {
			await getUserInfo()
		}
	}, [])

	const userLogin = async function () {
		setLocal('token', 'token')
		getUserInfo()
	}

	const userLogout = async () => {
		rmLocal('token')
		navigate('user/login', { replace: true })
	}

	return { userInfo, updateUserInfo: getUserInfo, userLogin, userLogout }
}
