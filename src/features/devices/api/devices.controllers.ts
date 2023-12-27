import {
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Req,
  Res,
} from '@nestjs/common';
import { AuthService } from '../../auth/application/auth-service';
import { Request as Re, Response } from 'express';
import { ConnectService } from '../../connect/connect-service';

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

  @Delete()
  @HttpCode(204)
  async deleteAllSessions(
    @Req() req: Re,
    @Res({ passthrough: true }) res: Response,
  ) {
    await this.connectService.deleteUserSession(req.cookies.refreshToken);
    return true;
  }

  @Delete('/:id')
  @HttpCode(204)
  async deleteSessionById(
    @Param('id') sessionId: string,
    @Req() req: Re,
    @Res({ passthrough: true }) res: Response,
  ) {
    const checkResult = await this.connectService.checkDeviceId(
      sessionId,
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
