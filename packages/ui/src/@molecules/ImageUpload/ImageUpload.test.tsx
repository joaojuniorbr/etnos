import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ImageUpload } from './ImageUpload';

vi.mock('@etnos/services', () => ({
	midiaService: {
		uploadImage: vi.fn(),
	},
}));

vi.mock('antd', async () => {
	const actual = await vi.importActual<typeof import('antd')>('antd');

	return {
		...actual,
		message: {
			success: vi.fn(),
			error: vi.fn(),
		},
		Image: ({ src }: { src: string }) => (
			<img data-testid="uploaded-image" src={src} />
		),
		Upload: ({
			beforeUpload,
			children,
		}: {
			beforeUpload: (file: File) => void;
			children: React.ReactNode;
		}) => (
			<div
				data-testid="upload"
				onClick={() =>
					beforeUpload(new File(['dummy'], 'image.png', { type: 'image/png' }))
				}
			>
				{children}
			</div>
		),
		Spin: ({
			spinning,
			children,
		}: {
			spinning: boolean;
			children: React.ReactNode;
		}) => (
			<div data-testid="spin" data-spinning={spinning}>
				{children}
			</div>
		),
	};
});

import { message } from 'antd';
import { midiaService } from '@etnos/services';

describe('<ImageUpload />', () => {
	const userId = 'user-123';

	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('renderiza estado inicial sem imagem', () => {
		render(<ImageUpload userId={userId} />);

		expect(screen.getByText(/adicionar/i)).toBeInTheDocument();
	});

	it('renderiza imagem quando defaultImage é passada', () => {
		render(
			<ImageUpload userId={userId} defaultImage="http://image.com/test.png" />,
		);

		const image = screen.getByTestId('uploaded-image');
		expect(image).toHaveAttribute('src', 'http://image.com/test.png');
	});

	it('faz upload com sucesso, chama callbacks e mostra mensagem', async () => {
		const onUpload = vi.fn();

		vi.mocked(midiaService.uploadImage).mockResolvedValueOnce({
			url: 'http://image.com/uploaded.png',
		});

		render(
			<ImageUpload userId={userId} folder="avatars" onUpload={onUpload} />,
		);

		fireEvent.click(screen.getByTestId('upload'));

		await waitFor(() => {
			expect(midiaService.uploadImage).toHaveBeenCalledWith(
				expect.any(File),
				'avatars',
				userId,
			);
		});

		expect(onUpload).toHaveBeenCalledWith('http://image.com/uploaded.png');

		expect(message.success).toHaveBeenCalledWith('Imagem enviada com sucesso!');

		const image = screen.getByTestId('uploaded-image');
		expect(image).toHaveAttribute('src', 'http://image.com/uploaded.png');
	});

	it('trata erro no upload e exibe mensagem de erro', async () => {
		vi.mocked(midiaService.uploadImage).mockRejectedValueOnce(
			new Error('Upload error'),
		);

		render(<ImageUpload userId={userId} />);

		fireEvent.click(screen.getByTestId('upload'));

		await waitFor(() => {
			expect(message.error).toHaveBeenCalledWith('Upload error');
		});

		vi.mocked(midiaService.uploadImage).mockRejectedValueOnce(undefined);

		fireEvent.click(screen.getByTestId('upload'));

		await waitFor(() => {
			expect(message.error).toHaveBeenCalledWith('Erro ao fazer upload.');
		});
	});
});
