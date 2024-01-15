import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'Posts' })
export class PostEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column()
  shortDescription: string;

  @Column({ nullable: true })
  content: string;

  @Column()
  blogId: string;

  @Column()
  blogName: string;

  @Column()
  createdAt: string;
}
