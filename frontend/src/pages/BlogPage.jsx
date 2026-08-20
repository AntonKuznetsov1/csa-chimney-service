import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { API_BASE_URL } from '../config';

export default function BlogPage() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchPosts = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/blog/`);
      if (!res.ok) throw new Error('Failed to load blog posts');
      const data = await res.json();
      setPosts(data);
    } catch (err) {
      setError(err.message || 'Error loading posts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const handleLike = async (postId) => {
    // Optimistic UI update
    setPosts((prev) =>
      prev.map((p) => (p.id === postId ? { ...p, likes: p.likes + 1 } : p))
    );

    try {
      const res = await fetch(`${API_BASE_URL}/api/blog/${postId}/like`, {
        method: 'POST',
      });
      if (!res.ok) throw new Error('Failed to register like');
    } catch (err) {
      // Revert on error
      setPosts((prev) =>
        prev.map((p) => (p.id === postId ? { ...p, likes: p.likes - 1 } : p))
      );
    }
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100">
      {/* Header */}
      <header className="border-b border-neutral-800 bg-neutral-900/50 backdrop-blur sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/" className="text-xl font-bold text-white flex items-center gap-2">
            <span className="text-orange-500">CSA</span> Chimney Blog
          </Link>
          <div className="flex gap-4">
            <Link to="/" className="text-xs text-neutral-400 hover:text-white transition py-2">
              Home
            </Link>
            <Link
              to="/book"
              className="bg-orange-600 hover:bg-orange-500 text-white text-xs font-bold px-4 py-2 rounded-lg transition"
            >
              Book Inspection
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-6 py-12 space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-extrabold text-white">Latest News & Updates</h1>
          <p className="text-neutral-400 text-sm">Tips, maintenance guides, and company news from CSA Chimney Service.</p>
        </div>

        {loading ? (
          <div className="text-center py-12 text-neutral-500 text-sm">Loading posts...</div>
        ) : error ? (
          <div className="text-center py-12 text-red-400 text-sm">{error}</div>
        ) : posts.length === 0 ? (
          <div className="text-center py-12 text-neutral-500 text-sm">No blog posts available yet.</div>
        ) : (
          <div className="space-y-8">
            {posts.map((post) => (
              <article
                key={post.id}
                className="bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden shadow-xl flex flex-col md:flex-row gap-6 p-6"
              >
                {post.image_url && (
                  <div className="md:w-1/3 h-52 md:h-auto overflow-hidden rounded-xl bg-neutral-950 flex-shrink-0">
                    <img
                      src={post.image_url}
                      alt={post.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <div className="flex-grow flex flex-col justify-between space-y-4">
                  <div>
                    <div className="text-xs text-orange-500 font-semibold mb-1">
                      {new Date(post.created_at).toLocaleDateString(undefined, {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-2">{post.title}</h2>
                    <p className="text-neutral-300 text-sm leading-relaxed whitespace-pre-line">
                      {post.description}
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-neutral-800">
                    <button
                      onClick={() => handleLike(post.id)}
                      className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-neutral-950 border border-neutral-800 text-xs font-semibold text-neutral-200 hover:border-orange-500 hover:text-orange-400 transition"
                    >
                      ❤️ <span>{post.likes}</span> Likes
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}