import { useState, useEffect } from 'react';
import { getSession, createPaymentOrder, verifyPayment, openRazorpayCheckout, getStoredAuth } from '../api';

export default function SessionSummaryPage() {
  const [session, setSession] = useState(null);
  const [status, setStatus] = useState('loading'); // loading | ready | error
  const [errorMsg, setErrorMsg] = useState('');
  const [paying, setPaying] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState(''); // '' | 'success' | 'failed'
  const [sessionId, setSessionId] = useState(null);

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
      })
      .catch((err) => {
        setErrorMsg(err.message || 'Could not load session.');
        setStatus('error');
      });
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
          } catch (err) {
            setPaymentStatus('failed');
            setErrorMsg(err.message || 'Payment verification failed.');
          } finally {
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
    <div className="min-h-screen bg-gradient-to-br from-[#1B4332] to-[#2D6A4F] flex items-center justify-center px-4" style={{ fontFamily: "'Inter', sans-serif" }}>
      <div className="relative w-full max-w-md bg-[#FFF8ED] rounded-3xl shadow-2xl overflow-hidden">
        <div className="bg-[#1B4332] px-8 pt-10 pb-8 text-center">
          <div className="w-16 h-16 mx-auto mb-3 bg-[#F4A340] rounded-2xl rotate-12 shadow-lg flex items-center justify-center">
            <div className="w-10 h-10 bg-[#FFF8ED] rounded-lg grid grid-cols-3 grid-rows-3 gap-0.5 p-1.5 -rotate-12">
              {[1, 0, 1, 0, 1, 0, 1, 0, 1].map((active, i) => (
                <span key={i} className={`rounded-full ${active ? 'bg-[#D64550]' : ''}`} />
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
            <div className="text-center py-6">
              <div className="text-5xl mb-4">✅</div>
              <h2 className="text-xl font-bold text-[#3D2817] mb-1" style={{ fontFamily: "'Baloo 2', sans-serif" }}>
                Payment Successful
              </h2>
              <p className="text-[#8A7967] text-sm">Thanks for visiting BoardGame Café!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}