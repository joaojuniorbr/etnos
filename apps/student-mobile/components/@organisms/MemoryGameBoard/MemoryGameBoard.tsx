import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { Image } from 'expo-image';
import { BackHandler, Pressable, Text, View } from 'react-native';
import type { CharacterInterface, ScoreInterface } from '@etnos/types';
import {
	createMemoryGameDeck,
	getAvailableMemoryGameLevels,
	getMemoryGameLevelConfig,
	getMemoryGameLevelContent,
	resolveMemoryGameTurn,
	type MemoryGameCard,
	type MemoryGameCardContent,
} from '@etnos/core';
import { PrimaryButton } from '@/components/@atoms/PrimaryButton';
import { SectionCard } from '@/components/@atoms/SectionCard';
import { StatCard } from '@/components/@atoms/StatCard';
import { tw } from '@/utils';
import { FontAwesome } from '@expo/vector-icons';

type GameFinishedPayload = {
	score: number;
	outcome?: 'won' | 'lost';
};

type MemoryGameBoardProps = {
	bestScore?: ScoreInterface | null;
	content: MemoryGameCardContent[];
	character?: CharacterInterface | null;
	onSaveBestScore: (score: number) => Promise<void>;
	onSaveScoreHistory: (score: number) => Promise<void>;
	onGameFinished?: (payload: GameFinishedPayload) => void;
};

const MISMATCH_DELAY_MS = 2000;

const createSeededIndexPicker = (seed = 1) => {
	let state = seed;

	return (maxInclusive: number) => {
		state ^= state << 13;
		state ^= state >>> 17;
		state ^= state << 5;

		return (state >>> 0) % (maxInclusive + 1);
	};
};

const shuffleForMobile = <T,>(items: T[]): T[] => {
	const shuffled = [...items];
	const pickIndex = createSeededIndexPicker(Date.now());

	for (let index = shuffled.length - 1; index > 0; index -= 1) {
		const randomIndex = pickIndex(index);
		const currentItem = shuffled[index];
		const randomItem = shuffled[randomIndex];

		if (currentItem === undefined || randomItem === undefined) {
			continue;
		}

		[shuffled[index], shuffled[randomIndex]] = [randomItem, currentItem];
	}

	return shuffled;
};

