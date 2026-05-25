"use client";

import { useMemo, useState } from "react";
import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Filter, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { SearchForm } from "@/components/search-form";
import {
  FlightCard,
  formatOfferPrice,
  HotelCard,
  ShortTermRentalCard,
} from "@/components/deal-cards";
import type {
  FlightDeal,
  HotelDeal,
  ShortTermRental,
  TripDeal,
} from "@/types/travel-marketplace";
import { LoadingSkeletons } from "@/components/travel-dashboard-widgets";
import { LiveTripWidgets } from "@/components/live-trip-widgets";
import { TripMap } from "@/components/trip-map";

type SortOption = "cheapest" | "best-value" | "rating";
type LodgingTab = "hotels" | "rentals";

export function SearchResultsView({
  destination,
  flights,
  hotels,
  rentals,
  deals,
  warning,
  warnings,
}: {
  destination: string;
  flights: FlightDeal[];
  hotels: HotelDeal[];
  rentals: ShortTermRental[];
  deals: TripDeal[];
  warning?: string;
  warnings?: {
    flights?: string;
    hotels?: string;
  };
}) {
  const [maxPrice, setMaxPrice] = useState(2500);
  const [minHotelPrice, setMinHotelPrice] = useState(50);
  const [maxHotelPrice, setMaxHotelPrice] = useState(350);
  const [minRating, setMinRating] = useState(4);
  const [nonstopOnly, setNonstopOnly] = useState(false);
  const [minStars, setMinStars] = useState(3);
  const [selectedAmenity, setSelectedAmenity] = useState("all");
  const [accessibilityOnly, setAccessibilityOnly] = useState(false);
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();
  const initialLodgingTab = searchParams.get("lodging") === "rentals" ? "rentals" : "hotels";
  const [activeLodgingTab, setActiveLodgingTab] = useState<LodgingTab>(initialLodgingTab);
  const [maxRentalPrice, setMaxRentalPrice] = useState(320);
  const [minRentalRooms, setMinRentalRooms] = useState(1);
  const [minRentalGuests, setMinRentalGuests] = useState(2);
  const [rentalKitchen, setRentalKitchen] = useState(false);
  const [rentalElevator, setRentalElevator] = useState(false);
  const [rentalParking, setRentalParking] = useState(false);
  const [rentalAccessible, setRentalAccessible] = useState(false);
  const [rentalKidsFriendly, setRentalKidsFriendly] = useState(false);
  const [sortBy, setSortBy] = useState<SortOption>("cheapest");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedFlight, setSelectedFlight] = useState<FlightDeal | null>(null);
  const [selectedHotel, setSelectedHotel] = useState<HotelDeal | null>(null);
  const [selectedRental, setSelectedRental] = useState<ShortTermRental | null>(null);
  const resultsT = useTranslations("results");
  const filtersT = useTranslations("filters");
  const rentalsT = useTranslations("rentals");

  const activeDeal =
    deals.find(
      (deal) =>
        deal.flight.id === selectedFlight?.id && deal.hotel.id === selectedHotel?.id,
    ) ??
    deals.find((deal) => deal.flight.id === selectedFlight?.id) ??
    deals.find((deal) => deal.hotel.id === selectedHotel?.id) ??
    deals[0] ??
    null;

  const availableAmenities = useMemo(
    () => Array.from(new Set(hotels.flatMap((hotel) => hotel.amenities))).sort(),
    [hotels],
  );

  const filteredFlights = useMemo(() => {
    return flights
      .filter((flight) => (nonstopOnly ? flight.nonstop : true))
      .sort((a, b) => {
        if (sortBy === "cheapest") {
          return (a.price ?? Number.MAX_SAFE_INTEGER) - (b.price ?? Number.MAX_SAFE_INTEGER);
        }

        return a.departureTime.localeCompare(b.departureTime);
      });
  }, [flights, nonstopOnly, sortBy]);

  const filteredHotels = useMemo(() => {
    return hotels
      .filter((hotel) => hotel.pricePerNight !== null && hotel.pricePerNight <= maxHotelPrice)
      .filter((hotel) => hotel.pricePerNight !== null && hotel.pricePerNight >= minHotelPrice)
      .filter((hotel) => hotel.rating >= minRating)
      .filter((hotel) => hotel.stars >= minStars)
      .filter((hotel) =>
        selectedAmenity === "all" ? true : hotel.amenities.includes(selectedAmenity),
      )
      .filter((hotel) =>
        accessibilityOnly
          ? hotel.amenities.some((amenity) =>
              ["Elevator", "Accessible rooms", "Central location", "Metro nearby"].includes(
                amenity,
              ),
            )
          : true,
      )
      .sort((a, b) => {
        if (sortBy === "rating") return b.rating - a.rating;
        if (sortBy === "best-value") {
          return b.rating / (b.pricePerNight ?? 1) - a.rating / (a.pricePerNight ?? 1);
        }
        return (a.pricePerNight ?? 0) - (b.pricePerNight ?? 0);
      });
  }, [
    accessibilityOnly,
    hotels,
    maxHotelPrice,
    minHotelPrice,
    minRating,
    minStars,
    selectedAmenity,
    sortBy,
  ]);

  const filteredRentals = useMemo(() => {
    return rentals
      .filter((rental) => rental.pricePerNight <= maxRentalPrice)
      .filter((rental) => rental.rooms >= minRentalRooms)
      .filter((rental) => rental.guests >= minRentalGuests)
      .filter((rental) => (rentalKitchen ? rental.hasKitchen : true))
      .filter((rental) => (rentalElevator ? rental.hasElevator : true))
      .filter((rental) => (rentalParking ? rental.hasParking : true))
      .filter((rental) => (rentalAccessible ? rental.isAccessible : true))
      .filter((rental) => (rentalKidsFriendly ? rental.kidsFriendly : true))
      .sort((a, b) => {
        if (sortBy === "rating") return b.rating - a.rating;
        if (sortBy === "best-value") return b.rating / a.pricePerNight - a.rating / b.pricePerNight;
        return a.pricePerNight - b.pricePerNight;
      });
  }, [
    maxRentalPrice,
    minRentalGuests,
    minRentalRooms,
    rentalAccessible,
    rentalElevator,
    rentalKidsFriendly,
    rentalKitchen,
    rentalParking,
    rentals,
    sortBy,
  ]);

  const selectedSummary = buildSelectedSummary({
    activeDeal,
    selectedFlight,
    selectedHotel,
    selectedRental,
  });

  function updateFilter(action: () => void) {
    setIsLoading(true);
    action();
    window.setTimeout(() => setIsLoading(false), 180);
  }

  function updateLodgingTab(tab: LodgingTab) {
    setActiveLodgingTab(tab);
    const nextParams = new URLSearchParams(searchParams.toString());
    nextParams.set("lodging", tab);
    router.replace(`${pathname}?${nextParams.toString()}`, { scroll: false });
  }

  return (
    <main dir="rtl" className="pb-28 md:pb-8">
      <div className="sticky top-[73px] z-20 border-b border-slate-200 bg-slate-50/95 px-4 py-3 backdrop-blur dark:border-white/10 dark:bg-slate-950/95">
        <div className="mx-auto max-w-7xl">
          <SearchForm compact />
        </div>
      </div>

      <section className="mx-auto grid max-w-7xl gap-6 px-4 py-6 lg:grid-cols-[300px_1fr]">
        <aside className="hidden lg:block">
          <FiltersPanel
            accessibilityOnly={accessibilityOnly}
            availableAmenities={availableAmenities}
            maxHotelPrice={maxHotelPrice}
            maxPrice={maxPrice}
            minHotelPrice={minHotelPrice}
            minRating={minRating}
            minStars={minStars}
            nonstopOnly={nonstopOnly}
            selectedAmenity={selectedAmenity}
            sortBy={sortBy}
            setAccessibilityOnly={setAccessibilityOnly}
            setMaxHotelPrice={(value) => updateFilter(() => setMaxHotelPrice(value))}
            setMaxPrice={(value) => updateFilter(() => setMaxPrice(value))}
            setMinHotelPrice={(value) => updateFilter(() => setMinHotelPrice(value))}
            setMinRating={setMinRating}
            setMinStars={setMinStars}
            setNonstopOnly={setNonstopOnly}
            setSelectedAmenity={setSelectedAmenity}
            setSortBy={setSortBy}
          />
        </aside>

        <div className="grid gap-6">
          <div className="flex flex-col gap-4 rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-slate-900 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm font-bold text-sky-600 dark:text-sky-300">
                {resultsT("searchResults")}
              </p>
              <h1 className="mt-1 text-3xl font-black text-slate-950 dark:text-white">
                {resultsT("title")}
              </h1>
              <p className="mt-2 text-base leading-7 text-slate-500">
                {resultsT("description")}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setFiltersOpen(true)}
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl border border-slate-200 px-5 py-3 text-base font-bold text-slate-700 lg:hidden dark:border-white/10 dark:text-slate-200"
            >
              <Filter className="h-5 w-5" />
              {filtersT("filter")}
            </button>
          </div>

          <StatusMessages warning={warning} warnings={warnings} />

          <LiveTripWidgets
            destination={destination}
            amount={activeDeal?.estimatedTotal ?? null}
            currency={activeDeal?.currency ?? selectedFlight?.currency ?? "USD"}
          />

          <TripMap destination={destination} hotels={filteredHotels} rentals={filteredRentals} />

          <SelectionSummary
            activeDeal={activeDeal}
            selectedFlight={selectedFlight}
            selectedHotel={selectedHotel}
            selectedRental={selectedRental}
          />

          {isLoading ? <LoadingSkeletons /> : null}

          <FlowStep
            description={resultsT("chooseFlight")}
            step="1"
            title={resultsT("chooseFlight")}
          >
            <div className="grid gap-4 md:grid-cols-2">
              {filteredFlights.length ? (
                filteredFlights.map((flight) => (
                  <FlightCard
                    key={flight.id}
                    flight={flight}
                    isSelected={selectedFlight?.id === flight.id}
                    onSelect={setSelectedFlight}
                  />
                ))
              ) : (
                <UnavailableState message={resultsT("unavailableFlights")} />
              )}
            </div>
          </FlowStep>

          <FlowStep
            description={activeLodgingTab === "hotels" ? resultsT("chooseHotel") : rentalsT("description")}
            step="2"
            title={activeLodgingTab === "hotels" ? resultsT("chooseHotel") : rentalsT("title")}
          >
            <LodgingTabs activeTab={activeLodgingTab} onChange={updateLodgingTab} />
            {activeLodgingTab === "rentals" ? (
              <RentalFilters
                accessible={rentalAccessible}
                elevator={rentalElevator}
                kidsFriendly={rentalKidsFriendly}
                kitchen={rentalKitchen}
                maxPrice={maxRentalPrice}
                minGuests={minRentalGuests}
                minRooms={minRentalRooms}
                parking={rentalParking}
                setAccessible={setRentalAccessible}
                setElevator={setRentalElevator}
                setKidsFriendly={setRentalKidsFriendly}
                setKitchen={setRentalKitchen}
                setMaxPrice={(value) => updateFilter(() => setMaxRentalPrice(value))}
                setMinGuests={setMinRentalGuests}
                setMinRooms={setMinRentalRooms}
                setParking={setRentalParking}
              />
            ) : null}
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              {activeLodgingTab === "hotels" ? (
                filteredHotels.length ? (
                  filteredHotels.map((hotel) => (
                    <HotelCard
                      key={hotel.id}
                      hotel={hotel}
                      isSelected={selectedHotel?.id === hotel.id}
                      onSelect={(hotelDeal) => {
                        setSelectedHotel(hotelDeal);
                        setSelectedRental(null);
                      }}
                    />
                  ))
                ) : (
                  <UnavailableState message={resultsT("unavailableHotels")} />
                )
              ) : filteredRentals.length ? (
                filteredRentals.map((rental) => (
                  <ShortTermRentalCard
                    key={rental.id}
                    rental={rental}
                    isSelected={selectedRental?.id === rental.id}
                    onSelect={(rentalDeal) => {
                      setSelectedRental(rentalDeal);
                      setSelectedHotel(null);
                    }}
                  />
                ))
              ) : (
                <UnavailableState message={rentalsT("unavailable")} />
              )}
            </div>
          </FlowStep>

          <FlowStep
            description="זהו הסיכום שממנו ממשיכים לבניית מסלול או להזמנה חיצונית אם הספק מספק קישור."
            step="3"
            title={resultsT("summary")}
          >
            <SummaryCard
              activeDeal={activeDeal}
              selectedFlight={selectedFlight}
              selectedHotel={selectedHotel}
              selectedRental={selectedRental}
            />
          </FlowStep>
        </div>
      </section>

      <MobileFilterDrawer open={filtersOpen} onClose={() => setFiltersOpen(false)}>
        <FiltersPanel
          accessibilityOnly={accessibilityOnly}
          availableAmenities={availableAmenities}
          maxHotelPrice={maxHotelPrice}
          maxPrice={maxPrice}
          minHotelPrice={minHotelPrice}
          minRating={minRating}
          minStars={minStars}
          nonstopOnly={nonstopOnly}
          selectedAmenity={selectedAmenity}
          sortBy={sortBy}
          setAccessibilityOnly={setAccessibilityOnly}
          setMaxHotelPrice={(value) => updateFilter(() => setMaxHotelPrice(value))}
          setMaxPrice={(value) => updateFilter(() => setMaxPrice(value))}
          setMinHotelPrice={(value) => updateFilter(() => setMinHotelPrice(value))}
          setMinRating={setMinRating}
          setMinStars={setMinStars}
          setNonstopOnly={setNonstopOnly}
          setSelectedAmenity={setSelectedAmenity}
          setSortBy={setSortBy}
        />
      </MobileFilterDrawer>

      <StickyBottomCta
        activeDeal={activeDeal}
        selectedFlight={selectedFlight}
        selectedHotel={selectedHotel}
        selectedRental={selectedRental}
        selectedSummary={selectedSummary}
      />
    </main>
  );
}

