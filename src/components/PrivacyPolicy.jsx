import React from "react";
import "./LegalPages.css";

export default function PrivacyPolicy() {
  return (
    <div className="legal-container">
      <h1>Privacy Policy</h1>
      <p className="meta">Last updated: 01 Feb 2026</p>

      <h2>1. Information We Collect</h2>
      <p>
        We collect the following information to provide and improve our booking
        services:
      </p>
      <ul>
        <li>
          <strong>Booking information:</strong> name, phone number, email,
          chosen ground, date and time.
        </li>
        <li>
          <strong>Payment information:</strong> payment identifiers and
          transaction details (processed by Razorpay). We do not store full card
          numbers or CVV data.
        </li>
        <li>
          <strong>Device & usage data:</strong> IP address, browser and device
          data, and analytics to help improve the site.
        </li>
      </ul>

      <h2>2. How We Use Your Information</h2>
      <p>Your information is used to:</p>
      <ul>
        <li>Process bookings and payments.</li>
        <li>Send booking confirmations, receipts, and important updates.</li>
        <li>Improve our services and prevent fraud or abuse.</li>
      </ul>

      <h2>3. Sharing & Third Parties</h2>
      <p>
        We may share information with third-party service providers who help
        operate our service, including payment processors (Razorpay), hosting
        and analytics providers. These third parties are contractually required
        to keep your information secure.
      </p>

      <h2>4. Data Retention & Your Rights</h2>
      <p>
        We retain personal information as long as needed to provide the service,
        comply with legal obligations, and resolve disputes. You may request
        access, correction, or deletion of your personal data by contacting us
        (see contact section below).
      </p>

      <h2>5. Security</h2>
      <p>
        We use industry standard security measures to protect your information.
        However, no system can be perfectly secure — if you believe your account
        has been compromised, contact support immediately.
      </p>

      <h2>6. Children</h2>
      <p>
        Our service is not intended for children under 13. We do not knowingly
        collect data from children under 13.
      </p>

      <div className="legal-contact">
        <strong>Contact</strong>
        <p>
          For privacy questions or requests, email{" "}
          <a href="mailto:support@sixerzone.com">support@sixerzone.com</a> or
          call <a href="tel:+918884184667">+91-8884184667</a>.
        </p>
      </div>
    </div>
  );
}
