import path from 'path';
import fs from 'fs/promises';
import { storage } from '../storage.js';
import type { InsertAttachment } from '../../shared/schema.js';

export class FileService {
  private uploadDir = path.join(process.cwd(), 'uploads');

  constructor() {
    this.ensureUploadDir();
  }

  private async ensureUploadDir() {
    try {
      await fs.access(this.uploadDir);
    } catch {
      await fs.mkdir(this.uploadDir, { recursive: true });
    }
  }

  async saveFile(
    file: Express.Multer.File,
    entityType: string,
    entityId: number,
    uploadedBy: number,
    description?: string
  ) {
    const filename = `${Date.now()}-${Math.random().toString(36).substring(7)}-${file.originalname}`;
    
    // Convert file buffer to base64 for online storage
    const fileData = file.buffer.toString('base64');
    
    // For local development, also save to disk
    if (process.env.NODE_ENV === 'development') {
      const filePath = path.join(this.uploadDir, filename);
      await fs.writeFile(filePath, file.buffer);
    }

    const attachment: InsertAttachment = {
      filename,
      originalName: file.originalname,
      mimeType: file.mimetype,
      fileSize: file.size,
      filePath: fileData, // Store base64 data in filePath field
      entityType,
      entityId,
      uploadedBy,
      description: description || null,
    };

    return await storage.createAttachment(attachment);
  }

  async getFile(filename: string) {
    try {
      // Get file from database (base64 stored in filePath)
      const attachment = await storage.getAttachmentByFilename(filename);
      if (attachment && attachment.filePath) {
        // Check if filePath contains base64 data (starts with data: or is long base64 string)
        if (attachment.filePath.length > 100 && !attachment.filePath.startsWith('/')) {
          return Buffer.from(attachment.filePath, 'base64');
        }
      }
      
      // Fallback to disk for local development
      if (process.env.NODE_ENV === 'development') {
        const filePath = path.join(this.uploadDir, filename);
        const data = await fs.readFile(filePath);
        return data;
      }
      
      throw new Error('File not found');
    } catch (error) {
      throw new Error('File not found');
    }
  }

  async deleteFile(attachmentId: number) {
    const attachment = await storage.getAttachment(attachmentId);
    if (!attachment) {
      throw new Error('Attachment not found');
    }

    const filename = path.basename(attachment.filePath);
    const filePath = path.join(this.uploadDir, filename);

    try {
      await fs.unlink(filePath);
    } catch (error) {
      console.warn('Failed to delete physical file:', error);
    }

    await storage.deleteAttachment(attachmentId);
  }

  isValidFileType(mimeType: string): boolean {
    const allowedTypes = [
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
      'application/pdf',
      'text/plain',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/zip',
      'application/x-zip-compressed',
    ];
    
    return allowedTypes.includes(mimeType);
  }

  getFileIcon(mimeType: string): string {
    if (mimeType.startsWith('image/')) return '🖼️';
    if (mimeType === 'application/pdf') return '📄';
    if (mimeType.includes('word')) return '📝';
    if (mimeType.includes('excel') || mimeType.includes('spreadsheet')) return '📊';
    if (mimeType.includes('zip')) return '📦';
    return '📁';
  }
}

export const fileService = new FileService();