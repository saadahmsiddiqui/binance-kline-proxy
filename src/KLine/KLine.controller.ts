import { Controller, Get, Query } from '@nestjs/common';
import { BinanceInterval, BinancePair } from 'src/types';
import { KLineService } from './KLine.service';

@Controller()
export class KLineController {
    constructor(private readonly kLineService: KLineService) {}

    @Get('klines')
    async getKLines(
        @Query('symbol') symbol: BinancePair,
        @Query('interval') interval: BinanceInterval,
        @Query('startTime') startTime: number,
        @Query('endTime') endTime: number,
        @Query('limit') limit: number,
    ): Promise<any[][]> {
        return await this.kLineService.getBinanceKLines(
            symbol,
            interval,
            startTime,
            endTime,
            limit,
        );
    }
}
