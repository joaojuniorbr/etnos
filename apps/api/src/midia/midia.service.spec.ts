import { Test, TestingModule } from '@nestjs/testing';
import { MidiaService } from './midia.service';
import * as admin from 'firebase-admin';
import { PrismaService } from 'src/prisma';

jest.mock('firebase-admin', () => ({
  storage: jest.fn(),
}));

describe('MidiaService', () => {
  let service: MidiaService;
  let prismaService: {
    midia: {
      findMany: jest.Mock;
      findUnique: jest.Mock;
      count: jest.Mock;
      create: jest.Mock;
      delete: jest.Mock;
      deleteMany: jest.Mock;
    };
  };

  const mockPrismaService = {
    midia: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      count: jest.fn(),
      create: jest.fn(),
      delete: jest.fn(),
      deleteMany: jest.fn(),
    },
  };

  const mockFile = {
    save: jest.fn(),
    getSignedUrl: jest.fn().mockResolvedValue(['https://signed-url']),
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
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<MidiaService>(MidiaService);
    prismaService = module.get(PrismaService);
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
    const path = service.getPathFromUrl(
      'https://storage.googleapis.com/folder/img.png',
    );

    expect(path).toEqual('folder/img.png');
  });

  it('deve fazer upload de imagem e persistir metadados', async () => {
    mockPrismaService.midia.create.mockResolvedValue({ id: '1' });

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
    expect(prismaService.midia.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        userId: 'user-1',
        folder: 'uploads',
        url: 'https://signed-url',
      }),
    });
    expect(result).toEqual({ url: 'https://signed-url' });
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

    expect(prismaService.midia.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        folder: 'uploads',
      }),
    });
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
    mockPrismaService.midia.findMany.mockResolvedValue([
      { id: '1', url: 'u1', userId: 'user-1' },
    ]);
    mockPrismaService.midia.count.mockResolvedValue(2);

    const result = await service.getMidia('user-1', 1, 1, 'folder');

    expect(prismaService.midia.findMany).toHaveBeenCalledWith({
      where: { userId: 'user-1', folder: 'folder' },
      skip: 0,
      take: 1,
      orderBy: { createdAt: 'desc' },
    });
    expect(result).toEqual({
      data: [{ id: '1', url: 'u1', userId: 'user-1' }],
      nextCursor: 2,
    });
  });

  it('deve paginar mídias sem próxima página e sem filtro de pasta', async () => {
    mockPrismaService.midia.findMany.mockResolvedValue([
      { id: '1', url: 'u1', userId: 'user-1' },
    ]);
    mockPrismaService.midia.count.mockResolvedValue(1);

    const result = await service.getMidia('user-1', 10, 1);

    expect(prismaService.midia.findMany).toHaveBeenCalledWith({
      where: { userId: 'user-1' },
      skip: 0,
      take: 10,
      orderBy: { createdAt: 'desc' },
    });
    expect(result).toEqual({
      data: [{ id: '1', url: 'u1', userId: 'user-1' }],
      nextCursor: undefined,
    });
  });

  it('deve listar todas as mídias quando userId não for informado', async () => {
    mockPrismaService.midia.findMany.mockResolvedValue([
      { id: '1', url: 'u1' },
    ]);
    mockPrismaService.midia.count.mockResolvedValue(1);

    const result = await service.getMidia(undefined, 10, 1);

    expect(prismaService.midia.findMany).toHaveBeenCalledWith({
      where: {},
      skip: 0,
      take: 10,
      orderBy: { createdAt: 'desc' },
    });
    expect(result).toEqual({
      data: [{ id: '1', url: 'u1' }],
      nextCursor: undefined,
    });
  });

  it('deve usar page=1 por padrão quando não informado', async () => {
    mockPrismaService.midia.findMany.mockResolvedValueOnce([]);
    mockPrismaService.midia.count.mockResolvedValueOnce(0);

    await service.getMidia('user-1', 10);

    expect(prismaService.midia.findMany).toHaveBeenCalledWith({
      where: { userId: 'user-1' },
      skip: 0,
      take: 10,
      orderBy: { createdAt: 'desc' },
    });
  });

  it('deve salvar mídia', async () => {
    await service.saveMidia({
      url: 'u',
      userId: 'u1',
      folder: 'f1',
    });

    expect(prismaService.midia.create).toHaveBeenCalledWith({
      data: {
        id: undefined,
        url: 'u',
        userId: 'u1',
        folder: 'f1',
        path: undefined,
      },
    });
  });

  it('deve deletar mídia com id', async () => {
    prismaService.midia.delete.mockResolvedValueOnce(undefined);

    const result = await service.deleteMidia({
      id: 'm1',
      url: 'https://storage.googleapis.com/folder/img.png',
      userId: 'u1',
    });

    expect(mockFile.delete).toHaveBeenCalled();
    expect(prismaService.midia.delete).toHaveBeenCalledWith({
      where: { id: 'm1' },
    });
    expect(result).toBe(true);
  });

  it('deve deletar mídia sem id sem chamar delete no banco', async () => {
    const result = await service.deleteMidia({
      url: 'https://storage.googleapis.com/folder/img.png',
      userId: 'u1',
    });

    expect(prismaService.midia.delete).not.toHaveBeenCalled();
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
    mockPrismaService.midia.findMany.mockResolvedValueOnce([]);

    const result = await service.deleteMidiaFromUrl('url', 'user-1');

    expect(result).toBe(true);
    expect(prismaService.midia.deleteMany).not.toHaveBeenCalled();
  });

  it('deve remover mídias por url quando houver itens', async () => {
    mockPrismaService.midia.findMany.mockResolvedValueOnce([
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
    expect(prismaService.midia.deleteMany).toHaveBeenCalledWith({
      where: { id: { in: ['1', '2'] } },
    });
    expect(result).toBe(true);
  });

  it('deve remover mídias por url sem filtrar por usuário no modo admin', async () => {
    mockPrismaService.midia.findMany.mockResolvedValueOnce([
      {
        id: '1',
        path: 'folder/img.png',
        userId: 'user-1',
        url: 'url',
      },
    ]);

    const result = await service.deleteMidiaFromUrl('url');

    expect(prismaService.midia.findMany).toHaveBeenCalledWith({
      where: { url: 'url' },
    });
    expect(result).toBe(true);
  });

  it('deve remover mídias por url calculando path quando item não tem path', async () => {
    mockPrismaService.midia.findMany.mockResolvedValueOnce([
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
    mockPrismaService.midia.findMany.mockRejectedValueOnce(new Error('fail'));

    const result = await service.deleteMidiaFromUrl('url', 'user-1');

    expect(result).toBe(false);
  });

  it('deve retornar false se mídia por id não existir', async () => {
    mockPrismaService.midia.findUnique.mockResolvedValueOnce(null);

    const result = await service.deleteMidiaById('id-1', 'user-1');

    expect(result).toBe(false);
  });

  it('deve retornar false se userId da mídia for diferente', async () => {
    mockPrismaService.midia.findUnique.mockResolvedValueOnce({
      id: 'id-1',
      url: 'url',
      userId: 'other-user',
    });

    const result = await service.deleteMidiaById('id-1', 'user-1');

    expect(result).toBe(false);
  });

  it('deve deletar mídia por id quando usuário bater', async () => {
    mockPrismaService.midia.findUnique.mockResolvedValueOnce({
      id: 'id-1',
      url: 'https://storage.googleapis.com/folder/img.png',
      userId: 'user-1',
    });

    const deleteSpy = jest
      .spyOn(service, 'deleteMidia')
      .mockResolvedValueOnce(true);

    const result = await service.deleteMidiaById('id-1', 'user-1');

    expect(deleteSpy).toHaveBeenCalled();
    expect(result).toBe(true);
  });

  it('deve montar pastas com contagem ordenada e ignorar sem pasta', async () => {
    mockPrismaService.midia.findMany.mockResolvedValue([
      { folder: 'B' },
      { folder: 'A' },
      { folder: 'B' },
      { folder: null },
    ]);

    const result = await service.getFolders('user-1');

    expect(result).toEqual([
      { folder: 'A', count: 1 },
      { folder: 'B', count: 2 },
    ]);
  });

  it('deve listar pastas sem filtrar por usuário no modo admin', async () => {
    mockPrismaService.midia.findMany.mockResolvedValue([{ folder: 'games' }]);

    const result = await service.getFolders();

    expect(prismaService.midia.findMany).toHaveBeenCalledWith({
      where: {},
      select: { folder: true },
    });
    expect(result).toEqual([{ folder: 'games', count: 1 }]);
  });
});
