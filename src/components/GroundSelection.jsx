/**
 * GroundSelection Component
 * 
 * This component displays all available grounds for the selected date and time.
 * Each ground shows availability status and can be selected to proceed to booking.
 * 
 * Props:
 * @param {string} selectedDate - The date selected by user (YYYY-MM-DD format)
 * @param {Object} selectedSlot - The time slot selected by user {slot, hour}
 * @param {Function} onGroundSelect - Callback when a ground is selected
 * @param {Function} onBack - Callback to go back to slot selection
 */

import { useState, useEffect } from 'react';
import { getAvailableGrounds } from '../utils/api';
import { formatDate, getDayName, formatTimeRange } from '../utils/helpers';
import './GroundSelection.css';

function GroundSelection({ selectedDate, selectedSlot, onGroundSelect, onBack }) {
  // State to store available grounds
  const [grounds, setGrounds] = useState([]);
  
  // Loading and error states
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  /**
   * Fetch available grounds when component mounts
   */
  useEffect(() => {
    if (selectedDate && selectedSlot) {
      fetchAvailableGrounds();
    }
  }, [selectedDate, selectedSlot]);

  /**
   * Fetch available grounds from API for the selected date and time
   */
  const fetchAvailableGrounds = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Pass either single hour or array of hours
      const hoursToCheck = selectedSlot.hours || [selectedSlot.hour];
      const data = await getAvailableGrounds(selectedDate, hoursToCheck);
      setGrounds(data);
    } catch (err) {
      setError('Failed to load available grounds. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handle ground selection
   * @param {Object} ground - Ground object with id, name, and availability
   */
  const handleGroundClick = (ground) => {
    if (ground.available) {
      onGroundSelect(ground);
    }
  };

  // Show loading state
  if (loading) {
    return (
      <div className="ground-selection">
        <h2>Select a Ground</h2>
        <div className="loading">Loading available grounds...</div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="ground-selection">
        <h2>Select a Ground</h2>
        <div className="error">
          {error}
          <button className="btn btn-secondary" onClick={fetchAvailableGrounds}>
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="ground-selection">
      {/* Header with selected date and time info */}
      <div className="selection-header">
        <button className="btn btn-back" onClick={onBack}>
          ← Back
        </button>
        <div className="selected-info">
          <h2>Select a Ground</h2>
          <p className="selected-date">
            {formatDate(selectedDate)} ({getDayName(selectedDate)})
          </p>
          <p className="selected-slot">
            {selectedSlot.hours && selectedSlot.hours.length > 1 
              ? `${formatTimeRange(selectedSlot.hours)} (${selectedSlot.hours.length} hours)`
              : selectedSlot.slot
            }
          </p>
        </div>
      </div>

      {/* Legend */}
      <div className="legend">
        <div className="legend-item">
          <span className="legend-box available"></span>
          <span>Available</span>
        </div>
        <div className="legend-item">
          <span className="legend-box unavailable"></span>
          <span>Already Booked</span>
        </div>
      </div>

      {/* Grounds grid */}
      <div className="grounds-grid">
        {grounds.map((ground) => (
          <div
            key={ground.id}
            className={`ground-card ${ground.available ? 'available' : 'unavailable'}`}
            onClick={() => handleGroundClick(ground)}
            role="button"
            tabIndex={ground.available ? 0 : -1}
            aria-label={`${ground.name} - ${ground.available ? 'available' : 'booked'}`}
          >
            {/* Ground Visual Diagram */}
            <div className="ground-visual">
              {ground.name === 'G1' && (
                <svg viewBox="0 0 200 120" className="ground-diagram">
                  {/* Full Field Outline */}
                  <rect x="10" y="10" width="180" height="100" 
                    fill="rgba(255, 255, 255, 0.05)" 
                    stroke="rgba(255, 255, 255, 0.2)" 
                    strokeWidth="2" 
                    rx="8"/>
                  {/* G1 Highlighted (Left Half) */}
                  <rect x="10" y="10" width="90" height="100" 
                    fill="rgba(0, 217, 163, 0.3)" 
                    stroke="var(--brand-green)" 
                    strokeWidth="3" 
                    rx="8"/>
                  {/* Center Line */}
                  <line x1="100" y1="10" x2="100" y2="110" 
                    stroke="rgba(255, 255, 255, 0.3)" 
                    strokeWidth="2" 
                    strokeDasharray="5,5"/>
                  {/* G1 Label */}
                  <text x="55" y="65" 
                    fill="var(--brand-green)" 
                    fontSize="20" 
                    fontWeight="bold" 
                    textAnchor="middle">G1</text>
                  {/* G2 Label (Dimmed) */}
                  <text x="145" y="65" 
                    fill="rgba(255, 255, 255, 0.3)" 
                    fontSize="16" 
                    textAnchor="middle">G2</text>
                </svg>
              )}
              {ground.name === 'G2' && (
                <svg viewBox="0 0 200 120" className="ground-diagram">
                  {/* Full Field Outline */}
                  <rect x="10" y="10" width="180" height="100" 
                    fill="rgba(255, 255, 255, 0.05)" 
                    stroke="rgba(255, 255, 255, 0.2)" 
                    strokeWidth="2" 
                    rx="8"/>
                  {/* G2 Highlighted (Right Half) */}
                  <rect x="100" y="10" width="90" height="100" 
                    fill="rgba(0, 217, 163, 0.3)" 
                    stroke="var(--brand-green)" 
                    strokeWidth="3" 
                    rx="8"/>
                  {/* Center Line */}
                  <line x1="100" y1="10" x2="100" y2="110" 
                    stroke="rgba(255, 255, 255, 0.3)" 
                    strokeWidth="2" 
                    strokeDasharray="5,5"/>
                  {/* G1 Label (Dimmed) */}
                  <text x="55" y="65" 
                    fill="rgba(255, 255, 255, 0.3)" 
                    fontSize="16" 
                    textAnchor="middle">G1</text>
                  {/* G2 Label */}
                  <text x="145" y="65" 
                    fill="var(--brand-green)" 
                    fontSize="20" 
                    fontWeight="bold" 
                    textAnchor="middle">G2</text>
                </svg>
              )}
              {ground.name === 'Mega_Ground' && (
                <svg viewBox="0 0 200 120" className="ground-diagram">
                  {/* Full Field Highlighted */}
                  <rect x="10" y="10" width="180" height="100" 
                    fill="rgba(0, 217, 163, 0.3)" 
                    stroke="var(--brand-green)" 
                    strokeWidth="3" 
                    rx="8"/>
                  {/* Center Line */}
                  <line x1="100" y1="10" x2="100" y2="110" 
                    stroke="rgba(255, 255, 255, 0.3)" 
                    strokeWidth="2" 
                    strokeDasharray="5,5"/>
                  {/* Mega Ground Label */}
                  <text x="100" y="60" 
                    fill="var(--brand-green)" 
                    fontSize="18" 
                    fontWeight="bold" 
                    textAnchor="middle">MEGA</text>
                  <text x="100" y="78" 
                    fill="var(--brand-green)" 
                    fontSize="14" 
                    fontWeight="bold" 
                    textAnchor="middle">GROUND</text>
                </svg>
              )}
            </div>

            {/* Ground Info */}
            <div className="ground-info">
              <div className="ground-icon">
                {ground.available ? '🏏' : '🔒'}
              </div>
              <h3 className="ground-name">{ground.name}</h3>
              
              {/* Ground Description */}
              {ground.description && (
                <p className="ground-description">{ground.description}</p>
              )}
              
              {/* Pricing */}
              {ground.price && (
                <div className="ground-price">
                  <span className="price-label">Price:</span>
                  <span className="price-value">₹{ground.pricePerHour || Math.round(ground.price / (selectedSlot.hours?.length || 1))}</span>
                  <span className="price-duration">/hour</span>
                </div>
              )}
              
              <div className={`ground-status ${ground.available ? 'available-badge' : 'unavailable-badge'}`}>
                {ground.available ? '✓ Available' : '✗ Booked'}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Show message if all grounds are booked */}
      {grounds.every(g => !g.available) && (
        <div className="no-grounds-message">
          <p>All grounds are booked for this time slot.</p>
          <p>Please select a different time slot.</p>
        </div>
      )}
    </div>
  );
}

export default GroundSelection;
