'use client';

import Image from 'next/image';
import { api } from '@etnos/common';
import { SignUpForm } from '@etnos/ui';
import { QUERY_STALE_TIME, schoolKeys, useAuth } from '@etnos/tools';
import { useQuery } from '@tanstack/react-query';
import { Alert, Spin } from 'antd';
import { use, useEffect, useMemo } from 'react';

interface SchoolPublicData {
	id: string;
	name: string;
	code?: string | null;
}

interface CadastroEscolaPageProps {
	params: Promise<{
		schoolCode: string;
	}>;
}

export default function CadastroEscolaPage(
	props: Readonly<CadastroEscolaPageProps>,
) {
	const { schoolCode } = use(props.params);
	const { user, isProfileLoading } = useAuth();

	const onRegisterSuccess = () => {
		window.open('/estudante', '_self');
	};

	useEffect(() => {
		if (user?.email) {
			onRegisterSuccess();
		}
	}, [user]);

	const { data: schools, isLoading: isLoadingSchool } = useQuery({
		queryKey: schoolKeys.public(),
		staleTime: QUERY_STALE_TIME.catalog,
		queryFn: () =>
			api.get<SchoolPublicData[]>('/public/schools').then((res) => res.data),
	});

	const schoolCodeNormalized = decodeURIComponent(schoolCode || '')
		.trim()
		.toLowerCase();

	const selectedSchool = useMemo(() => {
		return schools?.find(
			(school) => school.id.toLowerCase() === schoolCodeNormalized,
		);
	}, [schools, schoolCodeNormalized]);

	const isError = !isLoadingSchool && !selectedSchool;

	return (
		<Spin spinning={isProfileLoading} size="large">
			<div className="p-6 md:p-8">
				<div className="container mx-auto">
					<div className="flex flex-col w-full rounded bg-white shadow md:flex-row ">
						<div className="p-6 md:p-8 lg:w-1/2">
							{isError ? (
								<Alert
									type="error"
									showIcon
									title="Código de escola inválido"
									description="Verifique o link recebido e tente novamente."
								/>
							) : (
								<SignUpForm
									isLoadingSchools={isLoadingSchool}
									onRegisterSuccess={onRegisterSuccess}
									preselectedSchool={
										selectedSchool
											? { id: selectedSchool.id, name: selectedSchool.name }
											: undefined
									}
									isSimplified
								/>
							)}
						</div>

						<Image
							src="/images/persona-sign-in.jpg"
							alt="Cadastro de escola"
							width={800}
							height={800}
							className="object-cover object-center w-full border-slate-200 md:border-l md:w-1/2 md:rounded-tr md:rounded-br"
							suppressHydrationWarning
						/>
					</div>
				</div>
			</div>
		</Spin>
	);
}
