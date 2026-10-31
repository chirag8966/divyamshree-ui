import React, { useState } from 'react';
import { HelpCircle, ChevronDown, Sparkles } from 'lucide-react';

const faqData = [
  {
    id: 'tea-origins',
    question: 'What goes into Divyam Shree masala tea?',
    answer: 'Assam CTC leaves and our family\'s chai masala, in the proportions our grandfather settled on at the stall. Boil it with milk, and let it stand a minute before you pour.'
  },
  {
    id: 'coffee-prep',
    question: 'How do you prepare Divyam Shree Cold Coffee Instant Mix?',
    answer: 'Add 2 tablespoons to a glass of chilled milk, about 200 ml, and shake hard for 15 to 20 seconds, or blend it. Pour over ice and drink cold. Use a little less milk if you like it thicker.'
  },
  {
    id: 'jeerawan-uses',
    question: 'What is Jeerawan Masala and what do you put it on?',
    answer: 'It is the masala our family has kept on the table for years: jeera, saunf, dhaniya, ajwain, tejpatta, kala namak, nork, lal mirch, haldi and amchur, ground together. Sprinkle it over poha, snacks, fruit or chaat.'
  },
  {
    id: 'amazon-shipping',
    question: 'Where can I buy Divyam Shree products online with fast delivery?',
    answer: 'All three are on Amazon.in, sold by us. Prime orders ship free and usually reach most Indian cities within one to four days, with Amazon\'s own returns cover if something goes wrong.'
  },
  {
    id: 'bulk-b2b',
    question: 'Does Divyam Shree offer corporate gifting and wholesale B2B supply?',
    answer: 'Yes. We pack festive gift boxes for companies, bulk canisters for cafés and hotels, and wholesale quantities for distributors across India, with GST invoicing. Tell us the quantity you need on WhatsApp at +91 7566636650 and we will quote you.'
  }
];

const FAQ = () => {
  const [openIndex, setOpenIndex] = useState(0);

  const toggleAccordion = (index) => {
    setOpenIndex((prev) => (prev === index ? -1 : index));
  };

  return (
    <section className="faq-section" id="faq" aria-labelledby="faq-title">
      <div className="faq-bg-ambient" aria-hidden="true"></div>
      <div className="faq-container">
        {/* Section Header */}
        <div className="faq-header">
          <div className="faq-pill">
            <Sparkles size={14} className="faq-pill-icon" />
            <span>BREWING, PREP &amp; ORDERS</span>
          </div>
          <h2 id="faq-title" className="faq-title">
            Frequently Asked Questions
          </h2>
          <p className="faq-subtitle">
            How to brew it, how to mix it, and how your order reaches you.
          </p>
        </div>

        {/* Accordion List */}
        <div className="faq-list">
          {faqData.map((item, index) => {
            const isOpen = openIndex === index;
            return (
              <div 
                key={item.id} 
                className={`faq-item ${isOpen ? 'is-open' : ''}`}
              >
                <button
                  type="button"
                  className="faq-question-btn"
                  onClick={() => toggleAccordion(index)}
                  aria-expanded={isOpen}
                  aria-controls={`faq-answer-${item.id}`}
                  id={`faq-btn-${item.id}`}
                >
                  <span className="faq-question-text">
                    <span className="faq-q-num">0{index + 1}</span>
                    {item.question}
                  </span>
                  <div className="faq-chevron-box">
                    <ChevronDown size={18} className="faq-chevron" />
                  </div>
                </button>

                <div
                  id={`faq-answer-${item.id}`}
                  role="region"
                  aria-labelledby={`faq-btn-${item.id}`}
                  className="faq-answer-collapse"
                  style={{
                    maxHeight: isOpen ? '400px' : '0',
                    opacity: isOpen ? 1 : 0
                  }}
                >
                  <div className="faq-answer-inner">
                    <p>{item.answer}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Help Banner */}
        <div className="faq-help-footer">
          <HelpCircle size={18} className="faq-help-icon" />
          <span>
            Have a question about a recipe or bulk dispatch? Chat with our team on{' '}
            <a 
              href="https://wa.me/917566636650?text=Hello%20Divyam%20Shree%20Team%2C%20I%20have%20a%20question%20regarding%20products."
              target="_blank"
              rel="noopener noreferrer"
              className="faq-help-link"
            >
              WhatsApp (+91 7566636650)
            </a>
          </span>
        </div>
      </div>
    </section>
  );
};

export default FAQ;
