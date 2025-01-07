import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Warehouse as WarehouseType } from '../../lib/types/warehouse';
import { Warehouse, MapPin, Ruler, Euro, MessageSquare } from 'lucide-react';
import { useState } from 'react';
import { InquiryForm } from './InquiryForm';
import { WarehouseFeatures } from './WarehouseFeatures';

interface WarehouseCardProps {
  warehouse: WarehouseType;
}

export function WarehouseCard({ warehouse }: WarehouseCardProps) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [showInquiryForm, setShowInquiryForm] = useState(false);

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement;
    if (target.closest('.inquiry-button')) {
      e.stopPropagation();
      return;
    }
    navigate(`/warehouses/${warehouse.id}`);
  };

  return (
    <div
      onClick={handleClick}
      className="bg-white rounded-lg shadow overflow-hidden hover:shadow-lg transition-all duration-200 cursor-pointer"
    >
      <div className="aspect-[4/3] relative bg-gray-100 overflow-hidden">
        {warehouse.images?.[0]?.url ? (
          <img
            src={warehouse.images[0].url}
            alt={warehouse.name}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-50">
            <Warehouse className="h-12 w-12 text-gray-300" />
          </div>
        )}
      </div>
      <div className="p-6">
        <div className="mb-4">
          <h3 className="text-lg font-medium text-gray-900">
            {warehouse.name}
          </h3>
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 mt-2">
            {warehouse.type?.name}
          </span>
        </div>
        
        <p className="text-sm text-gray-500 line-clamp-2 mb-4">
          {warehouse.description}
        </p>

        <div className="space-y-2.5">
          <div className="flex items-center text-sm text-gray-500">
            <MapPin className="h-4 w-4 mr-2" />
            {warehouse.city}, {warehouse.country}
          </div>
          <div className="flex items-center text-sm text-gray-500">
            <Ruler className="h-4 w-4 mr-2" />
            {warehouse.size_m2} m²
          </div>
          <div className="flex items-center text-sm text-gray-500">
            <Euro className="h-4 w-4 mr-2" />
            {(warehouse.price_per_m2_cents / 100).toFixed(2)} €/m²
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <WarehouseFeatures features={warehouse.features} />
        </div>
      </div>
      
      <div className="flex justify-between items-center mt-4">
        <button
          onClick={(e) => {
            e.stopPropagation();
            if (user) {
              setShowInquiryForm(true);
            } else {
              navigate('/login', { state: { from: `/warehouses/${warehouse.id}` } });
            }
          }}
          className="inquiry-button inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-green-600 bg-green-50 hover:bg-green-100"
        >
          <MessageSquare className="h-4 w-4 mr-1" />
          Send Inquiry
        </button>
      </div>

      {showInquiryForm && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50" onClick={(e) => e.stopPropagation()}>
          <div className="bg-white rounded-lg p-6 max-w-lg w-full mx-4">
            <h2 className="text-lg font-medium text-gray-900 mb-4">
              Send Inquiry for {warehouse.name}
            </h2>
            <InquiryForm
              warehouseId={warehouse.id}
              warehouseSize={warehouse.size_m2}
              onSuccess={() => setShowInquiryForm(false)}
              onCancel={() => setShowInquiryForm(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
}