import { useEffect, useMemo, useRef, useState } from 'react';
import { Image } from 'expo-image';
import { Pressable, Text, View } from 'react-native';
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
import { PrimaryButton, SectionCard, StatCard } from '@/components';
import { tw } from '@/utils';

type MemoryGameBoardProps = {
	bestScore?: ScoreInterface | null;
	content: MemoryGameCardContent[];
	character?: CharacterInterface | null;
	onSaveBestScore: (score: number) => Promise<void>;
	onSaveScoreHistory: (score: number) => Promise<void>;
};

const MATCH_DELAY_MS = 1000;

export const MemoryGameBoard = ({
	bestScore,
	character,
	content,
	onSaveBestScore,
	onSaveScoreHistory,
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
	const [moves, setMoves] = useState(0);
	const [score, setScore] = useState(0);
	const [matchedPairs, setMatchedPairs] = useState(0);
	const [consecutiveMatches, setConsecutiveMatches] = useState(0);
	const [isFinished, setIsFinished] = useState(false);
	const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
	const savedHistoryRef = useRef<number | null>(null);

	const levelConfig = selectedLevel
		? getMemoryGameLevelConfig(selectedLevel)
		: undefined;

	useEffect(() => {
		if (!selectedLevel) {
			setLevelContent([]);
			return;
		}

		setLevelContent(getMemoryGameLevelContent(content, selectedLevel));
	}, [content, selectedLevel]);

	useEffect(() => {
		if (!levelContent.length) {
			setCards([]);
			setMoves(0);
			setScore(0);
			setMatchedPairs(0);
			setFlippedCards([]);
			setConsecutiveMatches(0);
			setIsFinished(false);
			setIsChecking(false);
			return;
		}

		setCards(createMemoryGameDeck(levelContent));
		setMoves(0);
		setScore(0);
		setMatchedPairs(0);
		setFlippedCards([]);
		setConsecutiveMatches(0);
		setIsFinished(false);
		setIsChecking(false);
		savedHistoryRef.current = null;

		return () => {
			if (timeoutRef.current) {
				clearTimeout(timeoutRef.current);
			}
		};
	}, [levelContent]);

	useEffect(() => {
		if (!isFinished || savedHistoryRef.current === score) {
			return;
		}

		savedHistoryRef.current = score;
		void onSaveScoreHistory(score);
	}, [isFinished, onSaveScoreHistory, score]);

	const handleCardPress = (id: number) => {
		if (!levelConfig || isChecking || isFinished) {
			return;
		}

		const card = cards.find((item) => item.id === id);

		if (!card || card.isFlipped || card.isMatched) {
			return;
		}

		const nextCards = cards.map((item) =>
			item.id === id ? { ...item, isFlipped: true } : item,
		);
		const nextFlippedCards = [...flippedCards, id];

		setCards(nextCards);
		setFlippedCards(nextFlippedCards);

		if (nextFlippedCards.length !== 2) {
			return;
		}

		setIsChecking(true);
		setMoves((currentMoves) => currentMoves + 1);

		timeoutRef.current = setTimeout(() => {
			const result = resolveMemoryGameTurn(
				nextCards,
				nextFlippedCards as [number, number],
				score,
				consecutiveMatches,
				levelConfig,
			);

			setCards(result.cards);
			setScore(result.score);
			setConsecutiveMatches(result.consecutiveMatches);
			setMatchedPairs(result.cards.filter((item) => item.isMatched).length / 2);
			setIsFinished(result.isFinished);
			setFlippedCards([]);
			setIsChecking(false);
		}, MATCH_DELAY_MS);
	};

	const handleRestart = () => {
		setSelectedLevel(null);
		setLevelContent([]);
		savedHistoryRef.current = null;
	};

	const totalPairs = levelContent.length;
	const bestValue = bestScore?.score ?? 0;
	const backImage =
		character?.imageUrl ||
		'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=900&q=80';

	return (
		<View>
			<View style={tw`mb-5 flex-row flex-wrap`}>
				<View style={tw`mb-3 w-1/2 pr-2`}>
					<StatCard label="Pontuação" value={score} tone="gold" />
				</View>
				<View style={tw`mb-3 w-1/2 pl-2`}>
					<StatCard label="Movimentos" value={moves} tone="blue" />
				</View>
				<View style={tw`w-1/2 pr-2`}>
					<StatCard
						label="Acertos"
						value={`${matchedPairs}/${totalPairs}`}
						tone="teal"
					/>
				</View>
				<View style={tw`w-1/2 pl-2`}>
					<StatCard label="Recorde" value={bestValue} tone="dark" />
				</View>
			</View>

			{selectedLevel === null ? (
				<SectionCard>
					<Text style={tw`text-2xl font-black text-primary`}>
						Escolha o nível para começar
					</Text>
					<Text style={tw`mt-3 text-base leading-6 text-stone-700`}>
						Cada nível aumenta a quantidade de pares e deixa a pontuação mais alta.
					</Text>
					<View style={tw`mt-6`}>
						{availableLevels.map((level) => (
							<Pressable
								key={level.level}
								onPress={() => setSelectedLevel(level.level)}
								style={({ pressed }) => [
									tw`mb-3 rounded-2xl border border-stone-200 bg-white px-4 py-4`,
									pressed ? tw`opacity-90` : null,
								]}
							>
								<Text style={tw`text-lg font-black text-primary`}>
									{level.label}
								</Text>
								<Text style={tw`mt-1 text-sm text-stone-600`}>
									{level.pairs * 2} cartas
								</Text>
							</Pressable>
						))}
					</View>
				</SectionCard>
			) : isFinished ? (
				<SectionCard>
					<Text style={tw`text-3xl font-black text-primary`}>
						Parabéns!
					</Text>
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
			) : (
				<View style={tw`flex-row flex-wrap justify-between`}>
					{cards.map((card) => {
						const showFront = card.isFlipped || card.isMatched;

						return (
							<Pressable
								key={card.id}
								onPress={() => handleCardPress(card.id)}
								style={[
									tw`mb-3 w-[31%] overflow-hidden rounded-2xl border border-stone-200 bg-white`,
									card.isMatched ? tw`opacity-60` : null,
								]}
							>
								<Image
									source={{ uri: showFront ? card.image : backImage }}
									contentFit="cover"
									style={tw`aspect-square w-full bg-stone-100`}
								/>
								<View style={tw`px-2 py-2`}>
									<Text
										numberOfLines={1}
										style={tw`text-center text-xs font-bold uppercase text-primary`}
									>
										{showFront ? card.name : character?.name ?? 'Etnos'}
									</Text>
								</View>
							</Pressable>
						);
					})}
				</View>
			)}
		</View>
	);
};
