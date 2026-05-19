import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { UserProfileInterface } from '@etnos/types';
import { useMidia } from '@etnos/tools';

import { MidiaManager } from './MidiaManager';

const mockUpdateMidiaFolder = vi.fn(() => Promise.resolve());
const mockDeleteMidia = vi.fn(() => Promise.resolve());
const mockRefetch = vi.fn();
const mockRefetchFolders = vi.fn();
const mockFetchNextPage = vi.fn();
const mockMessageSuccess = vi.fn();
const mockMessageError = vi.fn();

const defaultMidiaItem = {
	id: '1',
	url: 'http://image/1.png',
	folder: null as string | null,
};

const defaultUseMidiaReturn = {
	data: {
		pages: [{ data: [defaultMidiaItem] }],
	},
	hasNextPage: false,
	isFetchingNextPage: false,
	isLoading: false,
	isRefetching: false,
	folders: [{ folder: 'library', count: 2 }],
	uncategorizedCount: 1,
	isLoadingFolders: false,
	refetch: mockRefetch,
	refetchFolders: mockRefetchFolders,
	fetchNextPage: mockFetchNextPage,
	deleteMidia: mockDeleteMidia,
	updateMidiaFolder: mockUpdateMidiaFolder,
	isUpdatingFolder: false,
};

vi.mock('@etnos/tools', () => ({
	useMidia: vi.fn(),
}));

vi.mock('antd', async () => {
	const actual = await vi.importActual<typeof import('antd')>('antd');

	return {
		...actual,
		message: {
			...actual.message,
			success: (...args: unknown[]) => mockMessageSuccess(...args),
			error: (...args: unknown[]) => mockMessageError(...args),
		},
	};
});

vi.mock('@ui/@molecules', () => ({
	ImageMultipleUpload: ({
		onUpload,
	}: {
		onUpload?: () => void;
	}) => (
		<button type="button" data-testid="mock-upload" onClick={() => onUpload?.()}>
			Mock Upload
		</button>
	),
}));

const userMock = {
	uid: 'user-123',
	email: 'mock@example.com',
	childName: 'Usuário Mock',
} as UserProfileInterface;

function getOpenSelectDropdown() {
	const dropdowns = Array.from(
		document.querySelectorAll('.ant-select-dropdown'),
	).filter((node) => !node.classList.contains('ant-select-dropdown-hidden'));

	return dropdowns.at(-1) as HTMLElement;
}

