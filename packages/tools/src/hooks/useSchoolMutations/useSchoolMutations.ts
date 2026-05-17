'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { SchoolInterface } from '@etnos/types';
import { schoolKeys } from '../../query-keys';
import { schoolService } from '@etnos/services';

export const useSchoolMutations = () => {
	const queryClient = useQueryClient();

	const invalidateSchools = () => {
		void queryClient.invalidateQueries({ queryKey: schoolKeys.all() });
	};

	const invalidateAccessUsers = () => {
		void queryClient.invalidateQueries({
			queryKey: ['schools', 'admin', 'access-users'],
		});
	};

	const createSchool = useMutation({
		mutationFn: (values: SchoolInterface) => schoolService.create(values),
		onSuccess: invalidateSchools,
	});

	const deleteSchool = useMutation({
		mutationFn: (id: string) => schoolService.delete(id),
		onSuccess: invalidateSchools,
	});

	const updateSchoolField = useMutation({
		mutationFn: ({
			id,
			field,
			value,
		}: {
			id: string;
			field: string;
			value: string;
		}) => schoolService.update(id, { [field]: value }),
		onSuccess: invalidateSchools,
	});

	const addSchoolAccessUser = useMutation({
		mutationFn: ({ schoolId, email }: { schoolId: string; email: string }) =>
			schoolService.addAccessUserToSchool(schoolId, email),
		onSuccess: invalidateAccessUsers,
	});

	const removeSchoolAccessUser = useMutation({
		mutationFn: ({ schoolId, userId }: { schoolId: string; userId: string }) =>
			schoolService.removeAccessUserFromSchool(schoolId, userId),
		onSuccess: invalidateAccessUsers,
	});

	const updateSchoolGameAccess = useMutation({
		mutationFn: ({
			schoolId,
			payload,
		}: {
			schoolId: string;
			payload: Parameters<typeof schoolService.updateGameAccessBySchool>[1];
		}) => schoolService.updateGameAccessBySchool(schoolId, payload),
		onSuccess: () => {
			void queryClient.invalidateQueries({
				queryKey: ['schools', 'game-access'],
			});
		},
	});

	return {
		createSchool,
		deleteSchool,
		updateSchoolField,
		addSchoolAccessUser,
		removeSchoolAccessUser,
		updateSchoolGameAccess,
	};
};
