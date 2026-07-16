import { useState, useEffect } from 'react';
import {
  getDashboardOverview,
  markTableFree,
  forceEndSession,
  getUnpaidSessions,
  getTableQr,
  getStoredAuth,
  getIsStaff,
  clearAuth,
} from '../api';
import CafeBackground from '../components/CafeBackground';

const STATUS_STYLES = {
  Free: { bg: '#2D6A4F', text: '#FFF8ED' },
  Occupied: { bg: '#D64550', text: '#FFF8ED' },
  Cleaning: { bg: '#F4A340', text: '#1B4332' },
};

const NAV_LINKS = [
  { href: '/staff/kitchen', icon: '🍴', label: 'Kitchen Queue' },
  { href: '/staff/inventory', icon: '🎲', label: 'Inventory Check' },
  { href: '/staff/food-inventory', icon: '🥤', label: 'Food Inventory' },
];

export default function StaffDashboardPage() {
  const [tables, setTables] = useState([]);
  const [status, setStatus] = useState('loading'); // loading | ready | error
  const [errorMsg, setErrorMsg] = useState('');
  const [actingOn, setActingOn] = useState(null);
  const [unpaidSessions, setUnpaidSessions] = useState([]);
  const [qrByTable, setQrByTable] = useState({});
  const [qrLoadingTable, setQrLoadingTable] = useState(null);

  useEffect(() => {
    const { apiKey, apiSecret } = getStoredAuth();
    if (!apiKey || !apiSecret || !getIsStaff()) {
      window.location.href = '/login';
      return;
    }

    loadDashboard();
    loadUnpaidSessions();
  }, []);

  const loadDashboard = () => {
    setStatus('loading');
    const { apiKey, apiSecret } = getStoredAuth();

    getDashboardOverview({ apiKey, apiSecret })
      .then((data) => {
        setTables(data.message || []);
        setStatus('ready');
      })
      .catch((err) => {
        // If the backend rejects us, this account isn't actually staff — kick them out.
        clearAuth();
        setErrorMsg(err.message || 'Could not load the dashboard.');
        setStatus('error');
      });
  };

  const loadUnpaidSessions = () => {
    const { apiKey, apiSecret } = getStoredAuth();
    getUnpaidSessions({ apiKey, apiSecret })
      .then((data) => setUnpaidSessions(data.message || []))
      .catch(() => {});
  };

  const handleMarkFree = async (tableName) => {
    setActingOn(tableName);
    const { apiKey, apiSecret } = getStoredAuth();
    try {
      await markTableFree({ table: tableName, apiKey, apiSecret });
      loadDashboard();
    } catch (err) {
      setErrorMsg(err.message || 'Could not free the table.');
      setActingOn(null);
    }
  };

  const handleForceEnd = async (sessionName) => {
    if (!window.confirm('End this session and generate the invoice? This should only be used when the customer has already left.')) {
      return;
    }
    setActingOn(sessionName);
    const { apiKey, apiSecret } = getStoredAuth();
    try {
      await forceEndSession({ customerSession: sessionName, apiKey, apiSecret });
      loadDashboard();
      loadUnpaidSessions();
    } catch (err) {
      setErrorMsg(err.message || 'Could not end the session.');
      setActingOn(null);
    }
  };

  const handleToggleQr = async (tableName) => {
    if (qrByTable[tableName]) {
      setQrByTable((prev) => {
        const next = { ...prev };
        delete next[tableName];
        return next;
      });
      return;
    }

    setQrLoadingTable(tableName);
    const { apiKey, apiSecret } = getStoredAuth();
    try {
      const data = await getTableQr({ table: tableName, apiKey, apiSecret });
      setQrByTable((prev) => ({ ...prev, [tableName]: data.message }));
    } catch (err) {
      setErrorMsg(err.message || 'Could not load the QR code.');
    } finally {
      setQrLoadingTable(null);
    }
  };

  const handleLogout = () => {
    clearAuth();
    window.location.href = '/login';
  };

  return (
    <div className="relative min-h-screen" style={{ fontFamily: "'Inter', sans-serif" }}>
      <CafeBackground />

      <div className="relative bg-[#1B4332] border-b border-[#F4A340]/20">
        <div className="max-w-5xl mx-auto px-6 pt-6 pb-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#F4A340] rounded-xl rotate-12 shadow-lg flex items-center justify-center">
              <div className="w-6 h-6 bg-[#FFF8ED] rounded-md grid grid-cols-3 grid-rows-3 gap-0.5 p-1 -rotate-12">
                {[1, 0, 1, 0, 1, 0, 1, 0, 1].map((active, i) => (
                  <span key={i} className={`rounded-full ${active ? 'bg-[#FF5A3C]' : ''}`} />
                ))}
              </div>
            </div>
            <div>
              <h1 className="text-xl text-[#FFF8ED]" style={{ fontFamily: "'Baloo 2', sans-serif", fontWeight: 700 }}>
                Staff Dashboard
              </h1>
              <p className="text-[#F4A340] text-xs">BoardGame Café</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="text-sm font-medium text-[#FFF8ED]/70 hover:text-[#FFF8ED] transition-colors"
          >
            Log Out
          </button>
        </div>

        <div className="max-w-5xl mx-auto px-6 pb-5 flex flex-wrap gap-2.5">
          {NAV_LINKS.map((link) => (
            <button
              key={link.href}
              onClick={() => (window.location.href = link.href)}
              className="flex items-center gap-1.5 bg-[#F4A340] hover:bg-[#e5942f] text-[#1B4332] text-sm font-bold px-3.5 py-2 rounded-xl transition-colors"
            >
              {link.icon} {link.label}
            </button>
          ))}
        </div>
      </div>

      <div className="relative max-w-5xl mx-auto px-6 py-8">
        {unpaidSessions.length > 0 && (
          <div className="bg-[#D64550]/10 border border-[#D64550]/30 rounded-2xl px-5 py-4 mb-8">
            <h2 className="font-bold text-[#D64550] text-sm uppercase tracking-wide mb-3">
              ⚠ Unpaid Sessions ({unpaidSessions.length})
            </h2>
            <div className="space-y-2">
              {unpaidSessions.map((s) => (
                <div key={s.name} className="flex justify-between items-center text-sm">
                  <span className="text-[#3D2817]">
                    Table {s.table} · <span className="text-[#8A7967]">{s.customer}</span>
                  </span>
                  <span className="font-bold text-[#D64550]">₹{s.total_bill_amount}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {status === 'loading' && (
          <div className="text-center py-20">
            <div className="w-10 h-10 mx-auto mb-4 border-4 border-[#F4A340]/30 border-t-[#F4A340] rounded-full animate-spin" />
            <p className="text-[#FFF8ED]/80">Loading tables...</p>
          </div>
        )}

        {status === 'error' && (
          <div className="text-center py-20">
            <div className="text-5xl mb-4">🚫</div>
            <p className="text-[#FFF8ED] font-medium mb-2">{errorMsg}</p>
            <a href="/login" className="text-[#F4A340] underline text-sm">Back to login</a>
          </div>
        )}

        {status === 'ready' && (
          <>
            {errorMsg && (
              <div className="bg-[#D64550]/10 border border-[#D64550]/30 text-[#D64550] text-sm px-4 py-2.5 rounded-xl mb-6 font-medium max-w-2xl mx-auto">
                {errorMsg}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {tables.map((table) => {
                const style = STATUS_STYLES[table.status] || STATUS_STYLES.Free;
                const session = table.active_session;
                const qr = qrByTable[table.name];

                return (
                  <div key={table.name} className="bg-[#FFF8ED] rounded-2xl shadow-lg overflow-hidden">
                    <div className="flex items-center justify-between px-5 py-4" style={{ backgroundColor: style.bg }}>
                      <div>
                        <p className="text-xs uppercase tracking-wide opacity-80" style={{ color: style.text }}>
                          Table
                        </p>
                        <p className="text-2xl font-bold" style={{ color: style.text, fontFamily: "'Baloo 2', sans-serif" }}>
                          {table.table_number}
                        </p>
                      </div>
                      <span
                        className="text-xs font-bold uppercase tracking-wide px-2.5 py-1 rounded-full"
                        style={{ backgroundColor: 'rgba(255,255,255,0.25)', color: style.text }}
                      >
                        {table.status}
                      </span>
                    </div>

                    <div className="px-5 py-4">
                      <p className="text-xs text-[#8A7967] mb-3">
                        {table.zonelocation} · Seats {table.seating_capacity}
                      </p>

                      {session ? (
                        <div className="space-y-2 mb-4">
                          <div className="flex justify-between text-sm">
                            <span className="text-[#8A7967]">Customer</span>
                            <span className="font-medium text-[#3D2817] truncate ml-2">{session.customer}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-[#8A7967]">Party size</span>
                            <span className="font-medium text-[#3D2817]">{session.party_size}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-[#8A7967]">Bill so far</span>
                            <span className="font-medium text-[#3D2817]">₹{session.total_bill_amount || 0}</span>
                          </div>
                          <div className="flex justify-between text-sm items-center">
                            <span className="text-[#8A7967]">Payment</span>
                            <span
                              className="text-xs font-bold uppercase px-2 py-0.5 rounded-full"
                              style={{
                                backgroundColor: table.is_paid ? '#2D6A4F20' : '#D6455020',
                                color: table.is_paid ? '#2D6A4F' : '#D64550',
                              }}
                            >
                              {table.is_paid ? 'Paid' : 'Unpaid'}
                            </span>
                          </div>
                        </div>
                      ) : (
                        <p className="text-sm text-[#8A7967] mb-4 italic">No active session</p>
                      )}

                      <div className="space-y-2">
                        {table.status === 'Cleaning' && (
                          <button
                            onClick={() => handleMarkFree(table.name)}
                            disabled={actingOn === table.name}
                            className="w-full bg-[#1B4332] hover:bg-[#163a2a] disabled:opacity-60 text-[#FFF8ED] text-sm font-bold py-2.5 rounded-xl transition-colors"
                          >
                            {actingOn === table.name ? 'Marking Free...' : 'Mark Free'}
                          </button>
                        )}

                        {session && table.status === 'Occupied' && (
                          <button
                            onClick={() => handleForceEnd(session.name)}
                            disabled={actingOn === session.name}
                            className="w-full bg-[#D64550] hover:bg-[#C43A44] disabled:opacity-60 text-[#FFF8ED] text-sm font-bold py-2.5 rounded-xl transition-colors"
                          >
                            {actingOn === session.name ? 'Ending...' : 'Force End Session'}
                          </button>
                        )}

                        <button
                          onClick={() => handleToggleQr(table.name)}
                          disabled={qrLoadingTable === table.name}
                          className="w-full bg-[#E8DFC8] hover:bg-[#ddd2b4] disabled:opacity-60 text-[#3D2817] text-sm font-bold py-2.5 rounded-xl transition-colors"
                        >
                          {qrLoadingTable === table.name ? 'Loading QR...' : qr ? 'Hide QR Code' : 'Show QR Code'}
                        </button>
                      </div>

                      {qr && (
                        <div className="mt-4 text-center border-t-2 border-dashed border-[#E8DFC8] pt-4">
                          <img
                            src={`data:image/png;base64,${qr.qr_image_base64}`}
                            alt={`QR code for Table ${qr.table_number}`}
                            className="w-32 h-32 mx-auto rounded-lg border border-[#E8DFC8]"
                          />
                          <p className="text-xs text-[#8A7967] mt-2 break-all">{qr.checkin_url}</p>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
