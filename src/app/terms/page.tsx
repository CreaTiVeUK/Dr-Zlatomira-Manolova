import PageIntro from "@/components/PageIntro";

export default function TermsPage() {
  const updated = new Date().toLocaleDateString();

  return (
    <div className="legal-shell">
      <div className="container">
        <div className="legal-card">
          <PageIntro
            align="left"
            eyebrow="Legal"
            title="Terms of Use"
            subtitle={`Last updated: ${updated}`}
            className="page-intro--left"
          />

          <div className="legal-meta-grid">
            <div className="legal-meta-card">
              <strong>Scope</strong>
              <p>Use of the website, patient accounts, bookings, and connected third-party services.</p>
            </div>
            <div className="legal-meta-card">
              <strong>Medical context</strong>
              <p>Site content supports care access but does not replace direct clinical judgement or emergency care.</p>
            </div>
            <div className="legal-meta-card">
              <strong>Operational rules</strong>
              <p>Appointments, cancellations, and account responsibilities are governed by the terms below.</p>
            </div>
          </div>

          <div className="legal-prose">
            <section>
              <h2>1. Agreement to Terms</h2>
              <p>
                These Terms of Use constitute a legally binding agreement made between you, whether personally or on behalf of an entity (&quot;you&quot;) and Zlati Pediatrics (&quot;we,&quot; &quot;us&quot; or &quot;our&quot;), concerning your access to and use of the website and any related media, channels, mobile websites, or applications.
              </p>
              <p>
                You agree that by accessing the Site, you have read, understood, and agree to be bound by all of these Terms of Use. If you do not agree with all of these Terms of Use, then you are expressly prohibited from using the Site and you must discontinue use immediately.
              </p>
            </section>

            <section>
              <h2>2. Medical Disclaimer</h2>
              <p>
                The Site provides information about our pediatric services and allows for appointment booking. However, the content on the Site is for informational purposes only and is not intended to be a substitute for professional medical advice, diagnosis, or treatment.
              </p>
              <p>
                If you think you may have a medical emergency, call your doctor or emergency services immediately.
              </p>
            </section>

            <section>
              <h2>3. Appointment Booking &amp; Cancellations</h2>
              <p>
                When you book an appointment through our Site, you agree to provide accurate and complete information. We reserve the right to cancel or reschedule appointments for any reason.
              </p>
              <ul>
                <li>Cancellations made less than 24 hours before the appointment time may be subject to a cancellation fee.</li>
                <li>Repeated no-shows may result in restrictions on your ability to book future appointments.</li>
              </ul>
            </section>

            <section>
              <h2>4. Third-Party Services - SuperDoc</h2>
              <p>
                Our services may utilize third-party platforms such as SuperDoc for features including reviews, ratings, and potentially appointment management. Your interaction with these features is governed by SuperDoc&apos;s own terms.
              </p>
              <p>We are not responsible for any content, accuracy, or opinions expressed on third-party websites linked to or integrated with our Site.</p>
            </section>

            <section>
              <h2>5. User Registration</h2>
              <p>
                You may be required to register with the Site to access certain features. You agree to keep your password confidential and you are responsible for all use of your account and password.
              </p>
            </section>

            <section>
              <h2>6. Contact Us</h2>
              <p>In order to resolve a complaint regarding the Site or to receive further information regarding use of the Site, please contact us at terms@zlati-pediatrics.com.</p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
