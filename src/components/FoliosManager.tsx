import React, { useState } from 'react';
import { useHotel } from '../context/HotelContext';
import { 
  Receipt, 
  Search, 
  CreditCard, 
  ArrowUpRight, 
  CheckCircle2, 
  Clock, 
  FileText, 
  Download 
} from 'lucide-react';

export const FoliosManager: React.FC<{
  onOpenFolio: (bookingId: string) => void;
}> = ({ onOpenFolio }) => {
  const { bookings, getFolioSummaryForBooking } = useHotel();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'due' | 'settled' | 'in_house'>('all');

  const allFolioSummaries = bookings.map((b) => ({
    booking: b,
    summary: getFolioSummaryForBooking(b.id),
  }));

  // Aggregated totals
  const totalBilled = allFolioSummaries.reduce((sum, item) => sum + item.summary.totalAmount, 0);
  const totalCollected = allFolioSummaries.reduce((sum, item) => sum + item.summary.totalPaid, 0);
  const totalOutstanding = allFolioSummaries.reduce((sum, item) => sum + item.summary.balanceDue, 0);

  const filtered = allFolioSummaries.filter(({ booking, summary }) => {
    const query = searchQuery.toLowerCase();
    const matchesSearch =
      booking.guestName.toLowerCase().includes(query) ||
      booking.confirmationCode.toLowerCase().includes(query) ||
      booking.roomNumber.includes(query);

    if (!matchesSearch) return false;

    if (filterType === 'due') return summary.balanceDue > 0;
    if (filterType === 'settled') return summary.balanceDue === 0;
    if (filterType === 'in_house') return booking.status === 'checked_in';
    return true;
  });

  return (
    <div className="space-y-6">
      
      {/* Top Ledger Financial Overview Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        
        <div className="p-4 bg-neutral-900 border border-neutral-800 rounded-lg">
          <div className="flex items-center justify-between text-neutral-400 text-xs mb-1">
            <span>Total Gross Ledger Billed</span>
            <Receipt className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-mono font-bold text-white tabular-nums tracking-tight">
            ${totalBilled.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="text-[11px] text-neutral-500 mt-1">
            Room charges + incidentals + 12% tax & 5% service
          </div>
        </div>

        <div className="p-4 bg-neutral-900 border border-neutral-800 rounded-lg">
          <div className="flex items-center justify-between text-neutral-400 text-xs mb-1">
            <span>Collected Payments & Deposits</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-mono font-bold text-emerald-400 tabular-nums tracking-tight">
            ${totalCollected.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="text-[11px] text-neutral-500 mt-1">
            Processed via credit card, wire, corporate accounts
          </div>
        </div>

        <div className="p-4 bg-neutral-900 border border-neutral-800 rounded-lg">
          <div className="flex items-center justify-between text-neutral-400 text-xs mb-1">
            <span>Active Outstanding Balances</span>
            <Clock className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-2xl font-mono font-bold text-rose-400 tabular-nums tracking-tight">
            ${totalOutstanding.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="text-[11px] text-neutral-500 mt-1">
            To be settled at express checkout or departure
          </div>
        </div>

      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-neutral-800">
        <div>
          <h2 className="text-lg font-semibold text-white tracking-tight">
            Folio & Invoice Management
          </h2>
          <div className="flex items-center gap-2 text-xs text-neutral-400 mt-0.5">
            <span>{filtered.length} Folios shown</span>
            <span aria-hidden="true">·</span>
            <span>Automated municipal tax calculations applied</span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search folio, guest, room..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-3 py-1.5 text-xs bg-neutral-900 border border-neutral-800 rounded-md text-white placeholder-neutral-500 focus:outline-none focus:border-amber-400 transition-colors w-56"
            />
          </div>

          <div className="flex items-center gap-1 p-1 bg-neutral-900 border border-neutral-800 rounded-lg text-xs">
            {(['all', 'due', 'settled', 'in_house'] as const).map((filter) => (
              <button
                key={filter}
                onClick={() => setFilterType(filter)}
                className={`px-2.5 py-1 font-medium rounded transition-colors whitespace-nowrap capitalize ${
                  filterType === filter
                    ? 'bg-neutral-800 text-amber-400 shadow-sm'
                    : 'text-neutral-400 hover:text-neutral-200'
                }`}
              >
                {filter === 'all'
                  ? 'All Folios'
                  : filter === 'due'
                  ? 'Balance Due'
                  : filter === 'settled'
                  ? 'Fully Settled'
                  : 'In-House'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Folios Grid List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map(({ booking, summary }) => (
          <div
            key={booking.id}
            className="bg-neutral-900 border border-neutral-800 rounded-xl p-4 flex flex-col justify-between space-y-4 hover:border-neutral-700 transition-all group"
          >
            {/* Top row */}
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold text-amber-400 bg-neutral-950 px-2 py-0.5 rounded border border-neutral-800">
                    Room #{booking.roomNumber}
                  </span>
                  <span className="text-xs font-mono text-neutral-400">
                    {booking.confirmationCode}
                  </span>
                </div>
                <h3 className="text-sm font-bold text-white mt-1.5">
                  {booking.guestName}
                </h3>
                <p className="text-[11px] text-neutral-400 truncate max-w-[220px]">
                  {booking.roomTier}
                </p>
              </div>

              <div className="text-right">
                <span className={`text-xs font-semibold px-2 py-0.5 rounded border ${
                  summary.balanceDue > 0
                    ? 'bg-rose-950/40 text-rose-300 border-rose-800/40'
                    : 'bg-emerald-950/40 text-emerald-300 border-emerald-800/40'
                }`}>
                  {summary.balanceDue > 0 ? 'Pending Balance' : 'Settled'}
                </span>
                <span className="block text-[11px] text-neutral-500 mt-1">
                  {booking.nights} Nights
                </span>
              </div>
            </div>

            {/* Financial metrics breakdown */}
            <div className="bg-neutral-950/80 p-3 rounded-lg border border-neutral-800/80 space-y-1.5 text-xs">
              <div className="flex justify-between text-neutral-400">
                <span>Total Charges ({summary.items.length} items):</span>
                <span className="font-mono tabular-nums text-neutral-200">
                  ${summary.totalAmount.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between text-neutral-400">
                <span>Payments Received:</span>
                <span className="font-mono tabular-nums text-emerald-400">
                  -${summary.totalPaid.toFixed(2)}
                </span>
              </div>
              <div className="pt-1.5 border-t border-neutral-800 flex justify-between font-bold text-sm">
                <span className="text-neutral-300">Balance Due:</span>
                <span className={`font-mono tabular-nums ${
                  summary.balanceDue > 0 ? 'text-rose-400' : 'text-emerald-400'
                }`}>
                  ${summary.balanceDue.toFixed(2)}
                </span>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-2 pt-1">
              <button
                onClick={() => onOpenFolio(booking.id)}
                className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-semibold text-neutral-950 bg-amber-400 hover:bg-amber-300 rounded transition-colors"
              >
                <Receipt className="w-3.5 h-3.5" />
                <span>Open Folio & Charges</span>
              </button>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
};
