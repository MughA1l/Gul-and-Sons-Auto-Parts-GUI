import { Link } from 'react-router-dom';
import { Wrench, Phone, Mail, MapPin, Facebook, Instagram, Twitter } from 'lucide-react';
import './Footer.css';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-main">
        <div className="container">
          <div className="footer-grid">
            {/* Brand */}
            <div className="footer-brand">
              <div className="footer-logo">
                <div className="footer-logo-icon"><Wrench size={18} /></div>
                <span>Auto<span>Parts</span> Pro</span>
              </div>
              <p className="footer-tagline">
                Pakistan's #1 auto parts e-commerce platform. Genuine and aftermarket parts
                for all major vehicle brands, delivered nationwide.
              </p>
              <div className="footer-social">
                <a href="#" className="social-btn" id="footer-facebook"><Facebook size={16} /></a>
                <a href="#" className="social-btn" id="footer-instagram"><Instagram size={16} /></a>
                <a href="#" className="social-btn" id="footer-twitter"><Twitter size={16} /></a>
              </div>
            </div>

            {/* Quick Links */}
            <div className="footer-links-col">
              <h4>Quick Links</h4>
              <ul>
                <li><Link to="/shop">All Parts</Link></li>
                <li><Link to="/categories">Categories</Link></li>
                <li><Link to="/shop?featured=true">Featured Parts</Link></li>
                <li><Link to="/shop?sort=popular">Best Sellers</Link></li>
                <li><Link to="/shop?discounted=true">Deals & Offers</Link></li>
              </ul>
            </div>

            {/* My Account */}
            <div className="footer-links-col">
              <h4>My Account</h4>
              <ul>
                <li><Link to="/profile">My Profile</Link></li>
                <li><Link to="/profile/orders">My Orders</Link></li>
                <li><Link to="/profile/wishlist">Wishlist</Link></li>
                <li><Link to="/cart">Shopping Cart</Link></li>
                <li><Link to="/register">Create Account</Link></li>
              </ul>
            </div>

            {/* Contact */}
            <div className="footer-links-col">
              <h4>Contact Us</h4>
              <div className="footer-contact-list">
                <div className="contact-item">
                  <Phone size={14} />
                  <span>0300-1234567</span>
                </div>
                <div className="contact-item">
                  <Mail size={14} />
                  <span>support@autoparts.com</span>
                </div>
                <div className="contact-item">
                  <MapPin size={14} />
                  <span>Lahore, Punjab, Pakistan</span>
                </div>
              </div>
              <div className="footer-hours">
                <strong>Business Hours</strong>
                <p>Mon - Sat: 9:00 AM - 6:00 PM</p>
                <p>Sunday: 10:00 AM - 4:00 PM</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="footer-bottom">
        <div className="container">
          <div className="footer-bottom-inner">
            <p>© 2024 AutoParts Pro. All rights reserved.</p>
            <div className="footer-bottom-links">
              <a href="#">Privacy Policy</a>
              <a href="#">Terms of Service</a>
              <a href="#">Return Policy</a>
            </div>
            <div className="footer-payment">
              <span className="payment-method">COD</span>
              <span className="payment-method">Bank Transfer</span>
              <span className="payment-method">JazzCash</span>
              <span className="payment-method">EasyPaisa</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
