import { Test, TestingModule } from '@nestjs/testing';
import { PublicController } from './public.controller';
import { PublicService } from './public.service';

describe('PublicController', () => {
  let controller: PublicController;
  let publicService: jest.Mocked<PublicService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PublicController],
      providers: [
        {
          provide: PublicService,
          useValue: {
            sendContactEmail: jest.fn().mockResolvedValue({ ok: true }),
          },
        },
      ],
    }).compile();

    controller = module.get<PublicController>(PublicController);
    publicService = module.get(PublicService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should delegate phone to public service', async () => {
    const phone = '(11) 99999-0000';

    await controller.sendContactEmail(phone);

    expect(publicService.sendContactEmail).toHaveBeenCalledWith(phone);
  });
});
