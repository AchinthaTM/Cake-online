import { useState, useEffect } from 'react';
import './HeroSlideshow.css';

const HeroSlideshow = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  // Placeholder cake images - you can replace these with your actual cake images
  const slides = [
    {
      id: 1,
      image: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=1200&h=600&fit=crop',
      alt: 'Delicious Cake 1'
    },
    {
      id: 2,
      image: 'https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?w=1200&h=600&fit=crop',
      alt: 'Delicious Cake 2'
    },
    {
      id: 3,
      image: 'https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=1200&h=600&fit=crop',
      alt: 'Delicious Cake 3'
    }
  ];

  // Auto-advance slides every 5 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);

    return () => clearInterval(timer);
  }, [slides.length]);

  const goToSlide = (index) => {
    setCurrentSlide(index);
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  return (
    <div className="hero_slideshow">
      <div className="slideshow_container">
        {slides.map((slide, index) => (
          <div
            key={slide.id}
            className={`slide Rs{index === currentSlide ? 'active' : ''}`}
          >
            <img src={slide.image} alt={slide.alt} />
          </div>
        ))}

        {/* Text Overlay */}
        <div className="hero_content">
          <h1 className="hero_title">Easy, Fresh & Convenient</h1>
          <p className="hero_subtitle">Stock Up on Daily Essentials</p>
          <p className="hero_tagline">Save Big on Your Favorite Brands</p>
        </div>

        {/* Navigation Arrows */}
        <button className="slide_arrow prev" onClick={prevSlide}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
        <button className="slide_arrow next" onClick={nextSlide}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </button>

        {/* Dots Navigation */}
        <div className="slide_dots">
          {slides.map((_, index) => (
            <button
              key={index}
              className={`dot Rs{index === currentSlide ? 'active' : ''}`}
              onClick={() => goToSlide(index)}
              aria-label={`Go to slide Rs{index + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default HeroSlideshow;
