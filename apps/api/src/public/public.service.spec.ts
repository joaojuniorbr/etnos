import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { PublicService } from './public.service';
import { CacheService } from 'src/cache';
import { EmailService } from 'src/email';
import { PrismaService } from 'src/prisma';

describe('PublicService', () => {
  let service: PublicService;
  let emailService: jest.Mocked<EmailService>;
  let prismaService: {
    school: {
      findMany: jest.Mock;
    };
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PublicService,
        CacheService,
        {
          provide: EmailService,
          useValue: {
            sendEmail: jest.fn().mockResolvedValue({ ok: true }),
          },
        },
        {
          provide: PrismaService,
          useValue: {
            school: {
              findMany: jest.fn().mockResolvedValue([]),
            },
          },
        },
      ],
    }).compile();

    service = module.get<PublicService>(PublicService);
    emailService = module.get(EmailService);
    prismaService = module.get(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should normalize phone and call email service', () => {
    process.env.CONTACT_RECEIVER_EMAIL = 'contato@etnos.com';

    service.sendContactEmail('(11) 99999-0000');

    expect(emailService.sendEmail).toHaveBeenCalledWith({
      to: 'contato@etnos.com',
      subject: '[Etnos] Contato Landing Page',
      html: expect.stringContaining('11999990000'),
    });
  });

  it('should throw when phone is not a string', () => {
    expect(() => service.sendContactEmail(undefined)).toThrow(
      BadRequestException,
    );
  });

  it('should throw when normalized phone has less than 10 digits', () => {
    expect(() => service.sendContactEmail('12345')).toThrow(
      BadRequestException,
    );
  });

  it('should throw when normalized phone has more than 11 digits', () => {
    expect(() => service.sendContactEmail('119999900001')).toThrow(
      BadRequestException,
    );
  });

  it('should return schools ordered by name from firebase service', async () => {
    prismaService.school.findMany.mockResolvedValueOnce([
      { id: 'school-1', name: 'Escola A' },
    ] as any);

    const result = await service.getSchools();

    expect(prismaService.school.findMany).toHaveBeenCalledWith({
      orderBy: {
        name: 'asc',
      },
    });
    expect(result).toEqual([{ id: 'school-1', name: 'Escola A' }]);
  });
});
