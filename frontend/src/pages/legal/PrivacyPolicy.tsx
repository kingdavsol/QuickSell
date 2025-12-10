import React from 'react';
import { Link } from 'react-router-dom';
import './Legal.css';

const PrivacyPolicy: React.FC = () => {
  return (
    <div className="legal-page">
      <div className="legal-container">
        <div className="legal-header">
          <Link to="/" className="back-link">← Back to Home</Link>
          <h1>Privacy Policy</h1>
          <p className="last-updated">Last Updated: December 1, 2025</p>
        </div>

        <div className="legal-content">
          <section>
            <h2>1. Information We Collect</h2>
            <h3>Personal Information:</h3>
            <ul>
              <li>Name, email address, phone number</li>
              <li>Payment information (processed securely by Stripe)</li>
              <li>Photos and product listings you upload</li>
              <li>Marketplace account credentials (encrypted)</li>
            </ul>
            <h3>Usage Data:</h3>
            <ul>
              <li>Device information, IP address, browser type</li>
              <li>Pages visited, features used, time spent</li>
              <li>Cookies and tracking technologies</li>
            </ul>
          </section>

          <section>
            <h2>2. How We Use Your Information</h2>
            <p>We use your information to:</p>
            <ul>
              <li>Provide and maintain our Service</li>
              <li>Generate AI-powered product descriptions</li>
              <li>Post listings to third-party marketplaces</li>
              <li>Process payments and subscriptions</li>
              <li>Send service updates and notifications</li>
              <li>Improve our AI algorithms and features</li>
              <li>Prevent fraud and ensure security</li>
            </ul>
          </section>

          <section>
            <h2>3. Information Sharing</h2>
            <p>We share your information with:</p>
            <ul>
              <li><strong>Third-Party Marketplaces:</strong> Product listings, photos, descriptions</li>
              <li><strong>Payment Processors:</strong> Stripe (for payment processing)</li>
              <li><strong>AI Services:</strong> OpenAI (for description generation)</li>
              <li><strong>Analytics:</strong> Google Analytics (anonymized data)</li>
              <li><strong>Legal Compliance:</strong> When required by law</li>
            </ul>
            <p>We never sell your personal information to third parties.</p>
          </section>

          <section>
            <h2>4. Cookies and Tracking</h2>
            <p>We use cookies for:</p>
            <ul>
              <li>Authentication and session management</li>
              <li>Preferences and settings</li>
              <li>Analytics and performance monitoring</li>
              <li>Advertising and marketing (with consent)</li>
            </ul>
            <p>See our <Link to="/legal/cookie-policy">Cookie Policy</Link> for details.</p>
          </section>

          <section>
            <h2>5. Data Security</h2>
            <p>We implement industry-standard security measures:</p>
            <ul>
              <li>SSL/TLS encryption for data transmission</li>
              <li>Encrypted storage for sensitive data</li>
              <li>Regular security audits and updates</li>
              <li>Access controls and authentication</li>
            </ul>
            <p>However, no method of transmission over the Internet is 100% secure.</p>
          </section>

          <section>
            <h2>6. Your Rights (GDPR/CCPA)</h2>
            <p>You have the right to:</p>
            <ul>
              <li><strong>Access:</strong> Request a copy of your data</li>
              <li><strong>Correction:</strong> Update inaccurate information</li>
              <li><strong>Deletion:</strong> Request account and data deletion</li>
              <li><strong>Portability:</strong> Export your data in machine-readable format</li>
              <li><strong>Objection:</strong> Opt-out of certain data processing</li>
              <li><strong>Withdraw Consent:</strong> For marketing communications</li>
            </ul>
            <p>Contact privacy@quicksell.monster to exercise your rights.</p>
          </section>

          <section>
            <h2>7. Data Retention</h2>
            <p>We retain your data:</p>
            <ul>
              <li>While your account is active</li>
              <li>As necessary to provide services</li>
              <li>To comply with legal obligations</li>
              <li>Up to 90 days after account deletion (backups)</li>
            </ul>
          </section>

          <section>
            <h2>8. Children's Privacy</h2>
            <p>
              QuickSell is not intended for users under 18. We do not knowingly collect information 
              from children. If you believe we have collected data from a child, contact us immediately.
            </p>
          </section>

          <section>
            <h2>9. International Transfers</h2>
            <p>
              Your data may be transferred to and processed in countries outside your residence. 
              We ensure appropriate safeguards are in place for international transfers.
            </p>
          </section>

          <section>
            <h2>10. Changes to Privacy Policy</h2>
            <p>
              We may update this Privacy Policy periodically. We will notify you of significant 
              changes via email or prominent notice on our Service.
            </p>
          </section>

          <section>
            <h2>11. Contact Us</h2>
            <p>
              For privacy questions or to exercise your rights:<br />
              Email: privacy@quicksell.monster<br />
              Address: [Company Address]
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
