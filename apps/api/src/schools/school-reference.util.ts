import { BadRequestException } from '@nestjs/common';
import { PrismaService } from 'src/prisma';

export async function resolveSchoolId(
  prisma: PrismaService,
  schoolRef: string | null | undefined,
): Promise<string | null> {
  const normalized = schoolRef?.trim();

  if (!normalized) {
    return null;
  }

  const school = await prisma.school.findFirst({
    where: {
      OR: [{ id: normalized }, { code: normalized }],
    },
    select: { id: true },
  });

  if (!school) {
    throw new BadRequestException('Escola nao encontrada.');
  }

  return school.id;
}
