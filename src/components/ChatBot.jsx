import { useState, useRef, useEffect } from 'react';
import '../css/chatbot.css';

export default function ChatBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { id: 1, text: 'Hi! 👋 Welcome to Beauty Point! How can I help you today?', sender: 'bot', timestamp: new Date() }
  ]);
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef(null);

  const faqs = {
    'shipping': 'We offer free shipping on orders above ₹500. Delivery usually takes 1-2 business days within metro cities.',
    'returns': 'We have a hassle-free 30-day return policy. If you\'re not satisfied, return the product in original condition for a full refund.',
    'payment': 'We accept all major payment methods including credit cards, debit cards, UPI, and digital wallets.',
    'track order': 'You can track your order in real-time. Visit the "Track" section in the navbar or check your order confirmation email.',
    'products': 'You can find our products in these ways:\n\n📦 Visit Products Page: Click "Products" in the navbar at the top\n\n🔍 Use Search: Use the search bar to find specific products\n\n📂 Browse Categories: Explore Cosmetics, Jewelry, Perfume, Watches, or Bags on the home page\n\n🏠 Home Page: Check featured and trending products on the home page',
    'account': 'Create an account to enjoy personalized shopping, faster checkout, and order history. Sign up is quick and free!',
    'discounts': 'We regularly offer discounts and promotions. Check our home page for exclusive deals and sales.',
    'contact': 'You can contact us via email at support@luxestore.com or call +91 98765 43210. Our Live Chat team is available 9 AM - 6 PM IST.',
    'help': 'I can help you with information about shipping, returns, payments, order tracking, products, account creation, discounts, and more!',
    'search': 'Use the search bar at the top to find specific products by name, brand, or category.',
    'cart': 'Add items to your cart and proceed to checkout. You can view, modify, or remove items from your cart anytime.',
    'category': 'Browse products by category: Cosmetics, Jewelry, Perfume, Watches, and Bags. Click on any category to explore.',
    'order': '1. Browse products or use the search bar\n2. Click on a product to view details\n3. Add to cart\n4. Go to cart and click "Checkout"\n5. Enter your details and choose payment method\n6. Confirm your order\n7. You\'ll receive a confirmation email with tracking details!',
  };

  const keywords = {
    'shipping|delivery|ship|free shipping': 'shipping',
    'return|refund|exchange|not satisfied': 'returns',
    'payment|pay|card|wallet|upi|credit|debit': 'payment',
    'track|tracking|order status|my order|where is my order': 'track order',
    'product|what do you sell|sell|catalog|collection': 'products',
    'account|register|signup|login|profile|create account': 'account',
    'discount|coupon|sale|promo|offer|deal': 'discounts',
    'contact|phone|email|call|message|support': 'contact',
    'help|assist|how can you help|what can you do': 'help',
    'search|find|product search|look for': 'search',
    'cart|checkout|buy|add to cart|purchase': 'cart',
    'category|filter|browse|shop|categories': 'category',
    'how to order|place order|order product|buy product|how to buy|ordering': 'order',
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const findMatchingKeyword = (userInput) => {
    const lowerInput = userInput.toLowerCase();
    for (const [keywords_str, faqKey] of Object.entries(keywords)) {
      const keywordArray = keywords_str.split('|');
      if (keywordArray.some(keyword => lowerInput.includes(keyword))) {
        return faqKey;
      }
    }
    return null;
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    // Add user message
    const userMessage = {
      id: messages.length + 1,
      text: inputValue,
      sender: 'user',
      timestamp: new Date()
    };
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');

    // Generate bot response
    setTimeout(() => {
      const matchingKeyword = findMatchingKeyword(inputValue);
      let botResponse = '';

      if (matchingKeyword && faqs[matchingKeyword]) {
        botResponse = faqs[matchingKeyword];
      } else {
        botResponse = 'I\'m not sure about that. Could you please rephrase your question? You can ask me about shipping, returns, payments, order tracking, products, account creation, discounts, or contact information. Or type "help" for more options!';
      }

      const botMessage = {
        id: messages.length + 2,
        text: botResponse,
        sender: 'bot',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, botMessage]);
    }, 500);
  };

  const handleQuickReply = (keyword) => {
    const quickMessage = {
      id: messages.length + 1,
      text: keyword,
      sender: 'user',
      timestamp: new Date()
    };
    setMessages(prev => [...prev, quickMessage]);

    setTimeout(() => {
      const botMessage = {
        id: messages.length + 2,
        text: faqs[keyword] || 'Thank you for your question!',
        sender: 'bot',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, botMessage]);
    }, 500);
  };

  return (
    <div className="chatbot-container">
      {/* Chat Toggle Button */}
      <button
        className="chatbot-toggle"
        onClick={() => setIsOpen(!isOpen)}
        title={isOpen ? 'Close chat' : 'Open chat'}
      >
        {isOpen ? '✕' : '💬'}
      </button>

      {/* Chat Widget */}
      {isOpen && (
        <div className="chatbot-widget">
          {/* Header */}
          <div className="chatbot-header">
            <div className="chatbot-header-content">
              <h3>Beauty Point Assistant</h3>
              <p className="status">🟢 Online</p>
            </div>
            <button
              className="chatbot-close-btn"
              onClick={() => setIsOpen(false)}
            >
              ✕
            </button>
          </div>

          {/* Messages */}
          <div className="chatbot-messages">
            {messages.map((msg) => (
              <div key={msg.id} className={`message message-${msg.sender}`}>
                <div className="message-content">
                  {msg.sender === 'bot' && <span className="bot-icon">🤖</span>}
                  <p>{msg.text}</p>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Replies */}
          {messages.length <= 3 && (
            <div className="quick-replies">
              <p className="quick-title">Quick questions:</p>
              <div className="quick-buttons">
                <button onClick={() => handleQuickReply('order')} className="quick-btn">🛍️ How to Order</button>
                <button onClick={() => handleQuickReply('shipping')} className="quick-btn">📦 Shipping</button>
                <button onClick={() => handleQuickReply('returns')} className="quick-btn">🔄 Returns</button>
                <button onClick={() => handleQuickReply('payment')} className="quick-btn">💳 Payment</button>
              </div>
            </div>
          )}

          {/* Input */}
          <form className="chatbot-input-form" onSubmit={handleSendMessage}>
            <input
              type="text"
              placeholder="Type your question..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              className="chatbot-input"
            />
            <button type="submit" className="chatbot-send-btn">
              Send
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
