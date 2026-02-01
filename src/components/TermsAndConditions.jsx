import React from "react";
import "./LegalPages.css";

export default function TermsAndConditions() {
  return (
    <div className="legal-container">
      <h1>Terms & Conditions</h1>
      <p className="meta">Last updated: 01 Feb 2026</p>

      <h2>1. Booking & Payment</h2>
      <p>
        All bookings are subject to availability. When you make a booking you
        agree to pay the listed fees. Payments are processed by Razorpay — you
        also agree to Razorpay's terms and privacy policy.
      </p>

      <h2>2. Confirmation</h2>
      <p>
        Bookings are confirmed once payment is successfully processed. You will
        receive a booking confirmation with a booking ID which you should keep
        for reference.
      </p>

      <h2>3. User Responsibilities</h2>
      <ul>
        <li>Arrive on time and follow the facility rules.</li>
        <li>Keep the premises clean and respect staff and other users.</li>
        <li>Supply accurate contact details when booking.</li>
      </ul>

      <h2>4. Cancellation & Refunds</h2>
      <p>
        Refunds and cancellations are handled under our{" "}
        <a href="/refund-policy">Refund & Cancellation Policy</a>. Please follow
        the instructions there to request a refund.
      </p>

      <h2>5. Limitation of Liability</h2>
      <p>
        To the maximum extent permitted by law, SixerZone Turf is not liable for
        indirect, incidental or consequential damages arising from use of our
        service or inability to use it.
      </p>

      <h2>6. Intellectual Property</h2>
      <p>
        All content on the Site is owned or licensed by SixerZone Turf and is
        protected by copyright and other intellectual property laws.
      </p>

      <h2>7. Governing Law</h2>
      <p>
        These Terms are governed by the laws of the jurisdiction where SixerZone
        operates.
      </p>

      <div className="legal-contact">
        <p>
          Questions about these Terms? Contact{" "}
          <a href="mailto:legal@sixerzone.com">legal@sixerzone.com</a>.
        </p>
      </div>
    </div>
  );
}
