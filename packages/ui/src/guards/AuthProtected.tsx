'use client';

import { Spin } from 'antd';
import { useEffect } from 'react';
import { useAuth } from '@etnos/tools';

interface AuthProtectedProps {
	children: React.ReactNode;
	redirectTo?: string;
	allowedRoles?: string[];
	forbiddenRedirectTo?: string;
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

export const hasAllowedRole = (
	user: { role?: string[]; roles?: string[] } | null | undefined,
	allowedRoles?: string[]
) => {
	if (!allowedRoles?.length) {
		return true;
	}

	const userRoles = user?.role ?? user?.roles ?? [];

	return allowedRoles.some((allowedRole) => userRoles.includes(allowedRole));
};

export const AuthProtected = ({
	children,
	redirectTo = '/login',
	allowedRoles,
	forbiddenRedirectTo = '/',
}: AuthProtectedProps) => {
	const { user, isProfileLoading } = useAuth();
	const isAuthorized = hasAllowedRole(user, allowedRoles);

	useEffect(() => {
		redirectIfUnauthenticated({
			browserWindow: globalThis.window,
			isProfileLoading,
			redirectTo,
			user,
		});
	}, [isProfileLoading, redirectTo, user]);

	useEffect(() => {
		if (
			globalThis.window === undefined ||
			isProfileLoading ||
			!user ||
			isAuthorized
		) {
			return;
		}

		globalThis.window.location.href = forbiddenRedirectTo;
	}, [forbiddenRedirectTo, isAuthorized, isProfileLoading, user]);

	if (!isProfileLoading && !user) {
		return null;
	}

	if (!isProfileLoading && user && !isAuthorized) {
		return null;
	}

	if (isProfileLoading) {
		return (
			<div className='ui:flex ui:justify-center ui:items-center ui:h-screen ui:w-full ui:fixed ui:left-0 ui:top-0 ui:bg-white/75 ui:z-50'>
				<Spin size='large' spinning />
			</div>
		);
	}

	return <>{children}</>;
};
