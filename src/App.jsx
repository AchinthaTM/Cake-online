import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import './App.css'
import Home from './pages/Home/index.jsx'
import Cakes from './pages/Cakes/Cakes.jsx'
import Bouquets from './pages/Bouquets/Bouquets.jsx'
import BouquetDetails from './pages/BouquetDetails/BouquetDetails.jsx'
import CakeDetails from './pages/CakeDetails/CakeDetails.jsx'
import Gallery from './pages/Gallery/Gallery.jsx'
import Cart from './pages/Cart/Cart.jsx'
import Register from './pages/Register/Register.jsx'
import Login from './pages/Login/Login.jsx'
import SellerDashboard from './pages/SellerDashboard/SellerDashboard.jsx'
import AdminDashboard from './pages/AdminDashboard/AdminDashboard.jsx'
import Checkout from './pages/Checkout/Checkout.jsx'
import TopBar from './components/TopBar/TopBar.jsx'
import Navigation from './components/Navigation/Navigation.jsx'
import Footer from './components/Footer/Footer.jsx'
import HeroSlideshow from './components/HeroSlideshow/HeroSlideshow.jsx'

function App() {
  return (
    <Router>
      <TopBar />
      <Navigation />
      <Routes>
        <Route path="/" element={
          <>
            <HeroSlideshow />
            <main>
              <Home />
            </main>
          </>
        } />
        <Route path="/cakes" element={
          <main>
            <Cakes />
          </main>
        } />
        <Route path="/bouquets" element={
          <main>
            <Bouquets />
          </main>
        } />
        <Route path="/cakes/:id" element={
          <main>
            <CakeDetails />
          </main>
        } />
        <Route path="/bouquets/:id" element={
          <main>
            <BouquetDetails />
          </main>
        } />
        <Route path="/gallery" element={
          <main>
            <Gallery />
          </main>
        } />
        <Route path="/cart" element={
          <main>
            <Cart />
          </main>
        } />
        <Route path="/register" element={
          <main>
            <Register />
          </main>
        } />
        <Route path="/login" element={
          <main>
            <Login />
          </main>
        } />
        <Route path="/seller/dashboard" element={
          <main>
            <SellerDashboard />
          </main>
        } />
        <Route path="/admin/dashboard" element={
          <main>
            <AdminDashboard />
          </main>
        } />
        <Route path="/checkout" element={
          <main>
            <Checkout />
          </main>
        } />
      </Routes>
      <Footer />
    </Router>
  )
}

export default App