function FlowStep({
  children,
  description,
  step,
  title,
}: {
  children: ReactNode;
  description: string;
  step: string;
  title: string;
}) {
  return (
    <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-slate-900">
      <div className="mb-5 flex items-start gap-3">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-sky-600 text-base font-black text-white">
          {step}
        </span>
        <div>
          <h2 className="text-2xl font-black text-slate-950 dark:text-white">{title}</h2>
          <p className="mt-1 text-base leading-7 text-slate-500">{description}</p>
        </div>
      </div>
      {children}
    </section>
  );
}

function FiltersPanel({
  accessibilityOnly,
  availableAmenities,
  maxHotelPrice,
  maxPrice,
  minHotelPrice,
  minRating,
  minStars,
  nonstopOnly,
  selectedAmenity,
  sortBy,
  setAccessibilityOnly,
  setMaxHotelPrice,
  setMaxPrice,
  setMinHotelPrice,
  setMinRating,
  setMinStars,
  setNonstopOnly,
  setSelectedAmenity,
  setSortBy,
}: {
  accessibilityOnly: boolean;
  availableAmenities: string[];
  maxHotelPrice: number;
  maxPrice: number;
  minHotelPrice: number;
  minRating: number;
  minStars: number;
  nonstopOnly: boolean;
  selectedAmenity: string;
  sortBy: SortOption;
  setAccessibilityOnly: (value: boolean) => void;
  setMaxHotelPrice: (value: number) => void;
  setMaxPrice: (value: number) => void;
  setMinHotelPrice: (value: number) => void;
  setMinRating: (value: number) => void;
  setMinStars: (value: number) => void;
  setNonstopOnly: (value: boolean) => void;
  setSelectedAmenity: (value: string) => void;
  setSortBy: (value: SortOption) => void;
}) {
  const filtersT = useTranslations("filters");

  return (
    <div className="h-fit rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-slate-900">
      <h2 className="text-xl font-black text-slate-950 dark:text-white">{filtersT("filter")}</h2>
      <div className="mt-5 grid gap-5">
        <label className="text-sm font-bold text-slate-700 dark:text-slate-200">
          מיון תוצאות
          <select
            className="mt-2 min-h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 dark:border-white/10 dark:bg-slate-950"
            onChange={(event) => setSortBy(event.target.value as SortOption)}
            value={sortBy}
          >
            <option value="cheapest">הזול ביותר</option>
            <option value="best-value">המשתלם ביותר</option>
            <option value="rating">הדירוג הגבוה ביותר</option>
          </select>
        </label>

        <RangeField
          label={`תקציב מקסימלי לטיול: $${maxPrice}`}
          max={3000}
          min={500}
          onChange={setMaxPrice}
          value={maxPrice}
        />
        <RangeField
          label={`מחיר מינימלי למלון ללילה: $${minHotelPrice}`}
          max={500}
          min={0}
          onChange={setMinHotelPrice}
          value={minHotelPrice}
        />
        <RangeField
          label={`מחיר מקסימלי למלון ללילה: $${maxHotelPrice}`}
          max={600}
          min={50}
          onChange={setMaxHotelPrice}
          value={maxHotelPrice}
        />

        <label className="text-sm font-bold text-slate-700 dark:text-slate-200">
          דירוג מינימלי
          <select
            className="mt-2 min-h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 dark:border-white/10 dark:bg-slate-950"
            onChange={(event) => setMinRating(Number(event.target.value))}
            value={minRating}
          >
            <option value={4}>4.0+</option>
            <option value={4.5}>4.5+</option>
            <option value={4.8}>4.8+</option>
          </select>
        </label>

        <label className="text-sm font-bold text-slate-700 dark:text-slate-200">
          כוכבי מלון
          <select
            className="mt-2 min-h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 dark:border-white/10 dark:bg-slate-950"
            onChange={(event) => setMinStars(Number(event.target.value))}
            value={minStars}
          >
            <option value={3}>3+ כוכבים</option>
            <option value={4}>4+ כוכבים</option>
            <option value={5}>5 כוכבים</option>
          </select>
        </label>

        <label className="text-sm font-bold text-slate-700 dark:text-slate-200">
          מתקנים
          <select
            className="mt-2 min-h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 dark:border-white/10 dark:bg-slate-950"
            onChange={(event) => setSelectedAmenity(event.target.value)}
            value={selectedAmenity}
          >
            <option value="all">כל המתקנים</option>
            {availableAmenities.map((amenity) => (
              <option key={amenity} value={amenity}>
                {amenity}
              </option>
            ))}
          </select>
        </label>

        <CheckField
          checked={nonstopOnly}
          label="טיסות ישירות בלבד"
          onChange={setNonstopOnly}
        />
        <CheckField
          checked={accessibilityOnly}
          label="הצג רק התאמות נגישות"
          onChange={setAccessibilityOnly}
          variant="success"
        />
      </div>
    </div>
  );
}

