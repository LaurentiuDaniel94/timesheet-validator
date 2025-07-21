#  Timesheet Validator

A professional, enterprise-grade timesheet validation application built for teams. This React-based web application allows users to upload CSV timesheet files and automatically validates the data for errors and inconsistencies.

![ Timesheet Validator](https://img.shields.io/badge/Status-Production%20Ready-brightgreen)
![React](https://img.shields.io/badge/React-18.3.1-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.5.3-blue)
![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-3.4.1-blue)

## 🚀 Features

### Core Functionality
- **CSV File Upload**: Drag-and-drop or click-to-upload CSV timesheet files
- **Intelligent Parsing**: Flexible header recognition (supports variations like "employee_id", "start_time", etc.)
- **Comprehensive Validation**: Validates required fields, time formats, date formats, and logical consistency
- **Real-time Processing**: Instant validation results with detailed error and warning reports
- **Data Export**: Export validated timesheet data back to CSV format

### Validation Rules
- **Required Fields**: Employee ID, Employee Name, Date, Start Time, End Time
- **Time Format Validation**: Ensures proper HH:MM format for start and end times
- **Date Format Validation**: Validates date entries and checks for valid date formats
- **Logical Consistency**: Verifies end time is after start time
- **Hours Calculation**: Compares recorded hours with calculated hours from time entries
- **Reasonable Hours Check**: Flags entries with unusually long work hours (>16 hours)

### User Experience
- **Professional  Branding**: Corporate-ready design with  styling
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile devices
- **Smooth Animations**: Modern micro-interactions and transitions
- **Intuitive Interface**: Clean, user-friendly design with clear visual feedback
- **Error Highlighting**: Visual indicators for problematic entries in the data table

## 🛠️ Technology Stack

- **Frontend Framework**: React 18.3.1 with TypeScript
- **Styling**: Tailwind CSS 3.4.1 for modern, responsive design
- **Build Tool**: Vite 5.4.2 for fast development and optimized builds
- **CSV Processing**: PapaParse 5.5.3 for robust CSV parsing
- **Icons**: Lucide React for consistent, professional icons
- **Code Quality**: ESLint with TypeScript support

## 📋 Prerequisites

Before running this application, ensure you have:

- **Node.js** (version 16.0 or higher)
- **npm** (version 7.0 or higher) or **yarn**
- A modern web browser (Chrome, Firefox, Safari, Edge)

## 🚀 Quick Start

### 1. Clone the Repository
```bash
git clone <repository-url>
cd timesheet-validator
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Start Development Server
```bash
npm run dev
```

The application will be available at `http://localhost:5173`

### 4. Build for Production
```bash
npm run build
```

### 5. Preview Production Build
```bash
npm run preview
```

## 📁 Project Structure

```
timesheet-validator/
├── public/
│   └── vite.svg
├── src/
│   ├── components/
│   │   ├── FileUpload.tsx          # Drag-and-drop file upload component
│   │   ├── TimesheetTable.tsx      # Data table with sorting and export
│   │   └── ValidationSummary.tsx   # Validation results summary
│   ├── types/
│   │   └── timesheet.ts           # TypeScript interfaces and types
│   ├── utils/
│   │   ├── csvParser.ts           # CSV parsing logic with PapaParse
│   │   └── validator.ts           # Timesheet validation rules
│   ├── App.tsx                    # Main application component
│   ├── main.tsx                   # Application entry point
│   └── index.css                  # Global styles and animations
├── sample-timesheet.csv           # Example CSV file for testing
├── package.json                   # Dependencies and scripts
├── tailwind.config.js            # Tailwind CSS configuration
├── vite.config.ts                # Vite build configuration
└── README.md                     # This file
```

## 📊 CSV File Format

The application expects CSV files with the following columns (headers are flexible):

| Column | Required | Accepted Header Variations | Example |
|--------|----------|---------------------------|---------|
| Employee ID | Yes | `employee id`, `employee_id`, `id` | EMP001 |
| Employee Name | Yes | `employee name`, `employee_name`, `name` | John Smith |
| Date | Yes | `date` | 2024-01-15 |
| Start Time | Yes | `start time`, `start_time`, `start` | 09:00 |
| End Time | Yes | `end time`, `end_time`, `end` | 17:00 |
| Hours Worked | No | `hours worked`, `hours_worked`, `hours` | 8 |
| Project | No | `project` | Project Alpha |
| Description | No | `description`, `notes` | Development work |

### Sample CSV Content
```csv
Employee ID,Employee Name,Date,Start Time,End Time,Hours Worked,Project,Description
EMP001,John Smith,2024-01-15,09:00,17:00,8,Project Alpha,Frontend development work
EMP002,Sarah Johnson,2024-01-15,08:30,16:30,8,Project Beta,Database optimization
```

## ✅ Validation Rules

### Error Conditions (Must Fix)
- Missing required fields (Employee ID, Name, Date, Start Time, End Time)
- Invalid date formats
- Invalid time formats (must be HH:MM)
- End time before or equal to start time
- Negative hours worked

### Warning Conditions (Review Recommended)
- Missing project information
- Hours worked doesn't match calculated hours (tolerance: ±15 minutes)
- Unusually long work hours (>16 hours per day)

## 🎨 Design Features

### Visual Design
- **Branding**: Professional corporate styling with company colors
- **Gradient Backgrounds**: Modern gradient backgrounds and accents
- **Responsive Layout**: Mobile-first design that works on all screen sizes
- **Smooth Animations**: Fade-in, slide-up, and hover effects for enhanced UX

### Color Palette
- **Primary**: Cyan to Purple gradients (`from-cyan-600 to-purple-600`)
- **Success**: Emerald tones for valid data
- **Warning**: Amber tones for warnings
- **Error**: Rose tones for errors
- **Neutral**: Slate tones for general content

## 🔧 Available Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start development server with hot reload |
| `npm run build` | Build production-ready application |
| `npm run preview` | Preview production build locally |
| `npm run lint` | Run ESLint for code quality checks |

## 🌐 Deployment

The application is deployed and accessible at:
**https://iridescent-khapse-99e06f.netlify.app**

### Deploy to Netlify
1. Build the application: `npm run build`
2. Upload the `dist` folder to Netlify
3. Configure build settings:
   - Build command: `npm run build`
   - Publish directory: `dist`

### Deploy to Other Platforms
The application can be deployed to any static hosting service:
- **Vercel**: Connect GitHub repository for automatic deployments
- **GitHub Pages**: Use GitHub Actions for automated builds
- **AWS S3**: Upload build files to S3 bucket with static website hosting

## 🧪 Testing

### Manual Testing
1. Use the provided `sample-timesheet.csv` file
2. Test various error conditions:
   - Upload CSV with missing required fields
   - Include invalid time formats
   - Add entries with end time before start time
3. Verify validation messages appear correctly
4. Test export functionality

### Test Cases
- ✅ Valid timesheet data
- ❌ Missing employee ID
- ❌ Invalid date format
- ❌ Invalid time format
- ❌ End time before start time
- ⚠️ Hours mismatch
- ⚠️ Missing project information

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/new-feature`
3. Make your changes and commit: `git commit -m 'Add new feature'`
4. Push to the branch: `git push origin feature/new-feature`
5. Submit a pull request

### Code Style
- Use TypeScript for type safety
- Follow React best practices
- Use Tailwind CSS for styling
- Maintain consistent code formatting with ESLint

## 📝 License

This project is proprietary software. All rights reserved.

## 🆘 Support

For technical support or questions:
1. Check the validation error messages in the application
2. Verify your CSV file format matches the expected structure
3. Ensure all required fields are present in your data
4. Contact the development team for additional assistance

## 🔄 Version History

- **v1.0.0** - Initial release with core validation features
- **v1.1.0** - Added branding and enhanced UI
- **v1.2.0** - Improved validation rules and error messaging

---

**Built with ❤️ for Teams**