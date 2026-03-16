import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import CakeCard from '../../components/CakeCard/CakeCard';
import './Home.css';

export default function Home() {
  const [cakes] = useState([
    {
      id: 1,
      name: 'Chocolate Delight',
      shortDescription: 'Rich chocolate cake with creamy frosting',
      description: 'Indulge in our decadent chocolate cake, made with premium cocoa and layered with silky chocolate ganache. Perfect for chocolate lovers!',
      price: 6000,
      category: 'Chocolate',
      image: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=600&h=400&fit=crop'
    },
    {
      id: 2,
      name: 'Vanilla Dream',
      shortDescription: 'Classic vanilla cake with buttercream',
      description: 'A timeless classic featuring moist vanilla sponge layers with smooth vanilla buttercream. Light, fluffy, and absolutely delicious!',
      price: 5500,
      category: 'Vanilla',
      image: 'https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?w=600&h=400&fit=crop'
    },
    {
      id: 3,
      name: 'Strawberry Bliss',
      shortDescription: 'Fresh strawberry cake with cream',
      description: 'Delightful strawberry cake made with fresh strawberries and topped with whipped cream. A fruity paradise in every bite!',
      price: 3000,
      category: 'Fruit',
      image: 'https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=600&h=400&fit=crop'
    },
    {
      id: 4,
      name: 'Red Velvet Romance',
      shortDescription: 'Luxurious red velvet with cream cheese',
      description: 'Our signature red velvet cake with velvety texture and tangy cream cheese frosting. A romantic treat for special occasions!',
      price: 7000,
      category: 'Special',
      image: 'https://images.unsplash.com/photo-1586985289688-ca3cf47d3e6e?w=600&h=400&fit=crop'
    },
    {
      id: 5,
      name: 'Lemon Zest',
      shortDescription: 'Tangy lemon cake with citrus glaze',
      description: 'Refreshing lemon cake with a perfect balance of sweet and tangy flavors, topped with a zesty lemon glaze.',
      price: 6500,
      category: 'Fruit',
      image: 'https://images.unsplash.com/photo-1519915212116-7cfef71f1d3e?w=600&h=400&fit=crop'
    },
    {
      id: 6,
      name: 'Carrot Cake',
      shortDescription: 'Moist carrot cake with cream cheese frosting',
      description: 'Our signature carrot cake loaded with walnuts and topped with smooth cream cheese frosting. A delightful classic!',
      price: 5800,
      category: 'Special',
      image: 'https://images.unsplash.com/photo-1571115177098-24ec42ed204d?w=600&h=400&fit=crop'
    }
  ]);

  const { addToCart } = useCart();
  const displayedCakes = cakes.slice(0, 6);

  return (
    <div className="home">
      <section className="featured_cakes">
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
    </div>
  )
}
