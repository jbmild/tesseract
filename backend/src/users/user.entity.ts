import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  ManyToMany,
  CreateDateColumn,
  UpdateDateColumn,
  JoinColumn,
  JoinTable,
} from 'typeorm';
import { Role } from '../roles/role.entity';
import { Client } from '../clients/client.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  username: string;

  @Column()
  password: string; // Will be hashed

  @ManyToMany(() => Client, (client) => client.users)
  @JoinTable({
    name: 'user_clients',
    joinColumn: { name: 'userId', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'clientId', referencedColumnName: 'id' },
  })
  clients: Client[];

  @ManyToOne(() => Role, (role) => role.users, { nullable: true })
  @JoinColumn({ name: 'roleId' })
  role: Role | null;

  @Column({ nullable: true })
  roleId: number | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
