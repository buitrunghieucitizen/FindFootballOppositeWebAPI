import React, { useState, useEffect } from 'react';
import { captainService } from '../services/captainService';
import { FiCalendar, FiClock, FiCheck } from 'react-icons/fi';

export default function PitchCalendar({ pitchId, onSelectTimeSlot }) {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (pitchId && date) {
      loadCalendar();
    }
  }, [pitchId, date]);

  const [stadiumConfig, setStadiumConfig] = useState({ openTime: '05:00', closeTime: '23:30', slotDurationMinutes: 30 });

  const loadCalendar = async () => {
    try {
      setLoading(true);
      const res = await captainService.getPitchCalendar(pitchId, date);
      // Backend returns { openTime, closeTime, slotDurationMinutes, schedules }
      if (res && res.schedules) {
        setSchedules(res.schedules);
        setStadiumConfig({
          openTime: res.openTime,
          closeTime: res.closeTime,
          slotDurationMinutes: res.slotDurationMinutes || 30
        });
      } else {
        setSchedules(res || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Generate dynamic time slots based on config
  const timeSlots = [];
  try {
    const [openH, openM] = stadiumConfig.openTime.split(':').map(Number);
    const [closeH, closeM] = stadiumConfig.closeTime.split(':').map(Number);
    let currentMins = openH * 60 + openM;
    const endMins = closeH * 60 + closeM;
    const step = stadiumConfig.slotDurationMinutes;
    
    while (currentMins < endMins) {
      const h = Math.floor(currentMins / 60);
      const m = currentMins % 60;
      timeSlots.push(`${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`);
      currentMins += step;
    }
  } catch (e) {
    // Fallback if parsing fails
    for (let h = 5; h <= 23; h++) {
      timeSlots.push(`${h.toString().padStart(2, '0')}:00`);
      timeSlots.push(`${h.toString().padStart(2, '0')}:30`);
    }
  }

  const getSlotStatus = (timeStr) => {
    const slotTime = new Date(`${date}T${timeStr}:00`);
    const slotEndTime = new Date(slotTime.getTime() + stadiumConfig.slotDurationMinutes * 60000);
    
    // Check if any schedule overlaps with this slot
    const overlapping = schedules.find(s => {
      const start = new Date(s.startTime);
      const end = new Date(s.endTime);
      // Overlaps if slot starts before schedule ends AND slot ends after schedule starts
      return slotTime < end && slotEndTime > start;
    });

    if (overlapping) {
      return overlapping.scheduleStatus; // 'Booked', 'PendingPayment'
    }
    
    // Check if past time
    if (slotTime < new Date()) {
      return 'Past';
    }

    return 'Available';
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Available': return 'bg-emerald-100 dark:bg-emerald-900/30 hover:bg-emerald-200 dark:hover:bg-emerald-800/40 text-emerald-700 dark:text-emerald-300 cursor-pointer border-emerald-200 dark:border-emerald-700';
      case 'Booked': return 'bg-rose-100 dark:bg-rose-900/30 text-rose-500 dark:text-rose-400 cursor-not-allowed border-rose-200 dark:border-rose-700 opacity-70';
      case 'PendingPayment': return 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 cursor-not-allowed border-amber-200 dark:border-amber-700 opacity-70';
      case 'Past': return 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 cursor-not-allowed border-slate-200 dark:border-slate-700 opacity-50';
      default: return 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 cursor-not-allowed';
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 p-4 shadow-sm">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-bold text-slate-800 dark:text-white flex items-center gap-2">
          <FiCalendar /> Chọn khung giờ trống
        </h3>
        <input 
          type="date" 
          value={date} 
          onChange={e => setDate(e.target.value)}
          className="border border-slate-300 dark:border-slate-600 dark:bg-slate-800 dark:text-white rounded-lg px-3 py-1.5 text-sm font-medium focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
          min={new Date().toISOString().split('T')[0]}
        />
      </div>

      {loading ? (
        <div className="h-40 flex items-center justify-center text-slate-500 dark:text-slate-400">Đang tải lịch sân...</div>
      ) : (
        <>
          <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2 max-h-64 overflow-y-auto pr-2 custom-scrollbar">
            {timeSlots.map((time, idx) => {
              const status = getSlotStatus(time);
              if (status === 'Booked' || status === 'Confirmed') return null;
              return (
                <div 
                  key={idx}
                  onClick={() => status === 'Available' && onSelectTimeSlot(date, time)}
                  className={`border rounded-lg p-2 text-center transition-all ${getStatusColor(status)}`}
                  title={status === 'Available' ? 'Bấm để chọn giờ này làm giờ bắt đầu' : `Trạng thái: ${status}`}
                >
                  <div className="text-xs font-bold">{time}</div>
                  <div className="text-[10px] mt-1 hidden sm:block">
                    {status === 'Available' ? 'Trống' : status === 'Past' ? 'Đã qua' : status === 'Booked' ? 'Đã đặt' : 'Đang giữ'}
                  </div>
                </div>
              );
            })}
          </div>
          
          <div className="flex flex-wrap gap-4 mt-4 pt-4 border-t border-slate-100 dark:border-slate-700/50 text-xs font-medium text-slate-600 dark:text-slate-400 justify-center">
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-emerald-100 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-700"></span> Trống</span>
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-amber-100 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-700"></span> Đang chờ TT</span>
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-rose-100 dark:bg-rose-900/30 border border-rose-200 dark:border-rose-700"></span> Đã đặt</span>
          </div>
        </>
      )}
    </div>
  );
}
