import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'Comments' })
export class Comment {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'integer' })
  postId: number;

  @Column({ type: 'varchar' })
  content: string;

  @Column({ type: 'timestamp with time zone' })
  createdAt: Date;

  @Column({ type: 'varchar' })
  login: string;

  @Column({ type: 'integer' })
  userId: number;
}
