import { useState, useEffect } from 'react';
import { getMenuItems, placeFoodOrder, getStoredAuth } from '../api';

export default function FoodPage() {
  const [items, setItems] = useState([]);
  const [cart, setCart] = useState({}); // { menu_item_name: quantity }
  const [status, setStatus] = useState('loading');
  const [errorMsg, setErrorMsg] = useState('');
  const [placing, setPlacing] = useState(false);
  const [toast, setToast] = useState('');
  const [session, setSession] = useState(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setSession(params.get('session'));

    const { apiKey, apiSecret } = getStoredAuth();
    if (!apiKey || !apiSecret) {
      window.location.href = '/login';
      return;
    }

    getMenuItems({ apiKey, apiSecret })
      .then((data) => {
        setItems(data.data || []);
        setStatus('ready');
      })
      .catch((err) => {
        setErrorMsg(err.message || 'Could not load menu.');
        setStatus('error');
      });
  }, []);

  const updateQty = (itemName, delta) => {
    setCart((prev) => {
      const current = prev[itemName] || 0;
      const next = Math.max(0, current + delta);
      const updated = { ...prev };
      if (next === 0) delete updated[itemName];
      else updated[itemName] = next;
      return updated;
    });
  };

  const cartTotal = items.reduce((sum, item) => {
    const qty = cart[item.name] || 0;
    return sum + qty * item.price;
  }, 0);

  const cartCount = Object.values(cart).reduce((a, b) => a + b, 0);

  const handlePlaceOrder = async () => {
    setPlacing(true);
    setToast('');
    const { apiKey, apiSecret } = getStoredAuth();

    const orderItems = Object.entries(cart).map(([menu_item, quantity]) => ({
      menu_item,
      quantity,
    }));

    try {
      await placeFoodOrder({ customerSession: session, items: orderItems, apiKey, apiSecret });
      setToast('Order placed! Your bill has been updated.');
      setCart({});
    } catch (err) {
      setToast(err.message || 'Could not place order.');
    } finally {
      setPlacing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1B4332] to-[#2D6A4F]" style={{ fontFamily: "'Inter', sans-serif" }}>
      {/* Header */}
      <div className="bg-[#1B4332] px-6 py-6 text-center border-b border-[#F4A340]/20">
        <div className="w-12 h-12 mx-auto mb-2 bg-[#F4A340] rounded-xl rotate-12 shadow-lg flex items-center justify-center">
          <div className="w-8 h-8 bg-[#FFF8ED] rounded-md grid grid-cols-3 grid-rows-3 gap-0.5 p-1 -rotate-12">
            {[1, 0, 1, 0, 1, 0, 1, 0, 1].map((active, i) => (
              <span key={i} className={`rounded-full ${active ? 'bg-[#D64550]' : ''}`} />
            ))}
          </div>
        </div>
        <h1 className="text-2xl text-[#FFF8ED]" style={{ fontFamily: "'Baloo 2', sans-serif", fontWeight: 700 }}>
          Order Food
        </h1>
        <p className="text-[#F4A340] text-sm mt-0.5">Fuel up for the next round</p>
      </div>

      {toast && (
        <div className="max-w-2xl mx-auto mt-4 px-4">
          <div className="bg-[#FFF8ED] border border-[#F4A340]/40 text-[#3D2817] text-sm px-4 py-3 rounded-xl shadow-lg text-center font-medium">
            {toast}
          </div>
        </div>
      )}

      <div className="max-w-2xl mx-auto px-4 py-8 pb-32">
        {status === 'loading' && (
          <div className="text-center py-20">
            <div className="w-10 h-10 mx-auto mb-4 border-4 border-[#F4A340]/30 border-t-[#F4A340] rounded-full animate-spin" />
            <p className="text-[#FFF8ED]/80">Loading the menu...</p>
          </div>
        )}

        {status === 'error' && (
          <div className="text-center py-20">
            <div className="text-5xl mb-4">😕</div>
            <p className="text-[#FFF8ED] font-medium">{errorMsg}</p>
          </div>
        )}

        {status === 'ready' && (
          <div className="space-y-3">
            {items.map((item) => {
              const qty = cart[item.name] || 0;
              return (
                <div
                  key={item.name}
                  className="bg-[#FFF8ED] rounded-2xl shadow-md p-4 flex items-center justify-between"
                >
                  <div>
                    <h3 className="font-bold text-[#3D2817]">{item.item_name}</h3>
                    <p className="text-xs text-[#8A7967] mb-1">{item.category}</p>
                    <p className="text-[#D64550] font-semibold">₹{item.price}</p>
                  </div>

                  {qty === 0 ? (
                    <button
                      onClick={() => updateQty(item.name, 1)}
                      className="bg-[#1B4332] hover:bg-[#163a2a] text-[#FFF8ED] text-sm font-bold px-4 py-2 rounded-xl transition-colors"
                    >
                      Add
                    </button>
                  ) : (
                    <div className="flex items-center gap-3 bg-[#E8DFC8] rounded-xl px-2 py-1">
                      <button
                        onClick={() => updateQty(item.name, -1)}
                        className="w-7 h-7 flex items-center justify-center bg-[#FFF8ED] rounded-lg font-bold text-[#3D2817] hover:bg-white"
                      >
                        −
                      </button>
                      <span className="font-bold text-[#3D2817] w-4 text-center">{qty}</span>
                      <button
                        onClick={() => updateQty(item.name, 1)}
                        className="w-7 h-7 flex items-center justify-center bg-[#FFF8ED] rounded-lg font-bold text-[#3D2817] hover:bg-white"
                      >
                        +
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Sticky bottom bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-[#FFF8ED] border-t-2 border-[#E8DFC8] px-4 py-4 shadow-2xl">
        <div className="max-w-2xl mx-auto space-y-3">
          {cartCount > 0 && (
            <div className="flex justify-between items-center text-sm">
              <span className="text-[#8A7967]">{cartCount} item{cartCount > 1 ? 's' : ''} in cart</span>
              <span className="font-bold text-[#3D2817] text-lg">₹{cartTotal}</span>
            </div>
          )}

          <div className="flex gap-3">
            <button
              onClick={handlePlaceOrder}
              disabled={cartCount === 0 || placing}
              className="flex-1 bg-[#D64550] hover:bg-[#C43A44] disabled:bg-[#B8AC94] disabled:cursor-not-allowed text-[#FFF8ED] font-bold py-3.5 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2"
            >
              {placing ? (
                <span className="w-5 h-5 border-2 border-[#FFF8ED]/40 border-t-[#FFF8ED] rounded-full animate-spin" />
              ) : (
                'Place Order'
              )}
            </button>

            <button
              onClick={() => (window.location.href = `/summary?session=${session}`)}
              className="flex-1 bg-[#1B4332] hover:bg-[#163a2a] text-[#FFF8ED] font-bold py-3.5 rounded-xl shadow-lg transition-all"
            >
              View Bill →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}