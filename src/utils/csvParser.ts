import Papa from 'papaparse';
import { TimesheetEntry } from '../types/timesheet';

export const parseCSV = (file: File): Promise<TimesheetEntry[]> => {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (header) => {
        // Normalize headers to match our interface
        const headerMap: Record<string, string> = {
          'employee id': 'employeeId',
          'employee_id': 'employeeId',
          'id': 'employeeId',
          'employee name': 'employeeName',
          'employee_name': 'employeeName',
          'name': 'employeeName',
          'date': 'date',
          'start time': 'startTime',
          'start_time': 'startTime',
          'start': 'startTime',
          'end time': 'endTime',
          'end_time': 'endTime',
          'end': 'endTime',
          'hours worked': 'hoursWorked',
          'hours_worked': 'hoursWorked',
          'hours': 'hoursWorked',
          'project': 'project',
          'description': 'description',
          'notes': 'description'
        };
        
        const normalizedHeader = header.toLowerCase().trim();
        return headerMap[normalizedHeader] || header;
      },
      transform: (value, field) => {
        if (field === 'hoursWorked') {
          const parsed = parseFloat(value);
          return isNaN(parsed) ? 0 : parsed;
        }
        return value.trim();
      },
      complete: (result) => {
        if (result.errors.length > 0) {
          reject(new Error(`CSV parsing error: ${result.errors[0].message}`));
          return;
        }
        resolve(result.data as TimesheetEntry[]);
      },
      error: (error) => {
        reject(error);
      }
    });
  });
};