import { useParams, useNavigate } from 'react-router-dom';
import { useWarehouses } from '../../hooks/useWarehouses';
import { Warehouse } from '../../lib/types/warehouse';
import { Loader, MapPin, Ruler, Euro, ArrowLeft, MessageSquare } from 'lucide-react';
import { useState } from 'react';
import { InquiryForm } from './InquiryForm';

export function WarehouseDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { fetchWarehouse, isLoading, error } = useWarehouses();
  const [warehouse, setWarehouse] = useState<Warehouse | null>(null);
  const [showInquiryForm, setShowInquiryForm] = useState(false);

  useEffect(() => {
    if (id) {
      fetchWarehouse(id).then((fetchedWarehouse) => {
        setWarehouse(fetchedWarehouse);
      });
    }
  }, [id, fetchWarehouse]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader className="animate-spin" />
      </div>
    );
  }

  if (error || !warehouse) {
    return <div>Error loading warehouse details</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center mb-8">
        <button
          onClick={() => navigate(-1)}
          className="mr-4 text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft />
        </button>
        <h1 className="text-2xl font-bold">{warehouse.name}</h1>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <div>
          {warehouse.images && warehouse.images.length > 0 && (
            <img
              src={warehouse.images[0]}
              alt={warehouse.name}
              className="w-full h-64 object-cover rounded-lg mb-4"
            />
          )}

          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="bg-gray-100 p-4 rounded-lg">
              <MapPin className="mx-auto mb-2" />
              <p className="text-sm">{warehouse.address}</p>
            </div>
            <div className="bg-gray-100 p-4 rounded-lg">
              <Ruler className="mx-auto mb-2" />
              <p className="text-sm">{warehouse.size_m2} m²</p>
            </div>
            <div className="bg-gray-100 p-4 rounded-lg">
              <Euro className="mx-auto mb-2" />
              <p className="text-sm">{warehouse.price_per_month} / month</p>
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-lg font-medium text-gray-900 mb-4">Description</h2>
          <p className="text-gray-600 mb-6">{warehouse.description}</p>

          {warehouse.amenities && warehouse.amenities.length > 0 && (
            <div>
              <h2 className="text-lg font-medium text-gray-900 mb-4">Amenities</h2>
              <ul className="list-disc list-inside">
                {warehouse.amenities.map((amenity, index) => (
                  <li key={index} className="text-gray-600">
                    {amenity}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="mt-8 flex justify-end">
            <button
              onClick={() => setShowInquiryForm(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
            >
              <MessageSquare className="h-4 w-4 mr-2" />
              Send Inquiry
            </button>
          </div>

          {showInquiryForm && (
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
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

          {warehouse.images && warehouse.images.length > 1 && (
            <div className="mt-8">
              <h2 className="text-lg font-medium text-gray-900 mb-4">More Images</h2>
              <div className="grid grid-cols-3 gap-4">
                {warehouse.images.slice(1).map((image, index) => (
                  <img
                    key={index}
                    src={image}
                    alt={`${warehouse.name} - Image ${index + 2}`}
                    className="w-full h-32 object-cover rounded-lg"
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}