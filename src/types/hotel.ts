export type RoomTier = 
  | 'Superior King Room'
  | 'Deluxe Balcony Suite'
  | 'Executive Business Suite'
  | 'Presidential Penthouse';

export type RoomStatus = 
  | 'available'
  | 'occupied'
  | 'reserved'
  | 'cleaning'
  | 'maintenance';

export interface Room {
  id: string;
  roomNumber: string;
  floor: number;
  tier: RoomTier;
  baseRate: number;
  status: RoomStatus;
  image: string;
  bedType: string;
  maxGuests: number;
  amenities: string[];
  currentBookingId?: string;
  lastCleaned?: string;
}

export type BookingStatus = 
  | 'confirmed'
  | 'checked_in'
  | 'checked_out'
  | 'cancelled';

export interface Booking {
  id: string;
  confirmationCode: string;
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  guestIdType: 'Passport' | 'National ID' | 'Driving License';
  guestIdNumber: string;
  roomId: string;
  roomNumber: string;
  roomTier: RoomTier;
  checkInDate: string; // YYYY-MM-DD
  checkOutDate: string; // YYYY-MM-DD
  nights: number;
  status: BookingStatus;
  guestCount: number;
  specialRequests?: string;
  checkedInAt?: string;
  checkedOutAt?: string;
  digitalKeyIssued?: boolean;
  keycardCode?: string;
  pinCode?: string;
  createdAt: string;
}

export type FolioCategory = 
  | 'room'
  | 'dining'
  | 'minibar'
  | 'wellness'
  | 'transport'
  | 'fee'
  | 'tax';

export interface FolioItem {
  id: string;
  bookingId: string;
  date: string;
  category: FolioCategory;
  description: string;
  amount: number;
  quantity?: number;
  paid: boolean;
}

export type PaymentMethod = 
  | 'Credit Card (Visa/Mastercard)'
  | 'Corporate Billing'
  | 'Wire Transfer'
  | 'Cash'
  | 'Apple Pay / Contactless';

export interface PaymentRecord {
  id: string;
  bookingId: string;
  amount: number;
  method: PaymentMethod;
  timestamp: string;
  transactionRef: string;
  notes?: string;
}

export interface HousekeepingTask {
  id: string;
  roomId: string;
  roomNumber: string;
  floor: number;
  assignedStaff: string;
  status: 'dirty' | 'in_progress' | 'inspected' | 'ready';
  notes: string;
  updatedAt: string;
}
