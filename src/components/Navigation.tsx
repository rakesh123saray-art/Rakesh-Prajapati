import React from 'react';
import { useHotel } from '../context/HotelContext';
import { 
  Building2, 
  CalendarCheck, 
  Receipt, 
  Sparkles, 
  Smartphone, 
  Plus, 
  RefreshCw 
} from 'lucide-react';

interface NavigationProps {
  currentTab: 'rooms' | 'bookings' | 'billing' | 'housekeeping';
  setCurrentTab: (tab: 'rooms' | 'bookings' | 'billing' | 'housekeeping') => void;
  onOpenNewBooking: () => void;
}

export const Navigation: React.FC<NavigationProps> = ({
  currentTab,
  setCurrentTab,
  onOpenNewBooking,
}) => {
  const { activeMode, setActiveMode, resetAllData } = useHotel();

  return (
    <header className="sticky top-0 z-40 bg-neutral-900/95 backdrop-blur-md border-b border-neutral-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-8">
          
          {/* Zone 1: Single text element Brand wordmark */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="w-8 h-8 rounded bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-neutral-950 font-bold text-sm tracking-wider shadow-sm">
              K
            </div>
            <a 
              href="#dashboard" 
              onClick={(e) => { e.preventDefault(); setActiveMode('pms'); }}
              className="text-lg font-bold tracking-tight text-white whitespace-nowrap hover:text-amber-400 transition-colors"
            >
              Krishnam Hotel & Suites
            </a>
          </div>

          {/* Zone 2: Navigation Links (PMS tabs) */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-neutral-400">
            <button
              onClick={() => { setActiveMode('pms'); setCurrentTab('rooms'); }}
              className={`flex items-center gap-2 whitespace-nowrap py-1 transition-colors ${
                activeMode === 'pms' && currentTab === 'rooms'
                  ? 'text-amber-400 border-b-2 border-amber-400'
                  : 'hover:text-neutral-200'
              }`}
            >
              <Building2 className="w-4 h-4" />
              <span>Rooms & Matrix</span>
            </button>

            <button
              onClick={() => { setActiveMode('pms'); setCurrentTab('bookings'); }}
              className={`flex items-center gap-2 whitespace-nowrap py-1 transition-colors ${
                activeMode === 'pms' && currentTab === 'bookings'
                  ? 'text-amber-400 border-b-2 border-amber-400'
                  : 'hover:text-neutral-200'
              }`}
            >
              <CalendarCheck className="w-4 h-4" />
              <span>Reservations</span>
            </button>

            <button
              onClick={() => { setActiveMode('pms'); setCurrentTab('billing'); }}
              className={`flex items-center gap-2 whitespace-nowrap py-1 transition-colors ${
                activeMode === 'pms' && currentTab === 'billing'
                  ? 'text-amber-400 border-b-2 border-amber-400'
                  : 'hover:text-neutral-200'
              }`}
            >
              <Receipt className="w-4 h-4" />
              <span>Folios & Billing</span>
            </button>

            <button
              onClick={() => { setActiveMode('pms'); setCurrentTab('housekeeping'); }}
              className={`flex items-center gap-2 whitespace-nowrap py-1 transition-colors ${
                activeMode === 'pms' && currentTab === 'housekeeping'
                  ? 'text-amber-400 border-b-2 border-amber-400'
                  : 'hover:text-neutral-200'
              }`}
            >
              <Sparkles className="w-4 h-4" />
              <span>Housekeeping</span>
            </button>
          </nav>

          {/* Zone 3: Primary Actions */}
          <div className="flex items-center gap-3 shrink-0">
            {/* Reset Demo Data button */}
            <button
              onClick={() => {
                if (window.confirm('Reset all reservations, rooms, and folios to default demo state?')) {
                  resetAllData();
                }
              }}
              title="Reset sample data"
              className="p-2 text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800 rounded-md transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
            </button>

            {/* Switch to Kiosk or PMS Mode */}
            {activeMode === 'pms' ? (
              <button
                onClick={() => setActiveMode('kiosk')}
                className="inline-flex items-center gap-2 px-3.5 py-1.5 text-xs font-medium text-amber-300 bg-amber-950/60 border border-amber-800/60 rounded-md hover:bg-amber-900/60 transition-colors whitespace-nowrap"
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span>Self Check-in Kiosk</span>
              </button>
            ) : (
              <button
                onClick={() => setActiveMode('pms')}
                className="inline-flex items-center gap-2 px-3.5 py-1.5 text-xs font-medium text-neutral-200 bg-neutral-800 hover:bg-neutral-700 rounded-md transition-colors whitespace-nowrap"
              >
                <Building2 className="w-3.5 h-3.5" />
                <span>Staff PMS Console</span>
              </button>
            )}

            {/* Primary Action Button */}
            <button
              onClick={onOpenNewBooking}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-neutral-950 bg-amber-400 hover:bg-amber-300 rounded-md shadow-sm transition-colors whitespace-nowrap"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New Booking</span>
            </button>
          </div>

        </div>
      </div>
    </header>
  );
};
