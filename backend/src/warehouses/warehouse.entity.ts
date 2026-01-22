import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  JoinColumn,
} from 'typeorm';
import { Location } from '../locations/location.entity';

@Entity('warehouses')
export class Warehouse {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @ManyToOne(() => Location, { nullable: false })
  @JoinColumn({ name: 'locationId' })
  location: Location;

  @Column({ nullable: false })
  locationId: number;

  // Aisle configuration
  @Column({ type: 'varchar', length: 20, nullable: true })
  aisleType: 'numeric' | 'alphabetic' | null;

  @Column({ type: 'int', nullable: true })
  aisleCount: number | null;

  // Bay configuration
  @Column({ type: 'varchar', length: 20, nullable: true })
  bayType: 'numeric' | 'alphabetic' | null;

  @Column({ type: 'int', nullable: true })
  bayCount: number | null;

  // Level configuration
  @Column({ type: 'varchar', length: 20, nullable: true })
  levelType: 'numeric' | 'alphabetic' | null;

  @Column({ type: 'int', nullable: true })
  levelCount: number | null;

  // Bin configuration
  @Column({ type: 'varchar', length: 20, nullable: true })
  binType: 'numeric' | 'alphabetic' | null;

  @Column({ type: 'int', nullable: true })
  binCount: number | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
