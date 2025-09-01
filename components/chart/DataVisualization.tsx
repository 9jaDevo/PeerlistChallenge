"use client";

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FadeIn, ScaleIn, SPRING } from "../motion/Primitives";
import { InteractiveChart, ChartType, ChartData, DataPoint } from "../chart/InteractiveChart";
import { useStore } from "../../lib/store";

// Sample datasets for different visualization types
const SAMPLE_DATASETS = {
  revenue: {
    title: "Monthly Revenue",
    data: [
      { label: "Jan", value: 45000, color: "#7C3AED" },
      { label: "Feb", value: 52000, color: "#06B6D4" },
      { label: "Mar", value: 48000, color: "#22C55E" },
      { label: "Apr", value: 61000, color: "#F59E0B" },
      { label: "May", value: 55000, color: "#EF4444" },
      { label: "Jun", value: 67000, color: "#8B5CF6" },
      { label: "Jul", value: 72000, color: "#10B981" },
      { label: "Aug", value: 69000, color: "#F97316" }
    ]
  },
  userEngagement: {
    title: "User Engagement by Platform",
    data: [
      { label: "Mobile App", value: 45, color: "#7C3AED" },
      { label: "Desktop Web", value: 30, color: "#06B6D4" },
      { label: "Tablet", value: 15, color: "#22C55E" },
      { label: "Smart TV", value: 10, color: "#F59E0B" }
    ],
    totalValue: 100
  },
  performance: {
    title: "Website Performance Metrics",
    data: [
      { label: "Load Time", value: 2.3, color: "#7C3AED" },
      { label: "FCP", value: 1.8, color: "#06B6D4" },
      { label: "LCP", value: 3.1, color: "#22C55E" },
      { label: "CLS", value: 0.05, color: "#F59E0B" },
      { label: "FID", value: 1.2, color: "#EF4444" },
      { label: "TTI", value: 4.2, color: "#8B5CF6" }
    ]
  },
  growth: {
    title: "User Growth Over Time",
    data: [
      { label: "Week 1", value: 1250, color: "#7C3AED" },
      { label: "Week 2", value: 1890, color: "#7C3AED" },
      { label: "Week 3", value: 2340, color: "#7C3AED" },
      { label: "Week 4", value: 3100, color: "#7C3AED" },
      { label: "Week 5", value: 4200, color: "#7C3AED" },
      { label: "Week 6", value: 5650, color: "#7C3AED" },
      { label: "Week 7", value: 7200, color: "#7C3AED" },
      { label: "Week 8", value: 8900, color: "#7C3AED" }
    ]
  }
};

interface DataVisualizationProps {
  className?: string;
}

