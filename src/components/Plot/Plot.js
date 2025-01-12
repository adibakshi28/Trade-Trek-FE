import React from 'react';
import './Plot.css';
import priceData from './price_data.json';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

function Plot() {
  // Parse and format data
  const parsedData = Array.isArray(priceData)
    ? priceData.map((data) => ({
        datetime: new Date(data.datetime),
        close: data.close || 0,
        volume: data.volume || 0,
      }))
    : [];

  const filteredData = parsedData;

  const stockLabels = filteredData.map((data) =>
    data.datetime.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  );
  const stockPrices = filteredData.map((data) => data.close);
  const stockVolumes = filteredData.map((data) => data.volume);

  const stockChartData = {
    labels: stockLabels,
    datasets: [
      {
        type: 'line',
        label: 'Close Price',
        data: stockPrices,
        borderColor: 'rgba(0, 204, 255, 1)',
        backgroundColor: 'rgba(0, 204, 255, 0.2)',
        borderWidth: 2,
        pointRadius: 0,
        tension: 0.4,
        fill: true,
        yAxisID: 'y',
      },
      {
        type: 'bar',
        label: 'Volume',
        data: stockVolumes,
        backgroundColor: 'rgba(255, 99, 132, 0.6)',
        borderWidth: 0,
        yAxisID: 'y1',
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    layout: {
      padding: {
        top: 0, // Remove extra padding at the top
        left: 0,
        right: 0,
        bottom: 0,
      },
    },
    plugins: {
      legend: {
        display: true,
        position: 'top',
        labels: {
          color: '#ffffff',
        },
      },
      tooltip: {
        backgroundColor: 'rgba(20, 20, 30, 0.9)',
        titleColor: '#ffffff',
        bodyColor: '#ffffff',
      },
      title: {
        display: true,
        text: 'Stock Price and Volume',
        color: '#ffffff',
        font: {
          size: 18,
          weight: 'bold',
        },
        padding: {
          top: 5, // Reduce padding between the title and the chart area
        },
      },
    },
    scales: {
      x: {
        grid: {
          color: 'rgba(255, 255, 255, 0.1)',
        },
        ticks: {
          color: '#cccccc',
          font: { size: 10 },
        },
      },
      y: {
        position: 'left',
        grid: {
          color: 'rgba(255, 255, 255, 0.1)',
        },
        ticks: {
          color: '#cccccc',
          font: { size: 12 },
          callback: function (value) {
            return `$${value}`;
          },
        },
        title: {
          display: true,
          text: 'Price ($)',
          color: '#ffffff',
          font: {
            size: 14,
            weight: 'bold',
          },
        },
      },
      y1: {
        position: 'right',
        grid: {
          drawOnChartArea: false,
        },
        ticks: {
          color: '#cccccc',
          font: { size: 12 },
        },
        title: {
          display: true,
          text: 'Volume',
          color: '#ffffff',
          font: {
            size: 14,
            weight: 'bold',
          },
        },
      },
    },
  };

  return (
    <div className="plot-container">
      <div className="price-chart-card">
        <Line data={stockChartData} options={options} style={{ width: '100%', height: '100%' }} />
      </div>
    </div>
  );
}

export default Plot;
