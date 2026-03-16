import { useState } from 'react';
import './Gallery.css';

const Gallery = () => {
  const [selectedImage, setSelectedImage] = useState(null);

  const galleryImages = [
    {
      id: 1,
      title: 'Chocolate Masterpiece',
      image: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=600&h=400&fit=crop',
      category: 'Chocolate'
    },
    {
      id: 2,
      title: 'Vanilla Elegance',
      image: 'https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?w=600&h=400&fit=crop',
      category: 'Vanilla'
    },
    {
      id: 3,
      title: 'Strawberry Delight',
      image: 'https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=600&h=400&fit=crop',
      category: 'Fruit'
    },
    {
      id: 4,
      title: 'Red Velvet Romance',
      image: 'https://images.unsplash.com/photo-1586985289688-ca3cf47d3e6e?w=600&h=400&fit=crop',
      category: 'Special'
    },
    {
      id: 5,
      title: 'Lemon Zest',
      image: 'https://images.unsplash.com/photo-1519915212116-7cfef71f1d3e?w=600&h=400&fit=crop',
      category: 'Fruit'
    },
    {
      id: 6,
      title: 'Carrot Cake',
      image: 'https://images.unsplash.com/photo-1571115177098-24ec42ed204d?w=600&h=400&fit=crop',
      category: 'Special'
    },
    {
      id: 7,
      title: 'Cheesecake Paradise',
      image: 'https://images.unsplash.com/photo-1530805066000-de6a9fb42908?w=600&h=400&fit=crop',
      category: 'Special'
    },
    {
      id: 8,
      title: 'Blueberry Bliss',
      image: 'https://images.unsplash.com/photo-1551632440-4ebbf5b0f0d4?w=600&h=400&fit=crop',
      category: 'Fruit'
    },
    {
      id: 9,
      title: 'Chocolate Truffle',
      image: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=600&h=400&fit=crop',
      category: 'Chocolate'
    }
  ];

  return (
    <section className="gallery">
      <div className="gallery_container">
        <div className="gallery_header">
          <h1>Our Cake Gallery</h1>
          <p>Explore our beautiful collection of custom cakes and designs</p>
        </div>

        <div className="gallery_grid">
          {galleryImages.map((item) => (
            <div
              key={item.id}
              className="gallery_item"
              onClick={() => setSelectedImage(item)}
            >
              <img src={item.image} alt={item.title} />
              <div className="gallery_overlay">
                <h3>{item.title}</h3>
                <p>{item.category}</p>
              </div>
            </div>
          ))}
        </div>

        {selectedImage && (
          <div className="modal" onClick={() => setSelectedImage(null)}>
            <div className="modal_content" onClick={(e) => e.stopPropagation()}>
              <button 
                className="modal_close" 
                onClick={() => setSelectedImage(null)}
              >
                ✕
              </button>
              <img src={selectedImage.image} alt={selectedImage.title} />
              <div className="modal_info">
                <h2>{selectedImage.title}</h2>
                <p>{selectedImage.category}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default Gallery;
