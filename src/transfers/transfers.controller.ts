import { Body, Controller, Get, Param, ParseIntPipe, Post } from '@nestjs/common';
import { TransfersService } from './transfers.service';

@Controller('transfers')
export class TransfersController {
  constructor(private readonly transfersService: TransfersService) {}

  @Post()
  createTransfer(
    @Body('fromUserId') fromUserId: number,
    @Body('toUserId') toUserId: number | undefined,
    @Body('currencyCode') currencyCode: string,
    @Body('amount') amount: string,
    @Body('type') type: 'INTERNAL' | 'EXTERNAL',
    @Body('externalAddress') externalAddress?: string,
  ) {
    return this.transfersService.createTransfer({
      fromUserId,
      toUserId,
      currencyCode,
      amount,
      type,
      externalAddress,
    });
  }

  @Get('user/:id')
  listByUser(@Param('id', ParseIntPipe) id: number) {
    return this.transfersService.listByUser(id);
  }
}

