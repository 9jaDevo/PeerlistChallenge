"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { SPRING, DURATIONS, FadeIn, ScaleIn } from "../motion/Primitives";
import { useStore } from "../../lib/store";
import { 
  ARIA_LABELS, 
  ScreenReader, 
  handleKeyboardNavigation 
} from "../../lib/a11y";

// Calendar types
export type CalendarMode = 'single' | 'range' | 'multiple';
export type DateRange = {
  start: Date | null;
  end: Date | null;
};

interface CalendarEvent {
  id: string;
  date: Date;
  title: string;
  color: string;
}

interface InteractiveCalendarProps {
  mode?: CalendarMode;
  selectedDate?: Date | null;
  selectedDates?: Date[];
  selectedRange?: DateRange;
  events?: CalendarEvent[];
  onDateSelect?: (date: Date) => void;
  onDatesSelect?: (dates: Date[]) => void;
  onRangeSelect?: (range: DateRange) => void;
  minDate?: Date;
  maxDate?: Date;
  disabledDates?: Date[];
  className?: string;
}

export function InteractiveCalendar({
  mode = 'single',
  selectedDate = null,
  selectedDates = [],
  selectedRange = { start: null, end: null },
  events = [],
  onDateSelect,
  onDatesSelect,
  onRangeSelect,
  minDate,
  maxDate,
  disabledDates = [],
  className = ""
}: InteractiveCalendarProps) {
  const { markDayComplete, preferences } = useStore();
  
  // Calendar state
  const [currentDate, setCurrentDate] = useState(new Date());
  const [hoveredDate, setHoveredDate] = useState<Date | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [viewMode, setViewMode] = useState<'month' | 'year'>('month');
  
  // Local state for selections
  const [internalSelectedDate, setInternalSelectedDate] = useState<Date | null>(selectedDate);
  const [internalSelectedDates, setInternalSelectedDates] = useState<Date[]>(selectedDates);
  const [internalSelectedRange, setInternalSelectedRange] = useState<DateRange>(selectedRange);
  
  // Refs
  const calendarRef = useRef<HTMLDivElement>(null);
  
  // Date utilities
  const formatDate = (date: Date): string => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const isSameDay = (date1: Date, date2: Date): boolean => {
    return date1.toDateString() === date2.toDateString();
  };

  const isDateDisabled = useCallback((date: Date): boolean => {
    if (minDate && date < minDate) return true;
    if (maxDate && date > maxDate) return true;
    return disabledDates.some(disabledDate => isSameDay(date, disabledDate));
  }, [minDate, maxDate, disabledDates]);

  const isDateSelected = useCallback((date: Date): boolean => {
    if (mode === 'single') {
      return internalSelectedDate ? isSameDay(date, internalSelectedDate) : false;
    } else if (mode === 'multiple') {
      return internalSelectedDates.some(selectedDate => isSameDay(date, selectedDate));
    } else if (mode === 'range') {
      const { start, end } = internalSelectedRange;
      if (start && end) {
        return date >= start && date <= end;
      } else if (start) {
        return isSameDay(date, start);
      }
    }
    return false;
  }, [mode, internalSelectedDate, internalSelectedDates, internalSelectedRange]);

  const isDateInRange = useCallback((date: Date): boolean => {
    if (mode !== 'range') return false;
    const { start, end } = internalSelectedRange;
    if (start && hoveredDate && !end) {
      const rangeStart = start < hoveredDate ? start : hoveredDate;
      const rangeEnd = start < hoveredDate ? hoveredDate : start;
      return date >= rangeStart && date <= rangeEnd;
    }
    return false;
  }, [mode, internalSelectedRange, hoveredDate]);

  const getDateEvents = useCallback((date: Date): CalendarEvent[] => {
    return events.filter(event => isSameDay(event.date, date));
  }, [events]);

  // Calendar generation
  const generateCalendarDays = useCallback(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);
    const firstDayOfCalendar = new Date(firstDayOfMonth);
    firstDayOfCalendar.setDate(firstDayOfCalendar.getDate() - firstDayOfCalendar.getDay());
    
    const days: Date[] = [];
    const currentCalendarDate = new Date(firstDayOfCalendar);
    
    // Generate 42 days (6 weeks)
    for (let i = 0; i < 42; i++) {
      days.push(new Date(currentCalendarDate));
      currentCalendarDate.setDate(currentCalendarDate.getDate() + 1);
    }
    
    return days;
  }, [currentDate]);

  // Navigation
  const navigateMonth = useCallback((direction: 'prev' | 'next') => {
    if (isAnimating) return;
    
    setIsAnimating(true);
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() + (direction === 'next' ? 1 : -1));
    setCurrentDate(newDate);
    
    setTimeout(() => setIsAnimating(false), 300);
    
    ScreenReader.announce(
      `Navigated to ${newDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}`,
      'polite'
    );
  }, [currentDate, isAnimating]);

  const navigateYear = useCallback((direction: 'prev' | 'next') => {
    if (isAnimating) return;
    
    setIsAnimating(true);
    const newDate = new Date(currentDate);
    newDate.setFullYear(newDate.getFullYear() + (direction === 'next' ? 1 : -1));
    setCurrentDate(newDate);
    
    setTimeout(() => setIsAnimating(false), 300);
    
    ScreenReader.announce(`Navigated to ${newDate.getFullYear()}`, 'polite');
  }, [currentDate, isAnimating]);

  // Date selection handlers
  const handleDateClick = useCallback((date: Date) => {
    if (isDateDisabled(date)) return;

    if (mode === 'single') {
      setInternalSelectedDate(date);
      onDateSelect?.(date);
      markDayComplete(4);
      ScreenReader.announce(`Selected ${formatDate(date)}`, 'polite');
    } else if (mode === 'multiple') {
      const newSelection = internalSelectedDates.some(d => isSameDay(d, date))
        ? internalSelectedDates.filter(d => !isSameDay(d, date))
        : [...internalSelectedDates, date];
      
      setInternalSelectedDates(newSelection);
      onDatesSelect?.(newSelection);
      markDayComplete(4);
      ScreenReader.announce(
        newSelection.length > internalSelectedDates.length 
          ? `Added ${formatDate(date)} to selection`
          : `Removed ${formatDate(date)} from selection`,
        'polite'
      );
    } else if (mode === 'range') {
      const { start, end } = internalSelectedRange;
      
      if (!start || end) {
        // Start new range
        const newRange = { start: date, end: null };
        setInternalSelectedRange(newRange);
        onRangeSelect?.(newRange);
        ScreenReader.announce(`Range start: ${formatDate(date)}`, 'polite');
      } else {
        // Complete range
        const newRange = start <= date 
          ? { start, end: date }
          : { start: date, end: start };
        setInternalSelectedRange(newRange);
        onRangeSelect?.(newRange);
        markDayComplete(4);
        ScreenReader.announce(
          `Range selected: ${formatDate(newRange.start!)} to ${formatDate(newRange.end!)}`,
          'polite'
        );
      }
    }
  }, [mode, isDateDisabled, internalSelectedDate, internalSelectedDates, internalSelectedRange, 
      onDateSelect, onDatesSelect, onRangeSelect, markDayComplete]);

  // Keyboard navigation
  const handleKeyDown = useCallback((e: React.KeyboardEvent, date: Date) => {
    handleKeyboardNavigation(e, {
      onEnter: () => handleDateClick(date),
      onSpace: () => handleDateClick(date),
      preventDefault: ['Enter', 'Space'].includes(e.key)
    });
  }, [handleDateClick]);

  // Reset selections
  const clearSelection = useCallback(() => {
    setInternalSelectedDate(null);
    setInternalSelectedDates([]);
    setInternalSelectedRange({ start: null, end: null });
    ScreenReader.announce('Selection cleared', 'polite');
  }, []);

  const calendarDays = generateCalendarDays();
  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className={`relative ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-white mb-2">
            Interactive Calendar
          </h3>
          <p className="text-sm text-gray-400">
            {mode === 'single' && 'Select a date'}
            {mode === 'multiple' && 'Select multiple dates'}
            {mode === 'range' && 'Select a date range'}
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={clearSelection}
            className="px-3 py-2 text-sm text-gray-400 hover:text-white transition-colors rounded-lg hover:bg-surface/50"
          >
            Clear
          </button>
          
          <select
            value={mode}
            onChange={(e) => {
              // This would typically come from props, but for demo purposes
              ScreenReader.announce(`Calendar mode changed to ${e.target.value}`, 'polite');
            }}
            className="px-3 py-2 text-sm bg-surface/50 text-white rounded-lg border border-white/10 focus:border-brand focus:ring-1 focus:ring-brand"
            disabled
          >
            <option value="single">Single</option>
            <option value="multiple">Multiple</option>
            <option value="range">Range</option>
          </select>
        </div>
      </div>

      {/* Calendar Navigation */}
      <div className="flex items-center justify-between mb-6 p-4 bg-surface/20 rounded-lg">
        <button
          onClick={() => navigateMonth('prev')}
          disabled={isAnimating}
          className="p-2 text-gray-400 hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label="Previous month"
        >
          <motion.span
            whileHover={{ x: -2 }}
            transition={{ type: "spring", stiffness: 400 }}
          >
            ←
          </motion.span>
        </button>
        
        <motion.button
          onClick={() => setViewMode(viewMode === 'month' ? 'year' : 'month')}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="text-lg font-semibold text-white hover:text-brand transition-colors px-4 py-2 rounded-lg hover:bg-surface/50"
        >
          {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
        </motion.button>
        
        <button
          onClick={() => navigateMonth('next')}
          disabled={isAnimating}
          className="p-2 text-gray-400 hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label="Next month"
        >
          <motion.span
            whileHover={{ x: 2 }}
            transition={{ type: "spring", stiffness: 400 }}
          >
            →
          </motion.span>
        </button>
      </div>

      {/* Calendar Grid */}
      <div 
        ref={calendarRef}
        className="bg-surface/10 rounded-lg border border-white/5 p-4"
        role="grid"
        aria-label="Calendar"
      >
        {/* Week Day Headers */}
        <div className="grid grid-cols-7 gap-2 mb-4">
          {weekDays.map(day => (
            <div
              key={day}
              className="text-center text-sm font-medium text-gray-400 py-2"
              role="columnheader"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Days */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentDate.getMonth()}
            initial={{ opacity: 0, x: isAnimating ? 20 : 0 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="grid grid-cols-7 gap-2"
          >
            {calendarDays.map((date, index) => {
              const isCurrentMonth = date.getMonth() === currentDate.getMonth();
              const isToday = isSameDay(date, new Date());
              const isSelected = isDateSelected(date);
              const isDisabled = isDateDisabled(date);
              const inRange = isDateInRange(date);
              const dateEvents = getDateEvents(date);

              return (
                <CalendarDay
                  key={`${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`}
                  date={date}
                  isCurrentMonth={isCurrentMonth}
                  isToday={isToday}
                  isSelected={isSelected}
                  isDisabled={isDisabled}
                  inRange={inRange}
                  events={dateEvents}
                  onClick={() => handleDateClick(date)}
                  onMouseEnter={() => setHoveredDate(date)}
                  onMouseLeave={() => setHoveredDate(null)}
                  onKeyDown={(e) => handleKeyDown(e, date)}
                />
              );
            })}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Selection Summary */}
      <div className="mt-6 p-4 bg-surface/5 rounded-lg border border-white/5">
        <h4 className="text-sm font-medium text-gray-300 mb-2">Selection Summary:</h4>
        
        {mode === 'single' && internalSelectedDate && (
          <p className="text-sm text-white">
            Selected: {formatDate(internalSelectedDate)}
          </p>
        )}
        
        {mode === 'multiple' && internalSelectedDates.length > 0 && (
          <div className="text-sm text-white">
            <p className="mb-2">{internalSelectedDates.length} dates selected:</p>
            <div className="flex flex-wrap gap-2">
              {internalSelectedDates.map((date, index) => (
                <span
                  key={index}
                  className="px-2 py-1 bg-brand/20 text-brand rounded text-xs"
                >
                  {date.toLocaleDateString()}
                </span>
              ))}
            </div>
          </div>
        )}
        
        {mode === 'range' && internalSelectedRange.start && (
          <p className="text-sm text-white">
            {internalSelectedRange.end 
              ? `Range: ${formatDate(internalSelectedRange.start)} to ${formatDate(internalSelectedRange.end)}`
              : `Start: ${formatDate(internalSelectedRange.start)} (select end date)`
            }
          </p>
        )}
        
        {((mode === 'single' && !internalSelectedDate) ||
          (mode === 'multiple' && internalSelectedDates.length === 0) ||
          (mode === 'range' && !internalSelectedRange.start)) && (
          <p className="text-sm text-gray-500">No dates selected</p>
        )}
      </div>
    </div>
  );
}

// Individual Calendar Day Component
interface CalendarDayProps {
  date: Date;
  isCurrentMonth: boolean;
  isToday: boolean;
  isSelected: boolean;
  isDisabled: boolean;
  inRange: boolean;
  events: CalendarEvent[];
  onClick: () => void;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
  onKeyDown: (e: React.KeyboardEvent) => void;
}

function CalendarDay({
  date,
  isCurrentMonth,
  isToday,
  isSelected,
  isDisabled,
  inRange,
  events,
  onClick,
  onMouseEnter,
  onMouseLeave,
  onKeyDown
}: CalendarDayProps) {
  const dayNumber = date.getDate();
  
  return (
    <motion.button
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      onKeyDown={onKeyDown}
      disabled={isDisabled}
      whileHover={!isDisabled ? { scale: 1.05 } : {}}
      whileTap={!isDisabled ? { scale: 0.95 } : {}}
      className={`
        relative aspect-square p-2 rounded-lg text-sm font-medium transition-all duration-200
        focus:outline-none focus:ring-2 focus:ring-brand focus:ring-offset-2 focus:ring-offset-app
        ${!isCurrentMonth ? 'text-gray-600' : 'text-gray-300'}
        ${isToday ? 'ring-2 ring-brand' : ''}
        ${isSelected ? 'bg-brand text-white' : ''}
        ${inRange && !isSelected ? 'bg-brand/30 text-white' : ''}
        ${isDisabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-surface/50 hover:text-white'}
        ${!isCurrentMonth && !isDisabled ? 'hover:text-gray-400' : ''}
      `}
      role="gridcell"
      aria-label={`${date.toLocaleDateString()}, ${events.length > 0 ? `${events.length} events` : 'no events'}`}
      aria-selected={isSelected}
      aria-disabled={isDisabled}
    >
      <span className="relative z-10">{dayNumber}</span>
      
      {/* Event indicators */}
      {events.length > 0 && (
        <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 flex gap-1">
          {events.slice(0, 3).map((event, index) => (
            <div
              key={event.id}
              className="w-1.5 h-1.5 rounded-full"
              style={{ backgroundColor: event.color }}
              title={event.title}
            />
          ))}
          {events.length > 3 && (
            <div className="w-1.5 h-1.5 rounded-full bg-gray-400" />
          )}
        </div>
      )}
      
      {/* Today indicator */}
      {isToday && !isSelected && (
        <div className="absolute top-1 right-1 w-2 h-2 bg-brand rounded-full" />
      )}
    </motion.button>
  );
}