function LodgingTabs({
  activeTab,
  onChange,
}: {
  activeTab: LodgingTab;
  onChange: (tab: LodgingTab) => void;
}) {
  const resultsT = useTranslations("results");
  const rentalsT = useTranslations("rentals");

  return (
    <div className="grid gap-2 rounded-2xl bg-slate-100 p-2 dark:bg-white/10 sm:grid-cols-2">
      <button
        type="button"
        data-testid="lodging-tab-hotels"
        onClick={() => onChange("hotels")}
        className={`min-h-12 rounded-xl px-4 py-3 text-sm font-black transition ${
          activeTab === "hotels"
            ? "bg-white text-slate-950 shadow-sm dark:bg-slate-950 dark:text-white"
            : "text-slate-600 hover:bg-white/70 dark:text-slate-300 dark:hover:bg-white/10"
        }`}
      >
        {resultsT("chooseHotel")}
      </button>
      <button
        type="button"
        data-testid="lodging-tab-rentals"
        onClick={() => onChange("rentals")}
        className={`min-h-12 rounded-xl px-4 py-3 text-sm font-black transition ${
          activeTab === "rentals"
            ? "bg-white text-slate-950 shadow-sm dark:bg-slate-950 dark:text-white"
            : "text-slate-600 hover:bg-white/70 dark:text-slate-300 dark:hover:bg-white/10"
        }`}
      >
        {rentalsT("tab")}
      </button>
    </div>
  );
}

