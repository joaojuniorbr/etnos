'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { UserRole } from '@etnos/types';
import { usersService } from '@etnos/services';

export const useUpdateUserRolesMutation = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({ userId, roles }: { userId: string; roles: UserRole[] }) =>
			usersService.update(userId, { roles }),
		onSuccess: () => {
			void queryClient.invalidateQueries({
				queryKey: ['schools', 'viewer', 'users'],
			});
			void queryClient.invalidateQueries({ queryKey: ['users', 'admin'] });
		},
	});
};
