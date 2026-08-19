import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Flame, 
  ShieldCheck, 
  ArrowLeft, 
  CheckCircle2, 
  ChevronRight,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { API_BASE_URL } from '../../config';

export default function BookingPage() {
  const [services, setServices] = useState([]);
  const [step, setStep] = useState(1);
  const [selectedService, setSelectedService] = useState(null);
  const [selectedDate, setSelectedDate] = useState('');
  
  // Dynamic time slots state
  const [timeSlots, setTimeSlots] = useState([]);
  const [selectedTime, setSelectedTime] = useState('');
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [slotError, setSlotError] = useState('');

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    notes: ''
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/services/`);
        if (!res.ok) {
          throw new Error('Failed to load services');
        }

        const data = await res.json();
        setServices(Array.isArray(data) ? data : []);
        setSelectedService((current) => {
          if (current && data.some((service) => service.id === current.id)) {
            return current;
          }
          return Array.isArray(data) && data.length > 0 ? data[0] : null;
        });
      } catch (err) {
        console.warn('Could not load services from backend.', err);
        setServices([]);
        setSelectedService(null);
      }
    };

    fetchServices();
  }, []);

  useEffect(() => {
    if (!selectedDate) {
      setTimeSlots([]);
      setSelectedTime('');
      setSlotError('');
      return;
    }

    const fetchSlots = async () => {
      setLoadingSlots(true);
      setTimeSlots([]);
      setSelectedTime('');
      setSlotError('');
      try {
        const res = await fetch(`${API_BASE_URL}/api/slots/?date=${encodeURIComponent(selectedDate)}`);
        if (res.ok) {
          const data = await res.json();
          setTimeSlots(Array.isArray(data) ? data : []);
          setSelectedTime(Array.isArray(data) && data.length > 0 ? data[0] : '');
        } else {
          setSlotError('Unable to check availability for this date. Please try again.');
        }
      } catch (err) {
        console.warn('Could not load dynamic slots, using defaults:', err);
        setSlotError('Unable to check availability for this date. Please try again.');
      } finally {
        setLoadingSlots(false);
      }
    };

    fetchSlots();
  }, [selectedDate]);

  const continueToContactDetails = async () => {
    if (!selectedDate || !selectedTime) return;

    setLoadingSlots(true);
    setSlotError('');
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/slots/?date=${encodeURIComponent(selectedDate)}`
      );
      if (!response.ok) {
        throw new Error('Unable to check availability for this date.');
      }

      const availableTimes = await response.json();
      if (!availableTimes.includes(selectedTime)) {
        setTimeSlots(availableTimes);
        setSelectedTime(availableTimes[0] || '');
        setSlotError(
          'That time was just booked. Please choose another available time.'
        );
        return;
      }

      setStep(3);
    } catch (err) {
      setSlotError(err.message || 'Unable to check availability. Please try again.');
    } finally {
      setLoadingSlots(false);
    }
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    if (!selectedService) return;

    setIsSubmitting(true);
    setErrorMessage('');

    const payload = {
      fullName: formData.fullName,
      email: formData.email,
      phone: formData.phone,
      address: formData.address,
      serviceId: selectedService.id,
      serviceTitle: selectedService.title,
      price: selectedService.price,
      bookingDate: selectedDate,
      bookingTime: selectedTime,
    };

    try {
      const response = await fetch(`${API_BASE_URL}/api/bookings/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => null);
        throw new Error(errData?.detail || 'Failed to submit booking. Please check your information.');
      }

      setIsSubmitted(true);
    } catch (err) {
      setErrorMessage(err.message || 'Unable to connect to the backend server.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-brand-black text-white font-sans flex flex-col justify-between">
      {/* Header */}
      <header className="border-b border-neutral-800 py-6 px-6 sm:px-12 bg-neutral-950">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 group">
            <span className="font-bold text-xl tracking-tight">
              CSA <span className="text-brand-orange">Chimney</span>
            </span>
          </Link>
          <Link 
            to="/" 
            className="flex items-center gap-2 text-sm text-neutral-400 hover:text-brand-orange transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Return to Home
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto w-full px-6 py-12 flex-grow">
        {!isSubmitted ? (
          <div>
            {/* Step Bar */}
            <div className="flex items-center justify-between max-w-2xl mx-auto mb-12">
              {[
                { num: 1, label: 'Select Service' },
                { num: 2, label: 'Date & Time' },
                { num: 3, label: 'Your Info' }
              ].map((s) => (
                <div key={s.num} className="flex items-center gap-3">
                  <div 
                    className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm ${
                      step >= s.num ? 'bg-brand-orange text-black' : 'bg-neutral-800 text-neutral-400'
                    }`}
                  >
                    {s.num}
                  </div>
                  <span className={`text-sm font-semibold hidden sm:inline ${step >= s.num ? 'text-white' : 'text-neutral-500'}`}>
                    {s.label}
                  </span>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
              {/* Form Container */}
              <div className="lg:col-span-2 space-y-8">
                {step === 1 && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                    <h2 className="text-2xl font-bold text-white">Choose Inspection Service</h2>
                    <div className="space-y-4">
                      {services.length === 0 ? (
                        <div className="p-6 rounded-2xl border border-dashed border-neutral-700 bg-neutral-950 text-neutral-400">
                          No services are available yet. Add one from the admin dashboard.
                        </div>
                      ) : services.map((srv) => (
                        <div
                          key={srv.id}
                          onClick={() => setSelectedService(srv)}
                          className={`p-6 rounded-2xl border-2 cursor-pointer transition-all flex justify-between items-center ${
                            selectedService && selectedService.id === srv.id
                              ? 'border-brand-orange bg-neutral-900/90'
                              : 'border-neutral-800 bg-neutral-950 hover:border-neutral-700'
                          }`}
                        >
                          <div>
                            <h3 className="font-bold text-lg text-white">{srv.title}</h3>
                            <p className="text-sm text-neutral-400 mt-1">{srv.description || srv.desc || 'Service description available soon.'}</p>
                          </div>
                          <div className="text-right flex-shrink-0 ml-4">
                            <span className="text-2xl font-extrabold text-white">${srv.price}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                    <button
                      onClick={() => setStep(2)}
                      disabled={!selectedService}
                      className="w-full mt-6 bg-brand-orange text-black font-bold py-4 rounded-xl hover:bg-orange-600 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Next: Choose Date & Time <ChevronRight className="w-5 h-5" />
                    </button>
                  </motion.div>
                )}

                {step === 2 && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                    <h2 className="text-2xl font-bold text-white">Select Date & Preferred Time</h2>
                    <div>
                      <label className="block text-sm font-semibold mb-2 text-neutral-300">Select Date</label>
                      <input
                        type="date"
                        value={selectedDate}
                        min={new Date().toISOString().split('T')[0]}
                        onChange={(e) => {
                          setSelectedDate(e.target.value);
                          setErrorMessage('');
                        }}
                        className="w-full bg-neutral-900 border border-neutral-800 rounded-xl p-4 text-white focus:outline-none focus:border-brand-orange"
                      />
                    </div>
                    {selectedDate && <div>
                      <label className="block text-sm font-semibold mb-2 text-neutral-300">Available Slots</label>
                      {loadingSlots ? (
                        <div className="flex items-center gap-2 text-sm text-neutral-400 py-4">
                          <Loader2 className="w-4 h-4 animate-spin text-brand-orange" /> Loading available times...
                        </div>
                      ) : (
                        <>
                          <div className="grid grid-cols-2 gap-3">
                            {timeSlots.map((slot) => (
                              <button
                                key={slot}
                                type="button"
                                onClick={() => setSelectedTime(slot)}
                                className={`p-4 rounded-xl border text-sm font-semibold transition-all ${
                                  selectedTime === slot
                                    ? 'bg-brand-orange text-black border-brand-orange'
                                    : 'bg-neutral-900 text-neutral-300 border-neutral-800 hover:border-neutral-700'
                                }`}
                              >
                                {slot}
                              </button>
                            ))}
                          </div>
                          {!loadingSlots && timeSlots.length === 0 && (
                            <p className="text-sm text-amber-300 bg-amber-500/10 border border-amber-500/20 rounded-xl p-4">
                              No times are available on this date. Please choose another date.
                            </p>
                          )}
                        </>
                      )}
                        {slotError && (
                          <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl p-4 mt-3">
                            {slotError}
                          </p>
                        )}
                    </div>}
                    <div className="flex gap-4 pt-4">
                      <button
                        type="button"
                        onClick={() => setStep(1)}
                        className="w-1/3 bg-neutral-800 text-neutral-300 font-bold py-4 rounded-xl hover:bg-neutral-700 transition-colors"
                      >
                        Back
                      </button>
                      <button
                        type="button"
                        disabled={!selectedDate || !selectedTime || timeSlots.length === 0}
                        onClick={continueToContactDetails}
                        className="w-2/3 bg-brand-orange disabled:opacity-50 text-black font-bold py-4 rounded-xl hover:bg-orange-600 transition-colors flex items-center justify-center gap-2"
                      >
                        Next: Contact Info <ChevronRight className="w-5 h-5" />
                      </button>
                    </div>
                  </motion.div>
                )}

                {step === 3 && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                    <h2 className="text-2xl font-bold text-white">Contact & Property Details</h2>

                    {errorMessage && (
                      <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl text-sm flex items-center gap-3">
                        <AlertCircle className="w-5 h-5 flex-shrink-0" />
                        <span>{errorMessage}</span>
                      </div>
                    )}

                    <form onSubmit={handleBookingSubmit} className="space-y-4">
                      <div>
                        <label className="block text-xs font-bold uppercase text-neutral-400 mb-1">Full Name</label>
                        <input
                          type="text"
                          name="fullName"
                          required
                          value={formData.fullName}
                          onChange={handleInputChange}
                          placeholder="John Doe"
                          className="w-full bg-neutral-900 border border-neutral-800 rounded-xl p-3.5 text-white focus:border-brand-orange outline-none"
                        />
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-bold uppercase text-neutral-400 mb-1">Email Address</label>
                          <input
                            type="email"
                            name="email"
                            required
                            value={formData.email}
                            onChange={handleInputChange}
                            placeholder="john@example.com"
                            className="w-full bg-neutral-900 border border-neutral-800 rounded-xl p-3.5 text-white focus:border-brand-orange outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold uppercase text-neutral-400 mb-1">Phone Number</label>
                          <input
                            type="tel"
                            name="phone"
                            required
                            value={formData.phone}
                            onChange={handleInputChange}
                            placeholder="(506) 555-0199"
                            className="w-full bg-neutral-900 border border-neutral-800 rounded-xl p-3.5 text-white focus:border-brand-orange outline-none"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-bold uppercase text-neutral-400 mb-1">Property Address</label>
                        <input
                          type="text"
                          name="address"
                          required
                          value={formData.address}
                          onChange={handleInputChange}
                          placeholder="123 Main St, Fredericton, NB"
                          className="w-full bg-neutral-900 border border-neutral-800 rounded-xl p-3.5 text-white focus:border-brand-orange outline-none"
                        />
                      </div>
                      <div className="flex gap-4 pt-4">
                        <button
                          type="button"
                          disabled={isSubmitting}
                          onClick={() => setStep(2)}
                          className="w-1/3 bg-neutral-800 text-neutral-300 font-bold py-4 rounded-xl hover:bg-neutral-700 transition-colors disabled:opacity-50"
                        >
                          Back
                        </button>
                        <button
                          type="submit"
                          disabled={isSubmitting}
                          className="w-2/3 bg-brand-orange text-black font-bold py-4 rounded-xl hover:bg-orange-600 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                          {isSubmitting ? (
                            <>
                              <Loader2 className="w-5 h-5 animate-spin" />
                              Scheduling...
                            </>
                          ) : (
                            'Confirm & Schedule Inspection'
                          )}
                        </button>
                      </div>
                    </form>
                  </motion.div>
                )}
              </div>

              {/* Order Summary Sidebar */}
              <div className="bg-neutral-950 border border-neutral-800 p-6 rounded-2xl h-fit space-y-6">
                <h3 className="font-bold text-lg text-white border-b border-neutral-800 pb-3">Booking Summary</h3>
                <div className="space-y-4 text-sm">
                  <div>
                    <span className="text-neutral-400 block text-xs">Selected Service</span>
                    <span className="font-bold text-white text-base">
                      {selectedService?.title || 'No service selected'}
                    </span>
                  </div>
                  {selectedDate && (
                    <div>
                      <span className="text-neutral-400 block text-xs">Date & Time</span>
                      <span className="font-semibold text-brand-orange">{selectedDate} at {selectedTime}</span>
                    </div>
                  )}
                  <div className="border-t border-neutral-800 pt-4 flex justify-between items-center">
                    <span className="text-neutral-400">Total Price</span>
                    <span className="text-2xl font-black text-white">
                      ${selectedService?.price ?? '0'}
                    </span>
                  </div>
                </div>
                <div className="bg-neutral-900 p-4 rounded-xl text-xs text-neutral-400 flex items-start gap-2">
                  <ShieldCheck className="w-5 h-5 text-brand-orange flex-shrink-0" />
                  <span>WETT Certified Inspections backed by complete safety documentation.</span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Confirmation State */
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-16 space-y-6 max-w-lg mx-auto">
            <div className="w-20 h-20 bg-brand-orange/20 text-brand-orange rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-12 h-12" />
            </div>
            <h2 className="text-3xl font-extrabold text-white">Inspection Scheduled!</h2>
            <p className="text-neutral-400">
              Thank you <span className="text-white font-semibold">{formData.fullName}</span>. We've received your request for the <span className="text-brand-orange font-semibold">{selectedService?.title || 'Service'}</span> on {selectedDate} at {selectedTime}.
            </p>
            <Link
              to="/"
              className="inline-block bg-brand-orange text-black font-bold px-8 py-3.5 rounded-xl hover:bg-orange-600 transition-colors"
            >
              Return to Homepage
            </Link>
          </motion.div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-neutral-800 py-6 text-center text-xs text-neutral-500">
        © 2026 CSA Chimney Service. All rights reserved.
      </footer>
    </div>
  );
}