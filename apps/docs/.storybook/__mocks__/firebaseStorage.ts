// __mocks__/firebase-storage.ts

// --- Simulação da Inicialização do Storage ---

export const getStorage = () => ({
	// Simula o objeto Storage
	_mockStorage: true,
});

// --- Simulação de Referências (Paths) ---

/** Simula a criação de uma referência de arquivo (o "caminho" no Storage) */
export const ref = (storage: any, path: string) => ({
	storage,
	fullPath: path,
	name: path.split('/').pop(), // Nome do arquivo
});

// --- Simulação de Upload (Upload Task e Resultados) ---

/** Simula um objeto UploadTaskSnapshot após um upload bem-sucedido */
const mockUploadSnapshot = (ref: any) => ({
	ref,
	bytesTransferred: 100,
	totalBytes: 100,
	metadata: {
		contentType: 'image/jpeg',
		size: 100,
		fullPath: ref.fullPath,
	},
});

/** Simula a Tarefa de Upload (UploadTask) que retorna um Snapshot */
export const uploadBytes = async (ref: any, file: any) => {
	console.log(
		`[MOCK] Fazendo upload de ${ref.fullPath}. Tamanho: ${file?.size || (file as any).length} bytes`,
	);

	// Retorna o Snapshot simulado
	return mockUploadSnapshot(ref);
};

// --- Simulação de Download (URL) ---

/** Simula a obtenção da URL de download */
export const getDownloadURL = async (ref: any) => {
	// Retorna uma URL mockada baseada no caminho do arquivo
	const filename = ref.name || 'mock-file';
	return `https://mock-storage.com/${ref.fullPath}/${filename}`;
};

// --- Simulação de Outras Funções Comuns (Opcional) ---

/** Simula a exclusão de um arquivo */
export const deleteObject = async (ref: any) => {
	console.log(`[MOCK] Deletando arquivo: ${ref.fullPath}`);
	return true;
};

/** Simula upload com metadados (se você usar essa função) */
export const uploadBytesResumable = (
	ref: any,
	file: File | Blob | Uint8Array,
	metadata?: any,
) => {
	console.log(
		`[MOCK] Upload Resumable de ${ref.fullPath} com metadados:`,
		metadata,
	);

	// Retorna um objeto UploadTask simulado com métodos on() e pause()
	return {
		on: (
			state: string,
			next: (snapshot: any) => void,
			error: (e: any) => void,
			complete: () => void,
		) => {
			// Simula o estado completo imediatamente
			setTimeout(() => complete(), 10);
		},
		// Métodos obrigatórios do UploadTask
		pause: () => console.log('Mock Pause'),
		resume: () => console.log('Mock Resume'),
		snapshot: mockUploadSnapshot(ref),
	};
};

// Se você precisar da classe Storage
export class FirebaseStorage {}
