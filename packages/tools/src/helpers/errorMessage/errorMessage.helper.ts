export const errorMessage = (error: unknown, message?: string) => {
	if (error instanceof Error) {
		return error.message;
	}
	return message || 'Ocorreu um erro inesperado.';
};
