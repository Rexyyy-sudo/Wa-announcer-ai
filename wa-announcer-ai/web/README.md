# 📱 Web Dashboard - React Starter

Ini adalah basic template untuk web dashboard. Gunakan React + Vite.

## Struktur Folder Dashboard

```
web/
├── index.html
├── package.json
├── vite.config.js
├── src/
│   ├── main.jsx
│   ├── App.jsx
│   ├── components/
│   │   ├── Layout.jsx
│   │   ├── Navbar.jsx
│   │   ├── Sidebar.jsx
│   │   └── ...
│   ├── pages/
│   │   ├── Login.jsx
│   │   ├── Dashboard.jsx
│   │   ├── Announcements.jsx
│   │   ├── Templates.jsx
│   │   ├── Settings.jsx
│   │   └── ...
│   ├── api/
│   │   └── client.js
│   ├── utils/
│   │   └── auth.js
│   ├── styles/
│   │   └── main.css
│   └── hooks/
│       └── useAuth.js
└── public/
    └── favicon.svg
```

## Setup React Dashboard

```bash
cd web

# Create Vite project
npm create vite@latest . -- --template react

# Install dependencies
npm install
npm install axios react-router-dom zustand

# Start dev server
npm run dev
```

## Quick Start Template

### 1. API Client (src/api/client.js)

```javascript
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const client = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000
});

// Interceptor untuk JWT token
client.interceptors.request.use(
  config => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  error => Promise.reject(error)
);

export default client;
```

### 2. Auth Hook (src/hooks/useAuth.js)

```javascript
import { useState } from 'react';
import client from '../api/client';

export function useAuth() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const login = async (email, password) => {
    setLoading(true);
    setError(null);
    try {
      const response = await client.post('/auth/login', { email, password });
      localStorage.setItem('token', response.data.token);
      setUser(response.data.user);
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  return { user, login, logout, loading, error };
}
```

### 3. Main Page Components

**src/pages/Login.jsx**
```jsx
import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, loading, error } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await login(email, password);
      window.location.href = '/dashboard';
    } catch (err) {
      // Error handled in hook
    }
  };

  return (
    <div className="login-container">
      <h1>🔐 WhatsApp Announcer Login</h1>
      {error && <div className="error">{error}</div>}
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit" disabled={loading}>
          {loading ? 'Logging in...' : 'Login'}
        </button>
      </form>
    </div>
  );
}
```

**src/pages/Dashboard.jsx**
```jsx
import { useEffect, useState } from 'react';
import client from '../api/client';

export default function Dashboard() {
  const [announcements, setAnnouncements] = useState([]);
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [annResp, groupsResp] = await Promise.all([
          client.get('/announcements'),
          client.get('/bot/groups')
        ]);
        setAnnouncements(annResp.data.announcements);
        setGroups(groupsResp.data.groups);
      } catch (error) {
        console.error('Error loading data', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <div className="dashboard">
      <h1>📊 Dashboard</h1>
      
      <div className="stats">
        <div className="stat-card">
          <h3>{announcements.length}</h3>
          <p>Total Announcements</p>
        </div>
        <div className="stat-card">
          <h3>{groups.length}</h3>
          <p>Groups</p>
        </div>
      </div>

      <h2>📝 Recent Announcements</h2>
      <div className="list">
        {announcements.slice(0, 5).map(ann => (
          <div key={ann.id} className="item">
            <p>{ann.original_input}</p>
            <small>{new Date(ann.created_at).toLocaleDateString()}</small>
          </div>
        ))}
      </div>
    </div>
  );
}
```

## Styling (src/styles/main.css)

```css
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen,
    Ubuntu, Cantarell, sans-serif;
  background: #f5f5f5;
  color: #333;
}

.login-container {
  max-width: 400px;
  margin: 100px auto;
  padding: 40px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.login-container h1 {
  margin-bottom: 20px;
  color: #075e54;
}

form input {
  width: 100%;
  padding: 12px;
  margin-bottom: 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
}

form button {
  width: 100%;
  padding: 12px;
  background: #075e54;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: bold;
}

form button:hover {
  background: #054a41;
}

.dashboard {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin: 20px 0;
}

.stat-card {
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  text-align: center;
}

.stat-card h3 {
  font-size: 32px;
  color: #075e54;
  margin-bottom: 10px;
}

.list {
  background: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.item {
  padding: 15px;
  border-bottom: 1px solid #eee;
}

.item:last-child {
  border-bottom: none;
}

.item p {
  margin-bottom: 8px;
}

.item small {
  color: #999;
}

.error {
  background: #fee;
  color: #c33;
  padding: 12px;
  border-radius: 4px;
  margin-bottom: 12px;
}
```

## Environment Setup (.env)

```
VITE_API_URL=http://localhost:3000/api
VITE_APP_NAME=WhatsApp Announcer
```

## Run Dashboard

```bash
npm run dev
# Dashboard akan jalan di http://localhost:5173
```

---

## Full Dashboard Features To-Do

- [ ] Complete login/register flow
- [ ] Announcement creator with AI preview
- [ ] Template management CRUD
- [ ] Group/Contact selector
- [ ] Send announcements
- [ ] Broadcast management
- [ ] Analytics & charts
- [ ] User settings
- [ ] API key management
- [ ] Dark mode toggle
- [ ] Responsive design
- [ ] Error handling
- [ ] Loading states
- [ ] Toast notifications

---

**Note**: Ini hanya starter template. Develop sesuai kebutuhan Anda!
