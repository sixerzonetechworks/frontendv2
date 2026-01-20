/**
 * Customer Booking Component
 * 
 * This is the main booking flow for customers:
 * 1. Date Selection - User selects an available date
 * 2. Time Slot Selection - User selects an available time slot
 * 3. Ground Selection - User selects an available ground
 * 4. Booking Confirmation - User completes the booking
 */

import { useState } from 'react';
import DateSelection from './DateSelection';
import TimeSlotSelection from './TimeSlotSelection';
import GroundSelection from './GroundSelection';
import BookingForm from './BookingForm';
import { formatDate, formatTimeRange } from '../utils/helpers';

function CustomerBooking() {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [selectedGround, setSelectedGround] = useState(null);
  const [bookingConfirmation, setBookingConfirmation] = useState(null);

  const handleDateSelect = (date) => {
    setSelectedDate(date);
    setCurrentStep(2);
  };

  const handleSlotSelect = (slot, hour, hours) => {
    setSelectedSlot({ slot, hour, hours: hours || [hour] });
    setCurrentStep(3);
  };

  const handleGroundSelect = (ground) => {
    setSelectedGround(ground);
    setCurrentStep(4);
  };

  const handleBookingComplete = (confirmation) => {
    setBookingConfirmation(confirmation);
  };

  const handleStartOver = () => {
    setCurrentStep(1);
    setSelectedDate(null);
    setSelectedSlot(null);
    setSelectedGround(null);
    setBookingConfirmation(null);
  };

  return (
    <div className="app">
      {/* Header */}
      <header className="app-header">
        <div style={{ maxWidth: '1400px', margin: '0 auto', width: '100%' }}>
          <h1>🏏 SixerZone Turf</h1>
          <p>Book your turf in just a few simple steps</p>
        </div>
      </header>

      {/* Progress Indicator */}
      <div className="progress-bar">
        <div className={`progress-step ${currentStep >= 1 ? 'active' : ''}`}>
          <span>1. Select Date</span>
        </div>
        <div className={`progress-step ${currentStep >= 2 ? 'active' : ''}`}>
          <span>2. Select Time</span>
        </div>
        <div className={`progress-step ${currentStep >= 3 ? 'active' : ''}`}>
          <span>3. Select Ground</span>
        </div>
        <div className={`progress-step ${currentStep >= 4 ? 'active' : ''}`}>
          <span>4. Complete Booking</span>
        </div>
      </div>

      {/* Main Content */}
      <div className="app-content">
        {currentStep === 1 && (
          <DateSelection onDateSelect={handleDateSelect} />
        )}

        {currentStep === 2 && (
          <TimeSlotSelection 
            selectedDate={selectedDate} 
            onSlotSelect={handleSlotSelect}
            onBack={() => setCurrentStep(1)}
          />
        )}

        {currentStep === 3 && (
          <GroundSelection 
            selectedDate={selectedDate}
            selectedSlot={selectedSlot}
            onGroundSelect={handleGroundSelect}
            onBack={() => setCurrentStep(2)}
          />
        )}

        {currentStep === 4 && !bookingConfirmation && (
          <BookingForm 
            selectedDate={selectedDate}
            selectedSlot={selectedSlot}
            selectedGround={selectedGround}
            onBookingComplete={handleBookingComplete}
            onBack={() => setCurrentStep(3)}
          />
        )}

        {bookingConfirmation && (
          <div className="confirmation">
            <div className="confirmation-icon">✓</div>
            <h2>Booking Confirmed!</h2>
            <div className="confirmation-details">
              <p><strong>Booking ID:</strong> <span>{bookingConfirmation.id}</span></p>
              <p><strong>Name:</strong> <span>{bookingConfirmation.name}</span></p>
              <p><strong>Ground:</strong> <span>{bookingConfirmation.groundName}</span></p>
              <p><strong>Date:</strong> <span>{selectedDate ? formatDate(selectedDate) : new Date(bookingConfirmation.startTime).toLocaleDateString()}</span></p>
              <p><strong>Time Slots:</strong> <span>
                {selectedSlot.hours && selectedSlot.hours.length > 1 
                  ? formatTimeRange(selectedSlot.hours)
                  : selectedSlot.slot
                }
              </span></p>
              <p><strong>Duration:</strong> <span>{selectedSlot.hours ? selectedSlot.hours.length : 1} Hour{selectedSlot.hours && selectedSlot.hours.length > 1 ? 's' : ''}</span></p>
              <p><strong>Amount Paid:</strong> <span>₹{bookingConfirmation.totalAmount}</span></p>
              {bookingConfirmation.razorpayPaymentId && (
                <p><strong>Payment ID:</strong> <span style={{fontSize: '0.9em', wordBreak: 'break-all'}}>{bookingConfirmation.razorpayPaymentId}</span></p>
              )}
            </div>
            <button className="btn btn-primary" onClick={handleStartOver}>
              Book Another Slot
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default CustomerBooking;
