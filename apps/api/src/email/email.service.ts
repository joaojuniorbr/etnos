import { ConflictException, Injectable } from '@nestjs/common';

@Injectable()
export class EmailService {
  private readonly resendApiKey: string;

  constructor() {
    this.resendApiKey = process.env.RESEND_API_KEY;

    if (!this.resendApiKey) {
      throw new ConflictException('Configuração de email ausente no servidor.');
    }
  }

  async sendEmail({
    to,
    subject,
    html,
  }: {
    to: string;
    subject: string;
    html: string;
  }) {
    const emailResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'etnos@resend.dev',
        to: [to],
        subject: subject,
        html: html,
      }),
    });

    if (!emailResponse.ok) {
      const errorText = await emailResponse.text();

      throw new ConflictException('Falha ao enviar email.', {
        description: errorText,
      });
    }

    return emailResponse.json();
  }
}
