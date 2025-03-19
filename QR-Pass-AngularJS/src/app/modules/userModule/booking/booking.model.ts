export interface Booking {
    _id: string;
    _rev?: string;
    data: {
        user: string;
        event: string;
        bookedseats: string;
        totalamount: number;
        userproof: string;
        ticketUrl?: string
        bookedat: string;
        checkedinat?: string;
        type: "booking";
    };
}

export interface BookingPayment {
    _id: string;
    _rev?: string;
    data: {
        user: string;
        booking: string;
        paid: number;
        datetime: string;
        type?: "bookingpayment";
    }
}

export interface BookedTicketData {
    bookingId: string;
    eventId: string;
    seats: number;
    eventProof: string;
    totalAmount: number;
}

export interface Ticket {
    bookingId: string;
    eventName: string;
    artist: string;
    seats: string;
    eventProof: string;
    date: string;
    time: string;
    totalAmount: number;
    venue: string;
    district: string;
    state: string;
    locationUrl: string;
    imageUrl: string;
  }
  
