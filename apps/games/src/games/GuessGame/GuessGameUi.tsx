'use client';

import { RiImage2Line, RiLightbulbLine } from 'react-icons/ri';

type GuessGameCardProps = {
	children: React.ReactNode;
	className?: string;
};

export const GuessGameCard = ({
	children,
	className = '',
}: GuessGameCardProps) => (
	<section
		className={`rounded bg-white p-4 border border-slate-200 ${className}`}
	>
		{children}
	</section>
);

type GuessGameSectionTitleProps = {
	children: React.ReactNode;
	className?: string;
};

export const GuessGameSectionTitle = ({
	children,
	className = '',
}: GuessGameSectionTitleProps) => (
	<h2 className={`mb-3 text-xs font-bold uppercase tracking-wide ${className}`}>
		{children}
	</h2>
);

type GuessGamePrimaryButtonProps = {
	children: React.ReactNode;
	onClick?: () => void;
	disabled?: boolean;
	className?: string;
	type?: 'button' | 'submit';
};

export const GuessGamePrimaryButton = ({
	children,
	onClick,
	disabled,
	className = '',
	type = 'button',
}: GuessGamePrimaryButtonProps) => (
	<button
		type={type}
		onClick={onClick}
		disabled={disabled}
		className={`rounded bg-primary px-4 py-3 text-sm font-bold uppercase tracking-wide text-white transition disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
	>
		{children}
	</button>
);

type GuessGameSecondaryButtonProps = {
	children: React.ReactNode;
	onClick?: () => void;
	disabled?: boolean;
	className?: string;
	icon?: React.ReactNode;
};

export const GuessGameSecondaryButton = ({
	children,
	onClick,
	disabled,
	className = '',
	icon,
}: GuessGameSecondaryButtonProps) => (
	<button
		type="button"
		onClick={onClick}
		disabled={disabled}
		className={`inline-flex items-center justify-center gap-2 rounded border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-primary transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
	>
		{icon}
		{children}
	</button>
);

type LetterBoxSize = 'large' | 'small';

type LetterBoxProps = {
	character?: string;
	isActive?: boolean;
	isMasked?: boolean;
	size?: LetterBoxSize;
	onClick?: () => void;
	testId?: string;
};

const letterBoxSizeClasses: Record<LetterBoxSize, string> = {
	large: 'h-14 w-14 text-2xl sm:h-16 sm:w-16 sm:text-3xl',
	small: 'h-10 w-10 text-lg sm:h-11 sm:w-11',
};

export const LetterBox = ({
	character,
	isActive = false,
	isMasked = false,
	size = 'large',
	onClick,
	testId,
}: LetterBoxProps) => {
	const displayValue = isMasked ? '' : (character ?? '');
	const isEmpty = !displayValue;

	return (
		<button
			type="button"
			data-testid={testId}
			onClick={onClick}
			className={`inline-flex items-center justify-center rounded border-2 bg-white font-bold text-primary transition ${letterBoxSizeClasses[size]} ${
				isActive ? 'border-secondary' : 'border-slate-200'
			} ${onClick ? 'cursor-pointer hover:border-secondary' : 'cursor-default'}`}
			aria-label={isEmpty ? 'Caixa vazia' : `Letra ${displayValue}`}
		>
			{displayValue}
		</button>
	);
};

type LetterBoxesRowProps = {
	letters: string[];
	maskChar?: string;
	activeIndex?: number;
	size?: LetterBoxSize;
	onBoxClick?: (index: number) => void;
	testIdPrefix?: string;
};

export const LetterBoxesRow = ({
	letters,
	maskChar = '•',
	activeIndex,
	size = 'large',
	onBoxClick,
	testIdPrefix = 'letter-box',
}: LetterBoxesRowProps) => (
	<div className="flex flex-wrap items-center justify-center gap-3">
		{letters.map((letter, index) => {
			const isMasked = letter === maskChar || letter === '';
			return (
				<LetterBox
					key={`${testIdPrefix}-${index}`}
					character={isMasked ? undefined : letter}
					isMasked={isMasked}
					isActive={activeIndex === index}
					size={size}
					onClick={onBoxClick ? () => onBoxClick(index) : undefined}
					testId={`${testIdPrefix}-${index}`}
				/>
			);
		})}
	</div>
);

type MaskedWordPreviewProps = {
	wordLength: number;
	revealedCount: number;
};

export const MaskedWordPreview = ({
	wordLength,
	revealedCount,
}: MaskedWordPreviewProps) => (
	<div className="rounded bg-slate-100 p-4">
		<p className="mb-4 text-sm font-bold uppercase tracking-wide text-primary">
			Palavra
		</p>
		<div className="flex flex-wrap items-bottom gap-2">
			{Array.from({ length: wordLength }, (_, index) => (
				<span
					key={`dash-${index}`}
					className={`text-xl font-bold ${
						index < revealedCount ? 'text-primary' : 'text-secondary'
					}`}
				>
					{index < revealedCount ? '•' : '—'}
				</span>
			))}
			<span className="text-xs text-primary">
				<strong>{wordLength}</strong> {wordLength === 1 ? 'letra' : 'letras'}
			</span>
		</div>
	</div>
);

type HintItemProps = {
	text: string;
};

export const HintItem = ({ text }: HintItemProps) => (
	<div className="flex items-center gap-2 text-sm text-primary">
		<RiLightbulbLine
			className="mt-0.5 shrink-0 text-xl text-secondary"
			aria-hidden
		/>
		<span>{text}</span>
	</div>
);

type ImagePlaceholderCardProps = {
	imageUrl?: string | null;
	title?: string;
	alt?: string;
};

export const ImagePlaceholderCard = ({
	imageUrl,
	title,
	alt,
}: ImagePlaceholderCardProps) => {
	if (imageUrl) {
		return (
			<GuessGameCard className="flex h-full min-h-[220px] items-center justify-center overflow-hidden p-2">
				<img
					src={imageUrl}
					alt={alt ?? title ?? 'Ilustração do jogo'}
					className="max-h-[280px] w-full rounded object-contain"
				/>
			</GuessGameCard>
		);
	}

	return (
		<GuessGameCard className="flex h-full flex-col items-center justify-center gap-2 p-6">
			<RiImage2Line className="text-8xl text-secondary" />
			{title ? (
				<p className="text-sm text-primary">
					Imagem: <strong className="uppercase">{title}</strong>
				</p>
			) : null}
		</GuessGameCard>
	);
};
