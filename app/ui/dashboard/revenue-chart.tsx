'use client';

import { Bar } from 'react-chartjs-2';
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  BarElement, 
  Title, 
  Tooltip, 
  Legend, 
  ChartData, 
  ChartOptions,
  TooltipItem,
} from 'chart.js';
import { CalendarIcon } from '@heroicons/react/24/outline';
import { lusitana } from '@/app/ui/fonts';
import { Revenue } from '@/app/lib/definitions';
import { useState, useEffect } from 'react';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export default function RevenueChart() {
  const [revenue, setRevenue] = useState<Revenue[]>([]);

  useEffect(() => {
    const fetchRevenue = async () => {
      try {
        const response = await fetch('/api/revenue');
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const data: Revenue[] = await response.json();
        setRevenue(data);
      } catch (error) {
        console.error('Error fetching revenue:', error);
        setRevenue([]);
      }
    };

    fetchRevenue();
  }, []);

  // Prepare data for Chart.js
  const chartData: ChartData<'bar'> = {
    labels: revenue.map((month) => month.month),
    datasets: [
      {
        label: 'Revenue',
        data: revenue.map((month) => month.revenue),
        backgroundColor: 'rgba(54, 162, 235, 0.6)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 1,
      },
    ],
  };

  const chartOptions: ChartOptions<'bar'> = {
    responsive: true,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: (context: TooltipItem<'bar'>) => {
            const revenue = context.raw as number;
            return ` - $${revenue.toLocaleString()}`;
          },
        },
        bodyFont: {
          family: 'Lusitana',
        },
      },
      title: {
        display: true,
        text: 'Last 12 Months',
        font: {
          size: 14,
          weight: 400,
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: (value) => `$${value.toLocaleString()}`,
          font: {
            family: 'Lusitana',
          },
        },
      },
    },
    maintainAspectRatio: false,
  };

  return (
    <div className="w-full md:col-span-4">
      <h2 className={`${lusitana.className} mb-4 text-xl md:text-2xl`}>
        Recent Revenue
      </h2>
      <div className="rounded-xl bg-gray-50 p-4 h-[468px]">
        <Bar data={chartData} options={chartOptions} />
      </div>
    </div>
  );
}
