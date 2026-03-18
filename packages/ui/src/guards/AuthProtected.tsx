'use client';

import { Spin } from 'antd';
import { useEffect } from 'react';
import { useAuth } from '@etnos/tools';

interface AuthProtectedProps {
	children: React.ReactNode;
	redirectTo?: string;
}

export const redirectIfUnauthenticated = ({
	browserWindow,
	isProfileLoading,
	redirectTo,
	user,
}: {
	browserWindow: Window | undefined;
	isProfileLoading: boolean;
	redirectTo: string;
	user: unknown;
}) => {
	if (browserWindow === undefined) {
		return;
	}

	if (!isProfileLoading && !user) {
		browserWindow.location.href = redirectTo;
	}
};

export const AuthProtected = ({
	children,
	redirectTo = '/login',
}: AuthProtectedProps) => {
	const { user, isProfileLoading } = useAuth();

	useEffect(() => {
		redirectIfUnauthenticated({
			browserWindow: globalThis.window,
			isProfileLoading,
			redirectTo,
			user,
		});
	}, [isProfileLoading, redirectTo, user]);

	if (!isProfileLoading && !user) {
		return null;
	}

	return (
		<>
			{isProfileLoading && (
				<div className='ui:flex ui:justify-center ui:items-center ui:h-screen ui:w-full ui:fixed ui:left-0 ui:top-0 ui:bg-white/75 ui:z-50'>
					<Spin size='large' spinning />
				</div>
			)}
			{children}
		</>
	);
};
