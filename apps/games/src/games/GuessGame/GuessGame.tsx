'use client';

import { Button, Divider, Input, Spin } from 'antd';
import Image from 'next/image';
import { useCallback, useEffect, useState } from 'react';
import {
	RiInformationLine,
	RiTrophyLine,
	RiCheckDoubleLine,
	RiStarFill,
} from 'react-icons/ri';

import {
	GamesEnum,
	getRandomIndex,
	useCharacter,
	useGames,
	useGameScore,
} from '@etnos/tools';

import { GuessGameContent } from './GuessGameContent';
import { GuessGameContentInterface } from './GuessGameHelper';

import { useUser } from '@etnos/ui';
import { FinishGame, ScoreHighlight } from '../../components';

const { OTP: InputOtp } = Input;

const CHARACTER_DEFAULT = '•';

const TOTAL_GUESS = 10;

export const GuessGame = ({ characterSlug }: { characterSlug?: string }) => {
	const [word, setWord] = useState('');
	const [content, setContent] = useState<GuessGameContentInterface>();

	const { selectedCharacter } = useCharacter();
	const [isLoading, setIsLoading] = useState(false);

	const [guesses, setGuesses] = useState<string>('');

	const [attempt, setAttempt] = useState<string>('');

	const [countTips, setCountTips] = useState<number>(0);
	const [countGuess, setCountGuess] = useState<number>(0);
	const [score, setScore] = useState<number>(0);

	const [isFinished, setIsFinished] = useState(false);
	const [isLoser, setIsLoser] = useState(false);

	const { user } = useUser();
	const { saveGameScore, playSound } = useGames(user?.uid);

	const {
		data: scoreGame,
		refetch: scoreGameRefetch,
		isLoading: scoreIsLoading,
	} = useGameScore(
		user?.uid ?? '',
		GamesEnum.GUESS_GAME,
		characterSlug ?? selectedCharacter?.slug ?? ''
	);

	const normalize = (str: string) =>
		str
			.normalize('NFD')
			.replaceAll(/[\u0300-\u036f]/g, '')
			.toLowerCase();

	const checkGuess = (guess: string) => {
		const letter = normalize(guess);

		const tempWord = normalize(word);

		if (!tempWord.includes(letter)) {
			playSound('error');
			handleAddGuess();
			return;
		}

		playSound('flip');

		const newGuesses = guesses.split('');

		for (let i = 0; i < word.length; i++) {
			if (word[i] && normalize(word[i] as string) === letter) {
				newGuesses[i] = word[i]?.toUpperCase() as string;
			}
		}

		setScore((prev) => prev + 10);

		const updated = newGuesses.join('');
		setGuesses(updated);

		if (!normalize(updated).includes(normalize(CHARACTER_DEFAULT))) {
			handleSuccess();
		}
	};

	const checkWord = () => {
		if (normalize(attempt) === normalize(word)) {
			handleSuccess();
		} else {
			handleAddGuess();
			playSound('error');
		}
	};

	const getTips = () => {
		if (content && countTips < content?.tips.length) {
			setCountTips(countTips + 1);
		} else {
			playSound('error');
		}
	};

	const handleAddGuess = () => {
		if (TOTAL_GUESS > countGuess) {
			setCountGuess(countGuess + 1);
			setScore((prev) => Math.max(prev - 5, 0));
		} else {
			setIsLoser(true);
			setIsFinished(true);
		}
	};

	const handleSuccess = () => {
		const total = word.length;
		const revealed = guesses
			.split('')
			.filter((c) => c !== CHARACTER_DEFAULT).length;
		const percentage = (revealed / total) * 100;

		let bonus = 0;

		if (percentage >= 80) bonus = 50;
		else if (percentage >= 50) bonus = 30;
		else bonus = 10;

		setScore((prev) => prev + bonus);

		setGuesses(word);
		playSound('finish');
		setIsFinished(true);
	};

	const handleRestart = () => {
		setIsFinished(false);
		setGuesses('');
		setScore(0);
		setCountGuess(0);
		setCountTips(0);
		setIsLoser(false);
		startContent();
	};

	const handleSaveScore = async () => {
		setIsLoading(true);

		if (!user?.uid || !selectedCharacter?.slug) return;

		await saveGameScore(GamesEnum.GUESS_GAME, selectedCharacter.slug, score);

		setIsLoading(false);

		scoreGameRefetch();
	};

	const startContent = useCallback(() => {
		setIsLoading(true);

		scoreGameRefetch();

		setAttempt('');
		setCountTips(0);

		const characterContent =
			GuessGameContent[
				selectedCharacter?.slug as keyof typeof GuessGameContent
			];

		if (characterContent) {
			const selectContent =
				characterContent[getRandomIndex(characterContent.length)];

			if (selectContent) {
				setContent(selectContent);
				setWord(selectContent.word);
				setGuesses(CHARACTER_DEFAULT.repeat(selectContent.word.length));
			}
		}

		setIsLoading(false);
	}, [selectedCharacter, scoreGameRefetch]);

	useEffect(() => {
		startContent();
	}, [startContent]);

	return (
		<Spin spinning={isLoading || scoreIsLoading}>
			<h1 className='text-2xl mb-4 font-bold uppercase text-primary text-center'>
				Jogo Adivinhe a Palavra
			</h1>

			<Divider />

			<div className='grid grid-cols-2 gap-2 md:grid-cols-4 sm:gap-4 w-full'>
				<ScoreHighlight
					icon={<RiTrophyLine />}
					label='Pontuação'
					score={score}
					className='border-primary text-primary  bg-white'
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
					score={scoreGame?.score ?? 0}
					className='bg-primary text-white'
				/>
			</div>

			<Divider />

			{isFinished ? (
				<>
					<div className='text-xl uppercase text-center mb-10 flex items-center justify-center gap-2'>
						<span className='pr-2'>A palavra correta é:</span>
						<span className='text-primary underline text-2xl font-bold'>
							{content?.word}
						</span>
					</div>
					<FinishGame
						selectedCharacter={selectedCharacter}
						handleRestart={handleRestart}
						isLoading={isLoading}
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
										{countTips > index && (
											<div className='flex gap-1 items-center text-sm'>
												<span className='text-orange-400 text-xl'>
													<RiInformationLine />
												</span>
												{tip}
											</div>
										)}
									</li>
								))}
							</ul>
						</dd>
					</dl>

					<Button
						type='primary'
						icon={<RiInformationLine />}
						onClick={getTips}
						disabled={content && countTips >= content?.tips.length}
					>
						Pedir uma dica
					</Button>

					<Divider />

					{content && (
						<div className='mb-6 flex justify-center'>
							<Image
								src={content?.image}
								alt={content?.word}
								width={300}
								height={300}
							/>
						</div>
					)}

					<div className='text-center'>
						<InputOtp
							disabled
							length={word.length}
							size='large'
							value={guesses}
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
							onChange={checkGuess}
						/>
					</div>

					<Divider />

					<div className='text-center flex flex-col gap-2 justify-center items-center'>
						<InputOtp
							formatter={(str) => str.toUpperCase()}
							length={word.length}
							size='large'
							value={attempt}
							onChange={setAttempt}
						/>

						<Button type='primary' onClick={checkWord}>
							VERIFICAR
						</Button>
					</div>
				</>
			)}
		</Spin>
	);
};
