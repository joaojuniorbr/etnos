'use client';

import { Breadcrumb, Select, Spin, Tabs, type TabsProps } from 'antd';
import { Title } from '@etnos/ui';
import { type SchoolInterface } from '@etnos/types';

import { SchoolData } from '..';

export type SchoolViewerEscolasSectionProps = Readonly<{
	isLoading: boolean;
	effectiveManagedSchoolId: string | undefined;
	selectedManagedSchool: SchoolInterface | null;
	managedSchools: SchoolInterface[];
	schoolViewerTabItems: TabsProps['items'];
	setSelectedSchoolId: (id: string) => void;
}>;

export function SchoolViewerEscolasSection({
	isLoading,
	effectiveManagedSchoolId,
	selectedManagedSchool,
	managedSchools,
	schoolViewerTabItems,
	setSelectedSchoolId,
}: SchoolViewerEscolasSectionProps) {
	if (!effectiveManagedSchoolId || !selectedManagedSchool) {
		return (
			<Spin spinning={isLoading}>
				<div className="container mx-auto py-4 px-6 md:py-10">
					<Breadcrumb
						items={[
							{ title: 'Home', href: '/' },
							{ title: 'Área da escola', href: '/admin' },
							{ title: 'Minhas escolas' },
						]}
					/>

					<Title className="mb-4 mt-6">Minhas Escolas</Title>
					<div className="rounded border border-slate-200 bg-white p-4">
						<p className="text-slate-600">
							Seu perfil ainda não possui escola vinculada para visualização.
							Peça para um administrador liberar o acesso.
						</p>
					</div>
				</div>
			</Spin>
		);
	}

	return (
		<Spin spinning={isLoading}>
			<div className="container mx-auto py-4 px-6 md:py-10">
				<Breadcrumb
					items={[
						{ title: 'Home', href: '/' },
						{ title: 'Área da escola', href: '/admin' },
						{ title: 'Minha escola' },
					]}
				/>

				<Title className="mb-4 mt-6">Minhas Escolas</Title>

				<div className="grid gap-6">
					<div className="max-w-md">
						<Select
							placeholder="Selecione uma escola"
							value={effectiveManagedSchoolId}
							onChange={setSelectedSchoolId}
							options={managedSchools.map((school) => ({
								value: school.id,
								label: school.name,
							}))}
							className="w-full"
						/>
					</div>
					<SchoolData school={selectedManagedSchool} />
					<Tabs defaultActiveKey="game-access" items={schoolViewerTabItems} />
				</div>
			</div>
		</Spin>
	);
}
