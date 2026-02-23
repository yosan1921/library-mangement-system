import { useState, useEffect } from 'react';
import Navbar from '../../components/Navbar';
import Sidebar from '../../components/Sidebar';
import BookCard from '../../components/BookCard';
import LoadingSpinner from '../../components/LoadingSpinner';

export default function LibrarianBooks() {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingBook, setEditingBook] = useState(null);
  const [message, setMessage] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    author: '',
    category: '',
    isbn: '',
    publisher: '',
    publicationYear: '',
    totalCopies: 1,
    description: ''
  });

  useEffect(() => {
    fetchBooks();
  }, []);

  const fetchBooks = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:8081/api/books');
      const data = await response.json();
      setBooks(data);
    } catch (error) {
      console.error('Error fetching books:', error);
      setMessage('Error loading books');
    } finally {
      setLoading(false);
    }
  };

  const handleAddBook = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:8081/api/books', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          copiesAvailable: formData.totalCopies,
          publicationYear: parseInt(formData.publicationYear) || new Date().getFullYear()
        })
      });

      if (response.ok) {
        setShowAddModal(false);
        setFormData({
          title: '',
          author: '',
          category: '',
          isbn: '',
          publisher: '',
          publicationYear: '',
          totalCopies: 1,
          description: ''
        });
        setMessage('Book added successfully!');
        fetchBooks();
        setTimeout(() => setMessage(''), 3000);
      } else {
        setMessage('Error adding book');
      }
    } catch (error) {
      console.error('Error adding book:', error);
      setMessage('Error adding book');
    }
  };

  const handleEditBook = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`http://localhost:8081/api/books/${editingBook.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          publicationYear: parseInt(formData.publicationYear) || editingBook.publicationYear
        })
      });

      if (response.ok) {
        setShowEditModal(false);
        setEditingBook(null);
        setMessage('Book updated successfully!');
        fetchBooks();
        setTimeout(() => setMessage(''), 3000);
      } else {
        setMessage('Error updating book');
      }
    } catch (error) {
      console.error('Error updating book:', error);
      setMessage('Error updating book');
    }
  };

  const openEditModal = (book) => {
    setEditingBook(book);
    setFormData({
      title: book.title,
      author: book.author,
      category: book.category,
      isbn: book.isbn,
      publisher: book.publisher || '',
      publicationYear: book.publicationYear || '',
      totalCopies: book.totalCopies,
      description: book.description || ''
    });
    setShowEditModal(true);
  };

  const handleDeleteBook = async (id) => {
    if (confirm('Are you sure you want to delete this book?')) {
      try {
        const response = await fetch(`http://localhost:8081/api/books/${id}`, {
          method: 'DELETE'
        });

        if (response.ok) {
          setMessage('Book deleted successfully!');
          fetchBooks();
          setTimeout(() => setMessage(''), 3000);
        } else {
          setMessage('Error deleting book');
        }
      } catch (error) {
        console.error('Error deleting book:', error);
        setMessage('Error deleting book');
      }
    }
  };

  const filteredBooks = books.filter(book =>
    book.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    book.author?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    book.category?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) return <LoadingSpinner />;

  return (
    <>
      <Navbar />
      <div style={styles.layout}>
        <Sidebar role="librarian" />
        <main style={styles.main}>
          <div style={styles.header}>
            <h1 style={styles.title}>Manage Books</h1>
            <button onClick={() => setShowAddModal(true)} style={styles.btnAdd}>
              + Add New Book
            </button>
          </div>

          {message && <div style={styles.message}>{message}</div>}

          <input
            type="text"
            placeholder="Search books by title, author, or category..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={styles.searchInput}
          />

          <div style={styles.booksGrid}>
            {filteredBooks.length === 0 ? (
              <p style={styles.noData}>No books found</p>
            ) : (
              filteredBooks.map((book) => (
                <div key={book.id} style={styles.bookCardWrapper}>
                  <BookCard book={book} />
                  <div style={styles.bookActions}>
                    <button
                      onClick={() => openEditModal(book)}
                      style={styles.btnEdit}
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteBook(book.id)}
                      style={styles.btnDelete}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Add Book Modal */}
          {showAddModal && (
            <div style={styles.modal} onClick={() => setShowAddModal(false)}>
              <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
                <h2 style={styles.modalTitle}>Add New Book</h2>
                <form onSubmit={handleAddBook} style={styles.form}>
                  <input
                    type="text"
                    placeholder="Title *"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                    style={styles.input}
                  />
                  <input
                    type="text"
                    placeholder="Author *"
                    value={formData.author}
                    onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                    required
                    style={styles.input}
                  />
                  <input
                    type="text"
                    placeholder="Category *"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    required
                    style={styles.input}
                  />
                  <input
                    type="text"
                    placeholder="ISBN *"
                    value={formData.isbn}
                    onChange={(e) => setFormData({ ...formData, isbn: e.target.value })}
                    required
                    style={styles.input}
                  />
                  <input
                    type="text"
                    placeholder="Publisher"
                    value={formData.publisher}
                    onChange={(e) => setFormData({ ...formData, publisher: e.target.value })}
                    style={styles.input}
                  />
                  <input
                    type="number"
                    placeholder="Publication Year"
                    value={formData.publicationYear}
                    onChange={(e) => setFormData({ ...formData, publicationYear: e.target.value })}
                    style={styles.input}
                  />
                  <input
                    type="number"
                    placeholder="Total Copies *"
                    value={formData.totalCopies}
                    onChange={(e) => setFormData({ ...formData, totalCopies: parseInt(e.target.value) })}
                    required
                    min="1"
                    style={styles.input}
                  />
                  <textarea
                    placeholder="Description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows="3"
                    style={styles.textarea}
                  />
                  <div style={styles.modalActions}>
                    <button type="submit" style={styles.btnSubmit}>Add Book</button>
                    <button
                      type="button"
                      onClick={() => setShowAddModal(false)}
                      style={styles.btnCancel}
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Edit Book Modal */}
          {showEditModal && (
            <div style={styles.modal} onClick={() => setShowEditModal(false)}>
              <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
                <h2 style={styles.modalTitle}>Edit Book</h2>
                <form onSubmit={handleEditBook} style={styles.form}>
                  <input
                    type="text"
                    placeholder="Title *"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                    style={styles.input}
                  />
                  <input
                    type="text"
                    placeholder="Author *"
                    value={formData.author}
                    onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                    required
                    style={styles.input}
                  />
                  <input
                    type="text"
                    placeholder="Category *"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    required
                    style={styles.input}
                  />
                  <input
                    type="text"
                    placeholder="ISBN *"
                    value={formData.isbn}
                    onChange={(e) => setFormData({ ...formData, isbn: e.target.value })}
                    required
                    style={styles.input}
                  />
                  <input
                    type="text"
                    placeholder="Publisher"
                    value={formData.publisher}
                    onChange={(e) => setFormData({ ...formData, publisher: e.target.value })}
                    style={styles.input}
                  />
                  <input
                    type="number"
                    placeholder="Publication Year"
                    value={formData.publicationYear}
                    onChange={(e) => setFormData({ ...formData, publicationYear: e.target.value })}
                    style={styles.input}
                  />
                  <input
                    type="number"
                    placeholder="Total Copies *"
                    value={formData.totalCopies}
                    onChange={(e) => setFormData({ ...formData, totalCopies: parseInt(e.target.value) })}
                    required
                    min="1"
                    style={styles.input}
                  />
                  <textarea
                    placeholder="Description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows="3"
                    style={styles.textarea}
                  />
                  <div style={styles.modalActions}>
                    <button type="submit" style={styles.btnSubmit}>Update Book</button>
                    <button
                      type="button"
                      onClick={() => setShowEditModal(false)}
                      style={styles.btnCancel}
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </main>
      </div>
    </>
  );
}

const styles = {
  layout: { display: 'flex' },
  main: {
    flex: 1,
    padding: '2rem',
    backgroundColor: '#ecf0f1',
    minHeight: 'calc(100vh - 60px)',
    marginLeft: '260px'
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '2rem'
  },
  title: {
    color: '#2c3e50',
    margin: 0
  },
  btnAdd: {
    padding: '0.75rem 1.5rem',
    backgroundColor: '#27ae60',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '1rem',
    fontWeight: 'bold'
  },
  message: {
    padding: '1rem',
    backgroundColor: '#27ae60',
    color: 'white',
    borderRadius: '4px',
    marginBottom: '1rem'
  },
  searchInput: {
    width: '100%',
    padding: '1rem',
    border: '1px solid #ddd',
    borderRadius: '8px',
    fontSize: '1rem',
    marginBottom: '2rem'
  },
  booksGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
    gap: '1.5rem'
  },
  bookCardWrapper: {
    backgroundColor: 'white',
    borderRadius: '8px',
    overflow: 'hidden',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
  },
  bookActions: {
    display: 'flex',
    gap: '0.5rem',
    padding: '1rem'
  },
  btnEdit: {
    flex: 1,
    padding: '0.5rem',
    backgroundColor: '#3498db',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer'
  },
  btnDelete: {
    flex: 1,
    padding: '0.5rem',
    backgroundColor: '#e74c3c',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer'
  },
  modal: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000
  },
  modalContent: {
    backgroundColor: 'white',
    padding: '2rem',
    borderRadius: '8px',
    maxWidth: '500px',
    width: '90%',
    maxHeight: '90vh',
    overflow: 'auto'
  },
  modalTitle: {
    marginBottom: '1.5rem',
    color: '#2c3e50'
  },
  form: {
    display: 'grid',
    gap: '1rem'
  },
  input: {
    padding: '0.75rem',
    border: '1px solid #ddd',
    borderRadius: '4px',
    fontSize: '1rem'
  },
  textarea: {
    padding: '0.75rem',
    border: '1px solid #ddd',
    borderRadius: '4px',
    fontSize: '1rem',
    fontFamily: 'inherit',
    resize: 'vertical'
  },
  modalActions: {
    display: 'flex',
    gap: '1rem',
    marginTop: '1rem'
  },
  btnSubmit: {
    flex: 1,
    padding: '0.75rem',
    backgroundColor: '#27ae60',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '1rem'
  },
  btnCancel: {
    flex: 1,
    padding: '0.75rem',
    backgroundColor: '#95a5a6',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '1rem'
  },
  noData: {
    textAlign: 'center',
    padding: '2rem',
    color: '#7f8c8d',
    fontSize: '1.1rem',
    gridColumn: '1 / -1'
  }
};
