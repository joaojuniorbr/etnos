import { Test, TestingModule } from '@nestjs/testing';
import { MidiaService } from './midia.service';
import { FirebaseService } from 'src/firebase';
import * as admin from 'firebase-admin';

jest.mock('firebase-admin', () => ({
  storage: jest.fn(),
}));

describe('MidiaService', () => {
  let service: MidiaService;
  let firebaseService: FirebaseService;

  const mockFirebaseService = {
    findPaginated: jest.fn(),
    create: jest.fn(),
    findAll: jest.fn(),
    batchDelete: jest.fn(),
    findById: jest.fn(),
    delete: jest.fn(),
  };

  const mockFile = {
    save: jest.fn(),
    getSignedUrl: jest.fn().mockResolvedValue(['http://signed-url']),
    delete: jest.fn(),
  };

  const mockBucket = {
    file: jest.fn(() => mockFile),
  };

  beforeEach(async () => {
    (admin.storage as jest.Mock).mockReturnValue({
      bucket: jest.fn(() => mockBucket),
    });

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MidiaService,
        {
          provide: FirebaseService,
          useValue: mockFirebaseService,
        },
      ],
    }).compile();

    service = module.get<MidiaService>(MidiaService);
    firebaseService = module.get<FirebaseService>(FirebaseService);
    jest.clearAllMocks();
  });

  it('deve extrair path da URL estilo firebase /o/', () => {
    const path = service.getPathFromUrl(
      'https://firebasestorage.googleapis.com/v0/b/x/o/folder%2Fimg.png?alt=media',
    );

    expect(path).toEqual('folder/img.png');
  });

  it('deve extrair path da URL estilo firebase /o/ sem query string', () => {
    const path = service.getPathFromUrl(
      'https://firebasestorage.googleapis.com/v0/b/x/o/folder%2Fimg.png',
    );

    expect(path).toEqual('folder/img.png');
  });

  it('deve extrair path da URL sem /o/', () => {
    const path = service.getPathFromUrl('https://storage.googleapis.com/folder/img.png');

    expect(path).toEqual('folder/img.png');
  });

  it('deve fazer upload de imagem e persistir metadados', async () => {
    mockFirebaseService.create.mockResolvedValue({ id: '1' });

    const result = await service.uploadImage(
      {
        originalname: 'img.png',
        mimetype: 'image/png',
        buffer: Buffer.from('abc'),
      } as any,
      'uploads',
      'user-1',
    );

    expect(mockBucket.file).toHaveBeenCalled();
    expect(mockFile.save).toHaveBeenCalled();
    expect(firebaseService.create).toHaveBeenCalledWith(
      'midia',
      expect.objectContaining({
        userId: 'user-1',
        folder: 'uploads',
        url: 'http://signed-url',
      }),
    );
    expect(result).toEqual({ url: 'http://signed-url' });
  });

  it('deve usar pasta padrão no uploadImage quando folder vazio', async () => {
    await service.uploadImage(
      {
        originalname: 'img.png',
        mimetype: 'image/png',
        buffer: Buffer.from('abc'),
      } as any,
      '',
      'user-1',
    );

    expect(firebaseService.create).toHaveBeenCalledWith(
      'midia',
      expect.objectContaining({
        folder: 'uploads',
      }),
    );
  });

  it('deve fazer upload de múltiplas imagens', async () => {
    const uploadSpy = jest
      .spyOn(service, 'uploadImage')
      .mockResolvedValue({ url: 'u' } as any);

    const result = await service.uploadMultipleImages(
      [{ originalname: '1.png' }, { originalname: '2.png' }] as any,
      'uploads',
      'user-1',
    );

    expect(uploadSpy).toHaveBeenCalledTimes(2);
    expect(result).toEqual([{ url: 'u' }, { url: 'u' }]);
  });

  it('deve retornar lista vazia no uploadMultipleImages sem arquivos', async () => {
    const uploadSpy = jest.spyOn(service, 'uploadImage');

    const result = await service.uploadMultipleImages([], 'uploads', 'user-1');

    expect(uploadSpy).not.toHaveBeenCalled();
    expect(result).toEqual([]);
  });

  it('deve paginar mídias com próxima página', async () => {
    mockFirebaseService.findPaginated.mockResolvedValue({
      data: [{ id: '1', url: 'u1', userId: 'user-1' }],
      pagination: {
        total: 2,
        totalPages: 2,
        currentPage: 1,
        limit: 1,
        hasNextPage: true,
        hasPreviousPage: false,
      },
    });

    const result = await service.getMidia('user-1', 1, 1, 'folder');

    expect(firebaseService.findPaginated).toHaveBeenCalledWith('midia', {
      filters: [
        { field: 'userId', operator: '==', value: 'user-1' },
        { field: 'folder', operator: '==', value: 'folder' },
      ],
      page: 1,
      limit: 1,
    });
    expect(result).toEqual({
      data: [{ id: '1', url: 'u1', userId: 'user-1' }],
      nextCursor: 2,
    });
  });

  it('deve paginar mídias sem próxima página e sem filtro de pasta', async () => {
    mockFirebaseService.findPaginated.mockResolvedValue({
      data: [{ id: '1', url: 'u1', userId: 'user-1' }],
      pagination: {
        total: 1,
        totalPages: 1,
        currentPage: 1,
        limit: 10,
        hasNextPage: false,
        hasPreviousPage: false,
      },
    });

    const result = await service.getMidia('user-1', 10, 1);

    expect(firebaseService.findPaginated).toHaveBeenCalledWith('midia', {
      filters: [{ field: 'userId', operator: '==', value: 'user-1' }],
      page: 1,
      limit: 10,
    });
    expect(result).toEqual({
      data: [{ id: '1', url: 'u1', userId: 'user-1' }],
      nextCursor: undefined,
    });
  });

  it('deve usar page=1 por padrão quando não informado', async () => {
    mockFirebaseService.findPaginated.mockResolvedValueOnce({
      data: [],
      pagination: {
        total: 0,
        totalPages: 0,
        currentPage: 1,
        limit: 10,
        hasNextPage: false,
        hasPreviousPage: false,
      },
    });

    await service.getMidia('user-1', 10);

    expect(firebaseService.findPaginated).toHaveBeenCalledWith('midia', {
      filters: [{ field: 'userId', operator: '==', value: 'user-1' }],
      page: 1,
      limit: 10,
    });
  });

  it('deve salvar mídia', async () => {
    await service.saveMidia({
      url: 'u',
      userId: 'u1',
      folder: 'f1',
    });

    expect(firebaseService.create).toHaveBeenCalledWith('midia', {
      url: 'u',
      userId: 'u1',
      folder: 'f1',
    });
  });

  it('deve deletar mídia com id', async () => {
    mockFirebaseService.delete.mockResolvedValueOnce(undefined);

    const result = await service.deleteMidia({
      id: 'm1',
      url: 'https://storage.googleapis.com/folder/img.png',
      userId: 'u1',
    });

    expect(mockFile.delete).toHaveBeenCalled();
    expect(firebaseService.delete).toHaveBeenCalledWith('midia', 'm1');
    expect(result).toBe(true);
  });

  it('deve deletar mídia sem id sem chamar delete no banco', async () => {
    const result = await service.deleteMidia({
      url: 'https://storage.googleapis.com/folder/img.png',
      userId: 'u1',
    });

    expect(firebaseService.delete).not.toHaveBeenCalled();
    expect(result).toBe(true);
  });

  it('deve retornar false ao falhar no deleteMidia', async () => {
    mockFile.delete.mockRejectedValueOnce(new Error('fail'));

    const result = await service.deleteMidia({
      id: 'm1',
      url: 'https://storage.googleapis.com/folder/img.png',
      userId: 'u1',
    });

    expect(result).toBe(false);
  });

  it('deve retornar true em deleteMidiaFromUrl quando não houver itens', async () => {
    mockFirebaseService.findAll.mockResolvedValueOnce([]);

    const result = await service.deleteMidiaFromUrl('url', 'user-1');

    expect(result).toBe(true);
    expect(firebaseService.batchDelete).not.toHaveBeenCalled();
  });

  it('deve remover mídias por url quando houver itens', async () => {
    mockFirebaseService.findAll.mockResolvedValueOnce([
      {
        id: '1',
        path: 'folder/img.png',
        userId: 'user-1',
        url: 'url',
      },
      {
        id: '2',
        path: 'folder/img.png',
        userId: 'user-1',
        url: 'url',
      },
    ]);

    const result = await service.deleteMidiaFromUrl('url', 'user-1');

    expect(mockFile.delete).toHaveBeenCalled();
    expect(firebaseService.batchDelete).toHaveBeenCalledWith('midia', ['1', '2']);
    expect(result).toBe(true);
  });

  it('deve remover mídias por url calculando path quando item não tem path', async () => {
    mockFirebaseService.findAll.mockResolvedValueOnce([
      {
        id: '1',
        userId: 'user-1',
        url: 'https://storage.googleapis.com/folder/img.png',
      },
    ]);

    const result = await service.deleteMidiaFromUrl(
      'https://storage.googleapis.com/folder/img.png',
      'user-1',
    );

    expect(mockBucket.file).toHaveBeenCalledWith('folder/img.png');
    expect(result).toBe(true);
  });

  it('deve retornar false ao falhar em deleteMidiaFromUrl', async () => {
    mockFirebaseService.findAll.mockRejectedValueOnce(new Error('fail'));

    const result = await service.deleteMidiaFromUrl('url', 'user-1');

    expect(result).toBe(false);
  });

  it('deve retornar false se mídia por id não existir', async () => {
    mockFirebaseService.findById.mockResolvedValueOnce(null);

    const result = await service.deleteMidiaById('id-1', 'user-1');

    expect(result).toBe(false);
  });

  it('deve retornar false se userId da mídia for diferente', async () => {
    mockFirebaseService.findById.mockResolvedValueOnce({
      id: 'id-1',
      url: 'url',
      userId: 'other-user',
    });

    const result = await service.deleteMidiaById('id-1', 'user-1');

    expect(result).toBe(false);
  });

  it('deve deletar mídia por id quando usuário bater', async () => {
    mockFirebaseService.findById.mockResolvedValueOnce({
      id: 'id-1',
      url: 'https://storage.googleapis.com/folder/img.png',
      userId: 'user-1',
    });

    const deleteSpy = jest.spyOn(service, 'deleteMidia').mockResolvedValueOnce(true);

    const result = await service.deleteMidiaById('id-1', 'user-1');

    expect(deleteSpy).toHaveBeenCalled();
    expect(result).toBe(true);
  });

  it('deve montar pastas com contagem ordenada e ignorar sem pasta', async () => {
    mockFirebaseService.findAll.mockResolvedValue([
      { id: '1', folder: 'B', userId: 'user-1', url: 'u' },
      { id: '2', folder: 'A', userId: 'user-1', url: 'u' },
      { id: '3', folder: 'B', userId: 'user-1', url: 'u' },
      { id: '4', userId: 'user-1', url: 'u' },
    ]);

    const result = await service.getFolders('user-1');

    expect(result).toEqual([
      { folder: 'A', count: 1 },
      { folder: 'B', count: 2 },
    ]);
  });
});
