import { useState } from 'react';
import { Upload, Button, message } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import type { UploadFile } from 'antd/es/upload/interface';
import { midiaService } from '@etnos/tools';

interface ImageMultiUploadProps {
	userId: string;
	folder?: string;
	onUpload?: (urls: string[]) => void;
}

export const ImageMultiUpload = ({
	userId,
	folder,
	onUpload,
}: ImageMultiUploadProps) => {
	const [fileList, setFileList] = useState<UploadFile[]>([]);

	const handleUpload = async (file: UploadFile) => {
		try {
			if (!file.originFileObj) return;

			file.status = 'uploading';
			setFileList((prev) => [...prev]);

			const uploaded = await midiaService.uploadImage(
				file.originFileObj,
				folder ?? '',
				userId
			);

			file.url = uploaded.url;
			file.status = 'done';

			setFileList((prev) => [...prev]);

			onUpload?.(fileList.filter((f) => f.url).map((f) => f.url!));
		} catch (error) {
			console.error(error);
			file.status = 'error';
			setFileList((prev) => [...prev]);
			message.error(`Erro ao enviar ${file.name}`);
		}
	};

	return (
		<Upload.Dragger
			multiple
			listType='picture'
			fileList={fileList}
			beforeUpload={(file) => {
				const uploadFile: UploadFile = {
					uid: String(Date.now()) + Math.random(),
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
				const filtred = fileList.filter((f) => f.uid !== file?.uid);
				setFileList(filtred);
				onUpload?.(filtred.map((f) => f.url!));
			}}
			key='uid'
		>
			<Button type='primary' icon={<UploadOutlined />}>
				Fazer upload
			</Button>
		</Upload.Dragger>
	);
};
