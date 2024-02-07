import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Session } from '../../../entities/session-entity';

@Injectable()
export class SessionRepo {
  constructor(
    @InjectRepository(Session)
    private readonly sessionRepository: Repository<Session>,
  ) {}

  saveSession(session: Session) {
    return this.sessionRepository.save(session);
  }

  getSessionByDeviceId(deviceId: string) {
    return this.sessionRepository.findOneBy({ deviceId });
  }

  getSessionByUserId(userId: number) {
    return this.sessionRepository.findBy({ userId });
  }

  getSessionByDeviceIdAndDate(deviceId: string, lastActiveDate: string) {
    return this.sessionRepository.findOneBy({ deviceId, lastActiveDate });
  }

  async deleteSessionByDeviceId(deviceId: string) {
    const result = await this.sessionRepository.delete({ deviceId });
    return result.affected;
  }

  async deleteSessionByDeviceIdAndUserId(deviceId: string, userId: number) {
    const result = await this.sessionRepository
      .createQueryBuilder()
      .delete()
      .from(Session)
      .where('userId = :userId', { userId })
      .andWhere('deviceId != :deviceId', { deviceId })
      .execute();

    return result.affected;
  }

  async deleteCurrentSession(deviceId: string, lastActiveDate: string) {
    const result = await this.sessionRepository.delete({
      deviceId,
      lastActiveDate,
    });
    return result.affected;
  }
}
