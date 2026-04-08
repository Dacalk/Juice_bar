import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import {
  BarChart3,
  TrendingDown,
  ShoppingBag,
  DollarSign,
  Calendar,
  Download,
  FileText,
  Loader2,
  ArrowUpRight,
  Printer
} from 'lucide-react';
import useAuthStore from '../../store/useAuthStore';
import Logo from '../../components/Logo';

import { API_URL } from '../../store/useAuthStore';


const Reports = () => {
  const [reportData, setReportData] = useState({
    total_sales: 0,
    total_cost: 0,
    total_profit: 0,
    num_orders: 0,
    orders: []
  });
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const token = useAuthStore(state => state.token);
  const user = useAuthStore(state => state.user);

  useEffect(() => {
    fetchReport();
  }, [startDate, endDate]);

  const fetchReport = async () => {
    setLoading(true);
    try {
      const params = {};
      if (startDate) params.start_date = startDate;
      if (endDate) params.end_date = endDate;
      const response = await axios.get(`${API_URL}/reports/daily`, {
        headers: { Authorization: `Bearer ${token}` },
        params
      });
      setReportData(response.data);
    } catch (err) {
      setError('Failed to fetch report data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = () => {
    if (!reportData.orders || reportData.orders.length === 0) return;
    const profitMargin = reportData.total_sales > 0
      ? ((reportData.total_profit / reportData.total_sales) * 100).toFixed(1)
      : '0.0';

    const summaryRows = [
      [`"Juice Bar POS — Sales Report"`],
      [`"Period: ${startDate || 'All'} to ${endDate || 'Current'}"`],
      [],
      ['"Total Revenue (LKR)"', `"${reportData.total_sales.toFixed(2)}"`],
      ['"Total Cost (LKR)"', `"${(reportData.total_cost || 0).toFixed(2)}"`],
      ['"Net Profit (LKR)"', `"${(reportData.total_profit || 0).toFixed(2)}"`],
      ['"Profit Margin (%)"', `"${profitMargin}%"`],
      ['"Total Orders"', `"${reportData.num_orders}"`],
      [],
    ];

    const headers = ['"Invoice"', '"Date"', '"Time"', '"Revenue (LKR)"', '"Cost (LKR)"', '"Profit (LKR)"', '"Margin %"'];
    const dataRows = reportData.orders.map(o => {
      const revenue = o.total || 0;
      const cost = o.cost || 0;
      const profit = o.profit || 0;
      const margin = revenue > 0 ? ((profit / revenue) * 100).toFixed(1) : '0.0';
      return [
        `"${o.invoice_number}"`,
        `"${new Date(o.timestamp).toLocaleDateString()}"`,
        `"${new Date(o.timestamp).toLocaleTimeString()}"`,
        revenue.toFixed(2), cost.toFixed(2), profit.toFixed(2), `"${margin}%"`
      ].join(',');
    });

    const csvContent = [
      ...summaryRows.map(r => r.join(',')),
      headers.join(','),
      ...dataRows
    ].join('\n');

    const BOM = '\uFEFF';
    const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `ProfitReport_${startDate || 'All'}_to_${endDate || 'Now'}.csv`.replace(/\s+/g, '_'));
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const profitMarginPct = reportData.total_sales > 0
    ? ((reportData.total_profit / reportData.total_sales) * 100).toFixed(1)
    : '0.0';

  const costMarginPct = reportData.total_sales > 0
    ? ((reportData.total_cost / reportData.total_sales) * 100).toFixed(1)
    : '0.0';

  const avgTicket = reportData.num_orders > 0
    ? (reportData.total_sales / reportData.num_orders).toFixed(2)
    : '0.00';

  const periodLabel = startDate && endDate
    ? `${startDate} to ${endDate}`
    : startDate
    ? `From ${startDate}`
    : endDate
    ? `Up to ${endDate}`
    : `Today — ${new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}`;

  const printDate = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });

  // ─── Stat Card (screen only) ─────────────────────────────────────────────
  const StatCard = ({ title, value, icon: Icon, trend, colorClass, bgClass }) => (
    <div className="glass-panel rounded-[2rem] border border-white/5 relative overflow-hidden group hover:bg-white/5 transition-all p-5 sm:p-6 flex flex-col gap-3">
      <div className={`absolute -right-6 -top-6 w-24 h-24 rounded-full opacity-10 group-hover:opacity-20 transition-opacity pointer-events-none ${bgClass || colorClass}`}></div>
      <div className="flex items-center justify-between relative z-10">
        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{title}</p>
        <div className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-300">
          <Icon size={16} className={colorClass} />
        </div>
      </div>
      <h3 className={`text-2xl font-black tracking-tight leading-tight relative z-10 ${colorClass}`}>{value}</h3>
      {trend && <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider relative z-10">{trend}</p>}
    </div>
  );

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 w-full pb-12 px-4 sm:px-6">

      {/* ── PRINT TEMPLATE (hidden on screen, visible only when printing) ── */}
      <div id="print-report" className="hidden print:block">
        <style dangerouslySetInnerHTML={{ __html: `
          @media print {
            /* Hide everything else on the page */
            body * { visibility: hidden !important; }
            /* Show ONLY the print report */
            #print-report, #print-report * { visibility: visible !important; }
            #print-report {
              position: absolute !important;
              top: 0 !important;
              left: 0 !important;
              width: 100% !important;
              background: white !important;
              padding: 15mm 20mm !important; 
              box-sizing: border-box !important;
            }
            /* margin: 0 removes browser-injected headers and footers mathematically */
            @page { margin: 0; size: A4 portrait; }
          }
        `}} />

        {/* Report content template matching user requirements */}
        <div style={{ fontFamily: 'Arial, sans-serif', color: '#000', background: '#fff', padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
          
          <h1 style={{ textAlign: 'center', color: '#0070c0', fontSize: '18px', margin: '15px 0 35px 0', textTransform: 'uppercase', fontWeight: 'bold' }}>BUSINESS SALES REPORT</h1>

          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '30px', fontSize: '12px' }}>
            <table style={{ width: '40%', borderCollapse: 'collapse', border: '1px solid #d9d9d9', height: 'fit-content' }}>
              <tbody>
                <tr>
                  <td style={{ border: '1px solid #d9d9d9', padding: '4px 8px', color: '#555' }}>Period:</td>
                  <td style={{ border: '1px solid #d9d9d9', padding: '4px 8px' }}>{periodLabel}</td>
                </tr>
                <tr>
                  <td style={{ border: '1px solid #d9d9d9', padding: '4px 8px', color: '#555' }}>Generated:</td>
                  <td style={{ border: '1px solid #d9d9d9', padding: '4px 8px' }}>{printDate}</td>
                </tr>
                <tr>
                  <td style={{ border: '1px solid #d9d9d9', padding: '4px 8px', color: '#555' }}>Operator ID:</td>
                  <td style={{ border: '1px solid #d9d9d9', padding: '4px 8px' }}>#{user ? user.username.toUpperCase() : 'SYS'}</td>
                </tr>
                <tr>
                  <td style={{ border: '1px solid #d9d9d9', padding: '4px 8px', color: '#555' }}>Terminal:</td>
                  <td style={{ border: '1px solid #d9d9d9', padding: '4px 8px' }}>POS Main</td>
                </tr>
                <tr>
                  <td style={{ border: '1px solid #d9d9d9', padding: '4px 8px', color: '#555' }}>Manager:</td>
                  <td style={{ border: '1px solid #d9d9d9', padding: '4px 8px' }}>{user?.username || 'Admin'}</td>
                </tr>
              </tbody>
            </table>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', textAlign: 'left', minWidth: '220px' }}>
              <div style={{ color: '#0070c0', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', marginBottom: '4px' }}>
                <div style={{ backgroundColor: '#fff', display: 'flex', alignItems: 'center' }}>
                  <Logo size={24} />
                </div>
                Juice Bar POS
              </div>
              <div style={{ color: '#333' }}>Primary Business Address</div>
              <div style={{ color: '#333' }}>Colombo, Sri Lanka</div>
              <div style={{ color: '#333' }}>Phone: +94-11-234-5678</div>
              <div style={{ color: '#333' }}>Fax: 555-555-5555</div>
              <div style={{ color: '#333' }}>Email: admin@juicebar.com</div>
            </div>
          </div>

          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', marginBottom: '20px' }}>
            <thead>
              <tr style={{ background: '#0070c0', color: 'white' }}>
                <th style={{ padding: '8px 10px', textAlign: 'left', border: '1px solid #0070c0', fontWeight: 'normal' }}>Date</th>
                <th style={{ padding: '8px 10px', textAlign: 'center', border: '1px solid #0070c0', borderLeft: '1px solid #4a9bd4', fontWeight: 'normal' }}>Time</th>
                <th style={{ padding: '8px 10px', textAlign: 'left', border: '1px solid #0070c0', borderLeft: '1px solid #4a9bd4', fontWeight: 'normal' }}>Invoice</th>
                <th style={{ padding: '8px 10px', textAlign: 'right', border: '1px solid #0070c0', borderLeft: '1px solid #4a9bd4', fontWeight: 'normal' }}>Revenue</th>
                <th style={{ padding: '8px 10px', textAlign: 'right', border: '1px solid #0070c0', borderLeft: '1px solid #4a9bd4', fontWeight: 'normal' }}>Cost</th>
                <th style={{ padding: '8px 10px', textAlign: 'right', border: '1px solid #0070c0', borderLeft: '1px solid #4a9bd4', fontWeight: 'bold' }}>Profit</th>
              </tr>
            </thead>
            <tbody>
              {reportData.orders.map((order, i) => (
                <tr key={order.id}>
                  <td style={{ padding: '6px 10px', borderRight: '1px solid #e0e0e0', borderBottom: '1px solid #e0e0e0', borderLeft: '1px solid #e0e0e0' }}>{new Date(order.timestamp).toLocaleDateString('en-GB')}</td>
                  <td style={{ padding: '6px 10px', textAlign: 'center', borderRight: '1px solid #e0e0e0', borderBottom: '1px solid #e0e0e0', color: '#555' }}>{new Date(order.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</td>
                  <td style={{ padding: '6px 10px', borderRight: '1px solid #e0e0e0', borderBottom: '1px solid #e0e0e0' }}>{order.invoice_number}</td>
                  <td style={{ padding: '6px 10px', textAlign: 'right', borderRight: '1px solid #e0e0e0', borderBottom: '1px solid #e0e0e0' }}>Rs. {order.total.toFixed(2)}</td>
                  <td style={{ padding: '6px 10px', textAlign: 'right', borderRight: '1px solid #e0e0e0', borderBottom: '1px solid #e0e0e0', color: '#555' }}>Rs. {(order.cost || 0).toFixed(2)}</td>
                  <td style={{ padding: '6px 10px', textAlign: 'right', borderRight: '1px solid #e0e0e0', borderBottom: '1px solid #e0e0e0' }}>Rs. {(order.profit || 0).toFixed(2)}</td>
                </tr>
              ))}
              {/* Fill empty rows to make the grid look like the template if less than 8 items */}
              {Array.from({ length: Math.max(0, 8 - reportData.orders.length) }).map((_, i) => (
                 <tr key={`empty-${i}`}>
                   <td style={{ padding: '13px 10px', borderRight: '1px solid #e0e0e0', borderBottom: '1px solid #e0e0e0', borderLeft: '1px solid #e0e0e0' }}></td>
                   <td style={{ padding: '13px 10px', borderRight: '1px solid #e0e0e0', borderBottom: '1px solid #e0e0e0' }}></td>
                   <td style={{ padding: '13px 10px', borderRight: '1px solid #e0e0e0', borderBottom: '1px solid #e0e0e0' }}></td>
                   <td style={{ padding: '13px 10px', borderRight: '1px solid #e0e0e0', borderBottom: '1px solid #e0e0e0' }}></td>
                   <td style={{ padding: '13px 10px', borderRight: '1px solid #e0e0e0', borderBottom: '1px solid #e0e0e0' }}></td>
                   <td style={{ padding: '13px 10px', borderRight: '1px solid #e0e0e0', borderBottom: '1px solid #e0e0e0' }}></td>
                 </tr>
              ))}
            </tbody>
          </table>

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '40px' }}>
            <table style={{ width: '280px', borderCollapse: 'collapse', fontSize: '11px', border: '1px solid #d9d9d9' }}>
              <tbody>
                <tr>
                  <td style={{ padding: '6px 10px', textAlign: 'right', borderBottom: '1px solid #e0e0e0', borderRight: '1px solid #e0e0e0', fontWeight: 'bold' }}>Total Revenue</td>
                  <td style={{ padding: '6px 10px', textAlign: 'right', borderBottom: '1px solid #e0e0e0' }}>Rs. {reportData.total_sales.toFixed(2)}</td>
                </tr>
                <tr>
                  <td style={{ padding: '6px 10px', textAlign: 'right', borderBottom: '1px solid #e0e0e0', borderRight: '1px solid #e0e0e0', fontWeight: 'bold' }}>Less COGS</td>
                  <td style={{ padding: '6px 10px', textAlign: 'right', borderBottom: '1px solid #e0e0e0' }}>Rs. {(reportData.total_cost || 0).toFixed(2)}</td>
                </tr>
                <tr>
                  <td style={{ padding: '6px 10px', textAlign: 'right', borderBottom: '1px solid #e0e0e0', borderRight: '1px solid #e0e0e0', fontWeight: 'bold' }}>Service/Other Fees</td>
                  <td style={{ padding: '6px 10px', textAlign: 'right', borderBottom: '1px solid #e0e0e0' }}>Rs. 0.00</td>
                </tr>
                <tr style={{ background: '#f5f9ff' }}>
                  <td style={{ padding: '6px 10px', textAlign: 'right', color: '#0070c0', fontWeight: 'bold', borderRight: '1px solid #e0e0e0' }}>Net Profit</td>
                  <td style={{ padding: '6px 10px', textAlign: 'right', color: '#0070c0', fontWeight: 'bold' }}>Rs. {(reportData.total_profit || 0).toFixed(2)}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
      {/* ── END PRINT TEMPLATE ── */}


      {/* ══════════════════════════════════════════════════════════════════════
          SCREEN UI (hidden when printing)
         ══════════════════════════════════════════════════════════════════════ */}
      <div className="no-print">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white/5 p-8 rounded-[3rem] border border-white/5 shadow-3xl mb-8">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-[2rem] flex items-center justify-center text-slate-900 shadow-xl shadow-emerald-500/20 rotate-3">
              <BarChart3 size={32} />
            </div>
            <div>
              <h1 className="text-3xl font-black text-white tracking-tight leading-none uppercase">Sales & Profit Intel</h1>
              <p className="text-slate-500 text-[10px] uppercase font-bold tracking-widest mt-2">Revenue, cost & profit analytics.</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 bg-[#282828] border border-white/5 rounded-2xl px-4 py-2 h-12">
              <Calendar size={16} className="text-slate-500" />
              <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)}
                className="bg-transparent border-none text-xs font-bold text-white focus:ring-0 p-0 outline-none" />
              <span className="text-slate-500">to</span>
              <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)}
                className="bg-transparent border-none text-xs font-bold text-white focus:ring-0 p-0 outline-none" />
            </div>

            <button onClick={() => { setStartDate(''); setEndDate(''); }}
              className="h-12 px-6 bg-white/5 border border-white/10 text-white hover:bg-white/10 flex items-center justify-center rounded-2xl transition-all text-xs font-bold">
              Reset
            </button>

            <button onClick={() => window.print()}
              className="h-12 bg-white/10 text-white hover:bg-white/20 border border-white/10 px-6 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center gap-2 transition-all active:scale-95">
              <Printer size={16} />
              Print Report
            </button>

            <button onClick={handleExport} disabled={reportData.orders.length === 0}
              className="h-12 bg-emerald-500 text-white hover:bg-emerald-600 disabled:opacity-50 px-6 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-emerald-500/20 flex items-center gap-2 transition-all active:scale-95">
              <Download size={16} />
              Export CSV
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-32 space-y-4">
            <Loader2 size={48} className="text-emerald-500 animate-spin" />
            <p className="text-slate-400 font-black uppercase tracking-widest text-[10px]">Processing Transactional Data...</p>
          </div>
        ) : (
          <>
            {/* Stat Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 mb-8">
              <StatCard title="Total Revenue" value={`Rs. ${reportData.total_sales.toFixed(2)}`} icon={DollarSign}
                trend="Gross sales in period" colorClass="text-emerald-400" bgClass="bg-emerald-500" />
              <StatCard title="Transaction Count" value={reportData.num_orders.toString()} icon={ShoppingBag}
                trend="Orders completed" colorClass="text-teal-400" bgClass="bg-teal-500" />
              <StatCard title="Total Cost" value={`Rs. ${(reportData.total_cost || 0).toFixed(2)}`} icon={TrendingDown}
                trend="Based on cost prices" colorClass="text-amber-400" bgClass="bg-amber-500" />
              <StatCard title="Net Profit" value={`Rs. ${(reportData.total_profit || 0).toFixed(2)}`} icon={DollarSign}
                trend={`${profitMarginPct}% margin`}
                colorClass={(reportData.total_profit || 0) >= 0 ? 'text-lime-400' : 'text-red-400'}
                bgClass={(reportData.total_profit || 0) >= 0 ? 'bg-lime-500' : 'bg-red-500'} />
            </div>

            {/* Transactions Table */}
            <div className="glass-panel rounded-[2.5rem] overflow-hidden border border-white/5 shadow-2xl">
              <div className="p-8 border-b border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center text-emerald-400">
                    <FileText size={24} />
                  </div>
                  <h2 className="text-xl font-black uppercase tracking-tight text-white">Sales Activity</h2>
                </div>
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{reportData.orders.length} records</span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left min-w-[700px]">
                  <thead>
                    <tr className="bg-white/2 border-b border-white/5">
                      <th className="p-6 text-[10px] font-black text-slate-500 uppercase tracking-widest">Invoice</th>
                      <th className="p-6 text-[10px] font-black text-slate-500 uppercase tracking-widest text-center">Time</th>
                      <th className="p-6 text-[10px] font-black text-slate-500 uppercase tracking-widest text-right">Revenue</th>
                      <th className="p-6 text-[10px] font-black text-amber-500/70 uppercase tracking-widest text-right">Cost</th>
                      <th className="p-6 text-[10px] font-black text-lime-500/70 uppercase tracking-widest text-right">Profit</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {reportData.orders.map((order) => {
                      const profit = order.profit ?? 0;
                      const cost = order.cost ?? 0;
                      const marginPct = order.total > 0 ? ((profit / order.total) * 100).toFixed(0) : '0';
                      return (
                        <tr key={order.id} className="hover:bg-white/5 transition-colors group cursor-pointer">
                          <td className="p-6">
                            <div className="flex items-center gap-3 font-bold text-white">
                              <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0"></span>
                              <span className="text-sm">{order.invoice_number}</span>
                              <ArrowUpRight size={14} className="opacity-0 group-hover:opacity-100 transition-opacity text-slate-400" />
                            </div>
                          </td>
                          <td className="p-6 text-center">
                            <span className="text-sm font-bold text-slate-500">
                              {new Date(order.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </td>
                          <td className="p-6 text-right">
                            <span className="text-sm font-black text-white">Rs. {order.total.toFixed(2)}</span>
                          </td>
                          <td className="p-6 text-right">
                            <span className="text-sm font-bold text-amber-400">Rs. {cost.toFixed(2)}</span>
                          </td>
                          <td className="p-6 text-right">
                            <div>
                              <span className={`text-sm font-black ${profit >= 0 ? 'text-lime-400' : 'text-red-400'}`}>
                                Rs. {profit.toFixed(2)}
                              </span>
                              <span className="block text-[9px] text-slate-500 mt-0.5">{marginPct}% margin</span>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>

                {reportData.orders.length === 0 && !loading && (
                  <div className="p-24 text-center">
                    <p className="text-sm font-bold text-slate-500 italic">No transactions recorded for this period.</p>
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Reports;
