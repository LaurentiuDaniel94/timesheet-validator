import React, { useState } from 'react';
import { CheckSquare, Square, Download, RefreshCw, Settings, AlertTriangle, CheckCircle } from 'lucide-react';
import { TimesheetEntry, ValidationError } from '../types/timesheet';

interface BulkOperationsProps {
  entries: TimesheetEntry[];
  errors: ValidationError[];
  warnings: ValidationError[];
  onStatusUpdate?: (selectedIds: string[], newStatus: string) => void;
}

export const BulkOperations: React.FC<BulkOperationsProps> = ({ 
  entries, 
  errors, 
  warnings, 
  onStatusUpdate 
}) => {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isExpanded, setIsExpanded] = useState(false);
  const [bulkStatus, setBulkStatus] = useState('');
  const [showConfirmation, setShowConfirmation] = useState(false);

  const allIds = entries.map((entry, index) => `${entry.employeeId}-${index}`);
  const isAllSelected = selectedIds.size > 0 && selectedIds.size === entries.length;
  const isSomeSelected = selectedIds.size > 0 && selectedIds.size < entries.length;

  const toggleSelectAll = () => {
    if (isAllSelected) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(allIds));
    }
  };

  const toggleSelectEntry = (id: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  const getSelectedEntries = () => {
    return entries.filter((_, index) => selectedIds.has(`${entries[index].employeeId}-${index}`));
  };

  const exportSelected = (format: 'csv' | 'json') => {
    const selectedEntries = getSelectedEntries();
    
    if (format === 'csv') {
      const headers = [
        'Employee ID', 'Start Date', 'End Date', 'Timesheet Status', 'Schedule Hours',
        'Reported Hours', 'Regular Hours', 'Overtime Hours', 'Holiday Hours', 'Leave Hours', 'Total Hours'
      ];
      const csvContent = [
        headers.join(','),
        ...selectedEntries.map(entry => [
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
      downloadFile(blob, `selected-timesheets-${new Date().toISOString().split('T')[0]}.csv`);
    } else {
      const jsonContent = JSON.stringify(selectedEntries, null, 2);
      const blob = new Blob([jsonContent], { type: 'application/json' });
      downloadFile(blob, `selected-timesheets-${new Date().toISOString().split('T')[0]}.json`);
    }
  };

  const downloadFile = (blob: Blob, filename: string) => {
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const handleBulkStatusUpdate = () => {
    if (bulkStatus && selectedIds.size > 0 && onStatusUpdate) {
      const ids = Array.from(selectedIds);
      onStatusUpdate(ids, bulkStatus);
      setSelectedIds(new Set());
      setBulkStatus('');
      setShowConfirmation(false);
    }
  };

  const getSelectionStats = () => {
    const selected = getSelectedEntries();
    const totalHours = selected.reduce((sum, entry) => sum + entry.totalHours, 0);
    const avgHours = totalHours / Math.max(selected.length, 1);
    const statusCounts = selected.reduce((acc, entry) => {
      acc[entry.timesheetStatus] = (acc[entry.timesheetStatus] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return { totalHours, avgHours, statusCounts, count: selected.length };
  };

  const stats = getSelectionStats();
  const availableStatuses = [
    'Approved', 'Partially Approved', 'Needs Approval', 
    'Partially Submitted', 'Not Submitted', 'Absence/Holiday'
  ];

  // Get entries with errors or warnings in selection
  const selectedWithIssues = getSelectedEntries().filter((entry, originalIndex) => {
    const actualIndex = entries.findIndex(e => e === entry);
    return errors.some(error => error.row === actualIndex + 1) || 
           warnings.some(warning => warning.row === actualIndex + 1);
  });

  if (entries.length === 0) {
    return null;
  }

  return (
    <div className="bg-white rounded-xl shadow-lg border border-slate-200/50 overflow-hidden transition-all duration-300">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-50 to-purple-50 px-6 py-4 border-b border-slate-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <button
              onClick={toggleSelectAll}
              className="flex items-center space-x-2 p-2 rounded-lg hover:bg-purple-100 transition-colors duration-200"
            >
              {isAllSelected ? (
                <CheckSquare className="h-5 w-5 text-purple-600" />
              ) : isSomeSelected ? (
                <div className="h-5 w-5 bg-purple-600 rounded border-2 border-purple-600 flex items-center justify-center">
                  <div className="h-2 w-2 bg-white rounded-sm"></div>
                </div>
              ) : (
                <Square className="h-5 w-5 text-slate-400" />
              )}
            </button>
            <h3 className="text-lg font-semibold text-slate-800">Bulk Operations</h3>
            {selectedIds.size > 0 && (
              <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded-full text-xs font-medium">
                {selectedIds.size} selected
              </span>
            )}
          </div>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-slate-600 hover:text-slate-800 px-3 py-1 rounded-lg hover:bg-slate-100 transition-colors duration-200 text-sm font-medium"
          >
            {isExpanded ? 'Collapse' : 'Expand'}
          </button>
        </div>
      </div>

      {/* Selection Controls */}
      <div className="p-4 border-b border-slate-100">
        <div className="flex flex-wrap gap-2">
          {entries.map((entry, index) => {
            const entryId = `${entry.employeeId}-${index}`;
            const hasIssues = errors.some(error => error.row === index + 1) || 
                             warnings.some(warning => warning.row === index + 1);
            
            return (
              <button
                key={entryId}
                onClick={() => toggleSelectEntry(entryId)}
                className={`flex items-center space-x-2 px-3 py-1 rounded-lg text-sm transition-all duration-200 ${
                  selectedIds.has(entryId)
                    ? 'bg-purple-100 text-purple-800 border border-purple-200'
                    : hasIssues
                    ? 'bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100'
                    : 'bg-slate-50 text-slate-700 border border-slate-200 hover:bg-slate-100'
                }`}
              >
                {selectedIds.has(entryId) ? (
                  <CheckSquare className="h-3 w-3" />
                ) : (
                  <Square className="h-3 w-3" />
                )}
                <span>Emp {entry.employeeId}</span>
                {hasIssues && <AlertTriangle className="h-3 w-3" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Expanded Operations */}
      {isExpanded && selectedIds.size > 0 && (
        <div className="p-6 space-y-6 animate-fade-in">
          {/* Selection Statistics */}
          <div className="bg-gradient-to-r from-purple-50 to-cyan-50 rounded-lg p-4">
            <h4 className="font-semibold text-slate-800 mb-3">Selection Summary</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <p className="text-slate-600">Entries</p>
                <p className="font-semibold text-slate-800">{stats.count}</p>
              </div>
              <div>
                <p className="text-slate-600">Total Hours</p>
                <p className="font-semibold text-slate-800">{stats.totalHours.toFixed(1)}</p>
              </div>
              <div>
                <p className="text-slate-600">Average Hours</p>
                <p className="font-semibold text-slate-800">{stats.avgHours.toFixed(1)}</p>
              </div>
              <div>
                <p className="text-slate-600">With Issues</p>
                <p className="font-semibold text-slate-800">{selectedWithIssues.length}</p>
              </div>
            </div>
            
            {Object.keys(stats.statusCounts).length > 0 && (
              <div className="mt-3">
                <p className="text-slate-600 text-sm mb-2">Status Breakdown:</p>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(stats.statusCounts).map(([status, count]) => (
                    <span key={status} className="px-2 py-1 bg-white rounded text-xs">
                      {status}: {count}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Export Actions */}
            <div>
              <h4 className="font-semibold text-slate-800 mb-3 flex items-center">
                <Download className="h-4 w-4 mr-2 text-cyan-600" />
                Export Selected
              </h4>
              <div className="space-y-2">
                <button
                  onClick={() => exportSelected('csv')}
                  className="w-full px-4 py-2 bg-cyan-50 text-cyan-700 rounded-lg hover:bg-cyan-100 transition-colors duration-200 text-sm flex items-center justify-center space-x-2"
                >
                  <Download className="h-4 w-4" />
                  <span>Export as CSV</span>
                </button>
                <button
                  onClick={() => exportSelected('json')}
                  className="w-full px-4 py-2 bg-slate-50 text-slate-700 rounded-lg hover:bg-slate-100 transition-colors duration-200 text-sm flex items-center justify-center space-x-2"
                >
                  <Download className="h-4 w-4" />
                  <span>Export as JSON</span>
                </button>
              </div>
            </div>

            {/* Status Update Actions */}
            <div>
              <h4 className="font-semibold text-slate-800 mb-3 flex items-center">
                <Settings className="h-4 w-4 mr-2 text-purple-600" />
                Bulk Status Update
              </h4>
              <div className="space-y-2">
                <select
                  value={bulkStatus}
                  onChange={(e) => setBulkStatus(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 text-sm"
                >
                  <option value="">Select new status...</option>
                  {availableStatuses.map(status => (
                    <option key={status} value={status}>{status}</option>
                  ))}
                </select>
                <button
                  onClick={() => setShowConfirmation(true)}
                  disabled={!bulkStatus}
                  className="w-full px-4 py-2 bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100 disabled:bg-slate-50 disabled:text-slate-400 transition-colors duration-200 text-sm flex items-center justify-center space-x-2"
                >
                  <RefreshCw className="h-4 w-4" />
                  <span>Update Status</span>
                </button>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div>
            <h4 className="font-semibold text-slate-800 mb-3">Quick Actions</h4>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => {
                  const issueIds = entries
                    .map((entry, index) => ({ entry, index }))
                    .filter(({ index }) => 
                      errors.some(error => error.row === index + 1) || 
                      warnings.some(warning => warning.row === index + 1)
                    )
                    .map(({ entry, index }) => `${entry.employeeId}-${index}`);
                  setSelectedIds(new Set(issueIds));
                }}
                className="px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-sm hover:bg-amber-200 transition-colors duration-200"
              >
                Select All with Issues
              </button>
              <button
                onClick={() => {
                  const approvedIds = entries
                    .map((entry, index) => ({ entry, index }))
                    .filter(({ entry }) => entry.timesheetStatus === 'Approved')
                    .map(({ entry, index }) => `${entry.employeeId}-${index}`);
                  setSelectedIds(new Set(approvedIds));
                }}
                className="px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full text-sm hover:bg-emerald-200 transition-colors duration-200"
              >
                Select All Approved
              </button>
              <button
                onClick={() => setSelectedIds(new Set())}
                className="px-3 py-1 bg-slate-100 text-slate-800 rounded-full text-sm hover:bg-slate-200 transition-colors duration-200"
              >
                Clear Selection
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {showConfirmation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md mx-4 shadow-2xl">
            <div className="flex items-center space-x-3 mb-4">
              <AlertTriangle className="h-6 w-6 text-amber-600" />
              <h3 className="text-lg font-semibold text-slate-800">Confirm Bulk Update</h3>
            </div>
            <p className="text-slate-600 mb-6">
              Are you sure you want to update {selectedIds.size} timesheet entries to 
              <span className="font-semibold"> "{bulkStatus}"</span>?
            </p>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowConfirmation(false)}
                className="flex-1 px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors duration-200"
              >
                Cancel
              </button>
              <button
                onClick={handleBulkStatusUpdate}
                className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors duration-200 flex items-center justify-center space-x-2"
              >
                <CheckCircle className="h-4 w-4" />
                <span>Confirm</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Summary */}
      <div className="bg-slate-50 px-6 py-3 border-t border-slate-200">
        <p className="text-sm text-slate-600">
          {selectedIds.size === 0 ? (
            'Select entries above to perform bulk operations'
          ) : (
            `${selectedIds.size} of ${entries.length} entries selected`
          )}
        </p>
      </div>
    </div>
  );
}; 