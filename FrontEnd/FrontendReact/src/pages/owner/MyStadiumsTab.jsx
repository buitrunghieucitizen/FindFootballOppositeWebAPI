import React, { useState, useEffect } from 'react';
import stadiumOwnerService from '../../services/stadiumOwnerService';
import { paymentService } from '../../services/paymentService';
import { FiPlus, FiMapPin } from 'react-icons/fi';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

function LocationMarker({ position, setPosition }) {
  const map = useMapEvents({
    click(e) {
      setPosition(e.latlng);
      map.flyTo(e.latlng, map.getZoom());
    },
  });

  return position === null ? null : (
    <Marker position={position}></Marker>
  );
}

function LocateControl({ setPosition }) {
  const map = useMapEvents({
    locationfound(e) {
      setPosition(e.latlng);
      map.flyTo(e.latlng, 16);
    },
  });

  return (
    <div style={{ position: 'absolute', top: '10px', right: '10px', zIndex: 1000 }}>
      <button 
        type="button" 
        onClick={(e) => { e.preventDefault(); map.locate(); }}
        className="bg-white px-3 py-2 rounded-lg shadow-md text-sm font-bold text-blue-600 hover:bg-blue-50 border border-slate-200 transition-colors"
      >
        📍 Vị trí của tôi
      </button>
    </div>
  );
}

