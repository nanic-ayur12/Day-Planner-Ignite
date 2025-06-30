import * as XLSX from 'xlsx';

export interface StudentTemplateRow {
  name: string;
  rollNumber: string;
  brigadeName: string;
  password: string;
}

export interface AdminTemplateRow {
  name: string;
  email: string;
  password: string;
}

export const generateStudentTemplate = (): void => {
  const templateData: StudentTemplateRow[] = [
    {
      name: 'John Doe',
      rollNumber: 'CS2021001',
      brigadeName: 'Alpha Brigade',
      password: 'student123'
    },
    {
      name: 'Jane Smith',
      rollNumber: 'CS2021002',
      brigadeName: 'Beta Brigade',
      password: 'student123'
    },
    {
      name: 'Mike Johnson',
      rollNumber: 'CS2021003',
      brigadeName: 'Gamma Brigade',
      password: 'student123'
    }
  ];

  const worksheet = XLSX.utils.json_to_sheet(templateData);
  const workbook = XLSX.utils.book_new();
  
  // Set column widths
  worksheet['!cols'] = [
    { width: 20 }, // name
    { width: 15 }, // rollNumber
    { width: 20 }, // brigadeName
    { width: 15 }  // password
  ];

  // Add header styling
  const headerStyle = {
    font: { bold: true, color: { rgb: "FFFFFF" } },
    fill: { fgColor: { rgb: "4F46E5" } },
    alignment: { horizontal: "center" }
  };

  ['A1', 'B1', 'C1', 'D1'].forEach(cell => {
    if (worksheet[cell]) {
      worksheet[cell].s = headerStyle;
    }
  });

  XLSX.utils.book_append_sheet(workbook, worksheet, 'Students');
  XLSX.writeFile(workbook, 'student_upload_template.xlsx');
};

export const generateAdminTemplate = (): void => {
  const templateData: AdminTemplateRow[] = [
    {
      name: 'Admin User',
      email: 'admin@example.com',
      password: 'admin123'
    },
    {
      name: 'Super Admin',
      email: 'superadmin@example.com',
      password: 'admin123'
    }
  ];

  const worksheet = XLSX.utils.json_to_sheet(templateData);
  const workbook = XLSX.utils.book_new();
  
  // Set column widths
  worksheet['!cols'] = [
    { width: 20 }, // name
    { width: 25 }, // email
    { width: 15 }  // password
  ];

  // Add header styling
  const headerStyle = {
    font: { bold: true, color: { rgb: "FFFFFF" } },
    fill: { fgColor: { rgb: "4F46E5" } },
    alignment: { horizontal: "center" }
  };

  ['A1', 'B1', 'C1'].forEach(cell => {
    if (worksheet[cell]) {
      worksheet[cell].s = headerStyle;
    }
  });

  XLSX.utils.book_append_sheet(workbook, worksheet, 'Admins');
  XLSX.writeFile(workbook, 'admin_upload_template.xlsx');
};

export const parseStudentExcel = (file: File): Promise<StudentTemplateRow[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet) as StudentTemplateRow[];
        resolve(jsonData);
      } catch (error) {
        reject(error);
      }
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsArrayBuffer(file);
  });
};

export const parseAdminExcel = (file: File): Promise<AdminTemplateRow[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet) as AdminTemplateRow[];
        resolve(jsonData);
      } catch (error) {
        reject(error);
      }
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsArrayBuffer(file);
  });
};