import { useState, useEffect, useMemo } from 'react';
import Navbar from '../../components/Navbar';
import Sidebar from '../../components/Sidebar';
import {
    getAllFines,
    getUnpaidFines,
    getPartiallyPaidFines,
    recordPayment,
    waiveFine,
    createManualFine,
    generateFineReport
} from '../../services/fineService';
import { getAllMembers } from '../../services/memberService';

export default function FinesManagement() {
    const [activeTab, setActiveTab] = useState('all');
    const [allFines, setAllFines] = useState([]);
    const [unpaidFines, setUnpaidFines] = useState([]);
    const [partiallyPaidFines, setPartiallyPaidFines] = useState([]);
    const [members, setMembers] = useState({});
    const [report, setReport] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');

    // Payment modal state
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [selectedFine, setSelectedFine] = useState(null);
    const [paymentAmount, setPaymentAmount] = useState('');
    const [paymentMethod, setPaymentMethod] = useState('CASH');
    const [paymentNotes, setPaymentNotes] = useState('');
    const [processingPayment, setProcessingPayment] = useState(false);

    // Manual fine modal state
    const [showManualFineModal, setShowManualFineModal] = useState(false);
    const [manualFineMemberID, setManualFineMemberID] = useState('');
    const [manualFineAmount, setManualFineAmount] = useState('');
    const [manualFineReason, setManualFineReason] = useState('');
    const [processingManualFine, setProcessingManualFine] = useState(false);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        setError(null);
        try {
            const [all, unpaid, partiallyPaid, membersData, reportData] = await Promise.all([
                getAllFines(),
                getUnpaidFines(),
                getPartiallyPaidFines(),
                getAllMembers(),
                generateFineReport()
            ]);

            setAllFines(all);
            setUnpaidFines(unpaid);
            setPartiallyPaidFines(partiallyPaid);
            setReport(reportData);

            const membersMap = {};
            membersData.forEach(member => membersMap[member.id] = member);
            setMembers(membersMap);
        } catch (error) {
            console.error('Error loading data:', error);
            setError('Failed to load data. Please check if the backend server is running.');
        } finally {
            setLoading(false);
        }
    };

    const handleRecordPayment = async () => {
        if (!paymentAmount || parseFloat(paymentAmount) <= 0) {
            setError('Please enter a valid payment amount (> 0).');
            return;
        }

        try {
            setProcessingPayment(true);
            await recordPayment(selectedFine.id, parseFloat(paymentAmount), paymentMethod, paymentNotes);
            setSuccess('Payment recorded successfully!');
            setShowPaymentModal(false);
            resetPaymentForm();
            loadData();
            setTimeout(() => setSuccess(null), 3000);
        } catch (error) {
            console.error('Error recording payment:', error);
            setError('Failed to record payment: ' + (error.response?.data?.message || 'Unknown error'));
        } finally {
            setProcessingPayment(false);
        }
    };

    const handleWaiveFine = async (fineID) => {
        const reason = prompt('Enter reason for waiving this fine:');
        if (!reason) return;

        try {
            setLoading(true);
            await waiveFine(fineID, reason);
            setSuccess('Fine waived successfully!');
            loadData();
            setTimeout(() => setSuccess(null), 3000);
        } catch (error) {
            console.error('Error waiving fine:', error);
            setError('Failed to waive fine: ' + (error.response?.data?.message || 'Unknown error'));
            setLoading(false);
        }
    };

    const handleCreateManualFine = async () => {
        if (!manualFineMemberID || !manualFineAmount || parseFloat(manualFineAmount) <= 0 || !manualFineReason) {
            setError('Please fill in all fields with valid amounts.');
            return;
        }

        try {
            setProcessingManualFine(true);
            await createManualFine(manualFineMemberID, parseFloat(manualFineAmount), manualFineReason);
            setSuccess('Fine created successfully!');
            setShowManualFineModal(false);
            resetManualFineForm();
            loadData();
            setTimeout(() => setSuccess(null), 3000);
        } catch (error) {
            console.error('Error creating fine:', error);
            setError('Failed to create fine: ' + (error.response?.data?.message || 'Unknown error'));
        } finally {
            setProcessingManualFine(false);
        }
    };

    const openPaymentModal = (fine) => {
        setSelectedFine(fine);
        setPaymentAmount(fine.amount - (fine.amountPaid || 0));
        setShowPaymentModal(true);
        setError(null);
    };

    const resetPaymentForm = () => {
        setSelectedFine(null);
        setPaymentAmount('');
        setPaymentMethod('CASH');
        setPaymentNotes('');
        setError(null);
    };

    const resetManualFineForm = () => {
        setManualFineMemberID('');
        setManualFineAmount('');
        setManualFineReason('');
        setError(null);
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString();
    };

    const formatCurrency = (amount) => {
        return `$${parseFloat(amount).toFixed(2)}`;
    };

    // Filter by search query
    const matchesSearch = (record) => {
        if (!searchQuery) return true;
        const q = searchQuery.toLowerCase();
        const memberName = members[record.memberID]?.name?.toLowerCase() || '';
        const memberContact = members[record.memberID]?.contact?.toLowerCase() || '';
        return memberName.includes(q) || memberContact.includes(q) || record.reason?.toLowerCase().includes(q);
    };

    const filteredAll = useMemo(() => allFines.filter(matchesSearch), [allFines, searchQuery, members]);
    const filteredUnpaid = useMemo(() => unpaidFines.filter(matchesSearch), [unpaidFines, searchQuery, members]);
    const filteredPartial = useMemo(() => partiallyPaidFines.filter(matchesSearch), [partiallyPaidFines, searchQuery, members]);

    const currentList = activeTab === 'all' ? filteredAll
        : activeTab === 'unpaid' ? filteredUnpaid
            : filteredPartial;

    const tabs = [
        { key: 'all', label: 'All Fines', icon: '📋', count: allFines.length, color: '#3498db' },
        { key: 'unpaid', label: 'Unpaid', icon: '⚠️', count: unpaidFines.length, color: '#e74c3c' },
        { key: 'partial', label: 'Partially Paid', icon: '⏳', count: partiallyPaidFines.length, color: '#f39c12' },
    ];

    const getStatusBadge = (status) => {
        const statusMap = {
            UNPAID: { label: 'Unpaid', style: styles.badgeUnpaid },
            PARTIALLY_PAID: { label: 'Partially Paid', style: styles.badgePartial },
            PAID: { label: 'Paid', style: styles.badgePaid },
            WAIVED: { label: 'Waived', style: styles.badgeWaived },
        };
        const st = statusMap[status] || { label: status, style: styles.badgeDefault };
        return <span style={st.style}>{st.label}</span>;
    };

    return (
        <>
            <Navbar />
            <div className="flex bg-[#f5f6fa] min-h-[calc(100vh-60px)]">
                <Sidebar role="admin" />
                <main className="flex-1 w-full lg:ml-[260px] p-4 lg:p-8 overflow-x-hidden">
                    {/* ── Page Header ── */}
                    <div className="flex flex-wrap justify-between items-center gap-4 mb-7">
                        <div>
                            <h1 className="text-[1.85rem] font-bold text-[#2c3e50] m-0">💳 Fines & Payments</h1>
                            <p className="text-[#7f8c8d] text-[0.95rem] mt-1">
                                Track financial obligations, record payments, and issue manual fines
                            </p>
                        </div>
                        <div className="flex gap-3">
                            <button
                                className="px-5 py-3 bg-gradient-to-br from-[#e74c3c] to-[#c0392b] text-white border-none rounded-xl cursor-pointer text-[0.95rem] font-semibold shadow-[0_4px_14px_rgba(231,76,60,0.3)] transition-all duration-300 hover:shadow-[0_6px_20px_rgba(231,76,60,0.4)] disabled:opacity-70"
                                onClick={() => setShowManualFineModal(true)}
                                disabled={loading}
                            >
                                ＋ Create Manual Fine
                            </button>
                            <button
                                onClick={loadData}
                                className="px-4 py-3 bg-white text-[#34495e] border-[1.5px] border-[#dfe6e9] rounded-xl cursor-pointer text-base transition-all duration-300 shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:bg-gray-50 disabled:opacity-70"
                                title="Refresh Data"
                                disabled={loading}
                            >
                                🔄
                            </button>
                        </div>
                    </div>

                    {/* ── Alerts ── */}
                    {error && !showPaymentModal && !showManualFineModal && (
                        <div style={styles.alertError}>
                            <span>❌ {error}</span>
                            <button onClick={() => setError(null)} style={styles.alertClose}>×</button>
                        </div>
                    )}
                    {success && (
                        <div style={styles.alertSuccess}>
                            <span>✅ {success}</span>
                            <button onClick={() => setSuccess(null)} style={styles.alertClose}>×</button>
                        </div>
                    )}

                    {/* ── Report Overview ── */}
                    {report && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                            <div className="bg-white p-5 rounded-xl shadow-sm flex items-center gap-4 transition-transform hover:-translate-y-1 hover:shadow-md border-l-4 border-l-[#3498db]">
                                <div className="w-12 h-12 rounded-xl bg-[#f8f9fb] flex items-center justify-center shrink-0">
                                    <span className="text-2xl">📋</span>
                                </div>
                                <div className="flex flex-col justify-center">
                                    <div className="text-2xl font-bold text-[#2c3e50] leading-tight">{formatCurrency(report.totalFines)}</div>
                                    <div className="text-[0.85rem] text-[#7f8c8d] font-semibold mt-1">Total Fines Issued</div>
                                    <div className="text-xs text-[#bdc3c7] mt-[2px]">{report.totalCount} fines</div>
                                </div>
                            </div>
                            <div className="bg-white p-5 rounded-xl shadow-sm flex items-center gap-4 transition-transform hover:-translate-y-1 hover:shadow-md border-l-4 border-l-[#27ae60]">
                                <div className="w-12 h-12 rounded-xl bg-[#f8f9fb] flex items-center justify-center shrink-0">
                                    <span className="text-2xl">💵</span>
                                </div>
                                <div className="flex flex-col justify-center">
                                    <div className="text-2xl font-bold text-[#27ae60] leading-tight">{formatCurrency(report.totalPaid)}</div>
                                    <div className="text-[0.85rem] text-[#7f8c8d] font-semibold mt-1">Total Collected</div>
                                    <div className="text-xs text-[#bdc3c7] mt-[2px]">{report.paidCount} paid</div>
                                </div>
                            </div>
                            <div className="bg-white p-5 rounded-xl shadow-sm flex items-center gap-4 transition-transform hover:-translate-y-1 hover:shadow-md border-l-4 border-l-[#e74c3c]">
                                <div className="w-12 h-12 rounded-xl bg-[#f8f9fb] flex items-center justify-center shrink-0">
                                    <span className="text-2xl">⚠️</span>
                                </div>
                                <div className="flex flex-col justify-center">
                                    <div className="text-2xl font-bold text-[#e74c3c] leading-tight">{formatCurrency(report.totalOutstanding)}</div>
                                    <div className="text-[0.85rem] text-[#7f8c8d] font-semibold mt-1">Total Outstanding</div>
                                    <div className="text-xs text-[#bdc3c7] mt-[2px]">{report.unpaidCount} unpaid, {report.partiallyPaidCount} partial</div>
                                </div>
                            </div>
                            <div className="bg-white p-5 rounded-xl shadow-sm flex items-center gap-4 transition-transform hover:-translate-y-1 hover:shadow-md border-l-4 border-l-[#9b59b6]">
                                <div className="w-12 h-12 rounded-xl bg-[#f8f9fb] flex items-center justify-center shrink-0">
                                    <span className="text-2xl">✨</span>
                                </div>
                                <div className="flex flex-col justify-center">
                                    <div className="text-2xl font-bold text-[#9b59b6] leading-tight">{report.waivedCount}</div>
                                    <div className="text-[0.85rem] text-[#7f8c8d] font-semibold mt-1">Fines Waived</div>
                                    <div className="text-xs text-[#bdc3c7] mt-[2px]">waived count</div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ── Toolbar: Tabs + Search ── */}
                    <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 mb-3">
                        <div className="flex bg-white rounded-xl p-1.5 shadow-sm overflow-x-auto hide-scrollbar gap-1">
                            {tabs.map(tab => (
                                <button
                                    key={tab.key}
                                    onClick={() => setActiveTab(tab.key)}
                                    className={`flex items-center justify-center gap-2 px-5 py-3 border-none border-b-[3px] bg-transparent cursor-pointer text-sm rounded-lg transition-all duration-250 font-medium whitespace-nowrap ${activeTab === tab.key ? 'text-[#2c3e50] font-bold bg-[#f8f9fb]' : 'border-transparent text-[#7f8c8d]'}`}
                                    style={activeTab === tab.key ? { borderBottomColor: tab.color } : {}}
                                >
                                    <span className="text-[1.1rem]">{tab.icon}</span>
                                    <span className="hidden sm:inline">{tab.label}</span>
                                    <span className="inline-flex items-center justify-center min-w-[24px] h-6 rounded-full text-xs font-bold px-1.5 transition-all duration-250" style={{
                                        backgroundColor: activeTab === tab.key ? tab.color : '#ecf0f1',
                                        color: activeTab === tab.key ? 'white' : '#7f8c8d',
                                    }}>
                                        {tab.count}
                                    </span>
                                </button>
                            ))}
                        </div>

                        <div className="flex-1 max-w-full md:max-w-[400px]">
                            <div className="flex items-center bg-white rounded-xl px-4 h-[46px] border-[1.5px] border-[#dfe6e9] shadow-sm focus-within:border-[#3498db] focus-within:ring-[3px] focus-within:ring-[#3498db]/15 transition-all">
                                <span className="text-[1.1rem] mr-2">🔍</span>
                                <input
                                    type="text"
                                    placeholder="Search member or reason…"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="flex-1 py-2.5 border-none outline-none text-[0.95rem] bg-transparent w-full"
                                />
                                {searchQuery && (
                                    <button onClick={() => setSearchQuery('')} className="bg-transparent border-none cursor-pointer text-[0.9rem] text-[#95a5a6] p-1 ml-1 hover:text-[#e74c3c]">✕</button>
                                )}
                            </div>
                        </div>
                    </div>

                    {!loading && (
                        <p className="text-[0.85rem] text-[#95a5a6] mb-4 mt-0">
                            Showing <strong>{currentList.length}</strong> records
                            {searchQuery && <> matching &quot;<em>{searchQuery}</em>&quot;</>}
                        </p>
                    )}

                    {/* ── Loading ── */}
                    {loading && (
                        <div className="text-center py-16">
                            <div className="w-10 h-10 border-4 border-[#dfe6e9] border-t-[#3498db] rounded-full animate-spin mx-auto mb-4"></div>
                            <p className="text-[#7f8c8d] text-base">Loading financial records…</p>
                        </div>
                    )}

                    {/* ── Content Area ── */}
                    {!loading && (
                        <div className="bg-white rounded-2xl shadow-[0_2px_12px_rgba(0,0,0,0.06)] overflow-hidden">
                            {currentList.length === 0 ? (
                                <div className="text-center py-20 px-8">
                                    <div className="text-[3.5rem] mb-4">
                                        {activeTab === 'all' ? '💳' : activeTab === 'unpaid' ? '🎉' : '⏳'}
                                    </div>
                                    <h3 className="text-[#2c3e50] mb-2 text-xl font-bold">
                                        {searchQuery ? 'No Matching Fines' : `No ${tabs.find(t => t.key === activeTab)?.label} Found`}
                                    </h3>
                                    <p className="text-[#95a5a6] text-[0.95rem] max-w-[380px] mx-auto">
                                        {searchQuery
                                            ? 'Try adjusting your search criteria.'
                                            : activeTab === 'unpaid'
                                                ? 'Great news! There are no unpaid fines.'
                                                : 'There are no financial records to display.'}
                                    </p>
                                </div>
                            ) : (
                                <div className="w-full overflow-x-auto hide-scrollbar">
                                    <table className="w-full border-collapse min-w-[800px] text-left">
                                        <thead>
                                            <tr>
                                                <th className="p-4 bg-[#f8f9fb] text-[#7f8c8d] text-xs uppercase tracking-wider font-bold border-b-2 border-[#ecf0f1]">Member</th>
                                                <th className="p-4 bg-[#f8f9fb] text-[#7f8c8d] text-xs uppercase tracking-wider font-bold border-b-2 border-[#ecf0f1]">Amount</th>
                                                <th className="p-4 bg-[#f8f9fb] text-[#7f8c8d] text-xs uppercase tracking-wider font-bold border-b-2 border-[#ecf0f1]">Paid</th>
                                                <th className="p-4 bg-[#f8f9fb] text-[#7f8c8d] text-xs uppercase tracking-wider font-bold border-b-2 border-[#ecf0f1]">Outstanding</th>
                                                <th className="p-4 bg-[#f8f9fb] text-[#7f8c8d] text-xs uppercase tracking-wider font-bold border-b-2 border-[#ecf0f1]">Reason</th>
                                                <th className="p-4 bg-[#f8f9fb] text-[#7f8c8d] text-xs uppercase tracking-wider font-bold border-b-2 border-[#ecf0f1]">Issue Date</th>
                                                <th className="p-4 bg-[#f8f9fb] text-[#7f8c8d] text-xs uppercase tracking-wider font-bold border-b-2 border-[#ecf0f1] text-center">Status</th>
                                                <th className="p-4 bg-[#f8f9fb] text-[#7f8c8d] text-xs uppercase tracking-wider font-bold border-b-2 border-[#ecf0f1] text-center">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {currentList.map(fine => {
                                                const outstanding = fine.amount - (fine.amountPaid || 0);
                                                return (
                                                    <tr key={fine.id} className="border-b border-[#f1f3f5] transition-colors hover:bg-[#f0f7ff]">
                                                        <td className="p-4 py-3.5 text-[0.92rem] text-[#2c3e50] align-middle">
                                                            <div className="flex items-center gap-3">
                                                                <div className="w-[38px] h-[38px] rounded-full bg-gradient-to-br from-[#3498db] to-[#2980b9] text-white flex items-center justify-center text-[0.9rem] font-bold shrink-0">
                                                                    {(members[fine.memberID]?.name || '?').charAt(0).toUpperCase()}
                                                                </div>
                                                                <div>
                                                                    <strong className="text-[#2c3e50]">{members[fine.memberID]?.name || fine.memberID}</strong>
                                                                    <div className="text-[0.8rem] text-[#95a5a6]">
                                                                        {members[fine.memberID]?.contact || ''}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="p-4 py-3.5 text-[0.92rem] text-[#2c3e50] align-middle font-semibold">{formatCurrency(fine.amount)}</td>
                                                        <td className="p-4 py-3.5 text-[0.92rem] align-middle text-[#27ae60]">{formatCurrency(fine.amountPaid || 0)}</td>
                                                        <td className="p-4 py-3.5 text-[0.92rem] text-[#2c3e50] align-middle">
                                                            <span className={outstanding > 0 ? "text-[#e74c3c] font-bold" : ""}>
                                                                {formatCurrency(outstanding)}
                                                            </span>
                                                        </td>
                                                        <td className="p-4 py-3.5 text-[0.92rem] text-[#2c3e50] align-middle max-w-[200px]">
                                                            <div className="whitespace-nowrap overflow-hidden text-ellipsis" title={fine.reason}>
                                                                {fine.reason}
                                                            </div>
                                                        </td>
                                                        <td className="p-4 py-3.5 text-[0.92rem] text-[#2c3e50] align-middle">{formatDate(fine.issueDate)}</td>
                                                        <td className="p-4 py-3.5 text-[0.92rem] align-middle text-center">
                                                            {getStatusBadge(fine.status)}
                                                        </td>
                                                        <td className="p-4 py-3.5 text-[0.92rem] align-middle text-center">
                                                            <div className="flex gap-2 justify-center">
                                                                {(fine.status === 'UNPAID' || fine.status === 'PARTIALLY_PAID') && (
                                                                    <>
                                                                        <button
                                                                            className="px-3 py-2 bg-gradient-to-br from-[#2ecc71] to-[#27ae60] text-white border-none rounded-lg cursor-pointer text-[0.85rem] font-semibold transition-all duration-200 shadow-[0_2px_8px_rgba(46,204,113,0.3)] hover:-translate-y-0.5"
                                                                            onClick={() => openPaymentModal(fine)}
                                                                            title="Record Payment"
                                                                        >
                                                                            💵 Pay
                                                                        </button>
                                                                        <button
                                                                            className="px-3 py-2 bg-white text-[#7f8c8d] border-[1.5px] border-[#bdc3c7] rounded-lg cursor-pointer text-[0.85rem] font-semibold transition-all duration-200 hover:bg-gray-50 hover:-translate-y-0.5"
                                                                            onClick={() => handleWaiveFine(fine.id)}
                                                                            title="Waive Fine"
                                                                        >
                                                                            ✨ Waive
                                                                        </button>
                                                                    </>
                                                                )}
                                                            </div>
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    )}
                </main>
            </div>

            {/* Payment Modal */}
            {showPaymentModal && selectedFine && (
                <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-[1000] backdrop-blur-sm" onClick={() => !processingPayment && setShowPaymentModal(false)}>
                    <div className="bg-white rounded-2xl p-8 max-w-[480px] w-[95%] max-h-[90vh] overflow-y-auto shadow-[0_10px_40px_rgba(0,0,0,0.15)] animate-modalFadeIn" onClick={(e) => e.stopPropagation()}>
                        <div className="flex justify-between items-center mb-6 border-b border-[#f1f3f5] pb-4">
                            <h2 className="text-[#2c3e50] m-0 text-[1.4rem] font-bold">Record Payment</h2>
                            <button className="bg-transparent border-none text-[1.4rem] text-[#95a5a6] cursor-pointer p-1 leading-none hover:text-[#e74c3c]" onClick={() => !processingPayment && setShowPaymentModal(false)} disabled={processingPayment}>✕</button>
                        </div>

                        {error && (
                            <div className="bg-gradient-to-br from-[#fff5f5] to-[#ffe3e3] text-[#c0392b] py-3.5 px-5 rounded-xl mb-5 flex justify-between items-center border border-[#f5c6cb] animate-fadeSlideIn">
                                {error}
                                <button className="bg-transparent border-none text-[1.4rem] cursor-pointer text-inherit p-0 leading-none" onClick={() => setError('')}>✕</button>
                            </div>
                        )}

                        <div className="mb-6">
                            <div className="bg-[#f8f9fb] px-5 py-4 rounded-xl mb-6 border border-[#dfe6e9] flex flex-col gap-2">
                                <div className="flex justify-between text-[0.95rem] text-[#34495e]">
                                    <span>Member:</span>
                                    <strong>{members[selectedFine.memberID]?.name || selectedFine.memberID}</strong>
                                </div>
                                <div className="flex justify-between text-[0.95rem] text-[#34495e]">
                                    <span>Reason:</span>
                                    <strong className="text-right max-w-[60%]">{selectedFine.reason}</strong>
                                </div>
                                <div className="flex justify-between text-[0.95rem] text-[#34495e]">
                                    <span>Total Fine:</span>
                                    <strong>{formatCurrency(selectedFine.amount)}</strong>
                                </div>
                                <div className="flex justify-between text-[0.95rem] text-[#34495e]">
                                    <span>Previously Paid:</span>
                                    <strong className="text-[#27ae60]">{formatCurrency(selectedFine.amountPaid || 0)}</strong>
                                </div>
                                <hr className="border-t border-[#dfe6e9] my-1" />
                                <div className="flex justify-between text-[0.95rem] text-[#34495e]">
                                    <span>Current Outstanding:</span>
                                    <strong className="text-[#e74c3c] text-lg">{formatCurrency(selectedFine.amount - (selectedFine.amountPaid || 0))}</strong>
                                </div>
                            </div>

                            <div className="mb-5 flex flex-col gap-1.5">
                                <label className="text-[0.88rem] font-semibold text-[#2c3e50]">Payment Amount <span className="text-[#e74c3c]">*</span></label>
                                <div className="flex items-center border-[1.5px] border-[#dfe6e9] rounded-lg bg-[#fafbfc] overflow-hidden focus-within:border-[#3498db] focus-within:ring-[3px] focus-within:ring-[#3498db]/15 transition-all">
                                    <span className="py-3 px-3.5 bg-[#f1f3f5] text-[#7f8c8d] font-semibold border-r border-[#dfe6e9]">$</span>
                                    <input
                                        type="number"
                                        min="0.01"
                                        step="0.01"
                                        max={selectedFine.amount - (selectedFine.amountPaid || 0)}
                                        value={paymentAmount}
                                        onChange={(e) => setPaymentAmount(e.target.value)}
                                        placeholder="0.00"
                                        className="flex-1 py-3 px-3.5 border-none outline-none text-[0.95rem] bg-transparent"
                                        disabled={processingPayment}
                                    />
                                </div>
                            </div>
                            <textarea
                                style={{ ...styles.input, minHeight: '80px', resize: 'vertical' }}
                                value={paymentNotes}
                                onChange={(e) => setPaymentNotes(e.target.value)}
                                placeholder="Add any relevant notes..."
                                disabled={processingPayment}
                            />
                        </div>
                        <div style={styles.modalActions}>
                            <button
                                style={{ ...styles.btnFormCancel, opacity: processingPayment ? 0.5 : 1 }}
                                onClick={() => !processingPayment && setShowPaymentModal(false)}
                                disabled={processingPayment}
                            >
                                Cancel
                            </button>
                            <button
                                style={{ ...styles.btnSubmit, opacity: processingPayment ? 0.7 : 1 }}
                                onClick={handleRecordPayment}
                                disabled={processingPayment}
                            >
                                {processingPayment ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                        Processing…
                                    </>
                                ) : (
                                    '✅ Confirm Payment'
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ── Manual Fine Modal ── */}
            {showManualFineModal && (
                <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-[1000] backdrop-blur-sm" onClick={() => !processingManualFine && setShowManualFineModal(false)}>
                    <div className="bg-white rounded-2xl p-8 max-w-[480px] w-[95%] max-h-[90vh] overflow-y-auto shadow-[0_10px_40px_rgba(0,0,0,0.15)] animate-modalFadeIn" onClick={(e) => e.stopPropagation()}>
                        <div className="flex justify-between items-center mb-6 border-b border-[#f1f3f5] pb-4">
                            <h2 className="text-[#2c3e50] m-0 text-[1.4rem] font-bold">Issue Manual Fine</h2>
                            <button className="bg-transparent border-none text-[1.4rem] text-[#95a5a6] cursor-pointer p-1 leading-none hover:text-[#e74c3c]" onClick={() => !processingManualFine && setShowManualFineModal(false)} disabled={processingManualFine}>✕</button>
                        </div>

                        {error && (
                            <div className="bg-gradient-to-br from-[#fff5f5] to-[#ffe3e3] text-[#c0392b] py-3.5 px-5 rounded-xl mb-5 flex justify-between items-center border border-[#f5c6cb] animate-fadeSlideIn">
                                {error}
                                <button className="bg-transparent border-none text-[1.4rem] cursor-pointer text-inherit p-0 leading-none" onClick={() => setError('')}>✕</button>
                            </div>
                        )}

                        <div className="mb-6">
                            <div className="mb-5 flex flex-col gap-1.5">
                                <label className="text-[0.88rem] font-semibold text-[#2c3e50]">Member <span className="text-[#e74c3c]">*</span></label>
                                <select
                                    value={manualFineData.memberID}
                                    onChange={(e) => setManualFineData({ ...manualFineData, memberID: e.target.value })}
                                    className="w-full py-3 px-3.5 border-[1.5px] border-[#dfe6e9] rounded-lg text-[0.95rem] bg-[#fafbfc] text-[#2c3e50] focus:border-[#3498db] focus:ring-[3px] focus:ring-[#3498db]/15 outline-none transition-all"
                                    disabled={processingManualFine}
                                >
                                    <option value="">Select a member...</option>
                                    {Object.values(members).map(member => (
                                        <option key={member.id} value={member.id}>
                                            {member.name} ({member.email})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="mb-5 flex flex-col gap-1.5">
                                <label className="text-[0.88rem] font-semibold text-[#2c3e50]">Fine Amount <span className="text-[#e74c3c]">*</span></label>
                                <div className="flex items-center border-[1.5px] border-[#dfe6e9] rounded-lg bg-[#fafbfc] overflow-hidden focus-within:border-[#3498db] focus-within:ring-[3px] focus-within:ring-[#3498db]/15 transition-all">
                                    <span className="py-3 px-3.5 bg-[#f1f3f5] text-[#7f8c8d] font-semibold border-r border-[#dfe6e9]">$</span>
                                    <input
                                        type="number"
                                        min="0.01"
                                        step="0.01"
                                        value={manualFineData.amount}
                                        onChange={(e) => setManualFineData({ ...manualFineData, amount: e.target.value })}
                                        placeholder="0.00"
                                        className="flex-1 py-3 px-3.5 border-none outline-none text-[0.95rem] bg-transparent"
                                        disabled={processingManualFine}
                                    />
                                </div>
                            </div>

                            <div className="mb-5 flex flex-col gap-1.5">
                                <label className="text-[0.88rem] font-semibold text-[#2c3e50]">Reason <span className="text-[#e74c3c]">*</span></label>
                                <textarea
                                    value={manualFineData.reason}
                                    onChange={(e) => setManualFineData({ ...manualFineData.reason, reason: e.target.value })}
                                    placeholder="Brief description of why the fine is being issued..."
                                    rows="3"
                                    className="w-full py-3 px-3.5 border-[1.5px] border-[#dfe6e9] rounded-lg text-[0.95rem] bg-[#fafbfc] text-[#2c3e50] focus:border-[#3498db] focus:ring-[3px] focus:ring-[#3498db]/15 outline-none transition-all resize-y min-h-[80px]"
                                    disabled={processingManualFine}
                                />
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 mt-8 border-t border-[#f1f3f5] pt-6">
                            <button
                                className="py-3 px-6 bg-white text-[#7f8c8d] border-[1.5px] border-[#dfe6e9] rounded-lg cursor-pointer text-[0.95rem] font-semibold transition-all duration-200 hover:bg-gray-50"
                                onClick={() => setShowManualFineModal(false)}
                                disabled={processingManualFine}
                            >
                                Cancel
                            </button>
                            <button
                                className="py-3 px-6 bg-gradient-to-br from-[#e74c3c] to-[#c0392b] text-white border-none rounded-lg cursor-pointer text-[0.95rem] font-semibold transition-all duration-200 shadow-[0_4px_14px_rgba(231,76,60,0.3)] hover:-translate-y-0.5 disabled:opacity-70 flex items-center gap-2"
                                onClick={handleManualFineSubmit}
                                disabled={processingManualFine || !manualFineData.memberID || !manualFineData.amount || !manualFineData.reason}
                            >
                                {processingManualFine ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                        Processing…
                                    </>
                                ) : (
                                    'Issue Fine'
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )
            }

            {/* Injected responsive + animation styles */}
            <style>{`
            @keyframes fadeSlideIn {
                from { opacity: 0; transform: translateY(-12px); }
                to   { opacity: 1; transform: translateY(0); }
            }
            @keyframes slideInRight {
                from { opacity: 0; transform: translateX(20px); }
                to   { opacity: 1; transform: translateX(0); }
            }
            @keyframes spin {
                to { transform: rotate(360deg); }
            }
            @keyframes modalFadeIn {
                from { opacity: 0; transform: scale(0.95) translateY(10px); }
                to   { opacity: 1; transform: scale(1) translateY(0); }
            }
            
            /* Responsive Utilities */
            @media (max-width: 1024px) {
                .fines-stats-grid { grid-template-columns: repeat(2, 1fr) !important; }
            }
            @media (max-width: 768px) {
                main { margin-left: 0 !important; padding: 1rem !important; }
                .fines-stats-grid { grid-template-columns: 1fr 1fr !important; gap: 0.75rem !important; }
            }
            @media (max-width: 480px) {
                .fines-stats-grid { grid-template-columns: 1fr !important; }
            }

            /* Custom Webkit Scrollbar */
            .hide-scrollbar::-webkit-scrollbar { display: none; }
            .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        `}</style>
        </>
    );
}

export default Fines;
{
    showManualFineModal && (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-[1000] backdrop-blur-sm" onClick={() => !processingManualFine && setShowManualFineModal(false)}>
            <div className="bg-white rounded-2xl p-8 max-w-[480px] w-[95%] max-h-[90vh] overflow-y-auto shadow-[0_10px_40px_rgba(0,0,0,0.15)] animate-modalFadeIn" onClick={(e) => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-6 border-b border-[#f1f3f5] pb-4">
                    <h2 className="text-[#2c3e50] m-0 text-[1.4rem] font-bold">Issue Manual Fine</h2>
                    <button className="bg-transparent border-none text-[1.4rem] text-[#95a5a6] cursor-pointer p-1 leading-none hover:text-[#e74c3c]" onClick={() => !processingManualFine && setShowManualFineModal(false)} disabled={processingManualFine}>✕</button>
                </div>

                {error && (
                    <div className="bg-gradient-to-br from-[#fff5f5] to-[#ffe3e3] text-[#c0392b] py-3.5 px-5 rounded-xl mb-5 flex justify-between items-center border border-[#f5c6cb] animate-fadeSlideIn">
                        {error}
                        <button className="bg-transparent border-none text-[1.4rem] cursor-pointer text-inherit p-0 leading-none" onClick={() => setError('')}>✕</button>
                    </div>
                )}

                <div className="mb-6">
                    <div className="mb-5 flex flex-col gap-1.5">
                        <label className="text-[0.88rem] font-semibold text-[#2c3e50]">Member <span className="text-[#e74c3c]">*</span></label>
                        <select
                            value={manualFineData.memberID}
                            onChange={(e) => setManualFineData({ ...manualFineData, memberID: e.target.value })}
                            className="w-full py-3 px-3.5 border-[1.5px] border-[#dfe6e9] rounded-lg text-[0.95rem] bg-[#fafbfc] text-[#2c3e50] focus:border-[#3498db] focus:ring-[3px] focus:ring-[#3498db]/15 outline-none transition-all"
                            disabled={processingManualFine}
                        >
                            <option value="">Select a member...</option>
                            {Object.values(members).map(member => (
                                <option key={member.id} value={member.id}>
                                    {member.name} ({member.email})
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="mb-5 flex flex-col gap-1.5">
                        <label className="text-[0.88rem] font-semibold text-[#2c3e50]">Fine Amount <span className="text-[#e74c3c]">*</span></label>
                        <div className="flex items-center border-[1.5px] border-[#dfe6e9] rounded-lg bg-[#fafbfc] overflow-hidden focus-within:border-[#3498db] focus-within:ring-[3px] focus-within:ring-[#3498db]/15 transition-all">
                            <span className="py-3 px-3.5 bg-[#f1f3f5] text-[#7f8c8d] font-semibold border-r border-[#dfe6e9]">$</span>
                            <input
                                type="number"
                                min="0.01"
                                step="0.01"
                                value={manualFineData.amount}
                                onChange={(e) => setManualFineData({ ...manualFineData, amount: e.target.value })}
                                placeholder="0.00"
                                className="flex-1 py-3 px-3.5 border-none outline-none text-[0.95rem] bg-transparent"
                                disabled={processingManualFine}
                            />
                        </div>
                    </div>

                    <div className="mb-5 flex flex-col gap-1.5">
                        <label className="text-[0.88rem] font-semibold text-[#2c3e50]">Reason <span className="text-[#e74c3c]">*</span></label>
                        <textarea
                            value={manualFineData.reason}
                            onChange={(e) => setManualFineData({ ...manualFineData.reason, reason: e.target.value })}
                            placeholder="Brief description of why the fine is being issued..."
                            rows="3"
                            className="w-full py-3 px-3.5 border-[1.5px] border-[#dfe6e9] rounded-lg text-[0.95rem] bg-[#fafbfc] text-[#2c3e50] focus:border-[#3498db] focus:ring-[3px] focus:ring-[#3498db]/15 outline-none transition-all resize-y min-h-[80px]"
                            disabled={processingManualFine}
                        />
                    </div>
                </div>

                <div className="flex justify-end gap-3 mt-8 border-t border-[#f1f3f5] pt-6">
                    <button
                        className="py-3 px-6 bg-white text-[#7f8c8d] border-[1.5px] border-[#dfe6e9] rounded-lg cursor-pointer text-[0.95rem] font-semibold transition-all duration-200 hover:bg-gray-50"
                        onClick={() => setShowManualFineModal(false)}
                        disabled={processingManualFine}
                    >
                        Cancel
                    </button>
                    <button
                        className="py-3 px-6 bg-gradient-to-br from-[#e74c3c] to-[#c0392b] text-white border-none rounded-lg cursor-pointer text-[0.95rem] font-semibold transition-all duration-200 shadow-[0_4px_14px_rgba(231,76,60,0.3)] hover:-translate-y-0.5 disabled:opacity-70 flex items-center gap-2"
                        onClick={handleManualFineSubmit}
                        disabled={processingManualFine || !manualFineData.memberID || !manualFineData.amount || !manualFineData.reason}
                    >
                        {processingManualFine ? (
                            <>
                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                Processing…
                            </>
                        ) : (
                            'Issue Fine'
                        )}
                    </button>
                </div>
            </div>
        </div>
    )
}
        </>
    );
}
