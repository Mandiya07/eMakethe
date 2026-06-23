/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import { FirebaseProvider } from './components/FirebaseProvider';
import Home from './pages/Home';
import Feed from './pages/Feed';
import Shop from './pages/Shop';
import ProductDetails from './pages/ProductDetails';
import Wallet from './pages/Wallet';
import Messages from './pages/Messages';
import SellerDashboard from './pages/SellerDashboard';
import RegisterSeller from './pages/RegisterSeller';
import Search from './pages/Search';
import Checkout from './pages/Checkout';
import DriverDashboard from './pages/DriverDashboard';
import NearbyMap from './pages/NearbyMap';
import AdminDashboard from './pages/AdminDashboard';

export default function App() {
  return (
    <FirebaseProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="feed" element={<Feed />} />
            <Route path="search" element={<Search />} />
            <Route path="shop/:id" element={<Shop />} />
            <Route path="product/:id" element={<ProductDetails />} />
            <Route path="wallet" element={<Wallet />} />
            <Route path="messages" element={<Messages />} />
            <Route path="dashboard" element={<SellerDashboard />} />
            <Route path="register-seller" element={<RegisterSeller />} />
            <Route path="driver" element={<DriverDashboard />} />
            <Route path="admin" element={<AdminDashboard />} />
          </Route>
          <Route path="/checkout/:id" element={<Checkout />} />
          <Route path="/map" element={<NearbyMap />} />
        </Routes>
      </BrowserRouter>
    </FirebaseProvider>
  );
}
