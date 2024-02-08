import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { User } from './user-entity';
import { Post } from './post-entity';
import { CommentLike } from './comment-like-entity';

@Entity({ name: 'Comments' })
export class Comment {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar' })
  content: string;

  @Column({ type: 'timestamp with time zone' })
  createdAt: Date;

  @ManyToOne('User', 'comments')
  owner: User;

  @ManyToOne('Post', 'comments')
  post: Post;

  @OneToMany('CommentLike', 'comment')
  commentLikes: CommentLike[];
}
