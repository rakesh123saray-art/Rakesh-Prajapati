import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  Room, 
  Booking, 
  FolioItem, 
  PaymentRecord, 
  HousekeepingTask, 
  PaymentMethod,
  RoomStatus 
} from '../types/hotel';
import { 
  INITIAL_ROOMS, 
  INITIAL_BOOKINGS, 
  INITIAL_FOLIOS, 
  INITIAL_PAYMENTS, 
  INITIAL_HOUSEKEEPING,
  HOTEL_INFO 
} from '../data/mockData';

interface HotelContextType {
  rooms: Room[];
  bookings: Booking[];
  folios: FolioItem[];
  payments: PaymentRecord[];
  housekeeping: HousekeepingTask[];
  activeMode: 'pms' | 'kiosk';
  setActiveMode: (mode: 'pms' | 'kiosk') => void;
  selectedBookingForFolio: Booking | null;
  setSelectedBookingForFolio: (b: Booking | null) => void;
  
  // Automated Actions
  autoCheckInBooking: (bookingId: string, options?: { upgradeRoomId?: string; guestIdType?: string; guestIdNumber?: string }) => Booking | null;
  expressCheckOutBooking: (bookingId: string, paymentMethod?: PaymentMethod) => boolean;
  createBooking: (bookingData: {
    guestName: string;
    guestEmail: string;
    guestPhone: string;
    guestIdType: 'Passport' | 'National ID' | 'Driving License';
    guestIdNumber: string;
    roomId: string;
    checkInDate: string;
    checkOutDate: string;
    guestCount: number;
    specialRequests?: string;
  }) => Booking;
  addFolioCharge: (charge: {
    bookingId: string;
    category: FolioItem['category'];
    description: string;
    amount: number;
  }) => void;
  removeFolioCharge: (chargeId: string) => void;
  recordPayment: (payment: {
    bookingId: string;
    amount: number;
    method: PaymentMethod;
    notes?: string;
  }) => void;
  updateRoomStatus: (roomId: string, status: RoomStatus) => void;
  updateHousekeepingTask: (taskId: string, status: HousekeepingTask['status']) => void;
  getFolioSummaryForBooking: (bookingId: string) => {
    subtotal: number;
    roomTax: number;
    serviceCharge: number;
    totalAmount: number;
    totalPaid: number;
    balanceDue: number;
    items: FolioItem[];
    payments: PaymentRecord[];
  };
  resetAllData: () => void;
}

const STORAGE_KEYS = {
  ROOMS: 'krishnam_rooms_v1',
  BOOKINGS: 'krishnam_bookings_v1',
  FOLIOS: 'krishnam_folios_v1',
  PAYMENTS: 'krishnam_payments_v1',
  HOUSEKEEPING: 'krishnam_housekeeping_v1',
};

const HotelContext = createContext<HotelContextType | undefined>(undefined);

