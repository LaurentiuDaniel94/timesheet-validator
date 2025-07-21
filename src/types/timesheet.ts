export interface TimesheetEntry {
  employeeId: string;
  employeeName: string;
  date: string;
  startTime: string;
  endTime: string;
  hoursWorked: number;
  project: string;
  description?: string;
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