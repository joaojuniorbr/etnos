'use client';

import { Spin } from 'antd';
import { useCallback, useEffect, useRef, useState } from 'react';
import { RiLightbulbLine } from 'react-icons/ri';

import type {
	CharacterInterface,
	GuessGamePlayItemInterface,
	GuessGameValidationPayloadInterface,
	GuessGameValidationResultInterface,
} from '@etnos/types';
import { FinishGame, GameNpsModal } from '../../components';
import type { GameFinishedPayload } from '../game-finished.types';
import {
	getGuessGameLetterHitPoints,
	getGuessGameRevealedLettersCount,
	getGuessGameTipPenalty,
	getGuessGameWordSolvePoints,
} from './guess-game.scoring';
import {
	GuessGameCard,
	GuessGamePrimaryButton,
	GuessGameSecondaryButton,
	GuessGameSectionTitle,
	HintItem,
	ImagePlaceholderCard,
	LetterBoxesRow,
	MaskedWordPreview,
} from './GuessGameUi';

const CHARACTER_DEFAULT = '•';
const TOTAL_GUESS = 10;

const getMaskedWord = (wordLength = 0) => CHARACTER_DEFAULT.repeat(wordLength);

const splitWordSlots = (value: string, length: number) => {
	const chars = value.split('');

	while (chars.length < length) {
		chars.push('');
	}

	return chars.slice(0, length);
};

const joinWordSlots = (slots: string[]) => slots.join('').trim();

type GuessGameExperienceProps = {
	content?: GuessGamePlayItemInterface | null;
	bestScore?: number;
	isLoading?: boolean;
	isValidating?: boolean;
	selectedCharacter?: CharacterInterface;
	onPlaySound?: (sound: 'flip' | 'error' | 'finish') => void;
	onNextRound?: () => void;
	onSaveScore?: (score: number) => Promise<void> | void;
	onSaveScoreHistory?: (score: number) => Promise<void> | void;
	onGameFinished?: (payload: GameFinishedPayload) => void;
	onRoundSessionStart?: () => Promise<void> | void;
	onSessionReset?: () => void;
	onValidateAttempt: (
		payload: GuessGameValidationPayloadInterface,
	) => Promise<GuessGameValidationResultInterface>;
	npsEnabled?: boolean;
	npsGameSlug?: string;
	npsCharacterSlug?: string;
	onSubmitGameNps?: (
		gameSlug: string,
		characterSlug: string,
		rating: number,
		comment?: string,
	) => Promise<void>;
};

