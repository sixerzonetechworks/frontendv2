/**
 * Admin Dashboard Component (Simplified)
 * 
 * Features:
 * - Current & future bookings view (default)
 * - Offline booking using same flow as customer booking
 * - Search & verify bookings
 * - All bookings history
 * - Customizable statistics
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  isAdminLoggedIn, 
  adminLogout, 
  getAllBookings, 
  searchBooking,
  getStatistics,
  updateBooking,
  deleteBooking
} from '../utils/adminApi';
import { getGrounds, updateGroundPricing } from '../utils/api';
import { FaPencilAlt, FaSave, FaTrash } from 'react-icons/fa';
import OfflineBookingFlow from './OfflineBookingFlow';
import BlockTimeSlot from './BlockTimeSlot';
import './AdminDashboard.css';

const IST_TIMEZONE = 'Asia/Kolkata';

function AdminDashboard() {
  // Grounds/pricing state
  const [grounds, setGrounds] = useState([]);
  const [pricingEdit, setPricingEdit] = useState({});
  const [pricingStatus, setPricingStatus] = useState({});
  const [editingRow, setEditingRow] = useState({});
    // Load all grounds for pricing management
    useEffect(() => {
      getGrounds().then(setGrounds).catch(() => setGrounds([]));
    }, []);

    // Handle pricing input change
    const handlePricingChange = (groundId, key, value) => {
      setPricingEdit(prev => ({
        ...prev,
        [groundId]: {
          ...prev[groundId],
          [key]: value
        }
      }));
    };

    // Start editing a row
    const handleEditRow = (ground) => {
      setEditingRow(prev => ({ ...prev, [ground.id]: true }));
      setPricingEdit(prev => ({
        ...prev,
        [ground.id]: {
          Weekday_first_half: ground.pricing?.Weekday_first_half ?? '',
          Weekday_second_half: ground.pricing?.Weekday_second_half ?? '',
          Weekend_first_half: ground.pricing?.Weekend_first_half ?? '',
          Weekend_second_half: ground.pricing?.Weekend_second_half ?? ''
        }
      }));
    };

    // Cancel editing a row
    const handleCancelEdit = (groundId) => {
      setEditingRow(prev => ({ ...prev, [groundId]: false }));
      setPricingEdit(prev => {
        const newEdit = { ...prev };
        delete newEdit[groundId];
        return newEdit;
      });
    };

    // Save pricing for a ground
    const handleSavePricing = async (ground) => {
      setPricingStatus(prev => ({ ...prev, [ground.id]: 'saving' }));
      try {
        const newPricing = pricingEdit[ground.id] || ground.pricing;
        // Convert all values to numbers
        const pricingObj = {};
        for (const k of Object.keys(newPricing)) {
          pricingObj[k] = Number(newPricing[k]);
        }
        await updateGroundPricing(ground.id, pricingObj);
        setPricingStatus(prev => ({ ...prev, [ground.id]: 'success' }));
        setEditingRow(prev => ({ ...prev, [ground.id]: false }));
        // Refresh grounds
        getGrounds().then(setGrounds);
        setTimeout(() => setPricingStatus(prev => ({ ...prev, [ground.id]: undefined })), 2000);
      } catch (e) {
        setPricingStatus(prev => ({ ...prev, [ground.id]: 'error' }));
      }
    };
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('current');
  const [bookings, setBookings] = useState([]);
  const [statistics, setStatistics] = useState(null);
  const [statsPeriod, setStatsPeriod] = useState('lifetime');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [offlineBookingSuccess, setOfflineBookingSuccess] = useState(null);
  const [expandedBookingId, setExpandedBookingId] = useState(null);
  const [editingBookingId, setEditingBookingId] = useState(null);
  const [bookingEditForm, setBookingEditForm] = useState(null);
  const [bookingActionLoading, setBookingActionLoading] = useState(false);
  const [bookingEditError, setBookingEditError] = useState('');
  const [deletingBookingId, setDeletingBookingId] = useState(null);

  useEffect(() => {
    if (!isAdminLoggedIn()) {
      navigate('/admin/login');
      return;
    }
    
    loadStatistics();
    loadCurrentBookings();
  }, [navigate]);

  useEffect(() => {
    loadStatistics();
  }, [statsPeriod]);

  const loadStatistics = async () => {
    try {
      const data = await getStatistics(statsPeriod);
      setStatistics(data.data);
    } catch (err) {
      console.error('Failed to load statistics:', err);
    }
  };

  const loadCurrentBookings = async () => {
    setLoading(true);
    setError('');

    try {
      const today = new Date().toISOString().split('T')[0];
      const data = await getAllBookings({ 
        limit: 100,
        fromDate: today
      });
      setBookings(data.data.bookings);
    } catch (err) {
      setError(err.message || 'Failed to load bookings');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setLoading(true);
    setError('');

    try {
      const data = await searchBooking(searchQuery);
      setBookings(data.data.bookings);
      if (data.data.bookings.length === 0) {
        setError('No bookings found matching your search');
      }
    } catch (err) {
      setError(err.message || 'Search failed');
      setBookings([]);
    } finally {
      setLoading(false);
    }
  };

  const loadAllBookings = async () => {
    setLoading(true);
    setError('');

    try {
      const data = await getAllBookings({ limit: 200 });
      setBookings(data.data.bookings);
    } catch (err) {
      setError(err.message || 'Failed to load bookings');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    adminLogout();
    navigate('/admin/login');
  };

  const handleOfflineBookingComplete = (booking) => {
    setOfflineBookingSuccess(booking);
    setTimeout(() => {
      setOfflineBookingSuccess(null);
      setActiveTab('current');
      loadCurrentBookings();
      loadStatistics();
    }, 3000);
  };

  const handleCancelOfflineBooking = () => {
    setActiveTab('current');
  };

  const toInputDate = (dateString) => {
    const date = new Date(dateString);
    const parts = new Intl.DateTimeFormat('en-CA', {
      timeZone: IST_TIMEZONE,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    }).formatToParts(date);

    const year = parts.find((part) => part.type === 'year')?.value;
    const month = parts.find((part) => part.type === 'month')?.value;
    const day = parts.find((part) => part.type === 'day')?.value;

    return `${year}-${month}-${day}`;
  };

  const toInputHour = (dateString) => {
    const date = new Date(dateString);
    const hour = new Intl.DateTimeFormat('en-US', {
      timeZone: IST_TIMEZONE,
      hour: '2-digit',
      hour12: false,
      hourCycle: 'h23'
    }).format(date);
    const parsedHour = Number(hour);
    return parsedHour === 24 ? 0 : parsedHour;
  };

  const getDurationFromBooking = (booking) => {
    const start = new Date(booking.startTime).getTime();
    const end = new Date(booking.endTime).getTime();
    const diffHours = Math.round((end - start) / (1000 * 60 * 60));
    return diffHours > 0 ? diffHours : 1;
  };

  const to12HourParts = (hour24) => {
    const safeHour = Number.isInteger(Number(hour24)) ? Number(hour24) : 0;
    const period = safeHour >= 12 ? 'PM' : 'AM';
    const hour12 = safeHour % 12 === 0 ? 12 : safeHour % 12;
    return { hour12, period };
  };

  const formatHourLabel = (hour24) => {
    const { hour12, period } = to12HourParts(hour24);
    return `${hour12}:00 ${period}`;
  };

  const startBookingEdit = (booking) => {
    setEditingBookingId(booking.id);
    setBookingEditForm({
      name: booking.name || '',
      phone: String(booking.phone || ''),
      email: booking.email || '',
      groundId: booking.groundId || booking.ground?.id || '',
      date: toInputDate(booking.startTime),
      startHour: toInputHour(booking.startTime),
      endHour: toInputHour(booking.endTime),
      duration: getDurationFromBooking(booking),
      totalAmount: Number(booking.totalAmount || 0),
      paymentStatus: booking.paymentStatus || 'pending',
      paymentMethod: booking.paymentMethod || '',
      bookingType: booking.bookingType || 'online'
    });
    setBookingEditError('');
    setError('');
  };

  const cancelBookingEdit = () => {
    setEditingBookingId(null);
    setBookingEditForm(null);
    setBookingEditError('');
  };

  const handleDeleteBooking = async (bookingId) => {
    if (!window.confirm('Delete this booking? The slot will become available for new bookings.')) return;

    setDeletingBookingId(bookingId);
    setError('');

    try {
      await deleteBooking(bookingId);
      setBookings((prev) => prev.filter((b) => b.id !== bookingId));
      loadStatistics();
    } catch (err) {
      setError(err.message || 'Failed to delete booking');
    } finally {
      setDeletingBookingId(null);
    }
  };

  const handleBookingEditFieldChange = (field, value) => {
    setBookingEditError('');
    setBookingEditForm((prev) => ({
      ...prev,
      [field]: value
    }));
  };

  const saveBookingEdit = async (bookingId) => {
    if (!bookingEditForm) return;

    setBookingActionLoading(true);
    setBookingEditError('');
    setError('');

    try {
      const parsedGroundId = Number(bookingEditForm.groundId);
      if (!Number.isInteger(parsedGroundId) || parsedGroundId <= 0) {
        throw new Error('Please select a valid ground before saving');
      }

      const payload = {
        ...bookingEditForm,
        groundId: parsedGroundId,
        startHour: Number(bookingEditForm.startHour),
        endHour: Number(bookingEditForm.endHour),
        totalAmount: Number(bookingEditForm.totalAmount)
      };

      const response = await updateBooking(bookingId, payload);

      setBookings((prev) =>
        prev.map((item) => (item.id === bookingId ? response.booking : item))
      );
      setEditingBookingId(null);
      setBookingEditForm(null);
      setBookingEditError('');
      loadStatistics();
    } catch (err) {
      const message = err.message || 'Failed to update booking';
      setBookingEditError(message);
      setError(message);
    } finally {
      setBookingActionLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      timeZone: IST_TIMEZONE,
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatTime = (timeString) => {
    if (!timeString) return 'N/A';
    const date = new Date(timeString);
    return date.toLocaleTimeString('en-US', {
      timeZone: IST_TIMEZONE,
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  return (
    <div className="admin-dashboard">
      <header className="admin-header">
        <div className="header-content">
          <div className="header-title">
            <h1>🏏 Admin Dashboard</h1>
            <span className="admin-badge">Sixerzone Turf</span>
          </div>
          <div className="header-actions">
            <button onClick={handleLogout} className="logout-btn">
              🔓 Logout
            </button>
          </div>
        </div>
      </header>

      <main className="admin-content">
        {/* Ground Pricing Management */}
        <div className="section-content" style={{ marginBottom: 32 }}>
          <h2 style={{ color: 'var(--white)', marginBottom: 16 }}>Manage Ground Pricing</h2>
          {grounds.length === 0 && <div>Loading grounds...</div>}
          {grounds.length > 0 && (
            <table className="bookings-table pricing-table">
              <thead>
                <tr>
                  <th>Ground</th>
                  <th>Weekday 6AM-6PM</th>
                  <th>Weekday 6PM-6AM</th>
                  <th>Weekend 6AM-6PM</th>
                  <th>Weekend 6PM-6AM</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {grounds.map(ground => {
                  const isEditing = !!editingRow[ground.id];
                  return (
                    <tr key={ground.id}>
                      <td>{ground.name}</td>
                      <td>
                        {isEditing ? (
                          <input type="number" min="0" value={pricingEdit[ground.id]?.Weekday_first_half ?? ''}
                            onChange={e => handlePricingChange(ground.id, 'Weekday_first_half', e.target.value)} />
                        ) : (
                          <span>₹{ground.pricing?.Weekday_first_half ?? '0'}</span>
                        )}
                      </td>
                      <td>
                        {isEditing ? (
                          <input type="number" min="0" value={pricingEdit[ground.id]?.Weekday_second_half ?? ''}
                            onChange={e => handlePricingChange(ground.id, 'Weekday_second_half', e.target.value)} />
                        ) : (
                          <span>₹{ground.pricing?.Weekday_second_half ?? '0'}</span>
                        )}
                      </td>
                      <td>
                        {isEditing ? (
                          <input type="number" min="0" value={pricingEdit[ground.id]?.Weekend_first_half ?? ''}
                            onChange={e => handlePricingChange(ground.id, 'Weekend_first_half', e.target.value)} />
                        ) : (
                          <span>₹{ground.pricing?.Weekend_first_half ?? '0'}</span>
                        )}
                      </td>
                      <td>
                        {isEditing ? (
                          <input type="number" min="0" value={pricingEdit[ground.id]?.Weekend_second_half ?? ''}
                            onChange={e => handlePricingChange(ground.id, 'Weekend_second_half', e.target.value)} />
                        ) : (
                          <span>₹{ground.pricing?.Weekend_second_half ?? '0'}</span>
                        )}
                      </td>
                      <td>
                        {isEditing ? (
                          <>
                            <button className="pricing-action-btn" onClick={() => handleSavePricing(ground)} disabled={pricingStatus[ground.id]==='saving'} title="Save">
                              <FaSave />
                            </button>
                            <button className="pricing-action-btn cancel" onClick={() => handleCancelEdit(ground.id)} title="Cancel">✖</button>
                          </>
                        ) : (
                          <button className="pricing-action-btn" onClick={() => handleEditRow(ground)} title="Edit">
                            <FaPencilAlt />
                          </button>
                        )}
                        {pricingStatus[ground.id]==='success' && <span className="pricing-status success">✔</span>}
                        {pricingStatus[ground.id]==='error' && <span className="pricing-status error">✖</span>}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
        {/* Statistics with Period Selector */}
        <div className="stats-section">
          <div className="stats-header">
            <h2>Statistics</h2>
            <select 
              value={statsPeriod} 
              onChange={(e) => setStatsPeriod(e.target.value)}
              className="period-selector"
            >
              <option value="day">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="year">This Year</option>
              <option value="lifetime">Lifetime</option>
            </select>
          </div>
          
          {statistics && (
            <div className="stats-grid">
              <div className="stat-card">
                <h3>Total Bookings</h3>
                <div className="stat-value">{statistics.totalBookings || 0}</div>
              </div>
              <div className="stat-card">
                <h3>Today's Bookings</h3>
                <div className="stat-value">{statistics.todayBookings || 0}</div>
              </div>
              <div className="stat-card">
                <h3>Confirmed</h3>
                <div className="stat-value">{statistics.confirmedBookings || 0}</div>
              </div>
              <div className="stat-card">
                <h3>Total Revenue</h3>
                <div className="stat-value">₹{statistics.totalRevenue || 0}</div>
              </div>
            </div>
          )}
        </div>

        {/* Tabs */}
        <div className="admin-tabs">
          <button
            className={`tab-button ${activeTab === 'current' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('current');
              loadCurrentBookings();
            }}
          >
            📅 Current & Upcoming
          </button>
          <button
            className={`tab-button ${activeTab === 'offline' ? 'active' : ''}`}
            onClick={() => setActiveTab('offline')}
          >
            💵 Offline Booking
          </button>
          <button
            className={`tab-button ${activeTab === 'search' ? 'active' : ''}`}
            onClick={() => setActiveTab('search')}
          >
            🔍 Search & Verify
          </button>
          <button
            className={`tab-button ${activeTab === 'all' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('all');
              loadAllBookings();
            }}
          >
            📋 All Bookings
          </button>
          <button
            className={`tab-button ${activeTab === 'block' ? 'active' : ''}`}
            onClick={() => setActiveTab('block')}
          >
            🚫 Disable Date / Time
          </button>
        </div>

        {/* Offline Booking Success Message */}
        {offlineBookingSuccess && (
          <div className="success-banner" style={{ 
            background: 'linear-gradient(135deg, #00D9A3 0%, #00B386 100%)',
            color: 'white',
            padding: '20px',
            borderRadius: '15px',
            marginBottom: '20px',
            textAlign: 'center'
          }}>
            <h2>✅ Offline Booking Created Successfully!</h2>
            <p>Booking ID: #{offlineBookingSuccess.id} | Customer: {offlineBookingSuccess.name}</p>
          </div>
        )}

        {/* Current & Upcoming Bookings */}
        {activeTab === 'current' && (
          <div className="section-content">
            <h2 style={{ color: 'var(--white)', marginBottom: '20px' }}>Current & Upcoming Bookings</h2>
            {renderBookingsTable()}
          </div>
        )}

        {/* Offline Booking Flow */}
        {activeTab === 'offline' && (
          <div className="section-content">
            <OfflineBookingFlow 
              onBookingComplete={handleOfflineBookingComplete}
              onCancel={handleCancelOfflineBooking}
            />
          </div>
        )}

        {/* Search Section */}
        {activeTab === 'search' && (
          <div className="search-section">
            <h2 style={{ color: 'var(--white)', marginBottom: '20px' }}>
              Search & Verify Customer Booking
            </h2>
            <form className="search-bar" onSubmit={handleSearch}>
              <input
                type="text"
                placeholder="Search by phone number, email, or name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <button type="submit" className="search-btn" disabled={loading}>
                {loading ? 'Searching...' : 'Search'}
              </button>
            </form>
            {renderBookingsTable()}
          </div>
        )}

        {/* All Bookings Section */}
        {activeTab === 'all' && (
          <div className="section-content">
            <h2 style={{ color: 'var(--white)', marginBottom: '20px' }}>All Bookings</h2>
            {renderBookingsTable()}
          </div>
        )}

        {/* Disable Date/Time - Block slots so end users cannot book */}
        {activeTab === 'block' && (
          <div className="section-content">
            <BlockTimeSlot />
          </div>
        )}
      </main>
    </div>
  );

  // Helper function to render bookings table
  function renderBookingsTable() {
    return (
      <div className="bookings-container">
        {loading && <div className="loading">Loading bookings...</div>}
        {error && !loading && <div className="error">{error}</div>}
        
        {!loading && !error && bookings.length === 0 && (
          <div className="empty-state">No bookings found</div>
        )}

        {!loading && bookings.length > 0 && (
          <table className="bookings-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Customer</th>
                <th>Ground</th>
                <th>Date</th>
                <th>Time</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((booking) => {
                const isEditingBooking = editingBookingId === booking.id && bookingEditForm !== null;
                const isExpanded = expandedBookingId === booking.id;

                return (
                  <React.Fragment key={booking.id}>
                    <tr 
                      className={`booking-main-row ${isExpanded || isEditingBooking ? 'expanded' : ''}`}
                      onClick={(e) => {
                        if (e.target.tagName === 'BUTTON' || e.target.tagName === 'A' || e.target.closest('button')) return;
                        setExpandedBookingId(isExpanded ? null : booking.id);
                      }}
                      style={{ cursor: 'pointer' }}
                    >
                      <td>#{booking.id}</td>
                      <td>{booking.name}</td>
                      <td>{booking.ground?.name || 'N/A'}</td>
                      <td>{formatDate(booking.startTime)}</td>
                      <td>{formatTime(booking.startTime)} - {formatTime(booking.endTime)}</td>
                      <td>
                        <span className={`status-badge ${booking.paymentStatus}`}>
                          {booking.paymentStatus}
                        </span>
                      </td>
                      <td>
                        <div className="booking-actions">
                          <button
                            className="booking-action-btn"
                            onClick={(e) => {
                              e.stopPropagation();
                              startBookingEdit(booking);
                            }}
                            disabled={editingBookingId !== null && editingBookingId !== booking.id}
                          >
                            Edit
                          </button>
                          <button
                            className="booking-action-btn delete"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteBooking(booking.id);
                            }}
                            disabled={deletingBookingId === booking.id}
                            title="Delete booking"
                          >
                            {deletingBookingId === booking.id ? 'Deleting...' : 'Delete'}
                          </button>
                        </div>
                      </td>
                    </tr>

                    {(isExpanded || isEditingBooking) && (
                      <tr className="booking-details-row">
                        <td colSpan="7" style={{ padding: 0 }}>
                          {isEditingBooking ? (
                            <div className="booking-edit-container">
                              <h4 style={{marginBottom: '15px'}}>Edit Booking</h4>
                              <div className="edit-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '15px' }}>
                                <div className="edit-field">
                                  <label style={{display:'block', fontSize:'0.85em', color:'#aaa', marginBottom:'5px'}}>Name</label>
                                  <input className="booking-edit-input" style={{width:'100%'}} value={bookingEditForm.name} onChange={(e) => handleBookingEditFieldChange('name', e.target.value)} />
                                </div>
                                <div className="edit-field">
                                  <label style={{display:'block', fontSize:'0.85em', color:'#aaa', marginBottom:'5px'}}>Phone</label>
                                  <input className="booking-edit-input" style={{width:'100%'}} value={bookingEditForm.phone} onChange={(e) => handleBookingEditFieldChange('phone', e.target.value)} />
                                </div>
                                <div className="edit-field">
                                  <label style={{display:'block', fontSize:'0.85em', color:'#aaa', marginBottom:'5px'}}>Email</label>
                                  <input className="booking-edit-input" style={{width:'100%'}} type="email" value={bookingEditForm.email} onChange={(e) => handleBookingEditFieldChange('email', e.target.value)} />
                                </div>
                                <div className="edit-field">
                                  <label style={{display:'block', fontSize:'0.85em', color:'#aaa', marginBottom:'5px'}}>Ground</label>
                                  <select className="booking-edit-input" style={{width:'100%'}} value={bookingEditForm.groundId} onChange={(e) => handleBookingEditFieldChange('groundId', e.target.value)}>
                                    <option value="">Select Ground</option>
                                    {grounds.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
                                  </select>
                                </div>
                                <div className="edit-field">
                                  <label style={{display:'block', fontSize:'0.85em', color:'#aaa', marginBottom:'5px'}}>Date</label>
                                  <input className="booking-edit-input" style={{width:'100%'}} type="date" value={bookingEditForm.date} onChange={(e) => handleBookingEditFieldChange('date', e.target.value)} />
                                </div>
                                <div className="edit-field">
                                  <label style={{display:'block', fontSize:'0.85em', color:'#aaa', marginBottom:'5px'}}>Start Time</label>
                                  <select className="booking-edit-input" style={{width:'100%'}} value={Number(bookingEditForm.startHour)} onChange={(e) => handleBookingEditFieldChange('startHour', Number(e.target.value))}>
                                    {Array.from({length: 24}, (_, h) => <option key={h} value={h}>{formatHourLabel(h)}</option>)}
                                  </select>
                                </div>
                                <div className="edit-field">
                                  <label style={{display:'block', fontSize:'0.85em', color:'#aaa', marginBottom:'5px'}}>End Time</label>
                                  <select className="booking-edit-input" style={{width:'100%'}} value={Number(bookingEditForm.endHour)} onChange={(e) => handleBookingEditFieldChange('endHour', Number(e.target.value))}>
                                    {Array.from({length: 24}, (_, h) => <option key={h} value={h}>{formatHourLabel(h)}</option>)}
                                  </select>
                                </div>
                                <div className="edit-field">
                                  <label style={{display:'block', fontSize:'0.85em', color:'#aaa', marginBottom:'5px'}}>Amount (₹)</label>
                                  <input className="booking-edit-input" style={{width:'100%'}} type="number" min="0" step="0.01" value={bookingEditForm.totalAmount} onChange={(e) => handleBookingEditFieldChange('totalAmount', e.target.value)} />
                                </div>
                                <div className="edit-field">
                                  <label style={{display:'block', fontSize:'0.85em', color:'#aaa', marginBottom:'5px'}}>Type</label>
                                  <select className="booking-edit-input" style={{width:'100%'}} value={bookingEditForm.bookingType} onChange={(e) => handleBookingEditFieldChange('bookingType', e.target.value)}>
                                    <option value="online">online</option>
                                    <option value="offline">offline</option>
                                  </select>
                                </div>
                                <div className="edit-field">
                                  <label style={{display:'block', fontSize:'0.85em', color:'#aaa', marginBottom:'5px'}}>Status</label>
                                  <select className="booking-edit-input" style={{width:'100%'}} value={bookingEditForm.paymentStatus} onChange={(e) => handleBookingEditFieldChange('paymentStatus', e.target.value)}>
                                    <option value="pending">pending</option>
                                    <option value="processing">processing</option>
                                    <option value="paid">paid</option>
                                    <option value="failed">failed</option>
                                    <option value="refunded">refunded</option>
                                  </select>
                                </div>
                              </div>
                              <div className="edit-actions" style={{ marginTop: '20px', display: 'flex', gap: '10px' }}>
                                <button className="booking-action-btn save" style={{ padding: '8px 24px' }} onClick={() => saveBookingEdit(booking.id)} disabled={bookingActionLoading}>Save Changes</button>
                                <button className="booking-action-btn cancel" style={{ padding: '8px 24px' }} onClick={cancelBookingEdit} disabled={bookingActionLoading}>Cancel</button>
                              </div>
                              {bookingEditError && <div className="booking-edit-error" style={{marginTop:'10px', color:'#ff6b6b'}}>{bookingEditError}</div>}
                            </div>
                          ) : (
                            <div className="booking-details-content">
                              <div className="detail-grid">
                                <div className="detail-item">
                                  <span className="detail-label">Phone Reference</span>
                                  <span className="detail-value">{booking.phone}</span>
                                </div>
                                <div className="detail-item">
                                  <span className="detail-label">Email ID</span>
                                  <span className="detail-value">{booking.email}</span>
                                </div>
                                <div className="detail-item">
                                  <span className="detail-label">Total Amount</span>
                                  <span className="detail-value" style={{fontWeight: 'bold', color: 'var(--brand-green)'}}>₹{booking.totalAmount}</span>
                                </div>
                                <div className="detail-item">
                                  <span className="detail-label">Transaction ID</span>
                                  <span className="detail-value">
                                    {booking.razorpayPaymentId ? (
                                      <a href={`https://dashboard.razorpay.com/app/payments/${booking.razorpayPaymentId}`} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--brand-green)', textDecoration: 'underline' }}>{booking.razorpayPaymentId}</a>
                                    ) : (
                                      <span style={{ color: '#aaa'}}>{booking.bookingType === 'offline' ? 'Offline Payment' : 'Pending Payment'}</span>
                                    )}
                                  </span>
                                </div>
                                <div className="detail-item">
                                  <span className="detail-label">Booking Mode</span>
                                  <span className="detail-value">
                                    <span style={{
                                      padding: '2px 8px', borderRadius: '4px', fontSize: '0.9em',
                                      background: booking.bookingType === 'offline' ? 'rgba(255, 171, 0, 0.2)' : 'rgba(0, 217, 163, 0.2)',
                                      color: booking.bookingType === 'offline' ? '#ffab00' : '#00d9a3'
                                    }}>
                                      {booking.bookingType?.toUpperCase() || 'ONLINE'}
                                    </span>
                                  </span>
                                </div>
                              </div>
                            </div>
                          )}
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    );
  }
}

export default AdminDashboard;
