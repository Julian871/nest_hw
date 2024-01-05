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
import { SessionService } from '../session/session-service';
import { SessionRepository } from '../session/session-repository';
import { CheckSessionGuard } from '../../../security/checkSession-guard';

@UseGuards(CheckSessionGuard)
@Controller('security/devices')
export class DevicesController {
  constructor(
    private readonly authService: AuthService,
    private readonly connectService: SessionService,
    private readonly connectRepository: SessionRepository,
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
      return;
    } else {
      const deviceList = await this.connectService.getDeviceList(userId);
      res.status(200).send(deviceList);
      return;
    }
  }

  @Delete()
  @HttpCode(204)
  async deleteAllSessions(
    @Req() req: Re,
    @Res({ passthrough: true }) res: Response,
  ) {
    const userId = await this.authService.getUserIdFromRefreshToken(
      req.cookies.refreshToken,
    );

    if (!userId) {
      res.sendStatus(401);
      return;
    }

    await this.connectService.deleteUserSession(
      userId,
      req.cookies.refreshToken,
    );

    return true;
  }

  @Delete('/:id')
  @HttpCode(204)
  async deleteSessionById(
    @Param('id') deviceId: string,
    @Req() req: Re,
    @Res({ passthrough: true }) res: Response,
  ) {
    const userId = await this.authService.getUserIdFromRefreshToken(
      req.cookies.refreshToken,
    );
    if (!userId) {
      res.sendStatus(401);
      return;
    }
    const checkSession = await this.connectRepository.findSession(deviceId);
    if (!checkSession) {
      res.sendStatus(404);
      return;
    }

    const deleteSession = await this.connectService.checkDeviceId(
      deviceId,
      req.cookies.refreshToken,
      checkSession.userId,
    );

    if (!deleteSession) {
      res.sendStatus(403);
      return;
    }
    return true;
  }
}
