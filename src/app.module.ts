import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { User } from './entities/user.entity';
import { Currency } from './entities/currency.entity';
import { Wallet } from './entities/wallet.entity';
import { Order } from './entities/order.entity';
import { Trade } from './entities/trade.entity';
import { Escrow } from './entities/escrow.entity';
import { Transfer } from './entities/transfer.entity';
import { UsersModule } from './users/users.module';
import { OrdersModule } from './orders/orders.module';
import { TransfersModule } from './transfers/transfers.module';
import { TestFlowModule } from './test-flow/test-flow.module';
import { SeedModule } from './seed/seed.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: 'cryptocurrencies.db',
      entities: [User, Currency, Wallet, Order, Trade, Escrow, Transfer],
      synchronize: true,
    }),
    SeedModule,
    UsersModule,
    OrdersModule,
    TransfersModule,
    TestFlowModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
