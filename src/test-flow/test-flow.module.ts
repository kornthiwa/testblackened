import { Module } from '@nestjs/common';
import { UsersModule } from '../users/users.module';
import { OrdersModule } from '../orders/orders.module';
import { TransfersModule } from '../transfers/transfers.module';
import { TestFlowService } from './test-flow.service';
import { TestFlowController } from './test-flow.controller';

@Module({
  imports: [UsersModule, OrdersModule, TransfersModule],
  controllers: [TestFlowController],
  providers: [TestFlowService],
})
export class TestFlowModule {}
