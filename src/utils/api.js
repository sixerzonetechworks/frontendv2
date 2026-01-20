/**
 * Update pricing for a ground (admin)
 * @route PUT /api/grounds/:id/pricing
 * @param {number} groundId - Ground ID
 * @param {Object} pricing - Pricing JSON object
 * @returns {Promise<Object>} Updated ground
 */
export const updateGroundPricing = async (groundId, pricing) => {
  try {
    const response = await fetch(`${API_BASE_URL}/grounds/${groundId}/pricing`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ pricing }),
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error updating ground pricing:', error);
    throw error;
  }
};
/**
 * ============================================================================
 * API SERVICE MODULE
 * ============================================================================
 * 
 * This module handles all HTTP requests to the backend API.
 * 
 * Features:
 * - Ground availability checking (dates, slots, grounds)
 * - Razorpay payment integration (order creation, verification)
 * - Error handling with descriptive messages
 * 
 * API Routes:
 * - Grounds: /api/grounds/*
 * - Payments: /api/payments/*
 * - Bookings: /api/bookings/* (legacy)
 * 
 * Configuration:
 * - Local Development: http://localhost:3000/api
 * - Production: Update API_BASE_URL environment variable
 * 
 * ============================================================================
 */

// Base URL for API requests
// Uses environment variable in production, falls back to localhost in development
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

/**
 * Fetch available dates for the next 45 days
 * 
 * @route GET /api/grounds/get-available-dates
 * @returns {Promise<Object>} Object with months as keys and array of date objects as values
 * @example
 * {
 *   "2026-01": [
 *     {"date": "2026-01-15", "enabled": true},
 *     {"date": "2026-01-16", "enabled": false}
 *   ]
 * }
 */
export const getAvailableDates = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/grounds/get-available-dates`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching available dates:', error);
    throw error;
  }
};

/**
 * Fetch available time slots for a specific date
 * 
 * @route GET /api/grounds/get-available-slots?date=YYYY-MM-DD
 * @param {string} date - Date in YYYY-MM-DD format
 * @returns {Promise<Array>} Array of slot objects
 * @example
 * [
 *   {"slot": "12:00 AM to 1:00 AM", "enabled": true},
 *   {"slot": "1:00 AM to 2:00 AM", "enabled": false}
 * ]
 */
export const getAvailableSlots = async (date) => {
  try {
    const response = await fetch(`${API_BASE_URL}/grounds/get-available-slots?date=${date}`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching available slots:', error);
    throw error;
  }
};

/**
 * Fetch available grounds for a specific date and time
 * 
 * @route GET /api/grounds/get-available-grounds?date=YYYY-MM-DD&startHour=0-23
 * @route GET /api/grounds/get-available-grounds?date=YYYY-MM-DD&startHours=0,1,2
 * @param {string} date - Date in YYYY-MM-DD format
 * @param {number|Array} startHour - Hour (0-23) or array of hours
 * @returns {Promise<Array>} Array of ground objects
 * @example
 * [
 *   {"id": 1, "name": "G1", "location": "Downtown", "available": true, "price": 1500},
 *   {"id": 2, "name": "G2", "location": "North Zone", "available": false, "price": 2000}
 * ]
 */
export const getAvailableGrounds = async (date, startHour) => {
  try {
    let url;
    if (Array.isArray(startHour)) {
      // Multiple hours - send as comma-separated string
      url = `${API_BASE_URL}/grounds/get-available-grounds?date=${date}&startHours=${startHour.join(',')}`;
    } else {
      // Single hour
      url = `${API_BASE_URL}/grounds/get-available-grounds?date=${date}&startHour=${startHour}`;
    }
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching available grounds:', error);
    throw error;
  }
};

/**
 * Fetch all grounds (for admin panel)
 * 
 * @route GET /api/grounds/get-available-grounds?date=2026-01-15&startHour=12
 * @returns {Promise<Array>} Array of all ground objects
 * @example
 * [
 *   {"id": 1, "name": "G1", "location": "Downtown"},
 *   {"id": 2, "name": "G2", "location": "North Zone"}
 * ]
 */
export const getGrounds = async () => {
  try {
    // Use a future date and midday hour to get all grounds without availability filtering
    const futureDate = '2026-01-15'; // Far future date
    const middayHour = 12; // Midday hour when most slots are available
    
    const response = await fetch(`${API_BASE_URL}/grounds/get-available-grounds?date=${futureDate}&startHour=${middayHour}`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    // Return grounds with pricing for admin use
    return data.map(ground => ({
      id: ground.id,
      name: ground.name,
      description: ground.description || '',
      pricing: ground.pricing || {}
    }));
  } catch (error) {
    console.error('Error fetching grounds:', error);
    throw error;
  }
};

/**
 * Create a Razorpay order for booking
 * This is the main booking function. It creates a booking in 'pending' status
 * and generates a Razorpay order for payment processing.
 * 
 * @route POST /api/payments/create-order
 * @param {Object} bookingData - Booking information
 * @param {string} bookingData.name - Customer name
 * @param {string} bookingData.phone - Customer phone number (10-15 digits)
 * @param {string} bookingData.email - Customer email
 * @param {number} bookingData.groundId - Selected ground ID
 * @param {string} bookingData.date - Date in YYYY-MM-DD format
 * @param {number} bookingData.startHour - Start hour (0-23)
 * @returns {Promise<Object>} Order and booking information including Razorpay key
 */
export const createPaymentOrder = async (bookingData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/payments/create-order`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(bookingData),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error creating payment order:', error);
    throw error;
  }
};

