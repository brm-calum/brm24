import React from 'react';
import { Truck, PackageSearch, Construction, Shield } from 'lucide-react';
import { WarehouseFeature } from '../../lib/types/warehouse';

interface WarehouseFeaturesProps {
  features: WarehouseFeature[];
  className?: string;
}

const getIconForType = (type: string) => {
  switch (type) {
    case 'accessibility':
      return Truck;
    case 'equipment':
      return PackageSearch;
    case 'security':
      return Shield;
    default:
      return Construction;
  }
};

export function WarehouseFeatures({ features, className = '' }: WarehouseFeaturesProps) {
  return (
    <div className={`flex flex-wrap gap-2 ${className}`}>
      {features?.map((feature) => {
        const Icon = getIconForType(feature.type);
        
        return (
          <div
            key={feature.id}
            className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-gray-100 text-gray-800"
          >
            {Icon && <Icon className="h-4 w-4 mr-2" />}
            <span>{feature.name}</span>
            {feature.custom_value && (
              <span className="ml-1 text-gray-500">: {feature.custom_value}</span>
            )}
          </div>
        );
      }) || null}
    </div>
  );
}