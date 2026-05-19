import { Test, TestingModule } from '@nestjs/testing';
import { MidiaController } from './midia.controller';
import { MidiaService } from './midia.service';
import { AuthGuard } from '@nestjs/passport';
import { AdminRoleGuard, RequestUserOwnershipGuard } from 'src/common/guards';

describe('MidiaController', () => {
  let controller: MidiaController;
  let service: MidiaService;
  const secureUrl = 'https://url';

  const mockMidiaService = {
    uploadImage: jest.fn().mockResolvedValue({ url: secureUrl }),
    uploadMultipleImages: jest.fn().mockResolvedValue([{ url: secureUrl }]),
    getMidia: jest.fn().mockResolvedValue({ data: [], nextCursor: undefined }),
    getFolders: jest.fn().mockResolvedValue([]),
    saveMidia: jest.fn().mockResolvedValue({ id: 'midia-1' }),
    deleteMidiaById: jest.fn().mockResolvedValue(true),
    deleteMidiaFromUrl: jest.fn().mockResolvedValue(true),
    updateMidiaFolder: jest.fn().mockResolvedValue({ id: 'midia-1', folder: 'library' }),
  };

  const req = { user: { uid: 'user-1' } };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MidiaController],
      providers: [
        {
          provide: MidiaService,
          useValue: mockMidiaService,
        },
      ],
    })
      .overrideGuard(AuthGuard('firebase-auth'))
      .useValue({ canActivate: jest.fn(() => true) })
      .overrideGuard(RequestUserOwnershipGuard)
      .useValue({ canActivate: jest.fn(() => true) })
      .overrideGuard(AdminRoleGuard)
      .useValue({ canActivate: jest.fn(() => true) })
      .compile();

    controller = module.get<MidiaController>(MidiaController);
    service = module.get<MidiaService>(MidiaService);
    jest.clearAllMocks();
  });

  it('deve fazer upload de imagem', async () => {
    const file = { originalname: 'x.png' };

    const result = await controller.uploadImage(req, file, 'folder');

    expect(service.uploadImage).toHaveBeenCalledWith(file, 'folder', 'user-1');
    expect(result).toEqual({ url: secureUrl });
  });

  it('deve fazer upload de imagem com pasta padrão', async () => {
    const file = { originalname: 'x.png' };

    await controller.uploadImage(req, file);

    expect(service.uploadImage).toHaveBeenCalledWith(file, 'uploads', 'user-1');
  });

  it('deve fazer upload múltiplo', async () => {
    const result = await controller.uploadMultiple(
      req,
      { files: [{ originalname: 'x.png' }] },
      'folder',
    );

    expect(service.uploadMultipleImages).toHaveBeenCalledWith(
      [{ originalname: 'x.png' }],
      'folder',
      'user-1',
    );
    expect(result).toEqual([{ url: secureUrl }]);
  });

  it('deve fazer upload múltiplo com pasta padrão e lista vazia', async () => {
    await controller.uploadMultiple(req, {});

    expect(service.uploadMultipleImages).toHaveBeenCalledWith(
      [],
      'uploads',
      'user-1',
    );
  });

  it('deve listar mídias do usuário', async () => {
    const result = await controller.getMidia(req, '10', '1', 'folder');

    expect(service.getMidia).toHaveBeenCalledWith(
      'user-1',
      10,
      1,
      'folder',
      false,
    );
    expect(result).toEqual({ data: [], nextCursor: undefined });
  });

  it('deve listar mídias usando limit/page padrão', async () => {
    await controller.getMidia(req);

    expect(service.getMidia).toHaveBeenCalledWith(
      'user-1',
      10,
      1,
      undefined,
      false,
    );
  });

  it('deve listar pastas', async () => {
    await controller.getFolders(req);

    expect(service.getFolders).toHaveBeenCalledWith('user-1');
  });

  it('deve listar todas as mídias para admin', async () => {
    const result = await controller.getAllMidia('20', '3', 'library');

    expect(service.getMidia).toHaveBeenCalledWith(
      undefined,
      20,
      3,
      'library',
      false,
    );
    expect(result).toEqual({ data: [], nextCursor: undefined });
  });

  it('deve listar todas as mídias para admin com paginação padrão', async () => {
    await controller.getAllMidia();

    expect(service.getMidia).toHaveBeenCalledWith(
      undefined,
      10,
      1,
      undefined,
      false,
    );
  });

  it('deve listar todas as pastas para admin', async () => {
    await controller.getAllFolders();

    expect(service.getFolders).toHaveBeenCalledWith();
  });

  it('deve salvar registro de mídia forçando userId autenticado', async () => {
    await controller.saveMidia(req, { url: 'u', userId: 'x' } as any);

    expect(service.saveMidia).toHaveBeenCalledWith({
      url: 'u',
      userId: 'user-1',
    });
  });

  it('deve remover mídia por id', async () => {
    const result = await controller.deleteById(req, 'midia-1');

    expect(service.deleteMidiaById).toHaveBeenCalledWith('midia-1', 'user-1');
    expect(result).toBe(true);
  });

  it('deve remover mídia por id como admin', async () => {
    const result = await controller.adminDeleteById('midia-1');

    expect(service.deleteMidiaById).toHaveBeenCalledWith('midia-1');
    expect(result).toBe(true);
  });

  it('deve remover mídia por url', async () => {
    const result = await controller.deleteByUrl(req, secureUrl);

    expect(service.deleteMidiaFromUrl).toHaveBeenCalledWith(
      secureUrl,
      'user-1',
    );
    expect(result).toBe(true);
  });

  it('deve remover mídia por url como admin', async () => {
    const result = await controller.adminDeleteByUrl(secureUrl);

    expect(service.deleteMidiaFromUrl).toHaveBeenCalledWith(secureUrl);
    expect(result).toBe(true);
  });

  it('deve remover por body quando houver id', async () => {
    const result = await controller.deleteByBody(req, {
      id: 'm1',
      url: secureUrl,
    });

    expect(service.deleteMidiaById).toHaveBeenCalledWith('m1', 'user-1');
    expect(result).toBe(true);
  });

  it('deve remover por body quando houver url', async () => {
    const result = await controller.deleteByBody(req, {
      url: secureUrl,
    });

    expect(service.deleteMidiaFromUrl).toHaveBeenCalledWith(
      secureUrl,
      'user-1',
    );
    expect(result).toBe(true);
  });

  it('deve retornar false no deleteByBody sem id e sem url', async () => {
    const result = await controller.deleteByBody(req, {} as any);

    expect(result).toBe(false);
  });

  it('deve atualizar pasta da mídia', async () => {
    const result = await controller.updateFolder(req, 'midia-1', {
      folder: 'library',
    });

    expect(service.updateMidiaFolder).toHaveBeenCalledWith(
      'midia-1',
      'library',
      'user-1',
    );
    expect(result).toEqual({ id: 'midia-1', folder: 'library' });
  });

  it('deve atualizar pasta da mídia como admin', async () => {
    const result = await controller.adminUpdateFolder('midia-1', {
      folder: 'games',
    });

    expect(service.updateMidiaFolder).toHaveBeenCalledWith('midia-1', 'games');
    expect(result).toEqual({ id: 'midia-1', folder: 'library' });
  });

  it('deve listar mídias sem pasta quando uncategorized for true', async () => {
    await controller.getMidia(req, '10', '1', undefined, 'true');

    expect(service.getMidia).toHaveBeenCalledWith(
      'user-1',
      10,
      1,
      undefined,
      true,
    );
  });

  it('deve lançar NotFoundException ao atualizar pasta inexistente', async () => {
    mockMidiaService.updateMidiaFolder.mockResolvedValueOnce(null);

    await expect(
      controller.updateFolder(req, 'missing', { folder: 'library' }),
    ).rejects.toThrow('Mídia não encontrada');
  });

  it('deve lançar NotFoundException ao atualizar pasta inexistente como admin', async () => {
    mockMidiaService.updateMidiaFolder.mockResolvedValueOnce(null);

    await expect(
      controller.adminUpdateFolder('missing', { folder: 'library' }),
    ).rejects.toThrow('Mídia não encontrada');
  });
});
