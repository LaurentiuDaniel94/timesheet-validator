import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, PieChart, Pie, Cell, ResponsiveContainer, LineChart, Line } from 'recharts';
import { TrendingUp, Users, Clock, CheckCircle, AlertTriangle, Calendar } from 'lucide-react';
import { TimesheetEntry } from '../types/timesheet';
import { format, parseISO } from 'date-fns';

interface AnalyticsProps {
  entries: TimesheetEntry[];
}

export const Analytics: React.FC<AnalyticsProps> = ({ entries }) => {
  // Calculate summary statistics
  const totalEmployees = new Set(entries.map(e => e.employeeId)).size;
  const totalHours = entries.reduce((sum, e) => sum + e.totalHours, 0);
  const totalScheduledHours = entries.reduce((sum, e) => sum + e.scheduleHours, 0);
  const averageHours = totalHours / Math.max(entries.length, 1);
  
  // Status distribution
  const statusData = entries.reduce((acc, entry) => {
    acc[entry.timesheetStatus] = (acc[entry.timesheetStatus] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const statusChartData = Object.entries(statusData).map(([status, count]) => ({
    status,
    count,
    percentage: ((count / entries.length) * 100).toFixed(1)
  }));

  // Hours distribution by employee
  const employeeHoursData = entries.reduce((acc, entry) => {
    const empId = entry.employeeId;
    if (!acc[empId]) {
      acc[empId] = { 
        employeeId: empId, 
        totalHours: 0, 
        scheduledHours: 0, 
        reportedHours: 0,
        overtimeHours: 0,
        periods: 0
      };
    }
    acc[empId].totalHours += entry.totalHours;
    acc[empId].scheduledHours += entry.scheduleHours;
    acc[empId].reportedHours += entry.reportedHours;
    acc[empId].overtimeHours += entry.overtimeHours;
    acc[empId].periods += 1;
    return acc;
  }, {} as Record<string, any>);

  const employeeChartData = Object.values(employeeHoursData).slice(0, 10); // Top 10 employees

  // Hours breakdown (Regular, Overtime, Holiday, Leave)
  const hoursBreakdown = entries.reduce((acc, entry) => {
    acc.regular += entry.regularHours;
    acc.overtime += entry.overtimeHours;
    acc.holiday += entry.holidayHours;
    acc.leave += entry.leaveHours;
    return acc;
  }, { regular: 0, overtime: 0, holiday: 0, leave: 0 });

  const hoursBreakdownData = [
    { name: 'Regular', hours: hoursBreakdown.regular, color: '#10b981' },
    { name: 'Overtime', hours: hoursBreakdown.overtime, color: '#f59e0b' },
    { name: 'Holiday', hours: hoursBreakdown.holiday, color: '#8b5cf6' },
    { name: 'Leave', hours: hoursBreakdown.leave, color: '#06b6d4' }
  ];

  // Weekly trend (group by start date)
  const weeklyTrends = entries.reduce((acc, entry) => {
    try {
      const weekStart = format(parseISO(entry.startDate.includes('/') 
        ? entry.startDate.split('/').reverse().join('-')  // Convert MM/DD/YYYY to YYYY-MM-DD
        : entry.startDate), 'MMM dd');
      
      if (!acc[weekStart]) {
        acc[weekStart] = { week: weekStart, hours: 0, entries: 0 };
      }
      acc[weekStart].hours += entry.totalHours;
      acc[weekStart].entries += 1;
    } catch (error) {
      // Skip invalid dates
    }
    return acc;
  }, {} as Record<string, any>);

  const trendData = Object.values(weeklyTrends).slice(0, 8); // Last 8 weeks

  const COLORS = ['#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#f97316'];

  const StatCard = ({ icon: Icon, title, value, subtext, color }: any) => (
    <div className="bg-white rounded-xl shadow-lg p-6 border border-slate-200/50 hover:shadow-xl transition-all duration-300">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-slate-600">{title}</p>
          <p className={`text-2xl font-bold ${color}`}>{value}</p>
          <p className="text-xs text-slate-500 mt-1">{subtext}</p>
        </div>
        <div className={`p-3 rounded-full ${color.replace('text-', 'bg-').replace('-600', '-100')}`}>
          <Icon className={`h-6 w-6 ${color}`} />
        </div>
      </div>
    </div>
  );

  if (entries.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-8 text-center">
        <TrendingUp className="h-12 w-12 text-slate-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-slate-700 mb-2">No Data to Analyze</h3>
        <p className="text-slate-500">Upload a timesheet to see analytics and insights.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Summary Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={Users}
          title="Total Employees"
          value={totalEmployees}
          subtext={`${entries.length} timesheet entries`}
          color="text-cyan-600"
        />
        <StatCard
          icon={Clock}
          title="Total Hours"
          value={totalHours.toFixed(1)}
          subtext={`${totalScheduledHours.toFixed(1)} scheduled`}
          color="text-purple-600"
        />
        <StatCard
          icon={TrendingUp}
          title="Average Hours"
          value={averageHours.toFixed(1)}
          subtext="per timesheet period"
          color="text-emerald-600"
        />
        <StatCard
          icon={CheckCircle}
          title="Completion Rate"
          value={`${(((totalHours / totalScheduledHours) || 0) * 100).toFixed(1)}%`}
          subtext="hours vs scheduled"
          color="text-amber-600"
        />
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Status Distribution */}
        <div className="bg-white rounded-xl shadow-lg p-6 border border-slate-200/50">
          <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center">
            <CheckCircle className="h-5 w-5 mr-2 text-emerald-600" />
            Timesheet Status Distribution
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={statusChartData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={2}
                dataKey="count"
              >
                {statusChartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                formatter={(value: any, name: any, props: any) => [
                  `${value} (${props.payload.percentage}%)`, 
                  props.payload.status
                ]} 
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex flex-wrap gap-2 mt-4">
            {statusChartData.map((item, index) => (
              <div key={item.status} className="flex items-center">
                <div 
                  className="w-3 h-3 rounded-full mr-2" 
                  style={{ backgroundColor: COLORS[index % COLORS.length] }}
                ></div>
                <span className="text-sm text-slate-600">{item.status}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Hours Breakdown */}
        <div className="bg-white rounded-xl shadow-lg p-6 border border-slate-200/50">
          <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center">
            <Clock className="h-5 w-5 mr-2 text-purple-600" />
            Hours Type Breakdown
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={hoursBreakdownData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip formatter={(value) => [`${value} hours`, 'Total']} />
              <Bar dataKey="hours" fill="#8884d8">
                {hoursBreakdownData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Employee Hours */}
        <div className="bg-white rounded-xl shadow-lg p-6 border border-slate-200/50">
          <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center">
            <Users className="h-5 w-5 mr-2 text-cyan-600" />
            Hours by Employee (Top 10)
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={employeeChartData} margin={{ left: 20 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="employeeId" />
              <YAxis />
              <Tooltip 
                formatter={(value, name) => [
                  `${Number(value).toFixed(1)} hours`, 
                  name === 'totalHours' ? 'Total Hours' : 
                  name === 'overtimeHours' ? 'Overtime Hours' : name
                ]} 
              />
              <Bar dataKey="totalHours" fill="#06b6d4" name="Total Hours" />
              <Bar dataKey="overtimeHours" fill="#f59e0b" name="Overtime Hours" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Weekly Trends */}
        <div className="bg-white rounded-xl shadow-lg p-6 border border-slate-200/50">
          <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center">
            <Calendar className="h-5 w-5 mr-2 text-emerald-600" />
            Weekly Hours Trend
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="week" />
              <YAxis />
              <Tooltip 
                formatter={(value, name) => [
                  `${Number(value).toFixed(1)} ${name === 'hours' ? 'hours' : 'entries'}`, 
                  name === 'hours' ? 'Total Hours' : 'Timesheet Entries'
                ]} 
              />
              <Line 
                type="monotone" 
                dataKey="hours" 
                stroke="#10b981" 
                strokeWidth={3}
                dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Insights Panel */}
      <div className="bg-gradient-to-r from-cyan-50 to-purple-50 rounded-xl p-6 border border-cyan-200">
        <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center">
          <AlertTriangle className="h-5 w-5 mr-2 text-amber-600" />
          Key Insights
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="bg-white/60 rounded-lg p-4">
            <p className="text-sm text-slate-600">Most Common Status</p>
            <p className="text-lg font-semibold text-slate-800">
              {statusChartData.length > 0 ? statusChartData[0].status : 'N/A'}
            </p>
          </div>
          <div className="bg-white/60 rounded-lg p-4">
            <p className="text-sm text-slate-600">Overtime Percentage</p>
            <p className="text-lg font-semibold text-slate-800">
              {((hoursBreakdown.overtime / totalHours) * 100 || 0).toFixed(1)}%
            </p>
          </div>
          <div className="bg-white/60 rounded-lg p-4">
            <p className="text-sm text-slate-600">Average per Employee</p>
            <p className="text-lg font-semibold text-slate-800">
              {(totalHours / totalEmployees || 0).toFixed(1)} hours
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}; 