import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'Users' })
export class UserEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  login: string;

  @Column()
  email: string;

  @Column()
  passwordHash: string;

  @Column()
  passwordSalt: string;

  @Column()
  createdAt: string;

  @Column()
  confirmationCode: string;

  @Column()
  expirationDate: string;

  @Column()
  isConfirmation: boolean;

  @Column({ type: 'varchar', nullable: true })
  recoveryCode: string | null;
}
