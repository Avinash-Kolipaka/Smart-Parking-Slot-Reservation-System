import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import GlassCard from '../components/GlassCard';
import { 
  MapPin, Clock, Car, Bike, Zap, Star, MessageSquare, 
  Send, Compass, HelpCircle, ShieldAlert 
} from 'lucide-react';

const ParkingDetails = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const { showToast } = useNotifications();
  const [location, setLocation] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  // Review form state
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  const fetchDetails = async () => {
    try {
      const response = await api.get(`/parking/${id}`);
      setLocation(response.data.data);
      
      // Load reviews
      const reviewsRes = await api.get('/auth/me'); // Just mock/me setup
    } catch (err) {
      console.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetails();
    
    // Seed review states
    setReviews([
      { id: '1', userName: 'John Doe', rating: 5, comment: 'Extremely clean parking lot. The slots are spacious and the EV charging is fast! Will definitely use it again.', date: new Date() },
      { id: '2', userName: 'Jane Smith', rating: 4, comment: 'Great value for money, very close to the train station. Gets a bit busy in the morning but slot reservation makes it stress-free.', date: new Date() }
    ]);
  }, [id]);

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!comment.trim()) return;

    setSubmittingReview(true);
    try {
      // Create a mock review append in client state
      const newReview = {
        id: Math.random().toString(),
        userName: user?.name || 'Anonymous',
        rating,
        comment,
        date: new Date()
      };
      setReviews(prev => [newReview, ...prev]);
      setComment('');
      showToast('Thank you for your feedback! Review published.', 'success');
    } catch (err) {
      showToast('Could not submit review. Please try again.', 'error');
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-6 w-full py-12 flex items-center justify-center text-slate-400">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4" />
      </div>
    );
  }

  if (!location) {
    return (
      <div className="max-w-4xl mx-auto px-6 w-full py-16 text-center text-slate-500 font-mono">
        Location details not found.
      </div>
    );
  }

  const averageRating = reviews.reduce((sum, r) => sum + r.rating, 0) / (reviews.length || 1);

  return (
    <div className="max-w-7xl mx-auto px-6 w-full flex flex-col gap-10">
      
      {/* Back to parking grid link */}
      <Link to="/locations" className="text-xs text-blue-400 hover:underline self-start flex items-center gap-1.5">
        ← Return to search
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Side: Images and Description (2 cols) */}
        <div className="lg:col-span-2 flex flex-col gap-8">
          
          <div className="aspect-video w-full rounded-2xl bg-slate-900 overflow-hidden border border-slate-900">
            <img
              src={location.images[0] || 'https://images.unsplash.com/photo-1506521788701-1e13a700b10a?auto=format&fit=crop&q=80&w=1000'}
              alt={location.name}
              className="w-full h-full object-cover"
            />
          </div>

          <div className="flex flex-col gap-4">
            <h1 className="text-2xl sm:text-3xl font-extrabold font-display text-slate-100">
              {location.name}
            </h1>
            
            <p className="text-xs text-slate-400 flex items-center gap-1.5">
              <MapPin size={14} className="text-blue-500 shrink-0" />
              {location.address}
            </p>

            <div className="h-px bg-slate-900/60 my-2" />

            <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-widest font-display">
              About Location
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              {location.description}
            </p>
          </div>

          {/* User Review Logs */}
          <div className="flex flex-col gap-6 border-t border-slate-900 pt-8 mt-4">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-widest font-display">
                Customer Feedback
              </h3>
              <div className="flex items-center gap-1.5 text-xs text-slate-400">
                <Star size={14} className="text-amber-400 fill-amber-400" />
                <span className="font-semibold text-slate-200">{averageRating.toFixed(1)}</span>
                <span>({reviews.length} reviews)</span>
              </div>
            </div>

            {/* List Reviews */}
            <div className="flex flex-col gap-4">
              {reviews.map(rev => (
                <div key={rev.id} className="p-4 bg-slate-900/20 border border-slate-900 rounded-xl leading-relaxed">
                  <div className="flex justify-between items-center gap-4 mb-2">
                    <span className="text-xs font-bold text-slate-200">{rev.userName}</span>
                    <div className="flex items-center gap-1 text-[10px] text-amber-400">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          size={10}
                          className={i < rev.rating ? 'fill-amber-400' : 'text-slate-700'}
                        />
                      ))}
                    </div>
                  </div>
                  <p className="text-xs text-slate-400">{rev.comment}</p>
                </div>
              ))}
            </div>

            {/* Add Review Form */}
            {user ? (
              <form onSubmit={handleReviewSubmit} className="flex flex-col gap-4 bg-slate-900/10 border border-slate-900 p-5 rounded-2xl">
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider font-display">
                  Publish Your Feedback
                </h4>

                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-400">Rating:</span>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        type="button"
                        key={star}
                        onClick={() => setRating(star)}
                        className="text-amber-400 hover:scale-110 transition-transform"
                      >
                        <Star size={16} className={star <= rating ? 'fill-amber-400' : 'text-slate-700'} />
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex gap-2">
                  <input
                    type="text"
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Tell other drivers about your parking experience..."
                    className="flex-1 bg-slate-950 border border-slate-900 rounded-xl px-4 py-2.5 text-xs text-slate-300 focus:outline-none focus:border-blue-500/60"
                  />
                  <button
                    type="submit"
                    disabled={submittingReview}
                    className="btn-primary py-2 px-6 rounded-xl text-xs font-semibold shadow-none"
                  >
                    <Send size={12} />
                    Submit
                  </button>
                </div>
              </form>
            ) : (
              <div className="p-4 border border-dashed border-slate-900 rounded-xl text-xs text-slate-500 text-center font-mono">
                Please <Link to="/login" className="text-blue-400 underline">login</Link> to submit location reviews.
              </div>
            )}

          </div>

        </div>

        {/* Right Side: Operational specifications card */}
        <div className="lg:col-span-1 flex flex-col gap-6">
          <GlassCard className="p-6 bg-slate-900/20 border-slate-800/80 flex flex-col gap-5 sticky top-28">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-widest font-display">
              Facility Specifications
            </h3>

            <div className="flex flex-col gap-3.5 text-xs">
              
              <div className="flex justify-between items-center py-2 border-b border-slate-900/60">
                <span className="text-slate-500">Base Hourly Rate</span>
                <span className="font-bold text-slate-200">${location.pricePerHour.toFixed(2)} / Hour</span>
              </div>

              <div className="flex justify-between items-center py-2 border-b border-slate-900/60">
                <span className="text-slate-500">Facility Type</span>
                <span className="font-bold text-slate-200">{location.parkingType} Structure</span>
              </div>

              <div className="flex justify-between items-center py-2 border-b border-slate-900/60">
                <span className="text-slate-500">Levels / Floors</span>
                <span className="font-bold text-slate-200">{location.numberOfFloors} Floor(s)</span>
              </div>

              <div className="flex justify-between items-center py-2 border-b border-slate-900/60">
                <span className="text-slate-500">Operating Hours</span>
                <span className="font-bold text-slate-200">{location.openingHours} - {location.closingHours}</span>
              </div>

              <div className="flex justify-between items-center py-2 border-b border-slate-900/60">
                <span className="text-slate-500">Coordinates (Geo)</span>
                <span className="font-bold text-slate-300 font-mono text-[10px]">
                  {location.coordinates.lat.toFixed(4)}, {location.coordinates.lng.toFixed(4)}
                </span>
              </div>

              <div className="flex justify-between items-center py-2 border-b border-slate-900/60">
                <span className="text-slate-500">Total Capacity</span>
                <span className="font-bold text-slate-300">{location.totalSlots} Slots</span>
              </div>

            </div>

            <Link
              to={location.availableSlots > 0 ? `/locations/${location._id}/reserve` : '#'}
              className={`btn-primary w-full py-3 text-sm font-semibold rounded-xl text-center flex items-center justify-center ${
                location.availableSlots === 0 ? 'opacity-30 cursor-not-allowed shadow-none' : ''
              }`}
            >
              Configure Reservation Slot
            </Link>

            {location.availableSlots === 0 && (
              <div className="flex items-center gap-1.5 text-[10px] text-rose-400 bg-rose-950/10 border border-rose-900/20 p-2.5 rounded-lg justify-center">
                <ShieldAlert size={12} />
                <span>Currently fully occupied. Check back later!</span>
              </div>
            )}

          </GlassCard>
        </div>

      </div>

    </div>
  );
};

export default ParkingDetails;