describe('<MidiaManager />', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		vi.mocked(useMidia).mockReturnValue(defaultUseMidiaReturn as never);
	});

	it('renderiza filtro, pasta pendente e mídia sem pasta', () => {
		render(<MidiaManager user={userMock} />);

		expect(screen.getByTestId('midia-folder-filter')).toBeInTheDocument();
		expect(screen.getByText('Todas as imagens')).toBeInTheDocument();
		expect(screen.getAllByText('Sem pasta').length).toBeGreaterThan(0);
		expect(screen.getByAltText('Sem pasta')).toBeInTheDocument();
	});

	it('adiciona pasta pendente às opções de mover', async () => {
		const user = userEvent.setup();

		render(<MidiaManager user={userMock} />);

		await user.type(
			screen.getByPlaceholderText(
				/Digite um nome de pasta para usar ao mover imagens/i,
			),
			'nova-pasta',
		);

		const moveSelect = screen.getByLabelText('Mover imagem para outra pasta');
		await user.click(moveSelect);

		const dropdown = getOpenSelectDropdown();
		expect(
			within(dropdown).getByText('nova-pasta'),
		).toBeInTheDocument();
	});

	it('move imagem para outra pasta com sucesso', async () => {
		const user = userEvent.setup();

		render(<MidiaManager user={userMock} />);

		const moveSelect = screen.getByLabelText('Mover imagem para outra pasta');
		await user.click(moveSelect);

		const dropdown = getOpenSelectDropdown();
		await user.click(within(dropdown).getByTitle('library'));

		await waitFor(() => {
			expect(mockUpdateMidiaFolder).toHaveBeenCalledWith({
				id: '1',
				folder: 'library',
			});
			expect(mockMessageSuccess).toHaveBeenCalledWith(
				'Imagem movida com sucesso',
			);
			expect(mockRefetch).toHaveBeenCalled();
			expect(mockRefetchFolders).toHaveBeenCalled();
		});
	});

	it('move imagem para sem pasta', async () => {
		vi.mocked(useMidia).mockReturnValue({
			...defaultUseMidiaReturn,
			data: {
				pages: [
					{
						data: [
							{
								id: '1',
								url: 'http://image/1.png',
								folder: 'library',
							},
						],
					},
				],
			},
		} as never);

		const user = userEvent.setup();

		render(<MidiaManager user={userMock} />);

		await user.click(screen.getByLabelText('Mover imagem para outra pasta'));

		const dropdown = getOpenSelectDropdown();
		const semPastaOption = dropdown.querySelector('.ant-select-item-option');

		expect(semPastaOption).toHaveTextContent('Sem pasta');
		await user.click(semPastaOption!);

		await waitFor(() => {
			expect(mockUpdateMidiaFolder).toHaveBeenCalledWith({
				id: '1',
				folder: null,
			});
		});
	});

	it('exibe erro ao falhar ao mover imagem', async () => {
		mockUpdateMidiaFolder.mockRejectedValueOnce(new Error('fail'));
		const user = userEvent.setup();

		render(<MidiaManager user={userMock} />);

		const moveSelect = screen.getByLabelText('Mover imagem para outra pasta');
		await user.click(moveSelect);

		const dropdown = getOpenSelectDropdown();
		await user.click(within(dropdown).getByTitle('library'));

		await waitFor(() => {
			expect(mockMessageError).toHaveBeenCalledWith(
				'Não foi possível mover a imagem',
			);
		});
	});

	it('não move imagem sem id', async () => {
		vi.mocked(useMidia).mockReturnValue({
			...defaultUseMidiaReturn,
			data: {
				pages: [{ data: [{ url: 'http://image/sem-id.png', folder: null }] }],
			},
		} as never);

		const user = userEvent.setup();
		render(<MidiaManager user={userMock} />);

		const moveSelect = screen.getByLabelText('Mover imagem para outra pasta');
		await user.click(moveSelect);

		const dropdown = getOpenSelectDropdown();
		await user.click(within(dropdown).getByTitle('library'));

		expect(mockUpdateMidiaFolder).not.toHaveBeenCalled();
	});

	it('altera filtro de pasta', async () => {
		const user = userEvent.setup();

		render(<MidiaManager user={userMock} />);

		await user.click(screen.getByTestId('midia-folder-filter'));
		const filterDropdown = getOpenSelectDropdown();
		await user.click(within(filterDropdown).getByText('library (2)'));

		await waitFor(() => {
			expect(useMidia).toHaveBeenCalledWith(
				'user-123',
				24,
				'library',
				true,
			);
		});
	});

	it('exclui imagem ao confirmar', async () => {
		render(<MidiaManager user={userMock} />);

		fireEvent.click(screen.getByRole('button', { name: 'Excluir imagem' }));
		fireEvent.click(screen.getByRole('button', { name: 'OK' }));

		await waitFor(() => {
			expect(mockDeleteMidia).toHaveBeenCalled();
			expect(mockRefetch).toHaveBeenCalled();
			expect(mockRefetchFolders).toHaveBeenCalled();
		});
	});

	it('abre drawer de upload e dispara refetch após upload', async () => {
		const user = userEvent.setup();

		render(<MidiaManager user={userMock} />);

		await user.click(screen.getByRole('button', { name: /inserir imagens/i }));
		expect(screen.getByText('Adicionar imagens')).toBeInTheDocument();

		await user.click(screen.getByTestId('mock-upload'));

		await waitFor(() => {
			expect(mockRefetch).toHaveBeenCalled();
			expect(mockRefetchFolders).toHaveBeenCalled();
		});
	});

	it('fecha drawer de upload', async () => {
		const user = userEvent.setup();

		render(<MidiaManager user={userMock} />);

		await user.click(screen.getByRole('button', { name: /inserir imagens/i }));
		expect(screen.getByText('Adicionar imagens')).toBeInTheDocument();

		await user.click(screen.getByRole('button', { name: 'Close' }));

		await waitFor(() => {
			expect(screen.queryByText('Adicionar imagens')).not.toBeInTheDocument();
		});
	});

	it('carrega mais imagens quando houver próxima página', async () => {
		vi.mocked(useMidia).mockReturnValue({
			...defaultUseMidiaReturn,
			hasNextPage: true,
		} as never);

		const user = userEvent.setup();
		render(<MidiaManager user={userMock} />);

		await user.click(screen.getByRole('button', { name: /carregar mais/i }));

		expect(mockFetchNextPage).toHaveBeenCalled();
	});
});
