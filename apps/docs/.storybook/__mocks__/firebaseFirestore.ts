export const getFirestore = () => ({});

export const collection = (_db: any, path: string) => ({
	path,
});

export const doc = (_db: any, colPath: string, id: string) => ({
	path: `${colPath}/${id}`,
	id,
});
export const getDoc = async (_docRef: any) => ({
	exists: () => false,
	data: () => ({}),
});

export const setDoc = async (_docRef: any, _data: any, _options?: any) => true;

export const updateDoc = async (_docRef: any, _data: any) => true;

export const deleteDoc = async (_docRef: any) => true;

export const getDocs = async (_colRefOrQuery: any) => ({
	docs: [] as Array<{
		id: string;
		data: () => Record<string, any>;
	}>,
	empty: true,
	size: 0,
	forEach: (fn: (doc: any) => void) => {},
});

export const serverTimestamp = () => new Date();
