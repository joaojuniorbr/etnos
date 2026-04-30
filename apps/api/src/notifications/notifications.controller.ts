import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { AdminRoleGuard, SchoolRoleGuard } from 'src/common';
import { NotificationsService } from './notifications.service';
import { SendNotificationWithDeeplinkDto } from './dto/send-notification-with-deeplink.dto';
import { CreateTemplateDto } from './dto/create-template.dto';
import { UpdateTemplateDto } from './dto/update-template.dto';
import { RegisterPushTokenDto } from './dto/register-push-token.dto';
import { UnregisterPushTokenDto } from './dto/unregister-push-token.dto';
import { CountNotificationRecipientsDto } from './dto/count-notification-recipients.dto';

@ApiTags('Notificações')
@UseGuards(AuthGuard('firebase-auth'))
@ApiBearerAuth()
@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Post('push-token')
  @ApiOperation({ summary: 'Registra ou atualiza o push token do dispositivo' })
  @ApiBody({ type: RegisterPushTokenDto })
  async registerPushToken(@Req() req, @Body() dto: RegisterPushTokenDto) {
    return this.notificationsService.registerPushToken(req.user.uid, dto);
  }

  @Delete('push-token')
  @ApiOperation({ summary: 'Remove push token do usuário autenticado' })
  @ApiBody({ type: UnregisterPushTokenDto, required: false })
  async unregisterPushToken(@Req() req, @Body() dto?: UnregisterPushTokenDto) {
    return this.notificationsService.unregisterPushToken(req.user.uid, dto);
  }

  @Post('send')
  @UseGuards(SchoolRoleGuard)
  @ApiOperation({ summary: 'Envia notificação push para usuários' })
  @ApiBody({ type: SendNotificationWithDeeplinkDto })
  async send(@Req() req, @Body() dto: SendNotificationWithDeeplinkDto) {
    return this.notificationsService.send(req.user.uid, dto);
  }

  @Get('recipients-count')
  @UseGuards(SchoolRoleGuard)
  @ApiOperation({
    summary: 'Conta usuários habilitados para receber notificação push',
  })
  async countRecipients(
    @Req() req,
    @Query() query: CountNotificationRecipientsDto,
  ) {
    return this.notificationsService.countRecipients(req.user.uid, query);
  }

  @Get('history')
  @UseGuards(SchoolRoleGuard)
  @ApiOperation({ summary: 'Retorna histórico de notificações enviadas' })
  async getHistory(@Req() req) {
    return this.notificationsService.getHistory(req.user.uid);
  }

  @Get('templates')
  @UseGuards(SchoolRoleGuard)
  @ApiOperation({ summary: 'Lista templates de notificação' })
  async getTemplates() {
    return this.notificationsService.getTemplates();
  }

  @Post('templates')
  @UseGuards(SchoolRoleGuard)
  @ApiOperation({ summary: 'Cria template de notificação' })
  @ApiBody({ type: CreateTemplateDto })
  async createTemplate(@Req() req, @Body() dto: CreateTemplateDto) {
    return this.notificationsService.createTemplate(req.user.uid, dto);
  }

  @Put('templates/:id')
  @UseGuards(AdminRoleGuard)
  @ApiOperation({ summary: 'Atualiza template de notificação' })
  @ApiParam({ name: 'id' })
  @ApiBody({ type: UpdateTemplateDto })
  async updateTemplate(
    @Param('id') id: string,
    @Body() dto: UpdateTemplateDto,
  ) {
    return this.notificationsService.updateTemplate(id, dto);
  }

  @Delete('templates/:id')
  @UseGuards(AdminRoleGuard)
  @ApiOperation({ summary: 'Remove template de notificação' })
  @ApiParam({ name: 'id' })
  async deleteTemplate(@Param('id') id: string) {
    return this.notificationsService.deleteTemplate(id);
  }
}
