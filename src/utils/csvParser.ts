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
          'empl id': 'employeeId',
          'employee id': 'employeeId',
          'employee_id': 'employeeId',
          'id': 'employeeId',
          'start date': 'startDate',
          'start_date': 'startDate',
          'startdate': 'startDate',
          'end date': 'endDate',
          'end_date': 'endDate',
          'enddate': 'endDate',
          'timesheet status': 'timesheetStatus',
          'timesheet_status': 'timesheetStatus',
          'status': 'timesheetStatus',
          'schedule hours': 'scheduleHours',
          'schedule_hours': 'scheduleHours',
          'scheduled hours': 'scheduleHours',
          'scheduled_hours': 'scheduleHours',
          'reported hours': 'reportedHours',
          'reported_hours': 'reportedHours',
          'regular hours': 'regularHours',
          'regular_hours': 'regularHours',
          'overtime hours': 'overtimeHours',
          'overtime_hours': 'overtimeHours',
          'holiday hours': 'holidayHours',
          'holiday_hours': 'holidayHours',
          'leave hours': 'leaveHours',
          'leave_hours': 'leaveHours',
          'total hours': 'totalHours',
          'total_hours': 'totalHours'
        };
        
        const normalizedHeader = header.toLowerCase().trim();
        return headerMap[normalizedHeader] || header;
      },
      transform: (value, field) => {
        // Handle numeric fields - keep as strings for parsing, will convert in post-processing
        const fieldStr = String(field);
        if (['scheduleHours', 'reportedHours', 'regularHours', 'overtimeHours', 'holidayHours', 'leaveHours', 'totalHours'].includes(fieldStr)) {
          if (!value || value.trim() === '') {
            return '0';
          }
          const parsed = parseFloat(value);
          return isNaN(parsed) ? '0' : value.trim();
        }
        return value.trim();
      },
      complete: (result) => {
        if (result.errors.length > 0) {
          reject(new Error(`CSV parsing error: ${result.errors[0].message}`));
          return;
        }
        
        // Post-process to convert numeric fields from strings to numbers
        const processedData = (result.data as any[]).map(entry => ({
          ...entry,
          scheduleHours: parseFloat(entry.scheduleHours) || 0,
          reportedHours: parseFloat(entry.reportedHours) || 0,
          regularHours: parseFloat(entry.regularHours) || 0,
          overtimeHours: parseFloat(entry.overtimeHours) || 0,
          holidayHours: parseFloat(entry.holidayHours) || 0,
          leaveHours: parseFloat(entry.leaveHours) || 0,
          totalHours: parseFloat(entry.totalHours) || 0
        }));
        
        resolve(processedData as TimesheetEntry[]);
      },
      error: (error) => {
        reject(error);
      }
    });
  });
};