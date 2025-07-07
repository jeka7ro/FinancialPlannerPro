import path from 'path';
import fs from 'fs/promises';
import { storage } from '../storage.js';
export class FileService {
    constructor() {
        this.uploadDir = path.join(process.cwd(), 'uploads');
        this.ensureUploadDir();
    }
    async ensureUploadDir() {
        try {
            await fs.access(this.uploadDir);
        }
        catch {
            await fs.mkdir(this.uploadDir, { recursive: true });
        }
    }
    async saveFile(file, entityType, entityId, uploadedBy, description) {
        const filename = `${Date.now()}-${Math.random().toString(36).substring(7)}-${file.originalname}`;
        const filePath = path.join(this.uploadDir, filename);
        await fs.writeFile(filePath, file.buffer);
        const attachment = {
            filename,
            originalName: file.originalname,
            mimeType: file.mimetype,
            fileSize: file.size,
            filePath: `/uploads/${filename}`,
            entityType,
            entityId,
            uploadedBy,
            description: description || null,
        };
        return await storage.createAttachment(attachment);
    }
    async getFile(filename) {
        const filePath = path.join(this.uploadDir, filename);
        try {
            const data = await fs.readFile(filePath);
            return data;
        }
        catch (error) {
            throw new Error('File not found');
        }
    }
    async deleteFile(attachmentId) {
        const attachment = await storage.getAttachment(attachmentId);
        if (!attachment) {
            throw new Error('Attachment not found');
        }
        const filename = path.basename(attachment.filePath);
        const filePath = path.join(this.uploadDir, filename);
        try {
            await fs.unlink(filePath);
        }
        catch (error) {
            console.warn('Failed to delete physical file:', error);
        }
        await storage.deleteAttachment(attachmentId);
    }
    isValidFileType(mimeType) {
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
    getFileIcon(mimeType) {
        if (mimeType.startsWith('image/'))
            return '🖼️';
        if (mimeType === 'application/pdf')
            return '📄';
        if (mimeType.includes('word'))
            return '📝';
        if (mimeType.includes('excel') || mimeType.includes('spreadsheet'))
            return '📊';
        if (mimeType.includes('zip'))
            return '📦';
        return '📁';
    }
}
export const fileService = new FileService();
