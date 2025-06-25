import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

export class LogoService {
  private uploadsDir = path.join(process.cwd(), 'uploads', 'logos');

  constructor() {
    // Ensure uploads directory exists
    if (!fs.existsSync(this.uploadsDir)) {
      fs.mkdirSync(this.uploadsDir, { recursive: true });
    }
  }

  // Fetch logo from internet URL and save locally
  async fetchLogoFromUrl(url: string, providerName: string): Promise<string> {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Failed to fetch logo: ${response.statusText}`);
      }

      const buffer = Buffer.from(await response.arrayBuffer());
      const contentType = response.headers.get('content-type') || '';
      
      // Determine file extension
      let extension = '.png';
      if (contentType.includes('jpeg') || contentType.includes('jpg')) {
        extension = '.jpg';
      } else if (contentType.includes('svg')) {
        extension = '.svg';
      } else if (contentType.includes('gif')) {
        extension = '.gif';
      }

      // Generate safe filename
      const safeProviderName = providerName.toLowerCase()
        .replace(/[^a-z0-9]/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '');
      
      const timestamp = Date.now();
      const filename = `${safeProviderName}-${timestamp}${extension}`;
      const filepath = path.join(this.uploadsDir, filename);

      // Save file
      fs.writeFileSync(filepath, buffer);

      return filename;
    } catch (error) {
      console.error('Error fetching logo from URL:', error);
      throw new Error('Failed to fetch logo from URL');
    }
  }

  // Save uploaded logo file
  saveUploadedLogo(file: Express.Multer.File, providerName: string): string {
    try {
      const extension = path.extname(file.originalname);
      const safeProviderName = providerName.toLowerCase()
        .replace(/[^a-z0-9]/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '');
      
      const timestamp = Date.now();
      const filename = `${safeProviderName}-${timestamp}${extension}`;
      const filepath = path.join(this.uploadsDir, filename);

      // Move uploaded file to logos directory
      fs.renameSync(file.path, filepath);

      return filename;
    } catch (error) {
      console.error('Error saving uploaded logo:', error);
      throw new Error('Failed to save uploaded logo');
    }
  }

  // Delete logo file
  deleteLogo(filename: string): void {
    try {
      const filepath = path.join(this.uploadsDir, filename);
      if (fs.existsSync(filepath)) {
        fs.unlinkSync(filepath);
      }
    } catch (error) {
      console.error('Error deleting logo:', error);
    }
  }

  // Get logo URL for serving
  getLogoUrl(filename: string): string {
    return `/uploads/logos/${filename}`;
  }

  // Validate image file
  isValidImageFile(file: Express.Multer.File): boolean {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/svg+xml', 'image/gif'];
    const maxSize = 5 * 1024 * 1024; // 5MB

    return allowedTypes.includes(file.mimetype) && file.size <= maxSize;
  }

  // Get common provider logo URLs (fallback URLs for well-known providers)
  getCommonProviderLogos(): Record<string, string> {
    return {
      'novomatic': 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3a/Novomatic_logo.svg/200px-Novomatic_logo.svg.png',
      'igt': 'https://www.igt.com/content/dam/igt/images/logos/igt-logo.png',
      'aristocrat': 'https://www.aristocrat.com/content/dam/aristocrat/images/aristocrat-logo.png',
      'scientific games': 'https://www.scientificgames.com/content/dam/scientificgames/images/sg-logo.png',
      'microgaming': 'https://www.microgaming.co.uk/Content/Images/microgaming-logo.png',
      'netent': 'https://www.netent.com/content/dam/netent/images/netent-logo.png',
      'playtech': 'https://www.playtech.com/content/dam/playtech/images/playtech-logo.png',
      'evolution gaming': 'https://www.evolution.com/content/dam/evolution/images/evolution-logo.png',
      'pragmatic play': 'https://www.pragmaticplay.com/content/dam/pragmaticplay/images/pp-logo.png',
      'big time gaming': 'https://www.bigtimegaming.com/content/dam/btg/images/btg-logo.png'
    };
  }

  // Auto-suggest logo for provider name
  getSuggestedLogoUrl(providerName: string): string | null {
    const commonLogos = this.getCommonProviderLogos();
    const normalizedName = providerName.toLowerCase().trim();
    
    for (const [key, url] of Object.entries(commonLogos)) {
      if (normalizedName.includes(key) || key.includes(normalizedName)) {
        return url;
      }
    }
    
    return null;
  }
}

export const logoService = new LogoService();