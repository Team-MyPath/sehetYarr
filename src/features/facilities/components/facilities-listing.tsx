'use client';

import { columns } from './facilities-tables/columns';
import { FacilityTable } from './facilities-tables';
import { Facility } from '@/types/facility';
import { useEffect, useState } from 'react';
import { useQueryState, parseAsInteger, parseAsArrayOf, parseAsStringEnum } from 'nuqs';
import { DataTableSkeleton } from '@/components/ui/table/data-table-skeleton';

const categoryEnum = ['Equipment', 'Medication', 'Facility'];
const statusEnum = ['Operational', 'Out of Service', 'Under Maintenance'];

export default function FacilitiesListingPage() {
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  const [loading, setLoading] = useState(true);

  const [page] = useQueryState('page', parseAsInteger.withDefault(1));
  const [perPage] = useQueryState('perPage', parseAsInteger.withDefault(10));
  const [search] = useQueryState('search');
  const [category] = useQueryState('category', parseAsArrayOf(parseAsStringEnum(categoryEnum)).withDefault([]));
  const [status] = useQueryState('status', parseAsArrayOf(parseAsStringEnum(statusEnum)).withDefault([]));

  const categoryStr = category.join(',');
  const statusStr = status.join(',');

  useEffect(() => {
    const fetchFacilities = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams({
          page: page.toString(),
          limit: perPage.toString(),
          ...(search && { search }),
          ...(categoryStr && { category: categoryStr }),
          ...(statusStr && { status: statusStr })
        });

        const response = await fetch(`/api/facilities?${params}`);
        const data = await response.json();

        if (data.success) {
          setFacilities(data.data || []);
          setTotalItems(data.pagination?.total || 0);
        }
      } catch (error) {
        console.error('Failed to fetch facilities:', error);
        setFacilities([]);
        setTotalItems(0);
      } finally {
        setLoading(false);
      }
    };

    fetchFacilities();
  }, [page, perPage, search, categoryStr, statusStr]);

  if (loading) {
    return <DataTableSkeleton columnCount={7} rowCount={10} filterCount={2} />;
  }

  return (
    <FacilityTable
      data={facilities}
      totalItems={totalItems}
      columns={columns}
    />
  );
}
