import React from 'react';
import { useHotel } from '../context/HotelContext';
import { BedDouble, UserCheck, LogOut, DollarSign, Sparkles } from 'lucide-react';

export const DashboardStats: React.FC<{
  onSelectFilter?: (filter: string) => void;
}> = () => {
  const { rooms, bookings, folios, payments } = useHotel();

  const totalRooms = rooms.length;
  const occupiedRooms = rooms.filter((r) => r.status === 'occupied').length;
  const occupancyRate = Math.round((occupiedRooms / totalRooms) * 100);

  const today = '2026-10-13';
  const arrivalsToday = bookings.filter((b) => b.checkInDate === today && b.status === 'confirmed').length;
  const departuresToday = bookings.filter((b) => b.checkOutDate === today && b.status === 'checked_in').length;
  const roomsCleaning = rooms.filter((r) => r.status === 'cleaning').length;

  // Compute total active in-house pending balance
  const activeBookingIds = bookings.filter((b) => b.status === 'checked_in').map((b) => b.id);
  const activeCharges = folios
    .filter((f) => activeBookingIds.includes(f.bookingId))
    .reduce((sum, f) => sum + f.amount, 0);
  const activePayments = payments
    .filter((p) => activeBookingIds.includes(p.bookingId))
    .reduce((sum, p) => sum + p.amount, 0);
  const activePendingBalance = Math.max(0, activeCharges - activePayments);

  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-3 p-4 bg-neutral-900 border border-neutral-800 rounded-lg">
      
      {/* Occupancy Rate */}
      <div className="p-3 bg-neutral-950/60 rounded border border-neutral-800/80">
        <div className="flex items-center justify-between text-neutral-400 text-xs mb-1">
          <span>Occupancy</span>
          <BedDouble className="w-3.5 h-3.5 text-amber-400" />
        </div>
        <div className="text-xl font-bold text-white tabular-nums tracking-tight">
          {occupancyRate}%
        </div>
        <div className="text-[11px] text-neutral-500 mt-1">
          <span>{occupiedRooms} occupied</span>
          <span className="mx-1" aria-hidden="true">·</span>
          <span>{totalRooms - occupiedRooms} available</span>
        </div>
      </div>

      {/* Today's Arrivals */}
      <div className="p-3 bg-neutral-950/60 rounded border border-neutral-800/80">
        <div className="flex items-center justify-between text-neutral-400 text-xs mb-1">
          <span>Arriving Today</span>
          <UserCheck className="w-3.5 h-3.5 text-sky-400" />
        </div>
        <div className="text-xl font-bold text-white tabular-nums tracking-tight">
          {arrivalsToday}
        </div>
        <div className="text-[11px] text-neutral-500 mt-1">
          <span>Awaiting check-in</span>
          <span className="mx-1" aria-hidden="true">·</span>
          <span>Ready for auto kiosk</span>
        </div>
      </div>

      {/* Today's Departures */}
      <div className="p-3 bg-neutral-950/60 rounded border border-neutral-800/80">
        <div className="flex items-center justify-between text-neutral-400 text-xs mb-1">
          <span>Departing Today</span>
          <LogOut className="w-3.5 h-3.5 text-orange-400" />
        </div>
        <div className="text-xl font-bold text-white tabular-nums tracking-tight">
          {departuresToday}
        </div>
        <div className="text-[11px] text-neutral-500 mt-1">
          <span>Pending express checkout</span>
        </div>
      </div>

      {/* In-House Folio Ledger Balance */}
      <div className="p-3 bg-neutral-950/60 rounded border border-neutral-800/80">
        <div className="flex items-center justify-between text-neutral-400 text-xs mb-1">
          <span>In-House Ledger</span>
          <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
        </div>
        <div className="text-xl font-bold text-white tabular-nums tracking-tight">
          ${activePendingBalance.toLocaleString()}
        </div>
        <div className="text-[11px] text-neutral-500 mt-1">
          <span>Unsettled charges</span>
          <span className="mx-1" aria-hidden="true">·</span>
          <span>In-house guests</span>
        </div>
      </div>

      {/* Housekeeping Turnover */}
      <div className="p-3 bg-neutral-950/60 rounded border border-neutral-800/80 col-span-2 md:col-span-1">
        <div className="flex items-center justify-between text-neutral-400 text-xs mb-1">
          <span>Turnover Queue</span>
          <Sparkles className="w-3.5 h-3.5 text-yellow-400" />
        </div>
        <div className="text-xl font-bold text-white tabular-nums tracking-tight">
          {roomsCleaning}
        </div>
        <div className="text-[11px] text-neutral-500 mt-1">
          <span>Rooms being serviced</span>
        </div>
      </div>

    </div>
  );
};