function RentalFilters({
  accessible,
  elevator,
  kidsFriendly,
  kitchen,
  maxPrice,
  minGuests,
  minRooms,
  parking,
  setAccessible,
  setElevator,
  setKidsFriendly,
  setKitchen,
  setMaxPrice,
  setMinGuests,
  setMinRooms,
  setParking,
}: {
  accessible: boolean;
  elevator: boolean;
  kidsFriendly: boolean;
  kitchen: boolean;
  maxPrice: number;
  minGuests: number;
  minRooms: number;
  parking: boolean;
  setAccessible: (value: boolean) => void;
  setElevator: (value: boolean) => void;
  setKidsFriendly: (value: boolean) => void;
  setKitchen: (value: boolean) => void;
  setMaxPrice: (value: number) => void;
  setMinGuests: (value: number) => void;
  setMinRooms: (value: number) => void;
  setParking: (value: boolean) => void;
}) {
  const rentalsT = useTranslations("rentals");

  return (
    <div
      data-testid="rental-filters"
      className="mt-4 rounded-2xl border border-teal-100 bg-teal-50/60 p-4 dark:border-teal-400/20 dark:bg-teal-400/10"
    >
      <p className="text-sm font-black text-teal-800 dark:text-teal-100">
        {rentalsT("filtersTitle")}
      </p>
      <div className="mt-4 grid gap-4 md:grid-cols-3">
        <RangeField
          label={`${rentalsT("priceMax")}: $${maxPrice}`}
          max={600}
          min={60}
          onChange={setMaxPrice}
          value={maxPrice}
        />
        <NumberSelect
          label={rentalsT("rooms")}
          max={5}
          min={1}
          onChange={setMinRooms}
          value={minRooms}
        />
        <NumberSelect
          label={rentalsT("guests")}
          max={10}
          min={1}
          onChange={setMinGuests}
          value={minGuests}
        />
      </div>
      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <CheckField checked={kitchen} label={rentalsT("kitchen")} onChange={setKitchen} />
        <CheckField checked={elevator} label={rentalsT("elevator")} onChange={setElevator} />
        <CheckField checked={parking} label={rentalsT("parking")} onChange={setParking} />
        <CheckField
          checked={accessible}
          label={rentalsT("accessible")}
          onChange={setAccessible}
          variant="success"
        />
        <CheckField
          checked={kidsFriendly}
          label={rentalsT("kidsFriendly")}
          onChange={setKidsFriendly}
          variant="success"
        />
      </div>
    </div>
  );
}