export default function MyStadiumsTab() {
  const [stadiums, setStadiums] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Forms states
  const [showStadiumForm, setShowStadiumForm] = useState(false);
  const [showPitchForm, setShowPitchForm] = useState(null); // stadium ID
  const [showRecurringForm, setShowRecurringForm] = useState(null); // pitch ID

  const [newStadium, setNewStadium] = useState({ name: '', address: '', hotline: '', description: '', latitude: '', longitude: '', imageFile: null });
  const [newPitch, setNewPitch] = useState({ name: '', type: '5', pricePerHour: '', quantity: 1, sportId: 1 });
  const [recurringBooking, setRecurringBooking] = useState({ 
    dayOfWeek: 1, startTime: '18:00', endTime: '19:30', fromDate: '', numberOfWeeks: 4 
  });

  const fetchStadiums = async () => {
    try {
      setLoading(true);
      const res = await stadiumOwnerService.getMyStadiums();
      setStadiums(res.data);
      setError(null);
    } catch (err) {
      console.error('Lỗi khi tải danh sách sân:', err);
      setError('Không thể tải danh sách sân. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStadiums();
  }, []);

  const handleCreateStadium = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append('StadiumName', newStadium.name);
      formData.append('Address', newStadium.address);
      formData.append('Hotline', newStadium.hotline);
      formData.append('Description', newStadium.description);
      if (newStadium.latitude) formData.append('Latitude', newStadium.latitude.toString().replace(',', '.'));
      if (newStadium.longitude) formData.append('Longitude', newStadium.longitude.toString().replace(',', '.'));
      if (newStadium.imageFile) formData.append('ImageFile', newStadium.imageFile);

      await stadiumOwnerService.createStadium(formData);
      setNewStadium({ name: '', address: '', hotline: '', description: '', latitude: '', longitude: '', imageFile: null });
      setShowStadiumForm(false);
      fetchStadiums();
    } catch (err) {
      if (err.response?.status === 402) {
        if (window.confirm('Bạn đã đạt giới hạn 2 sân miễn phí. Bạn có muốn thanh toán 30,000 VNĐ để tạo thêm sân mới?')) {
          try {
            const res = await paymentService.createPaymentLink({ type: 'PitchCreation' });
            if (res.checkoutUrl) {
              window.location.href = res.checkoutUrl;
            }
          } catch (paymentErr) {
            console.error('Lỗi tạo thanh toán:', paymentErr);
            alert('Không thể khởi tạo thanh toán.');
          }
        }
      } else {
        console.error('Lỗi khi tạo sân:', err);
        const errorData = err.response?.data;
        let errorMsg = 'Không thể tạo sân mới.';
        if (errorData) {
            if (errorData.errors) {
                errorMsg = Object.values(errorData.errors).flat().join('\\n');
            } else if (errorData.message) {
                errorMsg = errorData.message;
            } else if (typeof errorData === 'string') {
                errorMsg = errorData;
            } else {
                errorMsg = JSON.stringify(errorData);
            }
        }
        alert('Lỗi: ' + errorMsg);
      }
    }
  };

  const handleCreatePitch = async (e, stadiumId) => {
    e.preventDefault();
    try {
      const count = parseInt(newPitch.quantity || 1, 10);
      for (let i = 1; i <= count; i++) {
        let pitchName = newPitch.name;
        if (count > 1) {
          pitchName = `${newPitch.name} ${i}`;
        }
        await stadiumOwnerService.createPitch({ 
          PitchName: pitchName, 
          PitchType: newPitch.type, 
          HourlyRate: parseFloat(newPitch.pricePerHour),
          StadiumId: stadiumId,
          SportId: parseInt(newPitch.sportId, 10)
        });
      }
      setNewPitch({ name: '', type: '5', pricePerHour: '', quantity: 1, sportId: 1 });
      setShowPitchForm(null);
      fetchStadiums();
    } catch (err) {
      console.error('Lỗi khi tạo sân nhỏ:', err);
      alert('Không thể tạo sân nhỏ mới.');
    }
  };

  const handleCreateRecurring = async (e, pitchId) => {
    e.preventDefault();
    try {
      await stadiumOwnerService.createRecurringSchedule(pitchId, {
        PitchId: pitchId,
        DayOfWeek: parseInt(recurringBooking.dayOfWeek),
        StartTime: `${recurringBooking.startTime}:00`,
        EndTime: `${recurringBooking.endTime}:00`,
        FromDate: recurringBooking.fromDate,
        NumberOfWeeks: parseInt(recurringBooking.numberOfWeeks)
      });
      alert('Tạo lịch định kỳ thành công!');
      setShowRecurringForm(null);
    } catch (err) {
      console.error(err);
      alert('Lỗi: ' + (err.message || 'Trùng lịch hoặc thông tin không hợp lệ.'));
    }
  };

  if (loading) return <div className="p-6 text-center text-slate-500 dark:text-slate-400">Đang tải danh sách sân...</div>;
  if (error) return <div className="p-6 text-center text-red-500">{error}</div>;

  return (
    <div className="animate-fade-in">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Quản lý Sân thể thao</h2>
        <button
          onClick={() => setShowStadiumForm(!showStadiumForm)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <FiPlus /> Thêm sân thể thao mới
        </button>
      </div>

      {showStadiumForm && (
        <form onSubmit={handleCreateStadium} className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-md border border-slate-200 dark:border-slate-700 mb-6">
          <h3 className="text-lg font-semibold mb-4">Tạo sân thể thao Mới</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-1">Tên sân thể thao</label>
              <input
                type="text"
                required
                value={newStadium.name}
                onChange={(e) => setNewStadium({ ...newStadium, name: e.target.value })}
                className="w-full px-4 py-2 bg-white dark:bg-slate-700 text-slate-900 dark:text-white border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-1">Địa chỉ</label>
              <input
                type="text"
                required
                value={newStadium.address}
                onChange={(e) => setNewStadium({ ...newStadium, address: e.target.value })}
                className="w-full px-4 py-2 bg-white dark:bg-slate-700 text-slate-900 dark:text-white border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
            <div className="col-span-1 md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-1">Hotline (Số điện thoại)</label>
              <input
                type="text"
                required
                value={newStadium.hotline}
                onChange={(e) => setNewStadium({ ...newStadium, hotline: e.target.value })}
                className="w-full px-4 py-2 bg-white dark:bg-slate-700 text-slate-900 dark:text-white border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="Nhập số điện thoại liên hệ"
              />
            </div>
            <div className="col-span-1 md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-1">Tọa độ (Latitude, Longitude)</label>
              <div className="flex gap-2">
                <input
                  type="number" step="any"
                  placeholder="Latitude (VD: 21.0285)"
                  value={newStadium.latitude}
                  onChange={(e) => setNewStadium({ ...newStadium, latitude: e.target.value })}
                  className="w-1/2 px-4 py-2 bg-white dark:bg-slate-700 text-slate-900 dark:text-white border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
                <input
                  type="number" step="any"
                  placeholder="Longitude (VD: 105.8542)"
                  value={newStadium.longitude}
                  onChange={(e) => setNewStadium({ ...newStadium, longitude: e.target.value })}
                  className="w-1/2 px-4 py-2 bg-white dark:bg-slate-700 text-slate-900 dark:text-white border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              <p className="text-xs text-slate-500 mt-1 mb-2">Bấm vào bản đồ bên dưới để lấy tọa độ tự động. Nhấn "Vị trí của tôi" để lấy tọa độ hiện tại của bạn.</p>
              <div className="h-[300px] w-full rounded-lg overflow-hidden border border-slate-300 dark:border-slate-600 relative z-0">
                <MapContainer center={[21.0285, 105.8542]} zoom={13} scrollWheelZoom={true} style={{ height: '100%', width: '100%' }}>
                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                  <LocationMarker 
                    position={newStadium.latitude && newStadium.longitude ? {lat: parseFloat(newStadium.latitude), lng: parseFloat(newStadium.longitude)} : null} 
                    setPosition={(pos) => setNewStadium({...newStadium, latitude: pos.lat.toFixed(6), longitude: pos.lng.toFixed(6)})} 
                  />
                  <LocateControl setPosition={(pos) => setNewStadium({...newStadium, latitude: pos.lat.toFixed(6), longitude: pos.lng.toFixed(6)})} />
                </MapContainer>
              </div>
            </div>
            <div className="col-span-1 md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-1">Mô tả chi tiết</label>
              <textarea
                rows="3"
                value={newStadium.description}
                onChange={(e) => setNewStadium({ ...newStadium, description: e.target.value })}
                className="w-full px-4 py-2 bg-white dark:bg-slate-700 text-slate-900 dark:text-white border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
            <div className="col-span-1 md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-1">Hình ảnh sân</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setNewStadium({ ...newStadium, imageFile: e.target.files[0] })}
                className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100 dark:file:bg-emerald-900/30 dark:file:text-emerald-400"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setShowStadiumForm(false)}
              className="px-4 py-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
            >
              Hủy
            </button>
            <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              Xác nhận
            </button>
          </div>
        </form>
      )}

      {stadiums.length === 0 ? (
        <div className="bg-white dark:bg-slate-800 p-8 rounded-xl shadow-md border border-slate-200 dark:border-slate-700 text-center">
          <p className="text-slate-500 dark:text-slate-400">Bạn chưa có sân thể thao nào. Hãy thêm sân mới!</p>
        </div>
      ) : (
        <div className="space-y-6">
          {stadiums.map((stadium) => (
            <div key={stadium.stadiumId} className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-md border border-slate-200 dark:border-slate-700">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-bold text-slate-800 dark:text-white">{stadium.stadiumName}</h3>
                  <p className="flex items-center gap-2 text-slate-500 dark:text-slate-400 mt-1">
                    <FiMapPin className="text-blue-500" /> {stadium.address}
                  </p>
                  {stadium.hotline && (
                    <p className="flex items-center gap-2 text-slate-500 dark:text-slate-400 mt-1">
                      <span className="font-semibold text-slate-600 dark:text-slate-300">Hotline:</span> {stadium.hotline}
                    </p>
                  )}
                </div>
                <button
                  onClick={() => setShowPitchForm(showPitchForm === stadium.stadiumId ? null : stadium.stadiumId)}
                  className="text-sm px-3 py-1.5 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 rounded-lg hover:bg-indigo-100 transition-colors"
                >
                  + Thêm sân nhỏ
                </button>
              </div>

              {showPitchForm === stadium.stadiumId && (
                <form onSubmit={(e) => handleCreatePitch(e, stadium.stadiumId)} className="bg-slate-50 dark:bg-slate-900 p-4 rounded-lg border border-slate-200 dark:border-slate-700 mb-4">
                  <h4 className="font-semibold text-sm mb-3">Tạo Sân Nhỏ</h4>
                  <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-5 gap-4 mb-4">
                    <div>
                      <label className="block text-xs font-medium text-slate-700 dark:text-slate-200 mb-1">Tên/Mã sân</label>
                      <input
                        type="text"
                        required
                        value={newPitch.name}
                        onChange={(e) => setNewPitch({ ...newPitch, name: e.target.value })}
                        className="w-full px-3 py-1.5 bg-white dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-300 dark:border-slate-600 rounded-lg text-sm"
                        placeholder="VD: Sân"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-700 dark:text-slate-200 mb-1">Loại sân</label>
                      <select
                        value={newPitch.type}
                        onChange={(e) => setNewPitch({ ...newPitch, type: e.target.value })}
                        className="w-full px-3 py-1.5 bg-white dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-300 dark:border-slate-600 rounded-lg text-sm"
                      >
                        <option value="5">Sân 5 người</option>
                        <option value="7">Sân 7 người</option>
                        <option value="11">Sân 11 người</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-700 dark:text-slate-200 mb-1">Môn thể thao</label>
                      <select
                        value={newPitch.sportId}
                        onChange={(e) => setNewPitch({ ...newPitch, sportId: parseInt(e.target.value) })}
                        className="w-full px-3 py-1.5 bg-white dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-300 dark:border-slate-600 rounded-lg text-sm"
                      >
                        <option value={1}>Bóng đá</option>
                        <option value={2}>Cầu lông</option>
                        <option value={3}>Pickleball</option>
                        <option value={4}>Khác</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-700 dark:text-slate-200 mb-1">Giá/Giờ (VND)</label>
                      <input
                        type="number"
                        required
                        value={newPitch.pricePerHour}
                        onChange={(e) => setNewPitch({ ...newPitch, pricePerHour: e.target.value })}
                        className="w-full px-3 py-1.5 bg-white dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-300 dark:border-slate-600 rounded-lg text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-700 dark:text-slate-200 mb-1">Số lượng tạo</label>
                      <input
                        type="number"
                        min="1"
                        max="20"
                        value={newPitch.quantity}
                        onChange={(e) => setNewPitch({ ...newPitch, quantity: e.target.value })}
                        className="w-full px-3 py-1.5 bg-white dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-300 dark:border-slate-600 rounded-lg text-sm"
                        placeholder="VD: 5"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setShowPitchForm(null)}
                      className="px-3 py-1.5 text-xs text-slate-600 dark:text-slate-300 hover:bg-slate-200 rounded-lg"
                    >
                      Hủy
                    </button>
                    <button type="submit" className="px-3 py-1.5 text-xs bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
                      Lưu sân nhỏ
                    </button>
                  </div>
                </form>
              )}

              {stadium.pitches && stadium.pitches.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {stadium.pitches.map((pitch) => (
                    <div key={pitch.pitchId} className="border border-slate-200 dark:border-slate-700 rounded-lg p-4 bg-slate-50 dark:bg-slate-900 hover:shadow-md transition-shadow">
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-semibold text-slate-800 dark:text-white">{pitch.pitchName}</span>
                        <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded-full font-medium">Sân {pitch.grassType || pitch.pitchSize || pitch.type}</span>
                      </div>
                      <div className="text-sm text-slate-600 dark:text-slate-300 mb-3">
                        <span className="text-blue-600 font-bold">{pitch.pricePerHour?.toLocaleString()} VND</span> / giờ
                      </div>
                      <button
                        onClick={() => setShowRecurringForm(showRecurringForm === pitch.pitchId ? null : pitch.pitchId)}
                        className="w-full text-xs py-1.5 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 rounded hover:bg-emerald-200 transition-colors"
                      >
                        Lên lịch định kỳ
                      </button>

                      {showRecurringForm === pitch.pitchId && (
                        <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-700">
                          <form onSubmit={(e) => handleCreateRecurring(e, pitch.pitchId)} className="space-y-3">
                            <div>
                              <label className="block text-xs mb-1 text-slate-600 dark:text-slate-400">Từ ngày</label>
                              <input type="date" required value={recurringBooking.fromDate} onChange={e => setRecurringBooking({...recurringBooking, fromDate: e.target.value})} className="w-full text-xs p-1.5 rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800" />
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                              <div>
                                <label className="block text-xs mb-1 text-slate-600 dark:text-slate-400">Thứ</label>
                                <select value={recurringBooking.dayOfWeek} onChange={e => setRecurringBooking({...recurringBooking, dayOfWeek: e.target.value})} className="w-full text-xs p-1.5 rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800">
                                  <option value="1">Thứ 2</option><option value="2">Thứ 3</option>
                                  <option value="3">Thứ 4</option><option value="4">Thứ 5</option>
                                  <option value="5">Thứ 6</option><option value="6">Thứ 7</option>
                                  <option value="0">Chủ nhật</option>
                                </select>
                              </div>
                              <div>
                                <label className="block text-xs mb-1 text-slate-600 dark:text-slate-400">Số tuần</label>
                                <input type="number" min="1" max="12" required value={recurringBooking.numberOfWeeks} onChange={e => setRecurringBooking({...recurringBooking, numberOfWeeks: e.target.value})} className="w-full text-xs p-1.5 rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800" />
                              </div>
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                              <div>
                                <label className="block text-xs mb-1 text-slate-600 dark:text-slate-400">Bắt đầu</label>
                                <input type="time" required value={recurringBooking.startTime} onChange={e => setRecurringBooking({...recurringBooking, startTime: e.target.value})} className="w-full text-xs p-1.5 rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800" />
                              </div>
                              <div>
                                <label className="block text-xs mb-1 text-slate-600 dark:text-slate-400">Kết thúc</label>
                                <input type="time" required value={recurringBooking.endTime} onChange={e => setRecurringBooking({...recurringBooking, endTime: e.target.value})} className="w-full text-xs p-1.5 rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800" />
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <button type="button" onClick={() => setShowRecurringForm(null)} className="flex-1 text-xs py-1.5 bg-slate-200 dark:bg-slate-700 rounded text-slate-700 dark:text-slate-300">Hủy</button>
                              <button type="submit" className="flex-1 text-xs py-1.5 bg-blue-600 text-white rounded">Lưu</button>
                            </div>
                          </form>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-slate-400 italic">Chưa có sân nhỏ nào.</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

