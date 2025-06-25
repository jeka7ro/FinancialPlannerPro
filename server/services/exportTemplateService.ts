import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

export class ExportTemplateService {
  // Generate template with sample data and field descriptions
  generateUsersTemplate(): Buffer {
    const templateData = [
      {
        username: 'john_doe',
        email: 'john@example.com',
        password: 'password123',
        firstName: 'John',
        lastName: 'Doe',
        role: 'operator'
      },
      {
        username: 'jane_manager',
        email: 'jane@example.com',
        password: 'secure456',
        firstName: 'Jane',
        lastName: 'Smith',
        role: 'manager'
      }
    ];

    const instructionsData = [
      { Field: 'username', Required: 'YES', Type: 'text', Description: 'Unique username for login', Example: 'john_doe' },
      { Field: 'email', Required: 'NO', Type: 'email', Description: 'User email address', Example: 'john@example.com' },
      { Field: 'password', Required: 'YES', Type: 'text', Description: 'User password (will be encrypted)', Example: 'password123' },
      { Field: 'firstName', Required: 'NO', Type: 'text', Description: 'User first name', Example: 'John' },
      { Field: 'lastName', Required: 'NO', Type: 'text', Description: 'User last name', Example: 'Doe' },
      { Field: 'role', Required: 'NO', Type: 'text', Description: 'User role: admin, manager, operator, viewer', Example: 'operator' }
    ];

    const workbook = XLSX.utils.book_new();
    
    // Add sample data sheet
    const dataSheet = XLSX.utils.json_to_sheet(templateData);
    XLSX.utils.book_append_sheet(workbook, dataSheet, 'Sample Data');
    
    // Add instructions sheet
    const instructionsSheet = XLSX.utils.json_to_sheet(instructionsData);
    XLSX.utils.book_append_sheet(workbook, instructionsSheet, 'Field Descriptions');
    
    return XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
  }

  generateCompaniesTemplate(): Buffer {
    const templateData = [
      {
        name: 'Gaming Solutions SRL',
        registrationNumber: 'J40/12345/2023',
        taxId: 'RO12345678',
        address: 'Str. Victoriei 1, Bucuresti',
        phone: '+40721234567',
        email: 'contact@gamingsolutions.ro',
        contactPerson: 'Ion Popescu',
        status: 'active'
      },
      {
        name: 'Lucky Casino Ltd',
        registrationNumber: 'J40/67890/2023',
        taxId: 'RO87654321',
        address: 'Bd. Magheru 15, Bucuresti',
        phone: '+40721987654',
        email: 'info@luckycasino.ro',
        contactPerson: 'Maria Ionescu',
        status: 'active'
      }
    ];

    const instructionsData = [
      { Field: 'name', Required: 'YES', Type: 'text', Description: 'Company name', Example: 'Gaming Solutions SRL' },
      { Field: 'registrationNumber', Required: 'NO', Type: 'text', Description: 'Company registration number', Example: 'J40/12345/2023' },
      { Field: 'taxId', Required: 'NO', Type: 'text', Description: 'Tax identification number', Example: 'RO12345678' },
      { Field: 'address', Required: 'NO', Type: 'text', Description: 'Company address', Example: 'Str. Victoriei 1, Bucuresti' },
      { Field: 'phone', Required: 'NO', Type: 'text', Description: 'Contact phone number', Example: '+40721234567' },
      { Field: 'email', Required: 'NO', Type: 'email', Description: 'Company email address', Example: 'contact@gamingsolutions.ro' },
      { Field: 'contactPerson', Required: 'NO', Type: 'text', Description: 'Primary contact person', Example: 'Ion Popescu' },
      { Field: 'status', Required: 'NO', Type: 'text', Description: 'Company status: active, inactive, suspended', Example: 'active' }
    ];

    const workbook = XLSX.utils.book_new();
    const dataSheet = XLSX.utils.json_to_sheet(templateData);
    const instructionsSheet = XLSX.utils.json_to_sheet(instructionsData);
    
    XLSX.utils.book_append_sheet(workbook, dataSheet, 'Sample Data');
    XLSX.utils.book_append_sheet(workbook, instructionsSheet, 'Field Descriptions');
    
    return XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
  }

