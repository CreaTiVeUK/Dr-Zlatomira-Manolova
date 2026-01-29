export default function TermsPage() {
    return (
        <div className="section-padding container" style={{ maxWidth: '800px', margin: '0 auto', paddingTop: '4rem', paddingBottom: '4rem' }}>
            <h1 className="section-title" style={{ marginBottom: '2rem' }}>Terms of Use</h1>
            <p className="text-muted" style={{ marginBottom: '3rem' }}>Last updated: {new Date().toLocaleDateString()}</p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', lineHeight: '1.7', color: 'var(--text-charcoal)' }}>
                <section>
                    <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: 'var(--primary-teal)' }}>1. Agreement to Terms</h2>
                    <p>
                        These Terms of Use constitute a legally binding agreement made between you, whether personally or on behalf of an entity (&quot;you&quot;) and Zlati Pediatrics (&quot;we,&quot; &quot;us&quot; or &quot;our&quot;), concerning your access to and use of the website as well as any other media form, media channel, mobile website or mobile application related, linked, or otherwise connected thereto (collectively, the &quot;Site&quot;).
                    </p>
                    <p style={{ marginTop: '1rem' }}>
                        You agree that by accessing the Site, you have read, understood, and agree to be bound by all of these Terms of Use. IF YOU DO NOT AGREE WITH ALL OF THESE TERMS OF USE, THEN YOU ARE EXPRESSLY PROHIBITED FROM USING THE SITE AND YOU MUST DISCONTINUE USE IMMEDIATELY.
                    </p>
                </section>

                <section>
                    <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: 'var(--primary-teal)' }}>2. Medical Disclaimer</h2>
                    <p>
                        The Site provides information about our pediatric services and allows for appointment booking. However, the content on the Site is for informational purposes only and is not intended to be a substitute for professional medical advice, diagnosis, or treatment. Always seek the advice of your physician or other qualified health provider with any questions you may have regarding a medical condition.
                    </p>
                    <p style={{ marginTop: '1rem', fontWeight: 'bold' }}>
                        IF YOU THINK YOU MAY HAVE A MEDICAL EMERGENCY, CALL YOUR DOCTOR OR EMERGENCY SERVICES IMMEDIATELY.
                    </p>
                </section>

                <section>
                    <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: 'var(--primary-teal)' }}>3. Appointment Booking & Cancellations</h2>
                    <p>
                        When you book an appointment through our Site, you agree to provide accurate and complete information. We reserve the right to cancel or reschedule appointments for any reason.
                    </p>
                    <ul style={{ listStyle: 'disc', paddingLeft: '1.5rem', marginTop: '1rem' }}>
                        <li>Cancellations made less than 24 hours before the appointment time may be subject to a cancellation fee.</li>
                        <li>Repeated no-shows may result in restrictions on your ability to book future appointments.</li>
                    </ul>
                </section>

                <section>
                    <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: 'var(--primary-teal)' }}>4. Third-Party Services - SuperDoc</h2>
                    <p>
                        Our services may utilize third-party platforms such as SuperDoc for features including reviews, ratings, and potentially appointment management. Your interaction with these features is governed by SuperDoc&apos;s own Terms of Service.
                    </p>
                    <p style={{ marginTop: '0.5rem' }}>
                        We are not responsible for any content, accuracy, or opinions expressed on SuperDoc or any other third-party websites linked to or integrated with our Site.
                    </p>
                </section>

                <section>
                    <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: 'var(--primary-teal)' }}>5. User Registration</h2>
                    <p>
                        You may be required to register with the Site to access certain features (like managing appointments). You agree to keep your password confidential and will be responsible for all use of your account and password.
                    </p>
                </section>

                <section>
                    <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: 'var(--primary-teal)' }}>6. Contact Us</h2>
                    <p>
                        In order to resolve a complaint regarding the Site or to receive further information regarding use of the Site, please contact us at terms@zlati-pediatrics.com.
                    </p>
                </section>
            </div>
        </div>
    );
}
