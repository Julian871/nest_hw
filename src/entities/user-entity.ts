import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'Users' })
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar' })
  login: string;

  @Column({ type: 'varchar' })
  email: string;

  @Column({ type: 'varchar' })
  passwordHash: string;

  @Column({ type: 'varchar' })
  passwordSalt: string;

  @Column({ type: 'timestamp with time zone' })
  createdAt: Date;

  @Column({ type: 'varchar', nullable: true })
  confirmationCode: string | null;

  @Column({ type: 'timestamp with time zone' })
  expirationDate: Date;

  @Column({ type: 'boolean', default: false })
  isConfirmation: boolean;

  @Column({ type: 'varchar', nullable: true, default: null })
  recoveryCode: string | null;
}
