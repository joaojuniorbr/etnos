import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { FirebaseService } from './firebase.service';
import * as admin from 'firebase-admin';
import { NotFoundException } from '@nestjs/common';

jest.mock('firebase-admin', () => ({
  initializeApp: jest.fn().mockReturnValue({
    firestore: jest.fn().mockReturnValue({
      collection: jest.fn(),
      batch: jest.fn(),
    }),
  }),
  credential: {
    cert: jest.fn(),
  },
  firestore: {
    FieldValue: {
      serverTimestamp: jest.fn().mockReturnValue('mock-timestamp'),
    },
  },
}));

describe('FirebaseService', () => {
  let service: FirebaseService;
  let configService: ConfigService;

  const mockGet = jest.fn();
  const mockWhere = jest.fn().mockReturnThis();
  const mockLimit = jest.fn().mockReturnThis();
  const mockCollection = {
    doc: jest.fn().mockReturnThis(),
    where: mockWhere,
    limit: mockLimit,
    get: mockGet,
  };

  beforeEach(async () => {
    const fakeBase64 = Buffer.from(
      JSON.stringify({ project_id: 'test' }),
    ).toString('base64');

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FirebaseService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn().mockReturnValue(fakeBase64),
          },
        },
      ],
    }).compile();

    service = module.get<FirebaseService>(FirebaseService);
    configService = module.get<ConfigService>(ConfigService);

    (service as any).firestore = admin.initializeApp().firestore();
    jest
      .spyOn((service as any).firestore, 'collection')
      .mockReturnValue(mockCollection);
  });

  it.only('deve inicializar o firebase no onModuleInit', () => {
    const spy = jest.spyOn(service as any, 'initializeFirebase');
    service.onModuleInit();
    expect(spy).toHaveBeenCalled();
    expect(configService.get).toHaveBeenCalledWith('FIREBASE_BASE64');
  });

  describe('findAll', () => {
    it('deve retornar lista de documentos formatados', async () => {
      mockGet.mockResolvedValue({
        docs: [
          { id: '1', data: () => ({ name: 'Item 1' }) },
          { id: '2', data: () => ({ name: 'Item 2' }) },
        ],
      });

      const result = await service.findAll('test-collection');

      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({ id: '1', name: 'Item 1' });
      expect(mockCollection.where).not.toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('deve lançar NotFoundException quando o snapshot for vazio', async () => {
      mockGet.mockResolvedValue({ empty: true });

      await expect(
        service.findOne('test-collection', [
          { field: 'slug', operator: '==', value: 'x' },
        ]),
      ).rejects.toThrow(NotFoundException);
    });

    it('deve retornar o primeiro documento encontrado', async () => {
      mockGet.mockResolvedValue({
        empty: false,
        docs: [{ id: '123', data: () => ({ slug: 'test' }) }],
      });

      const result = await service.findOne('test-collection', []);
      expect(result).toEqual({ id: '123', slug: 'test' });
      expect(mockCollection.limit).toHaveBeenCalledWith(1);
    });
  });

  describe('delete', () => {
    it('deve chamar o método delete do documento', async () => {
      const mockDelete = jest.fn().mockResolvedValue(undefined);
      mockCollection.doc.mockReturnValue({ delete: mockDelete });

      await service.delete('test-collection', 'id-para-deletar');

      expect(mockCollection.doc).toHaveBeenCalledWith('id-para-deletar');
      expect(mockDelete).toHaveBeenCalled();
    });
  });
});
