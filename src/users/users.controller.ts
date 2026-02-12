import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Body,
} from '@nestjs/common';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  createUser(@Body('email') email: string, @Body('password') password: string) {
    // ในงานจริงควร hash password; ที่นี่ simplifed
    return this.usersService.createUser(email, password);
  }

  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.findUserWithRelations(id);
  }

  @Get(':id/wallets')
  getWallets(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.getUserWallets(id);
  }

  @Get(':id/orders')
  getOrders(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.getUserOrders(id);
  }
}
