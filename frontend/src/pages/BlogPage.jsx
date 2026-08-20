import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, ArrowLeft } from 'lucide-react';
import { API_BASE_URL } from '../config';

export default function BlogPage() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadPosts = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/blog/`);
      if (!response.ok) throw new Error('Unable to load blog posts');
      setPosts(await response.json());
    } catch (loadError) {
      setError(loadError.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPosts();
  }, []);

  const handleLike = async (postId) => {
    const likedPosts = JSON.parse(localStorage.getItem('csa_liked_posts') || '[]');
    if (likedPosts.includes(postId)) return;

    const response = await fetch(`${API_BASE_URL}/api/blog/${postId}/like`, { method: 'POST' });
    if (!response.ok) return;
    const updatedPost = await response.json();
    setPosts((current) => current.map((post) => post.id === postId ? updatedPost : post));
    localStorage.setItem('csa_liked_posts', JSON.stringify([...likedPosts, postId]));
  };

  return (
    <main className="min-h-screen bg-neutral-950 text-white px-6 py-12">
      <div className="max-w-6xl mx-auto">
        <Link to="/" className="inline-flex items-center gap-2 text-neutral-400 hover:text-brand-orange mb-10">
          <ArrowLeft className="w-4 h-4" /> Return home
        </Link>
        <div className="mb-12">
          <p className="text-brand-orange font-bold text-sm uppercase tracking-widest">CSA Chimney Journal</p>
          <h1 className="text-5xl font-extrabold mt-2">Ideas for a safer hearth</h1>
          <p className="text-neutral-400 mt-4 max-w-2xl">Practical chimney care, inspection advice, and updates from CSA Chimney Service.</p>
        </div>

        {loading && <p className="text-neutral-400">Loading posts...</p>}
        {error && <p className="text-red-400">{error}</p>}
        {!loading && !error && posts.length === 0 && <p className="text-neutral-400">New articles will appear here soon.</p>}

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => {
            const likedPosts = JSON.parse(localStorage.getItem('csa_liked_posts') || '[]');
            const hasLiked = likedPosts.includes(post.id);
            return (
              <article key={post.id} className="bg-white text-neutral-900 rounded-2xl overflow-hidden shadow-xl">
                <img src={post.image_url} alt={post.title} className="w-full aspect-[4/3] object-cover" />
                <div className="p-6">
                  <p className="text-xs text-neutral-500 mb-2">{new Date(post.created_at).toLocaleDateString()}</p>
                  <h2 className="text-2xl font-bold mb-3">{post.title}</h2>
                  <p className="text-neutral-600 whitespace-pre-line leading-relaxed">{post.description}</p>
                  <button
                    type="button"
                    onClick={() => handleLike(post.id)}
                    disabled={hasLiked}
                    className={`mt-6 inline-flex items-center gap-2 text-sm font-bold ${hasLiked ? 'text-brand-orange' : 'text-neutral-500 hover:text-brand-orange'}`}
                  >
                    <Heart className={`w-5 h-5 ${hasLiked ? 'fill-current' : ''}`} /> {post.likes} likes
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </main>
  );
}
