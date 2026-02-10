# 🛡️ SubGuard AI

> AI-powered subscription management platform that saves you money through intelligent analysis and automated negotiations.

[Live Demo](https://subguard-ai.netlify.app) | [DevPost](https://devpost.com/software/subguard-ai)

---

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [Demo vs Production](#demo-vs-production)
- [Architecture](#architecture)
- [API Documentation](#api-documentation)
- [Contributing](#contributing)
- [License](#license)

---

## 🎯 Overview

SubGuard AI is an intelligent subscription management platform that helps users:
- 📊 Track all subscriptions in one place
- 🤖 Get AI-powered optimization recommendations
- 💰 Negotiate better rates automatically
- 📈 Visualize spending patterns
- 🔔 Receive proactive alerts

Built for the [Hackathon Name] with Google Gemini AI integration.

---

## ✨ Features

### Core Features
- ✅ **Subscription Tracking** - Manage all your subscriptions in one dashboard
- ✅ **AI Analysis** - Gemini-powered recommendations for each subscription
- ✅ **Smart Recommendations** - Cancel, downgrade, switch, or negotiate suggestions
- ✅ **AI Negotiations** - Automated chat-based negotiation with providers
- ✅ **Monthly Reports** - Comprehensive spending analysis and insights
- ✅ **Activity Log** - Track all actions and changes
- ✅ **Real-time Notifications** - Stay informed about opportunities

### Demo Features (Hackathon)
- 🔄 **Email Connection** - Mock OAuth flow (simulated)
- 📧 **Email Parsing** - UI demonstration only
- 🤝 **Provider Negotiation** - Simulated responses (production uses real APIs)

---

## 🛠️ Tech Stack

### Frontend
- **Next.js 14** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling
- **Lucide Icons** - Beautiful icon set
- **Axios** - HTTP client

### Backend
- **FastAPI** - Modern Python web framework
- **SQLAlchemy** - ORM for database operations
- **SQLite** - Database (demo) / PostgreSQL (production)
- **Google Gemini AI** - AI-powered analysis and negotiations
- **JWT** - Authentication

### Infrastructure
- **Docker** - Containerization (optional)
- **Netlify** - Frontend hosting
- **Railway/Render** - Backend hosting (production)

---

## 🚀 Getting Started

### Prerequisites
```bash
- Node.js 18+
- Python 3.12+
- npm or yarn
```

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/subguard-ai.git
cd subguard-ai
```

2. **Backend Setup**
```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt

# Create .env file
cp .env.example .env
# Add your GEMINI_API_KEY

# Run backend
uvicorn app.main:app --reload
```

3. **Frontend Setup**
```bash
cd frontend
npm install

# Create .env.local
echo "NEXT_PUBLIC_API_URL=http://localhost:8000" > .env.local

# Run frontend
npm run dev
```

4. **Access the app**
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000/docs

---

## 🎭 Demo vs Production

### Demo (Current - Hackathon)
| Feature | Implementation |
|---------|---------------|
| Authentication | Mock login (bypassed) |
| Email Connection | Simulated OAuth flow |
| Email Parsing | UI demonstration only |
| Provider Negotiation | AI simulates provider responses |
| Database | SQLite |
| File Storage | Local filesystem |

### Production (Roadmap)
| Feature | Implementation |
|---------|---------------|
| Authentication | OAuth 2.0 (Google, Microsoft) |
| Email Connection | Real Gmail/Outlook API integration |
| Email Parsing | NLP-based invoice detection |
| Provider Negotiation | Real API integrations with providers |
| Database | PostgreSQL (Supabase) |
| File Storage | AWS S3 / Cloudflare R2 |
| Monitoring | Sentry, DataDog |
| Payments | Stripe integration |

---

## 🏗️ Architecture
```
┌─────────────┐      ┌──────────────┐      ┌─────────────┐
│   Next.js   │─────▶│   FastAPI    │─────▶│  SQLite DB  │
│  Frontend   │      │   Backend    │      │             │
└─────────────┘      └──────────────┘      └─────────────┘
                            │
                            ▼
                     ┌──────────────┐
                     │  Gemini AI   │
                     │   (Google)   │
                     └──────────────┘
```

### Key Components

**Frontend (`/frontend`)**
- `/app` - Next.js App Router pages
- `/components` - Reusable React components
- `/lib` - Utilities and API clients

**Backend (`/backend`)**
- `/app/api/endpoints` - API routes
- `/app/services` - Business logic
- `/app/models` - Database models
- `/app/core` - Configuration and auth

---

## 📚 API Documentation

### Authentication
```bash
POST /api/auth/token
POST /api/auth/register
GET /api/auth/me
```

### Subscriptions
```bash
GET /api/subscriptions/
POST /api/subscriptions/
PUT /api/subscriptions/{id}
DELETE /api/subscriptions/{id}
POST /api/subscriptions/{id}/analyze
```

### Optimizations
```bash
GET /api/optimizations/
POST /api/optimizations/{id}/execute
GET /api/optimizations/dashboard/summary
```

### Negotiations
```bash
GET /api/negotiations/
POST /api/negotiations/{id}/message
POST /api/negotiations/{id}/accept
POST /api/negotiations/{id}/reject
```

### Reports
```bash
GET /api/reports/monthly?month=2&year=2026
```

Full API docs: [http://localhost:8000/docs](http://localhost:8000/docs)

---

## 🤝 Contributing

Contributions welcome! Please read our [Contributing Guide](CONTRIBUTING.md).

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- Google Gemini AI for powering our intelligent features
- [Hackathon Name] for the opportunity
- Open source community for amazing tools

---

## 📧 Contact

**Team SubGuard**
- Email: contact@subguard.ai
- Twitter: [@subguardai](https://twitter.com/subguardai)

---

Built with ❤️ for [Hackathon Name] 2026
