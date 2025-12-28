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
  });

  describe('getCharacters', () => {
    it('deve chamar findAll com a coleção "character"', async () => {
      const result = await service.getCharacters();

      expect(firebaseService.findAll).toHaveBeenCalledWith('character');
      expect(result).toEqual([mockCharacter]);
    });
  });

  describe('getCharacterBySlug', () => {
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
  });
});
