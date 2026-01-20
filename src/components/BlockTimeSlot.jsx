/**
 * Block Time Slot Component
 */

import { useState, useEffect } from 'react';
import { blockTimeSlot, unblockTimeSlot, getBlockedSlots } from '../utils/adminApi';
import { getGrounds } from '../utils/api';
import './BlockTimeSlot.css';

function BlockTimeSlot() {
  const [grounds, setGrounds] = useState([]);
  const [blockedSlots, setBlockedSlots] = useState([]);
  const [formData, setFormData] = useState({
    date: '',
    timeSlot: '',
    groundId: '',
    reason: ''
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const timeSlots = [
    '12:00 AM - 1:00 AM', '1:00 AM - 2:00 AM', '2:00 AM - 3:00 AM',
    '3:00 AM - 4:00 AM', '4:00 AM - 5:00 AM', '5:00 AM - 6:00 AM',
    '6:00 AM - 7:00 AM', '7:00 AM - 8:00 AM', '8:00 AM - 9:00 AM',
    '9:00 AM - 10:00 AM', '10:00 AM - 11:00 AM', '11:00 AM - 12:00 PM',
    '12:00 PM - 1:00 PM', '1:00 PM - 2:00 PM', '2:00 PM - 3:00 PM',
    '3:00 PM - 4:00 PM', '4:00 PM - 5:00 PM', '5:00 PM - 6:00 PM',
    '6:00 PM - 7:00 PM', '7:00 PM - 8:00 PM', '8:00 PM - 9:00 PM',
    '9:00 PM - 10:00 PM', '10:00 PM - 11:00 PM', '11:00 PM - 12:00 AM'
  ];

  useEffect(() => {
    loadGrounds();
    loadBlockedSlots();
  }, []);

  const loadGrounds = async () => {
    try {
      const data = await getGrounds();
      setGrounds(data);
    } catch (err) {
      console.error('Failed to load grounds:', err);
    }
  };

  const loadBlockedSlots = async () => {
    try {
      const data = await getBlockedSlots();
      setBlockedSlots(data.data.blockedSlots);
    } catch (err) {
      console.error('Failed to load blocked slots:', err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      await blockTimeSlot({
        date: formData.date,
        timeSlot: formData.timeSlot,
        groundId: formData.groundId || null,
        reason: formData.reason
      });

      setMessage({ type: 'success', text: 'Time slot blocked successfully' });
      setFormData({ date: '', timeSlot: '', groundId: '', reason: '' });
      loadBlockedSlots();
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'Failed to block slot' });
    } finally {
      setLoading(false);
    }
  };

  const handleUnblock = async (slotId) => {
    if (!confirm('Are you sure you want to unblock this slot?')) return;

    try {
      await unblockTimeSlot(slotId);
      setMessage({ type: 'success', text: 'Time slot unblocked successfully' });
      loadBlockedSlots();
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'Failed to unblock slot' });
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="block-slot-container">
      <div className="block-form-section">
        <h2>Block Time Slot</h2>
        <p className="section-subtitle">
          Block specific time slots for offline bookings or maintenance
        </p>

        {message.text && (
          <div className={`message ${message.type}`}>
            {message.text}
          </div>
        )}

        <form className="block-form" onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="date">Date *</label>
              <input
                type="date"
                id="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                min={new Date().toISOString().split('T')[0]}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="timeSlot">Time Slot *</label>
              <select
                id="timeSlot"
                value={formData.timeSlot}
                onChange={(e) => setFormData({ ...formData, timeSlot: e.target.value })}
                required
              >
                <option value="">Select time slot</option>
                {timeSlots.map((slot) => (
                  <option key={slot} value={slot}>{slot}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="groundId">Ground (Optional)</label>
              <select
                id="groundId"
                value={formData.groundId}
                onChange={(e) => setFormData({ ...formData, groundId: e.target.value })}
              >
                <option value="">All Grounds</option>
                {grounds.map((ground) => (
                  <option key={ground.id} value={ground.id}>
                    {ground.name}
                  </option>
                ))}
              </select>
              <small>Leave empty to block slot for all grounds</small>
            </div>

            <div className="form-group">
              <label htmlFor="reason">Reason</label>
              <input
                type="text"
                id="reason"
                value={formData.reason}
                onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                placeholder="e.g., Offline booking, Maintenance"
              />
            </div>
          </div>

          <button type="submit" className="block-btn" disabled={loading}>
            {loading ? 'Blocking...' : '🚫 Block Slot'}
          </button>
        </form>
      </div>

      <div className="blocked-slots-section">
        <h2>Currently Blocked Slots</h2>
        {blockedSlots.length === 0 ? (
          <div className="empty-state">No blocked slots</div>
        ) : (
          <div className="blocked-slots-list">
            {blockedSlots.map((slot) => (
              <div key={slot.id} className="blocked-slot-card">
                <div className="slot-info">
                  <div className="slot-date">{formatDate(slot.date)}</div>
                  <div className="slot-time">{slot.timeSlot}</div>
                  <div className="slot-ground">
                    {slot.ground ? slot.ground.name : 'All Grounds'}
                  </div>
                  {slot.reason && <div className="slot-reason">{slot.reason}</div>}
                </div>
                <button
                  className="unblock-btn"
                  onClick={() => handleUnblock(slot.id)}
                >
                  Unblock
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default BlockTimeSlot;
