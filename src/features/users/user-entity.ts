import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class UserEntity {
  @PrimaryGeneratedColumn()
  Id: number;

  @Column()
  Login: string;

  @Column()
  Email: string;

  @Column()
  PasswordHash: string;

  @Column()
  PasswordSalt: string;

  @Column()
  CreatedAt: Date;

  @Column()
  ConfirmationCode: string;

  @Column()
  ExpirationDate: string;

  @Column()
  IsConfirmation: boolean;

  @Column()
  RecoveryCode: string;
}
