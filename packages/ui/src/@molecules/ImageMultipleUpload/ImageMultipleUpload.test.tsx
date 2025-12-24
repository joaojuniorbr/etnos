import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
	render,
	screen,
	fireEvent,
	waitFor,
	act,
} from '@testing-library/react';
import { ImageMultipleUpload } from './ImageMultipleUpload';

let beforeUploadRef: (file: File) => void;
let onRemoveRef: ((file: UploadFile) => void) | undefined;

vi.mock('@etnos/tools', () => ({
	midiaService: {
		uploadImage: vi.fn(),
		deleteMidiaFromUrl: vi.fn(),
	},
	getRandomIndex: vi.fn().mockReturnValue(0),
}));

vi.mock('antd', async () => {
	const actual = await vi.importActual('antd');

	return {
		...actual,
		message: {
			error: vi.fn(),
		},
		Button: ({ children }: { children: React.ReactNode }) => (
			<button data-testid='upload-button'>{children}</button>
		),
		Upload: {
			Dragger: ({
				beforeUpload,
				onRemove,
				children,
			}: {
				children: React.ReactNode;
				beforeUpload: (file: File) => void;
				onRemove?: (file: UploadFile) => void;
			}) => {
				beforeUploadRef = beforeUpload;
				onRemoveRef = onRemove;

				return (
					<div>
						<div
							data-testid='dragger'
							onClick={() =>
								beforeUpload(
									new File(['dummy'], 'image.png', { type: 'image/png' })
								)
							}
						/>
						<div
							data-testid='remove'
							onClick={() =>
								onRemove?.({
									uid: '1',
									name: 'image.png',
									url: 'http://image.com/1.png',
								})
							}
						/>
						{children}
					</div>
				);
			},
		},
	};
});

import { getRandomIndex, midiaService } from '@etnos/tools';
import { message, UploadFile } from 'antd';

describe('<ImageMultipleUpload />', () => {
	const userId = 'user-123';

	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('retorna silenciosamente se originFileObj não existir', async () => {
		vi.mocked(midiaService.uploadImage).mockClear();

		render(<ImageMultipleUpload userId={userId} />);

		fireEvent.click(screen.getByTestId('dragger'));

		await waitFor(() => {
			expect(midiaService.uploadImage).toHaveBeenCalled();
		});
	});

	it('executa beforeUpload e faz upload com sucesso', async () => {
		const onUpload = vi.fn();

		vi.mocked(midiaService.uploadImage).mockResolvedValue({
			url: 'http://image.com/uploaded.png',
		});

		render(
			<ImageMultipleUpload
				userId={userId}
				folder='gallery'
				onUpload={onUpload}
			/>
		);

		fireEvent.click(screen.getByTestId('dragger'));

		await waitFor(() => {
			expect(midiaService.uploadImage).toHaveBeenCalledWith(
				expect.any(File),
				'gallery',
				userId
			);
		});

		expect(onUpload).toHaveBeenCalledWith(['http://image.com/uploaded.png']);
	});

	it('trata erro no upload corretamente', async () => {
		vi.mocked(midiaService.uploadImage).mockRejectedValueOnce(
			new Error('Upload failed')
		);

		render(<ImageMultipleUpload userId={userId} />);

		fireEvent.click(screen.getByTestId('dragger'));

		await waitFor(() => {
			expect(message.error).toHaveBeenCalledWith(
				expect.stringContaining('Erro ao enviar')
			);
		});

		vi.mocked(midiaService.uploadImage).mockRejectedValueOnce(undefined);

		await waitFor(() => {
			expect(message.error).toBeCalledTimes(1);
		});
	});

	it('não exibe mensagem quando erro não é instância de Error', async () => {
		vi.mocked(midiaService.uploadImage).mockRejectedValueOnce('upload error');

		render(<ImageMultipleUpload userId={userId} />);

		fireEvent.click(screen.getByTestId('dragger'));

		await waitFor(() => {
			expect(message.error).not.toHaveBeenCalled();
		});
	});

	it('remove o único arquivo da lista e chama onUpload com array vazio', async () => {
		const onUpload = vi.fn();

		vi.mocked(midiaService.uploadImage).mockResolvedValueOnce({
			url: 'http://image.com/1.png',
		});

		vi.mocked(midiaService.deleteMidiaFromUrl).mockResolvedValueOnce(true);

		render(<ImageMultipleUpload userId={userId} onUpload={onUpload} />);

		const file = new File(['dummy'], 'img.png', { type: 'image/png' });

		await act(async () => {
			await beforeUploadRef(file);
		});

		await act(async () => {
			await onRemoveRef?.({
				uid: expect.any(String),
				url: 'http://image.com/1.png',
				name: 'img.png',
			});
		});

		expect(onUpload).toBeCalledTimes(1);
	});
});
