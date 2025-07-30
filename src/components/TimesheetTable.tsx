import React, { useState } from 'react';
import { Download, ChevronUp, ChevronDown } from 'lucide-react';
import { TimesheetEntry, ValidationError } from '../types/timesheet';

interface TimesheetTableProps {
  entries: TimesheetEntry[];
  errors: ValidationError[];
  warnings: ValidationError[];
}

export const TimesheetTable: React.FC<TimesheetTableProps> = ({ entries, errors, warnings }) => {
  const [sortField, setSortField] = useState<keyof TimesheetEntry>('startDate');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  const handleSort = (field: keyof TimesheetEntry) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const sortedEntries = [...entries].sort((a, b) => {
    const aValue = a[sortField];
    const bValue = b[sortField];
    
    if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });

  const getRowErrors = (index: number) => {
    return errors.filter(error => error.row === index + 1);
  };

  const getRowWarnings = (index: number) => {
    return warnings.filter(warning => warning.row === index + 1);
  };

  const exportToCSV = () => {
    const headers = [
      'Employee ID', 'Start Date', 'End Date', 'Timesheet Status', 'Schedule Hours', 
      'Reported Hours', 'Regular Hours', 'Overtime Hours', 'Holiday Hours', 'Leave Hours', 'Total Hours'
    ];
    const csvContent = [
      headers.join(','),
      ...sortedEntries.map(entry => [
        entry.employeeId,
        entry.startDate,
        entry.endDate,
        `"${entry.timesheetStatus}"`,
        entry.scheduleHours,
        entry.reportedHours,
        entry.regularHours,
        entry.overtimeHours,
        entry.holidayHours,
        entry.leaveHours,
        entry.totalHours
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'validated-timesheet.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const SortIcon = ({ field }: { field: keyof TimesheetEntry }) => {
    if (sortField !== field) return null;
    return sortDirection === 'asc' ? 
      <ChevronUp className="w-4 h-4 ml-1" /> : 
      <ChevronDown className="w-4 h-4 ml-1" />;
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'Approved':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'Partially Approved':
        return 'bg-teal-100 text-teal-800 border-teal-200';
      case 'Needs Approval':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'Partially Submitted':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Not Submitted':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'Absence/Holiday':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  if (entries.length === 0) {
    return null;
  }

  return (
    <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-xl border border-slate-200/50 overflow-hidden transition-all duration-500 animate-fade-in">
      <div className="bg-gradient-to-r from-cyan-500 to-purple-600 px-6 py-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold text-white">Timesheet Data</h2>
          <button
            onClick={exportToCSV}
            className="flex items-center gap-2 bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg transition-all duration-300 hover:scale-105"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-slate-50">
            <tr>
              {[
                { key: 'employeeId' as keyof TimesheetEntry, label: 'Employee ID' },
                { key: 'startDate' as keyof TimesheetEntry, label: 'Start Date' },
                { key: 'endDate' as keyof TimesheetEntry, label: 'End Date' },
                { key: 'timesheetStatus' as keyof TimesheetEntry, label: 'Status' },
                { key: 'scheduleHours' as keyof TimesheetEntry, label: 'Schedule Hours' },
                { key: 'reportedHours' as keyof TimesheetEntry, label: 'Reported Hours' },
                { key: 'regularHours' as keyof TimesheetEntry, label: 'Regular Hours' },
                { key: 'overtimeHours' as keyof TimesheetEntry, label: 'Overtime Hours' },
                { key: 'holidayHours' as keyof TimesheetEntry, label: 'Holiday Hours' },
                { key: 'leaveHours' as keyof TimesheetEntry, label: 'Leave Hours' },
                { key: 'totalHours' as keyof TimesheetEntry, label: 'Total Hours' }
              ].map(({ key, label }) => (
                <th
                  key={key}
                  className="px-4 py-3 text-left text-xs font-medium text-slate-700 uppercase tracking-wider cursor-pointer hover:bg-slate-100 transition-colors duration-200"
                  onClick={() => handleSort(key)}
                >
                  <div className="flex items-center">
                    {label}
                    <SortIcon field={key} />
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {sortedEntries.map((entry, index) => {
              const rowErrors = getRowErrors(index);
              const rowWarnings = getRowWarnings(index);
              const hasIssues = rowErrors.length > 0 || rowWarnings.length > 0;
              
              return (
                <tr
                  key={index}
                  className={`transition-all duration-300 hover:bg-gradient-to-r hover:from-cyan-50 hover:to-purple-50 ${
                    hasIssues ? 'bg-gradient-to-r from-rose-50 to-amber-50' : ''
                  }`}
                >
                  <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-slate-900">
                    {entry.employeeId}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-slate-700">
                    {entry.startDate}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-slate-700">
                    {entry.endDate}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusBadgeColor(entry.timesheetStatus)}`}>
                      {entry.timesheetStatus}
                    </span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-slate-700 font-medium">
                    {entry.scheduleHours.toFixed(2)}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-slate-700 font-medium">
                    {entry.reportedHours.toFixed(2)}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-slate-700">
                    {entry.regularHours.toFixed(2)}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-slate-700">
                    {entry.overtimeHours.toFixed(2)}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-slate-700">
                    {entry.holidayHours.toFixed(2)}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-slate-700">
                    {entry.leaveHours.toFixed(2)}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-slate-700 font-bold">
                    {entry.totalHours.toFixed(2)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {(errors.length > 0 || warnings.length > 0) && (
        <div className="bg-slate-50 px-6 py-4 border-t border-slate-200">
          <p className="text-sm text-slate-600">
            Rows with issues are highlighted. Check the validation summary above for details.
          </p>
        </div>
      )}
    </div>
  );
};