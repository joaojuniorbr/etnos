import type { CharacterInterface } from '@etnos/types';
import { Button } from '@ui/@atoms/Button';
import { Card } from '@ui/@atoms/Card';
import { Image } from 'antd';

export interface CulturalGuideCardProps {
	guide: CharacterInterface;
	onChangeGuide: () => void;
}

export const CulturalGuideCard = ({
	guide,
	onChangeGuide,
}: CulturalGuideCardProps) => (
	<Card className="ui:flex ui:flex-col ui:gap-4 ui:md:flex-row ui:md:items-center ui:md:justify-between">
		<div className="ui:flex ui:items-center ui:gap-4 ui:flex-1">
			<div className="ui:flex ui:w-20">
				<Image
					src={guide.imageUrl || `/images/character/md/${guide.slug}.png`}
					alt={guide.name}
				/>
			</div>
			<div className="ui:flex ui:flex-col ui:flex-1">
				<p className="ui:m-0 ui:text-xs ui:font-bold ui:uppercase ui:text-slate-500">
					Seu guia cultural
				</p>
				<p className="ui:m-0 ui:text-xl ui:font-black ui:text-primary">
					{guide.name}
				</p>
				<p className="ui:m-0 ui:text-sm ui:text-slate-600 ui:hidden md:ui:block">
					{guide.description}
				</p>
			</div>
		</div>
		<div className="ui:w-auto">
			<Button type="primary" size="small" onClick={onChangeGuide} block>
				Trocar guia
			</Button>
		</div>
	</Card>
);
