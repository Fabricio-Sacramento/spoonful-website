// src/components/ContactSection.jsx
import { useState } from 'react';

const ContactSection = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email || !formData.message) {
      alert('Please fill in all fields.');
      return;
    }

    setIsSubmitting(true);
    
    // TODO: Integrar com backend/API
    console.log('Form submitted:', formData);
    
    // Simulação de envio
    setTimeout(() => {
      alert(`Thank you ${formData.name}! We'll get back to you soon.`);
      setFormData({ name: '', email: '', message: '' });
      setIsSubmitting(false);
    }, 1000);
  };

  const handleScheduleMeeting = () => {
    window.open('https://calendly.com/your-link', '_blank');
  };

  return (
    <section id="contact" className="contact-section">
      <div className="contact-container">
        
        {/* Left: CTA */}
        <div className="contact-cta">
          <p className="contact-cta__text">
            Book a brief 15-minute call to talk about your project or, send us your message.
          </p>
          
          <button 
            onClick={handleScheduleMeeting}
            className="contact-cta__button"
            type="button"
          >
            <span>Schedule a meeting</span>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path 
                fillRule="evenodd" 
                clipRule="evenodd" 
                d="M12 3C12.5523 3 13 3.44772 13 4V11H20C20.5523 11 21 11.4477 21 12C21 12.5523 20.5523 13 20 13H13V20C13 20.5523 12.5523 21 12 21C11.4477 21 11 20.5523 11 20V13H4C3.44772 13 3 12.5523 3 12C3 11.4477 3.44772 11 4 11H11V4C11 3.44772 11.4477 3 12 3Z" 
                fill="currentColor"
              />
            </svg>
          </button>
        </div>

        {/* Separator */}
        <div className="contact-separator" aria-hidden="true" />

        {/* Right: Form */}
        <form className="contact-form" onSubmit={handleSubmit}>
          <div className="contact-form__field">
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Name"
              className="contact-form__input"
              required
            />
          </div>

          <div className="contact-form__field">
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Email"
              className="contact-form__input"
              required
            />
          </div>

          <div className="contact-form__field">
            <textarea
              name="message"
              value={formData.message}
              onChange={handleChange}
              placeholder="Message"
              className="contact-form__textarea"
              rows="4"
              required
            />
          </div>

          <button 
            type="submit" 
            className="contact-form__submit"
            disabled={isSubmitting}
          >
            <span>{isSubmitting ? 'Sending...' : 'Send message'}</span>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path 
                fillRule="evenodd" 
                clipRule="evenodd" 
                d="M5 12C5 11.4477 5.44772 11 6 11H16.5858L13.2929 7.70711C12.9024 7.31658 12.9024 6.68342 13.2929 6.29289C13.6834 5.90237 14.3166 5.90237 14.7071 6.29289L19.7071 11.2929C20.0976 11.6834 20.0976 12.3166 19.7071 12.7071L14.7071 17.7071C14.3166 18.0976 13.6834 18.0976 13.2929 17.7071C12.9024 17.3166 12.9024 16.6834 13.2929 16.2929L16.5858 13H6C5.44772 13 5 12.5523 5 12Z" 
                fill="currentColor"
              />
            </svg>
          </button>
        </form>
      </div>

      {/* Bottom: Let's Talk */}
      <div className="contact-headline">
        <h2 className="contact-headline__text">Let`s talk</h2>
      </div>
    </section>
  );
};

export default ContactSection;