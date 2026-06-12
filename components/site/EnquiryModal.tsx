"use client";

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Ornament } from './Ornament';
import { enquiryApi, EnquiryPayload } from '@/lib/api/enquiry';

const COUNTRY_CONFIG = {
  "+91": { name: "IN (+91)", length: 10, placeholder: "10-digit number" },
  "+1": { name: "US/CA (+1)", length: 10, placeholder: "10-digit number" },
  "+44": { name: "UK (+44)", length: 10, placeholder: "10-digit number" },
  "+61": { name: "AU (+61)", length: 9, placeholder: "9-digit number" },
  "+971": { name: "UAE (+971)", length: 9, placeholder: "9-digit number" },
};
type CountryCode = keyof typeof COUNTRY_CONFIG;

interface EnquiryModalProps {
  isOpen: boolean;
  onClose: () => void;
  enquiryType: string;
}

export function EnquiryModal({ isOpen, onClose, enquiryType }: EnquiryModalProps) {
  const [mounted, setMounted] = useState(false);
  const [show, setShow] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    date: '',
    message: ''
  });
  const [countryCode, setCountryCode] = useState<CountryCode>("+91");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isOpen) {
      setShow(true);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
      const timer = setTimeout(() => {
        setShow(false);
        setSuccess(false);
        setError('');
      }, 300);
      return () => clearTimeout(timer);
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!mounted || (!isOpen && !show)) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, phone: e.target.value.replace(/\D/g, '') });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const payload: EnquiryPayload = {
        ...formData,
        phone: `${countryCode}${formData.phone}`,
        enquiry_type: enquiryType,
      };
      const res = await enquiryApi.submitEnquiry(payload);
      if (res.success) {
        setSuccess(true);
      } else {
        setError(res.message || 'Failed to submit enquiry.');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred while submitting.');
    } finally {
      setLoading(false);
    }
  };

  const modalContent = (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
      <div 
        className={`absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0'}`} 
        onClick={onClose} 
      />
      
      <div className={`relative bg-[var(--card)] border border-[var(--gold)]/40 shadow-[var(--shadow-royal)] p-6 md:p-8 max-w-lg w-full max-h-full overflow-y-auto rounded-sm transition-all duration-300 transform flex flex-col ${isOpen ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-8 scale-95'}`} data-lenis-prevent="true">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-[var(--maroon)] hover:text-[var(--gold)] transition-colors"
          aria-label="Close modal"
          
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
        </button>

        <div className="text-center mb-6">
          <Ornament className="mx-auto w-16 text-[var(--gold)] mb-4" />
          <p className="eyebrow text-[var(--maroon)]">Enquiry</p>
          <h2 className="text-display text-3xl mt-2 text-[var(--maroon)]">{enquiryType}</h2>
        </div>

        {success ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-[var(--gold)]/20 text-[var(--gold)] rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
            </div>
            <h3 className="text-xl font-serif text-[var(--maroon)] mb-2">Enquiry Sent</h3>
            <p className="text-sm text-muted-foreground">Thank you for your interest. Our royal staff will contact you shortly.</p>
            <button 
              onClick={onClose}
              className="mt-6 px-6 py-2 bg-[var(--maroon)] text-parchment text-xs uppercase tracking-[0.3em] hover:bg-[var(--maroon-deep)] transition-colors"
            >
              Close
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 bg-red-50/50 border border-red-200/50 text-red-600 text-sm rounded">
                {error}
              </div>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs uppercase tracking-wider text-[var(--maroon)] mb-1">Name</label>
                <input required type="text" name="name" value={formData.name} onChange={handleChange} className="w-full bg-transparent border-b border-[var(--gold)]/40 p-2 text-sm focus:border-[var(--gold)] focus:outline-none transition-colors" />
              </div>
              <div>
                <label className="block text-xs uppercase tracking-wider text-[var(--maroon)] mb-1">Email</label>
                <input required type="email" name="email" pattern="^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$" title="Please enter a valid email address with @ and a domain (e.g., .com)" value={formData.email} onChange={handleChange} className="w-full bg-transparent border-b border-[var(--gold)]/40 p-2 text-sm focus:border-[var(--gold)] focus:outline-none transition-colors" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs uppercase tracking-wider text-[var(--maroon)] mb-1">Phone</label>
                <div className="flex gap-2">
                  <select 
                    value={countryCode} 
                    onChange={(e) => {
                      setCountryCode(e.target.value as CountryCode);
                      setFormData({ ...formData, phone: "" });
                    }}
                    className="bg-transparent border-b border-[var(--gold)]/40 p-2 focus:border-[var(--gold)] focus:outline-none transition-colors w-[110px] text-sm"
                  >
                    {Object.entries(COUNTRY_CONFIG).map(([code, config]) => (
                      <option key={code} value={code} className="bg-card text-foreground">{config.name}</option>
                    ))}
                  </select>
                  <input 
                    required 
                    type="tel" 
                    name="phone" 
                    pattern={`[0-9]{${COUNTRY_CONFIG[countryCode].length}}`} 
                    minLength={COUNTRY_CONFIG[countryCode].length} 
                    maxLength={COUNTRY_CONFIG[countryCode].length} 
                    title={`Please enter a valid ${COUNTRY_CONFIG[countryCode].length}-digit phone number`} 
                    value={formData.phone} 
                    onChange={handlePhoneChange} 
                    className="w-full bg-transparent border-b border-[var(--gold)]/40 p-2 text-sm focus:border-[var(--gold)] focus:outline-none transition-colors" 
                    placeholder={COUNTRY_CONFIG[countryCode].placeholder} 
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs uppercase tracking-wider text-[var(--maroon)] mb-1">Preferred Date <span className="text-xs opacity-50 lowercase tracking-normal">(optional)</span></label>
                <input type="date" name="date" value={formData.date} onChange={handleChange} className="w-full bg-transparent border-b border-[var(--gold)]/40 p-2 text-sm focus:border-[var(--gold)] focus:outline-none transition-colors" />
              </div>
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider text-[var(--maroon)] mb-1">Message</label>
              <textarea required rows={3} name="message" value={formData.message} onChange={handleChange} className="w-full bg-transparent border border-[var(--gold)]/40 p-2 text-sm focus:border-[var(--gold)] focus:outline-none transition-colors resize-none" />
            </div>

            <div className="pt-4 text-center">
              <button 
                type="submit" 
                disabled={loading}
                className="w-full px-6 py-3 bg-[var(--maroon)] text-parchment text-xs uppercase tracking-[0.3em] hover:bg-[var(--maroon-deep)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-[var(--shadow-gold)]"
              >
                {loading ? 'Sending...' : 'Submit Enquiry'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
