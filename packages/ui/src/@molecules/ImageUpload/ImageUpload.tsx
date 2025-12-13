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
		} catch (err) {
			console.error(err);
			message.error('Erro ao fazer upload.');
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
					className='border-2 border-dotted border-slate-400 rounded flex justify-center items-center overflow-hidden'
				>
					{imageUrl ? (
						<Image src={imageUrl} />
					) : (
						<div className='p-6 text-4xl text-slate-600 flex flex-col items-center gap-1'>
							<RiAddLine />
							<span className='uppercase text-xs font-bold'>Adicionar</span>
						</div>
					)}
				</button>
			</Upload>
		</Spin>
	);
};