function NumberSelect({
  label,
  max,
  min,
  onChange,
  value,
}: {
  label: string;
  max: number;
  min: number;
  onChange: (value: number) => void;
  value: number;
}) {
  return (
    <label className="text-sm font-bold text-slate-700 dark:text-slate-200">
      {label}
      <select
        className="mt-2 min-h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 dark:border-white/10 dark:bg-slate-950"
        onChange={(event) => onChange(Number(event.target.value))}
        value={value}
      >
        {Array.from({ length: max - min + 1 }, (_, index) => min + index).map((item) => (
          <option key={item} value={item}>
            {item}+
          </option>
        ))}
      </select>
    </label>
  );
}

function RangeField({
  label,
  max,
  min,
  onChange,
  value,
}: {
  label: string;
  max: number;
  min: number;
  onChange: (value: number) => void;
  value: number;
}) {
  return (
    <label className="text-sm font-bold text-slate-700 dark:text-slate-200">
      {label}
      <input
        className="mt-3 w-full accent-sky-500"
        max={max}
        min={min}
        onChange={(event) => onChange(Number(event.target.value))}
        type="range"
        value={value}
      />
    </label>
  );
}

function CheckField({
  checked,
  label,
  onChange,
  variant = "default",
}: {
  checked: boolean;
  label: string;
  onChange: (value: boolean) => void;
  variant?: "default" | "success";
}) {
  return (
    <label
      className={`flex min-h-12 items-center gap-3 rounded-2xl p-4 text-sm font-bold ${
        variant === "success"
          ? "bg-emerald-50 text-emerald-900 dark:bg-emerald-400/10 dark:text-emerald-100"
          : "bg-slate-50 text-slate-700 dark:bg-white/10 dark:text-slate-200"
      }`}
    >
      <input
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        type="checkbox"
      />
      {label}
    </label>
  );
}

