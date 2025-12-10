import React from 'react';
import { Link } from 'react-router-dom';
import './Legal.css';

const CookiePolicy: React.FC = () => {
  return (
    <div className="legal-page">
      <div className="legal-container">
        <div className="legal-header">
          <Link to="/" className="back-link">← Back to Home</Link>
          <h1>Cookie Policy</h1>
          <p className="last-updated">Last Updated: December 1, 2025</p>
        </div>

        <div className="legal-content">
          <section>
            <h2>1. What Are Cookies?</h2>
            <p>
              Cookies are small text files stored on your device when you visit our website. 
              They help us provide a better experience by remembering your preferences and analyzing usage.
            </p>
          </section>

          <section>
            <h2>2. Types of Cookies We Use</h2>
            
            <h3>Essential Cookies (Always Active)</h3>
            <p>Required for the website to function properly. Cannot be disabled.</p>
            <ul>
              <li><strong>Session Cookie:</strong> Maintains your login session</li>
              <li><strong>CSRF Token:</strong> Prevents security attacks</li>
              <li><strong>Load Balancer:</strong> Distributes traffic efficiently</li>
            </ul>

            <h3>Functional Cookies (Optional)</h3>
            <p>Remember your preferences and choices.</p>
            <ul>
              <li><strong>Language Preference:</strong> Saves your language selection</li>
              <li><strong>Theme Settings:</strong> Remembers dark/light mode</li>
              <li><strong>Cookie Consent:</strong> Stores your cookie preferences</li>
            </ul>

            <h3>Analytics Cookies (Optional)</h3>
            <p>Help us understand how visitors use our site.</p>
            <ul>
              <li><strong>Google Analytics:</strong> Page views, bounce rate, session duration</li>
              <li><strong>Performance Monitoring:</strong> Loading times, errors</li>
            </ul>

            <h3>Marketing Cookies (Optional)</h3>
            <p>Used for personalized advertising and retargeting.</p>
            <ul>
              <li><strong>Facebook Pixel:</strong> Ad performance tracking</li>
              <li><strong>Google Ads:</strong> Conversion tracking</li>
            </ul>
          </section>

          <section>
            <h2>3. Third-Party Cookies</h2>
            <p>Some cookies are set by third-party services:</p>
            <ul>
              <li><strong>Stripe:</strong> Payment processing</li>
              <li><strong>OpenAI:</strong> AI-powered features</li>
              <li><strong>Google:</strong> Analytics and advertising</li>
              <li><strong>Facebook:</strong> Social features and ads</li>
            </ul>
          </section>

          <section>
            <h2>4. Cookie Duration</h2>
            <ul>
              <li><strong>Session Cookies:</strong> Deleted when you close your browser</li>
              <li><strong>Persistent Cookies:</strong> Remain for a set period (30 days to 2 years)</li>
            </ul>
          </section>

          <section>
            <h2>5. Managing Cookies</h2>
            
            <h3>Browser Settings</h3>
            <p>You can control cookies through your browser:</p>
            <ul>
              <li><strong>Chrome:</strong> Settings → Privacy and Security → Cookies</li>
              <li><strong>Firefox:</strong> Options → Privacy & Security → Cookies</li>
              <li><strong>Safari:</strong> Preferences → Privacy → Cookies</li>
              <li><strong>Edge:</strong> Settings → Privacy → Cookies</li>
            </ul>

            <h3>Opt-Out Links</h3>
            <ul>
              <li><a href="https://tools.google.com/dlpage/gaoptout" target="_blank" rel="noopener noreferrer">
                Google Analytics Opt-Out
              </a></li>
              <li><a href="https://www.facebook.com/policies/cookies/" target="_blank" rel="noopener noreferrer">
                Facebook Cookie Settings
              </a></li>
            </ul>
          </section>

          <section>
            <h2>6. Impact of Disabling Cookies</h2>
            <p>Disabling cookies may affect:</p>
            <ul>
              <li>Login functionality</li>
              <li>Saved preferences</li>
              <li>Shopping cart features</li>
              <li>Personalized content</li>
            </ul>
          </section>

          <section>
            <h2>7. Updates to This Policy</h2>
            <p>
              We may update this Cookie Policy to reflect changes in technology or legal requirements. 
              Check this page regularly for updates.
            </p>
          </section>

          <section>
            <h2>8. Contact Us</h2>
            <p>
              Questions about our cookie usage?<br />
              Email: privacy@quicksell.monster
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default CookiePolicy;
