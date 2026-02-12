import {
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from './user.entity';
import { Currency } from './currency.entity';
import { Trade } from './trade.entity';

@Entity('orders')
export class Order {
  @PrimaryGeneratedColumn()
  order_id: number;

  @ManyToOne(() => User, (user) => user.orders, { onDelete: 'CASCADE' })
  user: User;

  @Column()
  type: string; // BUY or SELL

  @ManyToOne(() => Currency, (currency) => currency.cryptoOrders, {
    onDelete: 'RESTRICT',
  })
  cryptoCurrency: Currency;

  @ManyToOne(() => Currency, (currency) => currency.fiatOrders, {
    onDelete: 'RESTRICT',
  })
  fiatCurrency: Currency;

  @Column({ type: 'decimal', precision: 18, scale: 2 })
  price: string;

  @Column({ type: 'decimal', precision: 18, scale: 8 })
  amount: string;

  @Column({ default: 'OPEN' })
  status: string; // OPEN, CLOSED, CANCELLED

  @Column({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @OneToMany(() => Trade, (trade) => trade.order)
  trades: Trade[];
}

