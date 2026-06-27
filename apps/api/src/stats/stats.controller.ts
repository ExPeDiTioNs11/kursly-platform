import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { StatsService } from './stats.service';
import { Public } from '../auth/decorators/public.decorator';

@ApiTags('stats')
@Controller('stats')
export class StatsController {
  constructor(private readonly statsService: StatsService) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'Public platform statistics + featured reviews' })
  getStats() {
    return this.statsService.getStats();
  }
}
