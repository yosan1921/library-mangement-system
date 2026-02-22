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
            <div style={styles.layout}>
                <Sidebar role="admin" />
                <main style={styles.main}>
                    {/* ── Page Header ── */}
                    <div style={styles.pageHeader}>
                        <div>
                            <h1 style={styles.pageTitle}>💳 Fines & Payments</h1>
                            <p style={styles.pageSubtitle}>
                                Track financial obligations, record payments, and issue manual fines
                            </p>
                        </div>
                        <div style={styles.headerActions}>
                            <button
                                style={styles.btnCreateFine}
                                onClick={() => setShowManualFineModal(true)}
                                disabled={loading}
                            >
                                ＋ Create Manual Fine
                            </button>
                            <button onClick={loadData} style={styles.btnRefresh} title="Refresh Data" disabled={loading}>
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
                        <div className="fines-stats-grid" style={styles.statsGrid}>
                            <div style={{ ...styles.statCard, borderLeft: '4px solid #3498db' }}>
                                <div style={styles.statIconWrap}>
                                    <span style={styles.statIcon}>📋</span>
                                </div>
                                <div style={styles.statContent}>
                                    <div style={styles.statValue}>{formatCurrency(report.totalFines)}</div>
                                    <div style={styles.statLabel}>Total Fines Issued</div>
                                    <div style={styles.statSubText}>{report.totalCount} fines</div>
                                </div>
                            </div>
                            <div style={{ ...styles.statCard, borderLeft: '4px solid #27ae60' }}>
                                <div style={styles.statIconWrap}>
                                    <span style={styles.statIcon}>💵</span>
                                </div>
                                <div style={styles.statContent}>
                                    <div style={{ ...styles.statValue, color: '#27ae60' }}>{formatCurrency(report.totalPaid)}</div>
                                    <div style={styles.statLabel}>Total Collected</div>
                                    <div style={styles.statSubText}>{report.paidCount} paid</div>
                                </div>
                            </div>
                            <div style={{ ...styles.statCard, borderLeft: '4px solid #e74c3c' }}>
                                <div style={styles.statIconWrap}>
                                    <span style={styles.statIcon}>⚠️</span>
                                </div>
                                <div style={styles.statContent}>
                                    <div style={{ ...styles.statValue, color: '#e74c3c' }}>{formatCurrency(report.totalOutstanding)}</div>
                                    <div style={styles.statLabel}>Total Outstanding</div>
                                    <div style={styles.statSubText}>{report.unpaidCount} unpaid, {report.partiallyPaidCount} partial</div>
                                </div>
                            </div>
                            <div style={{ ...styles.statCard, borderLeft: '4px solid #9b59b6' }}>
                                <div style={styles.statIconWrap}>
                                    <span style={styles.statIcon}>✨</span>
                                </div>
                                <div style={styles.statContent}>
                                    <div style={{ ...styles.statValue, color: '#9b59b6' }}>{report.waivedCount}</div>
                                    <div style={styles.statLabel}>Fines Waived</div>
                                    <div style={styles.statSubText}>waived count</div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ── Toolbar: Tabs + Search ── */}
                    <div className="fines-toolbar" style={styles.toolbar}>
                        <div className="fines-tabs" style={styles.tabsBar}>
                            {tabs.map(tab => (
                                <button
                                    key={tab.key}
                                    onClick={() => setActiveTab(tab.key)}
                                    style={activeTab === tab.key
                                        ? { ...styles.tabBtn, ...styles.tabBtnActive, borderBottomColor: tab.color }
                                        : styles.tabBtn}
                                >
                                    <span style={styles.tabIcon}>{tab.icon}</span>
                                    <span className="tab-label" style={styles.tabLabel}>{tab.label}</span>
                                    <span style={{
                                        ...styles.tabCount,
                                        backgroundColor: activeTab === tab.key ? tab.color : '#ecf0f1',
                                        color: activeTab === tab.key ? 'white' : '#7f8c8d',
                                    }}>
                                        {tab.count}
                                    </span>
                                </button>
                            ))}
                        </div>

                        <div className="fines-search" style={styles.searchBar}>
                            <div style={styles.searchWrap}>
                                <span style={styles.searchIconSpan}>🔍</span>
                                <input
                                    type="text"
                                    placeholder="Search member or reason…"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    style={styles.searchInput}
                                />
                                {searchQuery && (
                                    <button onClick={() => setSearchQuery('')} style={styles.clearSearch}>✕</button>
                                )}
                            </div>
                        </div>
                    </div>

                    {!loading && (
                        <p style={styles.resultsInfo}>
                            Showing <strong>{currentList.length}</strong> records
                            {searchQuery && <> matching &quot;<em>{searchQuery}</em>&quot;</>}
                        </p>
                    )}

                    {/* ── Loading ── */}
                    {loading && (
                        <div style={styles.loadingWrap}>
                            <div style={styles.spinner}></div>
                            <p style={styles.loadingText}>Loading financial records…</p>
                        </div>
                    )}

                    {/* ── Content Area ── */}
                    {!loading && (
                        <div style={styles.contentCard}>
                            {currentList.length === 0 ? (
                                <div style={styles.emptyState}>
                                    <div style={styles.emptyIcon}>
                                        {activeTab === 'all' ? '💳' : activeTab === 'unpaid' ? '🎉' : '⏳'}
                                    </div>
                                    <h3 style={styles.emptyTitle}>
                                        {searchQuery ? 'No Matching Fines' : `No ${tabs.find(t => t.key === activeTab)?.label} Found`}
                                    </h3>
                                    <p style={styles.emptyText}>
                                        {searchQuery
                                            ? 'Try adjusting your search criteria.'
                                            : activeTab === 'unpaid'
                                                ? 'Great news! There are no unpaid fines.'
                                                : 'There are no financial records to display.'}
                                    </p>
                                </div>
                            ) : (
                                <div style={styles.tableWrap}>
                                    <table style={styles.table}>
                                        <thead>
                                            <tr>
                                                <th style={styles.th}>Member</th>
                                                <th style={styles.th}>Amount</th>
                                                <th style={styles.th}>Paid</th>
                                                <th style={styles.th}>Outstanding</th>
                                                <th style={styles.th}>Reason</th>
                                                <th style={styles.th}>Issue Date</th>
                                                <th style={{ ...styles.th, textAlign: 'center' }}>Status</th>
                                                <th style={{ ...styles.th, textAlign: 'center' }}>Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {currentList.map(fine => {
                                                const outstanding = fine.amount - (fine.amountPaid || 0);
                                                return (
                                                    <tr key={fine.id} className="fines-row" style={styles.tr}>
                                                        <td style={styles.td}>
                                                            <div style={styles.cellWithAvatar}>
                                                                <div style={styles.avatarSmall}>
                                                                    {(members[fine.memberID]?.name || '?').charAt(0).toUpperCase()}
                                                                </div>
                                                                <div>
                                                                    <strong>{members[fine.memberID]?.name || fine.memberID}</strong>
                                                                    <div style={{ fontSize: '0.8rem', color: '#95a5a6' }}>
                                                                        {members[fine.memberID]?.contact || ''}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td style={{ ...styles.td, fontWeight: '600' }}>{formatCurrency(fine.amount)}</td>
                                                        <td style={{ ...styles.td, color: '#27ae60' }}>{formatCurrency(fine.amountPaid || 0)}</td>
                                                        <td style={styles.td}>
                                                            <span style={outstanding > 0 ? styles.outstandingAmount : {}}>
                                                                {formatCurrency(outstanding)}
                                                            </span>
                                                        </td>
                                                        <td style={{ ...styles.td, maxWidth: '200px' }}>
                                                            <div style={styles.truncateText} title={fine.reason}>
                                                                {fine.reason}
                                                            </div>
                                                        </td>
                                                        <td style={styles.td}>{formatDate(fine.issueDate)}</td>
                                                        <td style={{ ...styles.td, textAlign: 'center' }}>
                                                            {getStatusBadge(fine.status)}
                                                        </td>
                                                        <td style={{ ...styles.td, textAlign: 'center' }}>
                                                            <div style={styles.actionBtns}>
                                                                {(fine.status === 'UNPAID' || fine.status === 'PARTIALLY_PAID') && (
                                                                    <>
                                                                        <button
                                                                            style={styles.btnPaySmall}
                                                                            onClick={() => openPaymentModal(fine)}
                                                                            title="Record Payment"
                                                                        >
                                                                            💵 Pay
                                                                        </button>
                                                                        <button
                                                                            style={styles.btnWaiveSmall}
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

            {/* ── Payment Modal ── */}
            {showPaymentModal && selectedFine && (
                <div style={styles.modalOverlay} onClick={() => !processingPayment && setShowPaymentModal(false)}>
                    <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
                        <div style={styles.modalHeader}>
                            <h2 style={styles.modalTitle}>💵 Record Payment</h2>
                            <button onClick={() => !processingPayment && setShowPaymentModal(false)} style={styles.modalClose}>✕</button>
                        </div>
                        <div style={styles.modalContent}>
                            {error && (
                                <div style={{ ...styles.alertError, marginTop: 0, marginBottom: '1rem' }}>
                                    <span>❌ {error}</span>
                                </div>
                            )}
                            <div style={styles.modalSummaryBox}>
                                <div style={styles.summaryRow}>
                                    <span>Member:</span>
                                    <strong>{members[selectedFine.memberID]?.name}</strong>
                                </div>
                                <div style={styles.summaryRow}>
                                    <span>Total Fine:</span>
                                    <strong>{formatCurrency(selectedFine.amount)}</strong>
                                </div>
                                <div style={styles.summaryRow}>
                                    <span>Already Paid:</span>
                                    <strong style={{ color: '#27ae60' }}>{formatCurrency(selectedFine.amountPaid || 0)}</strong>
                                </div>
                                <div style={{ ...styles.summaryRow, borderTop: '1px solid #dfe6e9', paddingTop: '0.5rem', marginTop: '0.5rem' }}>
                                    <span>Outstanding:</span>
                                    <strong style={{ color: '#e74c3c' }}>{formatCurrency(selectedFine.amount - (selectedFine.amountPaid || 0))}</strong>
                                </div>
                            </div>

                            <div style={styles.formGroup}>
                                <label style={styles.label}>Payment Amount <span style={styles.required}>*</span></label>
                                <div style={styles.inputPrefixWrap}>
                                    <span style={styles.inputPrefix}>$</span>
                                    <input
                                        type="number"
                                        style={styles.inputWithPrefix}
                                        value={paymentAmount}
                                        onChange={(e) => setPaymentAmount(e.target.value)}
                                        step="0.01"
                                        min="0.01"
                                        max={selectedFine.amount - (selectedFine.amountPaid || 0)}
                                        disabled={processingPayment}
                                    />
                                </div>
                            </div>

                            <div style={styles.formGroup}>
                                <label style={styles.label}>Payment Method</label>
                                <select
                                    style={styles.input}
                                    value={paymentMethod}
                                    onChange={(e) => setPaymentMethod(e.target.value)}
                                    disabled={processingPayment}
                                >
                                    <option value="CASH">💵 Cash</option>
                                    <option value="CARD">💳 Card</option>
                                    <option value="ONLINE">🌐 Online</option>
                                </select>
                            </div>

                            <div style={styles.formGroup}>
                                <label style={styles.label}>Notes (optional)</label>
                                <textarea
                                    style={{ ...styles.input, minHeight: '80px', resize: 'vertical' }}
                                    value={paymentNotes}
                                    onChange={(e) => setPaymentNotes(e.target.value)}
                                    placeholder="Add any relevant notes..."
                                    disabled={processingPayment}
                                />
                            </div>
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
                                {processingPayment ? '⏳ Processing...' : '✅ Confirm Payment'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ── Manual Fine Modal ── */}
            {showManualFineModal && (
                <div style={styles.modalOverlay} onClick={() => !processingManualFine && setShowManualFineModal(false)}>
                    <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
                        <div style={styles.modalHeader}>
                            <h2 style={styles.modalTitle}>＋ Create Manual Fine</h2>
                            <button onClick={() => !processingManualFine && setShowManualFineModal(false)} style={styles.modalClose}>✕</button>
                        </div>

                        <div style={styles.modalContent}>
                            {error && (
                                <div style={{ ...styles.alertError, marginTop: 0, marginBottom: '1rem' }}>
                                    <span>❌ {error}</span>
                                </div>
                            )}
                            <div style={styles.formGroup}>
                                <label style={styles.label}>Member <span style={styles.required}>*</span></label>
                                <select
                                    style={styles.input}
                                    value={manualFineMemberID}
                                    onChange={(e) => setManualFineMemberID(e.target.value)}
                                    disabled={processingManualFine}
                                >
                                    <option value="">-- Select Member --</option>
                                    {Object.values(members).map(member => (
                                        <option key={member.id} value={member.id}>
                                            {member.name} ({member.contact})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div style={styles.formGroup}>
                                <label style={styles.label}>Amount <span style={styles.required}>*</span></label>
                                <div style={styles.inputPrefixWrap}>
                                    <span style={styles.inputPrefix}>$</span>
                                    <input
                                        type="number"
                                        style={styles.inputWithPrefix}
                                        value={manualFineAmount}
                                        onChange={(e) => setManualFineAmount(e.target.value)}
                                        step="0.01"
                                        min="0.01"
                                        placeholder="0.00"
                                        disabled={processingManualFine}
                                    />
                                </div>
                            </div>

                            <div style={styles.formGroup}>
                                <label style={styles.label}>Reason <span style={styles.required}>*</span></label>
                                <textarea
                                    style={{ ...styles.input, minHeight: '100px', resize: 'vertical' }}
                                    value={manualFineReason}
                                    onChange={(e) => setManualFineReason(e.target.value)}
                                    placeholder="Enter detailed reason for the fine..."
                                    disabled={processingManualFine}
                                />
                            </div>
                        </div>
                        <div style={styles.modalActions}>
                            <button
                                style={{ ...styles.btnFormCancel, opacity: processingManualFine ? 0.5 : 1 }}
                                onClick={() => {
                                    if (!processingManualFine) {
                                        setShowManualFineModal(false);
                                        resetManualFineForm();
                                    }
                                }}
                                disabled={processingManualFine}
                            >
                                Cancel
                            </button>
                            <button
                                style={{ ...styles.btnSubmit, opacity: processingManualFine ? 0.7 : 1 }}
                                onClick={handleCreateManualFine}
                                disabled={processingManualFine}
                            >
                                {processingManualFine ? '⏳ Creating...' : '＋ Issue Fine'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Injected responsive + animation styles */}
            <style>{`
        @keyframes fadeSlideIn {
                    from { opacity: 0; transform: translateY(-12px); }
                    to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes modalFadeIn {
                    from { opacity: 0; transform: scale(0.95); }
                    to   { opacity: 1; transform: scale(1); }
        }
        @keyframes spin {
                    to { transform: rotate(360deg); }
        }

        @media(max - width: 1024px) {
                    .fines - stats - grid {
        grid - template - columns: repeat(2, 1fr)!important;
    }
}
@media(max - width: 768px) {
                    main {
        margin - left: 0!important;
        padding: 1rem!important;
    }
                    .fines - stats - grid {
        grid - template - columns: 1fr 1fr!important;
        gap: 0.75rem!important;
    }
                    .fines - toolbar {
        flex - direction: column!important;
        align - items: stretch!important;
    }
                    .fines - tabs {
        overflow - x: auto!important;
        gap: 0!important;
    }
                    .fines - search {
        width: 100 % !important;
    }
}
@media(max - width: 480px) {
                    .fines - stats - grid {
        grid - template - columns: 1fr!important;
    }
                    .tab - label {
        display: none;
    }
                    .fines - tabs button {
        padding: 0.65rem 0.5rem!important;
    }
}

                .fines - row:hover {
    background - color: #f0f7ff!important;
}
input: focus, select: focus, textarea:focus {
    border - color: #3498db!important;
    outline: none;
    box - shadow: 0 0 0 3px rgba(52, 152, 219, 0.15);
}
`}</style>
        </>
    );
}

/* ──────────────────────────────────────────────────────────────── */
/*  Styles                                                         */
/* ──────────────────────────────────────────────────────────────── */
const styles = {
    /* Layout */
    layout: { display: 'flex' },
    main: {
        flex: 1,
        marginLeft: '260px',
        padding: '2rem',
        backgroundColor: '#f5f6fa',
        minHeight: 'calc(100vh - 60px)',
    },

    /* Page Header */
    pageHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '1.75rem',
        flexWrap: 'wrap',
        gap: '1rem',
    },
    pageTitle: {
        fontSize: '1.85rem',
        fontWeight: '700',
        color: '#2c3e50',
        margin: 0,
    },
    pageSubtitle: {
        color: '#7f8c8d',
        marginTop: '0.35rem',
        fontSize: '0.95rem',
    },
    headerActions: {
        display: 'flex',
        gap: '0.75rem',
    },
    btnCreateFine: {
        padding: '0.75rem 1.25rem',
        background: 'linear-gradient(135deg, #e74c3c, #c0392b)',
        color: 'white',
        border: 'none',
        borderRadius: '10px',
        cursor: 'pointer',
        fontSize: '0.95rem',
        fontWeight: '600',
        boxShadow: '0 4px 14px rgba(231,76,60,0.3)',
        transition: 'all 0.3s',
    },
    btnRefresh: {
        padding: '0.75rem 1rem',
        background: 'white',
        color: '#34495e',
        border: '1.5px solid #dfe6e9',
        borderRadius: '10px',
        cursor: 'pointer',
        fontSize: '1rem',
        transition: 'all 0.3s',
        boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
    },

    /* Stats Grid */
    statsGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: '1rem',
        marginBottom: '1.5rem',
    },
    statCard: {
        backgroundColor: 'white',
        padding: '1.25rem',
        borderRadius: '12px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.06)',
        display: 'flex',
        alignItems: 'center',
        gap: '1rem',
        transition: 'transform 0.25s, box-shadow 0.25s',
    },
    statIconWrap: {
        width: '48px',
        height: '48px',
        borderRadius: '12px',
        backgroundColor: '#f8f9fb',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
    },
    statIcon: { fontSize: '1.5rem' },
    statContent: {
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
    },
    statValue: { fontSize: '1.5rem', fontWeight: '700', color: '#2c3e50', lineHeight: 1.2 },
    statLabel: { fontSize: '0.85rem', color: '#7f8c8d', fontWeight: '600', marginTop: '0.2rem' },
    statSubText: { fontSize: '0.75rem', color: '#bdc3c7', marginTop: '0.1rem' },

    /* Alerts */
    alertError: {
        background: 'linear-gradient(135deg, #fff5f5, #ffe0e0)',
        color: '#c0392b',
        padding: '0.85rem 1.25rem',
        borderRadius: '10px',
        marginBottom: '1.25rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        border: '1px solid #f5c6cb',
        animation: 'fadeSlideIn 0.3s ease',
    },
    alertSuccess: {
        background: 'linear-gradient(135deg, #f0fff4, #d4edda)',
        color: '#155724',
        padding: '0.85rem 1.25rem',
        borderRadius: '10px',
        marginBottom: '1.25rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        border: '1px solid #c3e6cb',
        animation: 'fadeSlideIn 0.3s ease',
    },
    alertClose: {
        background: 'none',
        border: 'none',
        fontSize: '1.4rem',
        cursor: 'pointer',
        color: 'inherit',
        padding: '0 0.4rem',
        lineHeight: 1,
    },

    /* Toolbar / Tabs */
    toolbar: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '1rem',
        marginBottom: '0.75rem',
        flexWrap: 'wrap',
    },
    tabsBar: {
        display: 'flex',
        gap: '0.25rem',
        backgroundColor: 'white',
        borderRadius: '12px',
        padding: '0.4rem',
        boxShadow: '0 2px 10px rgba(0,0,0,0.06)',
    },
    tabBtn: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '0.5rem',
        padding: '0.75rem 1.25rem',
        border: 'none',
        borderBottom: '3px solid transparent',
        background: 'transparent',
        cursor: 'pointer',
        fontSize: '0.9rem',
        color: '#7f8c8d',
        borderRadius: '8px',
        transition: 'all 0.25s',
        fontWeight: '500',
    },
    tabBtnActive: {
        color: '#2c3e50',
        fontWeight: '700',
        backgroundColor: '#f8f9fb',
    },
    tabIcon: { fontSize: '1.1rem' },
    tabCount: {
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        minWidth: '24px',
        height: '24px',
        borderRadius: '12px',
        fontSize: '0.75rem',
        fontWeight: '700',
        padding: '0 0.4rem',
        transition: 'all 0.25s',
    },
    searchBar: {
        flex: 1,
        maxWidth: '400px',
    },
    searchWrap: {
        display: 'flex',
        alignItems: 'center',
        backgroundColor: 'white',
        borderRadius: '10px',
        padding: '0 1rem',
        height: '46px',
        border: '1.5px solid #dfe6e9',
        boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
    },
    searchIconSpan: { fontSize: '1.1rem', marginRight: '0.5rem' },
    searchInput: {
        flex: 1,
        padding: '0.7rem 0',
        border: 'none',
        outline: 'none',
        fontSize: '0.95rem',
        backgroundColor: 'transparent',
    },
    clearSearch: {
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        fontSize: '0.9rem',
        color: '#95a5a6',
        padding: '0.25rem',
    },
    resultsInfo: {
        fontSize: '0.85rem',
        color: '#95a5a6',
        marginBottom: '1rem',
        marginTop: '0',
    },

    /* Loading / Empty State */
    loadingWrap: {
        textAlign: 'center',
        padding: '4rem',
    },
    spinner: {
        width: '40px',
        height: '40px',
        border: '4px solid #dfe6e9',
        borderTopColor: '#3498db',
        borderRadius: '50%',
        animation: 'spin 0.8s linear infinite',
        margin: '0 auto 1rem',
    },
    loadingText: { color: '#7f8c8d', fontSize: '1rem' },

    contentCard: {
        backgroundColor: 'white',
        borderRadius: '14px',
        boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
        overflow: 'hidden',
    },
    emptyState: {
        textAlign: 'center',
        padding: '5rem 2rem',
    },
    emptyIcon: { fontSize: '3.5rem', marginBottom: '1rem' },
    emptyTitle: { color: '#2c3e50', marginBottom: '0.5rem', fontSize: '1.25rem' },
    emptyText: { color: '#95a5a6', fontSize: '0.95rem', maxWidth: '380px', margin: '0 auto' },

    /* Table */
    tableWrap: {
        overflowX: 'auto',
    },
    table: {
        width: '100%',
        borderCollapse: 'collapse',
        minWidth: '800px',
    },
    th: {
        textAlign: 'left',
        padding: '1rem 1.25rem',
        backgroundColor: '#f8f9fb',
        color: '#7f8c8d',
        fontSize: '0.8rem',
        textTransform: 'uppercase',
        letterSpacing: '0.5px',
        fontWeight: '700',
        borderBottom: '2px solid #ecf0f1',
    },
    tr: {
        borderBottom: '1px solid #f1f3f5',
        transition: 'background-color 0.2s',
    },
    td: {
        padding: '0.85rem 1.25rem',
        fontSize: '0.92rem',
        color: '#2c3e50',
        verticalAlign: 'middle',
    },
    cellWithAvatar: {
        display: 'flex',
        alignItems: 'center',
        gap: '0.85rem',
    },
    avatarSmall: {
        width: '38px',
        height: '38px',
        borderRadius: '50%',
        background: 'linear-gradient(135deg, #3498db, #2980b9)',
        color: 'white',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '0.9rem',
        fontWeight: '700',
        flexShrink: 0,
    },
    truncateText: {
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
    },
    outstandingAmount: {
        color: '#e74c3c',
        fontWeight: '700',
    },

    /* Badges */
    badgeUnpaid: {
        display: 'inline-block',
        padding: '0.25rem 0.75rem',
        backgroundColor: '#fdecea',
        color: '#e74c3c',
        borderRadius: '20px',
        fontSize: '0.8rem',
        fontWeight: '600',
    },
    badgePartial: {
        display: 'inline-block',
        padding: '0.25rem 0.75rem',
        backgroundColor: '#fff3cd',
        color: '#d35400',
        borderRadius: '20px',
        fontSize: '0.8rem',
        fontWeight: '600',
    },
    badgePaid: {
        display: 'inline-block',
        padding: '0.25rem 0.75rem',
        backgroundColor: '#e8f8f0',
        color: '#27ae60',
        borderRadius: '20px',
        fontSize: '0.8rem',
        fontWeight: '600',
    },
    badgeWaived: {
        display: 'inline-block',
        padding: '0.25rem 0.75rem',
        backgroundColor: '#f1f3f5',
        color: '#7f8c8d',
        borderRadius: '20px',
        fontSize: '0.8rem',
        fontWeight: '600',
    },
    badgeDefault: {
        display: 'inline-block',
        padding: '0.25rem 0.75rem',
        backgroundColor: '#f1f3f5',
        color: '#2c3e50',
        borderRadius: '20px',
        fontSize: '0.8rem',
        fontWeight: '600',
    },

    /* Actions */
    actionBtns: {
        display: 'flex',
        gap: '0.5rem',
        justifyContent: 'center',
    },
    btnPaySmall: {
        padding: '0.45rem 0.75rem',
        background: 'linear-gradient(135deg, #2ecc71, #27ae60)',
        color: 'white',
        border: 'none',
        borderRadius: '8px',
        cursor: 'pointer',
        fontSize: '0.85rem',
        fontWeight: '600',
        transition: 'all 0.2s',
        boxShadow: '0 2px 8px rgba(46,204,113,0.3)',
    },
    btnWaiveSmall: {
        padding: '0.45rem 0.75rem',
        background: 'white',
        color: '#7f8c8d',
        border: '1.5px solid #bdc3c7',
        borderRadius: '8px',
        cursor: 'pointer',
        fontSize: '0.85rem',
        fontWeight: '600',
        transition: 'all 0.2s',
    },

    /* Modals */
    modalOverlay: {
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.5)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000,
        backdropFilter: 'blur(3px)',
    },
    modal: {
        backgroundColor: '#ffffff',
        borderRadius: '16px',
        padding: '2rem',
        maxWidth: '480px',
        width: '95%',
        maxHeight: '90vh',
        overflowY: 'auto',
        boxShadow: '0 10px 40px rgba(0,0,0,0.15)',
        animation: 'modalFadeIn 0.3s ease-out',
    },
    modalHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '1.5rem',
        borderBottom: '1px solid #f1f3f5',
        paddingBottom: '1rem',
    },
    modalTitle: {
        color: '#2c3e50',
        margin: 0,
        fontSize: '1.4rem',
        fontWeight: '700',
    },
    modalClose: {
        background: 'none',
        border: 'none',
        fontSize: '1.4rem',
        color: '#95a5a6',
        cursor: 'pointer',
        padding: '0.2rem',
        lineHeight: 1,
    },
    modalContent: {
        marginBottom: '1.5rem',
    },
    modalSummaryBox: {
        backgroundColor: '#f8f9fb',
        padding: '1rem 1.25rem',
        borderRadius: '10px',
        marginBottom: '1.5rem',
        border: '1px solid #dfe6e9',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.5rem',
    },
    summaryRow: {
        display: 'flex',
        justifyContent: 'space-between',
        fontSize: '0.95rem',
        color: '#34495e',
    },
    formGroup: {
        marginBottom: '1.25rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.4rem',
    },
    label: {
        fontSize: '0.88rem',
        fontWeight: '600',
        color: '#2c3e50',
    },
    required: {
        color: '#e74c3c',
    },
    input: {
        width: '100%',
        padding: '0.75rem 0.9rem',
        border: '1.5px solid #dfe6e9',
        borderRadius: '8px',
        fontSize: '0.95rem',
        backgroundColor: '#fafbfc',
        boxSizing: 'border-box',
        transition: 'border-color 0.3s, box-shadow 0.3s',
        color: '#2c3e50',
    },
    inputPrefixWrap: {
        display: 'flex',
        alignItems: 'center',
        border: '1.5px solid #dfe6e9',
        borderRadius: '8px',
        backgroundColor: '#fafbfc',
        overflow: 'hidden',
    },
    inputPrefix: {
        padding: '0.75rem 0.9rem',
        backgroundColor: '#f1f3f5',
        color: '#7f8c8d',
        fontWeight: '600',
        borderRight: '1px solid #dfe6e9',
    },
    inputWithPrefix: {
        flex: 1,
        padding: '0.75rem 0.9rem',
        border: 'none',
        outline: 'none',
        fontSize: '0.95rem',
        backgroundColor: 'transparent',
    },
    modalActions: {
        display: 'flex',
        justifyContent: 'flex-end',
        gap: '0.75rem',
        marginTop: '2rem',
        borderTop: '1px solid #f1f3f5',
        paddingTop: '1.5rem',
    },
    btnSubmit: {
        padding: '0.75rem 1.5rem',
        background: 'linear-gradient(135deg, #3498db, #2980b9)',
        color: 'white',
        border: 'none',
        borderRadius: '8px',
        cursor: 'pointer',
        fontSize: '0.95rem',
        fontWeight: '600',
        transition: 'all 0.2s',
        boxShadow: '0 4px 14px rgba(52,152,219,0.3)',
    },
    btnFormCancel: {
        padding: '0.75rem 1.5rem',
        backgroundColor: 'white',
        color: '#7f8c8d',
        border: '1.5px solid #dfe6e9',
        borderRadius: '8px',
        cursor: 'pointer',
        fontSize: '0.95rem',
        fontWeight: '600',
        transition: 'all 0.2s',
    },
};
