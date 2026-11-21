import React, { useState } from 'react';
import { useBookingStore } from '../../store/useBookingStore';
import { FOOD_ADDONS } from '../../data/mockData';
import { soundManager } from '../../utils/soundEffects';
import { 
  ArrowLeft, 
  CreditCard, 
  Check, 
  ShieldCheck, 
  Ticket, 
  Utensils, 
  Plus, 
  Minus, 
  Sparkles,
  Lock,
  Popcorn
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const CheckoutModal: React.FC = () => {
  const {
    selectedMovie,
    selectedTheater,
    selectedShowtime,
    selectedSeats,
    foodQuantities,
    updateFoodQuantity,
    getSeatsSubtotal,
    getFoodSubtotal,
    getConvenienceFee,
    getGrandTotal,
    setViewMode,
    completeBooking,
    isMuted,
  } = useBookingStore();

  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'upi' | 'card' | 'applepay'>('upi');

  if (!selectedMovie || !selectedTheater || !selectedShowtime || selectedSeats.length === 0) {
    return (
      <div className="mx-auto max-w-md p-10 text-center space-y-4">
        <p className="text-creamMuted">No seats currently selected.</p>
        <button
          onClick={() => setViewMode('grid')}
          className="rounded-xl bg-crimson px-5 py-2.5 text-xs font-bold text-white"
        >
          Browse Movies
        </button>
      </div>
    );
  }

  const handlePayNow = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      soundManager.playBookingChime(isMuted);
      // Fire celebration confetti
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#E11D48', '#10B981', '#F59E0B', '#F4F1EA'],
      });
      completeBooking();
    }, 1200);
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 space-y-8">
      {/* Back button */}
      <button
        onClick={() => setViewMode('seats')}
        className="flex items-center space-x-1.5 text-xs font-semibold text-creamMuted hover:text-cream transition"
      >
        <ArrowLeft className="h-4 w-4" />
        <span>Back to Seat Map</span>
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Order details & Gourmet F&B add-ons */}
        <div className="lg:col-span-7 space-y-6">
          {/* Booking Summary Card */}
          <div className="rounded-2xl border border-white/10 bg-charcoal p-6 space-y-4 shadow-xl">
            <div className="flex items-start justify-between border-b border-white/5 pb-4">
              <div>
                <span className="rounded bg-crimson/20 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-rose-300 border border-crimson/30">
                  {selectedShowtime.format}
                </span>
                <h2 className="font-display text-2xl font-black text-cream mt-1">
                  {selectedMovie.title}
                </h2>
                <p className="text-xs text-creamMuted mt-0.5">
                  {selectedTheater.name}
                </p>
                <p className="text-xs text-emeraldLight font-mono mt-0.5">
                  {selectedShowtime.time} • Hall {selectedMovie.roomNumber}
                </p>
              </div>

              <div className="text-right">
                <span className="text-[10px] uppercase font-bold text-creamMuted block">
                  Seats Reserved
                </span>
                <div className="flex flex-wrap justify-end gap-1 mt-1">
                  {selectedSeats.map((s) => (
                    <span
                      key={s.id}
                      className="rounded bg-emeraldAccent/20 border border-emeraldAccent/40 px-2 py-0.5 font-mono text-xs font-black text-emeraldLight"
                    >
                      {s.row}{s.col}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Price items breakdown */}
            <div className="space-y-2 text-xs text-creamMuted">
              <div className="flex justify-between">
                <span>Ticket Price ({selectedSeats.length} seats)</span>
                <span className="font-mono text-cream">₹{getSeatsSubtotal()}</span>
              </div>
              <div className="flex justify-between">
                <span>Integrated Convenience Fee & GST (18%)</span>
                <span className="font-mono text-cream">₹{getConvenienceFee()}</span>
              </div>
              {getFoodSubtotal() > 0 && (
                <div className="flex justify-between text-amber-300">
                  <span>Gourmet Cinema Concessions</span>
                  <span className="font-mono">₹{getFoodSubtotal()}</span>
                </div>
              )}
            </div>
          </div>

          {/* Gourmet Concessions Add-ons */}
          <div className="rounded-2xl border border-white/10 bg-charcoal/80 p-6 space-y-4 shadow-lg">
            <div className="flex items-center justify-between">
              <h3 className="font-display text-lg font-bold text-cream flex items-center gap-2">
                <Popcorn className="h-5 w-5 text-amber-400" />
                <span>Gourmet Concessions & Bites</span>
              </h3>
              <span className="text-[11px] text-creamMuted/70">
                Delivered straight to your seat
              </span>
            </div>

            <div className="space-y-3">
              {FOOD_ADDONS.map((item) => {
                const qty = foodQuantities[item.id] || 0;
                return (
                  <div
                    key={item.id}
                    className="flex items-center justify-between rounded-xl border border-white/5 bg-white/5 p-3.5 hover:border-white/15 transition"
                  >
                    <div className="space-y-0.5 max-w-[280px]">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-xs text-cream">{item.name}</span>
                        {item.isVeg && (
                          <span className="h-2 w-2 rounded-full bg-emerald-500" title="Pure Veg" />
                        )}
                      </div>
                      <p className="text-[10px] text-creamMuted/70 line-clamp-1">{item.desc}</p>
                      <span className="font-mono text-xs font-bold text-amber-300 block">
                        ₹{item.price}
                      </span>
                    </div>

                    {/* Stepper +/- */}
                    <div className="flex items-center space-x-2">
                      {qty > 0 && (
                        <button
                          onClick={() => updateFoodQuantity(item.id, -1)}
                          className="flex h-7 w-7 items-center justify-center rounded-lg border border-white/20 bg-charcoal text-cream hover:bg-white/10"
                        >
                          <Minus className="h-3.5 w-3.5" />
                        </button>
                      )}

                      {qty > 0 && (
                        <span className="w-5 text-center font-mono text-xs font-bold text-cream">
                          {qty}
                        </span>
                      )}

                      <button
                        onClick={() => updateFoodQuantity(item.id, 1)}
                        className={`flex h-7 items-center space-x-1 rounded-lg px-2.5 text-xs font-bold transition ${
                          qty > 0
                            ? 'border border-amber-400/40 bg-amber-400/20 text-amber-200'
                            : 'border border-white/20 bg-white/10 text-cream hover:bg-white/20'
                        }`}
                      >
                        <Plus className="h-3.5 w-3.5" />
                        {qty === 0 && <span>Add</span>}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Payment options & Final checkout card */}
        <div className="lg:col-span-5 space-y-6">
          <div className="rounded-2xl border border-white/15 bg-charcoal p-6 space-y-6 shadow-2xl">
            <h3 className="font-display text-lg font-bold text-cream flex items-center justify-between">
              <span>Payment Details</span>
              <span className="flex items-center text-xs text-emeraldLight font-normal gap-1">
                <Lock className="h-3 w-3" />
                256-Bit SSL Encrypted
              </span>
            </h3>

            {/* Payment method selector */}
            <div className="space-y-2">
              <label className="text-[10px] uppercase font-bold text-creamMuted tracking-wider block">
                Choose Payment Option
              </label>

              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('upi')}
                  className={`rounded-xl border p-3 text-center text-xs font-bold transition ${
                    paymentMethod === 'upi'
                      ? 'border-crimson bg-crimson/15 text-white shadow-glow-crimson'
                      : 'border-white/10 bg-white/5 text-creamMuted hover:border-white/20'
                  }`}
                >
                  Instant UPI
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('card')}
                  className={`rounded-xl border p-3 text-center text-xs font-bold transition ${
                    paymentMethod === 'card'
                      ? 'border-crimson bg-crimson/15 text-white shadow-glow-crimson'
                      : 'border-white/10 bg-white/5 text-creamMuted hover:border-white/20'
                  }`}
                >
                  Credit/Debit
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('applepay')}
                  className={`rounded-xl border p-3 text-center text-xs font-bold transition ${
                    paymentMethod === 'applepay'
                      ? 'border-crimson bg-crimson/15 text-white shadow-glow-crimson'
                      : 'border-white/10 bg-white/5 text-creamMuted hover:border-white/20'
                  }`}
                >
                  Apple Pay
                </button>
              </div>
            </div>

            {/* Mock input field */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-medium text-creamMuted">
                {paymentMethod === 'upi'
                  ? 'Virtual Payment Address (VPA / UPI ID)'
                  : paymentMethod === 'card'
                  ? 'Card Number'
                  : 'Device Account Number'}
              </label>
              <input
                type="text"
                readOnly
                value={
                  paymentMethod === 'upi'
                    ? 'cinephile@oksbi'
                    : paymentMethod === 'card'
                    ? '•••• •••• •••• 4242'
                    : 'Apple Pay Wallet Linked'
                }
                className="w-full rounded-xl border border-white/10 bg-white/5 px-3.5 py-2 font-mono text-xs text-cream focus:outline-none"
              />
            </div>

            {/* Final Total Display */}
            <div className="border-t border-white/10 pt-4 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs text-creamMuted">Total Payable Amount:</span>
                <span className="font-display text-2xl font-black text-emeraldLight">
                  ₹{getGrandTotal()}
                </span>
              </div>
              <p className="text-[10px] text-creamMuted/60">
                Inclusive of all taxes, 3D glasses fee & ticketing convenience charges.
              </p>
            </div>

            {/* Pay Button */}
            <button
              onClick={handlePayNow}
              disabled={isProcessing}
              className="flex w-full items-center justify-center space-x-2 rounded-xl bg-crimson py-3.5 text-sm font-bold text-white shadow-glow-crimson hover:bg-crimsonHover transition-all hover:scale-[1.02] disabled:opacity-50"
            >
              {isProcessing ? (
                <div className="flex items-center space-x-2">
                  <span className="h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                  <span>Securing M-Ticket Seats...</span>
                </div>
              ) : (
                <>
                  <CreditCard className="h-4 w-4" />
                  <span>Authorize & Pay ₹{getGrandTotal()}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
