/**
 * BookingForm Component
 * 
 * This component displays a form for users to enter their details and complete the booking.
 * It integrates with Razorpay payment gateway for payment processing.
 * 
 * Props:
 * @param {string} selectedDate - The date selected by user (YYYY-MM-DD format)
 * @param {Object} selectedSlot - The time slot selected by user {slot, hour}
 * @param {Object} selectedGround - The ground selected by user {id, name}
 * @param {Function} onBookingComplete - Callback when booking is successfully completed
 * @param {Function} onBack - Callback to go back to ground selection
 */

import { useState } from 'react';
import { createPaymentOrder, verifyPayment, handlePaymentFailure, cancelBooking } from '../utils/api';
import { formatDate, getDayName, isValidEmail, isValidPhone, formatTimeRange } from '../utils/helpers';
import './BookingForm.css';

function BookingForm({ selectedDate, selectedSlot, selectedGround, onBookingComplete, onBack }) {
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: ''
  });

  // UI states
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [validationErrors, setValidationErrors] = useState({});
  const [paymentStep, setPaymentStep] = useState('form'); // 'form', 'processing', 'verifying'

  // Store backend-calculated totalAmount for summary display
  const [backendTotalAmount, setBackendTotalAmount] = useState(null);

  /**
   * Handle input changes
   * @param {Event} e - Input change event
   */
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear validation error for this field
    if (validationErrors[name]) {
      setValidationErrors(prev => ({
        ...prev,
        [name]: null
      }));
    }
  };

  /**
   * Validate form data
   * @returns {boolean} True if form is valid
   */
  const validateForm = () => {
    const errors = {};

    // Validate name
    if (!formData.name.trim()) {
      errors.name = 'Name is required';
    } else if (formData.name.trim().length < 2) {
      errors.name = 'Name must be at least 2 characters';
    }

    // Validate phone
    if (!formData.phone.trim()) {
      errors.phone = 'Phone number is required';
    } else if (!isValidPhone(formData.phone.trim())) {
      errors.phone = 'Phone number must be 10 digits';
    }

    // Validate email
    if (!formData.email.trim()) {
      errors.email = 'Email is required';
    } else if (!isValidEmail(formData.email.trim())) {
      errors.email = 'Please enter a valid email address';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  /**
   * Initialize Razorpay payment
   */
  const initializePayment = (orderData) => {
    const options = {
      key: orderData.razorpayKeyId,
      amount: orderData.order.amount,
      currency: orderData.order.currency,
      name: 'SixerZone Turf Booking',
      description: `${orderData.booking.groundName} - ${selectedSlot.slot}`,
      order_id: orderData.order.id,
      prefill: {
        name: formData.name.trim(),
        email: formData.email.trim(),
        contact: formData.phone.trim()
      },
      theme: {
        color: '#4CAF50'
      },
      handler: async function (response) {
        // Payment successful - verify on backend
        setPaymentStep('verifying');
        try {
          const verificationData = {
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
            bookingId: orderData.booking.id
          };

          const verifyResult = await verifyPayment(verificationData);

          if (verifyResult.success) {
            // Payment verified successfully
            onBookingComplete(verifyResult.booking);
          } else {
            setError('Payment verification failed. Please contact support.');
            setLoading(false);
            setPaymentStep('form');
          }
        } catch (err) {
          setError(err.message || 'Payment verification failed. Please contact support.');
          console.error('Verification error:', err);
          setLoading(false);
          setPaymentStep('form');
        }
      },
      modal: {
        ondismiss: async function() {
          // User closed the payment modal
          setPaymentStep('form');
          setLoading(false);
          
          // Record payment failure/cancellation
          try {
            await handlePaymentFailure({
              bookingId: orderData.booking.id,
              error: {
                description: 'Payment cancelled by user'
              }
            });
            
            // Optionally cancel the booking
            await cancelBooking(orderData.booking.id);
            
            setError('Payment was cancelled. The slot is still available for booking.');
          } catch (err) {
            console.error('Error handling payment cancellation:', err);
          }
        },
        escape: false,
        backdropclose: false
      },
      retry: {
        enabled: true,
        max_count: 3
      },
      timeout: 600, // 10 minutes
    };

    const razorpayInstance = new window.Razorpay(options);
    
    razorpayInstance.on('payment.failed', async function (response) {
      // Payment failed
      setPaymentStep('form');
      setLoading(false);
      
      const failureReason = response.error.description || response.error.reason || 'Payment failed';
      setError(`Payment failed: ${failureReason}`);
      
      // Record payment failure
      try {
        await handlePaymentFailure({
          bookingId: orderData.booking.id,
          error: response.error
        });
      } catch (err) {
        console.error('Error recording payment failure:', err);
      }
    });

    razorpayInstance.open();
  };

  /**
   * Handle form submission
   * @param {Event} e - Form submit event
   */
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate form
    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setPaymentStep('processing');

      // Prepare booking data
      const bookingData = {
        name: formData.name.trim(),
        phone: formData.phone.trim(),
        email: formData.email.trim(),
        groundId: selectedGround.id,
        date: selectedDate,
        startHour: selectedSlot.hour,
        startHours: selectedSlot.hours || [selectedSlot.hour] // Send multiple hours if selected
      };

      // Create payment order
      const orderData = await createPaymentOrder(bookingData);

      if (!orderData.success) {
        throw new Error('Failed to create payment order');
      }

      // Set backend-calculated totalAmount (in INR)
      if (orderData.booking && typeof orderData.booking.totalAmount !== 'undefined') {
        setBackendTotalAmount(orderData.booking.totalAmount);
        console.log('Set backendTotalAmount to:', orderData.booking.totalAmount);
      }

      // Initialize Razorpay payment
      initializePayment(orderData);

    } catch (err) {
      // Extract user-friendly error message
      let errorMessage = 'Failed to initiate payment. Please try again.';
      if (err.message) {
        try {
          const errorData = JSON.parse(err.message);
          errorMessage = errorData.details || errorData.error || err.message;
        } catch {
          errorMessage = err.message;
        }
      }
      setError(errorMessage);
      console.error(err);
      setLoading(false);
      setPaymentStep('form');
    }
  };

  return (
    <div className="booking-form">
      {/* Header with booking summary */}
      <div className="form-header">
        <button className="btn btn-back" onClick={onBack} disabled={loading}>
          ← Back
        </button>
        <div className="booking-summary">
          <h2>Complete Your Booking</h2>
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
            <div className="summary-item price-highlight">
              <span className="summary-label">Total Amount:</span>
              <span className="summary-value price-amount">₹{backendTotalAmount !== null ? backendTotalAmount : selectedGround.price}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Payment step indicator */}
      {paymentStep !== 'form' && (
        <div className="payment-status">
          {paymentStep === 'processing' && (
            <div className="status-message processing">
              <div className="spinner"></div>
              <p>Initiating payment gateway...</p>
            </div>
          )}
          {paymentStep === 'verifying' && (
            <div className="status-message verifying">
              <div className="spinner"></div>
              <p>Verifying payment... Please wait.</p>
            </div>
          )}
        </div>
      )}

      {/* Error message */}
      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      {/* Booking form */}
      <form onSubmit={handleSubmit} className="form-container">
        <h3>Enter Your Details</h3>

        {/* Name field */}
        <div className="form-group">
          <label htmlFor="name">
            Full Name <span className="required">*</span>
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            placeholder="Enter your full name"
            disabled={loading}
            className={validationErrors.name ? 'error' : ''}
          />
          {validationErrors.name && (
            <span className="field-error">{validationErrors.name}</span>
          )}
        </div>

        {/* Phone field */}
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
            className={validationErrors.phone ? 'error' : ''}
          />
          {validationErrors.phone && (
            <span className="field-error">{validationErrors.phone}</span>
          )}
        </div>

        {/* Email field */}
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
            placeholder="your.email@example.com"
            disabled={loading}
            className={validationErrors.email ? 'error' : ''}
          />
          {validationErrors.email && (
            <span className="field-error">{validationErrors.email}</span>
          )}
        </div>

        {/* Submit button */}
        <button
          type="submit"
          className="btn btn-primary btn-submit"
          disabled={loading}
        >
          {loading ? 'Processing...' : 'Proceed to Payment'}
        </button>

        <p className="form-note">
          * You will be redirected to secure Razorpay payment gateway
        </p>
        
        <div className="payment-security-badges">
          <p className="security-text">🔒 Secure Payment via Razorpay</p>
          <p className="payment-methods-text">Accepts UPI, Cards, Net Banking & more</p>
        </div>
      </form>
    </div>
  );
}

export default BookingForm;
