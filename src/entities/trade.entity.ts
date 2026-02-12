import {
  Column,
  Entity,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Order } from './order.entity';
import { User } from './user.entity';
import { Escrow } from './escrow.entity';

@Entity('trades')
export class Trade {
  @PrimaryGeneratedColumn()
  trade_id: number;

  @ManyToOne(() => Order, (order) => order.trades, { onDelete: 'CASCADE' })
  order: Order;

  @ManyToOne(() => User, (user) => user.buyTrades, { onDelete: 'CASCADE' })
  buyer: User;

  @ManyToOne(() => User, (user) => user.sellTrades, { onDelete: 'CASCADE' })
  seller: User;

  @Column({ type: 'decimal', precision: 18, scale: 8 })
  crypto_amount: string;

  @Column({ type: 'decimal', precision: 18, scale: 2 })
  fiat_amount: string;

  @Column({ default: 'PENDING' })
  status: string; // PENDING, COMPLETED

  @Column({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @OneToOne(() => Escrow, (escrow) => escrow.trade)
  escrow: Escrow;
}

