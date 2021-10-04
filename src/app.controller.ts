import { Controller, Get, Query } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('klines')
  async getKLines(
    @Query('symbol') symbol: string,
    @Query('interval')
    interval:
      | '1m'
      | '3m'
      | '5m'
      | '15m'
      | '30m'
      | '1h'
      | '2h'
      | '4h'
      | '6h'
      | '8h'
      | '12h'
      | '1d'
      | '3d'
      | '1w'
      | '1M',
      @Query('startTime') startTime: number,
      @Query('endTime') endTime: number,
      @Query('limit') limit: number,
  ): Promise<any[][]> {
    return await this.appService.getBinanceKLines(symbol, interval, startTime, endTime, limit);
  }
}
