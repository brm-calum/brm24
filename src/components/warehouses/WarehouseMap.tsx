import React, { useState } from 'react';
import Map, { Marker, Popup } from 'react-map-gl';
import { Warehouse } from '../../lib/types/warehouse';
import { Warehouse as WarehouseIcon } from 'lucide-react';
import 'mapbox-gl/dist/mapbox-gl.css';

interface WarehouseMapProps {
  warehouses: Warehouse[];
  onWarehouseClick: (id: string) => void;
}

export function WarehouseMap({ warehouses, onWarehouseClick }: WarehouseMapProps) {
  const [selectedWarehouse, setSelectedWarehouse] = useState<Warehouse | null>(null);
  const [viewState, setViewState] = useState({
    latitude: 59.4370, // Centered on Tallinn
    longitude: 24.7536,
    zoom: 11
  });

  return (
    <Map
      {...viewState}
      onMove={evt => setViewState(evt.viewState)}
      style={{ width: '100%', height: '100%' }}
      mapStyle="mapbox://styles/mapbox/light-v11"
      mapboxAccessToken="pk.eyJ1IjoiY2FsdW1jIiwiYSI6ImNscnlwbGF0cjFqYXUya3A4Y2x2emQxN2IifQ.KZjh5n1gDGe6XT9v8Y0YRg"
    >
      {warehouses.map(warehouse => (
        <Marker
          key={warehouse.id}
          latitude={warehouse.latitude || 0}
          longitude={warehouse.longitude || 0}
          onClick={e => {
            e.originalEvent.stopPropagation();
            setSelectedWarehouse(warehouse);
          }}
        >
          <div className="cursor-pointer text-green-600 hover:text-green-700 transition-colors">
            <WarehouseIcon className="h-6 w-6" />
          </div>
        </Marker>
      ))}

      {selectedWarehouse && (
        <Popup
          latitude={selectedWarehouse.latitude || 0}
          longitude={selectedWarehouse.longitude || 0}
          onClose={() => setSelectedWarehouse(null)}
          closeButton={true}
          closeOnClick={false}
          className="min-w-[200px]"
        >
          <div className="p-2">
            <h3 className="font-medium text-gray-900">{selectedWarehouse.name}</h3>
            <p className="text-sm text-gray-500 mt-1">{selectedWarehouse.city}, {selectedWarehouse.country}</p>
            <p className="text-sm text-gray-500">{selectedWarehouse.size_m2} m²</p>
            <button
              onClick={() => onWarehouseClick(selectedWarehouse.id)}
              className="mt-2 w-full px-3 py-1.5 text-sm text-white bg-green-600 rounded hover:bg-green-700"
            >
              View Details
            </button>
          </div>
        </Popup>
      )}
    </Map>
  );
}