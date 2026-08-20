import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '../config';

const EMPTY_SERVICE_FORM = {
  title: '',
  price: '',
  desc: '',
};

const EMPTY_BLOG_FORM = {
  title: '',
  description: '',
  image_url: '',
};

export default function AdminPage() {
  const [password, setPassword] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [error, setError] = useState('');
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  
  const [services, setServices] = useState([]);
  const [serviceForm, setServiceForm] = useState(EMPTY_SERVICE_FORM);
  const [editingServiceId, setEditingServiceId] = useState(null);
  const [serviceStatusMsg, setServiceStatusMsg] = useState('');
  const [serviceLoading, setServiceLoading] = useState(false);

  // Blog management state
  const [blogs, setBlogs] = useState([]);
  const [blogForm, setBlogForm] = useState(EMPTY_BLOG_FORM);
  const [editingBlogId, setEditingBlogId] = useState(null);
  const [blogStatusMsg, setBlogStatusMsg] = useState('');
  const [blogLoading, setBlogLoading] = useState(false);

  // Time slot management state
  const [slots, setSlots] = useState(['09:00 AM', '11:30 AM', '02:00 PM', '04:30 PM']);
  const [newSlot, setNewSlot] = useState('');
  const [savingSlots, setSavingSlots] = useState(false);
  const [slotStatusMsg, setSlotStatusMsg] = useState('');

  // Email popup modal state
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [emailBody, setEmailBody] = useState('');
  const [sendingEmail, setSendingEmail] = useState(false);

  const fetchServices = async (passToTry) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/services/`, {
        headers: {
          'X-Admin-Password': passToTry,
        },
      });

      if (!res.ok) {
        throw new Error('Unable to load services');
      }

      const data = await res.json();
      setServices(Array.isArray(data) ? data : []);
    } catch (err) {
      console.warn('Could not load services from backend:', err);
      setServices([]);
    }
  };

  const fetchBlogs = async (passToTry) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/blog/`, {
        headers: {
          'X-Admin-Password': passToTry,
        },
      });

      if (!res.ok) {
        throw new Error('Unable to load blogs');
      }

      const data = await res.json();
      setBlogs(Array.isArray(data) ? data : []);
    } catch (err) {
      console.warn('Could not load blogs from backend:', err);
      setBlogs([]);
    }
  };

  const fetchBookingsAndSlots = async (passToTry) => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${API_BASE_URL}/api/bookings/`, {
        headers: {
          'X-Admin-Password': passToTry,
        },
      });

      if (!res.ok) {
        if (res.status === 401) {
          throw new Error('Invalid admin password');
        }
        throw new Error(`Backend request failed (${res.status})`);
      }

      const data = await res.json();
      setBookings(data);
      await fetchServices(passToTry);
      await fetchBlogs(passToTry);
      setIsAuthenticated(true);
      sessionStorage.setItem('csa_admin_pass', passToTry);

      // Fetch active slots
      const slotRes = await fetch(`${API_BASE_URL}/api/slots/`);
      if (slotRes.ok) {
        const slotData = await slotRes.json();
        if (Array.isArray(slotData) && slotData.length > 0) {
          setSlots(slotData);
        }
      }
    } catch (err) {
      if (err instanceof TypeError) {
        setError('Cannot connect to the backend. Check VITE_API_BASE_URL and the backend service.');
      } else {
        setError(err.message || 'Failed to authenticate');
      }
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = (e) => {
    e.preventDefault();
    fetchBookingsAndSlots(password);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setPassword('');
    sessionStorage.removeItem('csa_admin_pass');
  };

  // --- Service Management ---
  const handleServiceInputChange = (e) => {
    const { name, value } = e.target;
    setServiceForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSaveService = async (e) => {
    e.preventDefault();

    const trimmedTitle = serviceForm.title.trim();
    const parsedPrice = Number(serviceForm.price);

    if (!trimmedTitle || Number.isNaN(parsedPrice)) {
      setServiceStatusMsg('Please complete the title and price fields.');
      return;
    }

    const normalizedService = {
      id: editingServiceId || undefined,
      title: trimmedTitle,
      price: parsedPrice,
      description: serviceForm.desc.trim() || 'Service description pending.',
    };

    setServiceLoading(true);

    try {
      const url = editingServiceId
        ? `${API_BASE_URL}/api/services/${editingServiceId}`
        : `${API_BASE_URL}/api/services/`;

      const method = editingServiceId ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'X-Admin-Password': password,
        },
        body: JSON.stringify(normalizedService),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => null);
        throw new Error(errData?.detail || 'Failed to save service');
      }

      await fetchServices(password);
      setServiceForm(EMPTY_SERVICE_FORM);
      setEditingServiceId(null);
      setServiceStatusMsg(editingServiceId ? 'Service updated successfully!' : 'Service added successfully!');
      setTimeout(() => setServiceStatusMsg(''), 2500);
    } catch (err) {
      setServiceStatusMsg(err.message || 'Error saving service');
    } finally {
      setServiceLoading(false);
    }
  };

  const handleEditService = (service) => {
    setEditingServiceId(service.id);
    setServiceForm({
      title: service.title,
      price: String(service.price),
      desc: service.description || service.desc,
    });
  };

  const handleDeleteService = async (serviceId) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/services/${encodeURIComponent(serviceId)}`, {
        method: 'DELETE',
        headers: {
          'X-Admin-Password': password,
        },
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => null);
        throw new Error(errData?.detail || 'Failed to delete service');
      }

      if (editingServiceId === serviceId) {
        setEditingServiceId(null);
        setServiceForm(EMPTY_SERVICE_FORM);
      }

      setServices((prev) => prev.filter((service) => service.id !== serviceId));
      setServiceStatusMsg('Service removed successfully!');
      setTimeout(() => setServiceStatusMsg(''), 2500);
    } catch (err) {
      setServiceStatusMsg(err.message || 'Error deleting service');
    }
  };

  // --- Blog Management ---
  const handleBlogInputChange = (e) => {
    const { name, value } = e.target;
    setBlogForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSaveBlog = async (e) => {
    e.preventDefault();

    const trimmedTitle = blogForm.title.trim();
    const trimmedDesc = blogForm.description.trim();
    const trimmedImageUrl = blogForm.image_url.trim();

    if (!trimmedTitle || !trimmedDesc) {
      setBlogStatusMsg('Please complete the title and description fields.');
      return;
    }

    setBlogLoading(true);

    try {
      const url = editingBlogId
        ? `${API_BASE_URL}/api/blog/${editingBlogId}`
        : `${API_BASE_URL}/api/blog/`;

      const method = editingBlogId ? 'PUT' : 'POST';
      
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'X-Admin-Password': password,
        },
        body: JSON.stringify({
          title: trimmedTitle,
          description: trimmedDesc,
          image_url: trimmedImageUrl || null,
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => null);
        throw new Error(errData?.detail || 'Failed to save blog post');
      }

      await fetchBlogs(password);
      setBlogForm(EMPTY_BLOG_FORM);
      setEditingBlogId(null);
      
      setBlogStatusMsg(editingBlogId ? 'Blog post updated successfully!' : 'Blog post published successfully!');
      setTimeout(() => setBlogStatusMsg(''), 2500);
    } catch (err) {
      setBlogStatusMsg(err.message || 'Error saving blog post');
    } finally {
      setBlogLoading(false);
    }
  };

  const handleEditBlog = (blog) => {
    setEditingBlogId(blog.id);
    setBlogForm({
      title: blog.title,
      description: blog.description,
      image_url: blog.image_url || '',
    });
  };

  const handleDeleteBlog = async (blogId) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/blog/${encodeURIComponent(blogId)}`, {
        method: 'DELETE',
        headers: {
          'X-Admin-Password': password,
        },
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => null);
        throw new Error(errData?.detail || 'Failed to delete blog post');
      }

      if (editingBlogId === blogId) {
        setEditingBlogId(null);
        setBlogForm(EMPTY_BLOG_FORM);
      }

      setBlogs((prev) => prev.filter((blog) => blog.id !== blogId));
      setBlogStatusMsg('Blog post removed successfully!');
      setTimeout(() => setBlogStatusMsg(''), 2500);
    } catch (err) {
      setBlogStatusMsg(err.message || 'Error deleting blog post');
    }
  };

  // --- Slot Management ---
  const handleAddSlot = (e) => {
    e.preventDefault();
    const formatted = newSlot.trim();
    if (formatted && !slots.includes(formatted)) {
      setSlots([...slots, formatted]);
      setNewSlot('');
    }
  };

  const handleRemoveSlot = (slotToRemove) => {
    setSlots(slots.filter((s) => s !== slotToRemove));
  };

  const handleSaveSlots = async () => {
    setSavingSlots(true);
    setSlotStatusMsg('');
    try {
      const res = await fetch(`${API_BASE_URL}/api/slots/`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-Admin-Password': password,
        },
        body: JSON.stringify(slots),
      });

      if (!res.ok) {
        throw new Error('Failed to update time slots');
      }

      setSlotStatusMsg('Time slots saved successfully!');
      setTimeout(() => setSlotStatusMsg(''), 3000);
    } catch (err) {
      setSlotStatusMsg(err.message || 'Error saving slots');
    } finally {
      setSavingSlots(false);
    }
  };

  // --- Booking Status & Email Management ---
  const handleOpenStatusModal = (booking) => {
    setSelectedBooking(booking);
    setEmailBody(
      `Hi ${booking.full_name},\n\n` +
      `Regarding your request for ${booking.service_title} on ${booking.booking_date} at ${booking.booking_time}:\n\n` +
      `Unfortunately, the requested time slot is not approved. Please reply to this email with an alternative date or time that works for you.\n\n` +
      `Best regards,\nCSA Chimney Service`
    );
  };

  const handleSendEmailAndChangeStatus = async () => {
    if (!selectedBooking) return;

    setSendingEmail(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/bookings/${selectedBooking.id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'X-Admin-Password': password,
        },
        body: JSON.stringify({
          status: 'changed',
          recipient_email: selectedBooking.email,
          subject: "Requested time isn't approved",
          message: emailBody,
        }),
      });

      if (!res.ok) {
        throw new Error('Failed to send email via server');
      }

      setBookings((prevBookings) =>
        prevBookings.map((b) =>
          b.id === selectedBooking.id ? { ...b, status: 'changed' } : b
        )
      );

      setSelectedBooking(null);
    } catch (err) {
      alert(err.message || 'Error sending email');
    } finally {
      setSendingEmail(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-neutral-950 text-neutral-100 flex items-center justify-center p-4">
        <div className="bg-neutral-900 border border-neutral-800 p-8 rounded-2xl w-full max-w-md shadow-2xl">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-orange-500">CSA Admin Access</h1>
            <p className="text-sm text-neutral-400 mt-1">Enter your password to view service bookings</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs text-neutral-400 mb-1 font-medium">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-orange-500 text-neutral-100"
              />
            </div>

            {error && <p className="text-xs text-red-500 text-center font-medium">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-orange-600 hover:bg-orange-500 text-white font-medium py-2.5 rounded-lg text-sm transition-colors duration-150 disabled:opacity-50"
            >
              {loading ? 'Authenticating...' : 'Unlock Dashboard'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 p-6 md:p-10">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-800 pb-6">
          <div>
            <h1 className="text-3xl font-bold text-neutral-100">Booking Management</h1>
            <p className="text-neutral-400 text-sm mt-1">
              Total Bookings: <span className="text-orange-500 font-semibold">{bookings.length}</span>
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => fetchBookingsAndSlots(password)}
              className="bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 px-4 py-2 rounded-lg text-xs font-medium transition"
            >
              Refresh List
            </button>
            <button
              onClick={handleLogout}
              className="bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 px-4 py-2 rounded-lg text-xs font-medium transition"
            >
              Lock Dashboard
            </button>
          </div>
        </div>

        {/* Service Catalog Section */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6 shadow-xl space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-neutral-800 pb-3">
            <div>
              <h2 className="text-lg font-bold text-white">Service Catalog</h2>
              <p className="text-xs text-neutral-400">Add, update, or remove the services customers can book.</p>
            </div>
          </div>

          {serviceStatusMsg && (
            <p className="text-xs font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 p-2.5 rounded-lg">
              {serviceStatusMsg}
            </p>
          )}

          <form onSubmit={handleSaveService} className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="block text-xs font-semibold text-neutral-400 mb-1">Service Title</label>
              <input
                type="text"
                name="title"
                value={serviceForm.title}
                onChange={handleServiceInputChange}
                placeholder="e.g. Wood Stove & WETT Check"
                className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-orange-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-400 mb-1">Price</label>
              <input
                type="number"
                min="0"
                step="1"
                name="price"
                value={serviceForm.price}
                onChange={handleServiceInputChange}
                placeholder="220"
                className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-orange-500"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-neutral-400 mb-1">Description</label>
              <textarea
                name="desc"
                value={serviceForm.desc}
                onChange={handleServiceInputChange}
                rows="3"
                placeholder="Describe what this service includes..."
                className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-orange-500 resize-none"
              />
            </div>

            <div className="md:col-span-2 flex justify-end gap-3">
              {editingServiceId && (
                <button
                  type="button"
                  onClick={() => {
                    setEditingServiceId(null);
                    setServiceForm(EMPTY_SERVICE_FORM);
                  }}
                  className="px-4 py-2 rounded-lg text-xs font-semibold bg-neutral-800 text-neutral-300 hover:bg-neutral-700 transition"
                >
                  Cancel Edit
                </button>
              )}
              <button
                type="submit"
                disabled={serviceLoading}
                className="bg-orange-600 hover:bg-orange-500 text-white text-xs font-bold px-5 py-2.5 rounded-lg transition disabled:opacity-50"
              >
                {serviceLoading ? 'Saving...' : editingServiceId ? 'Save Service Changes' : 'Add Service'}
              </button>
            </div>
          </form>

          <div className="space-y-3 pt-2">
            {services.length === 0 ? (
              <p className="text-sm text-neutral-500">No services saved yet.</p>
            ) : (
              services.map((service) => (
                <div key={service.id} className="flex flex-col md:flex-row md:items-center justify-between gap-3 border border-neutral-800 rounded-lg p-4 bg-neutral-950/80">
                  <div>
                    <div className="font-semibold text-white">{service.title}</div>
                    <div className="text-xs text-neutral-400 mt-1">${service.price}</div>
                    <div className="text-xs text-neutral-500 mt-1">{service.description || service.desc || 'No description provided.'}</div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => handleEditService(service)}
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-neutral-800 text-neutral-200 hover:bg-neutral-700 transition"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteService(service.id)}
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 transition"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Blog Posts Section */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6 shadow-xl space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-neutral-800 pb-3">
            <div>
              <h2 className="text-lg font-bold text-white">Blog Posts</h2>
              <p className="text-xs text-neutral-400">Create, edit, or remove blog posts with images.</p>
            </div>
          </div>

          {blogStatusMsg && (
            <p className="text-xs font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 p-2.5 rounded-lg">
              {blogStatusMsg}
            </p>
          )}

          <form onSubmit={handleSaveBlog} className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="block text-xs font-semibold text-neutral-400 mb-1">Post Title</label>
              <input
                type="text"
                name="title"
                value={blogForm.title}
                onChange={handleBlogInputChange}
                placeholder="e.g. Preparing Your Chimney for Winter"
                className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-orange-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-400 mb-1">Cover Image URL</label>
              <input
                type="text"
                name="image_url"
                value={blogForm.image_url}
                onChange={handleBlogInputChange}
                placeholder="https://example.com/image.jpg"
                className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-orange-500"
              />
              {blogForm.image_url && (
                <div className="mt-3">
                  <img 
                    src={blogForm.image_url} 
                    alt="Blog Preview" 
                    className="h-16 w-auto object-cover rounded border border-neutral-700" 
                    onError={(e) => { e.target.style.display = 'none'; }} 
                  />
                </div>
              )}
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-neutral-400 mb-1">Description</label>
              <textarea
                name="description"
                value={blogForm.description}
                onChange={handleBlogInputChange}
                rows="4"
                placeholder="Write your blog post content here..."
                className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-orange-500 resize-none"
              />
            </div>

            <div className="md:col-span-2 flex justify-end gap-3">
              {editingBlogId && (
                <button
                  type="button"
                  onClick={() => {
                    setEditingBlogId(null);
                    setBlogForm(EMPTY_BLOG_FORM);
                  }}
                  className="px-4 py-2 rounded-lg text-xs font-semibold bg-neutral-800 text-neutral-300 hover:bg-neutral-700 transition"
                >
                  Cancel Edit
                </button>
              )}
              <button
                type="submit"
                disabled={blogLoading}
                className="bg-orange-600 hover:bg-orange-500 text-white text-xs font-bold px-5 py-2.5 rounded-lg transition disabled:opacity-50"
              >
                {blogLoading ? 'Saving...' : editingBlogId ? 'Save Blog Changes' : 'Publish Blog Post'}
              </button>
            </div>
          </form>

          <div className="space-y-3 pt-2">
            {blogs.length === 0 ? (
              <p className="text-sm text-neutral-500">No blog posts published yet.</p>
            ) : (
              blogs.map((blog) => (
                <div key={blog.id} className="flex flex-col md:flex-row md:items-center justify-between gap-4 border border-neutral-800 rounded-lg p-4 bg-neutral-950/80">
                  <div className="flex gap-4 items-start">
                    {blog.image_url ? (
                      <img src={blog.image_url} alt={blog.title} className="w-16 h-16 object-cover rounded-md border border-neutral-700 shrink-0" />
                    ) : (
                      <div className="w-16 h-16 bg-neutral-800 rounded-md border border-neutral-700 flex items-center justify-center text-[10px] text-neutral-500 shrink-0 uppercase tracking-wider font-semibold">
                        No Img
                      </div>
                    )}
                    <div>
                      <div className="font-semibold text-white">{blog.title}</div>
                      <div className="text-xs text-neutral-400 mt-1 line-clamp-2 pr-4">{blog.description}</div>
                    </div>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => handleEditBlog(blog)}
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-neutral-800 text-neutral-200 hover:bg-neutral-700 transition"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteBlog(blog.id)}
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 transition"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Time Slot Settings Section */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6 shadow-xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-neutral-800 pb-3">
            <div>
              <h2 className="text-lg font-bold text-white">Available Inspection Hours</h2>
              <p className="text-xs text-neutral-400">Configure available times for user bookings</p>
            </div>
            <button
              onClick={handleSaveSlots}
              disabled={savingSlots}
              className="bg-orange-600 hover:bg-orange-500 text-white text-xs font-bold px-4 py-2 rounded-lg transition disabled:opacity-50"
            >
              {savingSlots ? 'Saving...' : 'Save Available Hours'}
            </button>
          </div>

          {slotStatusMsg && (
            <p className="text-xs font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 p-2.5 rounded-lg">
              {slotStatusMsg}
            </p>
          )}

          {/* Slot Badges */}
          <div className="flex flex-wrap gap-2 pt-2">
            {slots.map((s) => (
              <span
                key={s}
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold bg-neutral-950 border border-neutral-800 text-neutral-200"
              >
                {s}
                <button
                  onClick={() => handleRemoveSlot(s)}
                  className="text-neutral-500 hover:text-red-400 transition font-bold text-sm leading-none"
                  title="Remove slot"
                >
                  ×
                </button>
              </span>
            ))}
          </div>

          {/* Add Slot Form */}
          <form onSubmit={handleAddSlot} className="flex gap-2 pt-2 max-w-sm">
            <input
              type="text"
              value={newSlot}
              onChange={(e) => setNewSlot(e.target.value)}
              placeholder="e.g. 01:00 PM"
              className="bg-neutral-950 border border-neutral-800 text-xs rounded-lg px-3 py-2 text-white focus:outline-none focus:border-orange-500 flex-grow"
            />
            <button
              type="submit"
              className="bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-semibold px-4 py-2 rounded-lg transition"
            >
              Add Slot
            </button>
          </form>
        </div>

        {/* Bookings Table */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden shadow-xl">
          {bookings.length === 0 ? (
            <div className="p-12 text-center text-neutral-500 text-sm">No bookings recorded yet.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-neutral-950 text-neutral-400 border-b border-neutral-800 text-xs font-semibold uppercase tracking-wider">
                  <tr>
                    <th className="px-6 py-4">ID</th>
                    <th className="px-6 py-4">Customer</th>
                    <th className="px-6 py-4">Service</th>
                    <th className="px-6 py-4">Date & Time</th>
                    <th className="px-6 py-4">Address</th>
                    <th className="px-6 py-4">Price</th>
                    <th className="px-6 py-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-800">
                  {bookings.map((b) => (
                    <tr key={b.id} className="hover:bg-neutral-800/40 transition">
                      <td className="px-6 py-4 font-mono text-xs text-neutral-500">#{b.id}</td>
                      <td className="px-6 py-4">
                        <div className="font-medium text-neutral-200">{b.full_name}</div>
                        <div className="text-xs text-neutral-400">{b.email}</div>
                        <div className="text-xs text-neutral-400">{b.phone}</div>
                      </td>
                      <td className="px-6 py-4 font-medium text-orange-400">{b.service_title}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-neutral-200">{b.booking_date}</div>
                        <div className="text-xs text-neutral-400">{b.booking_time}</div>
                      </td>
                      <td className="px-6 py-4 text-neutral-300 max-w-xs truncate">{b.address}</td>
                      <td className="px-6 py-4 font-semibold text-neutral-200">${b.price.toFixed(2)}</td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => handleOpenStatusModal(b)}
                          title="Click to notify client and request time change"
                          className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border capitalize cursor-pointer transition-all hover:scale-105 ${
                            b.status === 'changed'
                              ? 'bg-amber-500/10 text-amber-400 border-amber-500/30 hover:bg-amber-500/20'
                              : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20'
                          }`}
                        >
                          {b.status}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Direct Email Modal */}
      {selectedBooking && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 max-w-lg w-full space-y-4 shadow-2xl">
            <div className="flex justify-between items-center border-b border-neutral-800 pb-3">
              <h3 className="text-lg font-bold text-white">Notify Customer & Update Status</h3>
              <button
                onClick={() => setSelectedBooking(null)}
                className="text-neutral-400 hover:text-white font-bold text-sm"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-neutral-400 mb-1">To</label>
                <input
                  type="text"
                  readOnly
                  value={selectedBooking.email}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-2.5 text-xs text-neutral-300 outline-none cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-400 mb-1">Subject</label>
                <input
                  type="text"
                  readOnly
                  value="Requested time isn't approved"
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-2.5 text-xs text-orange-400 font-semibold outline-none cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-400 mb-1">Message Body</label>
                <textarea
                  rows={6}
                  value={emailBody}
                  onChange={(e) => setEmailBody(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-3 text-xs text-white focus:outline-none focus:border-orange-500 font-sans leading-relaxed resize-none"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2 border-t border-neutral-800">
              <button
                type="button"
                onClick={() => setSelectedBooking(null)}
                disabled={sendingEmail}
                className="px-4 py-2 rounded-lg text-xs font-semibold bg-neutral-800 text-neutral-300 hover:bg-neutral-700 transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSendEmailAndChangeStatus}
                disabled={sendingEmail}
                className="px-4 py-2 rounded-lg text-xs font-bold bg-orange-600 text-white hover:bg-orange-500 transition shadow-lg shadow-orange-600/20 disabled:opacity-50"
              >
                {sendingEmail ? 'Sending Email...' : 'Send Email & Mark as Changed'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}