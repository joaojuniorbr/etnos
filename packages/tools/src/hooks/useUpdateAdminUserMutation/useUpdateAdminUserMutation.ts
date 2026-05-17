'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { UpdateAdminUserPayload } from '@etnos/types';
import { usersService } from '@etnos/services';

export const useUpdateAdminUserMutation = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({
			id,
			payload,
		}: {
			id: string;
			payload: UpdateAdminUserPayload;
		}) => usersService.update(id, payload),
		onSuccess: () => {
			void queryClient.invalidateQueries({ queryKey: ['users', 'admin'] });
		},
	});
};
