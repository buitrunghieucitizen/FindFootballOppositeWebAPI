import React from 'react';
import { FiMapPin } from 'react-icons/fi';

export default function LocationDisplay({ location, showMapLink = false, className = '' }) {
  if (!location) return <span>Chưa chọn sân</span>;
  
  const gpsMatch = location.match(/\(GPS:\s*([^,]+),\s*([^\)]+)\)/);
  if (gpsMatch) {
    const lat = gpsMatch[1];
    const lng = gpsMatch[2];
    const cleanLoc = location.replace(/\s*\(GPS:[^\)]+\)/, '').trim();
    
    if (showMapLink) {
      return (
        <div className={`flex flex-col gap-1.5 ${className}`}>
          <span>{cleanLoc}</span>
          <a 
            href={`https://www.google.com/maps/search/?api=1&query=${lat},${lng}`} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-xs px-3 py-1.5 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors flex items-center gap-1.5 w-fit font-medium border border-blue-100 dark:border-blue-900/30"
            onClick={(e) => e.stopPropagation()}
          >
            <FiMapPin size={12} /> Xem trên Google Maps
          </a>
        </div>
      );
    }
    return <span className={className}>{cleanLoc}</span>;
  }
  
  return <span className={className}>{location}</span>;
}
