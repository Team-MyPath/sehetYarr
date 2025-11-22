'use client';

import * as React from 'react';
import { Bar, BarChart, CartesianGrid, XAxis } from 'recharts';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent
} from '@/components/ui/chart';
import { useI18n } from '@/providers/i18n-provider';

export const description = 'Healthcare registrations over time';

interface BarGraphProps {
  data?: Array<{ date: string; patients: number; doctors: number }>;
  role?: string;
}

const chartConfig = {
  registrations: {
    label: 'Registrations'
  },
  patients: {
    label: 'Patients',
    color: 'var(--primary)'
  },
  doctors: {
    label: 'Doctors',
    color: 'hsl(var(--primary) / 0.7)'
  }
} satisfies ChartConfig;

export function BarGraph({ data = [], role = 'guest' }: BarGraphProps) {
  const { t, language } = useI18n();
  const chartData = data.length > 0 ? data : [];
  const [activeChart, setActiveChart] =
    React.useState<keyof typeof chartConfig>('patients');

  const getTitle = () => {
    switch (role) {
      case 'hospital':
        return t('common.facility_registrations');
      case 'doctor':
        return t('common.patient_growth');
      default:
        return t('common.healthcare_registrations');
    }
  };

  const getDescription = () => {
    switch (role) {
      case 'hospital':
        return 'New registrations at your facility for the last 3 months';
      case 'doctor':
        return 'New patients under your care for the last 3 months';
      default:
        return t('common.new_registrations_desc');
    }
  };

  const total = React.useMemo(
    () => ({
      patients: chartData.reduce((acc, curr) => acc + curr.patients, 0),
      doctors: chartData.reduce((acc, curr) => acc + curr.doctors, 0)
    }),
    [chartData]
  );

  const [isClient, setIsClient] = React.useState(false);

  React.useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return null;
  }

  if (chartData.length === 0) {
    return (
      <Card className='@container/card !pt-3'>
        <CardHeader>
          <CardTitle>{getTitle()}</CardTitle>
          <CardDescription>{t('common.no_registration_data')}</CardDescription>
        </CardHeader>
        <CardContent className='flex items-center justify-center h-[250px]'>
          <p className='text-muted-foreground text-sm'>{t('common.no_data_display')}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className='@container/card !pt-3'>
      <CardHeader className='flex flex-col items-stretch space-y-0 border-b !p-0 sm:flex-row'>
        <div className='flex flex-1 flex-col justify-center gap-1 px-6 !py-0'>
          <CardTitle>{getTitle()}</CardTitle>
          <CardDescription>
            <span className='hidden @[540px]/card:block'>
              {getDescription()}
            </span>
            <span className='@[540px]/card:hidden'>{t('common.last_3_months')}</span>
          </CardDescription>
        </div>
        <div className='flex'>
          {['patients', 'doctors'].map((key) => {
            const chart = key as keyof typeof chartConfig;
            return (
              <button
                key={chart}
                data-active={activeChart === chart}
                className='data-[active=true]:bg-primary/5 hover:bg-primary/5 relative flex flex-1 flex-col justify-center gap-1 border-t px-6 py-4 text-left transition-colors duration-200 even:border-l sm:border-t-0 sm:border-l sm:px-8 sm:py-6'
                onClick={() => setActiveChart(chart)}
              >
                <span className='text-muted-foreground text-xs'>
                  {t(`common.${key}`)}
                </span>
                <span className='text-lg leading-none font-bold sm:text-3xl'>
                  {total[key as keyof typeof total]?.toLocaleString()}
                </span>
              </button>
            );
          })}
        </div>
      </CardHeader>
      <CardContent className='px-2 pt-4 sm:px-6 sm:pt-6'>
        <ChartContainer
          config={chartConfig}
          className='aspect-auto h-[250px] w-full'
        >
          <BarChart
            data={chartData}
            margin={{
              left: 12,
              right: 12
            }}
          >
            <defs>
              <linearGradient id='fillBar' x1='0' y1='0' x2='0' y2='1'>
                <stop
                  offset='0%'
                  stopColor='var(--primary)'
                  stopOpacity={0.8}
                />
                <stop
                  offset='100%'
                  stopColor='var(--primary)'
                  stopOpacity={0.2}
                />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey='date'
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={32}
              tickFormatter={(value) => {
                const date = new Date(value);
                return date.toLocaleDateString(language, {
                  month: 'short',
                  day: 'numeric'
                });
              }}
            />
            <ChartTooltip
              cursor={{ fill: 'var(--primary)', opacity: 0.1 }}
              content={
                <ChartTooltipContent
                  className='w-[150px]'
                  nameKey='registrations'
                  labelFormatter={(value) => {
                    return new Date(value).toLocaleDateString(language, {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric'
                    });
                  }}
                />
              }
            />
            <Bar
              dataKey={activeChart}
              fill='url(#fillBar)'
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
