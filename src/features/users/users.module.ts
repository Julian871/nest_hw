import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { UsersService } from './application/users-service';
import { AuthService } from '../../security/auth-service';
import { UsersController } from './api/users.controller';
import { JwtService } from '@nestjs/jwt';
import { CreateUserUseCase } from './application/use-cases/create-user-use-case';
import { DeleteUserUseCase } from './application/use-cases/delete-user-use-case';
import { GetUsersUseCase } from './application/use-cases/get-users-use-case';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../../entities/user-entity';
import { UsersRepo } from './infrastructure/users-repo';
import { UsersQueryRepo } from './infrastructure/users-query-repo';
import { SendRecoveryCodeUseCase } from '../../email/send-recovery-code-use-case';
import { SendConfirmationCodeUseCase } from '../../email/send-caonfirmation-code-use-case';
import { UpdatePasswordUseCase } from './application/use-cases/update-password-use-case';
import { SessionRepo } from '../devices/infrastructure/session-repo';
import { DevicesModule } from '../devices/devices.module';

const services = [UsersService, AuthService, JwtService];
const repositories = [SessionRepo, UsersRepo, UsersQueryRepo];
const useCases = [
  CreateUserUseCase,
  DeleteUserUseCase,
  GetUsersUseCase,
  SendRecoveryCodeUseCase,
  SendConfirmationCodeUseCase,
  UpdatePasswordUseCase,
];

@Module({
  imports: [CqrsModule, DevicesModule, TypeOrmModule.forFeature([User])],
  providers: [...services, ...repositories, ...useCases],
  controllers: [UsersController],
  exports: [TypeOrmModule],
})
export class UsersModule {}
