'use client';

import { Button } from '@etnos/ui';
import { Input, Modal, Rate, message } from 'antd';
import { useEffect, useState } from 'react';

const { TextArea } = Input;

export type GameNpsModalProps = {
	open: boolean;
	onClose: () => void;
	onSubmit: (rating: number, comment?: string) => Promise<void>;
};

export const GameNpsModal = ({
	open,
	onClose,
	onSubmit,
}: GameNpsModalProps) => {
	const [rating, setRating] = useState<number>(0);
	const [comment, setComment] = useState('');
	const [submitting, setSubmitting] = useState(false);

	useEffect(() => {
		if (open) {
			setRating(0);
			setComment('');
		}
	}, [open]);

	const handleSubmit = async () => {
		if (rating < 1) {
			message.warning('Selecione uma nota de 1 a 5.');
			return;
		}
		setSubmitting(true);
		try {
			await onSubmit(rating, comment.trim() || undefined);
			onClose();
		} finally {
			setSubmitting(false);
		}
	};

	return (
		<Modal
			open={open}
			title="Como foi sua experiência?"
			onCancel={onClose}
			footer={null}
			closable
			mask={{ closable: true }}
			centered
			destroyOnHidden
		>
			<p className="text-slate-600 mb-4 m-0">
				De 1 a 5, o quanto você gostou deste jogo? (opcional: comentário abaixo)
			</p>
			<div className="flex justify-center mb-4">
				<Rate count={5} value={rating} onChange={setRating} />
			</div>
			<TextArea
				placeholder="Quer contar algo a mais? (opcional)"
				value={comment}
				onChange={(e) => setComment(e.target.value)}
				maxLength={2000}
				showCount
				rows={3}
				className="mb-4"
			/>
			<div className="flex flex-col-reverse sm:flex-row gap-2 sm:justify-end">
				<Button
					onClick={onClose}
					disabled={submitting}
					block
					className="sm:w-auto"
				>
					Pular
				</Button>
				<Button
					type="primary"
					onClick={() => void handleSubmit()}
					loading={submitting}
					disabled={submitting}
					block
					className="sm:w-auto"
				>
					Enviar
				</Button>
			</div>
		</Modal>
	);
};
