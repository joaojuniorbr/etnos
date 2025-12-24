import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { ImageLibrary } from './ImageLibrary';
import { UserProfileInterface } from '@etnos/tools';

const mockDeleteMidia = vi.fn(() => Promise.resolve());
const mockFetchNextPage = vi.fn();
const mockRefetch = vi.fn();
const mockRefetchFolders = vi.fn();

vi.mock('@etnos/tools', () => ({
	useMidia: vi.fn(() => ({
		data: {
			pages: [
				{
					data: [
						{ id: '1', url: 'http://image/1.png' },
						{ id: '2', url: 'http://image/2.png' },
					],
				},
			],
		},
		hasNextPage: true,
		isFetchingNextPage: false,
		isLoading: false,
		isRefetching: false,
		folders: [
			{ folder: 'avatars', count: 2 },
			{ folder: 'posts', count: 5 },
		],
		isLoadingFolders: false,
		refetch: mockRefetch,
		refetchFolders: mockRefetchFolders,
		fetchNextPage: mockFetchNextPage,
		deleteMidia: mockDeleteMidia,
	})),
	midiaService: {
		uploadImage: vi.fn(),
		deleteMidiaFromUrl: vi.fn(),
	},
}));

vi.mock('../../@molecules', () => {
	return {
		ImageMultipleUpload: ({
			onUpload,
		}: {
			onUpload: (urls: string[]) => void;
		}) => (
			<button
				data-testid='mock-upload'
				onClick={() => onUpload?.(['http://image.com/uploaded.png'])}
			>
				Mock Upload
			</button>
		),
	};
});

const userMock = {
	uid: 'user-123',
	email: 'mock@example.com',
	childName: 'Usuário Mock',
} as UserProfileInterface;

describe('<ImageLibrary />', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('renderiza imagens da biblioteca', () => {
		const onSelectMock = vi.fn();
		render(
			<ImageLibrary
				user={userMock}
				onSelect={onSelectMock}
				itemsSelected={['http://image/1.png']}
			/>
		);

		const image = screen.getByAltText('http://image/1.png');

		expect(image).toBeInTheDocument();

		fireEvent.click(image);

		expect(onSelectMock).toHaveBeenCalledWith('http://image/1.png');
	});

	it('exclui imagem ao confirmar Popconfirm', async () => {
		render(<ImageLibrary user={userMock} />);

		const deleteButtons = screen.getAllByRole('button', {
			name: 'Excluir imagem',
		});

		expect(deleteButtons.length).toBeGreaterThan(0);

		fireEvent.click(deleteButtons[0]!);

		const confirmButton = screen.getByRole('button', { name: 'OK' });

		fireEvent.click(confirmButton);

		await waitFor(() => {
			expect(mockDeleteMidia).toHaveBeenCalledTimes(1);
			expect(mockRefetch).toHaveBeenCalled();
		});
	});

	it('chama fetchNextPage ao clicar em "Carregar mais"', () => {
		render(<ImageLibrary user={userMock} />);

		fireEvent.click(screen.getByText(/carregar mais/i));

		expect(mockFetchNextPage).toHaveBeenCalled();
	});

	it('altera a pasta selecionada', async () => {
		const user = userEvent.setup();

		render(<ImageLibrary user={userMock} />);

		const combobox = screen.getByRole('combobox');

		await user.click(combobox);

		const option = await screen.findByText('avatars (2)');
		await user.click(option);

		await waitFor(() => {
			const select = screen.getByTestId('select-folder');

			const value = select.querySelector('.ant-select-content-value');

			expect(value).toHaveTextContent('avatars (2)');
		});
	});

	it('abre o drawer de upload ao clicar em "Inserir Imagens"', async () => {
		const user = userEvent.setup();

		render(<ImageLibrary user={userMock} />);

		await user.click(screen.getByRole('button', { name: /inserir imagens/i }));

		expect(await screen.findByText('Adicionar Imagens')).toBeInTheDocument();
	});

	it('faz upload de imagem e chama refetch após onUpload', async () => {
		const user = userEvent.setup();

		render(<ImageLibrary user={userMock} />);

		await user.click(screen.getByRole('button', { name: /inserir imagens/i }));

		expect(await screen.findByText('Adicionar Imagens')).toBeInTheDocument();

		await user.click(screen.getByTestId('mock-upload'));

		await waitFor(() => {
			expect(mockRefetch).toHaveBeenCalled();
			expect(mockRefetchFolders).toHaveBeenCalled();
		});
	});
});
