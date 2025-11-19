'use client';

import { columns } from './capacity-tables/columns';
import { CapacityTable } from './capacity-tables';
import { Capacity } from '@/types/capacity';
import { useEffect, useState } from 'react';
import { useQueryState, parseAsInteger, parseAsArrayOf, parseAsStringEnum } from 'nuqs';
import { DataTableSkeleton } from '@/components/ui/table/data-table-skeleton';

const wardTypeEnum = ['VIP', 'Normal', 'Emergency', 'ICU', 'Maternity', 'Pediatrics', 'Other'];

export default function CapacityListingPage() {
  const [capacities, setCapacities] = useState<Capacity[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  const [loading, setLoading] = useState(true);

  const [page] = useQueryState('page', parseAsInteger.withDefault(1));
  const [perPage] = useQueryState('perPage', parseAsInteger.withDefault(10));
  const [search] = useQueryState('search');
  const [wardType] = useQueryState('wardType', parseAsArrayOf(parseAsStringEnum(wardTypeEnum)).withDefault([]));

  const wardTypeStr = wardType.join(',');

  useEffect(() => {
    const fetchCapacities = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams({
          page: page.toString(),
          limit: perPage.toString(),
          ...(search && { search }),
          ...(wardTypeStr && { wardType: wardTypeStr })
        });

        const response = await fetch(`/api/capacity?${params}`);
        const data = await response.json();

        if (data.success) {
          setCapacities(data.data || []);
          setTotalItems(data.pagination?.total || 0);
        }
      } catch (error) {
        console.error('Failed to fetch capacities:', error);
        setCapacities([]);
        setTotalItems(0);
      } finally {
        setLoading(false);
      }
    };

    fetchCapacities();
  }, [page, perPage, search, wardTypeStr]);

  if (loading) {
    return <DataTableSkeleton columnCount={8} rowCount={10} filterCount={1} />;
  }

  return (
    <CapacityTable
      data={capacities}
      totalItems={totalItems}
      columns={columns}
    />
  );
}
