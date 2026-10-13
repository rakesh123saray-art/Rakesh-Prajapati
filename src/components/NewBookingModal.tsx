import React, { useState } from 'react';
import { useHotel } from '../context/HotelContext';
import { HOTEL_INFO } from '../data/mockData';
import { Calendar, User, Mail, Phone, Shield, BedDouble, Check } from 'lucide-react';

interface NewBookingModalProps {
  initialRoomId?: string;
  onClose: () => void;
  onBookingCreated?: (bookingId: string) => void;
}

export const NewBookingModal: React.FC<NewBookingModalProps> = ({
  initialRoomId,
  onClose,
  onBookingCreated,
}) => {
  const { rooms, createBooking, autoCheckInBooking } = useHotel();

  const todayStr = '2026-10-13';
  const tomorrowStr = '2026-10-15';

  const [guestName, setGuestName] = useState('');
  const [guestEmail, setGuestEmail] = useState('');
  const [guestPhone, setGuestPhone] = useState('');
  const [guestIdType, setGuestIdType] = useState<'Passport' | 'National ID' | 'Driving License'>('Passport');
  const [guestIdNumber, setGuestIdNumber] = useState('');
  const [roomId, setRoomId] = useState(initialRoomId || (rooms.find((r) => r.status === 'available')?.id || rooms[0].id));
  const [checkInDate, setCheckInDate] = useState(todayStr);
  const [checkOutDate, setCheckOutDate] = useState(tomorrowStr);
  const [guestCount, setGuestCount] = useState(1);
  const [specialRequests, setSpecialRequests] = useState('');
  const [createdBooking, setCreatedBooking] = useState<any>(null);

  // Compute stay duration
  const start = new Date(checkInDate);
  const end = new Date(checkOutDate);
  const diffTime = Math.max(0, end.getTime() - start.getTime());
  const nights = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));

  const selectedRoom = rooms.find((r) => r.id === roomId);
  const baseRate = selectedRoom ? selectedRoom.baseRate : 240;
  const roomSubtotal = baseRate * nights;
  const roomTax = Math.round(roomSubtotal * HOTEL_INFO.roomTaxRate * 100) / 100;
  const serviceCharge = Math.round(roomSubtotal * HOTEL_INFO.serviceChargeRate * 100) / 100;
  const estimatedTotal = Math.round((roomSubtotal + roomTax + serviceCharge) * 100) / 100;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!guestName || !guestEmail || !guestIdNumber || !selectedRoom) return;

    const newBk = createBooking({
      guestName,
      guestEmail,
      guestPhone: guestPhone || '+1 (555) 000-0000',
      guestIdType,
      guestIdNumber,
      roomId: selectedRoom.id,
      checkInDate,
      checkOutDate,
      guestCount,
      specialRequests,
    });

    setCreatedBooking(newBk);
    if (onBookingCreated) {
      onBookingCreated(newBk.id);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-neutral-900 border border-neutral-800 rounded-xl shadow-2xl overflow-hidden my-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-800 bg-neutral-950">
          <div>
            <h3 className="text-base font-bold text-white tracking-tight">
              Create New Room Reservation
            </h3>
            <p className="text-xs text-neutral-400">
              Direct booking engine with automated room folio billing
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded text-neutral-400 hover:text-white flex items-center justify-center transition-colors"
          >
            ✕
          </button>
        </div>

        {/* If reservation just created, show confirmation card */}
        {createdBooking ? (
          <div className="p-8 space-y-6 text-center animate-in fade-in zoom-in-95">
            <div className="w-12 h-12 mx-auto rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Check className="w-6 h-6" />
            </div>

            <div className="space-y-1">
              <h4 className="text-xl font-bold text-white">Booking Confirmed!</h4>
              <p className="text-xs text-neutral-400">
                Reservation recorded and synchronized across PMS matrix.
              </p>
            </div>

            <div className="max-w-md mx-auto p-4 bg-neutral-950 rounded-xl border border-neutral-800 text-left space-y-2 text-xs">
              <div className="flex justify-between items-center pb-2 border-b border-neutral-800">
                <span className="text-neutral-400">Confirmation Code:</span>
                <span className="font-mono text-base font-bold text-amber-400">
                  {createdBooking.confirmationCode}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500">Guest:</span>
                <span className="text-neutral-200 font-semibold">{createdBooking.guestName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500">Room:</span>
                <span className="text-white font-mono">#{createdBooking.roomNumber} ({createdBooking.roomTier})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500">Dates:</span>
                <span className="text-neutral-300 font-mono">{createdBooking.checkInDate} → {createdBooking.checkOutDate} ({createdBooking.nights} Nights)</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-neutral-800">
                <span className="text-neutral-400 font-medium">Estimated Stay Total:</span>
                <span className="font-mono text-emerald-400 font-bold">${estimatedTotal.toFixed(2)}</span>
              </div>
            </div>

            <div className="flex justify-center gap-3 pt-2">
              {createdBooking.checkInDate === todayStr && (
                <button
                  onClick={() => {
                    autoCheckInBooking(createdBooking.id);
                    alert(`Guest ${createdBooking.guestName} checked in. Digital Keycard generated!`);
                    onClose();
                  }}
                  className="px-4 py-2 bg-amber-400 hover:bg-amber-300 text-neutral-950 font-bold text-xs rounded transition-colors"
                >
                  Check In Guest Now
                </button>
              )}
              <button
                onClick={onClose}
                className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-white font-semibold text-xs rounded transition-colors"
              >
                Done
              </button>
            </div>
          </div>
        ) : (
          /* Form */
          <form onSubmit={handleSubmit} className="p-6 space-y-5 text-xs">
            
            {/* Guest Identity */}
            <div className="space-y-3">
              <h4 className="text-xs font-semibold text-neutral-400 uppercase tracking-wider flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-amber-400" />
                <span>Guest Information</span>
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-neutral-400 block mb-1">Full Legal Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Liam Henderson"
                    value={guestName}
                    onChange={(e) => setGuestName(e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-700 rounded px-3 py-2 text-white placeholder-neutral-500"
                  />
                </div>

                <div>
                  <label className="text-neutral-400 block mb-1">Email Address *</label>
                  <input
                    type="email"
                    required
                    placeholder="e.g. liam@hendersongroup.com"
                    value={guestEmail}
                    onChange={(e) => setGuestEmail(e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-700 rounded px-3 py-2 text-white placeholder-neutral-500"
                  />
                </div>

                <div>
                  <label className="text-neutral-400 block mb-1">Phone Number</label>
                  <input
                    type="tel"
                    placeholder="+1 (555) 782-9900"
                    value={guestPhone}
                    onChange={(e) => setGuestPhone(e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-700 rounded px-3 py-2 text-white placeholder-neutral-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-neutral-400 block mb-1">ID Type</label>
                    <select
                      value={guestIdType}
                      onChange={(e) => setGuestIdType(e.target.value as any)}
                      className="w-full bg-neutral-950 border border-neutral-700 rounded px-2.5 py-2 text-white text-xs"
                    >
                      <option value="Passport">Passport</option>
                      <option value="National ID">National ID</option>
                      <option value="Driving License">Driving License</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-neutral-400 block mb-1">ID / Passport # *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. P9912048"
                      value={guestIdNumber}
                      onChange={(e) => setGuestIdNumber(e.target.value)}
                      className="w-full bg-neutral-950 border border-neutral-700 rounded px-3 py-2 text-white placeholder-neutral-500 font-mono"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Room & Stay Dates */}
            <div className="space-y-3 pt-3 border-t border-neutral-800">
              <h4 className="text-xs font-semibold text-neutral-400 uppercase tracking-wider flex items-center gap-1.5">
                <BedDouble className="w-3.5 h-3.5 text-amber-400" />
                <span>Suite & Stay Schedule</span>
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-3">
                  <label className="text-neutral-400 block mb-1">Select Suite</label>
                  <select
                    value={roomId}
                    onChange={(e) => setRoomId(e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-700 rounded px-3 py-2 text-white text-xs"
                  >
                    {rooms.map((r) => (
                      <option key={r.id} value={r.id}>
                        Room #{r.roomNumber} - {r.tier} (${r.baseRate}/night) [{r.status}]
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-neutral-400 block mb-1">Check-in Date</label>
                  <input
                    type="date"
                    required
                    value={checkInDate}
                    onChange={(e) => setCheckInDate(e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-700 rounded px-3 py-2 text-white font-mono"
                  />
                </div>

                <div>
                  <label className="text-neutral-400 block mb-1">Check-out Date</label>
                  <input
                    type="date"
                    required
                    value={checkOutDate}
                    onChange={(e) => setCheckOutDate(e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-700 rounded px-3 py-2 text-white font-mono"
                  />
                </div>

                <div>
                  <label className="text-neutral-400 block mb-1">Guests</label>
                  <input
                    type="number"
                    min="1"
                    max="4"
                    value={guestCount}
                    onChange={(e) => setGuestCount(parseInt(e.target.value, 10) || 1)}
                    className="w-full bg-neutral-950 border border-neutral-700 rounded px-3 py-2 text-white font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="text-neutral-400 block mb-1">Special Requests & In-Room Notes</label>
                <input
                  type="text"
                  placeholder="e.g. Quiet floor, hypoallergenic pillows, airport pickup"
                  value={specialRequests}
                  onChange={(e) => setSpecialRequests(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-700 rounded px-3 py-2 text-white placeholder-neutral-500"
                />
              </div>
            </div>

            {/* Estimated Rate Ledger Summary */}
            <div className="p-3.5 bg-neutral-950 border border-neutral-800 rounded-lg flex items-center justify-between text-xs">
              <div>
                <span className="text-neutral-400 block">
                  {nights} Nights @ ${baseRate}/night + 12% Tax & 5% Service
                </span>
                <span className="text-neutral-500 text-[11px]">
                  Night 1 deposit auto-posted to guest folio upon reservation
                </span>
              </div>
              <div className="text-right">
                <span className="text-base font-bold font-mono text-amber-400 tabular-nums">
                  ${estimatedTotal.toFixed(2)}
                </span>
                <span className="text-[10px] text-neutral-400 block">Total Est.</span>
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 font-semibold text-xs rounded transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-amber-400 hover:bg-amber-300 text-neutral-950 font-bold text-xs rounded transition-colors shadow"
              >
                Confirm Reservation & Open Folio
              </button>
            </div>

          </form>
        )}

      </div>
    </div>
  );
};
