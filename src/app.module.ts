import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { KLineSocketModule } from './KLine/KLine.module';
@Module({
  imports: [KLineSocketModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
