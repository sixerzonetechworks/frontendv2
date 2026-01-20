/**
 * DateSelection Component
 * 
 * This component displays a calendar view of available dates for the next 45 days.
 * Dates are grouped by month and shown with enabled/disabled status.
 * Users can select an enabled date to proceed to time slot selection.
 * 
 * Props:
 * @param {Function} onDateSelect - Callback when a date is selected
 */

import { useState, useEffect } from 'react';
import { getAvailableDates } from '../utils/api';
import { formatMonthYear, getDayName } from '../utils/helpers';
import './DateSelection.css';

function DateSelection({ onDateSelect }) {
  // State to store available dates grouped by month
  const [datesByMonth, setDatesByMonth] = useState({});
  
  // Loading and error states
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  /**
   * Fetch available dates when component mounts
   */
  useEffect(() => {
    fetchAvailableDates();
  }, []);

  /**
   * Fetch available dates from API
   */
  const fetchAvailableDates = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await getAvailableDates();
      setDatesByMonth(data);
    } catch (err) {
      setError('Failed to load available dates. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handle date selection
   * @param {Object} dateObj - Date object with date and enabled status
   */
  const handleDateClick = (dateObj) => {
    if (dateObj.enabled) {
      onDateSelect(dateObj.date);
    }
  };

  // Show loading state
  if (loading) {
    return (
      <div className="date-selection">
        <h2>Select a Date</h2>
        <div className="loading">Loading available dates...</div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="date-selection">
        <h2>Select a Date</h2>
        <div className="error">
          {error}
          <button className="btn btn-secondary" onClick={fetchAvailableDates}>
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="date-selection">
      <h2>Select a Date</h2>
      <p className="subtitle">Choose an available date to book your turf</p>

      {/* Legend */}
      <div className="legend">
        <div className="legend-item">
          <span className="legend-box available"></span>
          <span>Available</span>
        </div>
        <div className="legend-item">
          <span className="legend-box unavailable"></span>
          <span>Fully Booked</span>
        </div>
      </div>

      {/* Render dates grouped by month */}
      <div className="months-container">
        {Object.keys(datesByMonth).map((monthKey) => (
          <div key={monthKey} className="month-section">
            <h3 className="month-title">{formatMonthYear(monthKey)}</h3>
            
            <div className="dates-grid">
              {datesByMonth[monthKey].map((dateObj) => (
                <div
                  key={dateObj.date}
                  className={`date-card ${dateObj.enabled ? 'enabled' : 'disabled'}`}
                  onClick={() => handleDateClick(dateObj)}
                  role="button"
                  tabIndex={dateObj.enabled ? 0 : -1}
                  aria-label={`${dateObj.date} ${dateObj.enabled ? 'available' : 'fully booked'}`}
                >
                  <div className="date-number">
                    {new Date(dateObj.date + 'T00:00:00').getDate()}
                  </div>
                  <div className="date-day">
                    {getDayName(dateObj.date).substring(0, 3)}
                  </div>
                  {!dateObj.enabled && <div className="date-status">Full</div>}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default DateSelection;
