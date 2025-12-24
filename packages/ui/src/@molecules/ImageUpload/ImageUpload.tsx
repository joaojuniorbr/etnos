import { useState } from 'react';
import { Upload, message, Image, Spin } from 'antd';

import { RiAddLine } from 'react-icons/ri';

import { midiaService } from '@etnos/tools';

interface ImageUploadProps {
	userId: string;
	defaultImage?: string;
	folder?: string;
	onUpload?: (url: string) => void;
}

export const ImageUpload = ({
	userId,
	defaultImage,
	folder,
	onUpload,
}: ImageUploadProps) => {
	const [imageUrl, setImageUrl] = useState<string | undefined>(defaultImage);
	const [loading, setLoading] = useState(false);

	const handleUpload = async (file: File) => {
		try {
			setLoading(true);

			const url = await midiaService.uploadImage(file, folder ?? '', userId);

			setImageUrl(url.url);

			onUpload?.(url.url);

			message.success('Imagem enviada com sucesso!');
		} catch (error) {
			if (error instanceof Error) {
				message.error(error.message);
			} else {
				message.error('Erro ao fazer upload.');
			}
		} finally {
			setLoading(false);
		}
	};

	return (
		<Spin spinning={loading}>
			<Upload
				showUploadList={false}
				beforeUpload={(file) => {
					handleUpload(file);
					return false;
				}}
			>
				<button
					disabled={loading}
					className='ui:border-2 ui:border-dotted ui:border-slate-400 ui:rounded ui:flex ui:justify-center ui:items-center ui:overflow-hidden'
				>
					{imageUrl ? (
						<Image src={imageUrl} />
					) : (
						<div className='ui:p-6 ui:text-4xl ui:text-slate-600 ui:flex ui:flex-col ui:items-center ui:gap-1'>
							<RiAddLine />
							<span className='ui:uppercase ui:text-xs ui:font-bold'>
								Adicionar
							</span>
						</div>
					)}
				</button>
			</Upload>
		</Spin>
	);
};
