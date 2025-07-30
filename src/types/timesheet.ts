export interface TimesheetEntry {
  employeeId: string;
  startDate: string;
  endDate: string;
  timesheetStatus: string;
  scheduleHours: number;
  reportedHours: number;
  regularHours: number;
  overtimeHours: number;
  holidayHours: number;
  leaveHours: number;
  totalHours: number;
}

export interface ValidationError {
  row: number;
  field: string;
  message: string;
  severity: 'error' | 'warning';
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationError[];
}