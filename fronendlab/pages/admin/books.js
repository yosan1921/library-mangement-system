import { useState, useEffect, useMemo } from 'react';
import Navbar from '../../components/Navbar';
import Sidebar from '../../components/Sidebar';
import BookCard from '../../components/BookCard';
import { getAllBooks, addBook, updateBook, deleteBook } from '../../services/bookService';

export default function BooksManagement() {
    const [books, setBooks] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [editingBook, setEditingBook] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('');
    const [viewMode, setViewMode] = useState('grid');
    const [formData, setFormData] = useState({
        title: '',
        author: '',
        category: '',
        isbn: '',
        copiesAvailable: 0,
        totalCopies: 0,
    });

    useEffect(() => {
        loadBooks();
    }, []);

    const loadBooks = async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await getAllBooks();
            setBooks(data);
        } catch (error) {
            console.error('Error loading books:', error);
            setError('Failed to load books. Please check if the backend server is running.');
        } finally {
            setLoading(false);
        }
    };

    // Derived data
    const categories = useMemo(() => {
        const cats = [...new Set(books.map(b => b.category).filter(Boolean))];
        return cats.sort();
    }, [books]);

    const filteredBooks = useMemo(() => {
        return books.filter(book => {
            const matchesSearch = searchQuery === '' ||
                book.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                book.author?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                book.isbn?.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesCategory = categoryFilter === '' || book.category === categoryFilter;
            return matchesSearch && matchesCategory;
        });
    }, [books, searchQuery, categoryFilter]);

    const stats = useMemo(() => ({
        total: books.length,
        available: books.filter(b => b.copiesAvailable > 0).length,
        outOfStock: books.filter(b => b.copiesAvailable === 0).length,
        categories: new Set(books.map(b => b.category).filter(Boolean)).size,
    }), [books]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setSuccess(null);

        if (!formData.title || !formData.author || !formData.isbn) {
            setError('Please fill in all required fields');
            return;
        }

        if (formData.copiesAvailable < 0 || formData.totalCopies < 0) {
            setError('Copies cannot be negative');
            return;
        }

        if (formData.copiesAvailable > formData.totalCopies) {
            setError('Available copies cannot exceed total copies');
            return;
        }

        try {
            setLoading(true);
            if (editingBook) {
                await updateBook(editingBook.id, formData);
                setSuccess('Book updated successfully!');
            } else {
                await addBook(formData);
                setSuccess('Book added successfully!');
            }
            await loadBooks();
            resetForm();
            setTimeout(() => setSuccess(null), 3000);
        } catch (error) {
            console.error('Error saving book:', error);
            setError(`Failed to ${editingBook ? 'update' : 'add'} book: ${error.response?.data?.message || error.message}`);
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (book) => {
        setEditingBook(book);
        setFormData(book);
        setShowForm(true);
    };

    const handleDelete = async (id) => {
        if (confirm('Are you sure you want to delete this book?')) {
            try {
                setLoading(true);
                setError(null);
                await deleteBook(id);
                setSuccess('Book deleted successfully!');
                await loadBooks();
                setTimeout(() => setSuccess(null), 3000);
            } catch (error) {
                console.error('Error deleting book:', error);
                setError('Failed to delete book: ' + (error.response?.data?.message || error.message));
            } finally {
                setLoading(false);
            }
        }
    };

    const resetForm = () => {
        setFormData({
            title: '',
            author: '',
            category: '',
            isbn: '',
            copiesAvailable: 0,
            totalCopies: 0,
        });
        setEditingBook(null);
        setShowForm(false);
    };

    return (
        <>
            <Navbar />
            <div className="flex">
                <Sidebar role="admin" />
                <main className="flex-1 lg:ml-[260px] p-8 bg-[#f5f6fa] min-h-[calc(100vh-60px)]">
                    {/* ── Page Header ── */}
                    <div className="flex justify-between items-center mb-7 flex-wrap gap-4">
                        <div>
                            <h1 className="text-[1.85rem] font-bold text-[#2c3e50] m-0">📚 Manage Books</h1>
                            <p className="text-[#7f8c8d] mt-1.5 text-[0.95rem]">
                                Organize, search, and manage your entire catalogue
                            </p>
                        </div>
                        <button
                            onClick={() => { setShowForm(!showForm); if (showForm) resetForm(); }}
                            className={`px-6 py-3 border-none rounded-xl cursor-pointer text-[0.95rem] font-semibold transition-all duration-300 ${showForm
                                ? 'bg-gradient-to-br from-[#95a5a6] to-[#7f8c8d] text-white shadow-[0_4px_14px_rgba(127,140,141,0.3)]'
                                : 'bg-gradient-to-br from-[#2ecc71] to-[#27ae60] text-white shadow-[0_4px_14px_rgba(46,204,113,0.35)] tracking-[0.3px]'
                                }`}
                            disabled={loading}
                        >
                            {showForm ? '✕  Cancel' : '＋  Add New Book'}
                        </button>
                    </div>

                    {/* ── Stats Overview ── */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                        <div className="bg-white p-5 rounded-xl shadow-[0_2px_10px_rgba(0,0,0,0.06)] flex items-center gap-4 transition-transform duration-250 border-l-4 border-l-[#3498db]">
                            <span className="text-[2rem]">📖</span>
                            <div>
                                <div className="text-[1.65rem] font-bold text-[#2c3e50]">{stats.total}</div>
                                <div className="text-[0.82rem] text-[#95a5a6] mt-0.5 uppercase tracking-[0.5px]">Total Books</div>
                            </div>
                        </div>
                        <div className="bg-white p-5 rounded-xl shadow-[0_2px_10px_rgba(0,0,0,0.06)] flex items-center gap-4 transition-transform duration-250 border-l-4 border-l-[#2ecc71]">
                            <span className="text-[2rem]">✅</span>
                            <div>
                                <div className="text-[1.65rem] font-bold text-[#2c3e50]">{stats.available}</div>
                                <div className="text-[0.82rem] text-[#95a5a6] mt-0.5 uppercase tracking-[0.5px]">Available</div>
                            </div>
                        </div>
                        <div className="bg-white p-5 rounded-xl shadow-[0_2px_10px_rgba(0,0,0,0.06)] flex items-center gap-4 transition-transform duration-250 border-l-4 border-l-[#e74c3c]">
                            <span className="text-[2rem]">🚫</span>
                            <div>
                                <div className="text-[1.65rem] font-bold text-[#2c3e50]">{stats.outOfStock}</div>
                                <div className="text-[0.82rem] text-[#95a5a6] mt-0.5 uppercase tracking-[0.5px]">Out of Stock</div>
                            </div>
                        </div>
                        <div className="bg-white p-5 rounded-xl shadow-[0_2px_10px_rgba(0,0,0,0.06)] flex items-center gap-4 transition-transform duration-250 border-l-4 border-l-[#9b59b6]">
                            <span className="text-[2rem]">🏷️</span>
                            <div>
                                <div className="text-[1.65rem] font-bold text-[#2c3e50]">{stats.categories}</div>
                                <div className="text-[0.82rem] text-[#95a5a6] mt-0.5 uppercase tracking-[0.5px]">Categories</div>
                            </div>
                        </div>
                    </div>

                    {/* ── Alerts ── */}
                    {error && (
                        <div className="bg-gradient-to-br from-[#fff5f5] to-[#ffe0e0] text-[#c0392b] py-3.5 px-5 rounded-xl mb-4 flex justify-between items-center border border-[#f5c6cb] animate-[fadeSlideIn_0.3s_ease]">
                            <span>❌ {error}</span>
                            <button onClick={() => setError(null)} className="bg-transparent border-none text-[1.4rem] cursor-pointer text-inherit px-1.5 leading-none">×</button>
                        </div>
                    )}
                    {success && (
                        <div className="bg-gradient-to-br from-[#f0fff4] to-[#d4edda] text-[#155724] py-3.5 px-5 rounded-xl mb-4 flex justify-between items-center border border-[#c3e6cb] animate-[fadeSlideIn_0.3s_ease]">
                            <span>✅ {success}</span>
                            <button onClick={() => setSuccess(null)} className="bg-transparent border-none text-[1.4rem] cursor-pointer text-inherit px-1.5 leading-none">×</button>
                        </div>
                    )}

                    {/* ── Add / Edit Form ── */}
                    {showForm && (
                        <div className="bg-white p-8 rounded-[14px] mb-6 shadow-[0_4px_20px_rgba(0,0,0,0.08)] border border-[rgba(52,152,219,0.12)] animate-[fadeSlideIn_0.35s_ease]">
                            <h3 className="m-0 mb-5 text-[#2c3e50] text-[1.3rem] font-semibold">
                                {editingBook ? '✏️ Edit Book' : '📘 Add New Book'}
                            </h3>
                            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-[0.85rem] font-semibold text-[#34495e]">Title <span className="text-[#e74c3c]">*</span></label>
                                    <input
                                        type="text"
                                        placeholder="Enter book title"
                                        value={formData.title}
                                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                        required
                                        className="py-[0.7rem] px-[0.9rem] border border-[#dfe6e9] rounded-lg text-[0.95rem] transition-all bg-[#fafbfc] focus:border-[#3498db] focus:shadow-[0_0_0_3px_rgba(52,152,219,0.15)] outline-none"
                                        disabled={loading}
                                    />
                                </div>
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-[0.85rem] font-semibold text-[#34495e]">Author <span className="text-[#e74c3c]">*</span></label>
                                    <input
                                        type="text"
                                        placeholder="Enter author name"
                                        value={formData.author}
                                        onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                                        required
                                        className="py-[0.7rem] px-[0.9rem] border border-[#dfe6e9] rounded-lg text-[0.95rem] transition-all bg-[#fafbfc] focus:border-[#3498db] focus:shadow-[0_0_0_3px_rgba(52,152,219,0.15)] outline-none"
                                        disabled={loading}
                                    />
                                </div>
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-[0.85rem] font-semibold text-[#34495e]">Category</label>
                                    <input
                                        type="text"
                                        placeholder="e.g. Fiction, Science"
                                        value={formData.category}
                                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                        className="py-[0.7rem] px-[0.9rem] border border-[#dfe6e9] rounded-lg text-[0.95rem] transition-all bg-[#fafbfc] focus:border-[#3498db] focus:shadow-[0_0_0_3px_rgba(52,152,219,0.15)] outline-none"
                                        disabled={loading}
                                    />
                                </div>
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-[0.85rem] font-semibold text-[#34495e]">ISBN <span className="text-[#e74c3c]">*</span></label>
                                    <input
                                        type="text"
                                        placeholder="e.g. 978-3-16-148410-0"
                                        value={formData.isbn}
                                        onChange={(e) => setFormData({ ...formData, isbn: e.target.value })}
                                        required
                                        className="py-[0.7rem] px-[0.9rem] border border-[#dfe6e9] rounded-lg text-[0.95rem] transition-all bg-[#fafbfc] focus:border-[#3498db] focus:shadow-[0_0_0_3px_rgba(52,152,219,0.15)] outline-none"
                                        disabled={loading}
                                    />
                                </div>
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-[0.85rem] font-semibold text-[#34495e]">Copies Available <span className="text-[#e74c3c]">*</span></label>
                                    <input
                                        type="number"
                                        placeholder="0"
                                        value={formData.copiesAvailable}
                                        onChange={(e) => setFormData({ ...formData, copiesAvailable: parseInt(e.target.value) || 0 })}
                                        required
                                        min="0"
                                        className="py-[0.7rem] px-[0.9rem] border border-[#dfe6e9] rounded-lg text-[0.95rem] transition-all bg-[#fafbfc] focus:border-[#3498db] focus:shadow-[0_0_0_3px_rgba(52,152,219,0.15)] outline-none"
                                        disabled={loading}
                                    />
                                </div>
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-[0.85rem] font-semibold text-[#34495e]">Total Copies <span className="text-[#e74c3c]">*</span></label>
                                    <input
                                        type="number"
                                        placeholder="0"
                                        value={formData.totalCopies}
                                        onChange={(e) => setFormData({ ...formData, totalCopies: parseInt(e.target.value) || 0 })}
                                        required
                                        min="0"
                                        className="py-[0.7rem] px-[0.9rem] border border-[#dfe6e9] rounded-lg text-[0.95rem] transition-all bg-[#fafbfc] focus:border-[#3498db] focus:shadow-[0_0_0_3px_rgba(52,152,219,0.15)] outline-none"
                                        disabled={loading}
                                    />
                                </div>
                                <div className="col-span-1 md:col-span-2 flex gap-3 mt-2">
                                    <button type="submit" className="flex-1 p-[0.8rem] bg-gradient-to-br from-[#3498db] to-[#2980b9] text-white border-none rounded-lg cursor-pointer text-[0.95rem] font-semibold transition-all shadow-[0_4px_14px_rgba(52,152,219,0.3)] hover:opacity-90" disabled={loading}>
                                        {loading ? '⏳ Saving...' : (editingBook ? '💾 Update Book' : '➕ Add Book')}
                                    </button>
                                    <button type="button" onClick={resetForm} className="flex-1 p-[0.8rem] bg-[#ecf0f1] text-[#7f8c8d] border border-[#dfe6e9] rounded-lg cursor-pointer text-[0.95rem] font-semibold transition-all hover:bg-[#e2e6e7]" disabled={loading}>
                                        Cancel
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}

                    {/* ── Toolbar: Search, Filter, View Toggle ── */}
                    <div className="flex items-center gap-4 mb-5 flex-wrap flex-col md:flex-row">
                        <div className="flex items-center bg-white rounded-lg px-4 flex-1 w-full md:min-w-[260px] border border-[#dfe6e9] transition-all focus-within:border-[#3498db] focus-within:shadow-[0_0_0_3px_rgba(52,152,219,0.15)] py-1.5">
                            <span className="text-[1.1rem] mr-2">🔍</span>
                            <input
                                type="text"
                                placeholder="Search by title, author or ISBN…"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="flex-1 py-[0.7rem] bg-transparent border-none outline-none text-[0.95rem]"
                            />
                            {searchQuery && (
                                <button onClick={() => setSearchQuery('')} className="bg-transparent border-none cursor-pointer text-[0.9rem] text-[#95a5a6] px-1">✕</button>
                            )}
                        </div>
                        <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end">
                            <select
                                value={categoryFilter}
                                onChange={(e) => setCategoryFilter(e.target.value)}
                                className="py-[0.65rem] px-4 rounded-lg border border-[#dfe6e9] text-[0.9rem] bg-white text-[#2c3e50] cursor-pointer min-w-[160px] outline-none focus:border-[#3498db] focus:shadow-[0_0_0_3px_rgba(52,152,219,0.15)]"
                            >
                                <option value="">All Categories</option>
                                {categories.map(cat => (
                                    <option key={cat} value={cat}>{cat}</option>
                                ))}
                            </select>
                            <div className="flex bg-white rounded-lg overflow-hidden border border-[#dfe6e9]">
                                <button
                                    onClick={() => setViewMode('grid')}
                                    className={`px-[0.85rem] py-[0.55rem] border-none text-[1.15rem] cursor-pointer transition-all ${viewMode === 'grid' ? 'bg-gradient-to-br from-[#3498db] to-[#2980b9] text-white' : 'bg-transparent text-[#95a5a6]'}`}
                                    title="Grid view"
                                >▦</button>
                                <button
                                    onClick={() => setViewMode('table')}
                                    className={`px-[0.85rem] py-[0.55rem] border-none text-[1.15rem] cursor-pointer transition-all ${viewMode === 'table' ? 'bg-gradient-to-br from-[#3498db] to-[#2980b9] text-white' : 'bg-transparent text-[#95a5a6]'}`}
                                    title="Table view"
                                >☰</button>
                            </div>
                        </div>
                    </div>

                    {/* ── Loading ── */}
                    {loading && !showForm && (
                        <div className="text-center p-12">
                            <div className="w-10 h-10 border-4 border-[#dfe6e9] border-t-[#3498db] rounded-full animate-spin mx-auto mb-4"></div>
                            <p className="text-[#7f8c8d] text-[1rem] m-0">Loading books…</p>
                        </div>
                    )}

                    {/* ── Results info ── */}
                    {!loading && books.length > 0 && (
                        <p className="text-[0.88rem] text-[#7f8c8d] mb-4">
                            Showing <strong className="font-semibold text-[#2c3e50]">{filteredBooks.length}</strong> of <strong className="font-semibold text-[#2c3e50]">{books.length}</strong> books
                            {searchQuery && <> matching &quot;<em className="not-italic font-medium text-[#3498db]">{searchQuery}</em>&quot;</>}
                            {categoryFilter && <> in <strong className="font-semibold text-[#2c3e50]">{categoryFilter}</strong></>}
                        </p>
                    )}

                    {/* ── Empty State ── */}
                    {filteredBooks.length === 0 && !loading && (
                        <div className="text-center py-16 px-8 bg-white rounded-2xl shadow-[0_2px_12px_rgba(0,0,0,0.06)] mt-4">
                            <div className="text-[3.5rem] mb-4 opacity-80">{books.length === 0 ? '📚' : '🔍'}</div>
                            <h3 className="text-[#2c3e50] mb-2 text-[1.25rem] font-bold">
                                {books.length === 0 ? 'No Books Yet' : 'No Results Found'}
                            </h3>
                            <p className="text-[#95a5a6] text-[0.95rem] max-w-[380px] mx-auto m-0 leading-relaxed">
                                {books.length === 0
                                    ? 'Click "Add New Book" to add your first book to the catalogue.'
                                    : 'Try adjusting your search or filter criteria.'}
                            </p>
                        </div>
                    )}

                    {/* ── Grid View ── */}
                    {viewMode === 'grid' && filteredBooks.length > 0 && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                            {filteredBooks.map((book) => (
                                <BookCard
                                    key={book.id}
                                    book={book}
                                    onEdit={handleEdit}
                                    onDelete={handleDelete}
                                />
                            ))}
                        </div>
                    )}

                    {/* ── Table View ── */}
                    {viewMode === 'table' && filteredBooks.length > 0 && (
                        <div className="bg-white rounded-[14px] shadow-[0_2px_12px_rgba(0,0,0,0.06)] overflow-x-auto border border-[#f1f3f5]">
                            <table className="w-full border-collapse min-w-[700px] text-left">
                                <thead>
                                    <tr>
                                        <th className="px-4 py-3.5 bg-[#f8f9fb] text-[#7f8c8d] text-[0.8rem] uppercase tracking-[0.5px] font-bold border-b-2 border-[#ecf0f1]">Title</th>
                                        <th className="px-4 py-3.5 bg-[#f8f9fb] text-[#7f8c8d] text-[0.8rem] uppercase tracking-[0.5px] font-bold border-b-2 border-[#ecf0f1]">Author</th>
                                        <th className="px-4 py-3.5 bg-[#f8f9fb] text-[#7f8c8d] text-[0.8rem] uppercase tracking-[0.5px] font-bold border-b-2 border-[#ecf0f1]">Category</th>
                                        <th className="px-4 py-3.5 bg-[#f8f9fb] text-[#7f8c8d] text-[0.8rem] uppercase tracking-[0.5px] font-bold border-b-2 border-[#ecf0f1]">ISBN</th>
                                        <th className="px-4 py-3.5 bg-[#f8f9fb] text-[#7f8c8d] text-[0.8rem] uppercase tracking-[0.5px] font-bold border-b-2 border-[#ecf0f1] text-center">Availability</th>
                                        <th className="px-4 py-3.5 bg-[#f8f9fb] text-[#7f8c8d] text-[0.8rem] uppercase tracking-[0.5px] font-bold border-b-2 border-[#ecf0f1] text-center">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredBooks.map((book) => (
                                        <tr key={book.id} className="border-b border-[#f1f3f5] transition-colors duration-200 hover:bg-[#f0f7ff]">
                                            <td className="px-4 py-3.5 text-[0.92rem] text-[#2c3e50] align-middle">
                                                <strong className="font-semibold">{book.title}</strong>
                                            </td>
                                            <td className="px-4 py-3.5 text-[0.92rem] text-[#2c3e50] align-middle">{book.author}</td>
                                            <td className="px-4 py-3.5 text-[0.92rem] text-[#2c3e50] align-middle">
                                                <span className="inline-block px-3 py-1 bg-[#eef2ff] text-[#5b6abf] rounded-full text-[0.82rem] font-medium">{book.category || '—'}</span>
                                            </td>
                                            <td className="px-4 py-3.5 text-[#2c3e50] align-middle font-mono text-[0.85rem]">{book.isbn}</td>
                                            <td className="px-4 py-3.5 text-[0.92rem] text-[#2c3e50] align-middle text-center">
                                                <span className={`inline-block px-3 py-1 rounded-full text-[0.82rem] font-semibold ${book.copiesAvailable > 0 ? 'bg-[#e8f8f0] text-[#27ae60]' : 'bg-[#fdecea] text-[#e74c3c]'
                                                    }`}>
                                                    {book.copiesAvailable} / {book.totalCopies}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3.5 text-[0.92rem] text-[#2c3e50] align-middle text-center">
                                                <div className="flex justify-center gap-2">
                                                    <button onClick={() => handleEdit(book)} className="p-1.5 border-[1.5px] border-[#3498db] rounded-lg bg-white text-[#3498db] cursor-pointer text-[0.95rem] transition-all hover:bg-[#3498db] hover:text-white" title="Edit">
                                                        ✏️
                                                    </button>
                                                    <button onClick={() => handleDelete(book.id)} className="p-1.5 border-[1.5px] border-[#e74c3c] rounded-lg bg-white text-[#e74c3c] cursor-pointer text-[0.95rem] transition-all hover:bg-[#e74c3c] hover:text-white" title="Delete">
                                                        🗑️
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </main>
            </div>

            {/* Injected responsive + animation styles */}
            <style>{`
                /* ── Animations ── */
                @keyframes fadeSlideIn {
                    from { opacity: 0; transform: translateY(-12px); }
                    to   { opacity: 1; transform: translateY(0); }
                }
                @keyframes spin {
                    to { transform: rotate(360deg); }
                }
                @keyframes pulse {
                    0%, 100% { opacity: 1; }
                    50%      { opacity: .6; }
                }

                /* ── Responsive ── */
                @media (max-width: 1024px) {
                    .books-stats-grid {
                        grid-template-columns: repeat(2, 1fr) !important;
                    }
                    .books-grid {
                        grid-template-columns: repeat(2, 1fr) !important;
                    }
                }
                @media (max-width: 768px) {
                    main {
                        margin-left: 0 !important;
                        padding: 1rem !important;
                    }
                    .books-stats-grid {
                        grid-template-columns: 1fr 1fr !important;
                        gap: 0.75rem !important;
                    }
                    .books-toolbar {
                        flex-direction: column !important;
                        gap: 0.75rem !important;
                    }
                    .books-search-wrap {
                        width: 100% !important;
                        min-width: 0 !important;
                    }
                    .books-toolbar-right {
                        width: 100% !important;
                        justify-content: space-between !important;
                    }
                    .books-grid {
                        grid-template-columns: 1fr !important;
                    }
                }
                @media (max-width: 480px) {
                    .books-stats-grid {
                        grid-template-columns: 1fr !important;
                    }
                }

                /* ── Hover effects ── */
                .books-table-row:hover {
                    background-color: #f0f7ff !important;
                }
                input:focus, select:focus {
                    border-color: #3498db !important;
                    outline: none;
                    box-shadow: 0 0 0 3px rgba(52,152,219,0.15);
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
    btnAdd: {
        padding: '0.75rem 1.5rem',
        background: 'linear-gradient(135deg, #2ecc71, #27ae60)',
        color: 'white',
        border: 'none',
        borderRadius: '10px',
        cursor: 'pointer',
        fontSize: '0.95rem',
        fontWeight: '600',
        boxShadow: '0 4px 14px rgba(46,204,113,0.35)',
        transition: 'all 0.3s',
        letterSpacing: '0.3px',
    },
    btnCancel: {
        padding: '0.75rem 1.5rem',
        background: 'linear-gradient(135deg, #95a5a6, #7f8c8d)',
        color: 'white',
        border: 'none',
        borderRadius: '10px',
        cursor: 'pointer',
        fontSize: '0.95rem',
        fontWeight: '600',
        boxShadow: '0 4px 14px rgba(127,140,141,0.3)',
        transition: 'all 0.3s',
    },

    /* Stats */
    statsGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: '1rem',
        marginBottom: '1.5rem',
    },
    statCard: {
        backgroundColor: 'white',
        padding: '1.25rem 1.5rem',
        borderRadius: '12px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.06)',
        display: 'flex',
        alignItems: 'center',
        gap: '1rem',
        transition: 'transform 0.25s, box-shadow 0.25s',
    },
    statIcon: { fontSize: '2rem' },
    statValue: { fontSize: '1.65rem', fontWeight: '700', color: '#2c3e50' },
    statLabel: { fontSize: '0.82rem', color: '#95a5a6', marginTop: '2px', textTransform: 'uppercase', letterSpacing: '0.5px' },

    /* Alerts */
    alertError: {
        background: 'linear-gradient(135deg, #fff5f5, #ffe0e0)',
        color: '#c0392b',
        padding: '0.85rem 1.25rem',
        borderRadius: '10px',
        marginBottom: '1rem',
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
        marginBottom: '1rem',
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

    /* Form */
    formCard: {
        backgroundColor: 'white',
        padding: '2rem',
        borderRadius: '14px',
        marginBottom: '1.5rem',
        boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
        border: '1px solid rgba(52,152,219,0.12)',
        animation: 'fadeSlideIn 0.35s ease',
    },
    formTitle: {
        margin: '0 0 1.25rem 0',
        color: '#2c3e50',
        fontSize: '1.3rem',
        fontWeight: '600',
    },
    formGrid: {
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '1rem',
    },
    formGroup: {
        display: 'flex',
        flexDirection: 'column',
        gap: '0.35rem',
    },
    label: {
        fontSize: '0.85rem',
        fontWeight: '600',
        color: '#34495e',
    },
    required: { color: '#e74c3c' },
    input: {
        padding: '0.7rem 0.9rem',
        border: '1.5px solid #dfe6e9',
        borderRadius: '8px',
        fontSize: '0.95rem',
        transition: 'border-color 0.3s, box-shadow 0.3s',
        backgroundColor: '#fafbfc',
    },
    formActions: {
        gridColumn: '1 / -1',
        display: 'flex',
        gap: '0.75rem',
        marginTop: '0.5rem',
    },
    btnSubmit: {
        flex: 1,
        padding: '0.8rem',
        background: 'linear-gradient(135deg, #3498db, #2980b9)',
        color: 'white',
        border: 'none',
        borderRadius: '10px',
        cursor: 'pointer',
        fontSize: '0.95rem',
        fontWeight: '600',
        transition: 'all 0.3s',
        boxShadow: '0 4px 14px rgba(52,152,219,0.3)',
    },
    btnFormCancel: {
        flex: 1,
        padding: '0.8rem',
        backgroundColor: '#ecf0f1',
        color: '#7f8c8d',
        border: '1.5px solid #dfe6e9',
        borderRadius: '10px',
        cursor: 'pointer',
        fontSize: '0.95rem',
        fontWeight: '600',
        transition: 'all 0.3s',
    },

    /* Toolbar */
    toolbar: {
        display: 'flex',
        alignItems: 'center',
        gap: '1rem',
        marginBottom: '1.25rem',
        flexWrap: 'wrap',
    },
    searchWrap: {
        display: 'flex',
        alignItems: 'center',
        backgroundColor: 'white',
        borderRadius: '10px',
        padding: '0 1rem',
        flex: 1,
        minWidth: '260px',
        border: '1.5px solid #dfe6e9',
        transition: 'border-color 0.3s, box-shadow 0.3s',
    },
    searchIcon: { fontSize: '1.1rem', marginRight: '0.5rem' },
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
    toolbarRight: {
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
    },
    filterSelect: {
        padding: '0.65rem 1rem',
        borderRadius: '10px',
        border: '1.5px solid #dfe6e9',
        fontSize: '0.9rem',
        backgroundColor: 'white',
        color: '#2c3e50',
        cursor: 'pointer',
        minWidth: '160px',
    },
    viewToggle: {
        display: 'flex',
        backgroundColor: 'white',
        borderRadius: '10px',
        overflow: 'hidden',
        border: '1.5px solid #dfe6e9',
    },
    viewBtn: {
        padding: '0.55rem 0.85rem',
        border: 'none',
        background: 'transparent',
        cursor: 'pointer',
        fontSize: '1.15rem',
        color: '#95a5a6',
        transition: 'all 0.2s',
    },
    viewBtnActive: {
        padding: '0.55rem 0.85rem',
        border: 'none',
        background: 'linear-gradient(135deg, #3498db, #2980b9)',
        cursor: 'pointer',
        fontSize: '1.15rem',
        color: 'white',
        transition: 'all 0.2s',
    },

    /* Loading */
    loadingWrap: {
        textAlign: 'center',
        padding: '3rem',
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

    /* Results */
    resultsInfo: {
        fontSize: '0.88rem',
        color: '#7f8c8d',
        marginBottom: '1rem',
    },

    /* Empty */
    emptyState: {
        textAlign: 'center',
        padding: '4rem 2rem',
        backgroundColor: 'white',
        borderRadius: '14px',
        boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
    },
    emptyIcon: { fontSize: '3.5rem', marginBottom: '1rem' },
    emptyTitle: { color: '#2c3e50', marginBottom: '0.5rem', fontSize: '1.25rem' },
    emptyText: { color: '#95a5a6', fontSize: '0.95rem', maxWidth: '380px', margin: '0 auto' },

    /* Grid */
    booksGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '1.25rem',
    },

    /* Table */
    tableWrap: {
        backgroundColor: 'white',
        borderRadius: '14px',
        boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
        overflowX: 'auto',
    },
    table: {
        width: '100%',
        borderCollapse: 'collapse',
        minWidth: '700px',
    },
    th: {
        textAlign: 'left',
        padding: '0.9rem 1rem',
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
        padding: '0.85rem 1rem',
        fontSize: '0.92rem',
        color: '#2c3e50',
        verticalAlign: 'middle',
    },
    categoryBadge: {
        display: 'inline-block',
        padding: '0.2rem 0.7rem',
        backgroundColor: '#eef2ff',
        color: '#5b6abf',
        borderRadius: '20px',
        fontSize: '0.82rem',
        fontWeight: '500',
    },
    badgeAvailable: {
        display: 'inline-block',
        padding: '0.25rem 0.75rem',
        backgroundColor: '#e8f8f0',
        color: '#27ae60',
        borderRadius: '20px',
        fontSize: '0.82rem',
        fontWeight: '600',
    },
    badgeOut: {
        display: 'inline-block',
        padding: '0.25rem 0.75rem',
        backgroundColor: '#fdecea',
        color: '#e74c3c',
        borderRadius: '20px',
        fontSize: '0.82rem',
        fontWeight: '600',
    },
    actionBtns: {
        display: 'flex',
        gap: '0.4rem',
        justifyContent: 'center',
    },
    btnEdit: {
        padding: '0.4rem 0.65rem',
        border: '1.5px solid #3498db',
        borderRadius: '8px',
        background: 'transparent',
        cursor: 'pointer',
        fontSize: '0.95rem',
        transition: 'all 0.2s',
    },
    btnDelete: {
        padding: '0.4rem 0.65rem',
        border: '1.5px solid #e74c3c',
        borderRadius: '8px',
        background: 'transparent',
        cursor: 'pointer',
        fontSize: '0.95rem',
        transition: 'all 0.2s',
    },
};
