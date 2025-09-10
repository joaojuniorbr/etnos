import { useQuery } from '@tanstack/react-query';
import { schoolService } from '../services';

export const useSchools = () =>
	useQuery({
		queryKey: ['schools', 'all'],
		queryFn: () => schoolService.getAll(),
	});
