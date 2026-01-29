export default function PrivacyPage() {
    return (
        <div className="section-padding container" style={{ maxWidth: '800px', margin: '0 auto', paddingTop: '4rem', paddingBottom: '4rem' }}>
            <h1 className="section-title" style={{ marginBottom: '2rem' }}>Privacy Policy</h1>
            <p className="text-muted" style={{ marginBottom: '3rem' }}>Last updated: {new Date().toLocaleDateString()}</p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', lineHeight: '1.7', color: 'var(--text-charcoal)' }}>
                <section>
                    <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: 'var(--primary-teal)' }}>1. Introduction</h2>
                    <p>
                        Welcome to Zlati Pediatrics (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;). We are committed to protecting your personal information and your right to privacy.
                        If you have any questions or concerns about our policy, or our practices with regards to your personal information, please contact us.
                    </p>
                </section>

                <section>
                    <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: 'var(--primary-teal)' }}>2. Information We Collect</h2>
                    <p>
                        We collect personal information that you voluntarily provide to us when you register on the website, express an interest in obtaining information about us or our products and services, when you participate in activities on the website, or otherwise when you contact us.
                    </p>
                    <ul style={{ listStyle: 'disc', paddingLeft: '1.5rem', marginTop: '1rem' }}>
                        <li>Names</li>
                        <li>Phone numbers</li>
                        <li>Email addresses</li>
                        <li>Contact preferences</li>
                        <li>Billing addresses</li>
                        <li>Debit/credit card numbers (processed securely via payment providers)</li>
                    </ul>
                </section>

                <section>
                    <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: 'var(--primary-teal)' }}>3. How We Use Your Information</h2>
                    <p>
                        We use personal information collected via our website for a variety of business purposes described below. We process your personal information for these purposes in reliance on our legitimate business interests, in order to enter into or perform a contract with you, with your consent, and/or for compliance with our legal obligations.
                    </p>
                    <ul style={{ listStyle: 'disc', paddingLeft: '1.5rem', marginTop: '1rem' }}>
                        <li>To facilitate account creation and logon process.</li>
                        <li>To send you marketing and promotional communications.</li>
                        <li>To send administrative information to you.</li>
                        <li>To fulfill and manage your orders/appointments.</li>
                    </ul>
                </section>

                <section>
                    <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: 'var(--primary-teal)' }}>4. Integration with Third Parties - SuperDoc</h2>
                    <p>
                        We may integrate or use services from <strong>SuperDoc.bg</strong> (a platform owned by Superdoc AD) to facilitate appointment scheduling or to display ratings and reviews.
                    </p>
                    <p style={{ marginTop: '0.5rem' }}>
                        When you use these features, some of your data (such as booking details or review content) may be processed by SuperDoc in accordance with their <a href="https://superdoc.bg/privacy" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--primary-teal)', textDecoration: 'underline' }}>Privacy Policy</a>. We ensure that any data transfer complies with applicable data protection laws.
                    </p>
                </section>

                <section>
                    <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: 'var(--primary-teal)' }}>5. Your Privacy Rights (GDPR)</h2>
                    <p>
                        If you are a resident of the European Economic Area (EEA) or United Kingdom (UK), you have certain rights under applicable data protection laws. These may include the right (i) to request access and obtain a copy of your personal information, (ii) to request rectification or erasure; (iii) to restrict the processing of your personal information; and (iv) if applicable, to data portability.
                    </p>
                </section>

                <section>
                    <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: 'var(--primary-teal)' }}>6. Contact Us</h2>
                    <p>
                        If you have questions or comments about this policy, you may email us at privacy@zlati-pediatrics.com.
                    </p>
                </section>
            </div>
        </div>
    );
}
