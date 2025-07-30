import React, { useState, useEffect } from 'react';
import { Search, Filter, X, Calendar, Users, Clock, CheckSquare } from 'lucide-react';
import { TimesheetEntry } from '../types/timesheet';

interface FilterState {
  employeeId: string;
  status: string;
  startDateFrom: string;
  startDateTo: string;
  minHours: string;
  maxHours: string;
  searchTerm: string;
}

interface AdvancedFiltersProps {
  entries: TimesheetEntry[];
  onFilterChange: (filteredEntries: TimesheetEntry[]) => void;
}

export const AdvancedFilters: React.FC<AdvancedFiltersProps> = ({ entries, onFilterChange }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [filters, setFilters] = useState<FilterState>({
    employeeId: '',
    status: '',
    startDateFrom: '',
    startDateTo: '',
    minHours: '',
    maxHours: '',
    searchTerm: ''
  });

  // Get unique values for dropdowns
  const uniqueEmployees = [...new Set(entries.map(e => e.employeeId))].sort();
  const uniqueStatuses = [...new Set(entries.map(e => e.timesheetStatus))].sort();

  // Apply filters whenever filters or entries change
  useEffect(() => {
    let filtered = [...entries];

    // Search term filter
    if (filters.searchTerm) {
      const searchLower = filters.searchTerm.toLowerCase();
      filtered = filtered.filter(entry => 
        entry.employeeId.toLowerCase().includes(searchLower) ||
        entry.timesheetStatus.toLowerCase().includes(searchLower) ||
        entry.startDate.toLowerCase().includes(searchLower) ||
        entry.endDate.toLowerCase().includes(searchLower)
      );
    }

    // Employee ID filter
    if (filters.employeeId) {
      filtered = filtered.filter(entry => entry.employeeId === filters.employeeId);
    }

    // Status filter
    if (filters.status) {
      filtered = filtered.filter(entry => entry.timesheetStatus === filters.status);
    }

    // Date range filters
    if (filters.startDateFrom) {
      filtered = filtered.filter(entry => {
        const entryDate = new Date(entry.startDate);
        const filterDate = new Date(filters.startDateFrom);
        return entryDate >= filterDate;
      });
    }

    if (filters.startDateTo) {
      filtered = filtered.filter(entry => {
        const entryDate = new Date(entry.startDate);
        const filterDate = new Date(filters.startDateTo);
        return entryDate <= filterDate;
      });
    }

    // Hours range filters
    if (filters.minHours) {
      const minHours = parseFloat(filters.minHours);
      filtered = filtered.filter(entry => entry.totalHours >= minHours);
    }

    if (filters.maxHours) {
      const maxHours = parseFloat(filters.maxHours);
      filtered = filtered.filter(entry => entry.totalHours <= maxHours);
    }

    onFilterChange(filtered);
  }, [filters, entries, onFilterChange]);

  const handleFilterChange = (key: keyof FilterState, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({
      employeeId: '',
      status: '',
      startDateFrom: '',
      startDateTo: '',
      minHours: '',
      maxHours: '',
      searchTerm: ''
    });
  };

  const hasActiveFilters = Object.values(filters).some(value => value !== '');
  const activeFilterCount = Object.values(filters).filter(value => value !== '').length;

  return (
    <div className="bg-white rounded-xl shadow-lg border border-slate-200/50 overflow-hidden transition-all duration-300">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-50 to-cyan-50 px-6 py-4 border-b border-slate-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Filter className="h-5 w-5 text-slate-600" />
            <h3 className="text-lg font-semibold text-slate-800">Advanced Filters</h3>
            {activeFilterCount > 0 && (
              <span className="bg-cyan-100 text-cyan-800 px-2 py-1 rounded-full text-xs font-medium">
                {activeFilterCount} active
              </span>
            )}
          </div>
          <div className="flex items-center space-x-2">
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="text-slate-500 hover:text-slate-700 p-1 rounded-lg hover:bg-slate-100 transition-colors duration-200"
                title="Clear all filters"
              >
                <X className="h-4 w-4" />
              </button>
            )}
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-slate-600 hover:text-slate-800 px-3 py-1 rounded-lg hover:bg-slate-100 transition-colors duration-200 text-sm font-medium"
            >
              {isExpanded ? 'Collapse' : 'Expand'}
            </button>
          </div>
        </div>
      </div>

      {/* Search Bar - Always visible */}
      <div className="p-4 border-b border-slate-100">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search employees, statuses, dates..."
            className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all duration-200"
            value={filters.searchTerm}
            onChange={(e) => handleFilterChange('searchTerm', e.target.value)}
          />
        </div>
      </div>

      {/* Expanded Filters */}
      {isExpanded && (
        <div className="p-6 space-y-6 animate-fade-in">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Employee Filter */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2 flex items-center">
                <Users className="h-4 w-4 mr-2 text-cyan-600" />
                Employee ID
              </label>
              <select
                className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all duration-200"
                value={filters.employeeId}
                onChange={(e) => handleFilterChange('employeeId', e.target.value)}
              >
                <option value="">All Employees</option>
                {uniqueEmployees.map(empId => (
                  <option key={empId} value={empId}>Employee {empId}</option>
                ))}
              </select>
            </div>

            {/* Status Filter */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2 flex items-center">
                <CheckSquare className="h-4 w-4 mr-2 text-emerald-600" />
                Status
              </label>
              <select
                className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all duration-200"
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
              >
                <option value="">All Statuses</option>
                {uniqueStatuses.map(status => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>
            </div>

            {/* Hours Range */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2 flex items-center">
                <Clock className="h-4 w-4 mr-2 text-purple-600" />
                Hours Range
              </label>
              <div className="flex space-x-2">
                <input
                  type="number"
                  placeholder="Min"
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all duration-200"
                  value={filters.minHours}
                  onChange={(e) => handleFilterChange('minHours', e.target.value)}
                />
                <input
                  type="number"
                  placeholder="Max"
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all duration-200"
                  value={filters.maxHours}
                  onChange={(e) => handleFilterChange('maxHours', e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Date Range Filters */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2 flex items-center">
                <Calendar className="h-4 w-4 mr-2 text-amber-600" />
                Start Date From
              </label>
              <input
                type="date"
                className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all duration-200"
                value={filters.startDateFrom}
                onChange={(e) => handleFilterChange('startDateFrom', e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2 flex items-center">
                <Calendar className="h-4 w-4 mr-2 text-amber-600" />
                Start Date To
              </label>
              <input
                type="date"
                className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all duration-200"
                value={filters.startDateTo}
                onChange={(e) => handleFilterChange('startDateTo', e.target.value)}
              />
            </div>
          </div>

          {/* Quick Filter Presets */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-3">Quick Filters</label>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => handleFilterChange('status', 'Needs Approval')}
                className="px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-sm hover:bg-amber-200 transition-colors duration-200"
              >
                Needs Approval
              </button>
              <button
                onClick={() => handleFilterChange('status', 'Not Submitted')}
                className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm hover:bg-gray-200 transition-colors duration-200"
              >
                Not Submitted
              </button>
              <button
                onClick={() => handleFilterChange('minHours', '40')}
                className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm hover:bg-purple-200 transition-colors duration-200"
              >
                40+ Hours
              </button>
              <button
                onClick={() => {
                  handleFilterChange('minHours', '0');
                  handleFilterChange('maxHours', '0');
                }}
                className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm hover:bg-red-200 transition-colors duration-200"
              >
                Zero Hours
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Results Summary */}
      <div className="bg-slate-50 px-6 py-3 border-t border-slate-200">
        <p className="text-sm text-slate-600">
          Showing <span className="font-medium text-slate-800">{entries.length}</span> timesheet entries
          {hasActiveFilters && (
            <span> (filtered from original dataset)</span>
          )}
        </p>
      </div>
    </div>
  );
}; 