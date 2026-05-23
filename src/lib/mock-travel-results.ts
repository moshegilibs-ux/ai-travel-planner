export type FlightSearchInput = {
  from: string;
  to: string;
  departDate: string;
  returnDate: string;
  passengers: number;
};

export type HotelSearchInput = {
  destination: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  rooms: number;
  needsAccessibleRoom: boolean;
};

export type FlightResult = {
  id: string;
  airline: string;
  from: string;
  to: string;
  departDate: string;
  returnDate: string;
  price: string;
  duration: string;
};

export type HotelResult = {
  id: string;
  name: string;
  destination: string;
  stayDates: string;
  stars: number;
  pricePerNight: string;
  totalPrice: string;
  accessibleRoomsAvailable: number;
  hasElevator: boolean;
  hasWheelchairAccess: boolean;
  hasAccessibleShower: boolean;
};

const airlines = ["אל על", "Wizz Air", "Ryanair"];
const hotelNames = [
  "מלון בוטיק במרכז העיר",
  "ריזורט ליד הים",
  "דירת נופש משפחתית",
];

function dateLabel(value: string) {
  if (!value) {
    return "לא נבחר";
  }

  return new Intl.DateTimeFormat("he-IL", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(value));
}

function daysBetween(start: string, end: string) {
  const startDate = new Date(start).getTime();
  const endDate = new Date(end).getTime();

  if (!Number.isFinite(startDate) || !Number.isFinite(endDate) || endDate <= startDate) {
    return 1;
  }

  return Math.max(1, Math.round((endDate - startDate) / 86_400_000));
}

function seedFromText(value: string) {
  return Array.from(value).reduce((sum, char) => sum + char.charCodeAt(0), 0);
}

export function generateMockFlightResults(input: FlightSearchInput): FlightResult[] {
  const seed = seedFromText(`${input.from}${input.to}${input.departDate}`);
  const passengerFactor = Math.max(1, input.passengers);

  // TODO: Replace mock results with real flights API
  return airlines.map((airline, index) => {
    const basePrice = 130 + ((seed + index * 47) % 180);
    const hours = 2 + ((seed + index) % 4);
    const minutes = [10, 25, 40][index] ?? 30;

    return {
      id: `${airline}-${index}`,
      airline,
      from: input.from,
      to: input.to,
      departDate: dateLabel(input.departDate),
      returnDate: dateLabel(input.returnDate),
      price: `$${basePrice * passengerFactor}`,
      duration: `${hours}:${String(minutes).padStart(2, "0")} שעות`,
    };
  });
}

export function generateMockHotelResults(input: HotelSearchInput): HotelResult[] {
  const nights = daysBetween(input.checkIn, input.checkOut);
  const seed = seedFromText(`${input.destination}${input.checkIn}`);
  const roomFactor = Math.max(1, input.rooms);

  // TODO: Replace mock results with real hotels API
  const results = hotelNames.map((name, index) => {
    const price = 110 + ((seed + index * 65) % 220);
    const stars = [4, 5, 4][index] ?? 4;
    const accessibleRoomsAvailable = [2, 4, 0][index] ?? 0;

    return {
      id: `${name}-${index}`,
      name,
      destination: input.destination,
      stayDates: `${dateLabel(input.checkIn)} - ${dateLabel(input.checkOut)}`,
      stars,
      pricePerNight: `$${price} ללילה`,
      totalPrice: `$${price * nights * roomFactor} סה״כ`,
      accessibleRoomsAvailable,
      hasElevator: index !== 2,
      hasWheelchairAccess: accessibleRoomsAvailable > 0,
      hasAccessibleShower: index === 0 || index === 1,
    };
  });

  if (input.needsAccessibleRoom) {
    return results.filter((result) => result.accessibleRoomsAvailable > 0);
  }

  return results;
}
