'use client';

import { useState } from 'react';
import { Upload, Button, message } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import type { UploadFile } from 'antd/es/upload/interface';
import { getRandomIndex, midiaService } from '@etnos/tools';

interface ImageMultipleUploadProps {
	userId: string;
	folder?: string;
	onUpload?: (urls: string[]) => void;
}

export const ImageMultipleUpload = ({
	userId,
	folder,
	onUpload,
}: ImageMultipleUploadProps) => {
	const [fileList, setFileList] = useState<UploadFile[]>([]);

	const handleUpload = async (file: UploadFile) => {
		try {
			file.status = 'uploading';
			setFileList((prev) => [...prev]);

			const uploaded = await midiaService.uploadImage(
				file.originFileObj as File,
				folder ?? '',
				userId,
			);

			file.url = uploaded.url;
			file.status = 'done';

			setFileList((prev) => {
				const updated = [...prev];
				onUpload?.(updated.filter((f) => f.url).map((f) => f.url!));
				return updated;
			});
		} catch (error) {
			file.status = 'error';
			setFileList((prev) => [...prev]);
			if (error instanceof Error) {
				message.error(`Erro ao enviar ${file.name}: ${error.message}`);
			}
		}
	};

	return (
		<Upload.Dragger
			multiple
			listType="picture"
			fileList={fileList}
			beforeUpload={(file) => {
				const uploadFile: UploadFile = {
					uid: String(Date.now()) + getRandomIndex(10000000).toString(),
					name: file.name,
					status: 'uploading',
					originFileObj: file,
				};

				setFileList((prev) => [...prev, uploadFile]);

				handleUpload(uploadFile);

				return false;
			}}
			onRemove={async (file) => {
				await midiaService.deleteMidiaFromUrl(file.url!);
				const filtered = fileList.filter((f) => f.uid !== file.uid);
				setFileList(filtered);
				onUpload?.(filtered.map((f) => f.url as string));
			}}
			key="uid"
		>
			<Button type="primary" icon={<UploadOutlined />}>
				Fazer upload
			</Button>
		</Upload.Dragger>
	);
};
