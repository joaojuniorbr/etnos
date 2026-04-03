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
            getSchools: jest
              .fn()
              .mockResolvedValue([{ id: 'school-1', name: 'Escola Teste' }]),
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

    await controller.sendContactEmail({ phone } as any);

    expect(publicService.sendContactEmail).toHaveBeenCalledWith(phone);
  });

  it('should delegate getSchools to public service', async () => {
    const result = await controller.getSchools();

    expect(publicService.getSchools).toHaveBeenCalledTimes(1);
    expect(result).toEqual([{ id: 'school-1', name: 'Escola Teste' }]);
  });
});