  generateLocationsTemplate(): Buffer {
    const templateData = [
      {
        name: 'Casino Central',
        address: 'Calea Victoriei 120, Bucuresti',
        city: 'Bucuresti',
        county: 'Bucuresti',
        postalCode: '010061',
        managerId: 1,
        companyId: 1,
        licenseNumber: 'LIC-001-2023',
        status: 'active'
      },
      {
        name: 'Lucky Slots Constanta',
        address: 'Bd. Mamaia 100, Constanta',
        city: 'Constanta',
        county: 'Constanta',
        postalCode: '900001',
        managerId: 2,
        companyId: 1,
        licenseNumber: 'LIC-002-2023',
        status: 'active'
      }
    ];

    const instructionsData = [
      { Field: 'name', Required: 'YES', Type: 'text', Description: 'Location name', Example: 'Casino Central' },
      { Field: 'address', Required: 'YES', Type: 'text', Description: 'Full address', Example: 'Calea Victoriei 120, Bucuresti' },
      { Field: 'city', Required: 'NO', Type: 'text', Description: 'City name', Example: 'Bucuresti' },
      { Field: 'county', Required: 'NO', Type: 'text', Description: 'County/State', Example: 'Bucuresti' },
      { Field: 'postalCode', Required: 'NO', Type: 'text', Description: 'Postal/ZIP code', Example: '010061' },
      { Field: 'managerId', Required: 'NO', Type: 'number', Description: 'User ID of location manager', Example: '1' },
      { Field: 'companyId', Required: 'NO', Type: 'number', Description: 'ID of owning company', Example: '1' },
      { Field: 'licenseNumber', Required: 'NO', Type: 'text', Description: 'Gaming license number', Example: 'LIC-001-2023' },
      { Field: 'status', Required: 'NO', Type: 'text', Description: 'Location status: active, inactive, maintenance', Example: 'active' }
    ];

    const workbook = XLSX.utils.book_new();
    const dataSheet = XLSX.utils.json_to_sheet(templateData);
    const instructionsSheet = XLSX.utils.json_to_sheet(instructionsData);
    
    XLSX.utils.book_append_sheet(workbook, dataSheet, 'Sample Data');
    XLSX.utils.book_append_sheet(workbook, instructionsSheet, 'Field Descriptions');
    
    return XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
  }

  generateProvidersTemplate(): Buffer {
    const templateData = [
      {
        name: 'Novomatic',
        type: 'both',
        contactInfo: 'contact@novomatic.com, +43 2252 606 0',
        contractDetails: 'Hardware and software provider, 5-year contract',
        status: 'active'
      },
      {
        name: 'IGT',
        type: 'software',
        contactInfo: 'support@igt.com, +1-866-544-7866',
        contractDetails: 'Software platform provider, annual license',
        status: 'active'
      }
    ];

    const instructionsData = [
      { Field: 'name', Required: 'YES', Type: 'text', Description: 'Provider company name', Example: 'Novomatic' },
      { Field: 'type', Required: 'NO', Type: 'text', Description: 'Provider type: software, hardware, both', Example: 'both' },
      { Field: 'contactInfo', Required: 'NO', Type: 'text', Description: 'Contact information', Example: 'contact@novomatic.com, +43 2252 606 0' },
      { Field: 'contractDetails', Required: 'NO', Type: 'text', Description: 'Contract terms and details', Example: 'Hardware and software provider, 5-year contract' },
      { Field: 'status', Required: 'NO', Type: 'text', Description: 'Provider status: active, inactive', Example: 'active' }
    ];

    const workbook = XLSX.utils.book_new();
    const dataSheet = XLSX.utils.json_to_sheet(templateData);
    const instructionsSheet = XLSX.utils.json_to_sheet(instructionsData);
    
    XLSX.utils.book_append_sheet(workbook, dataSheet, 'Sample Data');
    XLSX.utils.book_append_sheet(workbook, instructionsSheet, 'Field Descriptions');
    
    return XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
  }

  generateCabinetsTemplate(): Buffer {
    const templateData = [
      {
        serialNumber: 'CAB-001-2023',
        model: 'Novomatic V.I.P. III',
        manufacturer: 'Novomatic',
        locationId: 1,
        providerId: 1,
        installationDate: '2023-01-15',
        lastMaintenance: '2023-12-01',
        status: 'active'
      },
      {
        serialNumber: 'CAB-002-2023',
        model: 'IGT S3000',
        manufacturer: 'IGT',
        locationId: 1,
        providerId: 2,
        installationDate: '2023-02-20',
        lastMaintenance: '2023-11-15',
        status: 'active'
      }
    ];

    const instructionsData = [
      { Field: 'serialNumber', Required: 'YES', Type: 'text', Description: 'Unique cabinet serial number', Example: 'CAB-001-2023' },
      { Field: 'model', Required: 'NO', Type: 'text', Description: 'Cabinet model name', Example: 'Novomatic V.I.P. III' },
      { Field: 'manufacturer', Required: 'NO', Type: 'text', Description: 'Cabinet manufacturer', Example: 'Novomatic' },
      { Field: 'locationId', Required: 'NO', Type: 'number', Description: 'ID of location where cabinet is installed', Example: '1' },
      { Field: 'providerId', Required: 'NO', Type: 'number', Description: 'ID of provider company', Example: '1' },
      { Field: 'installationDate', Required: 'NO', Type: 'date', Description: 'Installation date (YYYY-MM-DD)', Example: '2023-01-15' },
      { Field: 'lastMaintenance', Required: 'NO', Type: 'date', Description: 'Last maintenance date (YYYY-MM-DD)', Example: '2023-12-01' },
      { Field: 'status', Required: 'NO', Type: 'text', Description: 'Cabinet status: active, inactive, maintenance, broken', Example: 'active' }
    ];

    const workbook = XLSX.utils.book_new();
    const dataSheet = XLSX.utils.json_to_sheet(templateData);
    const instructionsSheet = XLSX.utils.json_to_sheet(instructionsData);
    
    XLSX.utils.book_append_sheet(workbook, dataSheet, 'Sample Data');
    XLSX.utils.book_append_sheet(workbook, instructionsSheet, 'Field Descriptions');
    
    return XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
  }

