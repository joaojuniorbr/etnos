import { Test, TestingModule } from '@nestjs/testing';
import { CharactersController } from './characters.controller';
import { CharactersService } from './characters.service';

describe('CharactersController', () => {
  let controller: CharactersController;
  let service: CharactersService;

  const mockCharacter = {
    id: '123',
    name: 'João Silva',
    slug: 'joao-silva',
    region: 'Asia',
    description: 'Descrição do personagem',
  };

  const mockCharactersService = {
    getCharacters: jest.fn().mockResolvedValue([mockCharacter]),
    getCharacterBySlug: jest.fn().mockResolvedValue(mockCharacter),
    save: jest.fn().mockResolvedValue(mockCharacter),
    update: jest.fn().mockResolvedValue(mockCharacter),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CharactersController],
      providers: [
        {
          provide: CharactersService,
          useValue: mockCharactersService,
        },
      ],
    }).compile();

    controller = module.get<CharactersController>(CharactersController);
    service = module.get<CharactersService>(CharactersService);
    jest.clearAllMocks();
  });

  it('deve retornar um array de personagens', async () => {
    const result = await controller.getCharacters();

    expect(result).toEqual([mockCharacter]);
    expect(service.getCharacters).toHaveBeenCalledTimes(1);
  });

  it('deve retornar um personagem específico baseado no slug', async () => {
    const slug = 'joao-silva';
    const result = await controller.getCharacterBySlug(slug);

    expect(result).toEqual(mockCharacter);
    expect(service.getCharacterBySlug).toHaveBeenCalledWith(slug);
  });

  it('deve salvar personagem', async () => {
    const result = await controller.save(mockCharacter as any);

    expect(service.save).toHaveBeenCalledWith(mockCharacter);
    expect(result).toEqual(mockCharacter);
  });

  it('deve atualizar personagem com id da rota', async () => {
    const result = await controller.update('123', {
      ...mockCharacter,
      id: 'other-id',
    } as any);

    expect(service.update).toHaveBeenCalledWith({
      ...mockCharacter,
      id: '123',
    });
    expect(result).toEqual(mockCharacter);
  });
});
