import { Link } from 'react-router-dom';
import { Phone, Mail, MapPin, Facebook, Instagram, Music2, Youtube } from 'lucide-react';
import BrandMark from '../ui/BrandMark';
import './Footer.css';

const BRAND_NAME = 'Gull & Sons Auto Parts';
const BRAND_EMAIL = 'gullandsonsautoparts@gmail.com';
const BRAND_PHONE = '+923263133136';
const BRAND_ADDRESS_URL = 'https://share.google/N49fVrwRwYwWWqQI9';
const BRAND_FACEBOOK = 'https://www.facebook.com/share/18fsjsHVuk/';
const BRAND_INSTAGRAM = 'https://www.instagram.com/gullautoparts.pk?igsh=ODA5c25vb2V4ZXVx';
const BRAND_TIKTOK = 'https://www.tiktok.com/@gulautoparts?_r=1&_t=ZS-96P2B7Pm74H';
const BRAND_YOUTUBE = 'https://youtube.com/@gullandsonsautoparts?si=47XXV_xx466NHFn7';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-main">
        <div className="container">
          <div className="footer-grid">
            {/* Brand */}
            <div className="footer-brand">
              <div className="footer-logo">
                <div className="footer-logo-icon"><BrandMark className="brand-mark" /></div>
                <span><span className="footer-brand-main">Gull &amp; Sons</span><span className="footer-brand-sub">Auto Parts</span></span>
              </div>
              <p className="footer-tagline">
                Genuine auto parts with multiple images, product videos, and delivery details
                for every listing.
              </p>
              <div className="footer-social">
                <a href={BRAND_FACEBOOK} target="_blank" rel="noreferrer" className="social-btn" id="footer-facebook"><Facebook size={16} /></a>
                <a href={BRAND_INSTAGRAM} target="_blank" rel="noreferrer" className="social-btn" id="footer-instagram"><Instagram size={16} /></a>
                <a href={BRAND_TIKTOK} target="_blank" rel="noreferrer" className="social-btn" id="footer-tiktok"><Music2 size={16} /></a>
                <a href={BRAND_YOUTUBE} target="_blank" rel="noreferrer" className="social-btn" id="footer-twitter"><Youtube size={16} /></a>
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
                  <a href={`tel:${BRAND_PHONE}`}>{BRAND_PHONE}</a>
                </div>
                <div className="contact-item">
                  <Mail size={14} />
                  <a href={`mailto:${BRAND_EMAIL}`}>{BRAND_EMAIL}</a>
                </div>
                <div className="contact-item">
                  <MapPin size={14} />
                  <a href={BRAND_ADDRESS_URL} target="_blank" rel="noreferrer">View address on map</a>
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
            <p>© 2024 {BRAND_NAME}. All rights reserved.</p>
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
