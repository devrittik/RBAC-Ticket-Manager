import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

const EMPTY_FORM = {
  title: '',
  description: '',
  category: 'general',
  status: 'open',
  priority: 'medium',
};

export default function Dashboard() {
  const { user, logout } = useAuth();
  const [tickets, setTickets] = useState([]);
  const [users, setUsers] = useState([]);
  const [assignmentDrafts, setAssignmentDrafts] = useState({});
  const [form, setForm] = useState(EMPTY_FORM);
  const [editId, setEditId] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('tickets');

  const fetchTickets = async () => {
    try {
      const res = await api.get('/tickets');
      setTickets(res.data.data.tickets);
    } catch (err) {
      setError('Failed to fetch tickets');
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await api.get('/admin/users');
      setUsers(res.data.data.users);
    } catch (err) {
      flash('error', 'Failed to fetch users');
    }
  };

  useEffect(() => {
    fetchTickets();
    if (user.role === 'admin') {
      fetchUsers();
    }
  }, []);

  const flash = (type, msg) => {
    if (type === 'success') {
      setSuccess(msg);
      setTimeout(() => setSuccess(''), 3000);
      return;
    }

    setError(msg);
    setTimeout(() => setError(''), 4000);
  };

  const adminUsers = users.filter((listedUser) => listedUser.role === 'admin');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (editId) {
        await api.put(`/tickets/${editId}`, form);
        flash('success', 'Ticket updated');
      } else {
        await api.post('/tickets', form);
        flash('success', 'Ticket created');
      }

      setForm(EMPTY_FORM);
      setEditId(null);
      fetchTickets();
    } catch (err) {
      flash('error', err.response?.data?.message || 'Operation failed');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (ticket) => {
    setEditId(ticket._id);
    setForm({
      title: ticket.title,
      description: ticket.description || '',
      category: ticket.category || 'general',
      status: ticket.status,
      priority: ticket.priority,
    });
    window.scrollTo(0, 0);
  };

  const resetForm = () => {
    setEditId(null);
    setForm(EMPTY_FORM);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this ticket?')) return;

    try {
      await api.delete(`/tickets/${id}`);
      flash('success', 'Ticket deleted');
      fetchTickets();
    } catch (err) {
      flash('error', err.response?.data?.message || 'Delete failed');
    }
  };

  const handleAssign = async (ticketId) => {
    const adminId = assignmentDrafts[ticketId];

    if (!adminId) {
      flash('error', 'Choose an admin before assigning');
      return;
    }

    try {
      await api.patch(`/tickets/${ticketId}/assign`, { adminId });
      flash('success', 'Ticket assigned');
      fetchTickets();
    } catch (err) {
      flash('error', err.response?.data?.message || 'Assignment failed');
    }
  };

  const handleResolve = async (id) => {
    try {
      await api.patch(`/tickets/${id}/resolve`);
      flash('success', 'Ticket resolved');
      fetchTickets();
    } catch (err) {
      flash('error', err.response?.data?.message || 'Failed to resolve');
    }
  };

  const handleClose = async (id) => {
    try {
      await api.patch(`/tickets/${id}/close`);
      flash('success', 'Ticket closed');
      fetchTickets();
    } catch (err) {
      flash('error', err.response?.data?.message || 'Failed to close ticket');
    }
  };

  const handleReopen = async (id) => {
    try {
      await api.patch(`/tickets/${id}/reopen`);
      flash('success', 'Ticket reopened');
      fetchTickets();
    } catch (err) {
      flash('error', err.response?.data?.message || 'Failed to reopen ticket');
    }
  };

  const handleRoleChange = async (userId, currentRole) => {
    const newRole = currentRole === 'admin' ? 'user' : 'admin';
    if (!window.confirm(`Promote or demote this user to ${newRole}?`)) return;

    try {
      await api.patch(`/admin/users/${userId}/role`, { role: newRole });
      flash('success', `User role updated to ${newRole}`);
      fetchUsers();
      fetchTickets();
    } catch (err) {
      flash('error', err.response?.data?.message || 'Role update failed');
    }
  };

  const statusColor = {
    open: '#f59e0b',
    'in-progress': '#3b82f6',
    resolved: '#10b981',
    closed: '#6b7280',
  };

  const priorityColor = {
    low: '#6b7280',
    medium: '#f59e0b',
    high: '#ef4444',
    critical: '#7c3aed',
  };

  const ticketHeading = user.role === 'admin' ? 'All Tickets' : 'My Tickets';
  const ticketHelperText = user.role === 'admin'
    ? 'Every raised ticket is visible here so admins can assign, resolve, close, and reopen it.'
    : 'These are the tickets you raised. You can edit them while they are still open.';

  return (
    <div className="dashboard">
      <header className="dash-header">
        <div>
          <h1>Ticket Manager</h1>
          <span className={`badge badge-${user.role}`}>{user.role}</span>
        </div>

        <div className="user-info">
          <span>Hello, {user.name}</span>
          <button className="btn-logout" onClick={logout}>Logout</button>
        </div>

        {user.role === 'admin' && (
          <div className="tab-bar">
            <button
              className={`tab-btn ${activeTab === 'tickets' ? 'active' : ''}`}
              onClick={() => setActiveTab('tickets')}
            >
              Tickets
            </button>
            <button
              className={`tab-btn ${activeTab === 'users' ? 'active' : ''}`}
              onClick={() => setActiveTab('users')}
            >
              Users
            </button>
          </div>
        )}
      </header>

      {activeTab === 'tickets' && (
        <div className="dash-content">
          <section className="card">
            <h2>{editId ? 'Edit Ticket' : 'Raise a Ticket'}</h2>
            {error && <div className="alert error">{error}</div>}
            {success && <div className="alert success">{success}</div>}

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Title *</label>
                <input
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  required
                  placeholder="Ticket title"
                />
              </div>

              <div className="form-group">
                <label>Description</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Optional description"
                  rows={3}
                />
              </div>

              <div className="form-group">
                <label>Category</label>
                <select
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                >
                  <option value="general">General</option>
                  <option value="billing">Billing</option>
                  <option value="technical">Technical</option>
                  <option value="feature-request">Feature Request</option>
                </select>
              </div>

              <div className={`form-row ${user.role !== 'admin' ? 'single-column' : ''}`}>
                <div className="form-group">
                  <label>Priority</label>
                  <select
                    value={form.priority}
                    onChange={(e) => setForm({ ...form, priority: e.target.value })}
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="critical">Critical</option>
                  </select>
                </div>

                {user.role === 'admin' && (
                  <div className="form-group">
                    <label>Status</label>
                    <select
                      value={form.status}
                      onChange={(e) => setForm({ ...form, status: e.target.value })}
                    >
                      <option value="open">Open</option>
                      <option value="in-progress">In Progress</option>
                      <option value="resolved">Resolved</option>
                      <option value="closed">Closed</option>
                    </select>
                  </div>
                )}
              </div>

              <div className="form-actions">
                <button type="submit" className="btn-primary" disabled={loading}>
                  {loading ? 'Saving...' : editId ? 'Update Ticket' : 'Create Ticket'}
                </button>

                {editId && (
                  <button type="button" className="btn-secondary" onClick={resetForm}>
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </section>

          <section className="card">
            <h2>{ticketHeading} <span className="count">{tickets.length}</span></h2>
            <p className="section-note">{ticketHelperText}</p>

            {tickets.length === 0 ? (
              <p className="empty">
                {user.role === 'admin' ? 'No tickets in the queue yet.' : 'No tickets yet. Create one above.'}
              </p>
            ) : (
              <div className="ticket-list">
                {tickets.map((ticket) => (
                  <div key={ticket._id} className="ticket-item">
                    <div className="ticket-info">
                      <h3>{ticket.title}</h3>
                      {ticket.description && <p>{ticket.description}</p>}

                      {ticket.createdBy && (
                        <small>
                          raised by {ticket.createdBy.name} ({ticket.createdBy.email})
                        </small>
                      )}

                      <small>
                        assigned to {ticket.assignedTo ? `${ticket.assignedTo.name} (${ticket.assignedTo.email})` : 'unassigned'}
                      </small>

                      <div className="ticket-meta">
                        <span className="pill" style={{ background: statusColor[ticket.status] }}>
                          {ticket.status}
                        </span>
                        <span className="pill" style={{ background: priorityColor[ticket.priority] }}>
                          {ticket.priority}
                        </span>
                        <span className="pill pill-category">{ticket.category}</span>
                      </div>
                    </div>

                    <div className="ticket-actions">
                      {ticket.status === 'closed' && user.role === 'admin' ? (
                        <button className="btn-reopen" onClick={() => handleReopen(ticket._id)}>
                          Reopen
                        </button>
                      ) : null}

                      {(user.role === 'admin' || ticket.status === 'open') && (
                        <button className="btn-edit" onClick={() => handleEdit(ticket)}>
                          Edit
                        </button>
                      )}

                      {user.role === 'admin' && ['open', 'in-progress'].includes(ticket.status) && (
                        <div className="assign-controls">
                          <select
                            value={assignmentDrafts[ticket._id] ?? ticket.assignedTo?._id ?? ''}
                            onChange={(e) =>
                              setAssignmentDrafts((current) => ({
                                ...current,
                                [ticket._id]: e.target.value,
                              }))
                            }
                          >
                            <option value="">Assign admin</option>
                            {adminUsers.map((adminUser) => (
                              <option key={adminUser._id} value={adminUser._id}>
                                {adminUser.name}
                              </option>
                            ))}
                          </select>
                          <button
                            type="button"
                            className="btn-secondary btn-inline"
                            onClick={() => handleAssign(ticket._id)}
                          >
                            {ticket.assignedTo ? 'Reassign' : 'Assign'}
                          </button>
                        </div>
                      )}

                      {user.role === 'admin' && (
                        <button className="btn-delete" onClick={() => handleDelete(ticket._id)}>
                          Delete
                        </button>
                      )}

                      {user.role === 'admin' && ['open', 'in-progress'].includes(ticket.status) && (
                        <button className="btn-resolve" onClick={() => handleResolve(ticket._id)}>
                          Resolve
                        </button>
                      )}

                      {user.role === 'admin' && ticket.status === 'resolved' && (
                        <button className="btn-close" onClick={() => handleClose(ticket._id)}>
                          Close
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      )}

      {activeTab === 'users' && user.role === 'admin' && (
        <div className="dash-content">
          <section className="card">
            <h2>All Users <span className="count">{users.length}</span></h2>
            <div className="ticket-list">
              {users.map((listedUser) => (
                <div key={listedUser._id} className="ticket-item">
                  <div className="ticket-info">
                    <h3>{listedUser.name}</h3>
                    <p>{listedUser.email}</p>
                    <div className="ticket-meta">
                      <span className={`badge badge-${listedUser.role}`}>{listedUser.role}</span>
                      <small style={{ color: '#9ca3af' }}>
                        joined {new Date(listedUser.createdAt).toLocaleDateString()}
                      </small>
                    </div>
                  </div>

                  <div className="ticket-actions">
                    {listedUser._id !== user.id && (
                      <button
                        className={listedUser.role === 'admin' ? 'btn-delete' : 'btn-resolve'}
                        onClick={() => handleRoleChange(listedUser._id, listedUser.role)}
                      >
                        {listedUser.role === 'admin' ? 'Demote' : 'Promote'}
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
