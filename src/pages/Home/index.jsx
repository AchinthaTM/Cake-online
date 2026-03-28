import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import CakeCard from '../../components/CakeCard/CakeCard';
import './Home.css';

export default function Home() {
  const [cakes, setCakes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeaturedCakes = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/products');
        const data = await response.json();
        if (data.success) {
          const formattedCakes = data.data.map(p => ({
            id: p._id,
            name: p.name,
            shortDescription: p.description.length > 50 ? p.description.substring(0, 47) + '...' : p.description,
            description: p.description,
            price: p.price,
            category: p.category,
            image: p.images && p.images.length > 0 
              ? (p.images[0].url.startsWith('http') ? p.images[0].url : `http://localhost:5000${p.images[0].url}`) 
              : ''
          }));
          setCakes(formattedCakes);
        }
      } catch (error) {
        console.error("Error fetching featured cakes:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchFeaturedCakes();
  }, []);

  const { addToCart } = useCart();
  const displayedCakes = cakes.slice(0, 6);

  const galleryImages = [
    { id: 1, src: 'https://images.unsplash.com/photo-1535141192574-5d4897c12636?w=600&h=600&fit=crop', alt: 'Wedding Cake' },
    { id: 2, src: 'https://images.unsplash.com/photo-1563729784474-d77dbb933a9e?w=600&h=600&fit=crop', alt: 'Birthday Cake' },
    { id: 3, src: 'https://images.unsplash.com/photo-1559553126-715c6090647d?w=600&h=600&fit=crop', alt: 'Custom Cake' },
    { id: 4, src: 'https://images.unsplash.com/photo-1627834377411-8da5f4f09de8?w=600&h=600&fit=crop', alt: 'Cupcakes' }
  ];

  return (
    <div className="home">
      <section id="cakes" className="featured_cakes">
        <div className="featured_container">
          <div className="featured_header">
            <h2>Our Featured Cakes</h2>
            <p>Handcrafted with love and premium ingredients</p>
          </div>
          
          <div className="cakes_grid">
            {displayedCakes.map((cake) => (
              <CakeCard key={cake.id} cake={cake} onAddToCart={addToCart} />
            ))}
          </div>

          <div className="view_all_btn_container">
            <Link to="/cakes" className="view_all_btn">
              View All Cakes →
            </Link>
          </div>
        </div>
      </section>

      <section className="home_gallery_section" style={{ padding: '60px 0', backgroundColor: '#f9f9f9' }}>
        <div className="featured_container">
          <div className="featured_header">
            <h2>Sweet Moments Gallery</h2>
            <p>See how our cakes make celebrations special</p>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginTop: '40px' }}>
            {galleryImages.map((item) => (
              <div key={item.id} style={{ height: '300px', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 4px 15px rgba(0,0,0,0.1)' }}>
                <img 
                  src={item.src} 
                  alt={item.alt} 
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </div>
            ))}
          </div>

          <div className="view_all_btn_container">
            <Link to="/gallery" className="view_all_btn">
              View Full Gallery →
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
