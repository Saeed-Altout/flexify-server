import { Module, MiddlewareConsumer, RequestMethod } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './modules/auth.module';
import { CookieParserMiddleware } from './middleware/cookie-parser.middleware';
import { CorsMiddleware } from './middleware/cors.middleware';
import { GlobalCookieMiddleware } from './middleware/global-cookie.middleware';
import configuration from './config/configuration';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),
    AuthModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(GlobalCookieMiddleware, CorsMiddleware, CookieParserMiddleware)
      .forRoutes({ path: '*', method: RequestMethod.ALL });
  }
}
