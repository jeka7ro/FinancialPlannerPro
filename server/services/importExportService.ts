import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { storage } from '../storage';
import type {
  User, Company, Location, Provider, Cabinet, GameMix, Slot,
  Invoice, RentAgreement, LegalDocument, OnjnReport,
  InsertUser, InsertCompany, InsertLocation, InsertProvider,
  InsertCabinet, InsertGameMix, InsertSlot, InsertInvoice,
  InsertRentAgreement, InsertLegalDocument, InsertOnjnReport
} from '@shared/schema';

interface ImportResult {
  success: boolean;
  message: string;
  imported: number;
  errors: string[];
}

export class ImportExportService {
  // Excel Import Functions
  async importUsersFromExcel(buffer: Buffer): Promise<ImportResult> {
    try {
      const workbook = XLSX.read(buffer, { type: 'buffer' });
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const data = XLSX.utils.sheet_to_json(worksheet);

      const errors: string[] = [];
      let imported = 0;

      for (const row of data as any[]) {
        try {
          if (!row.username || !row.password) {
            errors.push(`Row ${imported + 1}: Username and password are required`);
            continue;
          }

          const user: InsertUser = {
            username: row.username,
            email: row.email || null,
            password: row.password, // Will be hashed in storage layer
            firstName: row.firstName || row.first_name || null,
            lastName: row.lastName || row.last_name || null,
            role: row.role || 'operator'
          };

          await storage.createUser(user);
          imported++;
        } catch (error) {
          errors.push(`Row ${imported + 1}: ${error.message}`);
        }
      }

      return {
        success: true,
        message: `Import completed. ${imported} users imported.`,
        imported,
        errors
      };
    } catch (error) {
      return {
        success: false,
        message: `Import failed: ${error.message}`,
        imported: 0,
        errors: [error.message]
      };
    }
  }

  async importCompaniesFromExcel(buffer: Buffer): Promise<ImportResult> {
    try {
      const workbook = XLSX.read(buffer, { type: 'buffer' });
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const data = XLSX.utils.sheet_to_json(worksheet);

      const errors: string[] = [];
      let imported = 0;

      for (const row of data as any[]) {
        try {
          if (!row.name) {
            errors.push(`Row ${imported + 1}: Company name is required`);
            continue;
          }

          const company: InsertCompany = {
            name: row.name,
            registrationNumber: row.registrationNumber || row.registration_number || null,
            taxId: row.taxId || row.tax_id || null,
            address: row.address || null,
            phone: row.phone || null,
            email: row.email || null,
            contactPerson: row.contactPerson || row.contact_person || null,
            status: row.status || 'active'
          };

          await storage.createCompany(company);
          imported++;
        } catch (error) {
          errors.push(`Row ${imported + 1}: ${error.message}`);
        }
      }

      return {
        success: true,
        message: `Import completed. ${imported} companies imported.`,
        imported,
        errors
      };
    } catch (error) {
      return {
        success: false,
        message: `Import failed: ${error.message}`,
        imported: 0,
        errors: [error.message]
      };
    }
  }

  async importLocationsFromExcel(buffer: Buffer): Promise<ImportResult> {
    try {
      const workbook = XLSX.read(buffer, { type: 'buffer' });
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const data = XLSX.utils.sheet_to_json(worksheet);

      const errors: string[] = [];
      let imported = 0;

      for (const row of data as any[]) {
        try {
          if (!row.name || !row.address) {
            errors.push(`Row ${imported + 1}: Name and address are required`);
            continue;
          }

          const location: InsertLocation = {
            name: row.name,
            address: row.address,
            city: row.city || null,
            county: row.county || null,
            postalCode: row.postalCode || row.postal_code || null,
            managerId: row.managerId || row.manager_id || null,
            companyId: row.companyId || row.company_id || null,
            licenseNumber: row.licenseNumber || row.license_number || null,
            status: row.status || 'active'
          };

          await storage.createLocation(location);
          imported++;
        } catch (error) {
          errors.push(`Row ${imported + 1}: ${error.message}`);
        }
      }

      return {
        success: true,
        message: `Import completed. ${imported} locations imported.`,
        imported,
        errors
      };
    } catch (error) {
      return {
        success: false,
        message: `Import failed: ${error.message}`,
        imported: 0,
        errors: [error.message]
      };
    }
  }

