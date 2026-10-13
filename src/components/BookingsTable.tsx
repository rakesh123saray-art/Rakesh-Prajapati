import React, { useState } from 'react';
import { useHotel } from '../context/HotelContext';
import { Booking, BookingStatus } from '../types/hotel';
import { 
  Search, 
  UserCheck, 
  Receipt, 
  LogOut, 
  KeyRound, 
  Check, 
  Calendar,
  AlertCircle 
} from 'lucide-react';

interface BookingsTableProps {
  onOpenFolio: (bookingId: string) => void;
  onOpenNewBooking: () => void;
}

export const BookingsTable: React.FC<BookingsTableProps> = ({
  onOpenFolio,
  onOpenNewBooking,
}) => {
  const { 
    bookings, 
    autoCheckInBooking, 
    expressCheckOutBooking, 
    getFolioSummaryForBooking 
  } = useHotel();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'arrivals' | 'in_house' | 'departures' | 'checked_out'>('all');
  const [selectedKeycardModal, setSelectedKeycardModal] = useState<Booking | null>(null);

  const today = '2026-10-13';

  // Filter logic
  const filteredBookings = bookings.filter((b) => {
    // Search query
    const matchesSearch =
      b.guestName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.confirmationCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.roomNumber.includes(searchQuery) ||
      b.guestEmail.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    if (statusFilter === 'all') return true;
    if (statusFilter === 'arrivals') return b.checkInDate === today && b.status === 'confirmed';
    if (statusFilter === 'in_house') return b.status === 'checked_in';
    if (statusFilter === 'departures') return b.checkOutDate === today && b.status === 'checked_in';
    if (statusFilter === 'checked_out') return b.status === 'checked_out';
    return true;
  });

  const getStatusLabel = (status: BookingStatus) => {
    switch (status) {
      case 'confirmed':
        return <span className="text-xs text-sky-400 font-medium">Reserved</span>;
      case 'checked_in':
        return <span className="text-xs text-amber-400 font-medium">In-House</span>;
      case 'checked_out':
        return <span className="text-xs text-neutral-400 font-medium">Checked Out</span>;
      case 'cancelled':
        return <span className="text-xs text-rose-400 font-medium">Cancelled</span>;
    }
  };

  return (
    <div className="space-y-4">
      {/* Table Header and Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-neutral-800">
        <div>
          <h2 className="text-lg font-semibold text-white tracking-tight">
            Guest Reservations & Arrivals
          </h2>
          <div className="flex items-center gap-2 text-xs text-neutral-400 mt-0.5">
            <span>{bookings.length} Total Bookings</span>
            <span aria-hidden="true">·</span>
            <span>Automated Check-in Available</span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Live Search Input */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search guest, code, room..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-3 py-1.5 text-xs bg-neutral-900 border border-neutral-800 rounded-md text-white placeholder-neutral-500 focus:outline-none focus:border-amber-400 transition-colors w-56"
            />
          </div>

          {/* Filter tabs */}
          <div className="flex items-center gap-1 p-1 bg-neutral-900 border border-neutral-800 rounded-lg text-xs">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-2.5 py-1 font-medium rounded transition-colors ${
                statusFilter === 'all'
                  ? 'bg-neutral-800 text-amber-400 shadow-sm'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setStatusFilter('arrivals')}
              className={`px-2.5 py-1 font-medium rounded transition-colors ${
                statusFilter === 'arrivals'
                  ? 'bg-neutral-800 text-amber-400 shadow-sm'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              Arrivals Today
            </button>
            <button
              onClick={() => setStatusFilter('in_house')}
              className={`px-2.5 py-1 font-medium rounded transition-colors ${
                statusFilter === 'in_house'
                  ? 'bg-neutral-800 text-amber-400 shadow-sm'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              In-House
            </button>
            <button
              onClick={() => setStatusFilter('departures')}
              className={`px-2.5 py-1 font-medium rounded transition-colors ${
                statusFilter === 'departures'
                  ? 'bg-neutral-800 text-amber-400 shadow-sm'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              Departures Today
            </button>
            <button
              onClick={() => setStatusFilter('checked_out')}
              className={`px-2.5 py-1 font-medium rounded transition-colors ${
                statusFilter === 'checked_out'
                  ? 'bg-neutral-800 text-amber-400 shadow-sm'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              Checked Out
            </button>
          </div>
        </div>
      </div>

      {/* Bookings Data Table */}
      <div className="overflow-x-auto bg-neutral-900 border border-neutral-800 rounded-lg">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-neutral-800 bg-neutral-950/60 text-neutral-400">
              <th className="py-3 px-4 font-semibold uppercase tracking-wider text-[11px]">Confirmation</th>
              <th className="py-3 px-4 font-semibold uppercase tracking-wider text-[11px]">Guest Details</th>
              <th className="py-3 px-4 font-semibold uppercase tracking-wider text-[11px]">Suite</th>
              <th className="py-3 px-4 font-semibold uppercase tracking-wider text-[11px]">Stay Dates</th>
              <th className="py-3 px-4 font-semibold uppercase tracking-wider text-[11px]">Status</th>
              <th className="py-3 px-4 font-semibold uppercase tracking-wider text-[11px] text-right">Folio Balance</th>
              <th className="py-3 px-4 font-semibold uppercase tracking-wider text-[11px] text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-800/60">
            {filteredBookings.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-12 text-center text-neutral-500">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <AlertCircle className="w-6 h-6 text-neutral-600" />
                    <p className="text-sm font-medium text-neutral-400">No reservations match this filter</p>
                    <button
                      onClick={onOpenNewBooking}
                      className="mt-2 text-xs text-amber-400 hover:underline"
                    >
                      Create a new reservation
                    </button>
                  </div>
                </td>
              </tr>
            ) : (
              filteredBookings.map((booking) => {
                const folioSummary = getFolioSummaryForBooking(booking.id);

                return (
                  <tr
                    key={booking.id}
                    className="hover:bg-neutral-800/40 transition-colors group"
                  >
                    {/* Confirmation */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      <div className="font-mono font-medium text-amber-400">
                        {booking.confirmationCode}
                      </div>
                      <div className="text-[11px] text-neutral-500 font-mono">
                        {booking.createdAt.split(' ')[0]}
                      </div>
                    </td>

                    {/* Guest Name & Details */}
                    <td className="py-3 px-4">
                      <div className="font-semibold text-white">
                        {booking.guestName}
                      </div>
                      <div className="text-[11px] text-neutral-400 truncate max-w-xs">
                        {booking.guestEmail} · {booking.guestPhone}
                      </div>
                      <div className="text-[10px] text-neutral-500 font-mono mt-0.5">
                        {booking.guestIdType}: {booking.guestIdNumber}
                      </div>
                    </td>

                    {/* Room & Tier */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-1.5 font-medium text-neutral-200">
                        <span className="font-mono text-amber-400">#{booking.roomNumber}</span>
                        <span>·</span>
                        <span className="truncate max-w-[130px]">{booking.roomTier}</span>
                      </div>
                      <div className="text-[11px] text-neutral-500">
                        {booking.guestCount} {booking.guestCount === 1 ? 'Guest' : 'Guests'}
                      </div>
                    </td>

                    {/* Stay Dates */}
                    <td className="py-3 px-4 whitespace-nowrap tabular-nums font-mono text-neutral-300">
                      <div>{booking.checkInDate} → {booking.checkOutDate}</div>
                      <div className="text-[11px] text-neutral-500 font-sans">
                        {booking.nights} {booking.nights === 1 ? 'Night' : 'Nights'}
                      </div>
                    </td>

                    {/* Status & Key Icon */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      <div>{getStatusLabel(booking.status)}</div>
                      {booking.digitalKeyIssued && (
                        <button
                          onClick={() => setSelectedKeycardModal(booking)}
                          className="mt-1 flex items-center gap-1 text-[11px] text-neutral-400 hover:text-amber-400 transition-colors"
                        >
                          <KeyRound className="w-3 h-3 text-emerald-400" />
                          <span className="font-mono">PIN {booking.pinCode}</span>
                        </button>
                      )}
                    </td>

                    {/* Folio Balance */}
                    <td className="py-3 px-4 text-right whitespace-nowrap tabular-nums">
                      <div className={`font-mono font-semibold ${
                        folioSummary.balanceDue > 0 ? 'text-amber-400' : 'text-emerald-400'
                      }`}>
                        ${folioSummary.balanceDue.toFixed(2)}
                      </div>
                      <div className="text-[11px] text-neutral-500">
                        Total: ${folioSummary.totalAmount.toFixed(2)}
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        
                        {/* Auto Check-in if not yet checked in */}
                        {booking.status === 'confirmed' && (
                          <button
                            onClick={() => {
                              const updated = autoCheckInBooking(booking.id);
                              if (updated) {
                                alert(`Automated Check-in complete for ${updated.guestName}! Room #${updated.roomNumber}. Keycard & PIN: ${updated.pinCode}`);
                              }
                            }}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-neutral-950 bg-amber-400 hover:bg-amber-300 rounded transition-colors"
                          >
                            <UserCheck className="w-3.5 h-3.5" />
                            <span>Auto Check-in</span>
                          </button>
                        )}

                        {/* View Folio & Billing */}
                        <button
                          onClick={() => onOpenFolio(booking.id)}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-neutral-200 bg-neutral-800 hover:bg-neutral-700 rounded transition-colors"
                        >
                          <Receipt className="w-3.5 h-3.5" />
                          <span>Folio</span>
                        </button>

                        {/* Express Checkout if in-house */}
                        {booking.status === 'checked_in' && (
                          <button
                            onClick={() => {
                              if (window.confirm(`Perform Express Checkout for ${booking.guestName}? Balance due: $${folioSummary.balanceDue.toFixed(2)}.`)) {
                                expressCheckOutBooking(booking.id, 'Credit Card (Visa/Mastercard)');
                                alert(`Checkout completed for ${booking.guestName}. Room #${booking.roomNumber} moved to cleaning queue.`);
                              }
                            }}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-rose-300 bg-rose-950/60 hover:bg-rose-900/60 border border-rose-800/60 rounded transition-colors"
                          >
                            <LogOut className="w-3.5 h-3.5" />
                            <span>Checkout</span>
                          </button>
                        )}

                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Digital Keycard Details Modal */}
      {selectedKeycardModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-sm bg-neutral-900 border border-neutral-800 rounded-xl p-5 shadow-2xl relative">
            <button
              onClick={() => setSelectedKeycardModal(null)}
              className="absolute top-3 right-3 text-neutral-400 hover:text-white"
            >
              ✕
            </button>

            <div className="text-center space-y-4">
              <div className="w-12 h-12 mx-auto rounded-full bg-amber-400/10 border border-amber-400/30 flex items-center justify-center text-amber-400">
                <KeyRound className="w-6 h-6" />
              </div>

              <div>
                <h3 className="text-base font-bold text-white">Digital Smart Key</h3>
                <p className="text-xs text-neutral-400 mt-0.5">
                  Krishnam Keyless Room Access System
                </p>
              </div>

              <div className="bg-neutral-950 p-4 rounded-lg border border-neutral-800 text-left space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-neutral-500">Guest:</span>
                  <span className="text-neutral-200 font-semibold">{selectedKeycardModal.guestName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500">Assigned Suite:</span>
                  <span className="text-amber-400 font-mono font-bold">Room #{selectedKeycardModal.roomNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500">Electronic Key ID:</span>
                  <span className="text-neutral-300 font-mono text-[11px]">{selectedKeycardModal.keycardCode}</span>
                </div>
                <div className="pt-2 border-t border-neutral-800 flex justify-between items-center">
                  <span className="text-neutral-400 font-medium">Door Keypad PIN:</span>
                  <span className="text-xl font-mono font-bold text-amber-400 tracking-wider">
                    {selectedKeycardModal.pinCode}
                  </span>
                </div>
              </div>

              <div className="text-[11px] text-neutral-500">
                Encrypted NFC key enabled on mobile wallet and door smart lock.
              </div>

              <button
                onClick={() => setSelectedKeycardModal(null)}
                className="w-full py-2 bg-neutral-800 hover:bg-neutral-700 text-white text-xs font-semibold rounded-md transition-colors"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
