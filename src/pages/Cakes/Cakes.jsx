import { useState, useEffect } from 'react';
import { useCart } from '../../context/CartContext';
import CakeCard from '../../components/CakeCard/CakeCard';
import './Cakes.css';

const Cakes = () => {
  const [cakes, setCakes] = useState([]);
  const [loading, setLoading] = useState(true);

  const { addToCart } = useCart();

  useEffect(() => {
    const fetchCakes = async () => {
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
            image: p.images && p.images.length > 0 ? p.images[0].url : ''
          }));
          setCakes(formattedCakes);
        }
      } catch (error) {
        console.error("Error fetching cakes:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchCakes();
  }, []);

  return (
    <div className="cakes_page">
      <div className="cakes_header">
        <h1 className="cakes_title">Our Delicious Cakes</h1>
        <p className="cakes_subtitle">Handcrafted with love, baked to perfection</p>
      </div>

      <div className="cakes_grid">
        {cakes.map((cake) => (
          <CakeCard 
            key={cake.id} 
            cake={cake} 
            onAddToCart={addToCart}
          />
        ))}
      </div>
    </div>
  );
};

export default Cakes;