export const GuessGameExperience = ({
	bestScore = 0,
	content,
	isLoading = false,
	isValidating = false,
	selectedCharacter,
	onPlaySound,
	onNextRound,
	onSaveScore,
	onSaveScoreHistory,
	onGameFinished,
	onRoundSessionStart,
	onSessionReset,
	onValidateAttempt,
	npsEnabled = false,
	npsGameSlug,
	npsCharacterSlug,
	onSubmitGameNps,
}: GuessGameExperienceProps) => {
	const [isSavingScore, setIsSavingScore] = useState(false);
	const [guesses, setGuesses] = useState('');
	const [letterInput, setLetterInput] = useState('');
	const [attempt, setAttempt] = useState('');
	const [activeAttemptIndex, setActiveAttemptIndex] = useState(0);
	const [countTips, setCountTips] = useState(0);
	const [countGuess, setCountGuess] = useState(0);
	const [score, setScore] = useState(0);
	const [isFinished, setIsFinished] = useState(false);
	const [isLoser, setIsLoser] = useState(false);
	const [solvedWord, setSolvedWord] = useState<string>();
	const [solvedDescription, setSolvedDescription] = useState<string>();
	const autoSavedScoreRef = useRef<number | null>(null);
	const gameFinishedTrackedRef = useRef(false);
	const letterInputRef = useRef<HTMLInputElement>(null);
	const wordGuessSectionRef = useRef<HTMLDivElement>(null);
	const activeAttemptIndexRef = useRef(0);
	const [npsOpen, setNpsOpen] = useState(false);

	const wordLength = content?.wordLength ?? 0;
	const displayedGuesses = guesses || getMaskedWord(wordLength);
	const revealedLettersCount =
		getGuessGameRevealedLettersCount(displayedGuesses);
	const attemptSlots = splitWordSlots(attempt, wordLength);
	const displayedGuessLetters = displayedGuesses.split('');

	const canShowNps = Boolean(
		npsEnabled && npsGameSlug && npsCharacterSlug && onSubmitGameNps,
	);

	useEffect(() => {
		if (isFinished && !isLoser && canShowNps) {
			setNpsOpen(true);
		} else {
			setNpsOpen(false);
		}
	}, [isFinished, isLoser, canShowNps]);

	const resetRound = () => {
		setLetterInput('');
		setAttempt('');
		activeAttemptIndexRef.current = 0;
		setActiveAttemptIndex(0);
		setCountTips(0);
		setCountGuess(0);
		setScore(0);
		setIsFinished(false);
		setIsLoser(false);
		setSolvedWord(undefined);
		setSolvedDescription(undefined);
		setGuesses('');
		autoSavedScoreRef.current = null;
		gameFinishedTrackedRef.current = false;
		onSessionReset?.();
	};

	const handleSolved = (
		result: GuessGameValidationResultInterface,
		total: number,
		currentGuesses: string,
	) => {
		const revealed = getGuessGameRevealedLettersCount(currentGuesses);
		const solvePoints = getGuessGameWordSolvePoints(total, revealed);

		setScore((prev) => prev + solvePoints);
		setSolvedWord(result.word);
		setSolvedDescription(result.description);
		setGuesses(result.word ?? currentGuesses);
		onPlaySound?.('finish');
		setIsFinished(true);
	};

	const handleFailedAttempt = () => {
		if (TOTAL_GUESS > countGuess) {
			setCountGuess((prev) => prev + 1);
			return;
		}

		setIsLoser(true);
		setIsFinished(true);
	};

	const checkGuess = async (guess: string) => {
		if (!content?.id || !guess) {
			return;
		}

		const result = await onValidateAttempt({
			contentId: content.id,
			guess,
			type: 'letter',
		});

		if (!result.isCorrect) {
			onPlaySound?.('error');
			handleFailedAttempt();
			return;
		}

		onPlaySound?.('flip');
		setScore((prev) => prev + getGuessGameLetterHitPoints());
		const updatedGuesses = displayedGuesses.split('');

		result.matchedIndexes.forEach((matchedIndex, index) => {
			updatedGuesses[matchedIndex] = result.revealedCharacters[index] ?? '';
		});

		const nextGuesses = updatedGuesses.join('');
		setGuesses(nextGuesses);

		if (!nextGuesses.includes(CHARACTER_DEFAULT)) {
			const solvedResult = await onValidateAttempt({
				contentId: content.id,
				guess: nextGuesses,
				type: 'word',
			});

			handleSolved(solvedResult, content.wordLength, nextGuesses);
		}
	};

	const checkWord = async () => {
		if (!content?.id || (wordLength > 0 && !attempt)) {
			return;
		}

		const result = await onValidateAttempt({
			contentId: content.id,
			guess: attempt,
			type: 'word',
		});

		if (!result.isCorrect) {
			onPlaySound?.('error');
			handleFailedAttempt();
			return;
		}

		handleSolved(result, content.wordLength, displayedGuesses);
	};

	const getTips = () => {
		if (content && countTips < content.tips.length) {
			setCountTips((prev) => prev + 1);
			setScore((prev) => Math.max(prev - getGuessGameTipPenalty(), 0));
			return;
		}

		onPlaySound?.('error');
	};

	const handleRestart = () => {
		resetRound();
		onNextRound?.();
	};

	const handleSaveScore = async () => {
		setIsSavingScore(true);

		try {
			await onSaveScore?.(score);
		} finally {
			setIsSavingScore(false);
		}
	};

	const handleLetterSubmit = () => {
		const normalized = letterInput.trim().toUpperCase();

		if (!normalized) {
			return;
		}

		void checkGuess(normalized.charAt(0));
		setLetterInput('');
		letterInputRef.current?.focus();
	};

	const updateAttemptAtIndex = useCallback(
		(index: number, char: string) => {
			setAttempt((current) => {
				const nextSlots = splitWordSlots(current, wordLength);
				nextSlots[index] = char;
				return joinWordSlots(nextSlots);
			});

			if (char && index < wordLength - 1) {
				const nextIndex = index + 1;
				activeAttemptIndexRef.current = nextIndex;
				setActiveAttemptIndex(nextIndex);
			}
		},
		[wordLength],
	);

	const handleAttemptBackspace = useCallback(() => {
		const currentIndex = activeAttemptIndexRef.current;

		setAttempt((current) => {
			const nextSlots = splitWordSlots(current, wordLength);

			if (nextSlots[currentIndex]) {
				nextSlots[currentIndex] = '';
				return joinWordSlots(nextSlots);
			}

			if (currentIndex > 0) {
				const previousIndex = currentIndex - 1;
				nextSlots[previousIndex] = '';
				activeAttemptIndexRef.current = previousIndex;
				setActiveAttemptIndex(previousIndex);
				return joinWordSlots(nextSlots);
			}

			return current;
		});
	}, [wordLength]);

	const handleWordGuessKeyDown = useCallback(
		(event: KeyboardEvent) => {
			if (isFinished || !wordLength) {
				return;
			}

			if (event.key === 'Backspace') {
				event.preventDefault();
				handleAttemptBackspace();
				return;
			}

			if (event.key.length === 1 && /^[a-zA-ZÀ-ÿ]$/.test(event.key)) {
				event.preventDefault();
				updateAttemptAtIndex(
					activeAttemptIndexRef.current,
					event.key.toUpperCase(),
				);
			}
		},
		[handleAttemptBackspace, isFinished, updateAttemptAtIndex, wordLength],
	);

	useEffect(() => {
		if (!content?.id) {
			return;
		}

		void onRoundSessionStart?.();
	}, [content?.id, onRoundSessionStart]);

	useEffect(() => {
		if (!isFinished) {
			autoSavedScoreRef.current = null;
			gameFinishedTrackedRef.current = false;
			return;
		}

		if (!gameFinishedTrackedRef.current) {
			gameFinishedTrackedRef.current = true;
			onGameFinished?.({
				score,
				outcome: isLoser ? 'lost' : 'won',
			});
		}
	}, [isFinished, isLoser, onGameFinished, score]);

	useEffect(() => {
		if (!isFinished) {
			autoSavedScoreRef.current = null;
			return;
		}

		if (autoSavedScoreRef.current === score) {
			return;
		}

		autoSavedScoreRef.current = score;
		void (async () => {
			await onSaveScore?.(score);
			await onSaveScoreHistory?.(score);
		})();
	}, [isFinished, onSaveScore, onSaveScoreHistory, score]);

	useEffect(() => {
		const section = wordGuessSectionRef.current;

		if (!section || isFinished) {
			return;
		}

		section.addEventListener('keydown', handleWordGuessKeyDown);

		return () => {
			section.removeEventListener('keydown', handleWordGuessKeyDown);
		};
	}, [handleWordGuessKeyDown, isFinished]);

	useEffect(() => {
		setActiveAttemptIndex((current) => {
			const nextIndex = wordLength ? Math.min(current, wordLength - 1) : 0;
			activeAttemptIndexRef.current = nextIndex;
			return nextIndex;
		});
	}, [wordLength]);

	useEffect(() => {
		activeAttemptIndexRef.current = activeAttemptIndex;
	}, [activeAttemptIndex]);

	const visibleTips = content?.tips.slice(0, countTips) ?? [];
	const remainingTips = (content?.tips.length ?? 0) - countTips;
	const livesLeft = TOTAL_GUESS - countGuess;

	return (
		<Spin spinning={isLoading || isValidating || isSavingScore}>
			<div className="mx-auto w-full max-w-4xl space-y-4">
				{canShowNps && npsGameSlug && npsCharacterSlug && onSubmitGameNps ? (
					<GameNpsModal
						open={npsOpen}
						onClose={() => setNpsOpen(false)}
						onSubmit={(rating, comment) =>
							onSubmitGameNps(npsGameSlug, npsCharacterSlug, rating, comment)
						}
					/>
				) : null}

				{isFinished ? (
					<>
						<GuessGameCard>
							<div
								className="text-center"
								data-aria-label={`Palavra correta - Seu recorde é de ${bestScore} pontos`}
							>
								<p className="mb-2 text-sm uppercase text-primary">
									A palavra correta é:
								</p>
								<p className="text-3xl font-bold uppercase text-primary underline decoration-secondary decoration-2 underline-offset-4">
									{solvedWord}
								</p>
							</div>
						</GuessGameCard>

						{solvedDescription ? (
							<GuessGameCard>
								<GuessGameSectionTitle>O que é isso?</GuessGameSectionTitle>
								<p className="leading-relaxed text-primary">
									{solvedDescription}
								</p>
							</GuessGameCard>
						) : null}

						<FinishGame
							selectedCharacter={selectedCharacter}
							handleRestart={handleRestart}
							isLoading={isSavingScore}
							handleSaveScore={handleSaveScore}
							isLoser={isLoser}
						/>
					</>
				) : (
					<>
						<div className="grid gap-4 md:grid-cols-2">
							<GuessGameCard>
								<GuessGameSectionTitle>Dicas</GuessGameSectionTitle>
								<div className="space-y-3">
									{visibleTips.length > 0 ? (
										<div className="space-y-3 border-b border-slate-200 pb-4">
											{visibleTips.map((tip) => (
												<HintItem key={tip} text={tip} />
											))}
										</div>
									) : (
										<p className="text-sm text-primary">
											Peça uma dica para começar.
										</p>
									)}

									<GuessGameSecondaryButton
										icon={
											<RiLightbulbLine className="text-lg text-secondary" />
										}
										onClick={getTips}
										disabled={!!content && countTips >= content.tips.length}
										className="w-full"
									>
										Pedir uma dica
										{remainingTips > 0 ? ` (${remainingTips})` : ''}
									</GuessGameSecondaryButton>

									<MaskedWordPreview
										wordLength={wordLength}
										revealedCount={revealedLettersCount}
									/>
								</div>
							</GuessGameCard>

							<ImagePlaceholderCard
								imageUrl={content?.imageUrl}
								title={content?.title}
								alt={content?.title}
							/>
						</div>

						<GuessGameCard>
							<GuessGameSectionTitle className="text-center">
								Palavra
							</GuessGameSectionTitle>
							<LetterBoxesRow
								letters={displayedGuessLetters}
								maskChar={CHARACTER_DEFAULT}
								testIdPrefix="word-display"
							/>
							{livesLeft < TOTAL_GUESS ? (
								<p className="mt-3 text-center text-xs text-primary">
									Vidas restantes: {livesLeft}
								</p>
							) : null}
						</GuessGameCard>

						<GuessGameCard>
							<GuessGameSectionTitle>
								1 . Tentar uma letra
							</GuessGameSectionTitle>
							<div className="flex flex-col gap-3 sm:flex-row sm:items-stretch">
								<input
									ref={letterInputRef}
									data-testid="guess-game-letter-input"
									type="text"
									inputMode="text"
									maxLength={1}
									value={letterInput}
									onChange={(event) =>
										setLetterInput(event.target.value.slice(-1).toUpperCase())
									}
									onKeyDown={(event) => {
										if (event.key === 'Enter') {
											event.preventDefault();
											handleLetterSubmit();
										}
									}}
									className="flex h-14 w-14 shrink-0 items-center justify-center self-center rounded border-2 border-slate-200 bg-white text-center text-2xl font-bold uppercase text-primary outline-none focus:border-secondary focus:shadow-sm sm:self-stretch"
									aria-label="Letra para tentar"
								/>
								<GuessGamePrimaryButton
									className="flex-1"
									onClick={handleLetterSubmit}
									disabled={!letterInput.trim()}
								>
									Tentar letra
								</GuessGamePrimaryButton>
							</div>
						</GuessGameCard>

						<div
							ref={wordGuessSectionRef}
							data-testid="guess-game-word-section"
							tabIndex={-1}
							className="outline-none"
						>
							<GuessGameCard>
								<GuessGameSectionTitle>
									2 . Chutar a palavra inteira — use o teclado, clique nas
									caixinhas
								</GuessGameSectionTitle>

								<LetterBoxesRow
									letters={attemptSlots}
									activeIndex={activeAttemptIndex}
									size="small"
									onBoxClick={(index) => {
										activeAttemptIndexRef.current = index;
										setActiveAttemptIndex(index);
									}}
									testIdPrefix="word-attempt"
								/>

								<div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-stretch">
									<GuessGameSecondaryButton
										className="shrink-0 sm:w-auto"
										onClick={handleAttemptBackspace}
									>
										← Apagar
									</GuessGameSecondaryButton>
									<GuessGamePrimaryButton
										className="flex-1"
										onClick={() => {
											void checkWord();
										}}
										disabled={wordLength > 0 && attempt.length !== wordLength}
									>
										Chutar palavra
									</GuessGamePrimaryButton>
								</div>

								<p className="mt-3 text-center text-xs text-slate-600">
									Errar o chute também custa 1 vida!
								</p>
							</GuessGameCard>
						</div>
					</>
				)}
			</div>
		</Spin>
	);
};