  // Excel Export Functions
  async exportUsersToExcel(): Promise<Buffer> {
    const { users } = await storage.getUsers(1, 1000);
    const exportData = users.map(user => ({
      id: user.id,
      username: user.username,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      isActive: user.isActive,
      createdAt: user.createdAt
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Users');
    
    return XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
  }

  async exportCompaniesToExcel(): Promise<Buffer> {
    const { companies } = await storage.getCompanies(1, 1000);
    const exportData = companies.map(company => ({
      id: company.id,
      name: company.name,
      registrationNumber: company.registrationNumber,
      taxId: company.taxId,
      address: company.address,
      phone: company.phone,
      email: company.email,
      contactPerson: company.contactPerson,
      status: company.status,
      createdAt: company.createdAt
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Companies');
    
    return XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
  }

  async exportLocationsToPDF(): Promise<Buffer> {
    const { locations } = await storage.getLocations(1, 1000);
    
    const doc = new jsPDF();
    doc.setFontSize(20);
    doc.text('Locations Report', 20, 20);
    
    const tableData = locations.map(location => [
      location.id.toString(),
      location.name,
      location.address,
      location.city || '',
      location.county || '',
      location.status
    ]);

    (doc as any).autoTable({
      head: [['ID', 'Name', 'Address', 'City', 'County', 'Status']],
      body: tableData,
      startY: 30,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [41, 128, 185] }
    });

    return Buffer.from(doc.output('arraybuffer'));
  }

  async exportCompaniesToPDF(): Promise<Buffer> {
    const { companies } = await storage.getCompanies(1, 1000);
    
    const doc = new jsPDF();
    doc.setFontSize(20);
    doc.text('Companies Report', 20, 20);
    
    const tableData = companies.map(company => [
      company.id.toString(),
      company.name,
      company.registrationNumber || '',
      company.taxId || '',
      company.contactPerson || '',
      company.status
    ]);

    (doc as any).autoTable({
      head: [['ID', 'Name', 'Registration #', 'Tax ID', 'Contact', 'Status']],
      body: tableData,
      startY: 30,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [41, 128, 185] }
    });

    return Buffer.from(doc.output('arraybuffer'));
  }

  // Generic import method for other modules
  async importFromExcel(moduleName: string, buffer: Buffer): Promise<ImportResult> {
    switch (moduleName) {
      case 'users':
        return this.importUsersFromExcel(buffer);
      case 'companies':
        return this.importCompaniesFromExcel(buffer);
      case 'locations':
        return this.importLocationsFromExcel(buffer);
      // Add other modules as needed
      default:
        return {
          success: false,
          message: `Import not supported for module: ${moduleName}`,
          imported: 0,
          errors: [`Module ${moduleName} import not implemented`]
        };
    }
  }

  // Generic export methods
  async exportToExcel(moduleName: string): Promise<Buffer> {
    switch (moduleName) {
      case 'users':
        return this.exportUsersToExcel();
      case 'companies':
        return this.exportCompaniesToExcel();
      // Add other modules as needed
      default:
        throw new Error(`Export not supported for module: ${moduleName}`);
    }
  }

  async exportToPDF(moduleName: string): Promise<Buffer> {
    switch (moduleName) {
      case 'locations':
        return this.exportLocationsToPDF();
      case 'companies':
        return this.exportCompaniesToPDF();
      // Add other modules as needed
      default:
        throw new Error(`PDF export not supported for module: ${moduleName}`);
    }
  }
}

export const importExportService = new ImportExportService();