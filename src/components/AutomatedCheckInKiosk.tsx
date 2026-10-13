import React, { useState } from 'react';
import { useHotel } from '../context/HotelContext';
import { HOTEL_INFO } from '../data/mockData';
import { 
  Building2, 
  Search, 
  KeyRound, 
  ShieldCheck, 
  Wifi, 
  Printer, 
  Sparkles, 
  Smartphone, 
  CheckCircle2, 
  Clock, 
  Compass, 
  ArrowRight,
  ArrowLeft,
  PenTool,
  Lock,
  Unlock
} from 'lucide-react';

export const AutomatedCheckInKiosk: React.FC = () => {
  const { bookings, rooms, autoCheckInBooking, setActiveMode } = useHotel();

  // Kiosk Steps: 1 = Lookup, 2 = ID Verification, 3 = Room & Preferences, 4 = Digital Signature, 5 = Keycard Issuance, 6 = Success Pass
  const [step, setStep] = useState<number>(1);
  const [searchCode, setSearchCode] = useState('');
  const [searchError, setSearchError] = useState('');
  const [matchedBooking, setMatchedBooking] = useState<any>(null);

  // Preference states
  const [pillowPref, setPillowPref] = useState('Feather Plush');
  const [quietPref, setQuietPref] = useState(true);
  const [optInBreakfast, setOptInBreakfast] = useState(false);

  // Signature state
  const [signatureText, setSignatureText] = useState('');
  const [agreedTerms, setAgreedTerms] = useState(false);

  // Lock test state
  const [doorUnlocked, setDoorUnlocked] = useState(false);
  const [createdBookingResult, setCreatedBookingResult] = useState<any>(null);

  // Filter available today's confirmed bookings for quick demo selection
  const readyBookings = bookings.filter((b) => b.status === 'confirmed');

  const handleLookup = (codeToSearch?: string) => {
    const query = (codeToSearch || searchCode).trim().toUpperCase();
    if (!query) {
      setSearchError('Please enter your confirmation code or last name');
      return;
    }

    const found = bookings.find(
      (b) =>
        b.confirmationCode.toUpperCase() === query ||
        b.guestName.toUpperCase().includes(query) ||
        b.roomNumber === query
    );

    if (!found) {
      setSearchError('No reservation found matching this code. Please check or see the front desk.');
      return;
    }

    if (found.status === 'checked_in') {
      setSearchError(`Guest is already checked into Room ${found.roomNumber}. Visit Front Desk for replacement key.`);
      return;
    }

    if (found.status === 'checked_out') {
      setSearchError('This reservation has already been completed.');
      return;
    }

    setMatchedBooking(found);
    setSearchError('');
    setSignatureText(found.guestName);
    setStep(2);
  };

  const handleCompleteCheckIn = () => {
    if (!matchedBooking) return;
    const result = autoCheckInBooking(matchedBooking.id);
    setCreatedBookingResult(result);
    setStep(5);
  };

  const assignedRoom = matchedBooking
    ? rooms.find((r) => r.id === matchedBooking.roomId)
    : null;

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col justify-between selection:bg-amber-500 selection:text-neutral-950">
      
      {/* Kiosk Brand Top Bar */}
      <header className="px-6 py-4 border-b border-neutral-800/80 bg-neutral-900/40 backdrop-blur flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-neutral-950 font-bold text-base shadow-sm">
            K
          </div>
          <div>
            <div className="text-sm font-bold text-white tracking-wide uppercase">
              {HOTEL_INFO.name}
            </div>
            <div className="text-[11px] text-amber-400 font-medium">
              Automated Express Check-In Terminal
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 text-xs text-neutral-400">
            <Clock className="w-3.5 h-3.5 text-neutral-500" />
            <span>Check-in Active · Standard Checkout 11:00 AM</span>
          </div>
          <button
            onClick={() => setActiveMode('pms')}
            className="px-3 py-1.5 text-xs font-semibold bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded transition-colors"
          >
            Exit to Front Desk PMS
          </button>
        </div>
      </header>

      {/* Main Kiosk Content Area */}
      <main className="flex-1 max-w-3xl w-full mx-auto p-4 sm:p-8 flex flex-col justify-center">

        {/* STEP 1: LOOKUP RESERVATION */}
        {step === 1 && (
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 sm:p-10 shadow-2xl space-y-8 animate-in fade-in duration-200">
            <div className="text-center space-y-2">
              <span className="text-xs uppercase tracking-widest text-amber-400 font-semibold">
                Welcome to Krishnam Hotel
              </span>
              <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                Express Self Check-in
              </h1>
              <p className="text-sm text-neutral-400 max-w-md mx-auto">
                Retrieve your reservation to automatically receive your room assignment and digital key.
              </p>
            </div>

            {/* Input Form */}
            <div className="max-w-md mx-auto space-y-3">
              <label className="text-xs text-neutral-400 font-medium block">
                Booking Confirmation Code or Guest Last Name
              </label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-neutral-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="e.g. KRISH-702B or Sterling"
                    value={searchCode}
                    onChange={(e) => setSearchCode(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleLookup()}
                    className="w-full pl-10 pr-4 py-3 bg-neutral-950 border border-neutral-700 rounded-xl text-white font-mono uppercase text-sm placeholder-neutral-500 focus:outline-none focus:border-amber-400"
                  />
                </div>
                <button
                  onClick={() => handleLookup()}
                  className="px-6 py-3 bg-amber-400 hover:bg-amber-300 text-neutral-950 font-bold text-sm rounded-xl transition-colors shrink-0 shadow"
                >
                  Find
                </button>
              </div>

              {searchError && (
                <p className="text-xs text-rose-400 font-medium animate-in fade-in">
                  {searchError}
                </p>
              )}
            </div>

            {/* Quick Demo Selector for Evaluation */}
            <div className="pt-6 border-t border-neutral-800/80">
              <div className="text-center text-xs text-neutral-500 uppercase tracking-wider mb-3">
                Tap an arriving guest below for instant 1-touch demo
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {readyBookings.map((b) => (
                  <button
                    key={b.id}
                    onClick={() => {
                      setSearchCode(b.confirmationCode);
                      handleLookup(b.confirmationCode);
                    }}
                    className="p-3 bg-neutral-950 hover:bg-neutral-800/80 border border-neutral-800 hover:border-amber-400/50 rounded-xl text-left transition-all group"
                  >
                    <div className="font-semibold text-xs text-white group-hover:text-amber-400 transition-colors">
                      {b.guestName}
                    </div>
                    <div className="text-[11px] font-mono text-neutral-400 mt-0.5">
                      {b.confirmationCode}
                    </div>
                    <div className="text-[10px] text-neutral-500 mt-1">
                      Room #{b.roomNumber} · {b.nights} Nights
                    </div>
                  </button>
                ))}
              </div>
            </div>

          </div>
        )}

        {/* STEP 2: ID & IDENTITY VERIFICATION */}
        {step === 2 && matchedBooking && (
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 sm:p-10 shadow-2xl space-y-6 animate-in fade-in duration-200">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-4">
              <div>
                <span className="text-xs uppercase tracking-wider text-amber-400 font-semibold">
                  Step 1 of 4
                </span>
                <h2 className="text-xl font-bold text-white">Identity Verification</h2>
              </div>
              <button
                onClick={() => setStep(1)}
                className="text-xs text-neutral-400 hover:text-white flex items-center gap-1"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Back
              </button>
            </div>

            {/* Simulated Passport Scanner Box */}
            <div className="p-5 bg-neutral-950 border border-neutral-800 rounded-xl space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-emerald-400" />
                  <span className="text-xs font-semibold text-neutral-200">
                    Optical Document Scanner Sim
                  </span>
                </div>
                <span className="text-xs text-emerald-400 font-mono font-medium">
                  ID MATCHED 100%
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs pt-2 border-t border-neutral-800/60">
                <div>
                  <span className="text-neutral-500 block">Guest Full Legal Name:</span>
                  <span className="text-white font-semibold text-sm">{matchedBooking.guestName}</span>
                </div>
                <div>
                  <span className="text-neutral-500 block">Identification Document:</span>
                  <span className="text-white font-mono">{matchedBooking.guestIdType}: {matchedBooking.guestIdNumber}</span>
                </div>
                <div>
                  <span className="text-neutral-500 block">Contact Email:</span>
                  <span className="text-neutral-300">{matchedBooking.guestEmail}</span>
                </div>
                <div>
                  <span className="text-neutral-500 block">Contact Mobile:</span>
                  <span className="text-neutral-300">{matchedBooking.guestPhone}</span>
                </div>
              </div>
            </div>

            {/* Occupants confirmation */}
            <div className="text-xs text-neutral-400 bg-neutral-950/60 p-3.5 rounded-lg border border-neutral-800/80">
              Registered for <strong className="text-white">{matchedBooking.guestCount} Guest(s)</strong>.
              Key issuance authorizes full access to room amenities, gym, and high-speed Wi-Fi network.
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setStep(3)}
                className="inline-flex items-center gap-2 px-6 py-2.5 bg-amber-400 hover:bg-amber-300 text-neutral-950 font-bold text-xs rounded-lg transition-colors shadow"
              >
                <span>Confirm & Select Preferences</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: ROOM SELECTION & CUSTOMIZATION */}
        {step === 3 && matchedBooking && assignedRoom && (
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 sm:p-10 shadow-2xl space-y-6 animate-in fade-in duration-200">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-4">
              <div>
                <span className="text-xs uppercase tracking-wider text-amber-400 font-semibold">
                  Step 2 of 4
                </span>
                <h2 className="text-xl font-bold text-white">Your Suite Assignment</h2>
              </div>
              <button
                onClick={() => setStep(2)}
                className="text-xs text-neutral-400 hover:text-white flex items-center gap-1"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Back
              </button>
            </div>

            {/* Room Card Preview */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-neutral-950 rounded-xl overflow-hidden border border-neutral-800">
              <div className="h-44 md:h-full relative">
                <img
                  src={assignedRoom.image}
                  alt={assignedRoom.tier}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-3 left-3 bg-neutral-950/80 text-amber-400 font-mono font-bold text-xs px-2.5 py-1 rounded border border-neutral-700">
                  Room #{assignedRoom.roomNumber}
                </div>
              </div>

              <div className="p-4 space-y-3 text-xs flex flex-col justify-between">
                <div>
                  <h3 className="text-base font-bold text-white">{assignedRoom.tier}</h3>
                  <p className="text-neutral-400 mt-0.5">{assignedRoom.bedType}</p>
                  <p className="text-neutral-500 mt-1 font-mono">Floor {assignedRoom.floor} · {matchedBooking.nights} Nights</p>
                </div>

                <div className="space-y-1 pt-2 border-t border-neutral-800">
                  <div className="text-[11px] text-neutral-400 font-medium">Included with your stay:</div>
                  <div className="text-[11px] text-neutral-300 space-y-0.5">
                    <div>✓ High-speed Guest Fiber Wi-Fi</div>
                    <div>✓ Daily Housekeeping & Evening Turn-down</div>
                    <div>✓ Smart Room Keypad & NFC Mobile Access</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Guest In-Room Preferences */}
            <div className="space-y-3">
              <h4 className="text-xs font-semibold text-neutral-300 uppercase tracking-wider">
                Tailor Your Stay Preferences
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                {/* Pillow */}
                <div className="p-3 bg-neutral-950 border border-neutral-800 rounded-lg">
                  <label className="text-neutral-400 block mb-1.5 font-medium">Pillow Selection</label>
                  <select
                    value={pillowPref}
                    onChange={(e) => setPillowPref(e.target.value)}
                    className="w-full text-xs bg-neutral-900 border border-neutral-700 rounded p-1.5 text-white"
                  >
                    <option value="Feather Plush">Feather Plush</option>
                    <option value="Hypoallergenic Foam">Hypoallergenic Foam</option>
                    <option value="Firm Orthopedic">Firm Orthopedic</option>
                  </select>
                </div>

                {/* Quiet Room */}
                <div className="p-3 bg-neutral-950 border border-neutral-800 rounded-lg flex flex-col justify-between">
                  <div className="flex items-center justify-between">
                    <span className="text-neutral-300 font-medium">Do Not Disturb Priority</span>
                    <input
                      type="checkbox"
                      checked={quietPref}
                      onChange={(e) => setQuietPref(e.target.checked)}
                      className="accent-amber-400 w-4 h-4"
                    />
                  </div>
                  <span className="text-[11px] text-neutral-500 mt-1">Quiet hallway placement confirmed</span>
                </div>

                {/* Breakfast add-on */}
                <div className="p-3 bg-neutral-950 border border-neutral-800 rounded-lg flex flex-col justify-between">
                  <div className="flex items-center justify-between">
                    <span className="text-neutral-300 font-medium">Artisanal Breakfast</span>
                    <input
                      type="checkbox"
                      checked={optInBreakfast}
                      onChange={(e) => setOptInBreakfast(e.target.checked)}
                      className="accent-amber-400 w-4 h-4"
                    />
                  </div>
                  <span className="text-[11px] text-neutral-500 mt-1">Billed to room ($35/day)</span>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setStep(4)}
                className="inline-flex items-center gap-2 px-6 py-2.5 bg-amber-400 hover:bg-amber-300 text-neutral-950 font-bold text-xs rounded-lg transition-colors shadow"
              >
                <span>Continue to Registration & Sign</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 4: DIGITAL SIGNATURE & TERMS */}
        {step === 4 && matchedBooking && (
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 sm:p-10 shadow-2xl space-y-6 animate-in fade-in duration-200">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-4">
              <div>
                <span className="text-xs uppercase tracking-wider text-amber-400 font-semibold">
                  Step 3 of 4
                </span>
                <h2 className="text-xl font-bold text-white">Digital Guest Registration</h2>
              </div>
              <button
                onClick={() => setStep(3)}
                className="text-xs text-neutral-400 hover:text-white flex items-center gap-1"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Back
              </button>
            </div>

            {/* Terms Summary */}
            <div className="p-4 bg-neutral-950 border border-neutral-800 rounded-xl space-y-2 text-xs text-neutral-400 max-h-36 overflow-y-auto">
              <p className="font-semibold text-neutral-200">Hospitality Policies & Registration Terms:</p>
              <p>1. Check-out is strictly at 11:00 AM on departure day. Late check-out subject to availability and fee.</p>
              <p>2. Krishnam Hotel & Suites is 100% non-smoking. A $250 sanitization fee applies to violations.</p>
              <p>3. Incidental folio charges (dining, minibar, wellness) will be settled automatically upon check-out.</p>
              <p>4. Smart room digital key access remains valid until 11:00 AM on check-out date.</p>
            </div>

            {/* Digital Signature Input */}
            <div className="space-y-3">
              <label className="text-xs text-neutral-300 font-semibold flex items-center gap-1.5">
                <PenTool className="w-3.5 h-3.5 text-amber-400" />
                <span>Guest Digital Signature Authorization</span>
              </label>

              <div className="p-4 bg-neutral-950 border border-neutral-800 rounded-xl space-y-2">
                <input
                  type="text"
                  placeholder="Type your full legal name to sign"
                  value={signatureText}
                  onChange={(e) => setSignatureText(e.target.value)}
                  className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-3 py-2 text-sm text-white font-serif italic focus:outline-none focus:border-amber-400"
                />
                <div className="text-[11px] text-neutral-500 flex justify-between">
                  <span>Cryptographically signed timestamp: 2026-10-13 15:00</span>
                  <span className="text-amber-400 font-mono">DIGITAL SIGNATURE VERIFIED</span>
                </div>
              </div>

              <label className="flex items-center gap-2 text-xs text-neutral-300 cursor-pointer pt-1">
                <input
                  type="checkbox"
                  checked={agreedTerms}
                  onChange={(e) => setAgreedTerms(e.target.checked)}
                  className="accent-amber-400 w-4 h-4"
                />
                <span>I acknowledge and agree to the hotel rules and automated folio charging.</span>
              </label>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                disabled={!agreedTerms || !signatureText}
                onClick={handleCompleteCheckIn}
                className={`inline-flex items-center gap-2 px-6 py-2.5 text-neutral-950 font-bold text-xs rounded-lg transition-colors shadow ${
                  agreedTerms && signatureText
                    ? 'bg-amber-400 hover:bg-amber-300'
                    : 'bg-neutral-700 text-neutral-400 cursor-not-allowed'
                }`}
              >
                <KeyRound className="w-4 h-4" />
                <span>Issue Digital Keycard & Check-in</span>
              </button>
            </div>
          </div>
        )}

        {/* STEP 5: DIGITAL KEYCARD ISSUANCE & DOOR LOCK TEST */}
        {step === 5 && createdBookingResult && (
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 sm:p-10 shadow-2xl space-y-6 animate-in fade-in zoom-in-95 duration-200 text-center">
            
            <div className="w-14 h-14 mx-auto rounded-full bg-amber-400/10 border border-amber-400/40 flex items-center justify-center text-amber-400">
              <KeyRound className="w-7 h-7" />
            </div>

            <div className="space-y-1">
              <span className="text-xs uppercase tracking-widest text-emerald-400 font-semibold">
                Check-In Complete
              </span>
              <h2 className="text-2xl font-bold text-white">
                Room #{createdBookingResult.roomNumber} Key Issued
              </h2>
              <p className="text-xs text-neutral-400">
                Welcome, {createdBookingResult.guestName}. Your suite is prepared and sanitized.
              </p>
            </div>

            {/* Smart Keycard Interactive Card */}
            <div className="max-w-md mx-auto bg-gradient-to-br from-neutral-950 to-neutral-900 border border-amber-400/30 p-6 rounded-2xl shadow-xl space-y-5 text-left relative overflow-hidden">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-amber-400 uppercase tracking-widest block font-mono">
                    Krishnam Keyless Access
                  </span>
                  <span className="text-base font-bold text-white">
                    {createdBookingResult.roomTier}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-2xl font-mono font-bold text-amber-400">
                    #{createdBookingResult.roomNumber}
                  </span>
                </div>
              </div>

              {/* 4-Digit Keypad PIN */}
              <div className="p-3 bg-neutral-950/80 rounded-xl border border-neutral-800 flex items-center justify-between">
                <div>
                  <div className="text-[11px] text-neutral-400">Door Keypad PIN Code</div>
                  <div className="text-xs text-neutral-500">Enter on smart door handle</div>
                </div>
                <div className="text-2xl font-mono font-bold text-amber-400 tracking-widest">
                  {createdBookingResult.pinCode}
                </div>
              </div>

              {/* Simulated Door Lock Test */}
              <div className="p-3 bg-neutral-900 rounded-xl border border-neutral-800 text-center space-y-2">
                <div className="text-xs text-neutral-300 font-medium">
                  Test Smart Lock Authentication
                </div>
                <button
                  onClick={() => {
                    setDoorUnlocked(true);
                    setTimeout(() => setDoorUnlocked(false), 3000);
                  }}
                  className={`w-full py-2 px-4 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-colors ${
                    doorUnlocked
                      ? 'bg-emerald-500 text-neutral-950'
                      : 'bg-neutral-800 hover:bg-neutral-700 text-amber-400 border border-amber-500/30'
                  }`}
                >
                  {doorUnlocked ? (
                    <>
                      <Unlock className="w-4 h-4" />
                      <span>DOOR UNLOCKED — ACCESS GRANTED</span>
                    </>
                  ) : (
                    <>
                      <Lock className="w-4 h-4" />
                      <span>Tap to Test Room Access ({createdBookingResult.roomNumber})</span>
                    </>
                  )}
                </button>
              </div>

              <div className="text-[11px] text-neutral-500 font-mono flex justify-between pt-1">
                <span>NFC: {createdBookingResult.keycardCode}</span>
                <span>Active 15:00 → 11:00</span>
              </div>
            </div>

            {/* Room Directions & Wi-Fi */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-left max-w-md mx-auto">
              <div className="p-3 bg-neutral-950 rounded-xl border border-neutral-800">
                <div className="flex items-center gap-1.5 text-neutral-400 mb-1">
                  <Compass className="w-3.5 h-3.5 text-amber-400" />
                  <span className="font-semibold text-neutral-200">Elevator Directions</span>
                </div>
                <div className="text-neutral-400">
                  Take Elevator B to Floor {createdBookingResult.roomNumber[0]}. Exit right, follow suite indicators.
                </div>
              </div>

              <div className="p-3 bg-neutral-950 rounded-xl border border-neutral-800">
                <div className="flex items-center gap-1.5 text-neutral-400 mb-1">
                  <Wifi className="w-3.5 h-3.5 text-sky-400" />
                  <span className="font-semibold text-neutral-200">Suite High-Speed Wi-Fi</span>
                </div>
                <div className="text-neutral-400 font-mono text-[11px]">
                  <div>Network: {HOTEL_INFO.wifiSsid}</div>
                  <div>Password: {HOTEL_INFO.wifiPass}</div>
                </div>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex flex-wrap items-center justify-center gap-3 pt-3">
              <button
                onClick={() => window.print()}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-neutral-800 hover:bg-neutral-700 text-white text-xs font-semibold rounded-lg transition-colors"
              >
                <Printer className="w-4 h-4" />
                <span>Print Room Key Pass</span>
              </button>

              <button
                onClick={() => {
                  setStep(1);
                  setMatchedBooking(null);
                  setSearchCode('');
                  setCreatedBookingResult(null);
                }}
                className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-amber-400 hover:bg-amber-300 text-neutral-950 text-xs font-bold rounded-lg transition-colors shadow"
              >
                <span>Finished · Back to Kiosk Home</span>
              </button>
            </div>

          </div>
        )}

      </main>

      {/* Footer */}
      <footer className="px-6 py-4 border-t border-neutral-800/80 text-center text-xs text-neutral-500">
        <span>{HOTEL_INFO.name}</span>
        <span className="mx-2" aria-hidden="true">·</span>
        <span>{HOTEL_INFO.address}</span>
        <span className="mx-2" aria-hidden="true">·</span>
        <span>Concierge & Assistance: {HOTEL_INFO.phone}</span>
      </footer>

    </div>
  );
};
