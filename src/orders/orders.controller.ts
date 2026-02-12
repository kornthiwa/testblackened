import { Controller, Get, Post, Body, Query } from '@nestjs/common';
import { OrdersService } from './orders.service';

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  createOrder(
    @Body('userId') userId: number,
    @Body('type') type: 'BUY' | 'SELL',
    @Body('cryptoCurrencyCode') cryptoCurrencyCode: string,
    @Body('fiatCurrencyCode') fiatCurrencyCode: string,
    @Body('price') price: string,
    @Body('amount') amount: string,
  ) {
    return this.ordersService.createOrder({
      userId,
      type,
      cryptoCurrencyCode,
      fiatCurrencyCode,
      price,
      amount,
    });
  }

  @Get()
  listOpenOrders(
    @Query('crypto') crypto?: string,
    @Query('fiat') fiat?: string,
    @Query('type') type?: 'BUY' | 'SELL',
  ) {
    return this.ordersService.listOpenOrders(crypto, fiat, type);
  }
}

