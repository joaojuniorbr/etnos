import { BadRequestException, Injectable } from '@nestjs/common';
import { EmailService } from 'src/email';
import { PrismaService } from 'src/prisma';

@Injectable()
export class PublicService {
  constructor(
    private readonly emailService: EmailService,
    private readonly prismaService: PrismaService,
  ) {}

  sendContactEmail(phone: unknown) {
    if (typeof phone !== 'string') {
      throw new BadRequestException('Telefone inválido.');
    }

    const normalizedPhone = phone.replaceAll(/\D/g, '');

    if (normalizedPhone.length < 10 || normalizedPhone.length > 11) {
      throw new BadRequestException('Telefone inválido.');
    }

    const subject = '[Etnos] Contato Landing Page';
    const html = `<p>
    Acabamos de receber um telefone:
    <strong>Telefone:</strong> ${normalizedPhone}</p>
    <p>Entre em contato com o cliente o mais rápido possível!</p>`;

    return this.emailService.sendEmail({
      to: process.env.CONTACT_RECEIVER_EMAIL,
      subject,
      html,
    });
  }

  getSchools() {
    return this.prismaService.school.findMany({
      orderBy: {
        name: 'asc',
      },
    });
  }
}