export const HotelProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [rooms, setRooms] = useState<Room[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.ROOMS);
      return saved ? JSON.parse(saved) : INITIAL_ROOMS;
    } catch {
      return INITIAL_ROOMS;
    }
  });

  const [bookings, setBookings] = useState<Booking[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.BOOKINGS);
      return saved ? JSON.parse(saved) : INITIAL_BOOKINGS;
    } catch {
      return INITIAL_BOOKINGS;
    }
  });

  const [folios, setFolios] = useState<FolioItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.FOLIOS);
      return saved ? JSON.parse(saved) : INITIAL_FOLIOS;
    } catch {
      return INITIAL_FOLIOS;
    }
  });

  const [payments, setPayments] = useState<PaymentRecord[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.PAYMENTS);
      return saved ? JSON.parse(saved) : INITIAL_PAYMENTS;
    } catch {
      return INITIAL_PAYMENTS;
    }
  });

  const [housekeeping, setHousekeeping] = useState<HousekeepingTask[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.HOUSEKEEPING);
      return saved ? JSON.parse(saved) : INITIAL_HOUSEKEEPING;
    } catch {
      return INITIAL_HOUSEKEEPING;
    }
  });

  const [activeMode, setActiveMode] = useState<'pms' | 'kiosk'>('pms');
  const [selectedBookingForFolio, setSelectedBookingForFolio] = useState<Booking | null>(null);

  // Sync to local storage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.ROOMS, JSON.stringify(rooms));
  }, [rooms]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.BOOKINGS, JSON.stringify(bookings));
  }, [bookings]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.FOLIOS, JSON.stringify(folios));
  }, [folios]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.PAYMENTS, JSON.stringify(payments));
  }, [payments]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.HOUSEKEEPING, JSON.stringify(housekeeping));
  }, [housekeeping]);

  // Keep selected booking reference fresh if bookings update
  useEffect(() => {
    if (selectedBookingForFolio) {
      const updated = bookings.find((b) => b.id === selectedBookingForFolio.id);
      if (updated) setSelectedBookingForFolio(updated);
    }
  }, [bookings]);

  const resetAllData = () => {
    setRooms(INITIAL_ROOMS);
    setBookings(INITIAL_BOOKINGS);
    setFolios(INITIAL_FOLIOS);
    setPayments(INITIAL_PAYMENTS);
    setHousekeeping(INITIAL_HOUSEKEEPING);
    setSelectedBookingForFolio(null);
    localStorage.removeItem(STORAGE_KEYS.ROOMS);
    localStorage.removeItem(STORAGE_KEYS.BOOKINGS);
    localStorage.removeItem(STORAGE_KEYS.FOLIOS);
    localStorage.removeItem(STORAGE_KEYS.PAYMENTS);
    localStorage.removeItem(STORAGE_KEYS.HOUSEKEEPING);
  };

  const getFolioSummaryForBooking = (bookingId: string) => {
    const bookingItems = folios.filter((f) => f.bookingId === bookingId);
    const bookingPayments = payments.filter((p) => p.bookingId === bookingId);
    
    // Subtotal of all charges
    const subtotal = bookingItems.reduce((acc, item) => acc + item.amount, 0);
    const roomCharges = bookingItems
      .filter((i) => i.category === 'room')
      .reduce((acc, i) => acc + i.amount, 0);

    // City room tax (12% on room rate) + service charge (5% overall)
    const roomTax = Math.round(roomCharges * HOTEL_INFO.roomTaxRate * 100) / 100;
    const serviceCharge = Math.round(subtotal * HOTEL_INFO.serviceChargeRate * 100) / 100;
    const totalAmount = Math.round((subtotal + roomTax + serviceCharge) * 100) / 100;
    const totalPaid = Math.round(bookingPayments.reduce((acc, p) => acc + p.amount, 0) * 100) / 100;
    const balanceDue = Math.max(0, Math.round((totalAmount - totalPaid) * 100) / 100);

    return {
      subtotal,
      roomTax,
      serviceCharge,
      totalAmount,
      totalPaid,
      balanceDue,
      items: bookingItems,
      payments: bookingPayments,
    };
  };

  const autoCheckInBooking = (bookingId: string, options?: { upgradeRoomId?: string; guestIdType?: string; guestIdNumber?: string }) => {
    const bookingIndex = bookings.findIndex((b) => b.id === bookingId);
    if (bookingIndex === -1) return null;

    const targetBooking = bookings[bookingIndex];
    let assignedRoomId = targetBooking.roomId;
    let assignedRoomNumber = targetBooking.roomNumber;
    let assignedRoomTier = targetBooking.roomTier;

    // Optional upgrade room assignment
    if (options?.upgradeRoomId) {
      const upgradeRoom = rooms.find((r) => r.id === options.upgradeRoomId);
      if (upgradeRoom) {
        assignedRoomId = upgradeRoom.id;
        assignedRoomNumber = upgradeRoom.roomNumber;
        assignedRoomTier = upgradeRoom.tier;
      }
    }

    const now = new Date();
    const timeString = `${now.toISOString().split('T')[0]} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    const generatedPin = String(Math.floor(1000 + Math.random() * 9000));
    const generatedKeycode = `NFC-KRISH-${assignedRoomNumber}-${Math.floor(1000 + Math.random() * 9000)}`;

    const updatedBooking: Booking = {
      ...targetBooking,
      roomId: assignedRoomId,
      roomNumber: assignedRoomNumber,
      roomTier: assignedRoomTier,
      status: 'checked_in',
      checkedInAt: timeString,
      digitalKeyIssued: true,
      pinCode: generatedPin,
      keycardCode: generatedKeycode,
      guestIdType: (options?.guestIdType as any) || targetBooking.guestIdType,
      guestIdNumber: options?.guestIdNumber || targetBooking.guestIdNumber,
    };

    // Update Bookings list
    setBookings((prev) => prev.map((b) => (b.id === bookingId ? updatedBooking : b)));

    // Update Room statuses
    setRooms((prev) =>
      prev.map((r) => {
        if (r.id === assignedRoomId) {
          return {
            ...r,
            status: 'occupied',
            currentBookingId: bookingId,
          };
        }
        // If room changed from old one
        if (targetBooking.roomId !== assignedRoomId && r.id === targetBooking.roomId) {
          return {
            ...r,
            status: 'available',
            currentBookingId: undefined,
          };
        }
        return r;
      })
    );

    return updatedBooking;
  };

  const expressCheckOutBooking = (bookingId: string, paymentMethod?: PaymentMethod): boolean => {
    const booking = bookings.find((b) => b.id === bookingId);
    if (!booking) return false;

    const summary = getFolioSummaryForBooking(bookingId);
    const now = new Date();
    const timeString = `${now.toISOString().split('T')[0]} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    // If balance due and payment method provided, record final settlement payment
    if (summary.balanceDue > 0 && paymentMethod) {
      const newPayment: PaymentRecord = {
        id: `pay-settle-${Date.now()}`,
        bookingId,
        amount: summary.balanceDue,
        method: paymentMethod,
        timestamp: timeString,
        transactionRef: `SETTLE-TXN-${Math.floor(100000 + Math.random() * 900000)}`,
        notes: 'Final settlement at checkout',
      };
      setPayments((prev) => [newPayment, ...prev]);
    }

    // Mark booking checked out
    setBookings((prev) =>
      prev.map((b) =>
        b.id === bookingId
          ? {
              ...b,
              status: 'checked_out',
              checkedOutAt: timeString,
            }
          : b
      )
    );

    // Update Room to cleaning required
    setRooms((prev) =>
      prev.map((r) =>
        r.id === booking.roomId
          ? {
              ...r,
              status: 'cleaning',
              currentBookingId: undefined,
            }
          : r
      )
    );

    // Add to Housekeeping Task
    const newHkTask: HousekeepingTask = {
      id: `hk-checkout-${Date.now()}`,
      roomId: booking.roomId,
      roomNumber: booking.roomNumber,
      floor: parseInt(booking.roomNumber[0], 10) || 1,
      assignedStaff: 'Housekeeping Team Lead',
      status: 'dirty',
      notes: `Checkout turnover for ${booking.guestName}. Sanitize room and restock minibar.`,
      updatedAt: timeString,
    };
    setHousekeeping((prev) => [newHkTask, ...prev]);

    return true;
  };

  const createBooking = (data: {
    guestName: string;
    guestEmail: string;
    guestPhone: string;
    guestIdType: 'Passport' | 'National ID' | 'Driving License';
    guestIdNumber: string;
    roomId: string;
    checkInDate: string;
    checkOutDate: string;
    guestCount: number;
    specialRequests?: string;
  }): Booking => {
    const selectedRoom = rooms.find((r) => r.id === data.roomId)!;
    
    // Calculate nights
    const start = new Date(data.checkInDate);
    const end = new Date(data.checkOutDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const nights = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));

    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];
    const isToday = data.checkInDate === todayStr;

    const bookingId = `bk-${Date.now()}`;
    const code = `KRISH-${Math.floor(1000 + Math.random() * 9000)}`;

    const newBooking: Booking = {
      id: bookingId,
      confirmationCode: code,
      guestName: data.guestName,
      guestEmail: data.guestEmail,
      guestPhone: data.guestPhone,
      guestIdType: data.guestIdType,
      guestIdNumber: data.guestIdNumber,
      roomId: data.roomId,
      roomNumber: selectedRoom.roomNumber,
      roomTier: selectedRoom.tier,
      checkInDate: data.checkInDate,
      checkOutDate: data.checkOutDate,
      nights,
      status: 'confirmed',
      guestCount: data.guestCount,
      specialRequests: data.specialRequests,
      digitalKeyIssued: false,
      createdAt: `${todayStr} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`,
    };

    // Update Room status to reserved (or keep occupied if future)
    setRooms((prev) =>
      prev.map((r) =>
        r.id === data.roomId
          ? {
              ...r,
              status: isToday ? 'reserved' : r.status,
              currentBookingId: bookingId,
            }
          : r
      )
    );

    // Generate room folios for each night
    const generatedFolioItems: FolioItem[] = [];
    for (let i = 0; i < nights; i++) {
      const nightDate = new Date(start);
      nightDate.setDate(nightDate.getDate() + i);
      const nightStr = nightDate.toISOString().split('T')[0];

      generatedFolioItems.push({
        id: `f-${bookingId}-${i + 1}`,
        bookingId,
        date: nightStr,
        category: 'room',
        description: `${selectedRoom.tier} (Night ${i + 1})`,
        amount: selectedRoom.baseRate,
        paid: i === 0, // Night 1 deposit simulated paid
      });
    }

    // Add initial deposit payment record for night 1
    const initialDeposit: PaymentRecord = {
      id: `pay-dep-${bookingId}`,
      bookingId,
      amount: selectedRoom.baseRate,
      method: 'Credit Card (Visa/Mastercard)',
      timestamp: `${todayStr} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`,
      transactionRef: `DEP-AUTH-${Math.floor(100000 + Math.random() * 900000)}`,
      notes: 'Initial room reservation deposit (Night 1)',
    };

    setBookings((prev) => [newBooking, ...prev]);
    setFolios((prev) => [...generatedFolioItems, ...prev]);
    setPayments((prev) => [initialDeposit, ...prev]);

    return newBooking;
  };

  const addFolioCharge = (charge: {
    bookingId: string;
    category: FolioItem['category'];
    description: string;
    amount: number;
  }) => {
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];
    const newCharge: FolioItem = {
      id: `f-charge-${Date.now()}`,
      bookingId: charge.bookingId,
      date: todayStr,
      category: charge.category,
      description: charge.description,
      amount: charge.amount,
      paid: false,
    };
    setFolios((prev) => [newCharge, ...prev]);
  };

  const removeFolioCharge = (chargeId: string) => {
    setFolios((prev) => prev.filter((f) => f.id !== chargeId));
  };

  const recordPayment = (payment: {
    bookingId: string;
    amount: number;
    method: PaymentMethod;
    notes?: string;
  }) => {
    const now = new Date();
    const timeStr = `${now.toISOString().split('T')[0]} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    const newPaymentRecord: PaymentRecord = {
      id: `pay-rec-${Date.now()}`,
      bookingId: payment.bookingId,
      amount: payment.amount,
      method: payment.method,
      timestamp: timeStr,
      transactionRef: `PMT-REF-${Math.floor(100000 + Math.random() * 900000)}`,
      notes: payment.notes,
    };
    setPayments((prev) => [newPaymentRecord, ...prev]);
  };

  const updateRoomStatus = (roomId: string, status: RoomStatus) => {
    setRooms((prev) =>
      prev.map((r) => (r.id === roomId ? { ...r, status } : r))
    );
  };

  const updateHousekeepingTask = (taskId: string, status: HousekeepingTask['status']) => {
    const task = housekeeping.find((h) => h.id === taskId);
    if (!task) return;

    setHousekeeping((prev) =>
      prev.map((h) => (h.id === taskId ? { ...h, status } : h))
    );

    // If inspected & ready, mark the room available
    if (status === 'ready') {
      const now = new Date();
      const timeStr = `${now.toISOString().split('T')[0]} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
      setRooms((prev) =>
        prev.map((r) =>
          r.id === task.roomId
            ? { ...r, status: 'available', lastCleaned: timeStr }
            : r
        )
      );
    } else if (status === 'in_progress') {
      setRooms((prev) =>
        prev.map((r) => (r.id === task.roomId ? { ...r, status: 'cleaning' } : r))
      );
    }
  };

  return (
    <HotelContext.Provider
      value={{
        rooms,
        bookings,
        folios,
        payments,
        housekeeping,
        activeMode,
        setActiveMode,
        selectedBookingForFolio,
        setSelectedBookingForFolio,
        autoCheckInBooking,
        expressCheckOutBooking,
        createBooking,
        addFolioCharge,
        removeFolioCharge,
        recordPayment,
        updateRoomStatus,
        updateHousekeepingTask,
        getFolioSummaryForBooking,
        resetAllData,
      }}
    >
      {children}
    </HotelContext.Provider>
  );
};

export const useHotel = () => {
  const context = useContext(HotelContext);
  if (!context) {
    throw new Error('useHotel must be used within a HotelProvider');
  }
  return context;
};
