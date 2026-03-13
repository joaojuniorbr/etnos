'use client';

import { Spin } from 'antd';
import { useEffect } from 'react';
import { useAuth } from '@etnos/tools';

interface AuthProtectedProps {
	children: React.ReactNode;
	redirectTo?: string;
}

export const AuthProtected = ({
	children,
	redirectTo = '/login',
}: AuthProtectedProps) => {
	const { user, isProfileLoading } = useAuth();

	useEffect(() => {
		if (typeof globalThis.window === 'undefined') {
			return;
		}

		if (!isProfileLoading && !user) {
			globalThis.window.location.href = redirectTo;
		}
	}, [isProfileLoading, redirectTo, user]);

	if (!isProfileLoading && !user) {
		return null;
	}

	return <Spin spinning={isProfileLoading}>{children}</Spin>;
};
