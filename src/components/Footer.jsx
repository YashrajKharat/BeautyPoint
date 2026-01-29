import React from 'react';
import { Link } from 'react-router-dom';
import '../css/footer.css';

export default function Footer() {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="ultra-footer">
            <div className="footer-content">
                {/* Brand Section */}
                <div className="footer-brand">
                    <h3>Beauty Point</h3>
                    <p>
                        Experience the essence of luxury with our curated collection of premium cosmetics, jewelry, and accessories.
                        Redefining elegance for the modern you.
                    </p>
                    <div className="footer-social">
                        <a href="#" className="social-icon" title="Instagram">📸</a>
                        <a href="#" className="social-icon" title="Facebook">👍</a>
                        <a href="#" className="social-icon" title="Twitter">🐦</a>
                        <a href="#" className="social-icon" title="Pinterest">📌</a>
                    </div>
                </div>

                {/* Quick Links */}
                <div className="footer-links">
                    <h4>Quick Links</h4>
                    <ul>
                        <li><Link to="/">Home</Link></li>
                        <li><Link to="/products">All Products</Link></li>
                        <li><Link to="/cart">My Cart</Link></li>
                        <li><Link to="/login">Login / Sign Up</Link></li>
                    </ul>
                </div>

                {/* Categories */}
                <div className="footer-links">
                    <h4>Categories</h4>
                    <ul>
                        <li><Link to="/products?category=cosmetics">Cosmetics</Link></li>
                        <li><Link to="/products?category=jewelry">Jewelry</Link></li>
                        <li><Link to="/products?category=perfume">Perfume</Link></li>
                        <li><Link to="/products?category=bags">Bags</Link></li>
                    </ul>
                </div>

                {/* Contact Info */}
                <div className="footer-links footer-contact">
                    <h4>Contact Us</h4>
                    <ul>
                        <li>
                            <span className="contact-icon">📍</span>
                            <span>Beauty Point Shop,<br />kamothe Navi Mumbai,410209</span>
                        </li>
                        <li>
                            <span className="contact-icon">📞</span>
                            <span>+91 98765 43210</span>
                        </li>
                        <li>
                            <span className="contact-icon">📧</span>
                            <span>beautypoint800@gmail.com</span>
                        </li>
                        <li>
                            <span className="contact-icon">⏰</span>
                            <span>Mon - Sun: 10 AM - 10 PM</span>
                        </li>
                    </ul>
                </div>
            </div>

            {/* Bottom Bar */}
            <div className="footer-bottom">
                <p>&copy; {currentYear} Beauty Point. All rights reserved.</p>
            </div>
        </footer>
    );
}