function StatusMessages({
  warning,
  warnings,
}: {
  warning?: string;
  warnings?: { flights?: string; hotels?: string };
}) {
  const items = [
    warning,
    warnings?.flights ? `טיסות: ${warnings.flights}` : "",
    warnings?.hotels ? `מלונות: ${warnings.hotels}` : "",
  ].filter(Boolean);

  if (!items.length) return null;

  return (
    <div className="grid gap-3">
      {items.map((item) => (
        <div
          key={item}
          className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-bold text-amber-900 dark:border-amber-400/30 dark:bg-amber-400/10 dark:text-amber-100"
        >
          {item}
        </div>
      ))}
    </div>
  );
}

function SelectionSummary({
  activeDeal,
  selectedFlight,
  selectedHotel,
  selectedRental,
}: {
  activeDeal: TripDeal | null;
  selectedFlight: FlightDeal | null;
  selectedHotel: HotelDeal | null;
  selectedRental: ShortTermRental | null;
}) {
  const rentalsT = useTranslations("rentals");

  if (!selectedFlight && !selectedHotel && !selectedRental) return null;

  return (
    <section
      data-testid="selected-flight-summary"
      className="rounded-[2rem] border border-sky-200 bg-sky-50 p-5 shadow-sm dark:border-sky-400/30 dark:bg-sky-400/10"
    >
      <p className="text-sm font-black text-sky-700 dark:text-sky-200">בחירה נוכחית</p>
      <div className="mt-3 grid gap-3 md:grid-cols-3">
        <SummaryLine
          label="טיסה"
          value={
            selectedFlight
              ? `${selectedFlight.airline} · ${selectedFlight.from} אל ${selectedFlight.destination}`
              : "עדיין לא נבחרה טיסה"
          }
        />
        <SummaryLine
          label="מלון"
          value={selectedHotel ? selectedHotel.name : "עדיין לא נבחר מלון"}
        />
        <SummaryLine
          label={rentalsT("tab")}
          value={selectedRental ? selectedRental.name : rentalsT("notSelected")}
        />
      </div>
      <p className="mt-4 text-lg font-black text-slate-950 dark:text-white">
        סה"כ:{" "}
        {activeDeal?.estimatedTotal === null || !activeDeal
          ? "לא זמין כרגע"
          : formatOfferPrice(activeDeal.estimatedTotal, activeDeal.currency)}
      </p>
    </section>
  );
}

