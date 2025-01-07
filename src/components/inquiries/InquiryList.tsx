import React from 'react';
import { Link } from 'react-router-dom';
import { MessageSquare, Calendar, Ruler } from 'lucide-react';
import { InquiryResponse } from './InquiryResponse';
import { useBookings } from '../../hooks/useBookings';
import { useState } from 'react';
import { InquiryThread } from './InquiryThread';

interface InquiryListProps {
  inquiries: any[];
  showWarehouseLink?: boolean;
}

export function InquiryList({ inquiries, showWarehouseLink = true }: InquiryListProps) {
  const { respondToInquiry } = useBookings();
  const [selectedInquiry, setSelectedInquiry] = useState<string | null>(null);

  const handleRespond = async (message: string) => {
    await respondToInquiry(selectedInquiry!, message);
    setSelectedInquiry(null);
  };

  if (inquiries.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No inquiries found
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {inquiries.map((inquiry) => (
        selectedInquiry === inquiry.inquiry_id ? (
          <InquiryThread
            key={inquiry.inquiry_id}
            inquiry={inquiry}
            onRespond={handleRespond}
          />
        ) : (
          <div
            key={inquiry.inquiry_id}
            className="bg-white rounded-lg shadow p-4 hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => setSelectedInquiry(inquiry.inquiry_id)}
          >
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="text-lg font-medium text-gray-900">
                {showWarehouseLink ? (
                  <Link
                    to={`/warehouses/${inquiry.warehouse_id}`}
                    className="hover:text-green-600"
                  >
                    {inquiry.warehouse_name}
                  </Link>
                ) : (
                  inquiry.warehouse_name
                )}
              </h3>
              <div className="mt-1 flex items-center text-sm text-gray-500">
                <MessageSquare className="h-4 w-4 mr-1" />
                From: {inquiry.inquirer_first_name} {inquiry.inquirer_last_name}
              </div>
            </div>
            <span
              className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
                inquiry.status === 'pending'
                  ? 'bg-yellow-100 text-yellow-800'
                  : inquiry.status === 'responded'
                  ? 'bg-green-100 text-green-800'
                  : 'bg-gray-100 text-gray-800'
              }`}
            >
              {inquiry.status}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="flex items-center text-sm text-gray-500">
              <Calendar className="h-4 w-4 mr-2" />
              {new Date(inquiry.start_date).toLocaleDateString()} - {new Date(inquiry.end_date).toLocaleDateString()}
            </div>
            <div className="flex items-center text-sm text-gray-500">
              <Ruler className="h-4 w-4 mr-2" />
              {inquiry.space_needed} m²
            </div>
          </div>

          <div className="text-sm text-gray-600 mb-4">
            {inquiry.message}
          </div>

          {inquiry.responses?.length > 0 && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <h4 className="text-sm font-medium text-gray-900 mb-2">Latest Response:</h4>
              <div className="text-sm text-gray-600">
                {inquiry.responses[inquiry.responses.length - 1].message}
              </div>
            </div>
          )}
          </div>
        )
      ))}
    </div>
  );
}