export const MemoryGameBoard = ({
	bestScore,
	character,
	content,
	onSaveBestScore,
	onSaveScoreHistory,
	onGameFinished,
}: MemoryGameBoardProps) => {
	const availableLevels = useMemo(
		() => getAvailableMemoryGameLevels(content.length),
		[content.length],
	);
	const [selectedLevel, setSelectedLevel] = useState<number | null>(null);
	const [levelContent, setLevelContent] = useState<MemoryGameCardContent[]>([]);
	const [cards, setCards] = useState<MemoryGameCard[]>([]);
	const [flippedCards, setFlippedCards] = useState<number[]>([]);
	const [isChecking, setIsChecking] = useState(false);
	const [score, setScore] = useState(0);
	const [consecutiveMatches, setConsecutiveMatches] = useState(0);
	const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const savedHistoryRef = useRef<number | null>(null);
	const gameFinishedTrackedRef = useRef(false);

	const levelConfig = selectedLevel
		? getMemoryGameLevelConfig(selectedLevel)
		: undefined;
	const matchedPairs = useMemo(
		() => cards.filter((item) => item.isMatched).length / 2,
		[cards],
	);
	const totalPairs = levelContent.length;
	const isFinished = totalPairs > 0 && matchedPairs === totalPairs;

	useEffect(() => {
		if (!selectedLevel) {
			setLevelContent([]);
			return;
		}

		setLevelContent(
			getMemoryGameLevelContent(content, selectedLevel, shuffleForMobile),
		);
	}, [content, selectedLevel]);

	useEffect(() => {
		if (!levelContent.length) {
			setCards([]);
			setScore(0);
			setFlippedCards([]);
			setConsecutiveMatches(0);
			setIsChecking(false);
			return;
		}

		setCards(createMemoryGameDeck(levelContent, shuffleForMobile));
		setScore(0);
		setFlippedCards([]);
		setConsecutiveMatches(0);
		setIsChecking(false);
		savedHistoryRef.current = null;
		gameFinishedTrackedRef.current = false;

		return () => {
			if (timeoutRef.current) {
				clearTimeout(timeoutRef.current);
			}
		};
	}, [levelContent]);

	useEffect(() => {
		if (!isFinished) {
			gameFinishedTrackedRef.current = false;
			return;
		}

		if (!gameFinishedTrackedRef.current) {
			gameFinishedTrackedRef.current = true;
			onGameFinished?.({ score, outcome: 'won' });
		}
	}, [isFinished, onGameFinished, score]);

	useEffect(() => {
		if (!isFinished || savedHistoryRef.current === score) {
			return;
		}

		savedHistoryRef.current = score;
		void (async () => {
			await onSaveBestScore(score);
			await onSaveScoreHistory(score);
		})();
	}, [isFinished, onSaveBestScore, onSaveScoreHistory, score]);

	const handleCardPress = (id: number) => {
		if (!levelConfig || isChecking || isFinished) {
			return;
		}

		const card = cards.find((item) => item.id === id);

		if (!card || card.isFlipped || card.isMatched) {
			return;
		}

		// 1. Vira a carta imediatamente para o usuário ver
		const nextCards = cards.map((item) =>
			item.id === id ? { ...item, isFlipped: true } : item,
		);
		setCards(nextCards);

		const nextFlippedCards = [...flippedCards, id];
		setFlippedCards(nextFlippedCards);

		if (nextFlippedCards.length !== 2) {
			return;
		}

		setIsChecking(true);

		const [firstId, secondId] = nextFlippedCards as [number, number];
		const firstCard = nextCards.find((item) => item.id === firstId);
		const secondCard = nextCards.find((item) => item.id === secondId);

		if (firstCard?.name === secondCard?.name) {
			const result = resolveMemoryGameTurn(
				nextCards,
				[firstId, secondId],
				score,
				consecutiveMatches,
				levelConfig,
			);

			setCards(result.cards);
			setScore(result.score);
			setConsecutiveMatches(result.consecutiveMatches);
			setFlippedCards([]);
			setIsChecking(false);
			return;
		}

		timeoutRef.current = setTimeout(() => {
			const result = resolveMemoryGameTurn(
				nextCards,
				[firstId, secondId],
				score,
				consecutiveMatches,
				levelConfig,
			);

			setCards(result.cards);
			setScore(result.score);
			setConsecutiveMatches(result.consecutiveMatches);
			setFlippedCards([]);
			setIsChecking(false);
		}, MISMATCH_DELAY_MS);
	};

	const handleRestart = () => {
		if (timeoutRef.current) {
			clearTimeout(timeoutRef.current);
			timeoutRef.current = null;
		}

		setSelectedLevel(null);
		setLevelContent([]);
		savedHistoryRef.current = null;
	};

	useEffect(() => {
		if (selectedLevel === null) {
			return;
		}

		const subscription = BackHandler.addEventListener(
			'hardwareBackPress',
			() => {
				handleRestart();
				return true;
			},
		);

		return () => {
			subscription.remove();
		};
	}, [selectedLevel]);

	const bestValue = bestScore?.score ?? 0;
	const backImage = character?.slug
		? `https://etnos.online/games/memory-game/cover/${character?.slug}.jpg`
		: character?.imageUrl;
	let contentNode: ReactNode;

	if (selectedLevel === null) {
		contentNode = (
			<SectionCard>
				<View style={tw`items-center`}>
					<Image
						source={{ uri: character?.imageUrl }}
						style={tw`w-full max-w-54 aspect-square mx-auto`}
					/>
					<Text style={tw`text-lg font-black text-primary text-center`}>
						Escolha o nível para começar
					</Text>
					<Text style={tw`text-xs text-center`}>
						Cada nível aumenta a quantidade de pares e deixa a pontuação mais
						alta.
					</Text>
				</View>
				<View style={tw`mt-6 flex-row flex-wrap -mx-1`}>
					{availableLevels.map((level) => (
						<View key={`level-${level.level}`} style={tw`p-1 w-1/2`}>
							<Pressable
								onPress={() => setSelectedLevel(level.level)}
								style={({ pressed }) => [
									tw`rounded border border-stone-200 bg-white p-4`,
									pressed ? tw`opacity-90` : null,
								]}
							>
								<View style={tw`flex-row items-center gap-1`}>
									{Array.from({ length: availableLevels.length }, (_, index) =>
										index < level.level ? (
											<FontAwesome
												name="star"
												key={`filled-${level.level}-${index}`}
												color={tw.color('secondary')}
											/>
										) : (
											<FontAwesome
												name="star-o"
												key={`outline-${level.level}-${index}`}
												color={tw.color('secondary')}
											/>
										),
									)}
								</View>
								<Text style={tw`text-xl font-black text-primary`}>
									{level.label}
								</Text>
							</Pressable>
						</View>
					))}
				</View>
			</SectionCard>
		);
	} else if (isFinished) {
		contentNode = (
			<SectionCard>
				<Text style={tw`text-3xl font-black text-primary`}>Parabéns!</Text>
				<Text style={tw`mt-3 text-base leading-6 text-stone-700`}>
					Você concluiu o desafio e pode salvar sua melhor pontuação.
				</Text>
				<View style={tw`mt-6`}>
					<PrimaryButton
						label="Salvar Pontuação"
						onPress={() => void onSaveBestScore(score)}
					/>
				</View>
				<View style={tw`mt-3`}>
					<PrimaryButton
						label="Jogar Novamente"
						variant="secondary"
						onPress={handleRestart}
					/>
				</View>
			</SectionCard>
		);
	} else {
		contentNode = (
			<>
				<View style={tw`mb-5 flex-row flex-wrap`}>
					<View style={tw`w-1/2 pr-2`}>
						<StatCard label="Pontuação" value={score} tone="gold" />
					</View>
					<View style={tw`w-1/2 pl-2`}>
						<StatCard label="Recorde" value={bestValue} tone="dark" />
					</View>
				</View>

				<View style={tw`flex-row flex-wrap justify-center -ml-1 pb-20`}>
					{cards.map((card) => {
						const showFront = card.isFlipped || card.isMatched;

						return (
							<View key={card.id} style={tw`w-1/3 pl-1 pb-1`}>
								<Pressable
									onPress={() => handleCardPress(card.id)}
									style={[
										tw`overflow-hidden rounded border border-slate-200 bg-white`,
										card.isMatched ? tw`opacity-40` : null,
									]}
									disabled={card.isMatched}
								>
									<View style={tw`aspect-square w-full`}>
										<Image
											source={{ uri: card.image }}
											contentFit="cover"
											style={[
												tw`absolute inset-0 w-full h-full`,
												{ opacity: showFront ? 1 : 0 },
											]}
										/>
										<Image
											source={{ uri: backImage }}
											contentFit="cover"
											style={[
												tw`absolute inset-0 w-full h-full`,
												{ opacity: showFront ? 0 : 1 },
											]}
										/>
									</View>
								</Pressable>
							</View>
						);
					})}
				</View>

				<View
					style={[
						tw`top-0 left-0 h-1 w-full bg-slate-200`,
						{
							position: 'fixed',
						},
					]}
				>
					<View
						style={[
							tw`h-full bg-secondary`,
							{
								width: `${(matchedPairs / totalPairs) * 100}%`,
							},
						]}
					/>
				</View>
			</>
		);
	}

	return <View>{contentNode}</View>;
};
