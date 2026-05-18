import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CloudinaryService } from '../uploads/cloudinary.service';
import { UploadDocumentDto } from './dto/upload-document.dto';

@Injectable()
export class StaffDocumentsService {
  private readonly logger = new Logger(StaffDocumentsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly cloudinary: CloudinaryService,
  ) {}

  async upload(
    staffId: string,
    file: Express.Multer.File,
    dto: UploadDocumentDto,
  ) {
    // Verify staff exists
    const staff = await this.prisma.staff.findFirst({
      where: { id: staffId, isDeleted: false },
      select: { id: true, fullName: true },
    });
    if (!staff) throw new NotFoundException('Staff member not found');

    if (!file || !file.buffer) {
      throw new BadRequestException('No file provided');
    }

    const folder = `niyukti/staff-documents/${staffId}`;
    const publicId = `${staffId}-${dto.type}-${Date.now()}`;

    const result = await this.cloudinary.uploadBuffer(file.buffer, folder, publicId);

    const doc = await this.prisma.staffDocument.create({
      data: {
        staffId,
        type: dto.type,
        url: result.secure_url,
        cloudinaryId: result.public_id,
      },
    });

    this.logger.log(
      `Document uploaded for staff ${staffId}: ${dto.type} → ${result.public_id}`,
    );
    return doc;
  }

  async findByStaff(staffId: string) {
    const staff = await this.prisma.staff.findFirst({
      where: { id: staffId, isDeleted: false },
      select: { id: true },
    });
    if (!staff) throw new NotFoundException('Staff member not found');

    return this.prisma.staffDocument.findMany({
      where: { staffId },
      orderBy: { uploadedAt: 'desc' },
    });
  }

  async remove(staffId: string, docId: string) {
    const doc = await this.prisma.staffDocument.findFirst({
      where: { id: docId, staffId },
    });
    if (!doc) throw new NotFoundException('Document not found');

    // Determine resource type: PDFs are 'raw', images are 'image'
    const resourceType = doc.cloudinaryId.endsWith('.pdf') ? 'raw' : 'image';
    await this.cloudinary.deleteAsset(doc.cloudinaryId, resourceType);

    await this.prisma.staffDocument.delete({ where: { id: docId } });

    this.logger.log(`Document deleted: ${docId} for staff ${staffId}`);
    return { id: docId, deleted: true };
  }
}
