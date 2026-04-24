import { Redirect, Stack } from 'expo-router';
import { LoadingState } from '@/components';
import { useAuth } from '@/contexts';

export default function AuthLayout() {
	const { isAuthenticated, isHydrated } = useAuth();

	if (!isHydrated) {
		return <LoadingState label="Verificando acesso..." />;
	}

	if (isAuthenticated) {
		return <Redirect href="/(app)" />;
	}

	return <Stack screenOptions={{ headerShown: false }} />;
}
