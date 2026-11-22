'use client';
import { useCommerce } from '@/contexts/CommerceContext';
import { useApiData } from '@/hooks/useApiData';
import { getTransactions } from '@/lib/api/transactions';

// Las transacciones del comercio, del backend, de la más reciente a la más antigua.
export function useTransactions() {
    const { commerce } = useCommerce();
    const { data: transactions, loading } = useApiData(`transactions:${commerce.id}`, () => getTransactions(commerce.id));

    return { transactions, loading };
}
