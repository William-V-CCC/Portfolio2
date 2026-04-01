import { Module } from '@nestjs/common';
import { ProjectsModule } from './projects/project.module';
import { DatabaseService } from './database/database.service';

@Module({
  imports: [ProjectsModule],
  providers: [DatabaseService],
  exports: [DatabaseService],
})
export class AppModule {}