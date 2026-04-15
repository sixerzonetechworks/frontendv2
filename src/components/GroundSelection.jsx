/**
 * GroundSelection Component (Smart Split Booking)
 * 
 * Displays smart booking options including:
 * - Single-ground options (full availability on one ground)
 * - Split/switch-ground options (start on G1, switch to G2, etc.)
 * 
 * Props:
 * @param {string} selectedDate - Date in YYYY-MM-DD format
 * @param {Object} selectedSlot - { slot, hour, hours: [hour1, hour2, ...] }
 * @param {Function} onGroundSelect - Callback when an option is selected
 * @param {Function} onBack - Callback to go back to slot selection
 */

import { useState, useEffect } from 'react';
import { getSmartBookingOptions, getAvailableGrounds } from '../utils/api';
import { formatDate, getDayName, formatTimeRange, formatTime } from '../utils/helpers';
import './GroundSelection.css';

function GroundSelection({ selectedDate, selectedSlot, onGroundSelect, onBack }) {
  const [options, setOptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [useLegacy, setUseLegacy] = useState(false);

  // Mapping for ground display names
  const groundDisplayNames = {
    'G1': 'Ground 1',
    'G2': 'Ground 2',
    'Mega_Ground': 'Double Ground'
  };

  useEffect(() => {
    if (selectedDate && selectedSlot) {
      fetchOptions();
    }
  }, [selectedDate, selectedSlot]);

  /**
   * Fetch smart booking options from the new API endpoint.
   * Falls back to legacy getAvailableGrounds if the new endpoint is unavailable.
   */
  const fetchOptions = async () => {
    try {
      setLoading(true);
      setError(null);
      setUseLegacy(false);
      
      const hoursToCheck = selectedSlot.hours || [selectedSlot.hour];
      const startHour = Math.min(...hoursToCheck);
      const duration = hoursToCheck.length;

      try {
        const data = await getSmartBookingOptions(selectedDate, startHour, duration);
        if (data && data.options) {
          setOptions(data.options);
          return;
        }
      } catch (smartErr) {
        console.warn('Smart options API not available, falling back to legacy:', smartErr);
      }
      
      // Fallback: use existing ground availability API
      setUseLegacy(true);
      const data = await getAvailableGrounds(selectedDate, hoursToCheck);
      // Convert legacy format to options format
      const legacyOptions = data.map(ground => ({
        type: 'single',
        label: groundDisplayNames[ground.name] || ground.name,
        groundName: ground.name,
        groundId: ground.id,
        description: ground.description,
        switches: 0,
        slots: hoursToCheck.map(hour => ({
          hour,
          groundId: ground.id,
          groundName: ground.name,
          price: ground.pricePerHour || 0
        })),
        totalPrice: ground.price || 0,
        pricePerHour: ground.pricePerHour || 0,
        available: ground.available,
        disabled: ground.disabled
      }));
      setOptions(legacyOptions);
    } catch (err) {
      setError('Failed to load booking options. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handle option selection
   */
  const handleOptionClick = (option) => {
    // For legacy mode, check availability
    if (useLegacy && (option.disabled || option.available === false)) return;
    onGroundSelect(option);
  };

  /**
   * Render SVG ground diagram for single-ground options
   */
  const renderGroundDiagram = (groundName) => {
    if (groundName === 'G1') {
      return (
        <svg viewBox="0 0 200 120" className="ground-diagram">
          <rect x="10" y="10" width="180" height="100" 
            fill="rgba(255, 255, 255, 0.05)" stroke="rgba(255, 255, 255, 0.2)" strokeWidth="2" rx="8"/>
          <rect x="10" y="10" width="90" height="100" 
            fill="rgba(0, 217, 163, 0.3)" stroke="var(--brand-green)" strokeWidth="3" rx="8"/>
          <line x1="100" y1="10" x2="100" y2="110" stroke="rgba(255, 255, 255, 0.3)" strokeWidth="2" strokeDasharray="5,5"/>
          <text x="55" y="65" fill="var(--brand-green)" fontSize="20" fontWeight="bold" textAnchor="middle">Ground 1</text>
          <text x="145" y="65" fill="rgba(255, 255, 255, 0.3)" fontSize="16" textAnchor="middle">Ground 2</text>
        </svg>
      );
    }
    if (groundName === 'G2') {
      return (
        <svg viewBox="0 0 200 120" className="ground-diagram">
          <rect x="10" y="10" width="180" height="100" 
            fill="rgba(255, 255, 255, 0.05)" stroke="rgba(255, 255, 255, 0.2)" strokeWidth="2" rx="8"/>
          <rect x="100" y="10" width="90" height="100" 
            fill="rgba(0, 217, 163, 0.3)" stroke="var(--brand-green)" strokeWidth="3" rx="8"/>
          <line x1="100" y1="10" x2="100" y2="110" stroke="rgba(255, 255, 255, 0.3)" strokeWidth="2" strokeDasharray="5,5"/>
          <text x="55" y="65" fill="rgba(255, 255, 255, 0.3)" fontSize="16" textAnchor="middle">Ground 1</text>
          <text x="145" y="65" fill="var(--brand-green)" fontSize="20" fontWeight="bold" textAnchor="middle">Ground 2</text>
        </svg>
      );
    }
    if (groundName === 'Mega_Ground') {
      return (
        <svg viewBox="0 0 200 120" className="ground-diagram">
          <rect x="10" y="10" width="180" height="100" 
            fill="rgba(0, 217, 163, 0.3)" stroke="var(--brand-green)" strokeWidth="3" rx="8"/>
          <line x1="100" y1="10" x2="100" y2="110" stroke="rgba(255, 255, 255, 0.3)" strokeWidth="2" strokeDasharray="5,5"/>
          <text x="100" y="60" fill="var(--brand-green)" fontSize="18" fontWeight="bold" textAnchor="middle">DOUBLE</text>
          <text x="100" y="78" fill="var(--brand-green)" fontSize="14" fontWeight="bold" textAnchor="middle">GROUND</text>
        </svg>
      );
    }
    return null;
  };

  /**
   * Render SVG ground diagram for split options
   */
  const renderSplitSVG = (option) => {
    if (!option.segments || option.segments.length === 0) return null;

    const segmentsCount = option.segments.length;
    const boxWidth = 130;
    const padding = 10;
    const totalContentWidth = segmentsCount * boxWidth;
    const viewBoxWidth = (padding * 2) + totalContentWidth;

    return (
      <svg viewBox={`0 0 ${viewBoxWidth} 120`} className="ground-diagram">
        <rect x={padding} y={padding} width={totalContentWidth} height="100" 
          fill="rgba(255, 255, 255, 0.05)" stroke="rgba(255, 255, 255, 0.2)" strokeWidth="2" rx="8"/>
        
        {option.segments.map((seg, idx) => {
          const isG1 = seg.groundName === 'G1' || seg.groundName === 'Ground 1';
          const label = isG1 ? 'G1' : 'G2';
          const colorBox = isG1 ? 'rgba(0, 217, 163, 0.3)' : 'rgba(59, 130, 246, 0.3)';
          const colorBorder = isG1 ? 'var(--brand-green)' : '#3B82F6';
          
          const start = formatTime(seg.hours[0]).replace(':00', '');
          const end = formatTime(seg.hours[seg.hours.length - 1] + 1).replace(':00', '');
          const timeLabel = `${start} - ${end}`;
          
          const boxX = padding + (idx * boxWidth);
          const centerX = boxX + (boxWidth / 2);

          return (
            <g key={idx}>
              <rect x={boxX} y={padding} width={boxWidth} height="100" 
                fill={colorBox} stroke={colorBorder} strokeWidth="3" rx={idx === 0 || idx === segmentsCount - 1 ? 8 : 0}/>
              <text x={centerX} y={padding + 45} fill={colorBorder} fontSize="26" fontWeight="800" textAnchor="middle">{label}</text>
              <text x={centerX} y={padding + 72} fill="rgba(255,255,255,0.95)" fontSize="12" fontWeight="700" textAnchor="middle">{timeLabel}</text>
              
              {/* Divider / Arrow on the right edge if not the last segment */}
              {idx < segmentsCount - 1 && (
                <>
                  <line x1={boxX + boxWidth} y1={padding} x2={boxX + boxWidth} y2={padding + 100} stroke="rgba(255, 255, 255, 0.4)" strokeWidth="2" strokeDasharray="5,5"/>
                  <circle cx={boxX + boxWidth} cy={padding + 55} r="16" fill="#1e293b" stroke="rgba(255,255,255,0.3)" strokeWidth="2" />
                  <text x={boxX + boxWidth} y={padding + 60} fill="white" fontSize="16" fontWeight="bold" textAnchor="middle">→</text>
                </>
              )}
            </g>
          );
        })}
      </svg>
    );
  };

  // Loading state
  if (loading) {
    return (
      <div className="ground-selection">
        <h2>Finding Best Options...</h2>
        <div className="loading">Analyzing ground availability...</div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="ground-selection">
        <h2>Select a Booking Option</h2>
        <div className="error">
          {error}
          <button className="btn btn-secondary" onClick={fetchOptions}>Retry</button>
        </div>
      </div>
    );
  }

  const duration = selectedSlot.hours ? selectedSlot.hours.length : 1;
  const availableOptions = options.filter(opt => 
    opt.available !== false && opt.disabled !== true
  );

  return (
    <div className="ground-selection">
      {/* Header with selected date and time info */}
      <div className="selection-header">
        <button className="btn btn-back" onClick={onBack}>← Back</button>
        <div className="selected-info">
          <h2>Select a Booking Option</h2>
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
          <span>Single Ground</span>
        </div>
        {duration > 1 && (
          <div className="legend-item">
            <span className="legend-box" style={{ background: 'linear-gradient(90deg, rgba(0,217,163,0.5), rgba(59,130,246,0.5))' }}></span>
            <span>Switch Grounds</span>
          </div>
        )}
      </div>

      {/* Options grid */}
      <div className="grounds-grid">
        {options.map((option, index) => {
          const isDisabled = option.disabled === true || option.available === false;
          const isSplit = option.type === 'split';

          return (
            <div
              key={index}
              className={`ground-card ${isDisabled ? 'unavailable disabled' : 'available'} ${isSplit ? 'split-option' : ''}`}
              onClick={() => handleOptionClick(option)}
              onKeyDown={(e) => { if (!isDisabled && e.key === 'Enter') handleOptionClick(option); }}
              role="button"
              tabIndex={isDisabled ? -1 : 0}
              aria-disabled={isDisabled}
              aria-label={`${option.label} - ${isDisabled ? 'unavailable' : 'available'} - ₹${option.totalPrice}`}
            >
              {/* Ground Visual SVG */}
              <div className="ground-visual">
                {isSplit ? renderSplitSVG(option) : renderGroundDiagram(option.groundName)}
              </div>

              {/* Option Info */}
              <div className="ground-info">
                <div className="ground-icon">
                  {isDisabled ? '🔒' : isSplit ? '🔄' : '🏏'}
                </div>
                
                <h3 className="ground-name">
                  {option.label}
                  {isSplit && (
                    <>
                      {' '}
                      <span className="switch-badge">{option.switches} switch{option.switches > 1 ? 'es' : ''}</span>
                    </>
                  )}
                </h3>
                
                {/* Description */}
                {option.description && (
                  <p className="ground-description">{option.description}</p>
                )}
                
                {/* Pricing */}
                {option.totalPrice > 0 && (
                  <div className="ground-price">
                    <span className="price-label">Price:</span>
                    <span className="price-value">₹{option.totalPrice}</span>
                    <span className="price-duration"> for {duration} hour{duration > 1 ? 's' : ''}</span>
                    {option.pricePerHour > 0 && (
                      <div className="price-per-hour">
                        (₹{option.pricePerHour}/hour avg)
                      </div>
                    )}
                  </div>
                )}

                <div className={`ground-status ${isDisabled ? 'unavailable-badge' : 'available-badge'}`}>
                  {isDisabled ? '✗ Unavailable' : isSplit ? '✓ Available (Switch)' : '✓ Available'}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* No options message */}
      {availableOptions.length === 0 && (
        <div className="no-grounds-message">
          <p>No booking options available for this time slot.</p>
          <p>Please select a different time or duration.</p>
        </div>
      )}
    </div>
  );
}

export default GroundSelection;
