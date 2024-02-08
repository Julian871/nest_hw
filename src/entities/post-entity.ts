import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  OneToMany,
  ManyToOne,
} from 'typeorm';
import { PostLike } from './post-like-entity';
import { Comment } from './comment-entity';
import { Blog } from './blog-entity';

@Entity({ name: 'Posts' })
export class Post {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar' })
  title: string;

  @Column({ type: 'varchar' })
  shortDescription: string;

  @Column({ type: 'varchar', nullable: true })
  content: string;

  @Column({ type: 'timestamp with time zone', nullable: true })
  createdAt: Date;

  @OneToMany('PostLike', 'post')
  postLikes: PostLike[];

  @OneToMany('Comment', 'post')
  comments: Comment[];

  @ManyToOne('Blog', 'posts')
  blog: Blog;
}
