import { Module } from '@nestjs/common';
import { KLineSocketModule } from './KLine/KLine.module';
@Module({
    imports: [KLineSocketModule],
})
export class AppModule {}
