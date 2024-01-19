import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'Comments' })
export class CommentEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'integer' })
  postId: number;

  @Column({ type: 'varchar' })
  content: string;

  @Column({ type: 'timestamp with time zone' })
  createdAt: Date;

  @Column({ type: 'integer' })
  userId: number;

  @Column({ type: 'varchar' })
  login: string;
}
