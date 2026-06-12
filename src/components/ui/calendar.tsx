"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface CalendarProps {
  selectedDate: string;
  onChange: (dateStr: string) => void;
  className?: string;
}

export default function Calendar({
  selectedDate,
  onChange,
  className = "",
}: CalendarProps) {
  const [currentDate, setCurrentDate] = useState(() => {
    return selectedDate ? new Date(selectedDate + "T00:00:00") : new Date();
  });

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayIndex = new Date(year, month, 1).getDay();
  const prevMonthDays = new Date(year, month, 0).getDate();

  const cells: { dateStr: string; dayNum: number; isCurrentMonth: boolean }[] =
    [];

  for (let i = firstDayIndex - 1; i >= 0; i--) {
    const d = prevMonthDays - i;
    const m = month === 0 ? 11 : month - 1;
    const y = month === 0 ? year - 1 : year;
    cells.push({
      dateStr: `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`,
      dayNum: d,
      isCurrentMonth: false,
    });
  }

  for (let d = 1; d <= daysInMonth; d++) {
    cells.push({
      dateStr: `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`,
      dayNum: d,
      isCurrentMonth: true,
    });
  }

  const remaining = 42 - cells.length;
  for (let d = 1; d <= remaining; d++) {
    const m = month === 11 ? 0 : month + 1;
    const y = month === 11 ? year + 1 : year;
    cells.push({
      dateStr: `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`,
      dayNum: d,
      isCurrentMonth: false,
    });
  }

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const handleTodayClick = () => {
    const today = new Date();
    const todayStr = today.toISOString().split("T")[0];
    setCurrentDate(today);
    onChange(todayStr);
  };

  const monthName = currentDate.toLocaleString("default", { month: "long" });

  return (
    <div
      className={`absolute right-0 mt-2 bg-white border border-zinc-200 rounded-3xl shadow-xl p-5 z-50 w-72 animate-scale-in ${className}`}
    >
      <div className="flex justify-between items-center mb-4">
        <button
          type="button"
          onClick={handlePrevMonth}
          className="p-1.5 rounded-full hover:bg-zinc-100 text-zinc-600 transition-colors"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <span className="text-xs font-bold text-zinc-900 uppercase tracking-wider">
          {monthName} {year}
        </span>
        <button
          type="button"
          onClick={handleNextMonth}
          className="p-1.5 rounded-full hover:bg-zinc-100 text-zinc-600 transition-colors"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center mb-2">
        {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((day) => (
          <span
            key={day}
            className="text-[10px] font-bold text-zinc-400 uppercase"
          >
            {day}
          </span>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1 text-center">
        {cells.map((cell, idx) => {
          const isSelected = cell.dateStr === selectedDate;
          return (
            <button
              key={`${cell.dateStr}-${idx}`}
              type="button"
              onClick={() => onChange(cell.dateStr)}
              className={`py-1.5 text-xs rounded-full transition-all cursor-pointer font-bold ${
                isSelected
                  ? "bg-zinc-950 text-white font-extrabold"
                  : cell.isCurrentMonth
                    ? "text-zinc-900 hover:bg-zinc-100"
                    : "text-zinc-300 hover:bg-zinc-50"
              }`}
            >
              {cell.dayNum}
            </button>
          );
        })}
      </div>

      <div className="border-t border-zinc-100 mt-3.5 pt-3">
        <button
          type="button"
          onClick={handleTodayClick}
          className="w-full text-center text-xs font-bold text-zinc-900 bg-zinc-50 hover:bg-zinc-100 rounded-2xl py-2 transition-colors cursor-pointer border border-zinc-200"
        >
          Today
        </button>
      </div>
    </div>
  );
}
