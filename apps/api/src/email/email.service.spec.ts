import {
  BadGatewayException,
  InternalServerErrorException,
} from '@nestjs/common';
import { EmailService } from './email.service';

describe('EmailService', () => {
  const originalApiKey = process.env.RESEND_API_KEY;

  afterEach(() => {
    process.env.RESEND_API_KEY = originalApiKey;
    jest.restoreAllMocks();
  });

  it('deve lançar erro ao inicializar sem RESEND_API_KEY', () => {
    delete process.env.RESEND_API_KEY;

    expect(() => new EmailService()).toThrow(InternalServerErrorException);
    expect(() => new EmailService()).toThrow(
      'Configuração de email ausente no servidor.',
    );
  });

  it('deve enviar email com sucesso', async () => {
    process.env.RESEND_API_KEY = 'resend-token';
    const jsonResponse = { id: 'mail-1' };

    const fetchMock = jest.spyOn(global, 'fetch' as any).mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue(jsonResponse),
    } as any);

    const service = new EmailService();
    const result = await service.sendEmail({
      to: 'contato@etnos.com',
      subject: 'Assunto',
      html: '<p>Teste</p>',
    });

    expect(fetchMock).toHaveBeenCalledWith(
      'https://api.resend.com/emails',
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          Authorization: 'Bearer resend-token',
          'Content-Type': 'application/json',
        }),
      }),
    );
    expect(result).toEqual(jsonResponse);
  });

  it('deve lançar BadGatewayException quando provedor responder erro', async () => {
    process.env.RESEND_API_KEY = 'resend-token';

    jest.spyOn(global, 'fetch' as any).mockResolvedValue({
      ok: false,
      text: jest.fn().mockResolvedValue('provider error'),
    } as any);

    const service = new EmailService();

    await expect(
      service.sendEmail({
        to: 'contato@etnos.com',
        subject: 'Assunto',
        html: '<p>Teste</p>',
      }),
    ).rejects.toThrow(BadGatewayException);
  });
});
