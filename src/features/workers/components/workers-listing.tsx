'use client';

import { columns } from './workers-tables/columns';
import { WorkerTable } from './workers-tables';
import { Worker } from '@/types/worker';
import { useEffect, useState } from 'react';
import { useQueryState, parseAsInteger, parseAsArrayOf, parseAsStringEnum } from 'nuqs';
import { DataTableSkeleton } from '@/components/ui/table/data-table-skeleton';

const designationEnum = ['Nurse', 'Paramedic', 'Technician', 'Other'];

export default function WorkersListingPage() {
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  const [loading, setLoading] = useState(true);

  const [page] = useQueryState('page', parseAsInteger.withDefault(1));
  const [perPage] = useQueryState('perPage', parseAsInteger.withDefault(10));
  const [search] = useQueryState('search');
  const [designation] = useQueryState('designation', parseAsArrayOf(parseAsStringEnum(designationEnum)).withDefault([]));

  const designationStr = designation.join(',');

  useEffect(() => {
    const fetchWorkers = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams({
          page: page.toString(),
          limit: perPage.toString(),
          ...(search && { search }),
          ...(designationStr && { designation: designationStr })
        });

        const response = await fetch(`/api/workers?${params}`);
        const data = await response.json();

        if (data.success) {
          setWorkers(data.data || []);
          setTotalItems(data.pagination?.total || 0);
        }
      } catch (error) {
        console.error('Failed to fetch workers:', error);
        setWorkers([]);
        setTotalItems(0);
      } finally {
        setLoading(false);
      }
    };

    fetchWorkers();
  }, [page, perPage, search, designationStr]);

  if (loading) {
    return <DataTableSkeleton columnCount={8} rowCount={10} filterCount={1} />;
  }

  return (
    <WorkerTable
      data={workers}
      totalItems={totalItems}
      columns={columns}
    />
  );
}
