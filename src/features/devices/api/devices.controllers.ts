import {
  Controller,
  Delete,
  Get,
  HttpCode,
  NotFoundException,
  Param,
  Req,
  Res,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from '../../../security/auth-service';
import { Request as Re, Response } from 'express';
import { SessionService } from '../application/session-service';
import { CheckSessionGuard } from '../../../security/checkSession-guard';
import { SessionRepo } from '../infrastructure/session-repo';

@UseGuards(CheckSessionGuard)
@Controller('security/devices')
export class DevicesController {
  constructor(
    private readonly authService: AuthService,
    private readonly connectService: SessionService,
    private readonly sessionRepository: SessionRepo,
  ) {}

  @Get()
  async getDeviceList(
    @Req() req: Re,
    @Res({ passthrough: true }) res: Response,
  ) {
    const userId = await this.authService.getUserIdFromRefreshToken(
      req.cookies.refreshToken,
    );
    if (!userId) return res.sendStatus(401);

    const deviceList = await this.connectService.getDeviceList(userId);
    return res.status(200).send(deviceList);
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

    if (!userId) throw new UnauthorizedException();

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
      res.status(401);
      return;
    }

    const checkSession =
      await this.sessionRepository.getSessionByDeviceId(deviceId);
    if (!checkSession) throw new NotFoundException();

    await this.connectService.deleteSessionById(
      deviceId,
      req.cookies.refreshToken,
      checkSession.userId!,
    );
    return true;
  }
}
