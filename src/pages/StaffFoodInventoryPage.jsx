import { useState, useEffect } from 'react';
import { getFoodInventory, restockMenuItem, getStoredAuth, getIsStaff, clearAuth } from '../api';
import CafeBackground from '../components/CafeBackground';

function stockLevel(qty) {
  if (qty === null || qty === undefined) return { label: 'Not tracked', color: '#8A7967' };
  if (qty <= 0) return { label: 'Out of stock', color: '#D64550' };
  if (qty <= 10) return { label: 'Low stock', color: '#F4A340' };
  return { label: 'In stock', color: '#2D6A4F' };
}

export default function StaffFoodInventoryPage() {
  const [items, setItems] = useState([]);
  const [status, setStatus] = useState('loading'); // loading | ready | error
  const [errorMsg, setErrorMsg] = useState('');
  const [restockQty, setRestockQty] = useState({}); // { menuItemName: qtyString }
  const [restockingItem, setRestockingItem] = useState(null);

  useEffect(() => {
    const { apiKey, apiSecret } = getStoredAuth();
    if (!apiKey || !apiSecret || !getIsStaff()) {
      window.location.href = '/login';
      return;
    }

    loadInventory();
  }, []);

  const loadInventory = () => {
    const { apiKey, apiSecret } = getStoredAuth();
    getFoodInventory({ apiKey, apiSecret })
      .then((data) => {
        setItems(data.message || []);
        setStatus('ready');
      })
      .catch((err) => {
        clearAuth();
        setErrorMsg(err.message || 'Could not load food inventory.');
        setStatus('error');
      });
  };

  const handleRestock = async (item) => {
    const qty = Number(restockQty[item.name]);
    if (!qty || qty <= 0) {
      setErrorMsg('Enter a restock quantity greater than 0.');
      return;
    }

    setErrorMsg('');
    setRestockingItem(item.name);
    const { apiKey, apiSecret } = getStoredAuth();
    try {
      await restockMenuItem({ menuItem: item.name, qty, apiKey, apiSecret });
      setRestockQty((prev) => ({ ...prev, [item.name]: '' }));
      loadInventory();
    } catch (err) {
      setErrorMsg(err.message || 'Could not restock this item.');
    } finally {
      setRestockingItem(null);
    }
  };

  return (
    <div className="relative min-h-screen" style={{ fontFamily: "'Inter', sans-serif" }}>
      <CafeBackground />

      <div className="relative bg-[#1B4332] px-6 py-6 border-b border-[#F4A340]/20">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <button
            onClick={() => (window.location.href = '/staff')}
            className="flex items-center gap-1.5 text-sm font-medium text-[#FFF8ED]/80 hover:text-[#FFF8ED] transition-colors"
          >
            <span className="text-lg leading-none">←</span> Back
          </button>
          <div className="text-center">
            <h1 className="text-xl text-[#FFF8ED]" style={{ fontFamily: "'Baloo 2', sans-serif", fontWeight: 700 }}>
              🥤 Food Inventory
            </h1>
          </div>
          <div className="w-14" />
        </div>
      </div>

      <div className="relative max-w-3xl mx-auto px-6 py-8">
        {status === 'loading' && (
          <div className="text-center py-20">
            <div className="w-10 h-10 mx-auto mb-4 border-4 border-[#F4A340]/30 border-t-[#F4A340] rounded-full animate-spin" />
            <p className="text-[#FFF8ED]/80">Loading inventory...</p>
          </div>
        )}

        {status === 'error' && (
          <div className="text-center py-20">
            <div className="text-5xl mb-4">🚫</div>
            <p className="text-[#FFF8ED] font-medium mb-2">{errorMsg}</p>
            <a href="/login" className="text-[#F4A340] underline text-sm">Back to login</a>
          </div>
        )}

        {status === 'ready' && items.length === 0 && (
          <div className="text-center py-20">
            <div className="text-5xl mb-4">📭</div>
            <p className="text-[#FFF8ED] font-medium">No menu items yet.</p>
          </div>
        )}

        {status === 'ready' && items.length > 0 && (
          <div className="space-y-3">
            {errorMsg && (
              <div className="bg-[#D64550]/10 border border-[#D64550]/30 text-[#D64550] text-sm px-4 py-2.5 rounded-xl font-medium">
                {errorMsg}
              </div>
            )}

            {items.map((item) => {
              const level = stockLevel(item.stock_qty);
              const isTracked = item.stock_qty !== null && item.stock_qty !== undefined;

              return (
                <div key={item.name} className="bg-[#FFF8ED] rounded-2xl shadow-md p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-bold text-[#3D2817]">{item.item_name}</h3>
                      <p className="text-xs text-[#8A7967] mb-1">
                        {item.category} · ₹{item.price} · {item.is_available ? 'Available on menu' : 'Hidden from menu'}
                      </p>
                      <span
                        className="text-xs font-bold uppercase tracking-wide px-2 py-0.5 rounded-full text-[#FFF8ED]"
                        style={{ backgroundColor: level.color }}
                      >
                        {level.label}
                      </span>
                    </div>

                    <div className="text-right">
                      <p className="text-2xl font-bold text-[#3D2817]" style={{ fontFamily: "'Baloo 2', sans-serif" }}>
                        {isTracked ? item.stock_qty : '—'}
                      </p>
                      <p className="text-xs text-[#8A7967]">in stock</p>
                    </div>
                  </div>

                  {isTracked && (
                    <div className="flex gap-2 mt-3 pt-3 border-t border-[#E8DFC8]">
                      <input
                        type="number"
                        min="1"
                        placeholder="Qty received"
                        value={restockQty[item.name] || ''}
                        onChange={(e) => setRestockQty((prev) => ({ ...prev, [item.name]: e.target.value }))}
                        className="flex-1 px-3 py-2 rounded-lg border-2 border-[#E8DFC8] bg-white text-sm text-[#3D2817] placeholder-[#B8AC94] focus:outline-none focus:border-[#F4A340]"
                      />
                      <button
                        onClick={() => handleRestock(item)}
                        disabled={restockingItem === item.name}
                        className="bg-[#2D6A4F] hover:bg-[#255a42] disabled:opacity-60 text-[#FFF8ED] text-sm font-bold px-4 py-2 rounded-lg transition-colors whitespace-nowrap"
                      >
                        {restockingItem === item.name ? 'Adding...' : '+ Restock'}
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
