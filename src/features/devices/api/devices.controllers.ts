import {
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from '../../../security/auth-service';
import { Request as Re, Response } from 'express';
import { ConnectService } from '../../connect/connect-service';
import { BlackListGuard } from '../../../security/black-list.guard';
import { InfoConnectGuard } from '../../../security/infoConnect-guard';

@UseGuards(InfoConnectGuard)
@Controller('security/devices')
export class DevicesController {
  constructor(
    private readonly authService: AuthService,
    private readonly connectService: ConnectService,
  ) {}

  @Get()
  async getDeviceList(
    @Req() req: Re,
    @Res({ passthrough: true }) res: Response,
  ) {
    const userId = await this.authService.getUserIdFromRefreshToken(
      req.cookies.refreshToken,
    );
    if (!userId) {
      res.sendStatus(401);
    } else {
      const deviceList = await this.connectService.getDeviceList(userId);
      res.status(200).send(deviceList);
    }
  }

  @UseGuards(BlackListGuard)
  @Delete()
  @HttpCode(204)
  async deleteAllSessions(
    @Req() req: Re,
    @Res({ passthrough: true }) res: Response,
  ) {
    if (!req.infoConnect.userId) {
      res.status(401).send('no userId');
      return;
    }
    await this.connectService.deleteUserSession(req.cookies.refreshToken);
    return true;
  }

  @UseGuards(BlackListGuard)
  @Delete('/:id')
  @HttpCode(204)
  async deleteSessionById(
    @Param('id') deviceId: string,
    @Req() req: Re,
    @Res({ passthrough: true }) res: Response,
  ) {
    if (!req.infoConnect.userId) {
      res.sendStatus(401);
      return;
    }
    const checkResult = await this.connectService.checkDeviceId(
      deviceId,
      req.cookies.refreshToken,
    );

    if (checkResult === null) {
      res.sendStatus(404);
      return;
    }
    if (!checkResult) {
      res.sendStatus(403);
      return;
    }
    return true;
  }
}
