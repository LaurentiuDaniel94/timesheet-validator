import React, { useState } from 'react';
import { Clock, AlertCircle, Building2 } from 'lucide-react';
import { FileUpload } from './components/FileUpload';
import { ValidationSummary } from './components/ValidationSummary';
import { TimesheetTable } from './components/TimesheetTable';
import { TimesheetEntry, ValidationResult } from './types/timesheet';
import { parseCSV } from './utils/csvParser';
import { validateTimesheet } from './utils/validator';

function App() {
  const [entries, setEntries] = useState<TimesheetEntry[]>([]);
  const [validation, setValidation] = useState<ValidationResult | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasProcessed, setHasProcessed] = useState(false);

  const handleFileSelect = async (file: File) => {
    setIsProcessing(true);
    setError(null);
    
    try {
      const parsedEntries = await parseCSV(file);
      const validationResult = validateTimesheet(parsedEntries);
      
      setEntries(parsedEntries);
      setValidation(validationResult);
      setHasProcessed(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while processing the file');
      setEntries([]);
      setValidation(null);
      setHasProcessed(false);
    } finally {
      setIsProcessing(false);
    }
  };

  const resetApp = () => {
    setEntries([]);
    setValidation(null);
    setError(null);
    setHasProcessed(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-cyan-50 to-purple-100">
      <div className="bg-white shadow-lg border-b backdrop-blur-sm bg-opacity-95">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-br from-cyan-600 to-purple-600 p-3 rounded-xl shadow-lg transform transition-all duration-300 hover:scale-110">
                <Building2 className="h-6 w-6 text-white" />
              </div>
              <div className="bg-gradient-to-br from-purple-600 to-cyan-600 p-3 rounded-xl shadow-lg transform transition-all duration-300 hover:scale-110">
                <Clock className="h-6 w-6 text-white" />
              </div>
            </div>
            <div>
              <div className="flex items-center space-x-3">
                <h1 className="text-3xl font-bold text-slate-800">
                  Cognizant
                </h1>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-600 to-purple-600 bg-clip-text text-transparent">
                  Timesheet Validator
                </h1>
              </div>
              <p className="text-gray-600 font-medium">Professional timesheet validation for enterprise teams</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="bg-gradient-to-r from-rose-50 to-red-50 border border-rose-200 rounded-xl p-6 mb-6 flex items-start space-x-3 shadow-lg animate-shake">
            <AlertCircle className="h-5 w-5 text-rose-600 mt-0.5" />
            <div>
              <h3 className="font-semibold text-rose-800">Error processing file</h3>
              <p className="text-rose-700 mt-1">{error}</p>
              <button
                onClick={resetApp}
                className="mt-3 px-4 py-2 bg-rose-100 text-rose-700 rounded-lg hover:bg-rose-200 font-medium transition-all duration-200 transform hover:scale-105"
              >
                Try again
              </button>
            </div>
          </div>
        )}

        {!entries.length && !error && (
          <>
            <div className="text-center mb-8 animate-fade-in">
              <h2 className="text-2xl font-bold text-gray-900 mb-3">
                Upload Your Cognizant Timesheet
              </h2>
              <p className="text-gray-600 max-w-2xl mx-auto text-lg leading-relaxed">
                Upload a CSV file containing your Cognizant timesheet data. The system will automatically 
                validate the data and highlight any issues that need attention.
              </p>
            </div>

            <FileUpload 
              onFileSelect={handleFileSelect} 
              isProcessing={isProcessing} 
              hasProcessed={hasProcessed}
            />

            <div className="bg-white rounded-xl shadow-lg p-6 transform transition-all duration-300 hover:shadow-xl">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
                <div className="w-1 h-5 bg-gradient-to-b from-cyan-500 to-purple-600 rounded-full mr-3"></div>
                Expected CSV Format
              </h3>
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm rounded-lg overflow-hidden">
                  <thead className="bg-gradient-to-r from-slate-50 to-cyan-50">
                    <tr>
                      <th className="px-4 py-3 text-left font-semibold text-slate-700">Employee ID</th>
                      <th className="px-4 py-3 text-left font-semibold text-slate-700">Employee Name</th>
                      <th className="px-4 py-3 text-left font-semibold text-slate-700">Date</th>
                      <th className="px-4 py-3 text-left font-semibold text-slate-700">Start Time</th>
                      <th className="px-4 py-3 text-left font-semibold text-slate-700">End Time</th>
                      <th className="px-4 py-3 text-left font-semibold text-slate-700">Hours Worked</th>
                      <th className="px-4 py-3 text-left font-semibold text-slate-700">Project</th>
                      <th className="px-4 py-3 text-left font-semibold text-slate-700">Description</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white">
                    <tr className="hover:bg-cyan-50 transition-colors duration-200">
                      <td className="px-4 py-3 text-slate-700 font-medium">EMP001</td>
                      <td className="px-4 py-3 text-slate-700">John Doe</td>
                      <td className="px-4 py-3 text-slate-700">2024-01-15</td>
                      <td className="px-4 py-3 text-slate-700">09:00</td>
                      <td className="px-4 py-3 text-slate-700">17:00</td>
                      <td className="px-4 py-3 text-cyan-600 font-semibold">8</td>
                      <td className="px-4 py-3 text-slate-700">Project Alpha</td>
                      <td className="px-4 py-3 text-slate-700">Development work</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div className="mt-6 p-4 bg-cyan-50 rounded-lg border-l-4 border-cyan-400">
                <p className="text-sm text-cyan-800">
                  <strong>💡 Pro Tip:</strong> The header names are flexible - the system can recognize common variations like "employee_id", "start_time", "hours", etc.
                </p>
              </div>
            </div>
          </>
        )}

        {entries.length > 0 && validation && (
          <div className="space-y-6">
            <div className="flex justify-between items-center animate-fade-in">
              <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                <div className="w-1 h-8 bg-gradient-to-b from-cyan-500 to-purple-600 rounded-full mr-3"></div>
                Validation Results
              </h2>
              <button
                onClick={resetApp}
                className="px-6 py-3 text-slate-600 hover:text-slate-800 border border-slate-300 rounded-xl hover:bg-gradient-to-r hover:from-slate-50 hover:to-cyan-50 transition-all duration-300 transform hover:scale-105 shadow-sm hover:shadow-md"
              >
                Upload New File
              </button>
            </div>

            <ValidationSummary validation={validation} />
            
            <TimesheetTable 
              entries={entries} 
              errors={validation.errors}
              warnings={validation.warnings}
            />
          </div>
        )}
      </div>
    </div>
  );
}

export default App;