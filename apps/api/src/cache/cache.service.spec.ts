import { CacheService } from './cache.service';

describe('CacheService', () => {
  let service: CacheService;

  beforeEach(() => {
    service = new CacheService();
  });

  it('armazena e reutiliza valor dentro do TTL', async () => {
    const factory = jest.fn().mockResolvedValue('valor');

    await expect(service.getOrSet('key', 60_000, factory)).resolves.toBe(
      'valor',
    );
    await expect(service.getOrSet('key', 60_000, factory)).resolves.toBe(
      'valor',
    );

    expect(factory).toHaveBeenCalledTimes(1);
  });

  it('invalida entradas por prefixo', async () => {
    service.set('school:game-access:1', { ok: true }, 60_000);
    service.set('school:game-access:2', { ok: true }, 60_000);
    service.set('catalog:schools:all', [], 60_000);

    service.invalidateByPrefix('school:game-access:');

    expect(service.get('school:game-access:1')).toBeUndefined();
    expect(service.get('school:game-access:2')).toBeUndefined();
    expect(service.get('catalog:schools:all')).toEqual([]);
  });

  it('limpa todo o cache', () => {
    service.set('a', 1, 60_000);
    service.clear();
    expect(service.get('a')).toBeUndefined();
  });
});
