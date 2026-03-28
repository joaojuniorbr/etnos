'use client';

import { Button, Divider, Input, Spin } from 'antd';
import Image from 'next/image';
import { useState } from 'react';
import {
	RiCheckDoubleLine,
	RiInformationLine,
	RiStarFill,
	RiTrophyLine,
} from 'react-icons/ri';

import type {
	CharacterInterface,
	GuessGamePlayItemInterface,
	GuessGameValidationPayloadInterface,
	GuessGameValidationResultInterface,
} from '@etnos/types';
import { FinishGame, ScoreHighlight } from '../../components';

const { OTP: InputOtp } = Input;

const CHARACTER_DEFAULT = '•';
const TOTAL_GUESS = 10;

const getMaskedWord = (wordLength?: number) =>
	CHARACTER_DEFAULT.repeat(wordLength ?? 0);

const getSolvedBonus = (percentage: number) => {
	if (percentage >= 80) {
		return 50;
	}

	if (percentage >= 50) {
		return 30;
	}

	return 10;
};

type GuessGameExperienceProps = {
	content?: GuessGamePlayItemInterface | null;
	bestScore?: number;
	isLoading?: boolean;
	isValidating?: boolean;
	selectedCharacter?: CharacterInterface;
	onPlaySound?: (sound: 'flip' | 'error' | 'finish') => void;
	onNextRound?: () => void;
	onSaveScore?: (score: number) => Promise<void> | void;
	onValidateAttempt: (
		payload: GuessGameValidationPayloadInterface
	) => Promise<GuessGameValidationResultInterface>;
};

export const GuessGameExperience = ({
	content,
	bestScore = 0,
	isLoading = false,
	isValidating = false,
	selectedCharacter,
	onPlaySound,
	onNextRound,
	onSaveScore,
	onValidateAttempt,
}: GuessGameExperienceProps) => {
	const [isSavingScore, setIsSavingScore] = useState(false);
	const [guesses, setGuesses] = useState('');
	const [attempt, setAttempt] = useState('');
	const [countTips, setCountTips] = useState(0);
	const [countGuess, setCountGuess] = useState(0);
	const [score, setScore] = useState(0);
	const [isFinished, setIsFinished] = useState(false);
	const [isLoser, setIsLoser] = useState(false);
	const [solvedWord, setSolvedWord] = useState<string>();
	const [solvedDescription, setSolvedDescription] = useState<string>();

	const resetRound = () => {
		setAttempt('');
		setCountTips(0);
		setCountGuess(0);
		setScore(0);
		setIsFinished(false);
		setIsLoser(false);
		setSolvedWord(undefined);
		setSolvedDescription(undefined);
		setGuesses('');
	};

	const displayedGuesses = guesses || getMaskedWord(content?.wordLength);

	const handleSolved = (
		result: GuessGameValidationResultInterface,
		total: number,
		currentGuesses: string
	) => {
		const revealed = currentGuesses
			.split('')
			.filter((character) => character !== CHARACTER_DEFAULT).length;
		const percentage = total > 0 ? (revealed / total) * 100 : 0;

		setScore((prev) => prev + getSolvedBonus(percentage));
		setSolvedWord(result.word);
		setSolvedDescription(result.description);
		setGuesses(result.word ?? currentGuesses);
		onPlaySound?.('finish');
		setIsFinished(true);
	};

	const handleFailedAttempt = () => {
		if (TOTAL_GUESS > countGuess) {
			setCountGuess((prev) => prev + 1);
			setScore((prev) => Math.max(prev - 5, 0));
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
		setScore((prev) => prev + 10);
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
		if (!content?.id || !attempt) {
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

	return (
		<Spin spinning={isLoading || isValidating || isSavingScore}>
			<h1 className='text-2xl mb-4 font-bold uppercase text-primary text-center'>
				Jogo Adivinhe a Palavra
			</h1>

			<Divider />

			<div className='grid grid-cols-2 gap-2 md:grid-cols-4 sm:gap-4 w-full'>
				<ScoreHighlight
					icon={<RiTrophyLine />}
					label='Pontuação'
					score={score}
					className='border-primary text-primary bg-white'
				/>
				<ScoreHighlight
					icon={<RiInformationLine />}
					label='Dicas'
					score={(content?.tips.length ?? 0) - countTips}
					className='border-blue-800 text-blue-800 bg-white'
				/>
				<ScoreHighlight
					icon={<RiCheckDoubleLine />}
					label='Tentativas'
					score={TOTAL_GUESS - countGuess}
					className='border-green-800 text-green-800 bg-white'
				/>
				<ScoreHighlight
					icon={<RiStarFill />}
					label='Recorde'
					score={bestScore}
					className='bg-primary text-white'
				/>
			</div>

			<Divider />

			{isFinished ? (
				<>
					<div className='text-xl uppercase text-center mb-10 flex items-center justify-center gap-2'>
						<span className='pr-2'>A palavra correta é:</span>
						<span className='text-primary underline text-2xl font-bold'>
							{solvedWord}
						</span>
					</div>
					{solvedDescription ? (
						<div className='mb-8 rounded border border-slate-200 bg-white p-4 text-left'>
							<h2 className='mb-2 text-lg font-bold text-primary'>
								O que e isso?
							</h2>
							<p className='leading-relaxed text-slate-700'>
								{solvedDescription}
							</p>
						</div>
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
					<dl className='mb-4'>
						<dt className='font-bold uppercase text-lg mb-1'>Dicas</dt>
						<dd>
							<ul>
								{content?.tips.map((tip, index) => (
									<li key={tip}>
										{countTips > index ? (
											<div className='flex gap-1 items-center text-sm'>
												<span className='text-orange-400 text-xl'>
													<RiInformationLine />
												</span>
												{tip}
											</div>
										) : null}
									</li>
								))}
							</ul>
						</dd>
					</dl>

					<Button
						type='primary'
						icon={<RiInformationLine />}
						onClick={getTips}
						disabled={!!content && countTips >= content.tips.length}
					>
						Pedir uma dica
					</Button>

					<Divider />

					{content?.imageUrl ? (
						<div className='mb-6 flex justify-center'>
							<Image
								src={content.imageUrl}
								alt={content.title}
								width={300}
								height={300}
							/>
						</div>
					) : null}

					<div className='text-center'>
						<InputOtp
							disabled
							length={content?.wordLength ?? 0}
							size='large'
							value={displayedGuesses}
						/>
					</div>

					<Divider />

					<div className='flex gap-2 items-center justify-center'>
						<span className='font-bold text-xl uppercase'>
							Escolha uma letra
						</span>
						<InputOtp
							formatter={(str) => str.toUpperCase()}
							length={1}
							size='large'
							onChange={(value) => {
								void checkGuess(value);
							}}
						/>
					</div>

					<Divider />

					<div className='text-center flex flex-col gap-2 justify-center items-center'>
						<InputOtp
							formatter={(str) => str.toUpperCase()}
							length={content?.wordLength ?? 0}
							size='large'
							value={attempt}
							onChange={setAttempt}
						/>

						<Button
							type='primary'
							onClick={() => {
								void checkWord();
							}}
						>
							VERIFICAR
						</Button>
					</div>
				</>
			)}
		</Spin>
	);
};
