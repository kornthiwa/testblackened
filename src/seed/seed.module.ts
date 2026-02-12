import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../entities/user.entity';
import { Currency } from '../entities/currency.entity';
import { Wallet } from '../entities/wallet.entity';
import { Order } from '../entities/order.entity';
import { Trade } from '../entities/trade.entity';
import { Escrow } from '../entities/escrow.entity';
import { Transfer } from '../entities/transfer.entity';
import { SeedService } from './seed.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
      Currency,
      Wallet,
      Order,
      Trade,
      Escrow,
      Transfer,
    ]),
  ],
  providers: [SeedService],
})
export class SeedModule {}
