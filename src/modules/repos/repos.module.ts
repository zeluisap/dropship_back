import { Module, HttpModule } from '@nestjs/common';
import { ReposService } from './repos.service';
import { HttpReposService } from './http-repos.service';

@Module({
  imports: [
    HttpModule.registerAsync({
      useFactory: () => ({
        timeout: 5000,
        maxRedirects: 5,
      }),
    }),
  ],
  providers: [ReposService, HttpReposService],
  exports: [ReposService],
})
export class ReposModule {}
