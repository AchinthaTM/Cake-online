import { useState } from 'react';
import { useCart } from '../../context/CartContext';
import BouquetCard from '../../components/BouquetCard/BouquetCard';
import './Bouquets.css';

const Bouquets = () => {
  const [bouquets] = useState([
    {
      id: 101,
      name: 'Spring Flower Bouquet',
      shortDescription: 'Bright mix of seasonal flowers',
      description: 'A beautiful arrangement of roses, lilies and daisies—perfect for any celebration.',
      price: 1200,
      category: 'Bouquet',
      image: 'https://example.com/bouquet1.jpg'
    },
    // add more bouquets here as desired
  ]);

  const { addToCart } = useCart();

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
