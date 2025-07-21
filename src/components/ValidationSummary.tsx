import React from 'react';
import { CheckCircle, AlertTriangle, XCircle } from 'lucide-react';
import { ValidationResult } from '../types/timesheet';

interface ValidationSummaryProps {
  validation: ValidationResult;
}

export const ValidationSummary: React.FC<ValidationSummaryProps> = ({ validation }) => {
  const { isValid, errors, warnings } = validation;

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 mb-6 transform transition-all duration-500 hover:shadow-xl animate-fade-in">
      <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
        <div className="w-1 h-6 bg-gradient-to-b from-cyan-500 to-purple-600 rounded-full mr-3"></div>
        Validation Summary
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className={`flex items-center space-x-3 p-4 rounded-xl transition-all duration-300 hover:scale-105 ${
          isValid 
            ? 'bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200 shadow-md' 
            : 'bg-gradient-to-br from-rose-50 to-red-50 border border-rose-200 shadow-md'
        }`}>
          {isValid ? (
            <CheckCircle className="h-6 w-6 text-emerald-600 animate-pulse" />
          ) : (
            <XCircle className="h-6 w-6 text-rose-600 animate-pulse" />
          )}
          <div>
            <p className="font-semibold text-gray-900">Overall Status</p>
            <p className={`text-sm ${isValid ? 'text-emerald-700' : 'text-rose-700'}`}>
              {isValid ? 'Valid' : 'Invalid'}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3 p-4 rounded-xl bg-gradient-to-br from-rose-50 to-red-50 border border-rose-200 shadow-md transition-all duration-300 hover:scale-105">
          <XCircle className="h-6 w-6 text-rose-600 transition-transform duration-300 hover:rotate-12" />
          <div>
            <p className="font-semibold text-gray-900">Errors</p>
            <p className="text-sm text-rose-700 font-medium">{errors.length} found</p>
          </div>
        </div>

        <div className="flex items-center space-x-3 p-4 rounded-xl bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 shadow-md transition-all duration-300 hover:scale-105">
          <AlertTriangle className="h-6 w-6 text-amber-600 transition-transform duration-300 hover:rotate-12" />
          <div>
            <p className="font-semibold text-gray-900">Warnings</p>
            <p className="text-sm text-amber-700 font-medium">{warnings.length} found</p>
          </div>
        </div>
      </div>

      {(errors.length > 0 || warnings.length > 0) && (
        <div className="space-y-4 animate-slide-up">
          {errors.length > 0 && (
            <div>
              <h3 className="font-semibold text-rose-800 mb-3 flex items-center">
                <XCircle className="h-4 w-4 mr-2" />
                Errors ({errors.length})
              </h3>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {errors.map((error, index) => (
                  <div key={index} className="flex items-start space-x-3 text-sm p-2 rounded-lg bg-rose-50 border-l-4 border-rose-400 transition-all duration-200 hover:bg-rose-100">
                    <span className="bg-rose-200 text-rose-800 px-2 py-1 rounded-full text-xs font-bold min-w-fit">
                      Row {error.row}
                    </span>
                    <span className="text-rose-700">
                      <span className="font-medium">{error.field}:</span> {error.message}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {warnings.length > 0 && (
            <div>
              <h3 className="font-semibold text-amber-800 mb-3 flex items-center">
                <AlertTriangle className="h-4 w-4 mr-2" />
                Warnings ({warnings.length})
              </h3>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {warnings.map((warning, index) => (
                  <div key={index} className="flex items-start space-x-3 text-sm p-2 rounded-lg bg-amber-50 border-l-4 border-amber-400 transition-all duration-200 hover:bg-amber-100">
                    <span className="bg-amber-200 text-amber-800 px-2 py-1 rounded-full text-xs font-bold min-w-fit">
                      Row {warning.row}
                    </span>
                    <span className="text-amber-700">
                      <span className="font-medium">{warning.field}:</span> {warning.message}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};