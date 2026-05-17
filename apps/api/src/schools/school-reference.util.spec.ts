import { BadRequestException } from '@nestjs/common';
import { resolveSchoolId } from './school-reference.util';

describe('resolveSchoolId', () => {
  const prisma = {
    school: {
      findFirst: jest.fn(),
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('retorna null quando referencia estiver vazia', async () => {
    await expect(resolveSchoolId(prisma as never, null)).resolves.toBeNull();
    await expect(resolveSchoolId(prisma as never, undefined)).resolves.toBeNull();
    await expect(resolveSchoolId(prisma as never, '   ')).resolves.toBeNull();
    expect(prisma.school.findFirst).not.toHaveBeenCalled();
  });

  it('resolve escola por id ou codigo', async () => {
    prisma.school.findFirst.mockResolvedValueOnce({ id: 'school-1' });

    await expect(resolveSchoolId(prisma as never, 'IFPR')).resolves.toBe(
      'school-1',
    );

    expect(prisma.school.findFirst).toHaveBeenCalledWith({
      where: {
        OR: [{ id: 'IFPR' }, { code: 'IFPR' }],
      },
      select: { id: true },
    });
  });

  it('lanca erro quando escola nao existir', async () => {
    prisma.school.findFirst.mockResolvedValueOnce(null);

    await expect(resolveSchoolId(prisma as never, 'inexistente')).rejects.toThrow(
      BadRequestException,
    );
  });
});
