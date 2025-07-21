import { TimesheetEntry, ValidationError, ValidationResult } from '../types/timesheet';

export const validateTimesheet = (entries: TimesheetEntry[]): ValidationResult => {
  const errors: ValidationError[] = [];
  const warnings: ValidationError[] = [];

  entries.forEach((entry, index) => {
    const row = index + 1;

    // Required field validation
    if (!entry.employeeId) {
      errors.push({
        row,
        field: 'employeeId',
        message: 'Employee ID is required',
        severity: 'error'
      });
    }

    if (!entry.employeeName) {
      errors.push({
        row,
        field: 'employeeName',
        message: 'Employee name is required',
        severity: 'error'
      });
    }

    if (!entry.date) {
      errors.push({
        row,
        field: 'date',
        message: 'Date is required',
        severity: 'error'
      });
    } else {
      // Date format validation
      const date = new Date(entry.date);
      if (isNaN(date.getTime())) {
        errors.push({
          row,
          field: 'date',
          message: 'Invalid date format',
          severity: 'error'
        });
      }
    }

    if (!entry.startTime) {
      errors.push({
        row,
        field: 'startTime',
        message: 'Start time is required',
        severity: 'error'
      });
    }

    if (!entry.endTime) {
      errors.push({
        row,
        field: 'endTime',
        message: 'End time is required',
        severity: 'error'
      });
    }

    if (!entry.project) {
      warnings.push({
        row,
        field: 'project',
        message: 'Project field is empty',
        severity: 'warning'
      });
    }

    // Time validation
    if (entry.startTime && entry.endTime) {
      const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
      
      if (!timeRegex.test(entry.startTime)) {
        errors.push({
          row,
          field: 'startTime',
          message: 'Invalid time format (use HH:MM)',
          severity: 'error'
        });
      }

      if (!timeRegex.test(entry.endTime)) {
        errors.push({
          row,
          field: 'endTime',
          message: 'Invalid time format (use HH:MM)',
          severity: 'error'
        });
      }

      // Calculate hours if times are valid
      if (timeRegex.test(entry.startTime) && timeRegex.test(entry.endTime)) {
        const start = new Date(`1970-01-01T${entry.startTime}:00`);
        const end = new Date(`1970-01-01T${entry.endTime}:00`);
        
        if (end <= start) {
          errors.push({
            row,
            field: 'endTime',
            message: 'End time must be after start time',
            severity: 'error'
          });
        } else {
          const calculatedHours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
          
          // Check if recorded hours match calculated hours
          if (entry.hoursWorked && Math.abs(entry.hoursWorked - calculatedHours) > 0.25) {
            warnings.push({
              row,
              field: 'hoursWorked',
              message: `Hours worked (${entry.hoursWorked}) doesn't match calculated hours (${calculatedHours.toFixed(2)})`,
              severity: 'warning'
            });
          }

          // Check for unreasonable hours
          if (calculatedHours > 16) {
            warnings.push({
              row,
              field: 'hoursWorked',
              message: 'More than 16 hours worked in a day seems unusual',
              severity: 'warning'
            });
          }
        }
      }
    }

    // Hours worked validation
    if (entry.hoursWorked < 0) {
      errors.push({
        row,
        field: 'hoursWorked',
        message: 'Hours worked cannot be negative',
        severity: 'error'
      });
    }
  });

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
};