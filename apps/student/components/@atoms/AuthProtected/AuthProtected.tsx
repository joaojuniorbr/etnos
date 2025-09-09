'use client';

import { Spin } from 'antd';
import { useAuth } from '@etnos/tools';

export const AuthProtected = ({ children }: { children: React.ReactNode }) => {
	const { user, isLoading } = useAuth();

	if (!isLoading && !user) {
		window.location.href = '/login';
	}

	return <Spin spinning={isLoading}>{children}</Spin>;
};
