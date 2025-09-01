"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence, useSpring } from "framer-motion";
import { SPRING, DURATIONS, FadeIn, ScaleIn } from "../motion/Primitives";
import { useStore } from "../../lib/store";
import { 
  ARIA_LABELS, 
  ScreenReader, 
  handleKeyboardNavigation 
} from "../../lib/a11y";

// Chart types
export type ChartType = 'bar' | 'line' | 'doughnut' | 'area';
export type DataPoint = {
  label: string;
  value: number;
  color?: string;
};

export type ChartData = {
  title: string;
  data: DataPoint[];
  totalValue?: number;
};

interface InteractiveChartProps {
  type?: ChartType;
  data: ChartData;
  animated?: boolean;
  realTime?: boolean;
  interactive?: boolean;
  showGrid?: boolean;
  showLabels?: boolean;
  height?: number;
  className?: string;
  onDataPointClick?: (point: DataPoint, index: number) => void;
}

export function InteractiveChart({
  type = 'bar',
  data,
  animated = true,
  realTime = false,
  interactive = true,
  showGrid = true,
  showLabels = true,
  height = 300,
  className = "",
  onDataPointClick
}: InteractiveChartProps) {
  const { markDayComplete, preferences } = useStore();
  
  // Chart state
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [animationProgress, setAnimationProgress] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  
  // Animation refs
  const chartRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number | null>(null);

  // Calculate chart dimensions and scales
  const maxValue = Math.max(...data.data.map(d => d.value), 1);
  const chartPadding = 40;
  const chartWidth = 400;
  const chartHeight = height - chartPadding * 2;

  // Default colors for data points
  const defaultColors = [
    '#7C3AED', '#06B6D4', '#22C55E', '#F59E0B', 
    '#EF4444', '#8B5CF6', '#10B981', '#F97316'
  ];

  // Animate chart entrance
  useEffect(() => {
    if (animated) {
      setIsAnimating(true);
      const startTime = Date.now();
      const duration = 1500;

      const animate = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Eased animation curve
        const easeProgress = 1 - Math.pow(1 - progress, 3);
        setAnimationProgress(easeProgress);

        if (progress < 1) {
          animationRef.current = requestAnimationFrame(animate);
        } else {
          setIsAnimating(false);
          // Mark completion when animation finishes
          markDayComplete(5);
        }
      };

      animationRef.current = requestAnimationFrame(animate);

      return () => {
        if (animationRef.current) {
          cancelAnimationFrame(animationRef.current);
        }
      };
    } else {
      setAnimationProgress(1);
    }
  }, [animated, markDayComplete]);

  // Real-time data updates (demo)
  useEffect(() => {
    if (realTime && !isAnimating) {
      const interval = setInterval(() => {
        // This would normally update the data prop from parent
        ScreenReader.announce('Chart data updated', 'polite');
      }, 3000);

      return () => clearInterval(interval);
    }
  }, [realTime, isAnimating]);

  // Handle data point interaction
  const handleDataPointClick = useCallback((point: DataPoint, index: number) => {
    if (!interactive) return;

    setSelectedIndex(selectedIndex === index ? null : index);
    onDataPointClick?.(point, index);
    
    ScreenReader.announce(
      `Selected ${point.label}: ${point.value}`, 
      'polite'
    );
  }, [interactive, selectedIndex, onDataPointClick]);

  // Handle keyboard navigation
  const handleKeyDown = useCallback((e: React.KeyboardEvent, index: number) => {
    if (!interactive) return;

    handleKeyboardNavigation(e, {
      onEnter: () => handleDataPointClick(data.data[index], index),
      onSpace: () => handleDataPointClick(data.data[index], index),
      preventDefault: ['Enter', 'Space'].includes(e.key)
    });
  }, [interactive, handleDataPointClick, data.data]);

  // Render different chart types
  const renderBarChart = () => {
    const barWidth = Math.min(60, (chartWidth - 40) / data.data.length);
    const barSpacing = (chartWidth - data.data.length * barWidth) / (data.data.length + 1);

    return (
      <div className="relative" style={{ height: chartHeight, width: chartWidth }}>
        {/* Grid lines */}
        {showGrid && (
          <div className="absolute inset-0">
            {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => (
              <div
                key={i}
                className="absolute w-full border-t border-gray-700 opacity-30"
                style={{ bottom: `${ratio * 100}%` }}
              />
            ))}
          </div>
        )}

        {/* Bars */}
        <div className="absolute inset-0 flex items-end">
          {data.data.map((point, index) => {
            const barHeight = (point.value / maxValue) * chartHeight * animationProgress;
            const color = point.color || defaultColors[index % defaultColors.length];
            const isHovered = hoveredIndex === index;
            const isSelected = selectedIndex === index;

            return (
              <motion.div
                key={`${point.label}-${index}`}
                className="flex flex-col items-center cursor-pointer"
                style={{
                  width: barWidth,
                  marginLeft: index === 0 ? barSpacing : barSpacing / 2,
                  marginRight: index === data.data.length - 1 ? barSpacing : barSpacing / 2
                }}
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
                onClick={() => handleDataPointClick(point, index)}
                onKeyDown={(e) => handleKeyDown(e, index)}
                tabIndex={interactive ? 0 : -1}
                role={interactive ? "button" : "presentation"}
                aria-label={`${point.label}: ${point.value}`}
                whileHover={interactive ? { scale: 1.05 } : {}}
                whileTap={interactive ? { scale: 0.95 } : {}}
              >
                {/* Bar */}
                <motion.div
                  className={`
                    w-full rounded-t-lg transition-all duration-200
                    ${interactive ? 'focus:outline-none focus:ring-2 focus:ring-brand' : ''}
                    ${isSelected ? 'ring-2 ring-brand' : ''}
                  `}
                  style={{
                    height: barHeight,
                    backgroundColor: color,
                    boxShadow: isHovered 
                      ? `0 4px 20px ${color}40` 
                      : `0 2px 10px ${color}20`
                  }}
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ 
                    height: barHeight, 
                    opacity: 1,
                    filter: isHovered ? 'brightness(1.2)' : 'brightness(1)'
                  }}
                  transition={{ 
                    duration: animated ? 0.8 : 0,
                    delay: animated ? index * 0.1 : 0,
                    ease: "easeOut"
                  }}
                />

                {/* Value label */}
                <AnimatePresence>
                  {(isHovered || isSelected) && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: -10 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute -top-8 bg-surface text-white text-xs px-2 py-1 rounded shadow-lg"
                      style={{ zIndex: 10 }}
                    >
                      {point.value}
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Label */}
                {showLabels && (
                  <div className="mt-2 text-xs text-gray-400 text-center max-w-full truncate">
                    {point.label}
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>

        {/* Y-axis labels */}
        {showLabels && (
          <div className="absolute -left-8 inset-y-0 flex flex-col justify-between text-xs text-gray-500">
            {[maxValue, maxValue * 0.75, maxValue * 0.5, maxValue * 0.25, 0].map((value, i) => (
              <span key={i} className="text-right">
                {Math.round(value)}
              </span>
            ))}
          </div>
        )}
      </div>
    );
  };

  const renderDoughnutChart = () => {
    const centerX = chartWidth / 2;
    const centerY = chartHeight / 2;
    const radius = Math.min(centerX, centerY) - 20;
    const innerRadius = radius * 0.6;
    
    const total = data.data.reduce((sum, point) => sum + point.value, 0);
    let cumulativeAngle = 0;

    return (
      <div className="relative flex items-center justify-center" style={{ height: chartHeight, width: chartWidth }}>
        <svg width={chartWidth} height={chartHeight} className="transform -rotate-90">
          {data.data.map((point, index) => {
            const angle = (point.value / total) * 360 * animationProgress;
            const color = point.color || defaultColors[index % defaultColors.length];
            const isHovered = hoveredIndex === index;
            const isSelected = selectedIndex === index;
            
            const startAngle = cumulativeAngle;
            const endAngle = cumulativeAngle + angle;
            cumulativeAngle += angle;

            // Calculate arc path
            const startAngleRad = (startAngle * Math.PI) / 180;
            const endAngleRad = (endAngle * Math.PI) / 180;
            
            const largeArcFlag = angle > 180 ? 1 : 0;
            
            const outerStartX = centerX + radius * Math.cos(startAngleRad);
            const outerStartY = centerY + radius * Math.sin(startAngleRad);
            const outerEndX = centerX + radius * Math.cos(endAngleRad);
            const outerEndY = centerY + radius * Math.sin(endAngleRad);
            
            const innerStartX = centerX + innerRadius * Math.cos(startAngleRad);
            const innerStartY = centerY + innerRadius * Math.sin(startAngleRad);
            const innerEndX = centerX + innerRadius * Math.cos(endAngleRad);
            const innerEndY = centerY + innerRadius * Math.sin(endAngleRad);
            
            const pathData = [
              `M ${outerStartX} ${outerStartY}`,
              `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${outerEndX} ${outerEndY}`,
              `L ${innerEndX} ${innerEndY}`,
              `A ${innerRadius} ${innerRadius} 0 ${largeArcFlag} 0 ${innerStartX} ${innerStartY}`,
              'Z'
            ].join(' ');

            return (
              <motion.path
                key={`${point.label}-${index}`}
                d={pathData}
                fill={color}
                stroke={isSelected ? '#7C3AED' : 'transparent'}
                strokeWidth={isSelected ? 3 : 0}
                className={`transition-all duration-200 ${interactive ? 'cursor-pointer' : ''}`}
                style={{
                  filter: isHovered ? 'brightness(1.2)' : 'brightness(1)'
                }}
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
                onClick={() => handleDataPointClick(point, index)}
                tabIndex={interactive ? 0 : -1}
                role={interactive ? "button" : "presentation"}
                aria-label={`${point.label}: ${point.value} (${((point.value / total) * 100).toFixed(1)}%)`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              />
            );
          })}
        </svg>

        {/* Center value */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <div className="text-2xl font-bold text-white">
            {data.totalValue || total}
          </div>
          <div className="text-sm text-gray-400">Total</div>
        </div>

        {/* Legend */}
        <div className="absolute -right-40 top-0 space-y-2">
          {data.data.map((point, index) => {
            const color = point.color || defaultColors[index % defaultColors.length];
            const percentage = ((point.value / total) * 100).toFixed(1);
            const isHovered = hoveredIndex === index;

            return (
              <motion.div
                key={index}
                className={`
                  flex items-center gap-2 text-sm cursor-pointer p-2 rounded
                  ${isHovered ? 'bg-surface/20' : ''}
                `}
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
                onClick={() => handleDataPointClick(point, index)}
                whileHover={{ scale: 1.02 }}
              >
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: color }}
                />
                <span className="text-gray-300">{point.label}</span>
                <span className="text-gray-500 text-xs">({percentage}%)</span>
              </motion.div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderLineChart = () => {
    const pointSpacing = (chartWidth - 40) / (data.data.length - 1);
    const points = data.data.map((point, index) => ({
      x: 20 + index * pointSpacing,
      y: chartHeight - ((point.value / maxValue) * chartHeight * animationProgress),
      ...point
    }));

    // Create path string for the line
    const pathString = points
      .map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`)
      .join(' ');

    return (
      <div className="relative" style={{ height: chartHeight, width: chartWidth }}>
        {/* Grid */}
        {showGrid && (
          <svg className="absolute inset-0" width={chartWidth} height={chartHeight}>
            {/* Horizontal grid lines */}
            {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => (
              <line
                key={`h-${i}`}
                x1="0"
                y1={chartHeight * (1 - ratio)}
                x2={chartWidth}
                y2={chartHeight * (1 - ratio)}
                stroke="#374151"
                strokeWidth="1"
                opacity="0.3"
              />
            ))}
            {/* Vertical grid lines */}
            {points.map((point, i) => (
              <line
                key={`v-${i}`}
                x1={point.x}
                y1="0"
                x2={point.x}
                y2={chartHeight}
                stroke="#374151"
                strokeWidth="1"
                opacity="0.2"
              />
            ))}
          </svg>
        )}

        {/* Line and area */}
        <svg className="absolute inset-0" width={chartWidth} height={chartHeight}>
          {/* Area fill */}
          {type === 'area' && (
            <motion.path
              d={`${pathString} L ${points[points.length - 1].x} ${chartHeight} L ${points[0].x} ${chartHeight} Z`}
              fill="url(#areaGradient)"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 0.3 }}
              transition={{ duration: 1.2, ease: "easeOut" }}
            />
          )}
          
          {/* Line */}
          <motion.path
            d={pathString}
            stroke="#7C3AED"
            strokeWidth="3"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 1.2, ease: "easeOut" }}
          />

          {/* Gradient definition for area */}
          <defs>
            <linearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#7C3AED" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#7C3AED" stopOpacity="0.05" />
            </linearGradient>
          </defs>
        </svg>

        {/* Data points */}
        {points.map((point, index) => {
          const isHovered = hoveredIndex === index;
          const isSelected = selectedIndex === index;

          return (
            <motion.div
              key={`${point.label}-${index}`}
              className={`
                absolute w-3 h-3 bg-brand rounded-full border-2 border-white cursor-pointer
                ${interactive ? 'hover:scale-150 focus:outline-none focus:ring-2 focus:ring-brand' : ''}
                ${isSelected ? 'ring-2 ring-brand scale-150' : ''}
              `}
              style={{
                left: point.x - 6,
                top: point.y - 6,
                boxShadow: isHovered ? '0 4px 20px rgba(124, 58, 237, 0.5)' : '0 2px 10px rgba(124, 58, 237, 0.2)'
              }}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
              onClick={() => handleDataPointClick(point, index)}
              onKeyDown={(e) => handleKeyDown(e, index)}
              tabIndex={interactive ? 0 : -1}
              role={interactive ? "button" : "presentation"}
              aria-label={`${point.label}: ${point.value}`}
            >
              {/* Tooltip */}
              <AnimatePresence>
                {(isHovered || isSelected) && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: -30 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute left-1/2 transform -translate-x-1/2 bg-surface text-white text-xs px-2 py-1 rounded shadow-lg whitespace-nowrap"
                    style={{ zIndex: 10 }}
                  >
                    {point.label}: {point.value}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}

        {/* X-axis labels */}
        {showLabels && (
          <div className="absolute -bottom-8 inset-x-0">
            {points.map((point, index) => (
              <div
                key={index}
                className="absolute text-xs text-gray-500 transform -translate-x-1/2"
                style={{ left: point.x }}
              >
                {point.label}
              </div>
            ))}
          </div>
        )}

        {/* Y-axis labels */}
        {showLabels && (
          <div className="absolute -left-8 inset-y-0 flex flex-col justify-between text-xs text-gray-500">
            {[maxValue, maxValue * 0.75, maxValue * 0.5, maxValue * 0.25, 0].map((value, i) => (
              <span key={i} className="text-right">
                {Math.round(value)}
              </span>
            ))}
          </div>
        )}
      </div>
    );
  };

  const renderChart = () => {
    switch (type) {
      case 'doughnut':
        return renderDoughnutChart();
      case 'line':
      case 'area':
        return renderLineChart();
      case 'bar':
      default:
        return renderBarChart();
    }
  };

  return (
    <div className={`relative ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-white mb-2">
            {data.title}
          </h3>
          <p className="text-sm text-gray-400">
            {type.charAt(0).toUpperCase() + type.slice(1)} Chart
            {animated && isAnimating && ' (Animating...)'}
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          {realTime && (
            <div className="flex items-center gap-2 text-xs text-ok">
              <div className="w-2 h-2 bg-ok rounded-full animate-pulse" />
              Live
            </div>
          )}
        </div>
      </div>

      {/* Chart */}
      <div 
        ref={chartRef}
        className="bg-surface/10 rounded-lg border border-white/5 p-8 overflow-visible"
        role="img"
        aria-label={`${type} chart showing ${data.title}`}
      >
        {renderChart()}
      </div>

      {/* Selected data info */}
      <AnimatePresence>
        {selectedIndex !== null && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="mt-4 p-4 bg-surface/20 rounded-lg border border-white/10"
          >
            <h4 className="text-sm font-medium text-white mb-2">Selected Data Point:</h4>
            <div className="flex items-center gap-4">
              <div
                className="w-4 h-4 rounded"
                style={{ 
                  backgroundColor: data.data[selectedIndex].color || defaultColors[selectedIndex % defaultColors.length] 
                }}
              />
              <span className="text-white font-medium">
                {data.data[selectedIndex].label}
              </span>
              <span className="text-brand font-bold">
                {data.data[selectedIndex].value}
              </span>
              {type === 'doughnut' && (
                <span className="text-gray-400 text-sm">
                  ({((data.data[selectedIndex].value / data.data.reduce((s, p) => s + p.value, 0)) * 100).toFixed(1)}%)
                </span>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}