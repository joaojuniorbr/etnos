'use client';

import { createContext, useContext } from 'react';
import { User } from 'firebase/auth';

import { useAuth } from '@etnos/tools';

interface UserContextType {
	user: User | null;
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

	return (
		<UserContext.Provider value={{ user, isLoading }}>
			{children}
		</UserContext.Provider>
	);
};
