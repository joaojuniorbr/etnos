'use client';

import { Spin } from 'antd';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@etnos/tools';

export const AuthProtected = ({ children }: { children: React.ReactNode }) => {
	const { user, isLoading } = useAuth();
	const router = useRouter();

	useEffect(() => {
		if (!isLoading && !user) {
			router.replace('/login');
		}
	}, [isLoading, user, router]);

	if (!isLoading && !user) return null;

	return <Spin spinning={isLoading}>{children}</Spin>;
};
