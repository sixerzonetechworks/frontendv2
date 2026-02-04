import React from "react";
import "./LegalPages.css";

export default function RefundPolicy() {
  return (
    <div className="legal-container">
      <h1>Refund & Cancellation Policy</h1>
      <p className="meta">Last updated: 01 Feb 2026</p>

      <h2>Refund Policy</h2>
      <p>
        We do not offer refunds for any bookings. All payments are final and non-refundable.
      </p>
      <p>
        For any special cases or exceptional circumstances, please visit the turf office in person to discuss your situation.
      </p>

      <div className="legal-contact">
        <p>
          Questions? Call <a href="tel:+918884184667">+91-8884184667</a> or
          email <a href="mailto:sixerzone.techworks@gmail.com">sixerzone.techworks@gmail.com</a>
          .
        </p>
      </div>
    </div>
  );
}
