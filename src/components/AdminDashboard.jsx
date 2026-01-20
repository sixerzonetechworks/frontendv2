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

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  isAdminLoggedIn, 
  adminLogout, 
  getAllBookings, 
  searchBooking,
  getStatistics
} from '../utils/adminApi';
import { getGrounds, updateGroundPricing } from '../utils/api';
import { FaPencilAlt, FaSave } from 'react-icons/fa';
import OfflineBookingFlow from './OfflineBookingFlow';
import './AdminDashboard.css';

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

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatTime = (timeString) => {
    if (!timeString) return 'N/A';
    const date = new Date(timeString);
    return date.toLocaleTimeString('en-US', {
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
                <th>Phone</th>
                <th>Email</th>
                <th>Ground</th>
                <th>Date</th>
                <th>Start Time</th>
                <th>End Time</th>
                <th>Amount</th>
                <th>Payment ID</th>
                <th>Type</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((booking) => (
                <tr key={booking.id}>
                  <td>#{booking.id}</td>
                  <td>{booking.name}</td>
                  <td>{booking.phone}</td>
                  <td>{booking.email}</td>
                  <td>{booking.ground?.name || 'N/A'}</td>
                  <td>{formatDate(booking.startTime)}</td>
                  <td>{formatTime(booking.startTime)}</td>
                  <td>{formatTime(booking.endTime)}</td>
                  <td>₹{booking.totalAmount}</td>
                  <td>
                    {booking.razorpayPaymentId ? (
                      <a 
                        href={`https://dashboard.razorpay.com/app/payments/${booking.razorpayPaymentId}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{color: 'var(--brand-green)', textDecoration: 'underline', fontSize: '0.85em'}}
                        title="View in Razorpay Dashboard"
                      >
                        {booking.razorpayPaymentId.substring(0, 15)}...
                      </a>
                    ) : (
                      <span style={{color: '#666', fontSize: '0.85em'}}>
                        {booking.bookingType === 'offline' ? 'Offline' : 'Pending'}
                      </span>
                    )}
                  </td>
                  <td>
                    <span className={`booking-type-badge ${booking.bookingType || 'online'}`}>
                      {booking.bookingType || 'online'}
                    </span>
                  </td>
                  <td>
                    <span className={`status-badge ${booking.paymentStatus}`}>
                      {booking.paymentStatus}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    );
  }
}

export default AdminDashboard;
