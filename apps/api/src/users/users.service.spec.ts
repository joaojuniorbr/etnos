import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from 'src/prisma';
import { UsersService } from './users.service';

const now = new Date('2026-04-23T09:00:00.000Z');

const createUser = (overrides: Record<string, unknown> = {}) => ({
  id: 'user-1',
  firebaseUid: 'firebase-user-1',
  email: 'aluno@test.com',
  parentName: 'Responsavel',
  childName: 'Aluno',
  childBirthDate: null,
  parentPhone: null,
  school: 'school-1',
  photoURL: null,
  avatarCharacterSlug: null,
  roles: ['student'],
  isActive: true,
  createdAt: now,
  updatedAt: now,
  ...overrides,
});

const createRequester = (overrides: Record<string, unknown> = {}) => ({
  id: 'requester-1',
  firebaseUid: 'requester-uid',
  school: 'school-1',
  roles: ['admin'],
  isActive: true,
  schoolAccesses: [],
  ...overrides,
});

describe('UsersService', () => {
  let service: UsersService;
  let prismaService: {
    user: {
      findMany: jest.Mock;
      findUnique: jest.Mock;
      update: jest.Mock;
    };
    school: {
      findMany: jest.Mock;
      findUnique: jest.Mock;
    };
  };

  beforeEach(async () => {
    prismaService = {
      user: {
        findMany: jest.fn().mockResolvedValue([createUser()]),
        findUnique: jest.fn().mockResolvedValue(createRequester()),
        update: jest.fn().mockResolvedValue(createUser({ roles: ['teacher'] })),
      },
      school: {
        findMany: jest
          .fn()
          .mockResolvedValue([{ id: 'school-1', name: 'Escola 1' }]),
        findUnique: jest.fn().mockResolvedValue({ name: 'Escola 1' }),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: PrismaService, useValue: prismaService },
      ],
    }).compile();

    service = module.get(UsersService);
    jest.clearAllMocks();
  });

  it('lista usuarios filtrando por escola e busca', async () => {
    const result = await service.findAll({ schoolId: 'school-1', search: 'ana' });

    expect(prismaService.user.findMany).toHaveBeenCalledWith({
      where: {
        school: 'school-1',
        OR: [
          { email: { contains: 'ana', mode: 'insensitive' } },
          { parentName: { contains: 'ana', mode: 'insensitive' } },
          { childName: { contains: 'ana', mode: 'insensitive' } },
          { firebaseUid: { contains: 'ana', mode: 'insensitive' } },
        ],
      },
      orderBy: [{ createdAt: 'desc' }, { email: 'asc' }],
    });
    expect(prismaService.school.findMany).toHaveBeenCalledWith({
      where: { id: { in: ['school-1'] } },
      select: { id: true, name: true },
    });
    expect(result).toEqual([
      {
        id: 'user-1',
        uid: 'firebase-user-1',
        email: 'aluno@test.com',
        parentName: 'Responsavel',
        childName: 'Aluno',
        school: 'school-1',
        schoolName: 'Escola 1',
        roles: ['student'],
        isActive: true,
        createdAt: now,
        updatedAt: now,
      },
    ]);
  });

  it('lista usuarios sem escola vinculada sem consultar escolas', async () => {
    prismaService.user.findMany.mockResolvedValueOnce([
      createUser({ school: null }),
    ]);

    const result = await service.findAll();

    expect(prismaService.school.findMany).not.toHaveBeenCalled();
    expect(result[0]?.schoolName).toBeNull();
  });

  it('lista usuario com escola sem nome resolvido como nulo', async () => {
    prismaService.school.findMany.mockResolvedValueOnce([]);

    const result = await service.findAll();

    expect(result[0]?.schoolName).toBeNull();
  });

  it('admin atualiza roles, escola e status', async () => {
    prismaService.user.findUnique
      .mockResolvedValueOnce(createRequester({ roles: ['admin'] }))
      .mockResolvedValueOnce(createUser());
    prismaService.user.update.mockResolvedValueOnce(
      createUser({
        roles: ['teacher'],
        school: 'school-2',
        isActive: false,
      }),
    );
    prismaService.school.findUnique.mockResolvedValueOnce({ name: 'Escola 2' });

    const result = await service.updateUser('admin-uid', 'user-1', {
      roles: ['teacher'],
      school: 'school-2',
      isActive: false,
    });

    expect(prismaService.user.update).toHaveBeenCalledWith({
      where: { id: 'user-1' },
      data: {
        roles: ['teacher'],
        school: 'school-2',
        isActive: false,
      },
    });
    expect(result.roles).toEqual(['teacher']);
    expect(result.schoolName).toBe('Escola 2');
  });

  it('admin atualiza usuario sem alterar campos opcionais e sem escola vinculada', async () => {
    prismaService.user.findUnique
      .mockResolvedValueOnce(createRequester({ roles: ['admin'] }))
      .mockResolvedValueOnce(createUser({ school: null }));
    prismaService.user.update.mockResolvedValueOnce(createUser({ school: null }));

    const result = await service.updateUser('admin-uid', 'user-1', {});

    expect(prismaService.user.update).toHaveBeenCalledWith({
      where: { id: 'user-1' },
      data: {},
    });
    expect(prismaService.school.findUnique).not.toHaveBeenCalled();
    expect(result.schoolName).toBeNull();
  });

  it('school admin promove usuario para professor dentro de escola gerenciada', async () => {
    prismaService.user.findUnique
      .mockResolvedValueOnce(
        createRequester({
          roles: ['school'],
          school: 'school-1',
          schoolAccesses: [{ schoolId: 'school-2' }],
        }),
      )
      .mockResolvedValueOnce(createUser({ school: 'school-2' }));

    await service.updateUser('school-uid', 'user-1', {
      roles: ['teacher'],
      school: 'school-2',
    });

    expect(prismaService.user.update).toHaveBeenCalledWith({
      where: { id: 'user-1' },
      data: {
        roles: ['teacher'],
        school: 'school-2',
      },
    });
  });

  it('school admin usa apenas escolas extras quando nao possui escola principal', async () => {
    prismaService.user.findUnique
      .mockResolvedValueOnce(
        createRequester({
          roles: ['school'],
          school: null,
          schoolAccesses: [{ schoolId: 'school-2' }],
        }),
      )
      .mockResolvedValueOnce(createUser({ school: 'school-2' }));

    await service.updateUser('school-uid', 'user-1', {
      roles: ['teacher'],
      school: 'school-2',
    });

    expect(prismaService.user.update).toHaveBeenCalled();
  });

  it('bloqueia requester inativo', async () => {
    prismaService.user.findUnique.mockResolvedValueOnce(
      createRequester({ isActive: false }),
    );

    await expect(
      service.updateUser('inactive', 'user-1', { roles: ['teacher'] }),
    ).rejects.toThrow(ForbiddenException);
  });

  it('bloqueia quando usuario alvo nao existe', async () => {
    prismaService.user.findUnique
      .mockResolvedValueOnce(createRequester({ roles: ['admin'] }))
      .mockResolvedValueOnce(null);

    await expect(
      service.updateUser('admin', 'missing', { roles: ['teacher'] }),
    ).rejects.toThrow(NotFoundException);
  });

  it('bloqueia alteracao do proprio perfil', async () => {
    prismaService.user.findUnique
      .mockResolvedValueOnce(
        createRequester({ roles: ['admin'], firebaseUid: 'same-uid' }),
      )
      .mockResolvedValueOnce(createUser({ firebaseUid: 'same-uid' }));

    await expect(
      service.updateUser('same-uid', 'user-1', { roles: ['teacher'] }),
    ).rejects.toThrow(ForbiddenException);
    expect(prismaService.user.update).not.toHaveBeenCalled();
  });

  it('bloqueia roles vazias ou invalidas', async () => {
    prismaService.user.findUnique
      .mockResolvedValueOnce(createRequester({ roles: ['admin'] }))
      .mockResolvedValueOnce(createUser({ firebaseUid: 'target-uid' }))
      .mockResolvedValueOnce(createRequester({ roles: ['admin'] }))
      .mockResolvedValueOnce(createUser({ firebaseUid: 'target-uid' }));

    await expect(
      service.updateUser('admin', 'user-1', { roles: [] }),
    ).rejects.toThrow(BadRequestException);

    await expect(
      service.updateUser('admin', 'user-1', { roles: ['invalid' as never] }),
    ).rejects.toThrow(BadRequestException);
  });

  it('bloqueia school admin sem permissao sobre a escola do usuario', async () => {
    prismaService.user.findUnique
      .mockResolvedValueOnce(createRequester({ roles: ['school'], school: 'school-1' }))
      .mockResolvedValueOnce(createUser({ school: 'school-3' }));

    await expect(
      service.updateUser('school', 'user-1', { roles: ['teacher'] }),
    ).rejects.toThrow(ForbiddenException);
  });

  it('bloqueia teacher tentando editar perfis', async () => {
    prismaService.user.findUnique
      .mockResolvedValueOnce(createRequester({ roles: ['teacher'] }))
      .mockResolvedValueOnce(createUser());

    await expect(
      service.updateUser('teacher', 'user-1', { roles: ['student'] }),
    ).rejects.toThrow(ForbiddenException);
  });

  it('bloqueia school admin alterando status ou perfis administrativos', async () => {
    prismaService.user.findUnique
      .mockResolvedValue(createRequester({ roles: ['school'], school: 'school-1' }));

    await expect(
      service.updateUser('school', 'user-1', { isActive: false }),
    ).rejects.toThrow(ForbiddenException);

    await expect(
      service.updateUser('school', 'user-1', { roles: ['admin'] }),
    ).rejects.toThrow(ForbiddenException);
  });

  it('bloqueia school admin promovendo usuário para perfil school', async () => {
    prismaService.user.findUnique
      .mockResolvedValueOnce(
        createRequester({ roles: ['school'], school: 'school-1' }),
      )
      .mockResolvedValueOnce(createUser({ school: 'school-1' }));

    await expect(
      service.updateUser('school', 'user-1', { roles: ['school'] }),
    ).rejects.toThrow(ForbiddenException);
  });

  it('bloqueia school admin alterando status mesmo com escola válida', async () => {
    prismaService.user.findUnique
      .mockResolvedValueOnce(
        createRequester({ roles: ['school'], school: 'school-1' }),
      )
      .mockResolvedValueOnce(createUser({ school: 'school-1' }));

    await expect(
      service.updateUser('school', 'user-1', {
        roles: ['teacher'],
        isActive: false,
      }),
    ).rejects.toThrow(ForbiddenException);
  });
});
