import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/VerticalSlider.css';
import income from '../assets/income.jpg';
import graph from '../assets/graph.jpg';
import csv from '../assets/csv.jpg';

const slides = [
  {
    title: 'Gelir-Gider Takibi',
    description: [
      'Gelirlerini ve giderlerini kolayca kaydet, kontrol altında tut',
      'Harcamalarını kategorilere ayırarak finansal durumunu yönet',
      'Günlük ve aylık bütçeni takip ederek tasarruf yap'
    ],
    img: income,
    color: '#525bad',
    button: 'Hemen Başla'
  },
  {
    title: 'Grafik ve Analiz',
    description: [
      'Gelir-giderlerini renkli grafiklerle net bir şekilde gör',
      'Zaman içindeki finansal değişiklikleri kolayca analiz et',
      'Kategori bazlı harcama alışkanlıklarını görselleştir'
    ],
    img: graph,
    color: '#e67e22',
    button: 'Keşfet'
  },
  {
    title: 'CSV Dışa Aktarım',
    description: [
      'Finansal kayıtlarını CSV dosyası olarak dışa aktar',
      'Kolayca Excel ve diğer programlarda kullan',
      'Verilerini güvenli bir şekilde yedekle'
    ],
    img: csv,
    color: '#27ae60',
    button: 'Dışa Aktar'
  },
];


const VerticalSlider = () => {
  const [current, setCurrent] = useState(0);
  const sliderRef = useRef(null);
  const isTransitioning = useRef(false);
  const navigate = useNavigate();

  // Wheel navigation
  useEffect(() => {
    const handleWheel = (e) => {
      if (isTransitioning.current) return;
      
      isTransitioning.current = true;
      
      if (e.deltaY > 5) {
        setCurrent(prev => (prev + 1) % slides.length);
      } else if (e.deltaY < -5) {
        setCurrent(prev => (prev - 1 + slides.length) % slides.length);
      }
      
      setTimeout(() => {
        isTransitioning.current = false;
      }, 1200);
    };

    window.addEventListener('wheel', handleWheel);
    return () => window.removeEventListener('wheel', handleWheel);
  }, []);

  // Touch navigation
  useEffect(() => {
    let startY = 0;
    let isScrolling = false;
    
    const handleTouchStart = (e) => {
      startY = e.touches[0].clientY;
      isScrolling = true;
    };
    
    const handleTouchMove = (e) => {
      if (!isScrolling || isTransitioning.current) return;
      
      const currentY = e.touches[0].clientY;
      const diff = startY - currentY;
      
      if (Math.abs(diff) > 50) {
        isScrolling = false;
        isTransitioning.current = true;
        
        if (diff > 0) {
          setCurrent(prev => (prev + 1) % slides.length);
        } else {
          setCurrent(prev => (prev - 1 + slides.length) % slides.length);
        }
        
        setTimeout(() => {
          isTransitioning.current = false;
        }, 1200);
      }
    };

    window.addEventListener('touchstart', handleTouchStart);
    window.addEventListener('touchmove', handleTouchMove);
    
    return () => {
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
    };
  }, []);

  return (
    <div className="vertical-slider" ref={sliderRef}>
      {slides.map((slide, index) => (
        <div 
          key={index}
          className={`slide ${index === current ? 'active' : ''}`}
          style={{ 
            backgroundColor: slide.color,
            zIndex: slides.length - Math.abs(index - current)
          }}
        >
          <div className="slide-content">
            <div className="image-container">
              <img 
                src={slide.img} 
                alt={slide.title} 
                className="slide-image"
              />
            </div>
            
            <div className="text-container">
              <h2>{slide.title}</h2>
              
              <div className="description">
                {slide.description.map((line, i) => (
                  <p key={i}>{line}</p>
                ))}
              </div>
              
              <button className="slide-button" onClick={() => navigate('/login')}> {slide.button}</button>
            </div>
          </div>
          
          <div className="scroll-indicator">
            <div className="indicator-dots">
              {slides.map((_, i) => (
                <div 
                  key={i} 
                  className={`dot ${i === current ? 'active' : ''}`}
                />
              ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default VerticalSlider;