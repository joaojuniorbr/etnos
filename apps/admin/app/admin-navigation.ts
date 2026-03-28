import { GamesEnum, GameNameEnum } from '@etnos/types';

export const adminSections = [
	{
		title: 'Personagens',
		description:
			'Cadastre personagens, ajuste descricoes e mantenha o acervo visual organizado.',
		href: '/admin/personagens',
		cta: 'Gerenciar personagens',
	},
	{
		title: 'Escolas',
		description:
			'Acompanhe o cadastro das escolas e mantenha as informacoes administrativas atualizadas.',
		href: '/admin/escolas',
		cta: 'Gerenciar escolas',
	},
	{
		title: 'Midias',
		description:
			'Centralize imagens da plataforma para reutilizar nos personagens e nos jogos.',
		href: '/admin/midia',
		cta: 'Abrir biblioteca',
	},
	{
		title: 'Jogos',
		description:
			'Entre na area de jogos para editar conteudos, capas e acompanhar os acessos de gestao.',
		href: '/admin/jogos',
		cta: 'Gerenciar jogos',
	},
];

export const schoolSections = [
	{
		title: 'Minha Escola',
		description:
			'Consulte os dados da escola vinculada ao seu perfil, veja os usuários e acompanhe o ranking por jogo.',
		href: '/admin/escolas',
		cta: 'Abrir painel da escola',
	},
];

export const gameManagementLinks: Record<
	string,
	{ href?: string; label: string; available: boolean }
> = {
	[GamesEnum.MEMORY_GAME]: {
		href: '/admin/jogos/memory-game',
		label: 'Gerenciar conteudo',
		available: true,
	},
	[GamesEnum.GUESS_GAME]: {
		href: '/admin/jogos/guess-game',
		label: 'Gerenciar conteudo',
		available: true,
	},
};

export const gameHighlights = [
	{
		name: GameNameEnum[GamesEnum.GUESS_GAME],
		description:
			'Gerencie palavras, dicas, descrição final e imagens reutilizando a biblioteca de mídia.',
		href: '/admin/jogos/guess-game',
		cta: 'Abrir Adivinhe',
	},
	{
		name: GameNameEnum[GamesEnum.MEMORY_GAME],
		description:
			'Edite capa por personagem e selecione as imagens usadas nas partidas.',
		href: '/admin/jogos/memory-game',
		cta: 'Abrir Jogo da Memoria',
	},
];
