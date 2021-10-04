import { Module } from '@nestjs/common';
import { KLineGateway } from './KLine.gateway';

@Module({
    providers: [KLineGateway],
})
export class KLineSocketModule {}
