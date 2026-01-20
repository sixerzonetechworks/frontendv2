/**
 * Admin API Utility
 * Functions for admin authentication and management
 */

// Base URL for API requests
// Uses environment variable in production, falls back to localhost in development
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

// Admin authentication token storage
const getAdminToken = () => localStorage.getItem('adminToken');
const setAdminToken = (token) => localStorage.setItem('adminToken', token);
const removeAdminToken = () => localStorage.removeItem('adminToken');

const getAuthHeaders = () => ({
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${getAdminToken()}`
});

/**
 * Admin Login
 */
export const adminLogin = async (username, password) => {
  const response = await fetch(`${API_BASE_URL}/admin/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password })
  });

  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.message || 'Login failed');
  }

  if (data.success && data.data.token) {
    setAdminToken(data.data.token);
  }

  return data;
};

/**
 * Admin Logout
 */
export const adminLogout = () => {
  removeAdminToken();
};

/**
 * Check if admin is logged in
 */
export const isAdminLoggedIn = () => {
  return !!getAdminToken();
};

/**
 * Get All Bookings
 */
export const getAllBookings = async (filters = {}) => {
  const params = new URLSearchParams(filters);
  const response = await fetch(`${API_BASE_URL}/admin/bookings?${params}`, {
    headers: getAuthHeaders()
  });

  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.message || 'Failed to fetch bookings');
  }

  return data;
};

/**
 * Search Booking by Phone/Email
 */
export const searchBooking = async (query) => {
  const response = await fetch(`${API_BASE_URL}/admin/bookings/search?query=${encodeURIComponent(query)}`, {
    headers: getAuthHeaders()
  });

  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.message || 'Search failed');
  }

  return data;
};

/**
 * Get Statistics
 */
export const getStatistics = async (period = 'lifetime') => {
  const response = await fetch(`${API_BASE_URL}/admin/statistics?period=${period}`, {
    headers: getAuthHeaders()
  });

  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.message || 'Failed to fetch statistics');
  }

  return data;
};

/**
 * Create Offline Booking (Admin only)
 */
export const createOfflineBooking = async (bookingData) => {
  const response = await fetch(`${API_BASE_URL}/admin/offline-booking`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(bookingData)
  });

  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.message || 'Failed to create offline booking');
  }

  return data;
};

/**
 * Block Time Slot
 */
export const blockTimeSlot = async (blockData) => {
  const response = await fetch(`${API_BASE_URL}/admin/blocked-slots`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(blockData)
  });

  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.message || 'Failed to block slot');
  }

  return data;
};

/**
 * Unblock Time Slot
 */
export const unblockTimeSlot = async (slotId) => {
  const response = await fetch(`${API_BASE_URL}/admin/blocked-slots/${slotId}`, {
    method: 'DELETE',
    headers: getAuthHeaders()
  });

  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.message || 'Failed to unblock slot');
  }

  return data;
};

/**
 * Get Blocked Slots
 */
export const getBlockedSlots = async (filters = {}) => {
  const params = new URLSearchParams(filters);
  const response = await fetch(`${API_BASE_URL}/admin/blocked-slots?${params}`, {
    headers: getAuthHeaders()
  });

  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.message || 'Failed to fetch blocked slots');
  }

  return data;
};
