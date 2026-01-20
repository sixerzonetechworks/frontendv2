/**
 * Offline Booking Flow Component (For Admin)
 * 
 * Uses the EXACT same flow and APIs as customer booking:
 * 1. Date Selection - getAvailableDates
 * 2. Time Slot Selection - getAvailableSlots
 * 3. Ground Selection - getAvailableGrounds
 * 4. Customer Details - Direct booking without payment
 */

import { useState } from 'react';
import DateSelection from './DateSelection';
import TimeSlotSelection from './TimeSlotSelection';
import GroundSelection from './GroundSelection';
import { createOfflineBooking } from '../utils/adminApi';
import { formatDate, getDayName, formatTimeRange } from '../utils/helpers';
import './BookingForm.css';

function OfflineBookingFlow({ onBookingComplete, onCancel }) {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [selectedGround, setSelectedGround] = useState(null);
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    totalAmount: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

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

  const handleBackToGrounds = () => {
    setCurrentStep(3);
    setError(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const bookingData = {
        name: formData.name.trim(),
        phone: formData.phone.trim(),
        email: formData.email.trim(),
        groundId: selectedGround.id,
        date: selectedDate,
        startHour: selectedSlot.hour,
        duration: selectedSlot.hours ? selectedSlot.hours.length : 1,
        totalAmount: parseFloat(formData.totalAmount) || 0
      };

      const result = await createOfflineBooking(bookingData);
      
      if (result.success) {
        onBookingComplete(result.booking);
      }
    } catch (err) {
      setError(err.message || 'Failed to create offline booking');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="offline-booking-flow">
      {/* Progress Indicator */}
      <div className="progress-bar" style={{ marginBottom: '30px' }}>
        <div className={`progress-step ${currentStep >= 1 ? 'active' : ''} ${currentStep > 1 ? 'completed' : ''}`}>
          <div className="step-number">1</div>
          <div className="step-label">Select Date</div>
        </div>
        <div className={`progress-step ${currentStep >= 2 ? 'active' : ''} ${currentStep > 2 ? 'completed' : ''}`}>
          <div className="step-number">2</div>
          <div className="step-label">Select Time</div>
        </div>
        <div className={`progress-step ${currentStep >= 3 ? 'active' : ''} ${currentStep > 3 ? 'completed' : ''}`}>
          <div className="step-number">3</div>
          <div className="step-label">Select Ground</div>
        </div>
        <div className={`progress-step ${currentStep >= 4 ? 'active' : ''}`}>
          <div className="step-number">4</div>
          <div className="step-label">Customer Details</div>
        </div>
      </div>

      {/* Step 1: Date Selection */}
      {currentStep === 1 && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h2 style={{ color: 'var(--white)', margin: 0 }}>Select Date</h2>
            <button onClick={onCancel} className="btn btn-back">Cancel</button>
          </div>
          <DateSelection onDateSelect={handleDateSelect} />
        </div>
      )}

      {/* Step 2: Time Slot Selection */}
      {currentStep === 2 && (
        <TimeSlotSelection
          selectedDate={selectedDate}
          onSlotSelect={handleSlotSelect}
          onBack={() => setCurrentStep(1)}
        />
      )}

      {/* Step 3: Ground Selection */}
      {currentStep === 3 && (
        <GroundSelection
          selectedDate={selectedDate}
          selectedSlot={selectedSlot}
          onGroundSelect={handleGroundSelect}
          onBack={() => setCurrentStep(2)}
        />
      )}

      {/* Step 4: Customer Details Form */}
      {currentStep === 4 && (
        <div className="booking-form">
          <div className="form-header">
            <button className="btn btn-back" onClick={handleBackToGrounds} disabled={loading}>
              ← Back
            </button>
            <div className="booking-summary">
              <h2>Offline Booking - Customer Details</h2>
              <div className="summary-details">
                <div className="summary-item">
                  <span className="summary-label">Date:</span>
                  <span className="summary-value">
                    {formatDate(selectedDate)} ({getDayName(selectedDate)})
                  </span>
                </div>
                <div className="summary-item">
                  <span className="summary-label">Time:</span>
                  <span className="summary-value">
                    {selectedSlot.hours && selectedSlot.hours.length > 1 
                      ? formatTimeRange(selectedSlot.hours)
                      : selectedSlot.slot
                    }
                  </span>
                </div>
                <div className="summary-item">
                  <span className="summary-label">Ground:</span>
                  <span className="summary-value">{selectedGround.name}</span>
                </div>
                <div className="summary-item">
                  <span className="summary-label">Duration:</span>
                  <span className="summary-value">
                    {selectedSlot.hours ? selectedSlot.hours.length : 1} Hour{selectedSlot.hours && selectedSlot.hours.length > 1 ? 's' : ''}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {error && (
            <div className="error-message" style={{ margin: '20px 0', padding: '15px', background: 'rgba(244, 67, 54, 0.1)', border: '1px solid rgba(244, 67, 54, 0.3)', borderRadius: '10px', color: '#f44336' }}>
              {error}
            </div>
          )}

          <form className="form-fields" onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="name">
                Customer Name <span className="required">*</span>
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Enter customer full name"
                disabled={loading}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="phone">
                Phone Number <span className="required">*</span>
              </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                placeholder="10-digit phone number"
                disabled={loading}
                pattern="[0-9]{10,15}"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="email">
                Email Address <span className="required">*</span>
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="customer@example.com"
                disabled={loading}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="totalAmount">
                Amount Collected (₹)
              </label>
              <input
                type="number"
                id="totalAmount"
                name="totalAmount"
                value={formData.totalAmount}
                onChange={handleInputChange}
                placeholder="Enter amount (optional)"
                disabled={loading}
                min="0"
                step="0.01"
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-submit"
              disabled={loading}
              style={{ marginTop: '10px' }}
            >
              {loading ? 'Creating Booking...' : '✅ Confirm Offline Booking'}
            </button>

            <p className="form-note">
              * This booking will be marked as PAID and OFFLINE
            </p>
          </form>
        </div>
      )}
    </div>
  );
}

export default OfflineBookingFlow;
