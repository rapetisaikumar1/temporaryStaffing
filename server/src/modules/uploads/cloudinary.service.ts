import { Injectable, Logger, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v2 as cloudinary, UploadApiResponse } from 'cloudinary';
import { Readable } from 'stream';

@Injectable()
export class CloudinaryService {
  private readonly logger = new Logger(CloudinaryService.name);

  constructor(private readonly config: ConfigService) {
    cloudinary.config({
      cloud_name: this.config.get<string>('cloudinary.cloudName'),
      api_key: this.config.get<string>('cloudinary.apiKey'),
      api_secret: this.config.get<string>('cloudinary.apiSecret'),
    });
  }

  /**
   * Upload a buffer to Cloudinary via stream.
   * @param buffer   File buffer from multer
   * @param folder   Cloudinary folder path (e.g. 'niyukti/staff-documents')
   * @param publicId Optional public ID override
   */
  async uploadBuffer(
    buffer: Buffer,
    folder: string,
    publicId?: string,
  ): Promise<UploadApiResponse> {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder,
          public_id: publicId,
          resource_type: 'auto',
          allowed_formats: ['jpg', 'jpeg', 'png', 'webp', 'pdf'],
          max_bytes: 5 * 1024 * 1024, // 5 MB
        },
        (error, result) => {
          if (error || !result) {
            this.logger.error('Cloudinary upload failed', error);
            return reject(
              new InternalServerErrorException('File upload failed. Please try again.'),
            );
          }
          resolve(result);
        },
      );

      const readable = new Readable();
      readable.push(buffer);
      readable.push(null);
      readable.pipe(uploadStream);
    });
  }

  /**
   * Delete an asset from Cloudinary by its public ID.
   */
  async deleteAsset(publicId: string, resourceType: 'image' | 'raw' = 'image'): Promise<void> {
    try {
      await cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
      this.logger.log(`Cloudinary asset deleted: ${publicId}`);
    } catch (err) {
      this.logger.warn(`Failed to delete Cloudinary asset: ${publicId}`, err);
      // Non-fatal — DB record will still be removed
    }
  }
}
