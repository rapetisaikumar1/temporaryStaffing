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
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiConsumes, ApiOperation, ApiTags } from '@nestjs/swagger';
import { StaffService } from './staff.service';
import { StaffDocumentsService } from './staff-documents.service';
import { CreateStaffDto } from './dto/create-staff.dto';
import { UpdateStaffDto } from './dto/update-staff.dto';
import { UpdateStaffStatusDto } from './dto/update-staff-status.dto';
import { StaffQueryDto } from './dto/staff-query.dto';
import { UploadDocumentDto } from './dto/upload-document.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Role } from '../../common/enums/roles.enum';

@ApiTags('Staff')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('staff')
export class StaffController {
  constructor(
    private readonly staffService: StaffService,
    private readonly staffDocumentsService: StaffDocumentsService,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Create a staff member' })
  create(@Body() dto: CreateStaffDto, @CurrentUser() user: any) {
    return this.staffService.create(dto, user.id);
  }

  @Get()
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Get all staff members' })
  findAll(@Query() query: StaffQueryDto) {
    return this.staffService.findAll(query);
  }

  @Get('stats')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Get staff statistics' })
  getStats() {
    return this.staffService.getStats();
  }

  @Get(':id')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Get staff member by id' })
  findOne(@Param('id') id: string) {
    return this.staffService.findOne(id);
  }

  @Patch(':id')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Update staff member' })
  update(@Param('id') id: string, @Body() dto: UpdateStaffDto) {
    return this.staffService.update(id, dto);
  }

  @Patch(':id/status')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Update staff status' })
  updateStatus(@Param('id') id: string, @Body() dto: UpdateStaffStatusDto) {
    return this.staffService.updateStatus(id, dto.status);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Soft delete staff member' })
  remove(@Param('id') id: string) {
    return this.staffService.softDelete(id);
  }

  // ── Staff Documents ──────────────────────────────────────────────────────

  @Post(':staffId/documents')
  @HttpCode(HttpStatus.CREATED)
  @Roles(Role.ADMIN)
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Upload a document for a staff member' })
  @UseInterceptors(FileInterceptor('file', { limits: { fileSize: 5 * 1024 * 1024 } }))
  uploadDocument(
    @Param('staffId') staffId: string,
    @UploadedFile() file: Express.Multer.File,
    @Body() dto: UploadDocumentDto,
  ) {
    return this.staffDocumentsService.upload(staffId, file, dto);
  }

  @Get(':staffId/documents')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'List documents for a staff member' })
  getDocuments(@Param('staffId') staffId: string) {
    return this.staffDocumentsService.findByStaff(staffId);
  }

  @Delete(':staffId/documents/:docId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Delete a staff document' })
  removeDocument(
    @Param('staffId') staffId: string,
    @Param('docId') docId: string,
  ) {
    return this.staffDocumentsService.remove(staffId, docId);
  }
}
