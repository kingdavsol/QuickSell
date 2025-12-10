import React from 'react';
import { Link } from 'react-router-dom';
import './Pricing.css';

function PricingPage() {
  return (
    <div className="pricing">
      <h1>Simple, Transparent Pricing</h1>
      <div className="pricing-cards">
        <div className="pricing-card">
          <h3>Free</h3>
          <p className="price">$0/month</p>
          <ul>
            <li>5 listings/month</li>
            <li>Basic descriptions</li>
            <li>In-app ads</li>
          </ul>
          <Link to="/auth/register" className="btn btn-secondary">
            Get Started
          </Link>
        </div>
        <div className="pricing-card featured">
          <h3>Premium</h3>
          <p className="price">$4.99/month</p>
          <ul>
            <li>Unlimited listings</li>
            <li>Multi-marketplace</li>
            <li>No ads</li>
          </ul>
          <Link to="/auth/register" className="btn btn-primary">
            Start Free Trial
          </Link>
        </div>
        <div className="pricing-card">
          <h3>Premium Plus</h3>
          <p className="price">$9.99/month</p>
          <ul>
            <li>AI features</li>
            <li>Inventory management</li>
            <li>Priority support</li>
          </ul>
          <Link to="/auth/register" className="btn btn-secondary">
            Get Started
          </Link>
        </div>
      </div>
    </div>
  );
}

export default PricingPage;
