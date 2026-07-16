import { useState, useEffect } from 'react';
import { getSession, getSessionSummary, createPaymentOrder, verifyPayment, openRazorpayCheckout, endSession, getInvoice, getStoredAuth } from '../api';
import CafeBackground from '../components/CafeBackground';

export default function SessionSummaryPage() {
  const [session, setSession] = useState(null);
  const [status, setStatus] = useState('loading'); // loading | ready | error
  const [errorMsg, setErrorMsg] = useState('');
  const [paying, setPaying] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState(''); // '' | 'success' | 'failed'
  const [sessionId, setSessionId] = useState(null);
  const [invoice, setInvoice] = useState(null);
  const [invoiceStatus, setInvoiceStatus] = useState('idle'); // 'idle' | 'loading' | 'ready' | 'error'
  const [lineItems, setLineItems] = useState([]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get('session');
    setSessionId(id);

    const { apiKey, apiSecret } = getStoredAuth();
    if (!apiKey || !apiSecret) {
      window.location.href = '/login';
      return;
    }
    if (!id) {
      setErrorMsg('No session specified.');
      setStatus('error');
      return;
    }

    loadSession(id, apiKey, apiSecret);
  }, []);

  const loadSession = (id, apiKey, apiSecret) => {
    getSession({ sessionId: id, apiKey, apiSecret })
      .then((data) => {
        setSession(data.data);
        setStatus('ready');

        if (data.data.status === 'Completed') {
          setPaymentStatus('success');
          fetchInvoiceOnly(id, apiKey, apiSecret);
        } else {
          loadLineItems(id, apiKey, apiSecret);
        }
      })
      .catch((err) => {
        setErrorMsg(err.message || 'Could not load session.');
        setStatus('error');
      });
  };

  const loadLineItems = (id, apiKey, apiSecret) => {
    getSessionSummary({ customerSession: id, apiKey, apiSecret })
      .then((data) => {
        const summary = data.message;
        const items = [
          ...summary.game_checkouts.map((c) => ({
            key: `game-${c.name}`,
            label: c.game_title,
            qty: 1,
            amount: c.rental_fee || 0,
          })),
          ...summary.food_orders.flatMap((order) =>
            order.items.map((item, i) => ({
              key: `food-${order.name}-${i}`,
              label: item.menu_item,
              qty: item.quantity,
              amount: item.amount,
            }))
          ),
        ];
        setLineItems(items);
      })
      .catch(() => {
        // Non-critical — the total bill still shows even if the itemized preview fails to load.
      });
  };

  const fetchInvoiceOnly = async (id, apiKey, apiSecret) => {
    setInvoiceStatus('loading');
    try {
      const data = await getInvoice({ customerSession: id, apiKey, apiSecret });
      setInvoice(data.message);
      setInvoiceStatus('ready');
    } catch (err) {
      setErrorMsg(err.message || 'Could not load your invoice.');
      setInvoiceStatus('error');
    }
  };

  const handleEndSession = async () => {
    setInvoiceStatus('loading');
    setErrorMsg('');
    const { apiKey, apiSecret } = getStoredAuth();

    try {
      await endSession({ customerSession: sessionId, apiKey, apiSecret });
      const data = await getInvoice({ customerSession: sessionId, apiKey, apiSecret });
      setInvoice(data.message);
      setInvoiceStatus('ready');
    } catch (err) {
      setErrorMsg(err.message || 'Could not end your session.');
      setInvoiceStatus('error');
    }
  };

  const handlePayNow = async () => {
    setPaying(true);
    setPaymentStatus('');
    const { apiKey, apiSecret } = getStoredAuth();

    try {
      const orderData = await createPaymentOrder({ customerSession: sessionId, apiKey, apiSecret });

      openRazorpayCheckout({
        orderData,
        customerName: session.customer,
        customerEmail: session.customer,
        onSuccess: async ({ razorpayOrderId, razorpayPaymentId, razorpaySignature }) => {
          try {
            await verifyPayment({ razorpayOrderId, razorpayPaymentId, razorpaySignature, apiKey, apiSecret });
            setPaymentStatus('success');
            setPaying(false);
          } catch (err) {
            setPaymentStatus('failed');
            setErrorMsg(err.message || 'Payment verification failed.');
            setPaying(false);
          }
        },
        onFailure: (msg) => {
          setPaymentStatus('failed');
          setErrorMsg(msg);
          setPaying(false);
        },
      });
    } catch (err) {
      setErrorMsg(err.message || 'Could not start payment.');
      setPaying(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center px-4" style={{ fontFamily: "'Inter', sans-serif" }}>
      <CafeBackground />
      <div className="relative w-full max-w-md bg-[#FFF8ED] rounded-3xl shadow-2xl overflow-hidden">
        <div className="relative bg-[#1B4332] px-8 pt-10 pb-8 text-center">
          {session && paymentStatus !== 'success' && (
            <button
              onClick={() => (window.location.href = `/food?session=${sessionId}&table=${session.table}`)}
              className="absolute top-5 left-5 flex items-center gap-1.5 text-sm font-medium text-[#FFF8ED]/80 hover:text-[#FFF8ED] transition-colors"
            >
              <span className="text-lg leading-none">←</span> Back
            </button>
          )}
          <div className="w-16 h-16 mx-auto mb-3 bg-[#F4A340] rounded-2xl rotate-12 shadow-lg flex items-center justify-center">
            <div className="w-10 h-10 bg-[#FFF8ED] rounded-lg grid grid-cols-3 grid-rows-3 gap-0.5 p-1.5 -rotate-12">
              {[1, 0, 1, 0, 1, 0, 1, 0, 1].map((active, i) => (
                <span key={i} className={`rounded-full ${active ? 'bg-[#FF5A3C] shadow-[0_0_2px_rgba(255,90,60,0.6)]' : ''}`} />
              ))}
            </div>
          </div>
          <h1 className="text-2xl text-[#FFF8ED]" style={{ fontFamily: "'Baloo 2', sans-serif", fontWeight: 700 }}>
            Table Summary
          </h1>
        </div>

        <div className="px-8 py-8">
          {status === 'loading' && (
            <div className="text-center py-10">
              <div className="w-10 h-10 mx-auto mb-4 border-4 border-[#E8DFC8] border-t-[#D64550] rounded-full animate-spin" />
              <p className="text-[#3D2817]">Loading your bill...</p>
            </div>
          )}

          {status === 'error' && (
            <div className="text-center py-10">
              <div className="text-5xl mb-4">😕</div>
              <p className="text-[#D64550] font-medium">{errorMsg}</p>
            </div>
          )}

          {status === 'ready' && session && paymentStatus !== 'success' && (
            <>
              <div className="flex justify-between items-center text-sm text-[#8A7967] mb-1">
                <span>Table</span>
                <span className="font-semibold text-[#3D2817]">{session.table}</span>
              </div>
              <div className="flex justify-between items-center text-sm text-[#8A7967] mb-6">
                <span>Party size</span>
                <span className="font-semibold text-[#3D2817]">{session.party_size}</span>
              </div>

              {lineItems.length > 0 && (
                <div className="border-t-2 border-dashed border-[#E8DFC8] pt-4 mb-4 space-y-2">
                  {lineItems.map((item) => (
                    <div key={item.key} className="flex justify-between items-center text-sm">
                      <span className="text-[#3D2817]">
                        {item.label} <span className="text-[#8A7967]">× {item.qty}</span>
                      </span>
                      <span className="text-[#3D2817] font-medium">₹{item.amount}</span>
                    </div>
                  ))}
                </div>
              )}

              <div className="border-t-2 border-dashed border-[#E8DFC8] pt-4 mb-6">
                <div className="flex justify-between items-center">
                  <span className="text-[#3D2817] font-semibold">Total Bill</span>
                  <span className="text-2xl font-bold text-[#3D2817]" style={{ fontFamily: "'Baloo 2', sans-serif" }}>
                    ₹{session.total_bill_amount}
                  </span>
                </div>
              </div>

              {paymentStatus === 'failed' && (
                <div className="bg-[#D64550]/10 border border-[#D64550]/30 text-[#D64550] text-sm px-4 py-2.5 rounded-xl mb-4 font-medium">
                  {errorMsg}
                </div>
              )}

              <button
                onClick={handlePayNow}
                disabled={paying || !session.total_bill_amount}
                className="w-full bg-[#D64550] hover:bg-[#C43A44] disabled:bg-[#B8AC94] disabled:cursor-not-allowed text-[#FFF8ED] font-bold py-3.5 rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200 flex items-center justify-center gap-2"
              >
                {paying ? (
                  <span className="w-5 h-5 border-2 border-[#FFF8ED]/40 border-t-[#FFF8ED] rounded-full animate-spin" />
                ) : !session.total_bill_amount ? (
                  'Nothing to pay yet'
                ) : (
                  `Pay ₹${session.total_bill_amount} Now`
                )}
              </button>
            </>
          )}

          {paymentStatus === 'success' && (
            <div className="py-2">
              <div className="text-center mb-6">
                <div className="text-5xl mb-4">✅</div>
                <h2 className="text-xl font-bold text-[#3D2817] mb-1" style={{ fontFamily: "'Baloo 2', sans-serif" }}>
                  Payment Successful
                </h2>
                <p className="text-[#8A7967] text-sm">Thanks for visiting BoardGame Café!</p>
              </div>

              {invoiceStatus === 'idle' && (
                <button
                  onClick={handleEndSession}
                  className="w-full bg-[#1B4332] hover:bg-[#163a2a] text-[#FFF8ED] font-bold py-3.5 rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200"
                >
                  Done, End My Session
                </button>
              )}

              {invoiceStatus === 'loading' && (
                <div className="text-center py-6">
                  <div className="w-8 h-8 mx-auto mb-3 border-4 border-[#E8DFC8] border-t-[#D64550] rounded-full animate-spin" />
                  <p className="text-[#8A7967] text-sm">Closing out your table and generating your invoice...</p>
                </div>
              )}

              {invoiceStatus === 'error' && (
                <>
                  <div className="bg-[#D64550]/10 border border-[#D64550]/30 text-[#D64550] text-sm px-4 py-2.5 rounded-xl mb-4 font-medium text-center">
                    {errorMsg}
                  </div>
                  <button
                    onClick={handleEndSession}
                    className="w-full bg-[#1B4332] hover:bg-[#163a2a] text-[#FFF8ED] font-bold py-3.5 rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200"
                  >
                    Try Again
                  </button>
                </>
              )}

              {invoiceStatus === 'ready' && invoice && (
                <div className="border-t-2 border-dashed border-[#E8DFC8] pt-5">
                  <div className="flex justify-between items-baseline mb-1">
                    <h3 className="font-bold text-[#3D2817]" style={{ fontFamily: "'Baloo 2', sans-serif" }}>
                      Invoice {invoice.name}
                    </h3>
                    <span className="text-xs text-[#8A7967]">{invoice.posting_date}</span>
                  </div>
                  <p className="text-xs text-[#8A7967] mb-4">Status: {invoice.status}</p>

                  <div className="space-y-2 mb-4">
                    {invoice.items.map((item, i) => (
                      <div key={i} className="flex justify-between items-center text-sm">
                        <span className="text-[#3D2817]">
                          {item.item_name} <span className="text-[#8A7967]">× {item.qty}</span>
                        </span>
                        <span className="text-[#3D2817] font-medium">₹{item.amount}</span>
                      </div>
                    ))}
                  </div>

                  <div className="border-t-2 border-dashed border-[#E8DFC8] pt-4 flex justify-between items-center">
                    <span className="text-[#3D2817] font-semibold">Grand Total</span>
                    <span className="text-2xl font-bold text-[#3D2817]" style={{ fontFamily: "'Baloo 2', sans-serif" }}>
                      ₹{invoice.grand_total}
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}