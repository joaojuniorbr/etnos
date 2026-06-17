import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { LetterBox } from './GuessGameUi';

describe('GuessGameUi', () => {
	it('renderiza caixa vazia sem caractere informado', () => {
		render(<LetterBox isMasked={false} testId="letter-box-empty" />);

		expect(screen.getByTestId('letter-box-empty').textContent).toBe('');
		expect(screen.getByLabelText('Caixa vazia')).toBeTruthy();
	});

	it('encaminha clique quando onClick for informado', () => {
		const onClick = vi.fn();

		render(
			<LetterBox
				character="A"
				onClick={onClick}
				testId="letter-box-clickable"
			/>,
		);

		fireEvent.click(screen.getByTestId('letter-box-clickable'));

		expect(onClick).toHaveBeenCalledTimes(1);
	});
});
