import React, { useState } from 'react';
import { useHotel } from '../context/HotelContext';
import { Room, RoomStatus } from '../types/hotel';
import { 
  CheckCircle2, 
  UserCheck, 
  Sparkles, 
  Wrench, 
  Clock, 
  KeyRound, 
  CreditCard, 
  LogOut, 
  ChevronRight,
  ShieldCheck,
  Plus
} from 'lucide-react';

interface RoomGridProps {
  onOpenFolio: (bookingId: string) => void;
  onOpenNewBookingWithRoom?: (roomId: string) => void;
}

export const RoomGrid: React.FC<RoomGridProps> = ({
  onOpenFolio,
  onOpenNewBookingWithRoom,
}) => {
  const { 
    rooms, 
    bookings, 
    autoCheckInBooking, 
    expressCheckOutBooking, 
    updateRoomStatus 
  } = useHotel();

  const [statusFilter, setStatusFilter] = useState<'all' | RoomStatus>('all');
  const [selectedFloor, setSelectedFloor] = useState<number | 'all'>('all');
  const [activeRoomModal, setActiveRoomModal] = useState<Room | null>(null);
  const [showStatusMenu, setShowStatusMenu] = useState(false);

  // Filtered rooms
  const filteredRooms = rooms.filter((room) => {
    const matchesStatus = statusFilter === 'all' || room.status === statusFilter;
    const matchesFloor = selectedFloor === 'all' || room.floor === selectedFloor;
    return matchesStatus && matchesFloor;
  });

  const getStatusBadge = (status: RoomStatus) => {
    switch (status) {
      case 'available':
        return (
          <span className="text-xs text-emerald-400 font-medium flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>Available</span>
          </span>
        );
      case 'occupied':
        return (
          <span className="text-xs text-amber-400 font-medium flex items-center gap-1">
            <UserCheck className="w-3.5 h-3.5 text-amber-400" />
            <span>Occupied</span>
          </span>
        );
      case 'reserved':
        return (
          <span className="text-xs text-sky-400 font-medium flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-sky-400" />
            <span>Reserved Today</span>
          </span>
        );
      case 'cleaning':
        return (
          <span className="text-xs text-yellow-400 font-medium flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-yellow-400" />
            <span>Cleaning</span>
          </span>
        );
      case 'maintenance':
        return (
          <span className="text-xs text-rose-400 font-medium flex items-center gap-1">
            <Wrench className="w-3.5 h-3.5 text-rose-400" />
            <span>Maintenance</span>
          </span>
        );
    }
  };

  const getRoomBooking = (room: Room) => {
    if (room.currentBookingId) {
      return bookings.find((b) => b.id === room.currentBookingId);
    }
    // Fallback: check if any active or reserved booking for this room exists
    return bookings.find(
      (b) => b.roomId === room.id && (b.status === 'checked_in' || b.status === 'confirmed')
    );
  };

  return (
    <div className="space-y-6">
      
      {/* Filter and floor controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-neutral-800">
        <div>
          <h2 className="text-lg font-semibold text-white tracking-tight">
            Room Inventory & Live Matrix
          </h2>
          <div className="flex items-center gap-2 text-xs text-neutral-400 mt-0.5">
            <span>16 Master Suites</span>
            <span aria-hidden="true">·</span>
            <span>4 Levels</span>
            <span aria-hidden="true">·</span>
            <span>Keyless Smart Lock System</span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Status Filter segmented buttons */}
          <div className="flex items-center gap-1 p-1 bg-neutral-900 border border-neutral-800 rounded-lg text-xs">
            {(['all', 'available', 'occupied', 'reserved', 'cleaning'] as const).map((filter) => (
              <button
                key={filter}
                onClick={() => setStatusFilter(filter)}
                className={`px-2.5 py-1 font-medium rounded transition-colors whitespace-nowrap capitalize ${
                  statusFilter === filter
                    ? 'bg-neutral-800 text-amber-400 shadow-sm'
                    : 'text-neutral-400 hover:text-neutral-200'
                }`}
              >
                {filter === 'all' ? 'All Status' : filter}
              </button>
            ))}
          </div>

          {/* Floor selector */}
          <div className="flex items-center gap-1 p-1 bg-neutral-900 border border-neutral-800 rounded-lg text-xs">
            <button
              onClick={() => setSelectedFloor('all')}
              className={`px-2.5 py-1 font-medium rounded transition-colors whitespace-nowrap ${
                selectedFloor === 'all'
                  ? 'bg-neutral-800 text-amber-400 shadow-sm'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              All Floors
            </button>
            {[4, 3, 2, 1].map((fl) => (
              <button
                key={fl}
                onClick={() => setSelectedFloor(fl)}
                className={`px-2 py-1 font-medium rounded transition-colors tabular-nums ${
                  selectedFloor === fl
                    ? 'bg-neutral-800 text-amber-400 shadow-sm'
                    : 'text-neutral-400 hover:text-neutral-200'
                }`}
              >
                F{fl}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Grid of Room Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {filteredRooms.map((room) => {
          const booking = getRoomBooking(room);

          return (
            <div
              key={room.id}
              onClick={() => setActiveRoomModal(room)}
              className="group cursor-pointer bg-neutral-900 border border-neutral-800 rounded-lg overflow-hidden hover:border-neutral-700 transition-all flex flex-col justify-between"
            >
              {/* Room Header with Image */}
              <div className="relative h-36 bg-neutral-950 overflow-hidden">
                <img
                  src={room.image}
                  alt={`Room ${room.roomNumber}`}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-neutral-950/90 via-neutral-950/30 to-transparent" />
                
                {/* Room Number & Tier tag */}
                <div className="absolute top-2.5 left-2.5 flex items-center gap-2">
                  <span className="px-2 py-0.5 text-xs font-mono font-bold bg-neutral-950/80 text-white border border-neutral-700/60 rounded">
                    #{room.roomNumber}
                  </span>
                  <span className="text-[11px] font-mono text-neutral-300 bg-neutral-950/70 px-1.5 py-0.5 rounded">
                    F{room.floor}
                  </span>
                </div>

                <div className="absolute top-2.5 right-2.5 bg-neutral-950/80 px-2 py-0.5 rounded border border-neutral-700/40">
                  {getStatusBadge(room.status)}
                </div>

                {/* Price & Tier at bottom of image */}
                <div className="absolute bottom-2 left-2.5 right-2.5 flex items-end justify-between">
                  <div className="truncate pr-2">
                    <p className="text-xs font-semibold text-white truncate">{room.tier}</p>
                    <p className="text-[11px] text-neutral-400 truncate">{room.bedType}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-xs font-mono font-semibold text-amber-400 tabular-nums">
                      ${room.baseRate}
                    </span>
                    <span className="text-[10px] text-neutral-400">/nt</span>
                  </div>
                </div>
              </div>

              {/* Room Status Details & Actions Preview */}
              <div className="p-3 bg-neutral-900 flex-1 flex flex-col justify-between">
                {room.status === 'occupied' && booking ? (
                  <div className="space-y-1.5 text-xs">
                    <div className="flex items-center justify-between text-neutral-300 font-medium truncate">
                      <span className="truncate">{booking.guestName}</span>
                      <span className="text-[11px] text-neutral-500 shrink-0 font-mono">
                        {booking.nights}n
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-neutral-500">
                      <span>Checkout: {booking.checkOutDate}</span>
                      {booking.pinCode && (
                        <span className="font-mono text-amber-400/90 flex items-center gap-1">
                          <KeyRound className="w-3 h-3" />
                          PIN {booking.pinCode}
                        </span>
                      )}
                    </div>
                  </div>
                ) : room.status === 'reserved' && booking ? (
                  <div className="space-y-1 text-xs">
                    <div className="flex items-center justify-between text-sky-300 font-medium truncate">
                      <span className="truncate">{booking.guestName}</span>
                      <span className="text-[10px] font-mono text-sky-400/80">
                        {booking.confirmationCode}
                      </span>
                    </div>
                    <p className="text-[11px] text-neutral-400">
                      Arrival today · Ready for check-in
                    </p>
                  </div>
                ) : room.status === 'cleaning' ? (
                  <div className="text-xs text-yellow-400/90 flex items-center justify-between py-1">
                    <span>Housekeeping in progress</span>
                    <Sparkles className="w-3.5 h-3.5 text-yellow-400" />
                  </div>
                ) : room.status === 'maintenance' ? (
                  <div className="text-xs text-rose-400/90 flex items-center justify-between py-1">
                    <span>Under Maintenance</span>
                    <Wrench className="w-3.5 h-3.5 text-rose-400" />
                  </div>
                ) : (
                  <div className="text-xs text-neutral-400 flex items-center justify-between py-1">
                    <span className="text-emerald-400">Cleaned & Inspected</span>
                    <span className="text-[11px] text-neutral-500">Ready for guest</span>
                  </div>
                )}

                {/* Bottom Trigger */}
                <div className="mt-3 pt-2 border-t border-neutral-800/80 flex items-center justify-between text-[11px] text-neutral-400 group-hover:text-amber-400 transition-colors">
                  <span>Room Details & Operations</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Active Room Detail & Operations Modal */}
      {activeRoomModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="relative w-full max-w-xl bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            
            {/* Modal Image Header */}
            <div className="relative h-48 bg-neutral-950">
              <img
                src={activeRoomModal.image}
                alt={`Room ${activeRoomModal.roomNumber}`}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-neutral-900 via-neutral-900/40 to-transparent" />
              
              <button
                onClick={() => { setActiveRoomModal(null); setShowStatusMenu(false); }}
                className="absolute top-3 right-3 w-8 h-8 rounded-full bg-neutral-950/80 text-neutral-400 hover:text-white flex items-center justify-center border border-neutral-800"
              >
                ✕
              </button>

              <div className="absolute bottom-3 left-4 right-4 flex items-end justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-mono font-bold bg-amber-400 text-neutral-950 px-2 py-0.5 rounded">
                      Room #{activeRoomModal.roomNumber}
                    </span>
                    <span className="text-xs text-neutral-300">
                      Floor {activeRoomModal.floor}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-white">
                    {activeRoomModal.tier}
                  </h3>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold font-mono text-amber-400 tabular-nums">
                    ${activeRoomModal.baseRate}
                  </div>
                  <div className="text-xs text-neutral-400">per night</div>
                </div>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-5 space-y-4 max-h-[65vh] overflow-y-auto">
              
              {/* Room Specifications */}
              <div className="grid grid-cols-2 gap-3 text-xs bg-neutral-950/60 p-3 rounded-lg border border-neutral-800">
                <div>
                  <span className="text-neutral-500 block">Bed Setup:</span>
                  <span className="text-neutral-200 font-medium">{activeRoomModal.bedType}</span>
                </div>
                <div>
                  <span className="text-neutral-500 block">Current Status:</span>
                  <div className="mt-0.5">{getStatusBadge(activeRoomModal.status)}</div>
                </div>
                <div>
                  <span className="text-neutral-500 block">Capacity:</span>
                  <span className="text-neutral-200 font-medium">Up to {activeRoomModal.maxGuests} Guests</span>
                </div>
                <div>
                  <span className="text-neutral-500 block">Housekeeping:</span>
                  <span className="text-neutral-200 font-medium">
                    {activeRoomModal.lastCleaned ? `Inspected ${activeRoomModal.lastCleaned}` : 'Standard schedule'}
                  </span>
                </div>
              </div>

              {/* Amenities list */}
              <div>
                <h4 className="text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-2">
                  Suite Amenities
                </h4>
                <div className="flex flex-wrap gap-1.5 text-xs text-neutral-300">
                  {activeRoomModal.amenities.map((amenity, i) => (
                    <span
                      key={i}
                      className="px-2.5 py-1 bg-neutral-800/80 border border-neutral-700/50 rounded text-neutral-300"
                    >
                      {amenity}
                    </span>
                  ))}
                </div>
              </div>

              {/* Occupant / Reservation Section */}
              {(() => {
                const booking = getRoomBooking(activeRoomModal);

                if (booking) {
                  return (
                    <div className="p-3.5 bg-neutral-950 border border-neutral-800 rounded-lg space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">
                          {booking.status === 'checked_in' ? 'Current Resident' : 'Upcoming Arrival'}
                        </div>
                        <span className="font-mono text-xs text-amber-400">
                          {booking.confirmationCode}
                        </span>
                      </div>

                      <div className="flex items-start justify-between">
                        <div>
                          <p className="text-sm font-bold text-white">{booking.guestName}</p>
                          <p className="text-xs text-neutral-400">{booking.guestEmail} · {booking.guestPhone}</p>
                          <p className="text-xs text-neutral-500 mt-1">
                            {booking.guestIdType}: {booking.guestIdNumber}
                          </p>
                        </div>
                        <div className="text-right text-xs">
                          <p className="text-neutral-400">Stay Duration</p>
                          <p className="font-medium text-white">{booking.nights} Nights</p>
                          <p className="text-[11px] text-neutral-500">{booking.checkInDate} to {booking.checkOutDate}</p>
                        </div>
                      </div>

                      {booking.digitalKeyIssued && (
                        <div className="p-2.5 bg-neutral-900 border border-amber-500/20 rounded flex items-center justify-between text-xs">
                          <div className="flex items-center gap-2 text-neutral-300">
                            <ShieldCheck className="w-4 h-4 text-emerald-400" />
                            <span>Digital Smart Key Active</span>
                          </div>
                          <div className="font-mono text-amber-400 font-bold">
                            PIN: {booking.pinCode}
                          </div>
                        </div>
                      )}

                      {booking.specialRequests && (
                        <div className="text-xs text-neutral-400 italic bg-neutral-900/60 p-2 rounded border border-neutral-800">
                          "{booking.specialRequests}"
                        </div>
                      )}

                      {/* Modal Action Buttons for Existing Booking */}
                      <div className="pt-2 flex flex-wrap gap-2">
                        {booking.status === 'confirmed' && (
                          <button
                            onClick={() => {
                              const updated = autoCheckInBooking(booking.id);
                              if (updated) {
                                alert(`Guest ${updated.guestName} successfully checked into Room ${updated.roomNumber}! Digital Key & PIN issued: ${updated.pinCode}`);
                                setActiveRoomModal(null);
                              }
                            }}
                            className="flex-1 inline-flex items-center justify-center gap-2 px-3 py-2 text-xs font-semibold text-neutral-950 bg-amber-400 hover:bg-amber-300 rounded-md transition-colors"
                          >
                            <UserCheck className="w-4 h-4" />
                            <span>Automated Check-in</span>
                          </button>
                        )}

                        <button
                          onClick={() => {
                            setActiveRoomModal(null);
                            onOpenFolio(booking.id);
                          }}
                          className="flex-1 inline-flex items-center justify-center gap-2 px-3 py-2 text-xs font-semibold text-white bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 rounded-md transition-colors"
                        >
                          <CreditCard className="w-4 h-4" />
                          <span>View Folio & Bill</span>
                        </button>

                        {booking.status === 'checked_in' && (
                          <button
                            onClick={() => {
                              if (window.confirm(`Perform Express Checkout for ${booking.guestName}? Room will be scheduled for turnover cleaning.`)) {
                                expressCheckOutBooking(booking.id, 'Credit Card (Visa/Mastercard)');
                                alert(`Guest ${booking.guestName} has been checked out. Room ${booking.roomNumber} status moved to Cleaning.`);
                                setActiveRoomModal(null);
                              }
                            }}
                            className="inline-flex items-center justify-center gap-2 px-3 py-2 text-xs font-semibold text-rose-300 bg-rose-950/60 hover:bg-rose-900/60 border border-rose-800/60 rounded-md transition-colors"
                          >
                            <LogOut className="w-4 h-4" />
                            <span>Express Checkout</span>
                          </button>
                        )}
                      </div>
                    </div>
                  );
                }

                // If Room is available or cleaning with no active occupant
                return (
                  <div className="space-y-3 pt-1">
                    {activeRoomModal.status === 'available' && (
                      <button
                        onClick={() => {
                          const rId = activeRoomModal.id;
                          setActiveRoomModal(null);
                          if (onOpenNewBookingWithRoom) {
                            onOpenNewBookingWithRoom(rId);
                          }
                        }}
                        className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-semibold text-neutral-950 bg-amber-400 hover:bg-amber-300 rounded-md transition-colors"
                      >
                        <Plus className="w-4 h-4" />
                        <span>Book Room #{activeRoomModal.roomNumber}</span>
                      </button>
                    )}

                    {activeRoomModal.status === 'cleaning' && (
                      <button
                        onClick={() => {
                          updateRoomStatus(activeRoomModal.id, 'available');
                          alert(`Room ${activeRoomModal.roomNumber} marked as clean and ready for arrivals.`);
                          setActiveRoomModal(null);
                        }}
                        className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-semibold text-emerald-950 bg-emerald-400 hover:bg-emerald-300 rounded-md transition-colors"
                      >
                        <Sparkles className="w-4 h-4" />
                        <span>Complete Inspection & Mark Available</span>
                      </button>
                    )}
                  </div>
                );
              })()}

              {/* Front Desk Room Status Manual Override */}
              <div className="pt-2 border-t border-neutral-800">
                <div className="flex items-center justify-between text-xs text-neutral-400 mb-2">
                  <span>Front Desk Status Override</span>
                  <button
                    onClick={() => setShowStatusMenu(!showStatusMenu)}
                    className="text-amber-400 hover:underline"
                  >
                    {showStatusMenu ? 'Hide Options' : 'Change Status'}
                  </button>
                </div>

                {showStatusMenu && (
                  <div className="grid grid-cols-4 gap-1.5">
                    {(['available', 'occupied', 'cleaning', 'maintenance'] as RoomStatus[]).map((st) => (
                      <button
                        key={st}
                        onClick={() => {
                          updateRoomStatus(activeRoomModal.id, st);
                          setActiveRoomModal({ ...activeRoomModal, status: st });
                          setShowStatusMenu(false);
                        }}
                        className={`px-2 py-1.5 text-xs rounded border capitalize transition-colors ${
                          activeRoomModal.status === st
                            ? 'bg-neutral-800 border-amber-400 text-amber-400 font-medium'
                            : 'bg-neutral-950 border-neutral-800 text-neutral-400 hover:text-white'
                        }`}
                      >
                        {st}
                      </button>
                    ))}
                  </div>
                )}
              </div>

            </div>

          </div>
        </div>
      )}

    </div>
  );
};
