import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { LogOut, User, Target, CreditCard, Wallet, Shield } from 'lucide-react';

const Navbar = () => {
  const { logout } = useAuth();
  const location = useLocation();
  const user = localStorage.getItem('user');
  const navigate = useNavigate();

  const navigationItems = [
    { id: 'schemes', label: 'Scheme', icon: CreditCard, path: '/schemes' },
    { id: 'aims', label: 'Aim', icon: Target, path: '/aims' },
    { id: 'wallet', label: 'Wallet', icon: Wallet, path: '/wallet' },
    { id: 'kyv', label: 'Kyc', icon: Shield, path: '/kyc' },
    { id: 'profile', label: 'Profile', icon: User, path: '/profile' },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-white shadow-lg border-b sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <h1 className="text-2xl font-bold text-indigo-600">UserPortal</h1>
          </div>

          {/* Navigation Items */}
          <div className="hidden md:flex items-center space-x-8">
            {navigationItems.map((item) => {
              const IconComponent = item.icon;
              const isActive = location.pathname.startsWith(item.path);
              return (
                <Link
                  key={item.id}
                  to={item.path}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${isActive
                      ? 'bg-indigo-100 text-indigo-700'
                      : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                    }`}
                >
                  <IconComponent size={18} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>

          {/* User Menu */}
          <div className="flex items-center space-x-4">
            <div
              onClick={() => navigate('/profile')}
              className="hidden md:flex items-center space-x-2 cursor-pointer px-2 py-1 transition-colors duration-200"
            >
              <div className="w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center">
                <User size={16} className="text-white" />
              </div>
              <span className="text-sm font-medium text-gray-700">
                Welcome, {user || 'User'}
              </span>
            </div>
            <button
              onClick={handleLogout}
              className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 flex items-center space-x-2 transition-colors duration-200"
            >
              <LogOut size={16} />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      <div className="md:hidden border-t bg-gray-50">
        <div className="flex justify-around py-2">
          {navigationItems.map((item) => {
            const IconComponent = item.icon;
            const isActive = location.pathname.startsWith(item.path);
            return (
              <Link
                key={item.id}
                to={item.path}
                className={`flex flex-col items-center space-y-1 px-3 py-2 rounded-md text-xs font-medium transition-colors duration-200 ${isActive
                    ? 'text-indigo-700 bg-indigo-50'
                    : 'text-gray-500'
                  }`}
              >
                <IconComponent size={18} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;