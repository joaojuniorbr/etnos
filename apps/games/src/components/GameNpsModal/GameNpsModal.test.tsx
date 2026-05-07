import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { GameNpsModal } from './GameNpsModal';

const { messageWarning } = vi.hoisted(() => ({
	messageWarning: vi.fn(),
}));

vi.mock('@etnos/ui', () => ({
	Button: ({
		children,
		onClick,
		disabled,
		loading,
	}: {
		children: React.ReactNode;
		onClick?: () => void;
		disabled?: boolean;
		loading?: boolean;
	}) => (
		<button type="button" onClick={onClick} disabled={disabled || loading}>
			{children}
		</button>
	),
}));

vi.mock('antd', () => ({
	Modal: ({
		open,
		children,
		title,
		onCancel,
	}: {
		open: boolean;
		children: React.ReactNode;
		title?: string;
		onCancel?: () => void;
	}) =>
		open ? (
			<div role="dialog" aria-label={title}>
				<button type="button" onClick={onCancel}>
					fechar-modal
				</button>
				{children}
			</div>
		) : null,
	Rate: ({
		value,
		onChange,
		count = 5,
	}: {
		value?: number;
		onChange?: (v: number) => void;
		count?: number;
	}) => (
		<div>
			{Array.from({ length: count }, (_, i) => (
				<button
					key={i}
					type="button"
					aria-label={`nota-${i + 1}`}
					onClick={() => onChange?.(i + 1)}
				>
					{i + 1}
				</button>
			))}
			<span data-testid="rate-value">{value ?? 0}</span>
		</div>
	),
	Input: {
		TextArea: (props: {
			value?: string;
			onChange?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
			placeholder?: string;
		}) => (
			<textarea
				data-testid="nps-comment"
				placeholder={props.placeholder}
				value={props.value}
				onChange={props.onChange}
			/>
		),
	},
	message: {
		warning: messageWarning,
	},
}));

describe('GameNpsModal', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('exibe aviso quando enviar sem nota', () => {
		const onSubmit = vi.fn();
		render(<GameNpsModal open onClose={vi.fn()} onSubmit={onSubmit} />);

		fireEvent.click(screen.getByRole('button', { name: /Enviar/i }));

		expect(messageWarning).toHaveBeenCalledWith('Selecione uma nota de 1 a 5.');
		expect(onSubmit).not.toHaveBeenCalled();
	});

	it('envia com comentário vazio como undefined', async () => {
		const onSubmit = vi.fn().mockResolvedValue(undefined);
		const onClose = vi.fn();

		render(<GameNpsModal open onClose={onClose} onSubmit={onSubmit} />);

		fireEvent.click(screen.getByRole('button', { name: /nota-4/i }));
		fireEvent.change(screen.getByTestId('nps-comment'), {
			target: { value: '   ' },
		});
		fireEvent.click(screen.getByRole('button', { name: /Enviar/i }));

		await waitFor(() => {
			expect(onSubmit).toHaveBeenCalledWith(4, undefined);
		});
		expect(onClose).toHaveBeenCalled();
	});

	it('envia com comentário preenchido', async () => {
		const onSubmit = vi.fn().mockResolvedValue(undefined);
		const onClose = vi.fn();

		render(<GameNpsModal open onClose={onClose} onSubmit={onSubmit} />);

		fireEvent.click(screen.getByRole('button', { name: /nota-5/i }));
		fireEvent.change(screen.getByTestId('nps-comment'), {
			target: { value: ' Muito bom ' },
		});
		fireEvent.click(screen.getByRole('button', { name: /Enviar/i }));

		await waitFor(() => {
			expect(onSubmit).toHaveBeenCalledWith(5, 'Muito bom');
		});
		expect(onClose).toHaveBeenCalled();
	});

	it('chama onClose ao pular', () => {
		const onClose = vi.fn();

		render(<GameNpsModal open onClose={onClose} onSubmit={vi.fn()} />);

		fireEvent.click(screen.getByRole('button', { name: /Pular/i }));

		expect(onClose).toHaveBeenCalled();
	});

	it('reseta nota ao fechar e reabrir o modal', () => {
		const onClose = vi.fn();
		const { rerender } = render(
			<GameNpsModal open={false} onClose={onClose} onSubmit={vi.fn()} />,
		);

		rerender(<GameNpsModal open onClose={onClose} onSubmit={vi.fn()} />);

		fireEvent.click(screen.getByRole('button', { name: /nota-3/i }));
		expect(screen.getByTestId('rate-value').textContent).toBe('3');

		rerender(
			<GameNpsModal open={false} onClose={onClose} onSubmit={vi.fn()} />,
		);
		rerender(<GameNpsModal open onClose={onClose} onSubmit={vi.fn()} />);

		expect(screen.getByTestId('rate-value').textContent).toBe('0');
	});
});
