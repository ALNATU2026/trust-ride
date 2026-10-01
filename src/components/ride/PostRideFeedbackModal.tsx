import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Star,
  X,
  Car,
  User,
  CheckCircle2,
  ThumbsUp,
  MapPin,
  Calendar,
  DollarSign,
  Sparkles,
  MessageSquare,
  ShieldCheck,
} from 'lucide-react';
import { RideRequest } from '../../types';

interface PostRideFeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  ride: RideRequest | null;
  role: 'rider' | 'driver';
}

const RIDER_TAGS_POSITIVE = [
  '🛡️ Safe Driving',
  '✨ Clean Vehicle',
  '😊 Polite & Respectful',
  '🗺️ Fast Navigation',
  '❄️ Comfortable AC',
  '⚡ On-Time Arrival',
  '🎵 Great Music/Calm',
];

const RIDER_TAGS_NEGATIVE = [
  '⚠️ Reckless Speed',
  '🕒 Late Arrival',
  '📱 Phone Distracted',
  '🚗 Vehicle Needs Repair',
  '🗣️ Impolite',
];

const DRIVER_TAGS_POSITIVE = [
  '⏱️ Ready at Pickup',
  '🤝 Respectful & Friendly',
  '🌟 Clear Directions',
  '💵 Prompt Payment',
  '🧼 Clean Passenger',
  '🛡️ Followed Safety Rules',
];

const DRIVER_TAGS_NEGATIVE = [
  '⏳ Kept Driver Waiting',
  '🚪 Slammed Door',
  '🚯 Left Trash in Car',
  '🗣️ Impolite Demeanor',
];

