import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { signOut } from '../../lib/auth';
import { LogOut, Warehouse, ChevronDown, MessageSquare } from 'lucide-react';
import { AdminMenu } from './AdminMenu';
import { UserMenu } from './UserMenu';
import { useNotifications } from '../../hooks/useNotifications';
import { useState, useRef, useEffect } from 'react';

export function Navbar({ className = '' }: { className?: string }) {
  const navigate = useNavigate();
  const { user, hasRole } = useAuth();
  const { unreadCount } = useNotifications();
  const [isWarehouseOpen, setIsWarehouseOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsWarehouseOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSignOut = async () => {
    try {
      await signOut();
      // Clear any remaining auth state
      localStorage.removeItem('brm-warehouse-auth');
      
      // Force a full page reload to clear all state
      window.location.href = '/';
    } catch (error) {
      console.error('Sign out error:', error);
      // Force reload even on error
      window.location.href = '/';
    }
  };

  return (
    <nav className={`bg-white/95 backdrop-blur-sm shadow-sm ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16">
        <div className="flex items-center justify-between h-full">
          <div className="flex items-center">
            <Link to="/" className="flex items-center">
              <img 
                src="/images/BRM_Main_Logo-1.png"
                alt="BRM Warehouse" 
                className="h-10 w-auto object-contain"
              />
            </Link>
          </div>

          <div className="flex items-center space-x-1 sm:space-x-2">
            {user ? (
              <>
                {hasRole('administrator') && <AdminMenu />}
                <Link
                  to="/dashboard"
                  className="text-gray-600 hover:text-gray-900 px-2.5 py-2 text-sm font-medium rounded-md hover:bg-gray-50 transition-colors"
                >
                  Dashboard
                </Link>
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setIsWarehouseOpen(!isWarehouseOpen)}
                    className="flex items-center text-gray-600 hover:text-gray-900 px-2.5 py-2 text-sm font-medium rounded-md hover:bg-gray-50 transition-colors"
                  >
                    <Warehouse className="h-4 w-4 mr-2" />
                    Warehouses
                    <ChevronDown className="h-4 w-4 ml-1" />
                  </button>
                  {isWarehouseOpen && (
                    <div className="absolute right-0 mt-1 w-48 bg-white rounded-md shadow-lg py-1 z-50">
                      <Link
                        to="/warehouses"
                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => setIsWarehouseOpen(false)}
                      >
                        Browse Warehouses
                      </Link>
                      {user && (
                        <Link
                          to="/warehouses/dashboard"
                          className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          onClick={() => setIsWarehouseOpen(false)}
                        >
                          Manage Warehouses
                        </Link>
                      )}
                      <Link
                        to="/warehouses/create"
                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => setIsWarehouseOpen(false)}
                      >
                        List Warehouse
                      </Link>
                    </div>
                  )}
                </div>
                <Link
                  to="/inquiries"
                  className="text-gray-600 hover:text-gray-900 px-2.5 py-2 text-sm font-medium rounded-md hover:bg-gray-50 transition-colors relative inline-flex items-center"
                >
                  <MessageSquare className="h-6 w-6" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-green-500 text-[10px] font-medium text-white ring-2 ring-white">
                      {unreadCount}
                    </span>
                  )}
                </Link>
                <UserMenu />
                <button
                  onClick={handleSignOut}
                  className="inline-flex items-center px-2.5 py-1.5 text-sm font-medium text-neutral-600 hover:text-neutral-700 rounded-md shadow-sm transition-colors"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/warehouses"
                  className="inline-flex items-center px-2 py-2 text-sm font-medium text-green-700 hover:text-gray-900 rounded-md shadow-sm transition-colors"
                >
                  Find Warehouse
                </Link>
                <Link
                  to="/warehouses/create"
                  className="inline-flex items-center px-2 py-2 text-sm font-medium text-green-700 hover:text-gray-900 rounded-md shadow-sm transition-colors"
                >
                  List Warehouse
                </Link>
                <Link
                  to="/contact"
                  className="inline-flex items-center px-2 py-2 text-sm font-medium  text-gray-900 hover:text-green-700 rounded-md shadow-sm transition-colors"
                >
                  Contact BRM
                </Link>
                <Link
                  to="/login"
                  className="inline-flex items-center px-2 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-md shadow-sm transition-colors"
                >
                  Sign In
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}