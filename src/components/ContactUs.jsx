import React from "react";
import "./LegalPages.css";

export default function ContactUs() {
  return (
    <div className="legal-container">
      <h1>Contact Us</h1>
      <p>
        We're here to help — get in touch with us through any of the following
        options:
      </p>

      <div className="contact-card">
        <p>
          <strong>Phone:</strong> <a href="tel:+919036331195">+91-9036331195</a>{" "}
          (Mon–Sat 9:00–18:00)
        </p>
        <p>
          <strong>Email:</strong>{" "}
          <a href="mailto:support@sixerzone.com">support@sixerzone.com</a>
        </p>
        <p>
          <strong>Address:</strong> SixerZone Turf, 12 Sample Ave, City
        </p>
        <p className="small">
          For urgent issues about active bookings, call us. Typical response
          time: within 48 hours on business days.
        </p>
      </div>

      <div className="legal-contact">
        <p>
          If any contact details are outdated, please update them in your site
          settings or get in touch and we will help update the information.
        </p>
      </div>
    </div>
  );
}
