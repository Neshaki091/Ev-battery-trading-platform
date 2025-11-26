import { useState, useEffect } from 'react';
import axios from 'axios';

const AdminDepositsTab = ({ onToast, onConfirm }) => {
    const [view, setView] = useState('pending'); // 'pending' or 'history'
    const [deposits, setDeposits] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedDeposit, setSelectedDeposit] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [modalType, setModalType] = useState(''); // 'approve' or 'reject'
    const [adminNote, setAdminNote] = useState('');
    const [transactionRef, setTransactionRef] = useState('');

    useEffect(() => {
        fetchDeposits();
    }, [view]);

    const fetchDeposits = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('evb_token');
            const endpoint = view === 'pending'
                ? '/admin/transactions/deposits/pending'
                : '/admin/transactions/deposits/history';

            const response = await axios.get(endpoint, {
                headers: { Authorization: `Bearer ${token}` }
            });

            setDeposits(response.data.data || []);
        } catch (error) {
            console.error('Error fetching deposits:', error);
            onToast?.('Không thể tải danh sách deposits', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = (deposit) => {
        setSelectedDeposit(deposit);
        setModalType('approve');
        setAdminNote('');
        setTransactionRef('');
        setShowModal(true);
    };

    const handleReject = (deposit) => {
        setSelectedDeposit(deposit);
        setModalType('reject');
        setAdminNote('');
        setShowModal(true);
    };

    const submitApprove = async () => {
        if (!selectedDeposit) return;

        try {
            const token = localStorage.getItem('evb_token');
            await axios.post(
                `/admin/transactions/deposits/${selectedDeposit._id}/approve`,
                { adminNote, transactionRef },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            onToast?.(`Đã duyệt nạp ${selectedDeposit.amount.toLocaleString('vi-VN')} đ`, 'success');
            setShowModal(false);
            fetchDeposits();
        } catch (error) {
            console.error('Error approving deposit:', error);
            onToast?.(error.response?.data?.message || 'Không thể duyệt deposit', 'error');
        }
    };

    const submitReject = async () => {
        if (!selectedDeposit || !adminNote.trim()) {
            onToast?.('Vui lòng nhập lý do từ chối', 'error');
            return;
        }

        try {
            const token = localStorage.getItem('evb_token');
            await axios.post(
                `/admin/transactions/deposits/${selectedDeposit._id}/reject`,
                { adminNote },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            onToast?.('Đã từ chối deposit', 'success');
            setShowModal(false);
            fetchDeposits();
        } catch (error) {
            console.error('Error rejecting deposit:', error);
            onToast?.(error.response?.data?.message || 'Không thể từ chối deposit', 'error');
        }
    };

    const getStatusBadge = (status) => {
        const config = {
            pending: { label: 'Chờ duyệt', className: 'bg-yellow-100 text-yellow-800' },
            approved: { label: 'Đã duyệt', className: 'bg-green-100 text-green-800' },
            rejected: { label: 'Từ chối', className: 'bg-red-100 text-red-800' }
        };
        const { label, className } = config[status] || config.pending;
        return <span className={`px-3 py-1 rounded-full text-sm font-semibold ${className}`}>{label}</span>;
    };

    return (
        <div className="admin-deposits-container">
            {/* Header with Tabs */}
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold">💸 Quản lý Nạp tiền</h3>
                <div className="flex gap-2">
                    <button
                        onClick={() => setView('pending')}
                        className={`px-4 py-2 rounded-lg font-semibold transition ${view === 'pending'
                                ? 'bg-blue-500 text-white'
                                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                            }`}
                    >
                        Chờ duyệt ({deposits.filter(d => d.status === 'pending').length})
                    </button>
                    <button
                        onClick={() => setView('history')}
                        className={`px-4 py-2 rounded-lg font-semibold transition ${view === 'history'
                                ? 'bg-blue-500 text-white'
                                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                            }`}
                    >
                        Lịch sử
                    </button>
                </div>
            </div>

            {/* Deposits List */}
            {loading ? (
                <div className="text-center py-8">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-500 border-t-transparent"></div>
                    <p className="mt-2 text-gray-600">Đang tải...</p>
                </div>
            ) : deposits.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-lg">
                    <p className="text-gray-500 text-lg">
                        {view === 'pending' ? 'Không có deposit nào chờ duyệt' : 'Không có lịch sử'}
                    </p>
                </div>
            ) : (
                <div className="grid gap-4">
                    {deposits.map((deposit) => (
                        <div
                            key={deposit._id}
                            className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm hover:shadow-md transition"
                        >
                            <div className="flex justify-between items-start">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-3">
                                        <span className="text-2xl font-bold text-green-600">
                                            +{deposit.amount.toLocaleString('vi-VN')} đ
                                        </span>
                                        {getStatusBadge(deposit.status)}
                                    </div>

                                    <div className="grid grid-cols-2 gap-3 text-sm">
                                        <div>
                                            <span className="text-gray-500">User:</span>
                                            <span className="ml-2 font-semibold">
                                                {deposit.user?.profile?.username || deposit.user?.username || 'N/A'}
                                            </span>
                                        </div>
                                        <div>
                                            <span className="text-gray-500">Email:</span>
                                            <span className="ml-2">{deposit.user?.profile?.email || deposit.user?.email || 'N/A'}</span>
                                        </div>
                                        <div>
                                            <span className="text-gray-500">Mã GD:</span>
                                            <span className="ml-2 font-mono">
                                                {deposit.bankTransferInfo?.transactionRef || 'N/A'}
                                            </span>
                                        </div>
                                        <div>
                                            <span className="text-gray-500">Ngày tạo:</span>
                                            <span className="ml-2">
                                                {new Date(deposit.createdAt).toLocaleString('vi-VN')}
                                            </span>
                                        </div>
                                        {deposit.bankTransferInfo?.transferDate && (
                                            <div>
                                                <span className="text-gray-500">Ngày CK:</span>
                                                <span className="ml-2">
                                                    {new Date(deposit.bankTransferInfo.transferDate).toLocaleDateString('vi-VN')}
                                                </span>
                                            </div>
                                        )}
                                        {deposit.bankTransferInfo?.note && (
                                            <div className="col-span-2">
                                                <span className="text-gray-500">Ghi chú user:</span>
                                                <span className="ml-2 italic">{deposit.bankTransferInfo.note}</span>
                                            </div>
                                        )}
                                    </div>

                                    {deposit.adminNote && (
                                        <div className="mt-3 p-3 bg-blue-50 border-l-4 border-blue-500 rounded">
                                            <span className="text-sm font-semibold text-blue-700">Ghi chú admin:</span>
                                            <p className="text-sm text-blue-600 mt-1">{deposit.adminNote}</p>
                                        </div>
                                    )}

                                    {deposit.processedAt && (
                                        <div className="mt-2 text-sm text-gray-500">
                                            Xử lý lúc: {new Date(deposit.processedAt).toLocaleString('vi-VN')}
                                        </div>
                                    )}
                                </div>

                                {deposit.status === 'pending' && (
                                    <div className="flex gap-2 ml-4">
                                        <button
                                            onClick={() => handleApprove(deposit)}
                                            className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition font-semibold"
                                        >
                                            ✅ Duyệt
                                        </button>
                                        <button
                                            onClick={() => handleReject(deposit)}
                                            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition font-semibold"
                                        >
                                            ❌ Từ chối
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Modal for Approve/Reject */}
            {showModal && selectedDeposit && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-xl">
                        <h4 className="text-xl font-bold mb-4">
                            {modalType === 'approve' ? '✅ Duyệt nạp tiền' : '❌ Từ chối nạp tiền'}
                        </h4>

                        <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                            <p className="text-sm text-gray-600">Số tiền:</p>
                            <p className="text-2xl font-bold text-green-600">
                                +{selectedDeposit.amount.toLocaleString('vi-VN')} đ
                            </p>
                            <p className="text-sm text-gray-600 mt-2">User:</p>
                            <p className="font-semibold">{selectedDeposit.user?.profile?.username || 'N/A'}</p>
                            <p className="text-sm text-gray-600 mt-2">Mã GD:</p>
                            <p className="font-mono">{selectedDeposit.bankTransferInfo?.transactionRef || 'N/A'}</p>
                        </div>

                        {modalType === 'approve' && (
                            <div className="mb-4">
                                <label className="block text-sm font-semibold mb-2">
                                    Mã giao dịch chuyển khoản (tùy chọn)
                                </label>
                                <input
                                    type="text"
                                    value={transactionRef}
                                    onChange={(e) => setTransactionRef(e.target.value)}
                                    placeholder="VD: FT123456789"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                        )}

                        <div className="mb-4">
                            <label className="block text-sm font-semibold mb-2">
                                Ghi chú admin {modalType === 'reject' && <span className="text-red-500">*</span>}
                            </label>
                            <textarea
                                value={adminNote}
                                onChange={(e) => setAdminNote(e.target.value)}
                                placeholder={modalType === 'approve' ? 'Ghi chú (tùy chọn)' : 'Lý do từ chối (bắt buộc)'}
                                rows="3"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>

                        <div className="flex gap-2 justify-end">
                            <button
                                onClick={() => setShowModal(false)}
                                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
                            >
                                Hủy
                            </button>
                            <button
                                onClick={modalType === 'approve' ? submitApprove : submitReject}
                                className={`px-4 py-2 text-white rounded-lg transition font-semibold ${modalType === 'approve'
                                        ? 'bg-green-500 hover:bg-green-600'
                                        : 'bg-red-500 hover:bg-red-600'
                                    }`}
                            >
                                {modalType === 'approve' ? '✅ Xác nhận duyệt' : '❌ Xác nhận từ chối'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminDepositsTab;
