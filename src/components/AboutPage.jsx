import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const AboutPage = () => {
  const navigate = useNavigate();
  const [openFaq, setOpenFaq] = useState(null);

  const toggleFaq = (index) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const faqs = [
    {
      q: 'How does booking through Miraia work?',
      a: 'Miraia is a curated network connecting you with premier beauty and wellness sanctuaries. You can explore verified salons, choose specialized treatments, pick your preferred specialist, and book instantly. Payments are handled securely, and confirmation is sent directly via email.'
    },
    {
      q: 'Can I select a specific specialist?',
      a: 'Yes, absolutely. During the booking process, you will be presented with a list of available specialists at your selected salon, including their titles, bios, and ratings. You can also select "Any Specialist" if you prefer the earliest available slot.'
    },
    {
      q: 'What is Miraia’s cancellation policy?',
      a: 'Cancellations and rescheduling depend on individual salon policies, but generally, we require at least 24 hours notice. You can cancel or reschedule easily by logging into your account and visiting your bookings section.'
    },
    {
      q: 'How do you verify the salons on your platform?',
      a: 'We hand-select every partner salon based on strict criteria: sanitation standards, quality of products (organic, sustainable options prioritized), aesthetic atmosphere, and specialist credentials. We aim to ensure every booking is a sanctuary experience.'
    }
  ];

  return (
    <div className="bg-background text-on-surface font-body-md antialiased">

      {/* Hero Narrative */}
      <section className="relative py-20 px-margin-mobile md:px-margin-desktop bg-[#FDF2F0] border-b border-outline-variant/10">
        <div className="max-w-[1000px] mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <span className="font-label-lg text-primary uppercase tracking-[0.2em] font-semibold">Our Philosophy</span>
            <h1 className="font-display-lg text-4xl md:text-5xl text-on-surface leading-tight">Your Sanctuary, Simplified.</h1>
            <p className="font-body-lg text-body-lg text-secondary leading-relaxed">
              At Miraia, we believe that self-care is not a luxury, but a necessity for modern living. We seek to curate the finest beauty and wellness sanctuaries so that you can find peace, elegance, and skilled artistry in a single booking.
            </p>
          </div>
          <div className="relative rounded-2xl overflow-hidden h-[400px] shadow-lg border border-outline-variant/25">
            <img 
              alt="Relaxing spa sanctuary environment" 
              className="absolute inset-0 w-full h-full object-cover" 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuA7iQdyViHL-DS2hBkYJuEfKIwsLWS7l4Z_8IR9JTSBcGlU2IG_0pifzMS_E1Hb4SRkeU74LM4zVkq7OyrTP42IbxLFVYpbczz-cfXRxNs5mepMwrCfa9axva5zhzBsM8lsBNS_dGEpI1v8Ie1puUxwD4QbPNiQlwb5bgEPBJ8yES5Yc91gz3VkuI10FAN8vCKg1MTRno9YILHtdhq4ySaJw_kL0kVEfIONQyoqdrV-_r94UuA6CMrXj5MYfh5rdA9K_vZkqt7l-7Y"
            />
          </div>
        </div>
      </section>

      {/* Core Values */}
      <section className="max-w-[1200px] mx-auto px-margin-mobile md:px-margin-desktop py-20 space-y-12">
        <div className="text-center max-w-xl mx-auto space-y-2">
          <h2 className="font-headline-lg text-3xl text-on-surface">Built on Trust & Elegance</h2>
          <p className="font-body-md text-secondary">Our guiding principles dictate every partnership we make.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white p-8 rounded-xl border border-outline-variant/30 space-y-4 shadow-sm">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-primary">
              <span className="material-symbols-outlined">verified_user</span>
            </div>
            <h3 className="font-headline-md text-xl text-on-surface font-semibold">Strict Curation</h3>
            <p className="font-body-sm text-on-surface-variant leading-relaxed">
              We vet each salon rigorously. Our partners exclusively feature master artists, high-end clean products, and serene, design-forward atmospheres.
            </p>
          </div>

          <div className="bg-white p-8 rounded-xl border border-outline-variant/30 space-y-4 shadow-sm">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-primary">
              <span className="material-symbols-outlined">bolt</span>
            </div>
            <h3 className="font-headline-md text-xl text-on-surface font-semibold">Seamless Booking</h3>
            <p className="font-body-sm text-on-surface-variant leading-relaxed">
              No back-and-forth phone calls. Book from our clean interface, sync to your calendar, modify, and review appointments in one click.
            </p>
          </div>

          <div className="bg-white p-8 rounded-xl border border-outline-variant/30 space-y-4 shadow-sm">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-primary">
              <span className="material-symbols-outlined">eco</span>
            </div>
            <h3 className="font-headline-md text-xl text-on-surface font-semibold">Clean Beauty</h3>
            <p className="font-body-sm text-on-surface-variant leading-relaxed">
              We champion eco-friendly and sustainably sourced products. Our partner salons offer clean beauty alternatives that pamper both you and the earth.
            </p>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="max-w-[800px] mx-auto px-margin-mobile md:px-margin-desktop py-12 space-y-8">
        <h2 className="font-headline-lg text-3xl text-center text-on-surface">Frequently Asked Questions</h2>
        <div className="space-y-4">
          {faqs.map((faq, idx) => {
            const isOpen = openFaq === idx;
            return (
              <div 
                key={idx} 
                className="bg-white border border-outline-variant/30 rounded-xl overflow-hidden transition-all duration-300"
              >
                <button 
                  onClick={() => toggleFaq(idx)}
                  className="w-full px-6 py-5 flex justify-between items-center text-left hover:bg-surface-container-low transition-colors"
                >
                  <span className="font-label-lg text-on-surface font-semibold">{faq.q}</span>
                  <span className={`material-symbols-outlined text-primary transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}>
                    keyboard_arrow_down
                  </span>
                </button>
                <div 
                  className={`transition-all duration-300 ease-in-out overflow-hidden ${isOpen ? 'max-h-[200px] border-t border-outline-variant/10' : 'max-h-0'}`}
                >
                  <p className="px-6 py-5 font-body-sm text-on-surface-variant leading-relaxed">
                    {faq.a}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

    </div>
  );
};

export default AboutPage;
