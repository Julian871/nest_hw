import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { Comment } from './comment-entity';
import { CommentLike } from './comment-like-entity';
import { PostLike } from './post-like-entity';

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

  @OneToMany('Comment', 'owner')
  comments: Comment[];

  @OneToMany('CommentLike', 'owner')
  commentLikes: CommentLike[];

  @OneToMany('PostLike', 'owner')
  postLikes: PostLike[];
}
