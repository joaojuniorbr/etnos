import { Redirect } from 'expo-router';
import { LoadingState } from '@/components';
import { useAuth } from '@/contexts';

export default function IndexPage() {
	const { isAuthenticated, isHydrated } = useAuth();

	if (!isHydrated) {
		return <LoadingState label="Preparando sua jornada..." />;
	}

	return <Redirect href={isAuthenticated ? '/(app)' : '/(auth)/login'} />;
}
