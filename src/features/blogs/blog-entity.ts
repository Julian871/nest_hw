import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'Blogs' })
export class BlogEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar' })
  name: string;

  @Column({ type: 'varchar' })
  description: string;

  @Column({ type: 'varchar' })
  websiteUrl: string;

  @Column({ type: 'timestamp with time zone', nullable: true })
  createdAt: Date;

  @Column({ type: 'boolean', default: false })
  isMembership: boolean;
}
