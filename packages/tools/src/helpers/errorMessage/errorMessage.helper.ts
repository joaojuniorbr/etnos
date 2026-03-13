import { AxiosError } from 'axios';

export const errorMessage = (error: unknown, message?: string) => {
	if (error instanceof AxiosError) {
		return (error as AxiosError<{ message: string }>).response?.data?.message;
	}
	if (error instanceof Error) {
		return error.message;
	}
	return message || 'Ocorreu um erro inesperado.';
};
