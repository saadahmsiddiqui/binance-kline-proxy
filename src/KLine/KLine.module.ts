import { Module } from '@nestjs/common';
import { KLineController } from './KLine.controller';
import { KLineGateway } from './KLine.gateway';
import { KLineService } from './KLine.service';

@Module({
    providers: [KLineGateway, KLineService],
    controllers: [KLineController],
})
export class KLineSocketModule {}
