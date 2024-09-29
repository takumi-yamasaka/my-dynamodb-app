import React from 'react';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import { TemperatureHumidityData } from '../services/apiService';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

interface EnvironmentChartProps {
  data: TemperatureHumidityData[];
}

const EnvironmentChart: React.FC<EnvironmentChartProps> = ({ data }) => {
  if (!data || data.length === 0) {
    return <div>データがありません</div>;
  }

  const chartData = {
    labels: data.map(item => new Date(item.timestamp).toLocaleString()),
    datasets: [
      {
        label: '温度 (°C)',
        data: data.map(item => item.temperature),
        borderColor: 'rgb(255, 99, 132)',
        backgroundColor: 'rgba(255, 99, 132, 0.5)',
      },
      {
        label: '湿度 (%)',
        data: data.map(item => item.humidity),
        borderColor: 'rgb(53, 162, 235)',
        backgroundColor: 'rgba(53, 162, 235, 0.5)',
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: '温度と湿度の変化',
      },
    },
  };

  return <Line options={options} data={chartData} />;
};

export default EnvironmentChart;