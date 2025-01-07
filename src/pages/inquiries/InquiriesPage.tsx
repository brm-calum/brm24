import React, { useState } from 'react';
import { useBookings } from '../../hooks/useBookings';
import { MessageSquare, Loader, Search, Filter, Star, AlertCircle } from 'lucide-react';
import { ConversationList } from '../../components/inquiries/ConversationList';
import { InquiryThread } from '../../components/inquiries/InquiryThread';
import { ErrorDisplay } from '../../components/ui/ErrorDisplay';
import { supabase } from '../../lib/supabase';
import { InquiryPriority } from '../../lib/types/inquiry';

export function InquiriesPage() {
  const { inquiries, isLoading, error, fetchInquiries } = useBookings();
  const [selectedInquiryId, setSelectedInquiryId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'responded'>('all');
  const [priorityFilter, setPriorityFilter] = useState<'all' | 'priority' | 'normal'>('all');

  const filteredInquiries = (inquiries || []).filter(inquiry => {
    const matchesSearch = searchTerm === '' || 
      `${inquiry.warehouse_name} ${inquiry.inquirer_first_name} ${inquiry.inquirer_last_name}`
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || inquiry.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || 
      (priorityFilter === 'priority' ? inquiry.is_priority : !inquiry.is_priority);
    
    return matchesSearch && matchesStatus && matchesPriority;
  });

  const selectedInquiry = inquiries?.find(i => i.inquiry_id === selectedInquiryId);

  const handleSelect = (id: string) => {
    setSelectedInquiryId(id);
  };

  const handleUpdatePriority = async (id: string, isPriority: boolean) => {
    try {
      await supabase
        .from('warehouse_inquiries')
        .update({ is_priority: isPriority })
        .eq('id', id);
      await fetchInquiries();
    } catch (err) {
      console.error('Failed to update priority:', err);
    }
  };

  const handleRespond = async (message: string) => {
    try {
      await supabase.rpc('respond_to_inquiry_v2', {
        p_inquiry_id: selectedInquiryId,
        p_message: message
      });
      // Refresh inquiries after response
      await fetchInquiries();
    } catch (err) {
      console.error('Failed to send response:', err);
      throw err;
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader className="h-8 w-8 animate-spin text-green-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4">
        <ErrorDisplay 
          error={error}
          onRetry={fetchInquiries}
        />
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-4rem)] bg-gray-50 flex">
      {/* Left Sidebar */}
      <div className="w-full max-w-md border-r border-gray-200 bg-white flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <h1 className="text-2xl font-semibold text-gray-900 flex items-center">
            <MessageSquare className="h-6 w-6 mr-2 text-green-600" />
            Messages
          </h1>
          
          {/* Search & Filters */}
          <div className="mt-4 space-y-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <div className="flex space-x-2">
                <input
                  type="text"
                  placeholder="Search conversations..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="flex-1 pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                />
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <Filter className="h-5 w-5 text-gray-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm rounded-md"
              >
                <option value="all">All Messages</option>
                <option value="pending">Pending</option>
                <option value="responded">Responded</option>
              </select>
              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value as any)}
                className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm rounded-md"
              >
                <option value="all">All Priorities</option>
                <option value="priority">Priority</option>
                <option value="normal">Normal</option>
              </select>
            </div>
          </div>
        </div>

        {/* Conversation List */}
        <ConversationList
          conversations={filteredInquiries}
          selectedId={selectedInquiryId}
          isLoading={isLoading}
          onSelect={handleSelect}
          onUpdatePriority={handleUpdatePriority}
        />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col bg-gray-50">
        {selectedInquiry ? (
          <InquiryThread
            inquiry={selectedInquiry}
            onRespond={handleRespond}
          />
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-500">
            <div className="text-center">
              <MessageSquare className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <p>Select a conversation to view messages</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}