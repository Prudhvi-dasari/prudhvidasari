// ================================================
// firebase-blog.js — Shared Blog & Visitor Backend
// Included by: index.html, blog.html, blog-post.html, admin.html
// ================================================

(function () {
  // --- Dynamic Firebase SDK loader ---
  function loadFirebase(callback) {
    if (!window.FIREBASE_ENABLED || !window.FIREBASE_CONFIG) { callback(false); return; }
    if (window.firebase) { callback(true); return; }
    const scripts = [
      'https://www.gstatic.com/firebasejs/9.22.2/firebase-app-compat.js',
      'https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore-compat.js'
    ];
    let loaded = 0;
    scripts.forEach(src => {
      const s = document.createElement('script');
      s.src = src;
      s.onload = () => { if (++loaded === scripts.length) { firebase.initializeApp(window.FIREBASE_CONFIG); callback(true); } };
      s.onerror = () => callback(false);
      document.head.appendChild(s);
    });
  }

  // --- Local helpers ---
  function getLocal() {
    try {
      const s = localStorage.getItem('prudhvi_blogs');
      if (s) return JSON.parse(s);
      const seed = window.BLOGS_SEED || [];
      localStorage.setItem('prudhvi_blogs', JSON.stringify(seed));
      return seed;
    } catch (e) { return []; }
  }
  function setLocal(posts) {
    localStorage.setItem('prudhvi_blogs', JSON.stringify(posts));
  }
  function mergeToLocal(firebasePosts) {
    // Firebase is source of truth when enabled
    setLocal(firebasePosts);
    return firebasePosts;
  }

  // ================================================
  // BlogDB — public API used by all pages
  // ================================================
  window.BlogDB = {
    // Get all posts (Firebase first, localStorage fallback)
    getAll: function (callback) {
      const local = getLocal();
      callback(local, false); // Show local immediately (fast)
      loadFirebase(function (ok) {
        if (!ok) return;
        firebase.firestore().collection('blogs')
          .orderBy('dateISO', 'desc').get()
          .then(function (snap) {
            const posts = snap.docs.map(function (d) { return Object.assign({ id: d.id }, d.data()); });
            mergeToLocal(posts);
            callback(posts, true); // Update with fresh data
          })
          .catch(function () { /* stay with local */ });
      });
    },

    // Get single post by ID
    getOne: function (id, callback) {
      const local = getLocal().find(function (p) { return p.id === id; });
      callback(local || null, false);
      loadFirebase(function (ok) {
        if (!ok) return;
        firebase.firestore().collection('blogs').doc(id).get()
          .then(function (doc) {
            if (doc.exists) {
              const post = Object.assign({ id: doc.id }, doc.data());
              callback(post, true);
            }
          }).catch(function () {});
      });
    },

    // Save (create or update) a post
    save: function (post, callback) {
      // Always save to localStorage first
      const posts = getLocal();
      const idx = posts.findIndex(function (p) { return p.id === post.id; });
      if (idx > -1) posts[idx] = post; else posts.push(post);
      setLocal(posts);
      callback && callback(true, 'local');

      // Then sync to Firebase
      loadFirebase(function (ok) {
        if (!ok) return;
        firebase.firestore().collection('blogs').doc(post.id).set(post)
          .then(function () { callback && callback(true, 'firebase'); })
          .catch(function (e) { console.warn('Firebase save failed:', e); });
      });
    },

    // Delete a post
    delete: function (id, callback) {
      setLocal(getLocal().filter(function (p) { return p.id !== id; }));
      callback && callback(true, 'local');
      loadFirebase(function (ok) {
        if (!ok) return;
        firebase.firestore().collection('blogs').doc(id).delete()
          .then(function () { callback && callback(true, 'firebase'); })
          .catch(function (e) { console.warn('Firebase delete failed:', e); });
      });
    }
  };

  // ================================================
  // VisitorDB — Live visitor counter via CounterAPI
  // Free service, no API key needed
  // ================================================
  const COUNTER_NS  = 'prudhvi-growinnerself';
  const COUNTER_KEY = 'site-visitors';
  const BASE = 'https://api.counterapi.dev/v1/' + COUNTER_NS + '/' + COUNTER_KEY;

  window.VisitorDB = {
    // Increment on page load and return count
    increment: function (callback) {
      fetch(BASE + '/up')
        .then(function (r) { return r.json(); })
        .then(function (d) { callback(d.count || 0); })
        .catch(function () { callback(null); });
    },
    // Just get current count (no increment)
    get: function (callback) {
      fetch(BASE)
        .then(function (r) { return r.json(); })
        .then(function (d) { callback(d.count || 0); })
        .catch(function () { callback(null); });
    }
  };
})();