export const PostRideFeedbackModal: React.FC<PostRideFeedbackModalProps> = ({
  isOpen,
  onClose,
  ride,
  role,
}) => {
  const { submitRideFeedback } = useApp();

  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [comment, setComment] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen || !ride) return null;

  const activeRating = hoverRating !== null ? hoverRating : rating;

  const getRatingLabel = (val: number) => {
    switch (val) {
      case 5:
        return { text: 'Exceptional Experience!', sub: 'Flawless 5-star service', color: 'text-emerald-600' };
      case 4:
        return { text: 'Very Good', sub: 'Smooth and enjoyable journey', color: 'text-teal-600' };
      case 3:
        return { text: 'Average / Fair', sub: 'Acceptable service with room to improve', color: 'text-amber-600' };
      case 2:
        return { text: 'Below Expectations', sub: 'Several issues experienced', color: 'text-orange-600' };
      case 1:
        return { text: 'Unsatisfactory', sub: 'Significant problems during trip', color: 'text-rose-600' };
      default:
        return { text: 'Select a Rating', sub: 'Tap a star below', color: 'text-slate-500' };
    }
  };

  const currentLabel = getRatingLabel(activeRating);

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleQuickSnippet = (text: string) => {
    setComment((prev) => (prev ? `${prev} ${text}` : text));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rating) return;

    setIsSubmitting(true);
    try {
      const ok = await submitRideFeedback(ride.id, role, rating, selectedTags, comment);
      if (ok) {
        setIsSuccess(true);
        setTimeout(() => {
          setIsSuccess(false);
          onClose();
        }, 1500);
      } else {
        alert('Could not submit feedback. Please try again.');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isRiderRatingDriver = role === 'rider';
  const partnerName = isRiderRatingDriver
    ? ride.driver?.name || 'Your Driver'
    : ride.passengerName || 'Your Passenger';
  const partnerRoleTitle = isRiderRatingDriver ? 'Commercial Driver' : 'Passenger';

  const tagsPositive = isRiderRatingDriver ? RIDER_TAGS_POSITIVE : DRIVER_TAGS_POSITIVE;
  const tagsNegative = isRiderRatingDriver ? RIDER_TAGS_NEGATIVE : DRIVER_TAGS_NEGATIVE;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 my-8">
        {/* Header Banner */}
        <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white p-6 relative">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 text-white/70 hover:text-white p-1 rounded-full hover:bg-white/10 transition-colors"
            title="Close / Skip"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-amber-400 shadow-inner">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-500/20 px-2 py-0.5 rounded-full border border-emerald-400/30">
                Trip Completed
              </span>
              <h3 className="text-xl font-bold font-display text-white mt-0.5">
                {isRiderRatingDriver ? 'Rate Your Driver' : 'Rate Your Passenger'}
              </h3>
            </div>
          </div>

          {/* Trip Summary Chip */}
          <div className="mt-4 p-3 rounded-2xl bg-white/10 border border-white/15 text-xs grid grid-cols-2 gap-2 text-slate-200">
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-semibold block">Route</span>
              <span className="font-bold text-white truncate block">
                {ride.pickup.name} &rarr; {ride.destination.name}
              </span>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-slate-400 uppercase font-semibold block">Fare Paid</span>
              <span className="font-mono font-bold text-emerald-300">
                SLE {(ride.actualFare || ride.estimatedFare || 35).toFixed(2)}
              </span>
            </div>
          </div>
        </div>

        {/* Content Body */}
        {isSuccess ? (
          <div className="p-8 text-center space-y-4">
            <div className="w-16 h-16 rounded-3xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner animate-bounce">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h4 className="text-xl font-bold text-slate-900">Thank You for Your Review!</h4>
            <p className="text-xs text-slate-600 max-w-sm mx-auto">
              Your feedback helps maintain trust and safety across Trust Ride Sierra Leone. The rating has been updated in real-time.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            {/* Target Partner Info */}
            <div className="flex items-center gap-3 p-3.5 bg-slate-50 rounded-2xl border border-slate-200">
              <div className="w-11 h-11 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold shadow-xs">
                {isRiderRatingDriver ? <Car className="w-5 h-5" /> : <User className="w-5 h-5" />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-slate-900 truncate">{partnerName}</h4>
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                    {partnerRoleTitle}
                  </span>
                </div>
                {isRiderRatingDriver && ride.driver?.vehicle && (
                  <p className="text-xs text-slate-500 font-mono">
                    {ride.driver.vehicle.make} {ride.driver.vehicle.model} • {ride.driver.vehicle.plateNumber}
                  </p>
                )}
                {!isRiderRatingDriver && (
                  <p className="text-xs text-slate-500 font-mono">{ride.passengerPhone}</p>
                )}
              </div>
            </div>

            {/* Star Rating Section */}
            <div className="text-center space-y-2 py-2">
              <div className="space-y-0.5">
                <p className={`text-base font-extrabold ${currentLabel.color}`}>
                  {currentLabel.text}
                </p>
                <p className="text-[11px] text-slate-500">{currentLabel.sub}</p>
              </div>

              {/* 5 Big Stars */}
              <div className="flex items-center justify-center gap-2 pt-2">
                {[1, 2, 3, 4, 5].map((starVal) => {
                  const isFilled = starVal <= activeRating;
                  return (
                    <button
                      key={starVal}
                      type="button"
                      onClick={() => setRating(starVal)}
                      onMouseEnter={() => setHoverRating(starVal)}
                      onMouseLeave={() => setHoverRating(null)}
                      className="p-1 rounded-xl hover:scale-110 active:scale-95 transition-transform cursor-pointer focus:outline-none"
                    >
                      <Star
                        className={`w-9 h-9 transition-colors ${
                          isFilled
                            ? 'text-amber-400 fill-amber-400 drop-shadow-sm'
                            : 'text-slate-300 hover:text-slate-400'
                        }`}
                      />
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Feedback Tags / Badges */}
            <div className="space-y-2.5">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                {activeRating >= 4 ? 'What went well? (Select all that apply)' : 'What could be improved?'}
              </label>

              <div className="flex flex-wrap gap-1.5">
                {(activeRating >= 3 ? tagsPositive : tagsNegative).map((tag) => {
                  const isSelected = selectedTags.includes(tag);
                  return (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => toggleTag(tag)}
                      className={`text-xs px-3 py-1.5 rounded-full font-medium transition-all border ${
                        isSelected
                          ? activeRating >= 3
                            ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                            : 'bg-rose-600 text-white border-rose-600 shadow-xs'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {tag}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Written Review */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Detailed Review (Optional)
                </label>
                <span className="text-[10px] text-slate-400 font-mono">{comment.length}/300</span>
              </div>
              <textarea
                rows={3}
                maxLength={300}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder={
                  isRiderRatingDriver
                    ? `Share details about your trip with ${partnerName}... (e.g. driving safety, vehicle cleanliness, route taken)`
                    : `Leave a note about your passenger... (e.g. promptness at pickup, courtesy, payment)`
                }
                className="w-full text-xs p-3 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all resize-none"
              />

              {/* Quick Snippet Pills */}
              <div className="flex flex-wrap items-center gap-1.5 pt-1">
                <span className="text-[10px] text-slate-400 font-semibold">Quick add:</span>
                {(isRiderRatingDriver
                  ? ['Polite and on time!', 'Clean car, smooth ride.', 'Took the best route.']
                  : ['Pleasant passenger.', 'Ready upon arrival.', 'Great communication!']
                ).map((snippet) => (
                  <button
                    key={snippet}
                    type="button"
                    onClick={() => handleQuickSnippet(snippet)}
                    className="text-[10px] bg-slate-100 hover:bg-slate-200 text-slate-700 px-2 py-0.5 rounded-lg transition-colors"
                  >
                    + "{snippet}"
                  </button>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="pt-2 flex items-center gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors"
              >
                Skip for Now
              </button>

              <button
                type="submit"
                disabled={isSubmitting || rating === 0}
                className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl text-xs transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>Saving Rating...</span>
                  </>
                ) : (
                  <>
                    <ThumbsUp className="w-4 h-4" />
                    <span>Submit {rating}-Star Feedback</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
