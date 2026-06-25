import React from 'react';
import { useNavigate } from 'react-router-dom';

const Footer = ({ variant = 'full' }) => {
  const navigate = useNavigate();

  if (variant === 'simple') {
    return (
      <footer className="w-full bg-secondary-container border-t border-outline-variant/20 py-6">
        <div className="max-w-[1200px] mx-auto px-margin-mobile md:px-margin-desktop text-center">
          <p className="font-body-sm text-body-sm text-on-secondary-fixed-variant opacity-80">
            © 2025 AURA Wellness & Beauty. All rights reserved.
          </p>
        </div>
      </footer>
    );
  }

  // Full Footer (default)
  return (
    <footer className="w-full bg-secondary-container border-t border-outline-variant/20">
      {/* Desktop Footer */}
      <div className="hidden md:block max-w-[1200px] mx-auto px-margin-desktop py-12 flex justify-between items-start gap-12">
        <div className="flex flex-col gap-4 max-w-sm">
          <span 
            className="font-display-lg text-headline-lg text-primary cursor-pointer"
            onClick={() => navigate('/')}
          >
            AURA
          </span>
          <p className="font-body-sm text-body-sm text-on-secondary-fixed-variant">
            Curating modern elegance for your beauty journey.
          </p>
          <div className="flex gap-4 mt-2">
            <a 
              className="text-on-secondary-fixed-variant hover:text-primary transition-colors focus:outline-none focus:ring-2 focus:ring-primary-container rounded-full p-1" 
              href="#"
              aria-label="Instagram"
            >
              <span className="material-symbols-outlined text-[20px] block">photo_camera</span>
            </a>
            <a 
              className="text-on-secondary-fixed-variant hover:text-primary transition-colors focus:outline-none focus:ring-2 focus:ring-primary-container rounded-full p-1" 
              href="#"
              aria-label="Email"
            >
              <span className="material-symbols-outlined text-[20px] block">alternate_email</span>
            </a>
          </div>
        </div>

        <div className="flex gap-16 font-body-sm text-body-sm">
          <div className="flex flex-col gap-3">
            <span className="text-on-secondary-container font-bold mb-1">Company</span>
            <button className="text-left text-on-secondary-fixed-variant hover:text-primary transition-colors focus:outline-none focus:ring-2 focus:ring-primary-container w-fit" onClick={() => navigate('/about')}>About Us</button>
            <button className="text-left text-on-secondary-fixed-variant hover:text-primary transition-colors focus:outline-none focus:ring-2 focus:ring-primary-container w-fit" onClick={() => navigate('/search')}>Find Salons</button>
            <button className="text-left text-on-secondary-fixed-variant hover:text-primary transition-colors focus:outline-none focus:ring-2 focus:ring-primary-container w-fit" onClick={() => navigate('/owner/portal')}>Salon Partnerships</button>
          </div>
          <div className="flex flex-col gap-3">
            <span className="text-on-secondary-container font-bold mb-1">Legal</span>
            <a className="text-on-secondary-fixed-variant hover:text-primary transition-colors focus:outline-none focus:ring-2 focus:ring-primary-container w-fit" href="#">Privacy Policy</a>
            <a className="text-on-secondary-fixed-variant hover:text-primary transition-colors focus:outline-none focus:ring-2 focus:ring-primary-container w-fit" href="#">Terms of Service</a>
          </div>
          <div className="flex flex-col gap-3">
            <span className="text-on-secondary-container font-bold mb-1">Stay Connected</span>
            <a className="text-on-secondary-fixed-variant hover:text-primary transition-colors focus:outline-none focus:ring-2 focus:ring-primary-container w-fit" href="#">Newsletter</a>
          </div>
        </div>
      </div>

      {/* Mobile Footer */}
      <div className="md:hidden block max-w-[1200px] mx-auto px-margin-mobile py-8 flex flex-col gap-8">
        <div>
          <div 
            className="font-display-lg text-headline-lg text-primary mb-2 cursor-pointer"
            onClick={() => navigate('/')}
          >
            AURA
          </div>
          <p className="font-body-sm text-body-sm text-on-secondary-container opacity-90 mb-4">
            Curating modern elegance for your beauty journey.
          </p>
        </div>
        
        <div className="grid grid-cols-2 gap-6 font-body-sm text-body-sm">
          <div className="flex flex-col gap-2">
            <span className="text-on-secondary-container font-bold mb-1">Company</span>
            <button className="text-left text-on-secondary-fixed-variant hover:text-primary py-1" onClick={() => navigate('/about')}>About Us</button>
            <button className="text-left text-on-secondary-fixed-variant hover:text-primary py-1" onClick={() => navigate('/search')}>Find Salons</button>
            <button className="text-left text-on-secondary-fixed-variant hover:text-primary py-1" onClick={() => navigate('/owner/portal')}>Partnerships</button>
          </div>
          <div className="flex flex-col gap-2">
            <span className="text-on-secondary-container font-bold mb-1">Legal</span>
            <a className="text-left text-on-secondary-fixed-variant hover:text-primary py-1" href="#">Privacy</a>
            <a className="text-left text-on-secondary-fixed-variant hover:text-primary py-1" href="#">Terms</a>
          </div>
        </div>

        <div className="flex gap-4 border-t border-outline-variant/10 pt-4">
          <a className="text-on-secondary-fixed-variant hover:text-primary" href="#" aria-label="Instagram">
            <span className="material-symbols-outlined text-[20px] block">photo_camera</span>
          </a>
          <a className="text-on-secondary-fixed-variant hover:text-primary" href="#" aria-label="Email">
            <span className="material-symbols-outlined text-[20px] block">alternate_email</span>
          </a>
        </div>
      </div>

      {/* Copyright Line */}
      <div className="max-w-[1200px] mx-auto px-margin-mobile md:px-margin-desktop pb-8 border-t border-outline-variant/10 pt-4">
        <p className="font-body-sm text-body-sm text-on-secondary-fixed-variant opacity-75 text-center md:text-left">
          © 2025 AURA Wellness & Beauty. All rights reserved.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
