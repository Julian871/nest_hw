import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { UsersModule } from '../users/users.module';
import { AuthController } from './api/auth.controller';
import { AuthService } from '../../security/auth-service';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/application/users-service';
import { SessionService } from '../devices/application/session-service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../../entities/user-entity';
import { ThrottlerModule } from '@nestjs/throttler';
import { RegistrationUserUseCase } from './use-cases/registration-user-use-case';
import { UsersRepo } from '../users/infrastructure/users-repo';
import { LogoutUseCase } from './use-cases/logout-use-case';
import { SendConfirmationCodeUseCase } from '../../email/send-caonfirmation-code-use-case';
import { SendRecoveryCodeUseCase } from '../../email/send-recovery-code-use-case';
import { UsersQueryRepo } from '../users/infrastructure/users-query-repo';
import { SessionRepo } from '../devices/infrastructure/session-repo';
import { DevicesModule } from '../devices/devices.module';
import { RegistrationEmailResendingUseCase } from './use-cases/registration-email-resending-use-case';

const services = [AuthService, JwtService, UsersService, SessionService];
const repositories = [SessionRepo, UsersRepo, UsersQueryRepo];
const useCases = [
  RegistrationUserUseCase,
  LogoutUseCase,
  RegistrationUserUseCase,
  RegistrationEmailResendingUseCase,
  SendConfirmationCodeUseCase,
  SendRecoveryCodeUseCase,
];

@Module({
  imports: [
    CqrsModule,
    UsersModule,
    DevicesModule,
    TypeOrmModule.forFeature([User]),
    ThrottlerModule.forRoot([
      {
        ttl: 10000,
        limit: 15,
      },
    ]),
  ],
  providers: [...services, ...repositories, ...useCases],
  controllers: [AuthController],
  exports: [TypeOrmModule],
})
export class AuthModule {}
