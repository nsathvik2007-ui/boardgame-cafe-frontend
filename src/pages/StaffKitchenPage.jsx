import { useState, useEffect, useRef } from 'react';
import { getKitchenQueue, updateFoodOrderStatus, getStoredAuth, getIsStaff, clearAuth } from '../api';
import CafeBackground from '../components/CafeBackground';

const STATUS_FLOW = {
  Placed: { next: 'Preparing', label: 'Start Preparing', badge: '#F4A340' },
  Preparing: { next: 'Served', label: 'Mark Served', badge: '#D64550' },
};

export default function StaffKitchenPage() {
  const [orders, setOrders] = useState([]);
  const [status, setStatus] = useState('loading'); // loading | ready | error
  const [errorMsg, setErrorMsg] = useState('');
  const [actingOn, setActingOn] = useState(null);
  const pollRef = useRef(null);

  useEffect(() => {
    const { apiKey, apiSecret } = getStoredAuth();
    if (!apiKey || !apiSecret || !getIsStaff()) {
      window.location.href = '/login';
      return;
    }

    loadQueue();
    pollRef.current = setInterval(loadQueue, 15000);
    return () => clearInterval(pollRef.current);
  }, []);

  const loadQueue = () => {
    const { apiKey, apiSecret } = getStoredAuth();
    getKitchenQueue({ apiKey, apiSecret })
      .then((data) => {
        setOrders(data.message || []);
        setStatus('ready');
      })
      .catch((err) => {
        clearAuth();
        setErrorMsg(err.message || 'Could not load the kitchen queue.');
        setStatus('error');
      });
  };

  const handleAdvance = async (order) => {
    const flow = STATUS_FLOW[order.status];
    if (!flow) return;

    setActingOn(order.name);
    const { apiKey, apiSecret } = getStoredAuth();
    try {
      await updateFoodOrderStatus({ foodOrder: order.name, status: flow.next, apiKey, apiSecret });
      loadQueue();
    } catch (err) {
      setErrorMsg(err.message || 'Could not update the order.');
    } finally {
      setActingOn(null);
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
              🍴 Kitchen Queue
            </h1>
          </div>
          <div className="w-14" />
        </div>
      </div>

      <div className="relative max-w-3xl mx-auto px-6 py-8">
        {status === 'loading' && (
          <div className="text-center py-20">
            <div className="w-10 h-10 mx-auto mb-4 border-4 border-[#F4A340]/30 border-t-[#F4A340] rounded-full animate-spin" />
            <p className="text-[#FFF8ED]/80">Loading the queue...</p>
          </div>
        )}

        {status === 'error' && (
          <div className="text-center py-20">
            <div className="text-5xl mb-4">🚫</div>
            <p className="text-[#FFF8ED] font-medium mb-2">{errorMsg}</p>
            <a href="/login" className="text-[#F4A340] underline text-sm">Back to login</a>
          </div>
        )}

        {status === 'ready' && orders.length === 0 && (
          <div className="text-center py-20">
            <div className="text-5xl mb-4">✅</div>
            <p className="text-[#FFF8ED] font-medium">All caught up — no pending orders.</p>
          </div>
        )}

        {status === 'ready' && orders.length > 0 && (
          <div className="space-y-4">
            {orders.map((order) => {
              const flow = STATUS_FLOW[order.status];
              return (
                <div key={order.name} className="bg-[#FFF8ED] rounded-2xl shadow-lg overflow-hidden">
                  <div className="flex items-center justify-between px-5 py-3 bg-[#E8DFC8]">
                    <span className="font-bold text-[#3D2817]" style={{ fontFamily: "'Baloo 2', sans-serif" }}>
                      Table {order.table}
                    </span>
                    <span className="text-xs text-[#8A7967]">
                      {new Date(order.order_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  <div className="px-5 py-4">
                    <div className="space-y-1.5 mb-4">
                      {order.items.map((item, i) => (
                        <div key={i} className="flex justify-between text-sm">
                          <span className="text-[#3D2817]">{item.menu_item}</span>
                          <span className="text-[#8A7967] font-medium">× {item.quantity}</span>
                        </div>
                      ))}
                    </div>

                    <div className="flex items-center justify-between gap-3">
                      <span
                        className="text-xs font-bold uppercase tracking-wide px-2.5 py-1 rounded-full text-[#FFF8ED]"
                        style={{ backgroundColor: flow ? flow.badge : '#8A7967' }}
                      >
                        {order.status}
                      </span>

                      {flow && (
                        <button
                          onClick={() => handleAdvance(order)}
                          disabled={actingOn === order.name}
                          className="bg-[#1B4332] hover:bg-[#163a2a] disabled:opacity-60 text-[#FFF8ED] text-sm font-bold px-4 py-2 rounded-xl transition-colors"
                        >
                          {actingOn === order.name ? 'Updating...' : flow.label}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
