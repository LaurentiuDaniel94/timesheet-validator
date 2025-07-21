import React, { useState } from 'react';
import { Download, ChevronUp, ChevronDown } from 'lucide-react';
import { TimesheetEntry, ValidationError } from '../types/timesheet';

interface TimesheetTableProps {
  entries: TimesheetEntry[];
  errors: ValidationError[];
  warnings: ValidationError[];
}

export const TimesheetTable: React.FC<TimesheetTableProps> = ({ entries, errors, warnings }) => {
  const [sortField, setSortField] = useState<keyof TimesheetEntry>('date');
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
    const headers = ['Employee ID', 'Employee Name', 'Date', 'Start Time', 'End Time', 'Hours Worked', 'Project', 'Description'];
    const csvContent = [
      headers.join(','),
      ...sortedEntries.map(entry => [
        entry.employeeId,
        `"${entry.employeeName}"`,
        entry.date,
        entry.startTime,
        entry.endTime,
        entry.hoursWorked,
        entry.project,
        `"${entry.description}"`
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
                { key: 'employeeName' as keyof TimesheetEntry, label: 'Employee Name' },
                { key: 'date' as keyof TimesheetEntry, label: 'Date' },
                { key: 'startTime' as keyof TimesheetEntry, label: 'Start Time' },
                { key: 'endTime' as keyof TimesheetEntry, label: 'End Time' },
                { key: 'hoursWorked' as keyof TimesheetEntry, label: 'Hours Worked' },
                { key: 'project' as keyof TimesheetEntry, label: 'Project' },
                { key: 'description' as keyof TimesheetEntry, label: 'Description' }
              ].map(({ key, label }) => (
                <th
                  key={key}
                  className="px-6 py-3 text-left text-xs font-medium text-slate-700 uppercase tracking-wider cursor-pointer hover:bg-slate-100 transition-colors duration-200"
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
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">
                    {entry.employeeId}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700">
                    {entry.employeeName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700">
                    {entry.date}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700">
                    {entry.startTime}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700">
                    {entry.endTime}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700">
                    {entry.hoursWorked}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700">
                    {entry.project}
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-700 max-w-xs truncate">
                    {entry.description}
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