function SummaryCard({
  activeDeal,
  selectedFlight,
  selectedHotel,
  selectedRental,
}: {
  activeDeal: TripDeal | null;
  selectedFlight: FlightDeal | null;
  selectedHotel: HotelDeal | null;
  selectedRental: ShortTermRental | null;
}) {
  const rentalsT = useTranslations("rentals");
  const lodgingLabel = selectedRental ? rentalsT("tab") : "מלון";
  const lodgingValue = selectedRental
    ? `${selectedRental.name} · ${formatOfferPrice(selectedRental.pricePerNight, selectedRental.currency)}/לילה`
    : selectedHotel
      ? `${selectedHotel.name} · ${formatOfferPrice(selectedHotel.pricePerNight, selectedHotel.currency)}/לילה`
      : "Choose a hotel or apartment to complete the summary";

  return (
    <article className="rounded-3xl border border-slate-200 bg-slate-50 p-5 dark:border-white/10 dark:bg-white/5">
      <div className="grid gap-4 md:grid-cols-3">
        <SummaryLine
          label="טיסה"
          value={
            selectedFlight
              ? `${selectedFlight.airline} · ${formatOfferPrice(selectedFlight.price, selectedFlight.currency)}`
              : "Choose a flight to continue"
          }
        />
        <SummaryLine
          label={lodgingLabel}
          value={lodgingValue}
        />
        <SummaryLine
          label="תקציב"
          value={
            activeDeal?.estimatedTotal === null || !activeDeal
              ? "לא זמין כרגע"
              : formatOfferPrice(activeDeal.estimatedTotal, activeDeal.currency)
          }
        />
      </div>
      <div className="mt-5 flex flex-wrap gap-2">
        {selectedFlight?.bookingLink ? (
          <a
            href={selectedFlight.bookingLink}
            target="_blank"
            rel="noreferrer"
            className="rounded-2xl bg-sky-600 px-5 py-3 text-base font-bold text-white transition hover:bg-sky-700"
          >
            המשך להזמנה
          </a>
        ) : null}
        {selectedRental?.bookingLink ? (
          <a
            href={selectedRental.bookingLink}
            target="_blank"
            rel="noreferrer"
            className="rounded-2xl border border-teal-200 px-5 py-3 text-base font-bold text-teal-700 transition hover:bg-teal-50"
          >
            {rentalsT("continueBooking")}
          </a>
        ) : null}
        <Link
          href={activeDeal ? `/trip/${activeDeal.id}` : "/questionnaire"}
          className="rounded-2xl bg-slate-950 px-5 py-3 text-base font-bold text-white transition hover:bg-sky-600 dark:bg-sky-500 dark:text-slate-950"
        >
          המשך לבניית מסלול
        </Link>
      </div>
    </article>
  );
}

function SummaryLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-white p-4 text-sm dark:bg-slate-950/60">
      <p className="font-bold text-slate-500">{label}</p>
      <p className="mt-1 text-base font-black text-slate-950 dark:text-white">{value}</p>
    </div>
  );
}

function UnavailableState({ message }: { message: string }) {
  return (
    <div className="rounded-[2rem] border border-dashed border-slate-300 bg-white p-8 text-center text-base font-bold text-slate-500 dark:border-white/10 dark:bg-slate-900">
      {message}
    </div>
  );
}

function MobileFilterDrawer({
  children,
  onClose,
  open,
}: {
  children: ReactNode;
  onClose: () => void;
  open: boolean;
}) {
  const filtersT = useTranslations("filters");

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      <button
        type="button"
        aria-label={filtersT("filter")}
        className="absolute inset-0 bg-slate-950/40"
        onClick={onClose}
      />
      <div className="absolute inset-x-0 bottom-0 max-h-[88vh] overflow-y-auto rounded-t-[2rem] bg-white p-4 shadow-2xl dark:bg-slate-950">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-xl font-black">{filtersT("filter")}</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-slate-200 p-3 dark:border-white/10"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

function StickyBottomCta({
  activeDeal,
  selectedFlight,
  selectedHotel,
  selectedRental,
  selectedSummary,
}: {
  activeDeal: TripDeal | null;
  selectedFlight: FlightDeal | null;
  selectedHotel: HotelDeal | null;
  selectedRental: ShortTermRental | null;
  selectedSummary: string;
}) {
  if (!selectedFlight && !selectedHotel && !selectedRental) return null;

  return (
    <div
      data-testid="sticky-bottom-cta"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white/95 p-3 shadow-2xl backdrop-blur dark:border-white/10 dark:bg-slate-950/95 md:hidden"
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-sm font-bold text-slate-950 dark:text-white">
            {selectedSummary}
          </p>
          <p className="text-xs text-slate-500">
            {activeDeal?.estimatedTotal
              ? formatOfferPrice(activeDeal.estimatedTotal, activeDeal.currency)
              : "לא זמין כרגע"}
          </p>
        </div>
        <Link
          href={activeDeal ? `/trip/${activeDeal.id}` : "/questionnaire"}
          className="shrink-0 rounded-2xl bg-slate-950 px-4 py-3 text-sm font-bold text-white dark:bg-sky-500 dark:text-slate-950"
        >
          המשך
        </Link>
      </div>
    </div>
  );
}

function buildSelectedSummary({
  activeDeal,
  selectedFlight,
  selectedHotel,
  selectedRental,
}: {
  activeDeal: TripDeal | null;
  selectedFlight: FlightDeal | null;
  selectedHotel: HotelDeal | null;
  selectedRental: ShortTermRental | null;
}) {
  if (selectedFlight && selectedHotel) {
    return `${selectedFlight.airline} · ${selectedHotel.name}`;
  }

  if (selectedFlight && selectedRental) {
    return `${selectedFlight.airline} · ${selectedRental.name}`;
  }

  if (selectedFlight) return `${selectedFlight.airline} נבחרה`;
  if (selectedHotel) return `${selectedHotel.name} נבחר`;
  if (selectedRental) return `${selectedRental.name} נבחרה`;
  return activeDeal?.title ?? "סיכום";
}