  // Generate comprehensive PDF tutorial
  generateImportTutorialPDF(): Buffer {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });
    
    // Title
    doc.setFontSize(20);
    doc.text('CASHPOT - Data Import Tutorial', 20, 20);
    
    // Introduction
    doc.setFontSize(12);
    doc.text('This guide explains how to import data into each module of the gaming management system.', 20, 40);
    
    let yPos = 60;
    
    // General Instructions
    doc.setFontSize(16);
    doc.text('General Import Instructions:', 20, yPos);
    yPos += 20;
    
    doc.setFontSize(10);
    const generalInstructions = [
      '1. Download the Excel template for the module you want to import',
      '2. Fill in your data following the sample format provided',
      '3. Use the "Field Descriptions" sheet to understand each field',
      '4. Save your file as .xlsx, .xls, or .csv format',
      '5. Use the Import/Export button in the module to upload your file',
      '6. Review any error messages and correct data as needed'
    ];
    
    generalInstructions.forEach(instruction => {
      doc.text(instruction, 25, yPos);
      yPos += 15;
    });
    
    yPos += 10;
    
    // Module-specific guidelines
    const modules = [
      {
        name: 'Users',
        tips: [
          '• Username must be unique across the system',
          '• Password will be automatically encrypted',
          '• Role options: admin, manager, operator, viewer',
          '• Email should be unique if provided'
        ]
      },
      {
        name: 'Companies',
        tips: [
          '• Company name is required',
          '• Registration number should be unique',
          '• Status options: active, inactive, suspended',
          '• All other fields are optional but recommended'
        ]
      },
      {
        name: 'Locations',
        tips: [
          '• Name and address are required fields',
          '• Manager ID should reference an existing user',
          '• Company ID should reference an existing company',
          '• Status options: active, inactive, maintenance'
        ]
      }
    ];
    
    modules.forEach(module => {
      if (yPos > 250) {
        doc.addPage();
        yPos = 20;
      }
      
      doc.setFontSize(14);
      doc.text(`${module.name} Module:`, 20, yPos);
      yPos += 20;
      
      doc.setFontSize(10);
      module.tips.forEach(tip => {
        doc.text(tip, 25, yPos);
        yPos += 12;
      });
      yPos += 10;
    });
    
    // Data validation rules
    if (yPos > 200) {
      doc.addPage();
      yPos = 20;
    }
    
    doc.setFontSize(16);
    doc.text('Data Validation Rules:', 20, yPos);
    yPos += 20;
    
    doc.setFontSize(10);
    const validationRules = [
      '• Required fields must not be empty',
      '• Email fields must contain valid email addresses',
      '• Date fields must use YYYY-MM-DD format',
      '• Number fields must contain valid integers',
      '• Status fields must use predefined values only',
      '• Foreign key references must exist in the system'
    ];
    
    validationRules.forEach(rule => {
      doc.text(rule, 25, yPos);
      yPos += 15;
    });
    
    return Buffer.from(doc.output('arraybuffer'));
  }

  // Get template for specific module
  getTemplate(moduleName: string): Buffer {
    switch (moduleName) {
      case 'users':
        return this.generateUsersTemplate();
      case 'companies':
        return this.generateCompaniesTemplate();
      case 'locations':
        return this.generateLocationsTemplate();
      case 'providers':
        return this.generateProvidersTemplate();
      case 'cabinets':
        return this.generateCabinetsTemplate();
      default:
        // Generate basic template for other modules
        const basicData = [{ message: `Template for ${moduleName} coming soon` }];
        const worksheet = XLSX.utils.json_to_sheet(basicData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Template');
        return XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
    }
  }
}

export const exportTemplateService = new ExportTemplateService();