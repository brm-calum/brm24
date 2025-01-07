import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useWarehouses } from '../hooks/useWarehouses';
import { useBookings } from '../hooks/useBookings';
import { Building2, MessageSquare, Plus, Warehouse, Users, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { InquiryList } from '../components/inquiries/InquiryList';

export function DashboardPage() {
  const { user, hasRole } = useAuth();
  const { fetchWarehouses, isLoading: warehousesLoading } = useWarehouses();
  const { inquiries, isLoading: inquiriesLoading } = useBookings();
  const [warehouses, setWarehouses] = React.useState([]);

  React.useEffect(() => {
    const loadData = async () => {
      try {
        const warehousesData = await fetchWarehouses();
        setWarehouses(warehousesData.filter(w => w.owner_id === user?.id));
      } catch (err) {
        console.error('Failed to load dashboard data:', err);
      }
    };
    loadData();
  }, [user?.id]);

  const isLoading = warehousesLoading || inquiriesLoading;

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600" />
      </div>
    );
  }

  return (
    <div className="py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
          <div className="flex space-x-4">
            <Link
              to="/warehouses/create"
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              List Warehouse
            </Link>
          </div>
        </div>
        
        <div className="mt-6 grid gap-6 md:grid-cols-2">
          {/* Quick Stats */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <Building2 className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <h2 className="text-lg font-medium text-gray-900">My Warehouses</h2>
                <p className="text-3xl font-bold text-gray-900">{warehouses.length}</p>
              </div>
            </div>
            <Link
              to="/warehouses/dashboard"
              className="mt-4 inline-flex items-center text-sm font-medium text-green-600 hover:text-green-700"
            >
              View all warehouses
              <span className="ml-1">→</span>
            </Link>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <MessageSquare className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <h2 className="text-lg font-medium text-gray-900">Pending Inquiries</h2>
                <p className="text-3xl font-bold text-gray-900">
                  {inquiries.filter(i => i.status === 'pending').length}
                </p>
              </div>
            </div>
            <Link
              to="/inquiries"
              className="mt-4 inline-flex items-center text-sm font-medium text-green-600 hover:text-green-700"
            >
              View all inquiries
              <span className="ml-1">→</span>
            </Link>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="mt-8">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Recent Pending Inquiries</h2>
          <div className="bg-white shadow rounded-lg">
            <div className="p-4">
              <InquiryList inquiries={inquiries.filter(i => i.status === 'pending').slice(0, 3)} />
              {inquiries.length > 3 && (
                <div className="mt-4 text-center">
                  <Link
                    to="/inquiries"
                    className="inline-flex items-center text-sm font-medium text-green-600 hover:text-green-700"
                  >
                    View all inquiries
                    <ArrowRight className="ml-1 h-4 w-4" />
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Link
              to="/warehouses/create"
              className="flex items-center p-4 bg-white shadow rounded-lg hover:shadow-md transition-shadow"
            >
              <Warehouse className="h-6 w-6 text-green-600" />
              <span className="ml-3 text-gray-900">List New Warehouse</span>
            </Link>

            <Link
              to="/warehouses"
              className="flex items-center p-4 bg-white shadow rounded-lg hover:shadow-md transition-shadow"
            >
              <Building2 className="h-6 w-6 text-green-600" />
              <span className="ml-3 text-gray-900">Browse Warehouses</span>
            </Link>

            {hasRole('administrator') && (
              <Link
                to="/admin/users"
                className="flex items-center p-4 bg-white shadow rounded-lg hover:shadow-md transition-shadow"
              >
                <Users className="h-6 w-6 text-green-600" />
                <span className="ml-3 text-gray-900">Manage Users</span>
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}