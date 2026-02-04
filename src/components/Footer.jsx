import React from "react";
import { Link } from "react-router-dom";
import "./Footer.css";

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-inner">
        <div className="footer-brand">
          <h3>🏏 SixerZone Turf</h3>
          <p className="tag">
            Book turf slots easily — secure payments via Razorpay
          </p>
        </div>

        <nav className="footer-nav" aria-label="Footer navigation">
          <Link to="/">Home</Link>
          <Link to="/privacy-policy">Privacy Policy</Link>
          <Link to="/terms">Terms & Conditions</Link>
          <Link to="/refund-policy">Refund/Cancellation</Link>
          <Link to="/contact">Contact</Link>
        </nav>

        <div className="footer-contact">
          <p>
            <strong>Support</strong>
          </p>
          <p>
            <a href="tel:+918884184667">+91-8884184667</a>
          </p>
          <p>
            <a href="mailto:sixerzone.techworks@gmail.com">sixerzone.techworks@gmail.com</a>
          </p>
        </div>
      </div>

      <div className="footer-bottom">
        <small>
          © {new Date().getFullYear()} SixerZone Turf. All rights reserved.
        </small>
      </div>
    </footer>
  );
}
