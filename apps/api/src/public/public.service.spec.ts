import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { PublicService } from './public.service';
import { EmailService } from 'src/email';
import { FirebaseService } from 'src/firebase';

describe('PublicService', () => {
  let service: PublicService;
  let emailService: jest.Mocked<EmailService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PublicService,
        {
          provide: EmailService,
          useValue: {
            sendEmail: jest.fn().mockResolvedValue({ ok: true }),
          },
        },
        {
          provide: FirebaseService,
          useValue: {
            findAll: jest.fn().mockResolvedValue([]),
          },
        },
      ],
    }).compile();

    service = module.get<PublicService>(PublicService);
    emailService = module.get(EmailService);
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
    expect(() => service.sendContactEmail(undefined)).toThrow(BadRequestException);
  });

  it('should throw when normalized phone has less than 10 digits', () => {
    expect(() => service.sendContactEmail('12345')).toThrow(BadRequestException);
  });

  it('should throw when normalized phone has more than 11 digits', () => {
    expect(() => service.sendContactEmail('119999900001')).toThrow(
      BadRequestException,
    );
  });
});