export function DataVisualization({ className = "" }: DataVisualizationProps) {
  const { preferences, markDayComplete } = useStore();
  
  // Chart configuration state
  const [selectedDataset, setSelectedDataset] = useState<keyof typeof SAMPLE_DATASETS>('revenue');
  const [selectedChartType, setSelectedChartType] = useState<ChartType>('bar');
  const [realTimeEnabled, setRealTimeEnabled] = useState(false);
  const [animationsEnabled, setAnimationsEnabled] = useState(true);
  const [showGrid, setShowGrid] = useState(true);
  const [showLabels, setShowLabels] = useState(true);
  
  // Real-time data simulation
  const [realTimeData, setRealTimeData] = useState<ChartData | null>(null);
  
  // Get current dataset
  const currentDataset = useMemo(() => {
    return realTimeEnabled && realTimeData ? realTimeData : SAMPLE_DATASETS[selectedDataset];
  }, [selectedDataset, realTimeEnabled, realTimeData]);

  // Chart type options
  const chartTypeOptions: { value: ChartType; label: string; description: string }[] = [
    { value: 'bar', label: 'Bar Chart', description: 'Compare values across categories' },
    { value: 'line', label: 'Line Chart', description: 'Show trends over time' },
    { value: 'area', label: 'Area Chart', description: 'Visualize volume over time' },
    { value: 'doughnut', label: 'Doughnut Chart', description: 'Show proportional data' }
  ];

  // Dataset options
  const datasetOptions = [
    { value: 'revenue', label: 'Revenue', description: 'Monthly financial data', icon: '💰' },
    { value: 'userEngagement', label: 'Engagement', description: 'Platform usage statistics', icon: '📊' },
    { value: 'performance', label: 'Performance', description: 'Website metrics', icon: '⚡' },
    { value: 'growth', label: 'Growth', description: 'User acquisition trends', icon: '📈' }
  ] as const;

  // Simulate real-time data updates
  useEffect(() => {
    if (!realTimeEnabled) return;

    const interval = setInterval(() => {
      const baseDataset = SAMPLE_DATASETS[selectedDataset];
      const updatedData = {
        ...baseDataset,
        data: baseDataset.data.map(point => ({
          ...point,
          value: Math.max(0, point.value + (Math.random() - 0.5) * (point.value * 0.1))
        }))
      };
      
      setRealTimeData(updatedData);
    }, 2000);

    return () => clearInterval(interval);
  }, [realTimeEnabled, selectedDataset]);

  // Handle data point clicks
  const handleDataPointClick = (point: DataPoint, index: number) => {
    console.log('Data point clicked:', point, index);
    // Could trigger detailed views, tooltips, etc.
  };

  // Handle chart type change
  const handleChartTypeChange = (type: ChartType) => {
    setSelectedChartType(type);
    // Some chart types work better with certain datasets
    if (type === 'doughnut' && selectedDataset !== 'userEngagement') {
      setSelectedDataset('userEngagement');
    } else if ((type === 'line' || type === 'area') && !['revenue', 'growth', 'performance'].includes(selectedDataset)) {
      setSelectedDataset('revenue');
    }
  };

  return (
    <div className={`max-w-6xl mx-auto ${className}`}>
      <FadeIn className="text-center mb-12">
        <div className="inline-flex items-center gap-2 bg-brand/10 text-brand px-4 py-2 rounded-full text-sm font-medium mb-6">
          📊 Day 5
        </div>
        <h1 className="text-4xl font-bold text-white mb-4">
          Interactive Data Visualization
        </h1>
        <p className="text-xl text-gray-400 mb-8 max-w-2xl mx-auto">
          Explore dynamic charts with real-time updates, smooth animations, and interactive features.
          Click data points, switch chart types, and enable live data streaming.
        </p>
      </FadeIn>

      {/* Controls Panel */}
      <ScaleIn delay={0.2} className="bg-surface/10 rounded-xl border border-white/10 p-6 mb-8">
        <h2 className="text-lg font-semibold text-white mb-6">Chart Configuration</h2>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Dataset Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-3">
              Data Source
            </label>
            <div className="grid grid-cols-2 gap-3">
              {datasetOptions.map((option) => (
                <motion.button
                  key={option.value}
                  onClick={() => setSelectedDataset(option.value)}
                  className={`
                    p-3 rounded-lg border text-left transition-all duration-200
                    ${selectedDataset === option.value
                      ? 'border-brand bg-brand/10 text-white'
                      : 'border-white/10 text-gray-400 hover:border-white/20 hover:text-white'
                    }
                  `}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-lg">{option.icon}</span>
                    <span className="font-medium text-sm">{option.label}</span>
                  </div>
                  <p className="text-xs opacity-70">{option.description}</p>
                </motion.button>
              ))}
            </div>
          </div>

          {/* Chart Type Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-3">
              Chart Type
            </label>
            <div className="grid grid-cols-2 gap-3">
              {chartTypeOptions.map((option) => (
                <motion.button
                  key={option.value}
                  onClick={() => handleChartTypeChange(option.value)}
                  className={`
                    p-3 rounded-lg border text-left transition-all duration-200
                    ${selectedChartType === option.value
                      ? 'border-brand bg-brand/10 text-white'
                      : 'border-white/10 text-gray-400 hover:border-white/20 hover:text-white'
                    }
                  `}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="font-medium text-sm mb-1">{option.label}</div>
                  <p className="text-xs opacity-70">{option.description}</p>
                </motion.button>
              ))}
            </div>
          </div>
        </div>

        {/* Options Row */}
        <div className="flex flex-wrap gap-6 mt-6 pt-6 border-t border-white/10">
          <motion.label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={realTimeEnabled}
              onChange={(e) => setRealTimeEnabled(e.target.checked)}
              className="sr-only"
            />
            <motion.div
              className={`
                w-6 h-6 rounded border-2 flex items-center justify-center
                ${realTimeEnabled ? 'border-brand bg-brand' : 'border-gray-600'}
              `}
              whileTap={{ scale: 0.9 }}
            >
              {realTimeEnabled && (
                <motion.svg
                  className="w-3 h-3 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </motion.svg>
              )}
            </motion.div>
            <span className="text-sm text-gray-300">Real-time updates</span>
          </motion.label>

          <motion.label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={animationsEnabled}
              onChange={(e) => setAnimationsEnabled(e.target.checked)}
              className="sr-only"
            />
            <motion.div
              className={`
                w-6 h-6 rounded border-2 flex items-center justify-center
                ${animationsEnabled ? 'border-brand bg-brand' : 'border-gray-600'}
              `}
              whileTap={{ scale: 0.9 }}
            >
              {animationsEnabled && (
                <motion.svg
                  className="w-3 h-3 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </motion.svg>
              )}
            </motion.div>
            <span className="text-sm text-gray-300">Animations</span>
          </motion.label>

          <motion.label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={showGrid}
              onChange={(e) => setShowGrid(e.target.checked)}
              className="sr-only"
            />
            <motion.div
              className={`
                w-6 h-6 rounded border-2 flex items-center justify-center
                ${showGrid ? 'border-brand bg-brand' : 'border-gray-600'}
              `}
              whileTap={{ scale: 0.9 }}
            >
              {showGrid && (
                <motion.svg
                  className="w-3 h-3 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </motion.svg>
              )}
            </motion.div>
            <span className="text-sm text-gray-300">Show grid</span>
          </motion.label>

          <motion.label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={showLabels}
              onChange={(e) => setShowLabels(e.target.checked)}
              className="sr-only"
            />
            <motion.div
              className={`
                w-6 h-6 rounded border-2 flex items-center justify-center
                ${showLabels ? 'border-brand bg-brand' : 'border-gray-600'}
              `}
              whileTap={{ scale: 0.9 }}
            >
              {showLabels && (
                <motion.svg
                  className="w-3 h-3 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </motion.svg>
              )}
            </motion.div>
            <span className="text-sm text-gray-300">Show labels</span>
          </motion.label>
        </div>
      </ScaleIn>

      {/* Main Chart */}
      <ScaleIn delay={0.4}>
        <InteractiveChart
          type={selectedChartType}
          data={currentDataset}
          animated={animationsEnabled}
          realTime={realTimeEnabled}
          interactive={true}
          showGrid={showGrid}
          showLabels={showLabels}
          height={400}
          onDataPointClick={handleDataPointClick}
          className="mb-8"
        />
      </ScaleIn>

      {/* Stats and Insights */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <ScaleIn delay={0.6} className="bg-surface/10 rounded-lg border border-white/10 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-brand/20 rounded-lg flex items-center justify-center">
              <span className="text-brand font-bold">Σ</span>
            </div>
            <div>
              <h3 className="text-white font-medium">Total Value</h3>
              <p className="text-gray-400 text-sm">Sum of all data points</p>
            </div>
          </div>
          <div className="text-2xl font-bold text-white">
            {(('totalValue' in currentDataset ? currentDataset.totalValue : null) || currentDataset.data.reduce((sum, point) => sum + point.value, 0)).toLocaleString()}
          </div>
        </ScaleIn>

        <ScaleIn delay={0.7} className="bg-surface/10 rounded-lg border border-white/10 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-ok/20 rounded-lg flex items-center justify-center">
              <span className="text-ok font-bold">↑</span>
            </div>
            <div>
              <h3 className="text-white font-medium">Highest Point</h3>
              <p className="text-gray-400 text-sm">Maximum value</p>
            </div>
          </div>
          <div className="text-2xl font-bold text-white">
            {Math.max(...currentDataset.data.map(d => d.value)).toLocaleString()}
          </div>
        </ScaleIn>

        <ScaleIn delay={0.8} className="bg-surface/10 rounded-lg border border-white/10 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-warning/20 rounded-lg flex items-center justify-center">
              <span className="text-warning font-bold">≈</span>
            </div>
            <div>
              <h3 className="text-white font-medium">Average</h3>
              <p className="text-gray-400 text-sm">Mean value</p>
            </div>
          </div>
          <div className="text-2xl font-bold text-white">
            {Math.round(currentDataset.data.reduce((sum, point) => sum + point.value, 0) / currentDataset.data.length).toLocaleString()}
          </div>
        </ScaleIn>
      </div>

      {/* Instructions */}
      <ScaleIn delay={1.0} className="text-center">
        <div className="bg-brand/5 border border-brand/20 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-white mb-4">How to Interact</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-400">
            <div>
              • <strong className="text-white">Click data points</strong> to select and view details
            </div>
            <div>
              • <strong className="text-white">Hover elements</strong> for tooltips and highlights
            </div>
            <div>
              • <strong className="text-white">Switch datasets</strong> to explore different data
            </div>
            <div>
              • <strong className="text-white">Toggle real-time</strong> for live data simulation
            </div>
          </div>
        </div>
      </ScaleIn>
    </div>
  );
}