import { useState } from "react";

const ClientCalendar = ({ value, onChange }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date(value));

  const daysInMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const startDayOfMonth = (date) => {
    const day = new Date(date.getFullYear(), date.getMonth(), 1).getDay();
    return day === 0 ? 6 : day - 1;
  };

  const changeMonth = (offset) => {
    const newDate = new Date(currentMonth);
    newDate.setMonth(newDate.getMonth() + offset);
    setCurrentMonth(newDate);
  };

  const handleDateClick = (day) => {
    const newDate = new Date(currentMonth);
    newDate.setDate(day);
    onChange(newDate);
  };

  const renderDays = () => {
    const totalDays = daysInMonth(currentMonth);
    const startDay = startDayOfMonth(currentMonth);
    const days = [];

    for (let i = 0; i < startDay; i++) {
      days.push(<div key={`empty-${i}`} className="p-2"></div>);
    }

    for (let i = 1; i <= totalDays; i++) {
      const dateToCheck = new Date(currentMonth);
      dateToCheck.setDate(i);

      const isSelected =
        value.getDate() === i &&
        value.getMonth() === currentMonth.getMonth() &&
        value.getFullYear() === currentMonth.getFullYear();

      const isToday =
        new Date().getDate() === i &&
        new Date().getMonth() === currentMonth.getMonth() &&
        new Date().getFullYear() === currentMonth.getFullYear();

      days.push(
        <button
          key={i}
          onClick={() => handleDateClick(i)}
          className={`
            p-2 rounded-lg font-bold text-sm transition
            ${
              isSelected
                ? "bg-amber-500 text-zinc-900 shadow-[0_0_10px_rgba(245,158,11,0.5)] scale-110"
                : isToday
                ? "bg-zinc-700 text-amber-500 border border-amber-500/50"
                : "text-zinc-300 hover:bg-zinc-700 hover:text-white"
            }
          `}
        >
          {i}
        </button>
      );
    }
    return days;
  };

  const weekDays = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Нд"];

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-4 bg-zinc-900/50 p-2 rounded-lg">
        <button
          onClick={() => changeMonth(-1)}
          className="text-amber-500 px-3 py-1 hover:bg-zinc-700 rounded text-xl font-bold"
        >
          ‹
        </button>
        <span className="font-bold text-lg text-white uppercase tracking-widest">
          {currentMonth.toLocaleString("bg-BG", {
            month: "long",
            year: "numeric",
          })}
        </span>
        <button
          onClick={() => changeMonth(1)}
          className="text-amber-500 px-3 py-1 hover:bg-zinc-700 rounded text-xl font-bold"
        >
          ›
        </button>
      </div>
      <div className="grid grid-cols-7 gap-1 text-center mb-2">
        {weekDays.map((d) => (
          <div key={d} className="text-xs text-zinc-500 uppercase font-bold">
            {d}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">{renderDays()}</div>
    </div>
  );
};

export default ClientCalendar;
