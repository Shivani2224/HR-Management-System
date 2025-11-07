# HR System

A simple HR system built with React for tracking employee work hours and breaks.

## Features

- **Login Page** with email/password authentication and automatic role detection
- **Navigation Bar** (after login) with:
  - Company name and menu on the left
  - User profile with dropdown on the right
  - Role-based menu items
  - Logout functionality
- **Employee Dashboard** with:
  - Login/Logout functionality for work sessions
  - Break In/Break Out tracking
  - Real-time work hours calculation
  - Real-time break time tracking
  - Session summary on logout

## Getting Started

### Installation

```bash
npm install
```

### Running the Application

```bash
npm run dev
```

The application will open at `http://localhost:5173`

### How to Use

1. **Login**: Use one of the demo credentials based on your role:
   - **Admin**: admin@company.com / admin123
   - **Manager**: manager@company.com / manager123
   - **Employee**: employee@company.com / employee123

2. **For Employees**:
   - Click "Login" to start your work session
   - View real-time tracking of:
     - Time since login
     - Active work time
     - Total break time
   - Click "Break In" when starting a break
   - Click "Break Out" when returning from break
   - Click "Logout" to end session and see summary

3. **For Managers/Admins**: Dashboard placeholders are ready for future features

## Project Structure

```
src/
├── components/
│   ├── Login.jsx              # Login component
│   ├── Login.css              # Login styles
│   ├── Navbar.jsx             # Navigation bar component
│   ├── Navbar.css             # Navbar styles
│   ├── EmployeeDashboard.jsx  # Employee dashboard
│   └── EmployeeDashboard.css  # Dashboard styles
├── App.jsx                    # Main app component
├── App.css                    # App styles
├── main.jsx                   # Entry point
└── index.css                  # Global styles
```

## Technologies Used

- React 18
- Vite
- CSS3
