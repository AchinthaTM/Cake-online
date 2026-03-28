import { useState, useEffect } from 'react';
import { useCart } from '../../context/CartContext';
import BouquetCard from '../../components/BouquetCard/BouquetCard';
import './Bouquets.css';

const Bouquets = () => {
  const [bouquets, setBouquets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBouquets = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/products?type=bouquet');
        const data = await response.json();
        if (data.success) {
          const formattedBouquets = data.data.map(p => ({
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
          setBouquets(formattedBouquets);
        }
      } catch (error) {
        console.error("Error fetching bouquets:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchBouquets();
  }, []);

  const { addToCart } = useCart();

  if (loading) return <div className="loading">Loading bouquets...</div>;

  return (
    <div className="bouquets_page">
      <h1>Our Bouquets</h1>
      <div className="bouquets_grid">
        {bouquets.map((item) => (
          <BouquetCard key={item.id} bouquet={item} onAddToCart={addToCart} />
        ))}
      </div>
    </div>
  );
};

export default Bouquets;
