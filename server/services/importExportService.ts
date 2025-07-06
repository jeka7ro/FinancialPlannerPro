import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { storage } from '../storage.js';
import type {
  User, Company, Location, Provider, Cabinet, GameMix, Slot,
  Invoice, RentAgreement, LegalDocument, OnjnReport,
  InsertUser, InsertCompany, InsertLocation, InsertProvider,
  InsertCabinet, InsertGameMix, InsertSlot, InsertInvoice,
  InsertRentAgreement, InsertLegalDocument, InsertOnjnReport
} from '../../shared/schema.js';

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
          errors.push(`Row ${imported + 1}: ${error instanceof Error ? error.message : String(error)}`);
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
        message: `Import failed: ${error instanceof Error ? error.message : String(error)}`,
        imported: 0,
        errors: [error instanceof Error ? error.message : String(error)]
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
          errors.push(`Row ${imported + 1}: ${error instanceof Error ? error.message : String(error)}`);
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
        message: `Import failed: ${error instanceof Error ? error.message : String(error)}`,
        imported: 0,
        errors: [error instanceof Error ? error.message : String(error)]
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
            city: row.city || 'Unknown',
            country: row.country || 'Romania',
            county: row.county || null,
            postalCode: row.postalCode || row.postal_code || null,
            managerId: row.managerId || row.manager_id || null,
            companyId: row.companyId || row.company_id || null,
            status: row.status || 'active'
          };

          await storage.createLocation(location);
          imported++;
        } catch (error) {
          errors.push(`Row ${imported + 1}: ${error instanceof Error ? error.message : String(error)}`);
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
        message: `Import failed: ${error instanceof Error ? error.message : String(error)}`,
        imported: 0,
        errors: [error instanceof Error ? error.message : String(error)]
      };
    }
  }

  async importCabinetsFromExcel(buffer: Buffer): Promise<ImportResult> {
    try {
      const workbook = XLSX.read(buffer, { type: 'buffer' });
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const data = XLSX.utils.sheet_to_json(worksheet);

      const errors: string[] = [];
      let imported = 0;

      for (const [i, row] of (data as any[]).entries()) {
        try {
          if (!row.model) {
            errors.push(`Row ${i + 2}: Model is required`);
            continue;
          }

          const cabinet: InsertCabinet = {
            name: row.name || `Cabinet ${row.serialNumber || row.id}`,
            model: row.model || '',
            serialNumber: row.serialNumber || row.serial_number || null,
            manufacturer: row.manufacturer || null,
            providerId: row.providerId || row.provider_id || null,
            locationId: row.locationId || row.location_id || null,
            status: row.status || 'active',
            webLink: row.webLink || row.web_link || '',
            technicalInfo: row.technicalInfo || row.technical_info || null,
            isActive: typeof row.isActive === 'boolean' ? row.isActive : true,
          };

          await storage.createCabinet(cabinet);
          imported++;
        } catch (error: any) {
          errors.push(`Row ${i + 2}: ${(error as any).message}`);
        }
      }

      return {
        success: true,
        message: `Import completed. ${imported} cabinets imported.`,
        imported,
        errors
      };
    } catch (error: any) {
      return {
        success: false,
        message: `Import failed: ${(error as any).message}`,
        imported: 0,
        errors: [(error as any).message]
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

  async exportGameMixesToExcel(): Promise<Buffer> {
    const { gameMixes } = await storage.getGameMixes(1, 1000);
    const exportData = gameMixes.map(gameMix => ({
      id: gameMix.id,
      name: gameMix.name,
      description: gameMix.description,
      providerId: gameMix.providerId,
      status: gameMix.status,
      createdAt: gameMix.createdAt
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Game Mixes');
    
    return XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
  }

  async exportSlotsToExcel(): Promise<Buffer> {
    const { slots } = await storage.getSlots(1, 1000);
    const exportData = slots.map(slot => ({
      id: slot.id,
      cabinetId: slot.cabinetId,
      gameMixId: slot.gameMixId,
      providerId: slot.providerId,
      exciterType: slot.exciterType,
      denomination: slot.denomination,
      maxBet: slot.maxBet,
      rtp: slot.rtp,
      propertyType: slot.propertyType,
      serialNr: slot.serialNr,
      year: slot.year,
      gamingPlaces: slot.gamingPlaces,
      isActive: slot.isActive,
      createdAt: slot.createdAt
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Slots');
    
    return XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
  }

  async exportProvidersToExcel(): Promise<Buffer> {
    const { providers } = await storage.getProviders(1, 1000);
    const exportData = providers.map(provider => ({
      id: provider.id,
      name: provider.name,
      companyName: provider.companyName,
      contactPerson: provider.contactPerson,
      email: provider.email,
      phone: provider.phone,
      address: provider.address,
      city: provider.city,
      country: provider.country,
      website: provider.website,
      isActive: provider.isActive,
      createdAt: provider.createdAt
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Providers');
    
    return XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
  }

  async exportCabinetsToExcel(): Promise<Buffer> {
    const { cabinets } = await storage.getCabinets(1, 1000);
    const exportData = cabinets.map(cabinet => ({
      id: cabinet.id,
      serialNumber: cabinet.serialNumber,
      model: cabinet.model,
      manufacturer: cabinet.manufacturer,
      providerId: cabinet.providerId,
      locationId: cabinet.locationId,
      status: cabinet.status,
      isActive: cabinet.isActive,
      createdAt: cabinet.createdAt
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Cabinets');
    
    return XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
  }

  async exportLocationsToExcel(): Promise<Buffer> {
    const { locations } = await storage.getLocations(1, 1000);
    const exportData = locations.map(location => ({
      id: location.id,
      name: location.name,
      address: location.address,
      city: location.city,
      country: location.country,
      phone: location.phone,
      email: location.email,
      companyId: location.companyId,
      managerId: location.managerId,
      isActive: location.isActive,
      createdAt: location.createdAt
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Locations');
    
    return XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
  }

  async exportInvoicesToExcel(): Promise<Buffer> {
    const { invoices } = await storage.getInvoices(1, 1000);
    const exportData = invoices.map(invoice => ({
      id: invoice.id,
      invoiceNumber: invoice.invoiceNumber,
      sellerCompany: invoice.sellerCompanyId,
      buyerCompany: null,
      amount: invoice.totalAmount || 0,
      currency: invoice.currency,
      issueDate: invoice.createdAt,
      dueDate: invoice.dueDate,
      status: invoice.status,
      propertyType: invoice.propertyType,
      serialNumbers: invoice.serialNumbers,
      locationIds: invoice.locationIds,
      amortization: invoice.taxAmount,
      notes: invoice.notes,
      createdAt: invoice.createdAt
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Invoices');
    
    return XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
  }

  async exportLegalDocumentsToExcel(): Promise<Buffer> {
    const { legalDocuments } = await storage.getLegalDocuments(1, 1000);
    const exportData = legalDocuments.map(doc => ({
      id: doc.id,
      title: doc.title,
      documentType: doc.documentType,
      issueDate: doc.issueDate,
      expiryDate: doc.expiryDate,
      status: doc.status,
      notes: doc.notes || '',
      createdAt: doc.createdAt
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Legal Documents');
    
    return XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
  }

  async exportOnjnReportsToExcel(): Promise<Buffer> {
    const { onjnReports } = await storage.getOnjnReports(1, 1000);
    const exportData = onjnReports.map(report => ({
      id: report.id,
      commissionDate: report.commissionDate,
      serialNumbers: report.serialNumbers,
      notes: report.notes,
      createdAt: report.createdAt
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'ONJN Reports');
    
    return XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
  }

  async exportRentAgreementsToExcel(): Promise<Buffer> {
    const { rentAgreements } = await storage.getRentAgreements(1, 1000);
    const exportData = rentAgreements.map(agreement => ({
      id: agreement.id,
      agreementNumber: agreement.agreementNumber,
      landlordName: agreement.landlordName || '',
      tenantName: agreement.tenantName || '',
      propertyAddress: agreement.propertyAddress || '',
      monthlyRent: agreement.monthlyRent,
      currency: agreement.currency || 'RON',
      startDate: agreement.startDate,
      endDate: agreement.endDate,
      status: agreement.status,
      notes: agreement.notes || '',
      createdAt: agreement.createdAt
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Rent Agreements');
    
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
      location.status || 'active'
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
      company.status || 'active'
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
  async importFromExcel(module: string, buffer: Buffer): Promise<ImportResult> {
    switch (module) {
      case "companies":
        return this.importCompaniesFromExcel(buffer);
      case "users":
        return this.importUsersFromExcel(buffer);
      case "providers":
        return this.importProvidersFromExcel(buffer);
      case "cabinets":
        return this.importCabinetsFromExcel(buffer);
      case "locations":
        return this.importLocationsFromExcel(buffer);
      // Add other modules as needed
      default:
        return { success: false, message: `Import not supported for module: ${module}`, imported: 0, errors: [] };
    }
  }

  // Generic export methods
  async exportToExcel(moduleName: string): Promise<Buffer> {
    switch (moduleName) {
      case 'users':
        return this.exportUsersToExcel();
      case 'companies':
        return this.exportCompaniesToExcel();
      case 'game-mixes':
        return this.exportGameMixesToExcel();
      case 'slots':
        return this.exportSlotsToExcel();
      case 'providers':
        return this.exportProvidersToExcel();
      case 'cabinets':
        return this.exportCabinetsToExcel();
      case 'locations':
        return this.exportLocationsToExcel();
      case 'invoices':
        return this.exportInvoicesToExcel();
      case 'legal-documents':
        return this.exportLegalDocumentsToExcel();
      case 'onjn-reports':
        return this.exportOnjnReportsToExcel();
      case 'rent-agreements':
        return this.exportRentAgreementsToExcel();
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

  async importProvidersFromExcel(buffer: Buffer): Promise<ImportResult> {
    return this.importUsersFromExcel(buffer); // Temporary fallback
  }
}

export const importExportService = new ImportExportService();