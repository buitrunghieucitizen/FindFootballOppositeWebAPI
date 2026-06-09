import React, { useState, useEffect } from 'react';
import { FiCalendar, FiClock, FiCheckCircle } from 'react-icons/fi';
import stadiumOwnerService from '../../services/stadiumOwnerService';

export default function OwnerTimelineTab() {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedPitch, setSelectedPitch] = useState('all');
  const [pitches, setPitches] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [stadiumsRes, bookingsRes] = await Promise.all([
        stadiumOwnerService.getMyStadiums(),
        stadiumOwnerService.getBookings()
      ]);
      
      const allPitches = [];
      (stadiumsRes.data || []).forEach(s => {
        (s.pitches || []).forEach(p => {
          allPitches.push({ id: p.pitchId.toString(), name: `${s.stadiumName} - ${p.pitchName}` });
        });
      });
      setPitches(allPitches);
      
      const mappedBookings = (bookingsRes.data || []).map(b => ({
        pitchId: b.pitchId?.toString() || b.Pitch?.PitchId?.toString(), // Handle both mappings if needed
        date: b.date,
        time: b.startTime,
        team: b.userName || 'Ẩn danh',
        status: b.status
      }));
      setBookings(mappedBookings);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const baseTimeSlots = ['06:00', '07:30', '09:00', '16:00', '17:30', '19:00', '20:30'];
  const allBookingTimes = bookings.map(b => b.time).filter(Boolean);
  const timeSlots = [...new Set([...baseTimeSlots, ...allBookingTimes])].sort((a, b) => a.localeCompare(b));

  if (loading) {
    return <div className="p-8 text-center text-slate-500 dark:text-slate-400 animate-pulse">Đang tải lịch trình...</div>;
  }

  return (
    <div className="animate-fade-in">
      <div className="flex flex-wrap gap-4 justify-between items-center mb-8">
        <div>
          <h2 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
            <FiClock className="text-emerald-500" />
            Lịch Trình Quản Lý Sân
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Timeline phân bổ ca đá, giúp bạn kiểm soát sân trống dễ dàng</p>
        </div>
        <div className="flex gap-4">
          <input 
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-slate-700 dark:text-slate-200 outline-none focus:ring-2 focus:ring-emerald-500/20 shadow-sm"
          />
          <select 
            value={selectedPitch}
            onChange={(e) => setSelectedPitch(e.target.value)}
            className="px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-slate-700 dark:text-slate-200 outline-none focus:ring-2 focus:ring-emerald-500/20 shadow-sm"
          >
            <option value="all">Tất cả sân</option>
            {pitches.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700">
                <th className="py-4 px-6 text-sm font-bold text-slate-700 dark:text-slate-200 w-32 border-r border-slate-200 dark:border-slate-700">Sân \ Ca</th>
                {timeSlots.map(time => (
                  <th key={time} className="py-4 px-6 text-sm font-bold text-slate-700 dark:text-slate-200 text-center min-w-[120px]">{time}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
              {pitches.length === 0 ? (
                <tr>
                  <td colSpan={timeSlots.length + 1} className="py-8 text-center text-slate-500 dark:text-slate-400">Bạn chưa tạo sân bóng nào.</td>
                </tr>
              ) : pitches.filter(p => selectedPitch === 'all' || p.id === selectedPitch).map(pitch => (
                <tr key={pitch.id}>
                  <td className="py-4 px-6 font-bold text-slate-800 dark:text-white bg-slate-50 dark:bg-slate-900/50 border-r border-slate-200 dark:border-slate-700">
                    {pitch.name}
                  </td>
                  {timeSlots.map(time => {
                    const booking = bookings.find(b => b.pitchId === pitch.id && b.date === selectedDate && b.time === time && b.status !== 'Rejected' && b.status !== 'Cancelled');
                    return (
                      <td key={time} className="p-2 border-r border-slate-50 last:border-0">
                        {booking ? (
                          <div className={`border rounded-lg p-2 h-full cursor-pointer transition-colors ${booking.status === 'Confirmed' ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100' : 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800 hover:bg-yellow-100'}`}>
                            <span className={`block text-xs font-bold mb-1 ${booking.status === 'Confirmed' ? 'text-emerald-700' : 'text-yellow-700'}`}>{booking.team}</span>
                            <span className={`flex items-center gap-1 text-[10px] uppercase font-bold ${booking.status === 'Confirmed' ? 'text-emerald-600' : 'text-yellow-600'}`}><FiCheckCircle /> {booking.status === 'Confirmed' ? 'Đã duyệt' : 'Chờ duyệt'}</span>
                          </div>
                        ) : (
                          <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 border-dashed rounded-lg p-2 h-16 flex items-center justify-center cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700 hover:border-solid transition-all text-slate-400 text-xs font-bold">
                            + Trống
                          </div>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
      <div className="mt-6 flex gap-6 text-sm">
        <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300"><span className="w-4 h-4 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-sm inline-block"></span> Đã duyệt</div>
        <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300"><span className="w-4 h-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-sm inline-block"></span> Chờ duyệt</div>
        <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300"><span className="w-4 h-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 border-dashed rounded-sm inline-block"></span> Trống</div>
      </div>
    </div>
  );
}
