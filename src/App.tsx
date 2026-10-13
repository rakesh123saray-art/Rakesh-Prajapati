import React, { useState } from 'react';
import { HotelProvider, useHotel } from './context/HotelContext';
import { Navigation } from './components/Navigation';
import { DashboardStats } from './components/DashboardStats';
import { RoomGrid } from './components/RoomGrid';
import { BookingsTable } from './components/BookingsTable';
import { BillingFolioModal } from './components/BillingFolioModal';
import { AutomatedCheckInKiosk } from './components/AutomatedCheckInKiosk';
import { NewBookingModal } from './components/NewBookingModal';
import { HousekeepingView } from './components/HousekeepingView';
import { FoliosManager } from './components/FoliosManager';
import { HOTEL_INFO } from './data/mockData';
import { 
  Building2, 
  CalendarCheck, 
  Receipt, 
  Sparkles, 
  Smartphone, 
  Plus, 
  CheckCircle2, 
  ShieldCheck, 
  KeyRound, 
  Users 
} from 'lucide-react';

const HotelAppContent: React.FC = () => {
  const { 
    activeMode, 
    setActiveMode, 
    selectedBookingForFolio, 
    setSelectedBookingForFolio,
    bookings,
    autoCheckInBooking 
  } = useHotel();

  const [currentTab, setCurrentTab] = useState<'rooms' | 'bookings' | 'billing' | 'housekeeping'>('rooms');
  const [showNewBookingModal, setShowNewBookingModal] = useState(false);
  const [preselectedRoomId, setPreselectedRoomId] = useState<string | undefined>(undefined);

  // If in kiosk mode, render the dedicated guest self-check-in terminal
  if (activeMode === 'kiosk') {
    return <AutomatedCheckInKiosk />;
  }

  const today = '2026-10-13';
  const arrivalsToday = bookings.filter((b) => b.checkInDate === today && b.status === 'confirmed');

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col justify-between selection:bg-amber-500 selection:text-neutral-950">
      
      {/* Top Header Navigation (Adheres strictly to Top Bar Contract) */}
      <Navigation
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        onOpenNewBooking={() => {
          setPreselectedRoomId(undefined);
          setShowNewBookingModal(true);
        }}
      />

      {/* Main PMS Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        
        {/* Luxury Hero Bar / Hospitality Welcome */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 bg-gradient-to-r from-neutral-900 via-neutral-900 to-neutral-950 border border-neutral-800 rounded-xl relative overflow-hidden shadow-sm">
          <div className="relative z-10 space-y-1">
            <div className="flex items-center gap-2 text-xs text-amber-400 font-semibold tracking-wider uppercase">
              <span>Front Desk Operations</span>
              <span aria-hidden="true">·</span>
              <span>Daily Automated Audit Active</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              {HOTEL_INFO.name} Management System
            </h1>
            <p className="text-xs text-neutral-400 max-w-xl">
              Automated keyless guest self-check-ins, visual suite inventory matrix, and multi-currency folio billing.
            </p>
          </div>

          <div className="relative z-10 flex flex-wrap items-center gap-2.5">
            {arrivalsToday.length > 0 && (
              <button
                onClick={() => {
                  const first = arrivalsToday[0];
                  const res = autoCheckInBooking(first.id);
                  if (res) {
                    alert(`Express automated check-in completed for ${res.guestName}! Room #${res.roomNumber} assigned with Key PIN ${res.pinCode}.`);
                  }
                }}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-neutral-950 bg-amber-400 hover:bg-amber-300 rounded-md shadow transition-colors whitespace-nowrap"
              >
                <KeyRound className="w-3.5 h-3.5" />
                <span>Auto Check-in Next Arrival ({arrivalsToday[0].guestName.split(' ')[0]})</span>
              </button>
            )}

            <button
              onClick={() => setActiveMode('kiosk')}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-amber-300 bg-amber-950/60 border border-amber-800/60 hover:bg-amber-900/60 rounded-md transition-colors whitespace-nowrap"
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>Launch Guest Kiosk</span>
            </button>
          </div>
        </div>

        {/* Dynamic Key Performance Indicators Strip */}
        <DashboardStats />

        {/* Tab Content Section */}
        {currentTab === 'rooms' && (
          <RoomGrid
            onOpenFolio={(bookingId) => {
              const b = bookings.find((item) => item.id === bookingId);
              if (b) setSelectedBookingForFolio(b);
            }}
            onOpenNewBookingWithRoom={(roomId) => {
              setPreselectedRoomId(roomId);
              setShowNewBookingModal(true);
            }}
          />
        )}

        {currentTab === 'bookings' && (
          <BookingsTable
            onOpenFolio={(bookingId) => {
              const b = bookings.find((item) => item.id === bookingId);
              if (b) setSelectedBookingForFolio(b);
            }}
            onOpenNewBooking={() => {
              setPreselectedRoomId(undefined);
              setShowNewBookingModal(true);
            }}
          />
        )}

        {currentTab === 'billing' && (
          <FoliosManager
            onOpenFolio={(bookingId) => {
              const b = bookings.find((item) => item.id === bookingId);
              if (b) setSelectedBookingForFolio(b);
            }}
          />
        )}

        {currentTab === 'housekeeping' && (
          <HousekeepingView />
        )}

      </main>

      {/* Footer with Hotel Branding & Contact Info */}
      <footer className="border-t border-neutral-800/80 bg-neutral-950 py-5 mt-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-neutral-500">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-neutral-400">{HOTEL_INFO.name}</span>
            <span aria-hidden="true">·</span>
            <span>{HOTEL_INFO.address}</span>
          </div>
          <div className="flex items-center gap-3">
            <span>Direct Desk: {HOTEL_INFO.phone}</span>
            <span aria-hidden="true">·</span>
            <span>VAT ID: {HOTEL_INFO.taxId}</span>
          </div>
        </div>
      </footer>

      {/* Global Modals */}
      {selectedBookingForFolio && (
        <BillingFolioModal
          bookingId={selectedBookingForFolio.id}
          onClose={() => setSelectedBookingForFolio(null)}
        />
      )}

      {showNewBookingModal && (
        <NewBookingModal
          initialRoomId={preselectedRoomId}
          onClose={() => setShowNewBookingModal(false)}
          onBookingCreated={(newId) => {
            // Optional callback
          }}
        />
      )}

    </div>
  );
};

export default function App() {
  return (
    <HotelProvider>
      <HotelAppContent />
    </HotelProvider>
  );
}