/**
 * Verify payment after Razorpay payment completion
 * 
 * Verifies the payment signature using HMAC SHA256 and confirms
 * payment status with Razorpay API. Updates booking to 'paid' status.
 * 
 * @route POST /api/payments/verify
 * @param {Object} paymentData - Payment verification data from Razorpay
 * @param {string} paymentData.razorpay_order_id - Razorpay order ID
 * @param {string} paymentData.razorpay_payment_id - Razorpay payment ID
 * @param {string} paymentData.razorpay_signature - Payment signature
 * @param {number} paymentData.bookingId - Booking ID
 * @returns {Promise<Object>} Verification result with booking details
 */
export const verifyPayment = async (paymentData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/payments/verify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(paymentData),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error verifying payment:', error);
    throw error;
  }
};

/**
 * Handle payment failure
 * 
 * Records payment failure information including error details
 * and increments payment attempt counter. Updates booking to 'failed' status.
 * 
 * @route POST /api/payments/failure
 * @param {Object} failureData - Payment failure data
 * @param {number} failureData.bookingId - Booking ID
 * @param {Object} failureData.error - Error details from Razorpay
 * @returns {Promise<Object>} Failure acknowledgment
 */
export const handlePaymentFailure = async (failureData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/payments/failure`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(failureData),
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error handling payment failure:', error);
    throw error;
  }
};

/**
 * Cancel a pending or failed booking
 * 
 * Deletes a booking that hasn't been paid yet. Cannot cancel paid bookings.
 * Frees up the slot for other users.
 * 
 * @route DELETE /api/payments/cancel/:bookingId
 * @param {number} bookingId - Booking ID to cancel
 * @returns {Promise<Object>} Cancellation confirmation
 */
export const cancelBooking = async (bookingId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/payments/cancel/${bookingId}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error cancelling booking:', error);
    throw error;
  }
};

/**
 * Create a new booking without payment processing (LEGACY)
 * 
 * This function creates a booking with 'paid' status directly without
 * Razorpay payment integration. Kept for backward compatibility and testing.
 * 
 * @deprecated Use createPaymentOrder() instead for production
 * @route POST /api/bookings/book-slot
 * @param {Object} bookingData - Booking information
 * @param {string} bookingData.name - Customer name
 * @param {string} bookingData.phone - Customer phone
 * @param {string} bookingData.email - Customer email
 * @param {number} bookingData.groundId - Ground ID
 * @param {string} bookingData.date - Date in YYYY-MM-DD format
 * @param {number} bookingData.startHour - Start hour (0-23)
 * @returns {Promise<Object>} Booking confirmation object
 */
export const bookSlot = async (bookingData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/bookings/book-slot`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(bookingData),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error creating booking:', error);
    throw error;
  }
};
