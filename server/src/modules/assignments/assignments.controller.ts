import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AssignmentsService } from './assignments.service';
import { CreateAssignmentDto } from './dto/create-assignment.dto';
import { UpdateAssignmentDto } from './dto/update-assignment.dto';
import { AssignmentQueryDto } from './dto/assignment-query.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Role } from '../../common/enums/roles.enum';

@ApiTags('Assignments')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('assignments')
export class AssignmentsController {
  constructor(private readonly assignmentsService: AssignmentsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Create a new assignment' })
  create(@Body() dto: CreateAssignmentDto, @CurrentUser() user: any) {
    return this.assignmentsService.create(dto, user.id);
  }

  @Get()
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Get all assignments' })
  findAll(@Query() query: AssignmentQueryDto) {
    return this.assignmentsService.findAll(query);
  }

  @Get('event/:eventId')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Get all assignments for an event' })
  findAllForEvent(@Param('eventId') eventId: string) {
    return this.assignmentsService.findAllForEvent(eventId);
  }

  @Get('event/:eventId/stats')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Get assignment stats for an event' })
  statsForEvent(@Param('eventId') eventId: string) {
    return this.assignmentsService.getStatsForEvent(eventId);
  }

  @Get(':id')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Get assignment by id' })
  findOne(@Param('id') id: string) {
    return this.assignmentsService.findOne(id);
  }

  @Patch(':id')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Update assignment' })
  update(@Param('id') id: string, @Body() dto: UpdateAssignmentDto) {
    return this.assignmentsService.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Remove assignment' })
  remove(@Param('id') id: string) {
    return this.assignmentsService.remove(id);
  }
}
