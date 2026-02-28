import { Body, Controller, Post } from '@nestjs/common';
import { PublicService } from './public.service';

@Controller('public')
export class PublicController {
  constructor(private readonly publicService: PublicService) {}

  @Post('contact')
  sendContactEmail(@Body('phone') phone: string) {
    return this.publicService.sendContactEmail(phone);
  }
}
