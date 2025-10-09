# GyanBuddy - Combined Educational Management System

A comprehensive educational management system that combines both Principal and Teacher interfaces into a single application with role-based access control. This is the unified version that merges the separate Principal and Teacher frontend projects.

## Features

### Principal Features
- **Dashboard**: Overview of school performance and key metrics
- **Students Management**: View and manage all students across classes
- **Teachers Management**: Manage teacher profiles and assignments
- **Classes**: Organize and manage class structures
- **Reports**: Comprehensive analytics and reporting
- **AI Insights**: AI-powered insights for school management
- **Settings**: System configuration and preferences

### Teacher Features
- **Teacher Dashboard**: Personalized dashboard with class statistics
- **My Students**: Manage assigned students and track their progress
- **Modules & Assignments**: Create and manage learning modules
- **Tests & Quizzes**: Create, manage, and analyze assessments
- **AI-Generated Questions**: Generate questions using AI
- **Reports & Analytics**: Detailed performance analytics
- **Leaderboards**: Student rankings and achievements
- **Daily Missions**: Track daily learning objectives
- **Notifications**: Stay updated with important announcements
- **AI Suggestions**: Personalized teaching recommendations

## Role-Based Access Control

The application automatically switches between Principal and Teacher interfaces based on the selected role. Users can switch roles using the role switcher in the header.

### Principal Role
- Access to school-wide data and management features
- Can view all students, teachers, and classes
- Comprehensive reporting and analytics
- AI insights for school management

### Teacher Role
- Access to assigned students and classes only
- Teaching-specific tools and features
- Student progress tracking and assessment tools
- AI-powered teaching recommendations

## Technology Stack

- **React 19**: Modern React with latest features
- **Redux Toolkit**: State management with role-based authentication
- **React Router**: Client-side routing with role-based navigation
- **Tailwind CSS**: Utility-first CSS framework with custom animations
- **Lucide React**: Beautiful icons and UI elements
- **Chart.js**: Data visualization and analytics
- **Vite**: Fast build tool and development server

## Project History

This combined project was created by merging two separate frontend applications:
- **gyaan_buddy_frontend**: Original Principal interface
- **gyaan_buddy_teacher_frontend**: Original Teacher interface

The combination includes:
- All features from both original projects
- Role-based authentication and navigation
- Unified design system and animations
- Single codebase for easier maintenance

## Getting Started

1. **Install Dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

2. **Start Development Server**
   ```bash
   npm run dev
   # or
   yarn dev
   ```

3. **Build for Production**
   ```bash
   npm run build
   # or
   yarn build
   ```

4. **Access the Application**
   - Open http://localhost:5173 in your browser
   - Use the role switcher in the header to switch between Principal and Teacher modes

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── Layout.jsx       # Main layout with role-based navigation
│   ├── RoleSwitcher.jsx # Role switching component
│   └── ...
├── pages/               # Page components
│   ├── Dashboard.jsx    # Principal dashboard
│   ├── TeacherDashboard.jsx # Teacher dashboard
│   └── ...
├── features/            # Redux features
│   └── auth/            # Authentication and role management
├── store/               # Redux store configuration
├── hooks/               # Custom React hooks
└── assets/              # Static assets
```

## Key Features

### Animations
- Smooth page transitions and loading animations
- Hover effects and interactive elements
- Custom CSS animations for enhanced user experience

### Responsive Design
- Mobile-first approach
- Responsive navigation and layouts
- Touch-friendly interfaces

### Role-Based Navigation
- Dynamic navigation menus based on user role
- Contextual features and permissions
- Seamless role switching

## Development

The project uses modern React patterns and best practices:

- **Functional Components**: All components use React hooks
- **Custom Hooks**: Reusable logic and state management
- **Context API**: For global state and theme management
- **Error Boundaries**: Graceful error handling
- **Code Splitting**: Optimized bundle loading

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.