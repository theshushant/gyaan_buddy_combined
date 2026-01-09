import React, { useState, useEffect } from 'react';
import notificationsService from '../services/notificationsService';

const Notifications = () => {
  const [filter, setFilter] = useState('all');
  const [activeTab, setActiveTab] = useState('my'); // 'my' or 'students'
  const [notifications, setNotifications] = useState([]);
  const [studentNotifications, setStudentNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    total: 0,
    unread: 0,
    highPriority: 0,
    read: 0
  });
  const [studentStats, setStudentStats] = useState({
    total: 0,
    unread: 0,
    classes: [],
    totalStudents: 0
  });
  useEffect(() => {
    fetchNotifications();
  }, [activeTab]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      setError(null);

      if (activeTab === 'my') {
        const response = await notificationsService.getNotifications();
        console.log('My notifications response:', response);

        if (response.success && response.data) {
          const formattedNotifications = formatNotifications(response.data.notifications || []);
          setNotifications(formattedNotifications);
          setStats({
            total: response.data.total_count || formattedNotifications.length,
            unread: response.data.unread_count || formattedNotifications.filter(n => !n.isRead).length,
            highPriority: formattedNotifications.filter(n => n.priority === 'high').length,
            read: formattedNotifications.filter(n => n.isRead).length
          });
        } else {
          setNotifications([]);
        }
      } else {
        // Fetch student notifications
        const response = await notificationsService.getStudentNotifications();
        console.log('Student notifications response:', response);

        if (response.success && response.data) {
          const formattedNotifications = formatNotifications(response.data.notifications || []);
          setStudentNotifications(formattedNotifications);
          setStudentStats({
            total: response.data.total_count || formattedNotifications.length,
            unread: response.data.unread_count || formattedNotifications.filter(n => !n.isRead).length,
            classes: response.data.classes || [],
            totalStudents: response.data.total_students || 0
          });
        } else {
          setStudentNotifications([]);
        }
      }
    } catch (err) {
      console.error('Error fetching notifications:', err);
      setError(err.message || 'Failed to fetch notifications');
    } finally {
      setLoading(false);
    }
  };

  const formatNotifications = (notificationsList) => {
    return notificationsList.map(notification => ({
      id: notification.id,
      type: notification.type || 'user',
      title: notification.data?.title || notification.notification_id || 'Notification',
      message: notification.data?.message || notification.data?.body || '',
      time: formatTime(notification.created_at),
      isRead: notification.is_read,
      priority: notification.data?.priority || 'medium',
      userName: notification.user_name,
      username: notification.username,
      rawData: notification.data
    }));
  };

  const formatTime = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    return date.toLocaleDateString();
  };

  const handleMarkAsRead = async (notificationId) => {
    try {
      await notificationsService.markAsRead(notificationId);
      // Update local state
      if (activeTab === 'my') {
        setNotifications(prev => 
          prev.map(n => n.id === notificationId ? { ...n, isRead: true } : n)
        );
        setStats(prev => ({
          ...prev,
          unread: Math.max(0, prev.unread - 1),
          read: prev.read + 1
        }));
      } else {
        setStudentNotifications(prev => 
          prev.map(n => n.id === notificationId ? { ...n, isRead: true } : n)
        );
        setStudentStats(prev => ({
          ...prev,
          unread: Math.max(0, prev.unread - 1)
        }));
      }
    } catch (err) {
      console.error('Error marking notification as read:', err);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationsService.markAllAsRead();
      // Update local state
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setStats(prev => ({
        ...prev,
        unread: 0,
        read: prev.total
      }));
    } catch (err) {
      console.error('Error marking all as read:', err);
    }
  };

  const currentNotifications = activeTab === 'my' ? notifications : studentNotifications;
  const currentStats = activeTab === 'my' ? stats : studentStats;

  const filteredNotifications = currentNotifications.filter(notification => {
    if (filter === 'all') return true;
    if (filter === 'unread') return !notification.isRead;
    return notification.type === filter;
  });

  const getIcon = (type) => {
    switch (type) {
      case 'module': return '📚';
      case 'subject': return '📖';
      case 'mission': return '🎯';
      case 'competition': return '🏆';
      case 'user': return '👤';
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

  if (loading) {
    return (
      <div className="p-6 animate-fade-in">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="flex flex-col items-center space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
            <p className="text-gray-600">Loading notifications...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 animate-fade-in">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <div className="text-red-600 text-xl mb-2">⚠️</div>
          <h3 className="text-lg font-semibold text-red-800 mb-2">Error Loading Notifications</h3>
          <p className="text-red-700 mb-4">{error}</p>
          <button
            onClick={fetchNotifications}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all duration-300"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 animate-fade-in">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 animate-slide-down">Notifications</h1>
        <p className="text-gray-600 mt-2 animate-slide-right" style={{animationDelay: '0.1s'}}>
          Stay updated with important announcements and activities.
        </p>
      </div>

      {/* Tabs */}
      <div className="mb-6 border-b border-gray-200">
        <nav className="flex space-x-8">
          <button
            onClick={() => setActiveTab('my')}
            className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'my'
                ? 'border-primary-500 text-primary-500'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            My Notifications
          </button>
          <button
            onClick={() => setActiveTab('students')}
            className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'students'
                ? 'border-primary-500 text-primary-500'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Student Notifications
            {studentStats.unread > 0 && (
              <span className="ml-2 px-2 py-0.5 text-xs bg-red-100 text-red-600 rounded-full">
                {studentStats.unread}
              </span>
            )}
          </button>
        </nav>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 transform hover:scale-105 transition-all duration-300 hover:shadow-lg animate-slide-up" style={{animationDelay: '0.2s'}}>
          <div className="text-center">
            <div className="text-3xl font-bold text-primary-500 mb-2 animate-count-up">
              {currentStats.total}
            </div>
            <div className="text-sm text-gray-600">Total Notifications</div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 transform hover:scale-105 transition-all duration-300 hover:shadow-lg animate-slide-up" style={{animationDelay: '0.3s'}}>
          <div className="text-center">
            <div className="text-3xl font-bold text-red-600 mb-2 animate-count-up">
              {currentStats.unread}
            </div>
            <div className="text-sm text-gray-600">Unread</div>
          </div>
        </div>
        
        {activeTab === 'my' ? (
          <>
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 transform hover:scale-105 transition-all duration-300 hover:shadow-lg animate-slide-up" style={{animationDelay: '0.4s'}}>
              <div className="text-center">
                <div className="text-3xl font-bold text-yellow-600 mb-2 animate-count-up">
                  {stats.highPriority}
                </div>
                <div className="text-sm text-gray-600">High Priority</div>
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 transform hover:scale-105 transition-all duration-300 hover:shadow-lg animate-slide-up" style={{animationDelay: '0.5s'}}>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600 mb-2 animate-count-up">
                  {stats.read}
                </div>
                <div className="text-sm text-gray-600">Read</div>
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 transform hover:scale-105 transition-all duration-300 hover:shadow-lg animate-slide-up" style={{animationDelay: '0.4s'}}>
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600 mb-2 animate-count-up">
                  {studentStats.classes?.length || 0}
                </div>
                <div className="text-sm text-gray-600">Classes</div>
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 transform hover:scale-105 transition-all duration-300 hover:shadow-lg animate-slide-up" style={{animationDelay: '0.5s'}}>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600 mb-2 animate-count-up">
                  {studentStats.totalStudents}
                </div>
                <div className="text-sm text-gray-600">Students</div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Filters */}
      <div className="mb-6">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === 'all' ? 'text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
            style={filter === 'all' ? { backgroundColor: '#00167a' } : {}}
          >
            All
          </button>
          <button
            onClick={() => setFilter('unread')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === 'unread' ? 'text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
            style={filter === 'unread' ? { backgroundColor: '#00167a' } : {}}
          >
            Unread
          </button>
          <button
            onClick={() => setFilter('mission')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === 'mission' ? 'text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
            style={filter === 'mission' ? { backgroundColor: '#00167a' } : {}}
          >
            Missions
          </button>
          <button
            onClick={() => setFilter('competition')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === 'competition' ? 'text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
            style={filter === 'competition' ? { backgroundColor: '#00167a' } : {}}
          >
            Competitions
          </button>
          <button
            onClick={() => setFilter('module')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === 'module' ? 'text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
            style={filter === 'module' ? { backgroundColor: '#00167a' } : {}}
          >
            Modules
          </button>
          <button
            onClick={() => setFilter('user')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === 'user' ? 'text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
            style={filter === 'user' ? { backgroundColor: '#00167a' } : {}}
          >
            User
          </button>
        </div>
      </div>

      {/* Notifications List */}
      <div className="space-y-4">
        {filteredNotifications.map((notification) => (
          <div
            key={notification.id}
            className={`p-4 rounded-lg border-2 transition-all hover:shadow-md ${getPriorityColor(notification.priority)} ${
              !notification.isRead ? 'ring-2 ring-primary-500/20' : ''
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
                  <div>
                    <h3 className={`text-sm font-medium ${
                      !notification.isRead ? 'text-gray-900' : 'text-gray-700'
                    }`}>
                      {notification.title}
                    </h3>
                    {activeTab === 'students' && notification.userName && (
                      <span className="text-xs text-primary-500 font-medium">
                        {notification.userName} ({notification.username})
                      </span>
                    )}
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      notification.type === 'mission' ? 'bg-purple-100 text-purple-800' :
                      notification.type === 'competition' ? 'bg-yellow-100 text-yellow-800' :
                      notification.type === 'module' ? 'bg-primary-500/20 text-primary-500' :
                      notification.type === 'user' ? 'bg-green-100 text-green-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {notification.type}
                    </span>
                    {notification.priority && (
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        notification.priority === 'high' ? 'bg-red-100 text-red-800' :
                        notification.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {notification.priority}
                      </span>
                    )}
                    {!notification.isRead && (
                      <div className="w-2 h-2 bg-primary-500 rounded-full"></div>
                    )}
                  </div>
                </div>
                
                <p className="mt-1 text-sm text-gray-600">{notification.message}</p>
                
                <div className="mt-2 flex items-center justify-between">
                  <span className="text-xs text-gray-500">{notification.time}</span>
                  <div className="flex space-x-2">
                    {!notification.isRead && (
                      <button 
                        onClick={() => handleMarkAsRead(notification.id)}
                        className="text-green-600 hover:text-green-800 text-sm font-medium"
                      >
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
          <div className="text-6xl mb-4">🔔</div>
          <div className="text-gray-500 text-lg">No notifications found.</div>
          <p className="text-gray-400 text-sm mt-2">
            {filter !== 'all' ? 'Try changing the filter to see more notifications.' : 'You\'re all caught up!'}
          </p>
        </div>
      )}

      {/* Actions */}
      {currentNotifications.length > 0 && activeTab === 'my' && (
        <div className="mt-8 flex justify-end space-x-4">
          <button 
            onClick={handleMarkAllAsRead}
            className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            disabled={stats.unread === 0}
          >
            Mark All as Read
          </button>
          <button 
            onClick={fetchNotifications}
            className="px-6 py-2 text-white rounded-lg hover:bg-primary-600 transition-colors" style={{ backgroundColor: '#00167a' }}
          >
            Refresh
          </button>
        </div>
      )}
    </div>
  );
};

export default Notifications;
