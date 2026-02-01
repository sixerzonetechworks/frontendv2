import React from "react";
import "./LegalPages.css";

export default function RefundPolicy() {
  return (
    <div className="legal-container">
      <h1>Refund & Cancellation Policy</h1>
      <p className="meta">Last updated: 01 Feb 2026</p>

      <h2>Cancellation Windows</h2>
      <ul>
        <li>
          <strong>Full refund:</strong> Cancellations made more than 24 hours
          before the scheduled start time will receive a full refund (minus any
          payment gateway fees).
        </li>
        <li>
          <strong>Partial refund:</strong> Cancellations within 24 hours but
          more than 2 hours before start may be eligible for a partial refund
          (50%).
        </li>
        <li>
          <strong>No refund:</strong> Cancellations within 2 hours of start time
          or no-shows are not eligible for refund unless the facility cancels or
          there is a confirmed force majeure event.
        </li>
      </ul>

      <h2>Exceptional Circumstances</h2>
      <p>
        If the ground cancels or is closed for safety/weather reasons, we will
        offer a full refund or reschedule option. We will communicate such
        changes as soon as possible.
      </p>

      <h2>How to Request a Refund</h2>
      <ol>
        <li>
          Email <a href="mailto:refunds@sixerzone.com">refunds@sixerzone.com</a>{" "}
          with your booking ID, name and reason.
        </li>
        <li>
          We will review and confirm eligibility, typically within 3 business
          days.
        </li>
        <li>
          Approved refunds are processed via Razorpay and may take 3–7 business
          days to reflect depending on the bank.
        </li>
      </ol>

      <div className="legal-contact">
        <p>
          Questions? Call <a href="tel:+919036331195">+91-9036331195</a> or
          email <a href="mailto:refunds@sixerzone.com">refunds@sixerzone.com</a>
          .
        </p>
      </div>
    </div>
  );
}
