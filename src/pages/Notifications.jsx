import React, { useState } from 'react';

const Notifications = () => {
  const [filter, setFilter] = useState('all');

  const notifications = [
    {
      id: 1,
      type: 'assignment',
      title: 'New Assignment Posted',
      message: 'Mathematics Chapter 5 assignment has been posted for Class 10A',
      time: '2 hours ago',
      isRead: false,
      priority: 'high'
    },
    {
      id: 2,
      type: 'test',
      title: 'Test Results Available',
      message: 'Science test results for Class 9B are now available',
      time: '4 hours ago',
      isRead: false,
      priority: 'medium'
    },
    {
      id: 3,
      type: 'student',
      title: 'Student Achievement',
      message: 'Arjun Sharma completed Advanced Mathematics module with 95% score',
      time: '6 hours ago',
      isRead: true,
      priority: 'low'
    },
    {
      id: 4,
      type: 'system',
      title: 'System Maintenance',
      message: 'Scheduled maintenance will occur tonight from 2 AM to 4 AM',
      time: '1 day ago',
      isRead: true,
      priority: 'medium'
    },
    {
      id: 5,
      type: 'assignment',
      title: 'Assignment Due Reminder',
      message: 'English essay assignment is due tomorrow for Class 11',
      time: '1 day ago',
      isRead: true,
      priority: 'high'
    }
  ];

  const filteredNotifications = notifications.filter(notification => {
    if (filter === 'all') return true;
    if (filter === 'unread') return !notification.isRead;
    return notification.type === filter;
  });

  const getIcon = (type) => {
    switch (type) {
      case 'assignment': return '📝';
      case 'test': return '🧪';
      case 'student': return '👨‍🎓';
      case 'system': return '⚙️';
      default: return '🔔';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'border-red-200 bg-red-50';
      case 'medium': return 'border-yellow-200 bg-yellow-50';
      case 'low': return 'border-green-200 bg-green-50';
      default: return 'border-gray-200 bg-gray-50';
    }
  };

  return (
    <div className="p-6 animate-fade-in">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 animate-slide-down">Notifications</h1>
        <p className="text-gray-600 mt-2 animate-slide-right" style={{animationDelay: '0.1s'}}>Stay updated with important announcements and activities.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 transform hover:scale-105 transition-all duration-300 hover:shadow-lg animate-slide-up" style={{animationDelay: '0.2s'}}>
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600 mb-2 animate-count-up">{notifications.length}</div>
            <div className="text-sm text-gray-600">Total Notifications</div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 transform hover:scale-105 transition-all duration-300 hover:shadow-lg animate-slide-up" style={{animationDelay: '0.3s'}}>
          <div className="text-center">
            <div className="text-3xl font-bold text-red-600 mb-2 animate-count-up">
              {notifications.filter(n => !n.isRead).length}
            </div>
            <div className="text-sm text-gray-600">Unread</div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 transform hover:scale-105 transition-all duration-300 hover:shadow-lg animate-slide-up" style={{animationDelay: '0.4s'}}>
          <div className="text-center">
            <div className="text-3xl font-bold text-yellow-600 mb-2 animate-count-up">
              {notifications.filter(n => n.priority === 'high').length}
            </div>
            <div className="text-sm text-gray-600">High Priority</div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 transform hover:scale-105 transition-all duration-300 hover:shadow-lg animate-slide-up" style={{animationDelay: '0.5s'}}>
          <div className="text-center">
            <div className="text-3xl font-bold text-green-600 mb-2 animate-count-up">
              {notifications.filter(n => n.isRead).length}
            </div>
            <div className="text-sm text-gray-600">Read</div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-6">
        <div className="flex space-x-4">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === 'all' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilter('unread')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === 'unread' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Unread
          </button>
          <button
            onClick={() => setFilter('assignment')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === 'assignment' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Assignments
          </button>
          <button
            onClick={() => setFilter('test')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === 'test' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Tests
          </button>
        </div>
      </div>

      {/* Notifications List */}
      <div className="space-y-4">
        {filteredNotifications.map((notification) => (
          <div
            key={notification.id}
            className={`p-4 rounded-lg border-2 transition-all hover:shadow-md ${getPriorityColor(notification.priority)} ${
              !notification.isRead ? 'ring-2 ring-blue-200' : ''
            }`}
          >
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm">
                  <span className="text-lg">{getIcon(notification.type)}</span>
                </div>
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h3 className={`text-sm font-medium ${
                    !notification.isRead ? 'text-gray-900' : 'text-gray-700'
                  }`}>
                    {notification.title}
                  </h3>
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      notification.priority === 'high' ? 'bg-red-100 text-red-800' :
                      notification.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {notification.priority}
                    </span>
                    {!notification.isRead && (
                      <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                    )}
                  </div>
                </div>
                
                <p className="mt-1 text-sm text-gray-600">{notification.message}</p>
                
                <div className="mt-2 flex items-center justify-between">
                  <span className="text-xs text-gray-500">{notification.time}</span>
                  <div className="flex space-x-2">
                    <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                      View Details
                    </button>
                    {!notification.isRead && (
                      <button className="text-green-600 hover:text-green-800 text-sm font-medium">
                        Mark as Read
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredNotifications.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-500 text-lg">No notifications found.</div>
        </div>
      )}

      {/* Actions */}
      <div className="mt-8 flex justify-end space-x-4">
        <button className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors">
          Mark All as Read
        </button>
        <button className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
          Clear All
        </button>
      </div>
    </div>
  );
};

export default Notifications;
