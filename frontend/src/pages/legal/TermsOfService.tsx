import React from 'react';
import { Link } from 'react-router-dom';
import './Legal.css';

const TermsOfService: React.FC = () => {
  return (
    <div className="legal-page">
      <div className="legal-container">
        <div className="legal-header">
          <Link to="/" className="back-link">← Back to Home</Link>
          <h1>Terms of Service</h1>
          <p className="last-updated">Last Updated: December 1, 2025</p>
        </div>

        <div className="legal-content">
          <section>
            <h2>1. Agreement to Terms</h2>
            <p>
              By accessing or using QuickSell.monster ("Service"), you agree to be bound by these Terms of Service. 
              If you disagree with any part of these terms, you may not access the Service.
            </p>
          </section>

          <section>
            <h2>2. Service Description</h2>
            <p>
              QuickSell.monster is a photo-to-marketplace selling platform that enables users to:
            </p>
            <ul>
              <li>Upload photos of items for sale</li>
              <li>Generate AI-powered product descriptions and pricing suggestions</li>
              <li>Automatically post listings to 20+ online marketplaces</li>
              <li>Manage inventory and sales across multiple platforms</li>
            </ul>
          </section>

          <section>
            <h2>3. User Accounts</h2>
            <p>You must create an account to use our Service. You agree to:</p>
            <ul>
              <li>Provide accurate, current, and complete information</li>
              <li>Maintain the security of your password</li>
              <li>Accept responsibility for all activities under your account</li>
              <li>Notify us immediately of unauthorized access</li>
            </ul>
          </section>

          <section>
            <h2>4. Subscription and Payment</h2>
            <p>
              QuickSell offers both free and paid subscription plans. Paid subscriptions are billed monthly or annually 
              and automatically renew unless cancelled. You agree to pay all fees and charges incurred.
            </p>
            <p><strong>Refund Policy:</strong> No refunds for partial months. You may cancel at any time.</p>
          </section>

          <section>
            <h2>5. AI-Generated Content</h2>
            <p>
              Our AI generates product descriptions and pricing suggestions. You acknowledge that:
            </p>
            <ul>
              <li>AI-generated content may contain errors or inaccuracies</li>
              <li>You are responsible for reviewing and editing all listings before posting</li>
              <li>QuickSell is not liable for losses from AI-generated content</li>
            </ul>
          </section>

          <section>
            <h2>6. Marketplace Integration</h2>
            <p>
              QuickSell posts your listings to third-party marketplaces (eBay, Facebook Marketplace, etc.). 
              You must comply with each marketplace's terms of service and policies.
            </p>
          </section>

          <section>
            <h2>7. Prohibited Activities</h2>
            <p>You may not use QuickSell to:</p>
            <ul>
              <li>Sell illegal, counterfeit, or stolen items</li>
              <li>Post misleading or fraudulent listings</li>
              <li>Violate intellectual property rights</li>
              <li>Spam or harass other users</li>
              <li>Attempt to circumvent security measures</li>
            </ul>
          </section>

          <section>
            <h2>8. Intellectual Property</h2>
            <p>
              You retain ownership of photos and content you upload. By using our Service, you grant QuickSell 
              a license to use, store, and display your content to provide the Service.
            </p>
          </section>

          <section>
            <h2>9. Limitation of Liability</h2>
            <p>
              QuickSell is provided "as is" without warranties. We are not liable for:
            </p>
            <ul>
              <li>Marketplace listing errors or failures</li>
              <li>Lost sales or revenue</li>
              <li>Data loss or service interruptions</li>
              <li>Third-party marketplace actions</li>
            </ul>
          </section>

          <section>
            <h2>10. Termination</h2>
            <p>
              We may suspend or terminate your account for violations of these terms. 
              You may cancel your account at any time through account settings.
            </p>
          </section>

          <section>
            <h2>11. Changes to Terms</h2>
            <p>
              We reserve the right to modify these terms at any time. Continued use after changes 
              constitutes acceptance of new terms.
            </p>
          </section>

          <section>
            <h2>12. Contact Information</h2>
            <p>
              For questions about these Terms, contact us at:<br />
              Email: legal@quicksell.monster<br />
              Address: [Company Address]
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default TermsOfService;
