import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Transfer } from '../entities/transfer.entity';
import { User } from '../entities/user.entity';
import { Currency } from '../entities/currency.entity';
import { Wallet } from '../entities/wallet.entity';
import { TransfersController } from './transfers.controller';
import { TransfersService } from './transfers.service';

@Module({
  imports: [TypeOrmModule.forFeature([Transfer, User, Currency, Wallet])],
  controllers: [TransfersController],
  providers: [TransfersService],
  exports: [TransfersService],
})
export class TransfersModule {}
