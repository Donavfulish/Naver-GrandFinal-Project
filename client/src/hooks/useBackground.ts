import { useState, useEffect } from 'react';
import { Background } from '../types/background'; 
import { BASE_URL } from '@/lib/constants';

const API_ENDPOINT = 'http://localhost:5000/spaces/backgrounds';

let backgroundsCache: Background[] | null = null;
let cacheError: string | null = null;

const useBackgroundsData = (): {
  data: Background[];
  isLoading: boolean;
  error: string | null;
} => {
  const [data, setData] = useState<Background[]>(backgroundsCache || []);
  const [isLoading, setIsLoading] = useState(!backgroundsCache && !cacheError);
  const [error, setError] = useState<string | null>(cacheError);

  useEffect(() => {
    if (backgroundsCache !== null || cacheError !== null) {
      setIsLoading(false);
      return;
    }
    
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(`${BASE_URL}/spaces/background`);

        if (!response.ok) {
          const errorMessage = `Lỗi HTTP: ${response.status} ${response.statusText}`;
          throw new Error(errorMessage);
        }

        const json = await response.json();

        if (json.success) {
          const fetchedData: Background[] = json.data;
          backgroundsCache = fetchedData;
          setData(fetchedData);
          cacheError = null; 
        } else {
          const errorMessage = "Lỗi fetch dữ liệu: Thuộc tính 'success' là false.";
          throw new Error(errorMessage);
        }

      } catch (err: any) {
        console.error("Fetch backgrounds error:", err);
        const errorMessage = err.message || "Đã xảy ra lỗi không xác định.";
        cacheError = errorMessage;
        setError(errorMessage);
        setData([]); 
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  return { data, isLoading, error };
};

export default useBackgroundsData;