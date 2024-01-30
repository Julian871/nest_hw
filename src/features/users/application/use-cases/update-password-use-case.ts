import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UsersRepo } from '../../infrastructure/users-repo';
import { BadRequestException } from '@nestjs/common';
import { NewPasswordInputModel } from '../../../auth/api/auth-model';
import { UsersService } from '../users-service';

export class UpdatePasswordCommand {
  constructor(public body: NewPasswordInputModel) {}
}

@CommandHandler(UpdatePasswordCommand)
export class UpdatePasswordUseCase
  implements ICommandHandler<UpdatePasswordCommand>
{
  constructor(
    private readonly usersRepo: UsersRepo,
    private readonly usersService: UsersService,
  ) {}

  async execute(command: UpdatePasswordCommand) {
    const user = await this.usersRepo.checkRecoveryCode(
      command.body.recoveryCode,
    );
    if (!user) throw new BadRequestException('recovery code');

    const generate = await this.usersService.generateHashAndSalt(
      command.body.newPassword,
    );

    user.passwordSalt = generate.passwordSalt;
    user.passwordHash = generate.passwordHash;
    user.recoveryCode = null;
    await this.usersRepo.saveUser(user);
    return true;
  }
}
