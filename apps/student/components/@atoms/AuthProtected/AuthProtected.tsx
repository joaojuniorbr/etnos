'use client';

import { Spin } from 'antd';
import { useAuth } from '@etnos/tools';

export const AuthProtected = ({ children }: { children: React.ReactNode }) => {
	const { user, isProfileLoading } = useAuth();
	if (!isProfileLoading && !user) {
		globalThis.location.href = '/login';
		return null;
	}

	return <Spin spinning={isProfileLoading}>{children}</Spin>;
};
