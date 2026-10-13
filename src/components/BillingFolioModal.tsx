import React, { useState } from 'react';
import { useHotel } from '../context/HotelContext';
import { Booking, FolioCategory, PaymentMethod } from '../types/hotel';
import { HOTEL_INFO } from '../data/mockData';
import { 
  Receipt, 
  Plus, 
  Trash2, 
  CreditCard, 
  Printer, 
  CheckCircle, 
  UtensilsCrossed, 
  Wine, 
  Sparkles, 
  Car, 
  FileText, 
  Building,
  ShieldCheck
} from 'lucide-react';

interface BillingFolioModalProps {
  bookingId: string;
  onClose: () => void;
}

export const BillingFolioModal: React.FC<BillingFolioModalProps> = ({
  bookingId,
  onClose,
}) => {
  const { 
    bookings, 
    addFolioCharge, 
    removeFolioCharge, 
    recordPayment, 
    getFolioSummaryForBooking 
  } = useHotel();

  const booking = bookings.find((b) => b.id === bookingId);
  const [showAddCharge, setShowAddCharge] = useState(false);
  const [showPayModal, setShowPayModal] = useState(false);
  const [printMode, setPrintMode] = useState(false);

  // New charge form state
  const [newChargeCategory, setNewChargeCategory] = useState<FolioCategory>('dining');
  const [newChargeDesc, setNewChargeDesc] = useState('');
  const [newChargeAmount, setNewChargeAmount] = useState<number | ''>('');

  // Payment form state
  const summary = booking ? getFolioSummaryForBooking(booking.id) : null;
  const [payAmount, setPayAmount] = useState<number | ''>(summary ? summary.balanceDue : 0);
  const [payMethod, setPayMethod] = useState<PaymentMethod>('Credit Card (Visa/Mastercard)');
  const [payNotes, setPayNotes] = useState('');

  if (!booking || !summary) return null;

  const handleAddChargeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newChargeDesc || !newChargeAmount || Number(newChargeAmount) <= 0) return;

    addFolioCharge({
      bookingId: booking.id,
      category: newChargeCategory,
      description: newChargeDesc,
      amount: Number(newChargeAmount),
    });

    setNewChargeDesc('');
    setNewChargeAmount('');
    setShowAddCharge(false);
  };

  const handlePaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!payAmount || Number(payAmount) <= 0) return;

    recordPayment({
      bookingId: booking.id,
      amount: Number(payAmount),
      method: payMethod,
      notes: payNotes || 'Folio payment received',
    });

    setShowPayModal(false);
  };

  const getCategoryIcon = (category: FolioCategory) => {
    switch (category) {
      case 'room':
        return <Building className="w-3.5 h-3.5 text-amber-400" />;
      case 'dining':
        return <UtensilsCrossed className="w-3.5 h-3.5 text-orange-400" />;
      case 'minibar':
        return <Wine className="w-3.5 h-3.5 text-purple-400" />;
      case 'wellness':
        return <Sparkles className="w-3.5 h-3.5 text-emerald-400" />;
      case 'transport':
        return <Car className="w-3.5 h-3.5 text-sky-400" />;
      default:
        return <FileText className="w-3.5 h-3.5 text-neutral-400" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-sm overflow-y-auto">
      
      {/* Outer Card */}
      <div className={`relative w-full max-w-3xl bg-neutral-900 border border-neutral-800 rounded-xl shadow-2xl overflow-hidden my-auto ${
        printMode ? 'bg-white text-neutral-900 border-none' : 'text-neutral-100'
      }`}>

        {/* Modal Top Action Bar (hidden during print) */}
        {!printMode && (
          <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-800 bg-neutral-950">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-400/10 rounded border border-amber-400/20 text-amber-400">
                <Receipt className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white tracking-tight">
                  Guest Folio & Billing Ledger
                </h3>
                <div className="text-xs text-neutral-400">
                  Confirmation: <span className="font-mono text-amber-400">{booking.confirmationCode}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setPrintMode(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-neutral-300 hover:text-white bg-neutral-800 hover:bg-neutral-700 rounded-md transition-colors"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Invoice View</span>
              </button>
              
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-md text-neutral-400 hover:text-white hover:bg-neutral-800 flex items-center justify-center transition-colors"
              >
                ✕
              </button>
            </div>
          </div>
        )}

        {/* Printable/Invoice View Header if in Print Mode */}
        {printMode && (
          <div className="p-6 bg-neutral-100 border-b border-neutral-200 flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs text-neutral-600">
              <Printer className="w-4 h-4" />
              <span>Official Guest Folio & Tax Invoice Preview</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => window.print()}
                className="px-3 py-1.5 bg-neutral-900 text-white text-xs font-semibold rounded hover:bg-neutral-800 transition-colors"
              >
                Print / Save PDF
              </button>
              <button
                onClick={() => setPrintMode(false)}
                className="px-3 py-1.5 bg-white border border-neutral-300 text-neutral-700 text-xs font-medium rounded hover:bg-neutral-50 transition-colors"
              >
                Return to Editor
              </button>
            </div>
          </div>
        )}

        {/* Invoice / Folio Header Info */}
        <div className={`p-6 border-b ${printMode ? 'border-neutral-200 bg-white' : 'border-neutral-800 bg-neutral-900/60'}`}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Hotel Information */}
            <div>
              <h2 className={`text-base font-bold tracking-tight ${printMode ? 'text-neutral-900' : 'text-white'}`}>
                {HOTEL_INFO.name}
              </h2>
              <p className={`text-xs ${printMode ? 'text-neutral-600' : 'text-neutral-400'} mt-0.5`}>
                {HOTEL_INFO.address}
              </p>
              <div className={`text-xs ${printMode ? 'text-neutral-600' : 'text-neutral-400'} space-y-0.5 mt-2 font-mono text-[11px]`}>
                <div>Tel: {HOTEL_INFO.phone}</div>
                <div>Email: {HOTEL_INFO.email}</div>
                <div>Tax ID / VAT: {HOTEL_INFO.taxId}</div>
              </div>
            </div>

            {/* Guest & Stay Details */}
            <div className={`text-xs ${printMode ? 'text-neutral-700' : 'text-neutral-300'} md:text-right space-y-1`}>
              <div className="text-[11px] uppercase tracking-wider text-neutral-500 font-semibold">
                Guest Information
              </div>
              <div className={`text-sm font-bold ${printMode ? 'text-neutral-900' : 'text-white'}`}>
                {booking.guestName}
              </div>
              <div>{booking.guestEmail} · {booking.guestPhone}</div>
              <div>ID / Passport: <span className="font-mono">{booking.guestIdType} {booking.guestIdNumber}</span></div>
              <div className="pt-2 border-t border-neutral-800/40 text-[11px] font-mono">
                <span>Room #{booking.roomNumber} ({booking.roomTier})</span>
                <span className="block">{booking.checkInDate} to {booking.checkOutDate} ({booking.nights} Nights)</span>
              </div>
            </div>

          </div>
        </div>

        {/* Folio Items Table */}
        <div className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h4 className={`text-xs font-semibold uppercase tracking-wider ${
              printMode ? 'text-neutral-700' : 'text-neutral-400'
            }`}>
              Itemized Charges & Services
            </h4>

            {!printMode && (
              <button
                onClick={() => setShowAddCharge(!showAddCharge)}
                className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-amber-400 bg-amber-950/40 border border-amber-800/50 rounded hover:bg-amber-900/40 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Charge</span>
              </button>
            )}
          </div>

          {/* Inline Add Charge Form */}
          {showAddCharge && !printMode && (
            <form onSubmit={handleAddChargeSubmit} className="p-3.5 bg-neutral-950 border border-neutral-800 rounded-lg space-y-3 animate-in fade-in">
              <div className="text-xs font-semibold text-neutral-300">Post Room or Amenity Charge</div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <div>
                  <label className="text-[11px] text-neutral-400 block mb-1">Category</label>
                  <select
                    value={newChargeCategory}
                    onChange={(e) => setNewChargeCategory(e.target.value as FolioCategory)}
                    className="w-full text-xs bg-neutral-900 border border-neutral-700 rounded px-2.5 py-1.5 text-white"
                  >
                    <option value="dining">In-Room Dining / Restaurant</option>
                    <option value="minibar">Minibar Consumption</option>
                    <option value="wellness">Spa & Wellness Treatment</option>
                    <option value="transport">Airport Transfer / Chauffeur</option>
                    <option value="fee">Laundry / Late Checkout / Fee</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] text-neutral-400 block mb-1">Description</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Club Sandwich & Juice"
                    value={newChargeDesc}
                    onChange={(e) => setNewChargeDesc(e.target.value)}
                    className="w-full text-xs bg-neutral-900 border border-neutral-700 rounded px-2.5 py-1.5 text-white placeholder-neutral-500"
                  />
                </div>

                <div>
                  <label className="text-[11px] text-neutral-400 block mb-1">Amount ($ USD)</label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      step="0.01"
                      required
                      placeholder="45.00"
                      value={newChargeAmount}
                      onChange={(e) => setNewChargeAmount(e.target.value === '' ? '' : parseFloat(e.target.value))}
                      className="w-full text-xs bg-neutral-900 border border-neutral-700 rounded px-2.5 py-1.5 text-white font-mono tabular-nums"
                    />
                    <button
                      type="submit"
                      className="px-3 py-1.5 bg-amber-400 text-neutral-950 text-xs font-semibold rounded hover:bg-amber-300 transition-colors shrink-0"
                    >
                      Post
                    </button>
                  </div>
                </div>
              </div>
            </form>
          )}

          {/* Charges Table */}
          <div className={`overflow-x-auto rounded border ${printMode ? 'border-neutral-200' : 'border-neutral-800'}`}>
            <table className="w-full text-left text-xs">
              <thead>
                <tr className={`border-b ${printMode ? 'border-neutral-200 bg-neutral-50 text-neutral-600' : 'border-neutral-800 bg-neutral-950/60 text-neutral-400'}`}>
                  <th className="py-2.5 px-3 font-semibold uppercase text-[10px]">Date</th>
                  <th className="py-2.5 px-3 font-semibold uppercase text-[10px]">Category</th>
                  <th className="py-2.5 px-3 font-semibold uppercase text-[10px]">Description</th>
                  <th className="py-2.5 px-3 font-semibold uppercase text-[10px] text-right">Amount</th>
                  {!printMode && <th className="py-2.5 px-2 text-right"></th>}
                </tr>
              </thead>
              <tbody className={`divide-y ${printMode ? 'divide-neutral-100' : 'divide-neutral-800/60'}`}>
                {summary.items.map((item) => (
                  <tr key={item.id} className={printMode ? 'hover:bg-neutral-50' : 'hover:bg-neutral-800/30'}>
                    <td className="py-2 px-3 font-mono text-[11px] text-neutral-400">{item.date}</td>
                    <td className="py-2 px-3 whitespace-nowrap">
                      <div className="flex items-center gap-1.5 capitalize text-neutral-300">
                        {getCategoryIcon(item.category)}
                        <span>{item.category}</span>
                      </div>
                    </td>
                    <td className="py-2 px-3 text-neutral-200 font-medium">{item.description}</td>
                    <td className="py-2 px-3 text-right font-mono tabular-nums text-neutral-100 font-semibold">
                      ${item.amount.toFixed(2)}
                    </td>
                    {!printMode && (
                      <td className="py-2 px-2 text-right">
                        {item.category !== 'room' && (
                          <button
                            onClick={() => removeFolioCharge(item.id)}
                            title="Remove charge"
                            className="p-1 text-neutral-500 hover:text-rose-400 rounded transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Tax Breakdown & Totals */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3">
            
            {/* Payment Records History */}
            <div className={`p-3.5 rounded border text-xs space-y-2 ${
              printMode ? 'border-neutral-200 bg-neutral-50' : 'border-neutral-800 bg-neutral-950/40'
            }`}>
              <div className="flex items-center justify-between text-neutral-400 font-semibold uppercase tracking-wider text-[10px]">
                <span>Payments & Credits</span>
                <span className="font-mono text-emerald-400">${summary.totalPaid.toFixed(2)} Total</span>
              </div>

              {summary.payments.length === 0 ? (
                <div className="text-[11px] text-neutral-500 italic py-2">
                  No payment transactions posted yet.
                </div>
              ) : (
                <div className="space-y-1.5 max-h-32 overflow-y-auto pr-1">
                  {summary.payments.map((pmt) => (
                    <div key={pmt.id} className="flex items-center justify-between text-[11px] py-1 border-b border-neutral-800/40">
                      <div>
                        <div className="font-medium text-neutral-200">{pmt.method}</div>
                        <div className="text-neutral-500 font-mono text-[10px]">{pmt.transactionRef} · {pmt.timestamp}</div>
                      </div>
                      <div className="font-mono font-semibold text-emerald-400 tabular-nums">
                        -${pmt.amount.toFixed(2)}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Calculations Breakdown */}
            <div className={`p-3.5 rounded border text-xs space-y-2 ${
              printMode ? 'border-neutral-200 bg-neutral-50' : 'border-neutral-800 bg-neutral-950/40'
            }`}>
              <div className="flex justify-between text-neutral-400">
                <span>Subtotal (Room & Extras)</span>
                <span className="font-mono tabular-nums text-neutral-200">${summary.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-neutral-400">
                <span>City & Occupancy Tax (12%):</span>
                <span className="font-mono tabular-nums text-neutral-200">${summary.roomTax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-neutral-400">
                <span>Service Charge (5%):</span>
                <span className="font-mono tabular-nums text-neutral-200">${summary.serviceCharge.toFixed(2)}</span>
              </div>

              <div className="pt-2 border-t border-neutral-800 flex justify-between font-bold text-sm">
                <span className={printMode ? 'text-neutral-900' : 'text-white'}>Total Folio Amount:</span>
                <span className="font-mono tabular-nums text-amber-400">${summary.totalAmount.toFixed(2)}</span>
              </div>

              <div className="flex justify-between text-xs text-emerald-400">
                <span>Less Total Payments Made:</span>
                <span className="font-mono tabular-nums">-${summary.totalPaid.toFixed(2)}</span>
              </div>

              <div className={`pt-2 border-t border-neutral-800 flex justify-between items-center text-sm font-bold ${
                summary.balanceDue > 0 ? 'text-rose-400' : 'text-emerald-400'
              }`}>
                <span>Balance Due:</span>
                <span className="font-mono tabular-nums text-base">
                  ${summary.balanceDue.toFixed(2)}
                </span>
              </div>
            </div>

          </div>

          {/* Print Signature Line if in Print Mode */}
          {printMode && (
            <div className="pt-10 grid grid-cols-2 gap-12 text-xs text-neutral-600 border-t border-neutral-200 mt-8">
              <div>
                <div className="h-10 border-b border-neutral-400 mb-1"></div>
                <span>Guest Signature & Agreement</span>
              </div>
              <div className="text-right">
                <div className="h-10 border-b border-neutral-400 mb-1"></div>
                <span>Hotel Cashier / General Manager</span>
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer Controls */}
        {!printMode && (
          <div className="flex items-center justify-between p-4 bg-neutral-950 border-t border-neutral-800">
            <div className="text-xs text-neutral-400 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Automated Daily Audit Verified</span>
            </div>

            <div className="flex items-center gap-2">
              {summary.balanceDue > 0 ? (
                <button
                  onClick={() => {
                    setPayAmount(summary.balanceDue);
                    setShowPayModal(true);
                  }}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-semibold text-xs rounded-md shadow-sm transition-colors"
                >
                  <CreditCard className="w-3.5 h-3.5" />
                  <span>Settle Balance (${summary.balanceDue.toFixed(2)})</span>
                </button>
              ) : (
                <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-semibold px-3 py-2 bg-emerald-950/40 border border-emerald-800/40 rounded">
                  <CheckCircle className="w-4 h-4" />
                  <span>Folio Fully Settled</span>
                </div>
              )}

              <button
                onClick={onClose}
                className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-semibold rounded-md transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        )}

      </div>

      {/* Payment Processing Modal */}
      {showPayModal && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
          <div className="w-full max-w-md bg-neutral-900 border border-neutral-800 rounded-xl p-5 shadow-2xl relative space-y-4">
            <button
              onClick={() => setShowPayModal(false)}
              className="absolute top-3 right-3 text-neutral-400 hover:text-white"
            >
              ✕
            </button>

            <div>
              <h3 className="text-base font-bold text-white">Process Folio Payment</h3>
              <p className="text-xs text-neutral-400">
                Posting payment for {booking.guestName} (Room #{booking.roomNumber})
              </p>
            </div>

            <form onSubmit={handlePaymentSubmit} className="space-y-3 text-xs">
              <div>
                <label className="text-neutral-400 block mb-1">Payment Method</label>
                <select
                  value={payMethod}
                  onChange={(e) => setPayMethod(e.target.value as PaymentMethod)}
                  className="w-full text-xs bg-neutral-950 border border-neutral-700 rounded px-3 py-2 text-white"
                >
                  <option value="Credit Card (Visa/Mastercard)">Credit Card (Visa / Mastercard)</option>
                  <option value="Corporate Billing">Corporate Direct Billing</option>
                  <option value="Apple Pay / Contactless">Apple Pay / Contactless Terminal</option>
                  <option value="Wire Transfer">Bank Wire Transfer</option>
                  <option value="Cash">Cash at Front Desk</option>
                </select>
              </div>

              <div>
                <label className="text-neutral-400 block mb-1">Amount to Pay ($ USD)</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={payAmount}
                  onChange={(e) => setPayAmount(e.target.value === '' ? '' : parseFloat(e.target.value))}
                  className="w-full text-xs bg-neutral-950 border border-neutral-700 rounded px-3 py-2 text-white font-mono tabular-nums"
                />
              </div>

              <div>
                <label className="text-neutral-400 block mb-1">Payment Reference / Notes</label>
                <input
                  type="text"
                  placeholder="e.g. Card ending 4419 or Invoice PO #892"
                  value={payNotes}
                  onChange={(e) => setPayNotes(e.target.value)}
                  className="w-full text-xs bg-neutral-950 border border-neutral-700 rounded px-3 py-2 text-white"
                />
              </div>

              <div className="pt-2 flex items-center gap-2">
                <button
                  type="submit"
                  className="flex-1 py-2 bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-bold text-xs rounded transition-colors"
                >
                  Confirm & Post Payment
                </button>
                <button
                  type="button"
                  onClick={() => setShowPayModal(false)}
                  className="py-2 px-3 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs rounded transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
