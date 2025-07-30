import { TimesheetEntry, ValidationError, ValidationResult } from '../types/timesheet';

export const validateTimesheet = (entries: TimesheetEntry[]): ValidationResult => {
  const errors: ValidationError[] = [];
  const warnings: ValidationError[] = [];

  const validStatuses = [
    'Approved', 'Partially Submitted', 'Needs Approval', 'Not Submitted', 
    'Absence/Holiday', 'Partially Approved'
  ];

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

    if (!entry.startDate) {
      errors.push({
        row,
        field: 'startDate',
        message: 'Start date is required',
        severity: 'error'
      });
    }

    if (!entry.endDate) {
      errors.push({
        row,
        field: 'endDate',
        message: 'End date is required',
        severity: 'error'
      });
    }

    if (!entry.timesheetStatus) {
      errors.push({
        row,
        field: 'timesheetStatus',
        message: 'Timesheet status is required',
        severity: 'error'
      });
    } else if (!validStatuses.includes(entry.timesheetStatus)) {
      warnings.push({
        row,
        field: 'timesheetStatus',
        message: `Unknown status "${entry.timesheetStatus}". Expected: ${validStatuses.join(', ')}`,
        severity: 'warning'
      });
    }

    // Date format and range validation
    if (entry.startDate && entry.endDate) {
      const startDate = new Date(entry.startDate);
      const endDate = new Date(entry.endDate);
      
      if (isNaN(startDate.getTime())) {
        errors.push({
          row,
          field: 'startDate',
          message: 'Invalid start date format',
          severity: 'error'
        });
      }

      if (isNaN(endDate.getTime())) {
        errors.push({
          row,
          field: 'endDate',
          message: 'Invalid end date format',
          severity: 'error'
        });
      }

      // Check if end date is after start date
      if (!isNaN(startDate.getTime()) && !isNaN(endDate.getTime())) {
        if (endDate <= startDate) {
          errors.push({
            row,
            field: 'endDate',
            message: 'End date must be after start date',
            severity: 'error'
          });
        }

        // Check for reasonable date ranges (warn if period > 14 days)
        const daysDiff = (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24);
        if (daysDiff > 14) {
          warnings.push({
            row,
            field: 'endDate',
            message: `Long period (${Math.round(daysDiff)} days). Typical periods are 7-14 days`,
            severity: 'warning'
          });
        }
      }
    }

    // Schedule hours validation
    if (entry.scheduleHours < 0) {
      errors.push({
        row,
        field: 'scheduleHours',
        message: 'Schedule hours cannot be negative',
        severity: 'error'
      });
    }

    if (entry.scheduleHours > 80) {
      warnings.push({
        row,
        field: 'scheduleHours',
        message: 'Schedule hours over 80 seems unusually high for a period',
        severity: 'warning'
      });
    }

    // Hours validation (negative checks)
    const hourFields = [
      { field: 'reportedHours', value: entry.reportedHours },
      { field: 'regularHours', value: entry.regularHours },
      { field: 'overtimeHours', value: entry.overtimeHours },
      { field: 'holidayHours', value: entry.holidayHours },
      { field: 'leaveHours', value: entry.leaveHours },
      { field: 'totalHours', value: entry.totalHours }
    ];

    hourFields.forEach(({ field, value }) => {
      if (value < 0) {
        errors.push({
          row,
          field,
          message: `${field} cannot be negative`,
          severity: 'error'
        });
      }
    });

    // VALIDATION 1: Total Hours = Regular + Overtime + Holiday + Leave
    const calculatedTotal = entry.regularHours + entry.overtimeHours + entry.holidayHours + entry.leaveHours;
    if (entry.totalHours > 0) {
      const totalDiff = Math.abs(entry.totalHours - calculatedTotal);
      if (totalDiff > 0.01) { // Allow for minor rounding differences
        errors.push({
          row,
          field: 'totalHours',
          message: `Total hours (${entry.totalHours}) doesn't match calculated total (${calculatedTotal.toFixed(2)})`,
          severity: 'error'
        });
      }
    }

    // VALIDATION 2: Reported Hours ≤ Schedule Hours (with tolerance for submitted timesheets)
    if (entry.reportedHours > entry.scheduleHours) {
      const isSubmitted = ['Approved', 'Partially Approved', 'Partially Submitted'].includes(entry.timesheetStatus);
      if (isSubmitted) {
        warnings.push({
          row,
          field: 'reportedHours',
          message: `Reported hours (${entry.reportedHours}) exceed schedule hours (${entry.scheduleHours})`,
          severity: 'warning'
        });
      } else {
        errors.push({
          row,
          field: 'reportedHours',
          message: `Reported hours (${entry.reportedHours}) cannot exceed schedule hours (${entry.scheduleHours})`,
          severity: 'error'
        });
      }
    }

    // VALIDATION 3: Status-specific validations
    const hasHours = entry.reportedHours > 0 || entry.regularHours > 0 || entry.overtimeHours > 0 || entry.holidayHours > 0 || entry.leaveHours > 0;
    
    switch (entry.timesheetStatus) {
      case 'Approved':
      case 'Partially Approved':
        if (!hasHours) {
          warnings.push({
            row,
            field: 'timesheetStatus',
            message: 'Approved timesheet should have hours recorded',
            severity: 'warning'
          });
        }
        break;
        
      case 'Not Submitted':
        if (hasHours) {
          warnings.push({
            row,
            field: 'timesheetStatus',
            message: 'Not submitted timesheet has hours recorded - status may be incorrect',
            severity: 'warning'
          });
        }
        break;

      case 'Absence/Holiday':
        if (entry.regularHours > 0 || entry.overtimeHours > 0) {
          warnings.push({
            row,
            field: 'timesheetStatus',
            message: 'Absence/Holiday status should not have regular or overtime hours',
            severity: 'warning'
          });
        }
        break;

      case 'Needs Approval':
      case 'Partially Submitted':
        if (!hasHours) {
          warnings.push({
            row,
            field: 'timesheetStatus',
            message: 'Submitted timesheet should have hours recorded',
            severity: 'warning'
          });
        }
        break;
    }

    // VALIDATION 4: Additional date range validations
    if (entry.startDate && entry.endDate) {
      const startDate = new Date(entry.startDate);
      const endDate = new Date(entry.endDate);
      const currentDate = new Date();
      
      if (!isNaN(startDate.getTime()) && !isNaN(endDate.getTime())) {
        // Warn about future dates
        if (startDate > currentDate) {
          warnings.push({
            row,
            field: 'startDate',
            message: 'Start date is in the future',
            severity: 'warning'
          });
        }

        // Warn about very old dates (more than 1 year ago)
        const yearAgo = new Date();
        yearAgo.setFullYear(currentDate.getFullYear() - 1);
        if (endDate < yearAgo) {
          warnings.push({
            row,
            field: 'endDate',
            message: 'End date is more than 1 year ago',
            severity: 'warning'
          });
        }
      }
    }

    // Additional consistency checks
    if (entry.reportedHours > 0 && calculatedTotal === 0) {
      warnings.push({
        row,
        field: 'reportedHours',
        message: 'Reported hours exist but no breakdown provided (regular, overtime, holiday, leave)',
        severity: 'warning'
      });
    }

    if (entry.reportedHours === 0 && calculatedTotal > 0) {
      warnings.push({
        row,
        field: 'reportedHours',
        message: 'Hour breakdown provided but reported hours is zero',
        severity: 'warning'
      });
    }
  });

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
};