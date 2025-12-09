'use client';

import { Spin } from 'antd';
import { useAuth } from '@etnos/tools';

export const AuthProtected = ({ children }: { children: React.ReactNode }) => {
	const { user, isLoading } = useAuth();

	if (!isLoading && !user) {
		globalThis.location.href = '/login';
		return null;
	}

	return <Spin spinning={isLoading}>{children}</Spin>;
};
