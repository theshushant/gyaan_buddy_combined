import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { switchRole } from '../features/auth/authSlice';

const RoleSwitcher = () => {
  const dispatch = useDispatch();
  const { role } = useSelector(state => state.auth);

  const handleRoleSwitch = () => {
    const newRole = role === 'teacher' ? 'principal' : 'teacher';
    dispatch(switchRole(newRole));
  };

  return (
    <div className="flex items-center space-x-2">
      <span className="text-sm text-gray-600">Role:</span>
      <button
        onClick={handleRoleSwitch}
        className="px-3 py-1 rounded-lg transition-all duration-300 transform hover:scale-105 hover:shadow-md text-sm font-medium"
        style={{ backgroundColor: '#e6e8f4', color: '#00167a' }}
      >
        {role === 'teacher' ? 'Switch to Principal' : 'Switch to Teacher'}
      </button>
    </div>
  );
};

export default RoleSwitcher;
