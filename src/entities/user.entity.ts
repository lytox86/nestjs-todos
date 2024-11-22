import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

export enum UserRole {
  ADMIN = 'admin',
  USER = 'user',
}

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  username: string;

  @Column()
  hashedPassword: string;

  @Column({ default: false })
  isDeleted: boolean;

  @Column({ default: UserRole.USER })
  role: UserRole;

  @Column({ nullable: true })
  hashedRefreshToken: string;

  toResponseObject() {
    return {
      id: this.id,
      username: this.username,
    };
  }
}
