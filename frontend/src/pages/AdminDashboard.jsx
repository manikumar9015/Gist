import { useState, useEffect } from 'react';
import { fetchUsers, updateUserRole, deleteBook, fetchBooks } from '../api/books';
import { Loader2, Shield, Users, BookOpen, Trash2 } from 'lucide-react';

export default function AdminDashboard() {
  const [users, setUsers] = useState([]);
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [usersRes, booksRes] = await Promise.all([
          fetchUsers(),
          fetchBooks('', '', 0, 100) // fetch a lot of books
        ]);
        setUsers(usersRes.data);
        setBooks(booksRes.data.content);
      } catch (err) {
        console.error('Failed to load admin data', err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const handleRoleChange = async (userId, newRole) => {
    try {
      await updateUserRole(userId, newRole);
      setUsers(users.map(u => u.id === userId ? { ...u, role: newRole } : u));
    } catch (err) {
      alert('Failed to update role');
    }
  };

  const handleDeleteBook = async (bookId) => {
    if (!window.confirm('Are you sure you want to delete this book?')) return;
    try {
      await deleteBook(bookId);
      setBooks(books.filter(b => b.id !== bookId));
    } catch (err) {
      alert('Failed to delete book');
    }
  };

  if (loading) {
    return <div className="h-screen flex items-center justify-center"><Loader2 className="animate-spin text-primary-500" size={48} /></div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 animate-fade-in">
      <div className="flex items-center gap-3 mb-10">
        <Shield className="text-purple-500" size={32} />
        <h1 className="text-3xl font-outfit font-bold">Admin Dashboard</h1>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <div className="glass p-6 rounded-2xl">
          <div className="flex items-center gap-2 mb-6">
            <Users className="text-primary-500" size={24} />
            <h2 className="text-2xl font-bold">Users</h2>
          </div>
          <div className="space-y-4">
            {users.map(u => (
              <div key={u.id} className="flex items-center justify-between p-4 bg-surface-100 dark:bg-surface-800 rounded-xl">
                <div>
                  <p className="font-semibold">{u.username}</p>
                  <p className="text-sm text-surface-500">{u.email}</p>
                </div>
                <select 
                  value={u.role} 
                  onChange={(e) => handleRoleChange(u.id, e.target.value)}
                  className="bg-surface-200 dark:bg-surface-700 rounded-lg px-3 py-1 outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="USER">User</option>
                  <option value="ADMIN">Admin</option>
                </select>
              </div>
            ))}
          </div>
        </div>

        <div className="glass p-6 rounded-2xl">
          <div className="flex items-center gap-2 mb-6">
            <BookOpen className="text-primary-500" size={24} />
            <h2 className="text-2xl font-bold">All Books (Public & Private)</h2>
          </div>
          <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
            {books.map(b => (
              <div key={b.id} className="flex items-center justify-between p-4 bg-surface-100 dark:bg-surface-800 rounded-xl">
                <div className="overflow-hidden">
                  <p className="font-semibold truncate">{b.title}</p>
                  <p className="text-sm text-surface-500">{b.uploaderUsername ? `Uploaded by ${b.uploaderUsername}` : 'System'}</p>
                </div>
                <button 
                  onClick={() => handleDeleteBook(b.id)}
                  className="p-2 text-danger hover:bg-danger/10 rounded-lg transition-colors ml-4"
                >
                  <Trash2 size={20} />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
