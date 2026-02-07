import { useState, useContext, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import { userAPI } from '../services/api';
import { useNavigate, useLocation } from 'react-router-dom';
import '../css/profile.css'; // We'll create this next

export default function Profile() {
    const { user, login } = useContext(AuthContext); // login is needed to update context
    const navigate = useNavigate();
    const location = useLocation();
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        address: {
            street: '',
            city: '',
            state: '',
            zipCode: '',
            country: ''
        }
    });
    const [message, setMessage] = useState(null);

    // Check if redirected from checkout with specific requirement
    const isPhoneRequired = location.state?.requirePhone;

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            setLoading(true);
            const { data } = await userAPI.getProfile();
            setFormData({
                name: data.name || '',
                email: data.email || '',
                phone: data.phone || '',
                address: data.address || {
                    street: '',
                    city: '',
                    state: '',
                    zipCode: '',
                    country: ''
                }
            });
        } catch (error) {
            console.error('Error fetching profile:', error);
            setMessage({ type: 'error', text: 'Failed to load profile data.' });
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name.includes('.')) {
            const [parent, child] = name.split('.');
            setFormData(prev => ({
                ...prev,
                [parent]: {
                    ...prev[parent],
                    [child]: value
                }
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: value
            }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setUpdating(true);
        setMessage(null);

        // Basic Validation
        if (!formData.phone || formData.phone.length < 10) {
            setMessage({ type: 'error', text: 'Please enter a valid phone number.' });
            setUpdating(false);
            return;
        }

        try {
            const { data } = await userAPI.updateProfile(formData);
            // Update local storage/context if needed, although context usually updates on refresh or manual call
            // Ideally AuthContext should expose a way to update local user state without full login
            // but for now, the backend is updated.

            setMessage({ type: 'success', text: 'Profile updated successfully!' });

            if (isPhoneRequired) {
                setTimeout(() => {
                    navigate('/checkout');
                }, 1500);
            }
        } catch (error) {
            console.error('Error updating profile:', error);
            setMessage({ type: 'error', text: error.response?.data?.message || 'Failed to update profile.' });
        } finally {
            setUpdating(false);
        }
    };

    if (loading) {
        return <div className="profile-container loading">Loading...</div>;
    }

    return (
        <div className="profile-page">
            <div className="profile-card">
                <div className="profile-header">
                    <h1>👤 User Profile</h1>
                    <p>Manage your account details and preferences</p>
                </div>

                {isPhoneRequired && !formData.phone && (
                    <div className="alert-warning">
                        ⚠️ <strong>Action Required:</strong> Please add your phone number to proceed with checkout.
                    </div>
                )}

                {message && (
                    <div className={`alert-${message.type}`}>
                        {message.type === 'success' ? '✅' : '❌'} {message.text}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="profile-form">
                    <div className="form-group">
                        <label>Full Name</label>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            className="form-input"
                        />
                    </div>

                    <div className="form-group">
                        <label>Email Address</label>
                        <input
                            type="email"
                            value={formData.email}
                            disabled
                            className="form-input disabled"
                        />
                        <small>Email cannot be changed</small>
                    </div>

                    <div className="form-group">
                        <label>Phone Number <span className="required">*</span></label>
                        <div className="phone-input-wrapper">
                            <span className="phone-prefix">📞</span>
                            <input
                                type="tel"
                                name="phone"
                                value={formData.phone}
                                onChange={handleChange}
                                placeholder="Enter your phone number"
                                className={`form-input ${!formData.phone ? 'highlight-required' : ''}`}
                                required
                            />
                        </div>
                    </div>

                    <div className="form-divider">
                        <span>Shipping Address</span>
                    </div>

                    <div className="form-group">
                        <label>Street Address</label>
                        <input
                            type="text"
                            name="address.street"
                            value={formData.address?.street}
                            onChange={handleChange}
                            className="form-input"
                        />
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label>City</label>
                            <input
                                type="text"
                                name="address.city"
                                value={formData.address?.city}
                                onChange={handleChange}
                                className="form-input"
                            />
                        </div>
                        <div className="form-group">
                            <label>State</label>
                            <input
                                type="text"
                                name="address.state"
                                value={formData.address?.state}
                                onChange={handleChange}
                                className="form-input"
                            />
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label>Zip Code</label>
                            <input
                                type="text"
                                name="address.zipCode"
                                value={formData.address?.zipCode}
                                onChange={handleChange}
                                className="form-input"
                            />
                        </div>
                        <div className="form-group">
                            <label>Country</label>
                            <input
                                type="text"
                                name="address.country"
                                value={formData.address?.country}
                                onChange={handleChange}
                                className="form-input"
                            />
                        </div>
                    </div>

                    <button type="submit" className="save-btn" disabled={updating}>
                        {updating ? 'Saving...' : 'Save Changes'}
                    </button>
                </form>
            </div>
        </div>
    );
}
