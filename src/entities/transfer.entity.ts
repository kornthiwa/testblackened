import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { User } from './user.entity';
import { Currency } from './currency.entity';

@Entity('transfers')
export class Transfer {
  @PrimaryGeneratedColumn()
  transfer_id: number;

  @ManyToOne(() => User, (user) => user.outgoingTransfers, {
    onDelete: 'SET NULL',
  })
  fromUser: User;

  @ManyToOne(() => User, (user) => user.incomingTransfers, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  toUser: User | null;

  @ManyToOne(() => Currency, (currency) => currency.transfers, {
    onDelete: 'CASCADE',
  })
  currency: Currency;

  @Column({ type: 'decimal', precision: 18, scale: 8 })
  amount: string;

  @Column()
  type: string; // INTERNAL or EXTERNAL

  @Column({ type: 'varchar', nullable: true })
  external_address: string | null;

  @Column({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;
}

