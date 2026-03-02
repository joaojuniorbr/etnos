import { Test, TestingModule } from '@nestjs/testing';
import { CharactersService } from './characters.service';
import { FirebaseService } from 'src/firebase';

describe('CharactersService', () => {
  let service: CharactersService;
  let firebaseService: FirebaseService;

  const mockCharacter = {
    id: '123',
    name: 'João Silva',
    slug: 'joao-silva',
    region: 'Asia',
    description: 'Descrição do personagem',
  };

  const mockFirebaseService = {
    findAll: jest.fn().mockResolvedValue([mockCharacter]),
    findOne: jest.fn().mockResolvedValue(mockCharacter),
    create: jest.fn().mockResolvedValue({ id: '123' }),
    update: jest.fn().mockResolvedValue(undefined),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CharactersService,
        {
          provide: FirebaseService,
          useValue: mockFirebaseService,
        },
      ],
    }).compile();

    service = module.get<CharactersService>(CharactersService);
    firebaseService = module.get<FirebaseService>(FirebaseService);
    jest.clearAllMocks();
  });

  it('deve chamar findAll com a coleção "character"', async () => {
    const result = await service.getCharacters();

    expect(firebaseService.findAll).toHaveBeenCalledWith('character');
    expect(result).toEqual([mockCharacter]);
  });

  it('deve chamar findOne com o filtro de slug correto', async () => {
    const slug = 'joao-silva';
    const result = await service.getCharacterBySlug(slug);

    expect(firebaseService.findOne).toHaveBeenCalledWith('character', [
      {
        field: 'slug',
        operator: '==',
        value: slug,
      },
    ]);
    expect(result).toEqual(mockCharacter);
  });

  it('deve criar personagem quando slug não existe', async () => {
    mockFirebaseService.findOne.mockResolvedValueOnce(null);

    const result = await service.save(mockCharacter);

    expect(firebaseService.create).toHaveBeenCalledWith('character', mockCharacter);
    expect(result).toEqual(mockCharacter);
  });

  it('deve retornar null ao criar personagem com slug duplicado', async () => {
    const result = await service.save(mockCharacter);

    expect(result).toBeNull();
    expect(firebaseService.create).not.toHaveBeenCalled();
  });

  it('deve atualizar personagem sem conflito', async () => {
    mockFirebaseService.findOne.mockResolvedValueOnce({ ...mockCharacter, id: '123' });

    const result = await service.update({
      ...mockCharacter,
      name: 'Atualizado',
    });

    expect(firebaseService.update).toHaveBeenCalledWith('character', '123', {
      ...mockCharacter,
      name: 'Atualizado',
    });
    expect(result?.name).toBe('Atualizado');
  });

  it('deve retornar null ao atualizar quando slug conflitar com outro id', async () => {
    mockFirebaseService.findOne.mockResolvedValueOnce({ ...mockCharacter, id: '999' });

    const result = await service.update({
      ...mockCharacter,
      id: '123',
    });

    expect(result).toBeNull();
    expect(firebaseService.update).not.toHaveBeenCalled();
  });
});
