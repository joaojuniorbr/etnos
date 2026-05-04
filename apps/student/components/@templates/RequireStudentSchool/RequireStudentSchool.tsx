'use client';

import { useAuth } from '@etnos/tools';
import { Spin } from 'antd';
import { usePathname } from 'next/navigation';
import { useEffect } from 'react';

const STUDENT_HOME = '/estudante';
const ONBOARDING_HREF = '/estudante/onboarding';

const isOnboardingPath = (pathname: string | null) => {
	if (!pathname) return false;
	if (pathname === '/onboarding' || pathname === ONBOARDING_HREF) return true;
	return pathname.endsWith('/onboarding');
};

const needsStudentSchoolLink = (
	user: { school?: string | null } | null | undefined,
) => {
	if (!user) return false;
	const s = user.school;
	return s == null || String(s).trim() === '';
};

export const RequireStudentSchool = ({
	children,
}: {
	children: React.ReactNode;
}) => {
	const pathname = usePathname();
	const { user, isProfileLoading } = useAuth();

	const onboarding = isOnboardingPath(pathname);
	const needsSchool = needsStudentSchoolLink(user);

	const mustRedirectAway =
		(needsSchool && !onboarding) || (!needsSchool && onboarding);

	useEffect(() => {
		if (isProfileLoading || !user) return;

		if (needsSchool && !onboarding) {
			globalThis.window.location.href = ONBOARDING_HREF;
			return;
		}

		if (!needsSchool && onboarding) {
			globalThis.window.location.href = STUDENT_HOME;
		}
	}, [isProfileLoading, user, needsSchool, onboarding]);

	if (isProfileLoading || !user) {
		return null;
	}

	if (mustRedirectAway) {
		return (
			<div className="flex min-h-[40vh] w-full items-center justify-center">
				<Spin size="large" />
			</div>
		);
	}

	return children;
};
