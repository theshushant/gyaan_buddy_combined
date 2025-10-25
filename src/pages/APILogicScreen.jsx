import React, { useState, useEffect } from 'react';
import { 
  Database, 
  Users, 
  BookOpen, 
  BarChart3, 
  Brain, 
  Settings,
  ArrowRight,
  CheckCircle,
  AlertCircle,
  Clock,
  Zap
} from 'lucide-react';

const APILogicScreen = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [apiStatus, setApiStatus] = useState({
    auth: 'connected',
    students: 'connected',
    teachers: 'connected',
    questions: 'connected',
    dashboard: 'connected',
    reports: 'connected',
    ai: 'connected'
  });

  const tabs = [
    { id: 'overview', label: 'API Overview', icon: Database },
    { id: 'flow', label: 'Data Flow', icon: ArrowRight },
    { id: 'endpoints', label: 'Endpoints', icon: Settings },
    { id: 'models', label: 'Data Models', icon: BookOpen },
    { id: 'status', label: 'API Status', icon: CheckCircle }
  ];

  const apiModules = [
    {
      name: 'Authentication',
      icon: Users,
      color: 'bg-blue-500',
      endpoints: ['/auth/login', '/auth/logout', '/auth/me', '/auth/profile'],
      description: 'User authentication and session management',
      status: apiStatus.auth
    },
    {
      name: 'Students',
      icon: Users,
      color: 'bg-green-500',
      endpoints: ['/students', '/students/{id}', '/students/stats', '/students/performance'],
      description: 'Student management and performance tracking',
      status: apiStatus.students
    },
    {
      name: 'Teachers',
      icon: Users,
      color: 'bg-purple-500',
      endpoints: ['/teachers', '/teachers/{id}', '/teachers/stats', '/teachers/performance'],
      description: 'Teacher management and effectiveness tracking',
      status: apiStatus.teachers
    },
    {
      name: 'Questions',
      icon: BookOpen,
      color: 'bg-yellow-500',
      endpoints: ['/questions', '/questions/ai/generate', '/questions/ai/save'],
      description: 'Question bank and AI-generated content',
      status: apiStatus.questions
    },
    {
      name: 'Dashboard',
      icon: BarChart3,
      color: 'bg-indigo-500',
      endpoints: ['/dashboard/metrics', '/dashboard/progress-trends', '/dashboard/alerts'],
      description: 'Analytics and dashboard data',
      status: apiStatus.dashboard
    },
    {
      name: 'Reports',
      icon: BarChart3,
      color: 'bg-red-500',
      endpoints: ['/reports/student-performance', '/reports/analytics', '/reports/ai-insights'],
      description: 'Performance reports and analytics',
      status: apiStatus.reports
    },
    {
      name: 'AI Services',
      icon: Brain,
      color: 'bg-pink-500',
      endpoints: ['/ai/suggestions', '/ai/insights', '/ai/generate', '/ai/recommendations'],
      description: 'AI-powered insights and content generation',
      status: apiStatus.ai
    }
  ];

  const dataFlowSteps = [
    {
      step: 1,
      title: 'User Authentication',
      description: 'User logs in and receives JWT token',
      icon: Users,
      color: 'bg-blue-100 text-blue-800'
    },
    {
      step: 2,
      title: 'Data Fetching',
      description: 'Components fetch data from respective API endpoints',
      icon: Database,
      color: 'bg-green-100 text-green-800'
    },
    {
      step: 3,
      title: 'State Management',
      description: 'Data is stored in Redux store and component state',
      icon: Settings,
      color: 'bg-purple-100 text-purple-800'
    },
    {
      step: 4,
      title: 'UI Rendering',
      description: 'Components render data with loading and error states',
      icon: BarChart3,
      color: 'bg-yellow-100 text-yellow-800'
    },
    {
      step: 5,
      title: 'User Interaction',
      description: 'User actions trigger API calls for CRUD operations',
      icon: Zap,
      color: 'bg-red-100 text-red-800'
    }
  ];

  const dataModels = [
    {
      name: 'User',
      fields: ['id', 'email', 'firstName', 'lastName', 'role', 'school', 'permissions'],
      color: 'bg-blue-50 border-blue-200'
    },
    {
      name: 'Student',
      fields: ['id', 'firstName', 'lastName', 'class', 'grade', 'averageScore', 'attendance', 'performance'],
      color: 'bg-green-50 border-green-200'
    },
    {
      name: 'Teacher',
      fields: ['id', 'firstName', 'lastName', 'subject', 'classes', 'dashboardUsage', 'overallMastery'],
      color: 'bg-purple-50 border-purple-200'
    },
    {
      name: 'Question',
      fields: ['id', 'text', 'type', 'difficulty', 'subject', 'grade', 'options', 'successRate'],
      color: 'bg-yellow-50 border-yellow-200'
    },
    {
      name: 'Dashboard',
      fields: ['metrics', 'progressTrends', 'subjectPerformance', 'classDistribution', 'alerts'],
      color: 'bg-indigo-50 border-indigo-200'
    }
  ];

  const getStatusIcon = (status) => {
    switch (status) {
      case 'connected':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      case 'loading':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'connected':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'error':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'loading':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">API Logic Screen</h1>
              <p className="text-gray-600 mt-2">Visualize API architecture, data flow, and system status</p>
            </div>
            <div className="flex items-center space-x-2">
              <div className="flex items-center space-x-1">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span className="text-sm text-gray-600">All Systems Operational</span>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <tab.icon className="h-4 w-4" />
                  <span>{tab.label}</span>
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">API Architecture Overview</h2>
                <p className="text-gray-600 mb-6">
                  The Gyaan Buddy API follows RESTful principles with a modular architecture supporting authentication, 
                  student/teacher management, question generation, analytics, and AI-powered insights.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {apiModules.map((module, index) => (
                  <div 
                    key={index}
                    className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow duration-200"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className={`p-3 rounded-lg ${module.color}`}>
                        <module.icon className="h-6 w-6 text-white" />
                      </div>
                      <div className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(module.status)}`}>
                        {getStatusIcon(module.status)}
                        <span className="ml-1 capitalize">{module.status}</span>
                      </div>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{module.name}</h3>
                    <p className="text-gray-600 text-sm mb-4">{module.description}</p>
                    <div className="space-y-1">
                      {module.endpoints.slice(0, 3).map((endpoint, idx) => (
                        <div key={idx} className="text-xs text-gray-500 font-mono bg-gray-50 px-2 py-1 rounded">
                          {endpoint}
                        </div>
                      ))}
                      {module.endpoints.length > 3 && (
                        <div className="text-xs text-gray-400">
                          +{module.endpoints.length - 3} more endpoints
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Data Flow Tab */}
          {activeTab === 'flow' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">Data Flow Architecture</h2>
                <p className="text-gray-600 mb-6">
                  Understanding how data flows through the application from API endpoints to UI components.
                </p>
              </div>

              <div className="space-y-4">
                {dataFlowSteps.map((step, index) => (
                  <div key={index} className="flex items-center space-x-4">
                    <div className="flex-shrink-0">
                      <div className={`p-3 rounded-full ${step.color}`}>
                        <step.icon className="h-6 w-6" />
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-4">
                        <div className="text-2xl font-bold text-gray-400">0{step.step}</div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">{step.title}</h3>
                          <p className="text-gray-600">{step.description}</p>
                        </div>
                      </div>
                    </div>
                    {index < dataFlowSteps.length - 1 && (
                      <div className="flex-shrink-0">
                        <ArrowRight className="h-6 w-6 text-gray-400" />
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Flow Diagram */}
              <div className="mt-8 p-6 bg-gray-50 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Component Interaction Flow</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="bg-blue-100 text-blue-800 p-4 rounded-lg mb-2">
                      <Database className="h-8 w-8 mx-auto mb-2" />
                      <div className="font-semibold">API Services</div>
                    </div>
                    <div className="text-sm text-gray-600">Data fetching & CRUD operations</div>
                  </div>
                  <div className="text-center">
                    <div className="bg-green-100 text-green-800 p-4 rounded-lg mb-2">
                      <Settings className="h-8 w-8 mx-auto mb-2" />
                      <div className="font-semibold">Redux Store</div>
                    </div>
                    <div className="text-sm text-gray-600">State management & caching</div>
                  </div>
                  <div className="text-center">
                    <div className="bg-purple-100 text-purple-800 p-4 rounded-lg mb-2">
                      <BarChart3 className="h-8 w-8 mx-auto mb-2" />
                      <div className="font-semibold">UI Components</div>
                    </div>
                    <div className="text-sm text-gray-600">Data presentation & user interaction</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Endpoints Tab */}
          {activeTab === 'endpoints' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">API Endpoints Reference</h2>
                <p className="text-gray-600 mb-6">
                  Complete list of available API endpoints with their methods and purposes.
                </p>
              </div>

              <div className="space-y-6">
                {apiModules.map((module, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-6">
                    <div className="flex items-center space-x-3 mb-4">
                      <div className={`p-2 rounded-lg ${module.color}`}>
                        <module.icon className="h-5 w-5 text-white" />
                      </div>
                      <h3 className="text-xl font-semibold text-gray-900">{module.name}</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {module.endpoints.map((endpoint, idx) => (
                        <div key={idx} className="bg-gray-50 p-3 rounded-lg">
                          <div className="flex items-center space-x-2 mb-2">
                            <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded">
                              GET
                            </span>
                            <span className="font-mono text-sm text-gray-700">{endpoint}</span>
                          </div>
                          <div className="text-xs text-gray-600">
                            {endpoint.includes('{id}') ? 'Resource-specific operation' : 'List or create operation'}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Data Models Tab */}
          {activeTab === 'models' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">Data Models</h2>
                <p className="text-gray-600 mb-6">
                  Core data structures used throughout the application.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {dataModels.map((model, index) => (
                  <div key={index} className={`border rounded-lg p-6 ${model.color}`}>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">{model.name}</h3>
                    <div className="space-y-2">
                      {model.fields.map((field, idx) => (
                        <div key={idx} className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          <span className="text-sm text-gray-700 font-mono">{field}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* API Status Tab */}
          {activeTab === 'status' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">API Status Monitor</h2>
                <p className="text-gray-600 mb-6">
                  Real-time status of all API modules and services.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {apiModules.map((module, index) => (
                  <div key={index} className="bg-white border border-gray-200 rounded-lg p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className={`p-2 rounded-lg ${module.color}`}>
                          <module.icon className="h-5 w-5 text-white" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900">{module.name}</h3>
                      </div>
                      <div className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(module.status)}`}>
                        {getStatusIcon(module.status)}
                        <span className="ml-1 capitalize">{module.status}</span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Response Time</span>
                        <span className="text-gray-900">~150ms</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Uptime</span>
                        <span className="text-gray-900">99.9%</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Last Check</span>
                        <span className="text-gray-900">2s ago</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* System Health */}
              <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                <div className="flex items-center space-x-3">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                  <div>
                    <h3 className="text-lg font-semibold text-green-900">System Health: Excellent</h3>
                    <p className="text-green-700">All API services are operational with optimal performance.</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default APILogicScreen;
