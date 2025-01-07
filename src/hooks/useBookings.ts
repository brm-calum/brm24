import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { handleError } from '../lib/utils/errors';
import { useEffect, useRef } from 'react';

const POLL_INTERVAL = 30000; // 30 seconds
const REALTIME_TIMEOUT = 5000; // 5 seconds

interface InquiryFormData {
  warehouseId: string;
  startDate: Date;
  endDate: Date;
  spaceNeeded: number;
  message: string;
}

export function useBookings() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [inquiries, setInquiries] = useState<any[]>([]);
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

  const fetchInquiries = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const { data, error: inquiriesError } = await supabase.rpc('get_user_inquiries');
      
      if (inquiriesError) throw inquiriesError;
      setInquiries(data || []);
    } catch (err) {
      const appError = handleError(err, 'fetchInquiries');
      setError(appError);
      throw appError;
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Initial fetch
    fetchInquiries();

    // Set up realtime subscription
    const setupRealtimeSubscription = () => {
      try {
        if (channelRef.current) {
          channelRef.current.unsubscribe();
        }

        channelRef.current = supabase
          .channel('inquiries')
          .on(
            'postgres_changes',
            {
              event: '*',
              schema: 'public',
              table: 'warehouse_inquiries'
            },
            () => fetchInquiries()
          )
          .on(
            'postgres_changes',
            {
              event: '*', 
              schema: 'public',
              table: 'inquiry_responses'
            },
            () => fetchInquiries()
          )
          .subscribe((status) => {
            if (status === 'CHANNEL_ERROR') {
              console.warn('Realtime subscription error, retrying...');
              setTimeout(setupRealtimeSubscription, 1000);
            }
          });
      } catch (err) {
        console.error('Error setting up realtime subscription:', err);
        setTimeout(setupRealtimeSubscription, 1000);
      }
    };

    setupRealtimeSubscription();

    // Fallback polling
   /* const pollTimer = setInterval(fetchInquiries, POLL_INTERVAL);

    return () => {
      clearInterval(pollTimer);
      if (channelRef.current) {
        channelRef.current.unsubscribe();
      }
    }; */
  }, []);

  const createInquiry = async (data: InquiryFormData) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const { error: inquiryError } = await supabase.rpc('create_warehouse_inquiry', {
        p_warehouse_id: data.warehouseId,
        p_start_date: data.startDate.toISOString(),
        p_end_date: data.endDate.toISOString(),
        p_space_needed: data.spaceNeeded,
        p_message: data.message
      });

      if (inquiryError) throw inquiryError;
    } catch (err) {
      const appError = handleError(err, 'createInquiry');
      setError(appError);
      throw appError;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    createInquiry,
    inquiries,
    fetchInquiries,
    isLoading,
    error
  };
}