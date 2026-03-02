'use client';

import { createContext, useContext, useMemo } from 'react';
import { useAuth } from '@etnos/tools';
import type { UserProfileInterface } from '@etnos/types';
interface UserContextType {
	user: UserProfileInterface | null | undefined;
	isLoading: boolean;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const useUser = () => {
	const context = useContext(UserContext);
	if (context === undefined) {
		throw new Error('useUser deve ser usado dentro de um UserProvider');
	}
	return context;
};

export const UserProvider = ({ children }: { children: React.ReactNode }) => {
	const { user, isLoading } = useAuth();

	const value = useMemo(() => {
		return { user, isLoading };
	}, [user, isLoading]);

	return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};
