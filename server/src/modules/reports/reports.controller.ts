import {
  Controller,
  Get,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ReportsService } from './reports.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../../common/enums/roles.enum';

@ApiTags('Reports')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('overview')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Get dashboard overview stats' })
  getOverview() {
    return this.reportsService.getOverview();
  }

  @Get('financials')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Get financial report' })
  getFinancials() {
    return this.reportsService.getFinancials();
  }

  @Get('events')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Get events report' })
  getEventsReport(
    @Query('page') page: string,
    @Query('limit') limit: string,
  ) {
    return this.reportsService.getEventsReport(Number(page) || 1, Number(limit) || 10);
  }

  @Get('staff')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Get staff report' })
  getStaffReport(
    @Query('page') page: string,
    @Query('limit') limit: string,
  ) {
    return this.reportsService.getStaffReport(Number(page) || 1, Number(limit) || 10);
  }
}
