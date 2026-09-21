# brain-international-preparatory--school
School Management System
# 🎓 Brain International School — Management System

> **Educate. Inspire. Transform.**
>
> Where Learning Becomes a Journey to Greatness.

A full-stack **School Management System** for Brain International School, Amasaman, Greater Accra, Ghana. Built entirely in **JavaScript** — Node.js backend, Express server, EJS templates, Prisma ORM, and MySQL database.

![Status](https://img.shields.io/badge/status-in%20development-yellow)
![Node](https://img.shields.io/badge/node-%3E%3D20.x-green)
![Made with](https://img.shields.io/badge/made%20with-JavaScript-yellow)
![Database](https://img.shields.io/badge/database-MySQL-blue)

---

## 📖 About

Brain International School (BIS) is a private basic school at Amasaman, near the Police Station, Greater Accra, Ghana. The school runs from **Nursery** through **Junior High School (JHS 3)**.

This project is a centralized web platform combining:

- 🌐 **Public website** for parents and visitors
- 🔐 **Private portals** for Admins, Teachers, Parents, and Students
- 💰 **Fee tracking** with offline payment recording and receipt generation
- 📊 **Attendance, results, and report cards**
- 📰 **Content management** for news, events, and gallery

One source of truth for student, academic, and financial records.

---

## 🎯 Vision

A single digital school office where:
- The public website informs prospective families
- Admissions captures applicants
- Administration controls school operations
- Teachers manage academics and attendance
- Students access their academic information
- Parents monitor their children's progress and fee balances
- Authorized staff record physical payments
- Management receives reports
- Security controls protect school and student information

---

## 🏗️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Runtime | Node.js 20+ |
| Backend | Express 4 |
| Templating | EJS |
| Database | MySQL 8 |
| ORM | Prisma |
| Auth | express-session + bcryptjs |
| PDF | PDFKit *(planned)* |
| Styling | Tailwind CSS |

---

## 🗂️ Project Structure

```
bis-system/
├── prisma/
│   ├── schema.prisma
│   └── migrations/
├── routes/
│   └── public.js
├── controllers/
├── middleware/
├── lib/
│   └── prisma.js
├── views/
│   ├── layouts/
│   │   └── main.ejs
│   └── pages/
│       ├── home.ejs
│       ├── about.ejs
│       ├── academics.ejs
│       ├── admissions.ejs
│       ├── contact.ejs
│       └── 404.ejs
├── public/
│   ├── css/
│   ├── js/
│   └── images/
├── .env
├── .env.example
├── .gitignore
├── package.json
├── server.js
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js 20+
- npm 10+
- MySQL 8+
- Git

### Install

```bash
git clone https://github.com/YOUR_USERNAME/bis-system.git
cd bis-system
npm install
```

### Database

```bash
mysql -u root -p
```

```sql
CREATE DATABASE bis_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'bis_user'@'localhost' IDENTIFIED BY 'your_password_here';
GRANT ALL PRIVILEGES ON bis_db.* TO 'bis_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

### Environment

```bash
cp .env.example .env
```

Edit `.env`:

```env
NODE_ENV=development
PORT=3000
APP_NAME="Brain International School"
APP_URL=http://localhost:3000

DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=bis_db
DB_USERNAME=bis_user
DB_PASSWORD=your_password_here

DATABASE_URL="mysql://bis_user:your_password_here@127.0.0.1:3306/bis_db"

SESSION_SECRET=generate_a_long_random_string
JWT_SECRET=generate_another_long_random_string
```

### Migrate & Run

```bash
npx prisma migrate dev
npm run dev
```

Open **http://localhost:3000**

---

## 🧪 Scripts

| Command | Purpose |
|---------|---------|
| `npm start` | Run production server |
| `npm run dev` | Run with auto-reload (nodemon) |
| `npx prisma studio` | Visual database editor |
| `npx prisma migrate dev` | Create and apply migration |
| `npx prisma migrate deploy` | Apply migrations (production) |

---

## 👥 User Roles

| Role | Access |
|------|--------|
| **Super Admin** | Full control of the entire system |
| **Admin** | School operations, students, fees, results |
| **Teacher** | Attendance, scores, assigned classes |
| **Parent** | Their children's data and fees |
| **Student** | Their own academic records |

### Permission Matrix

| Feature | Super Admin | Admin | Teacher | Parent | Student |
|---------|:-----------:|:-----:|:-------:|:------:|:-------:|
| Students | Full | Manage | View | Own child | Own |
| Teachers | Full | Manage | Own profile | — | — |
| Attendance | Full | View/Edit | Manage | View child | View own |
| Results | Full | Manage | Enter | View child | View own |
| Fees | Full | Manage | — | View | View |
| Payments | Full | Record | — | View | View |
| Announcements | Full | Manage | Class | View | View |
| Settings | Full | Limited | — | — | — |
| Audit Logs | Full | Authorized | — | — | — |

---

## 🎨 Design System

### Colors

| Purpose | Hex |
|---------|-----|
| Primary — Deep Navy | `#0B1F3A` |
| Navy Light | `#16345F` |
| Secondary — Metallic Gold | `#C9A227` |
| Gold Light | `#E4C158` |
| Background | `#F5F7FA` |
| Success | `#16A34A` |
| Warning | `#F59E0B` |
| Danger | `#DC2626` |

### Typography

- **Body:** Inter (400, 500, 600, 700)
- **Display:** Playfair Display (700) for hero headings
- **Base size:** 16px

### Reusable Classes

`.btn-primary` `.btn-gold` `.btn-outline` `.btn-danger`
`.card` `.card-header` `.card-body`
`.form-input` `.form-label` `.form-error`
`.badge-success` `.badge-warn` `.badge-danger` `.badge-info`
`.alert-success` `.alert-error`

---

## 📋 Roadmap

### ✅ Phase 0 — Foundation

- [x] Public website (Home, About, Academics, Admissions, Contact)
- [x] Node.js + Express server
- [x] EJS templating with layout inheritance
- [x] Prisma ORM with MySQL
- [x] Environment configuration
- [x] Responsive design with Tailwind

### 🚧 Phase 1 — MVP

- [ ] User authentication (login/logout)
- [ ] Role-based access control
- [ ] Admin dashboard
- [ ] Student management (CRUD)
- [ ] Teacher management (CRUD)
- [ ] Parent management (CRUD)
- [ ] Classes, subjects, academic years, terms
- [ ] Attendance module
- [ ] Examinations and results
- [ ] Report cards (PDF)
- [ ] Fees and offline payments
- [ ] Receipts (PDF)
- [ ] Announcements
- [ ] Basic reports
- [ ] Audit logs

### 🔮 Phase 2 — Enhancement

- [ ] Assignments
- [ ] Document management
- [ ] Library management
- [ ] Inventory and assets
- [ ] Staff management
- [ ] Email notifications
- [ ] SMS integration
- [ ] Parent-teacher messaging
- [ ] Advanced CMS

### 🚀 Phase 3 — Optional

- [ ] Mobile application
- [ ] QR-based attendance
- [ ] Advanced analytics
- [ ] Digital ID cards
- [ ] Transport management

### 🚫 Explicitly Excluded

- ❌ Online fee payment processing (school collects offline only)
- ❌ Biometric hardware integration (initial phase)
- ❌ Full payroll system
- ❌ Unnecessary AI features

---

## 🔒 Security

- Password hashing with bcryptjs
- Session-based authentication with secure cookies
- XSS prevention via EJS auto-escaping
- SQL injection prevention via Prisma parameterized queries
- Role-based authorization on every protected route
- HTTPS/SSL in production
- Input validation on all forms
- Audit logging of all administrative actions

### Data Privacy

- Student records never publicly searchable
- Academic, attendance, and fee data restricted to authorized users
- Least-privilege permissions for all roles
- Sensitive documents require explicit access grants

---

## 💾 Backup

| Frequency | What | Where |
|-----------|------|-------|
| Daily | Full database dump | Offsite (separate server) |
| Weekly | Archive | Cloud storage |
| Monthly | Long-term archive | Cold storage |

- Backups stored separately from production
- Recovery procedures tested quarterly
- Configuration and uploaded documents included

---

## 📝 Conventions

### Code Style

- 2-space indentation
- Single quotes in JavaScript
- `async/await` over callbacks
- `const` by default
- Descriptive names
- Comments explain *why*, not *what*

### Git Commits

```
feat: add student CRUD
fix: correct fee balance calculation
docs: update README
refactor: extract payment service
chore: update dependencies
```

### Branches

- `main` — production-ready
- `develop` — active development
- `feature/*` — features
- `fix/*` — bug fixes

---

## 🧑‍💻 Workflow

Every working session:

```bash
git pull
npm install
npm run dev
```

When done:

```bash
git add .
git commit -m "feat: description"
git push
```

---

## 🚢 Deployment

### Production Checklist

- [ ] `NODE_ENV=production`
- [ ] Strong `SESSION_SECRET` and `JWT_SECRET`
- [ ] Strong database password
- [ ] HTTPS via Let's Encrypt
- [ ] Nginx reverse proxy
- [ ] PM2 process manager
- [ ] Daily database backups
- [ ] UFW firewall
- [ ] UptimeRobot monitoring

### Nginx Config

```nginx
server {
    listen 80;
    server_name braininternationalschool.edu.gh www.braininternationalschool.edu.gh;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

---

## 📊 Status

| Module | Progress |
|--------|----------|
| Public website | ✅ 100% |
| Authentication | 🚧 0% |
| Student management | 🚧 0% |
| Fees & payments | 🚧 0% |
| Attendance | 🚧 0% |
| Results & report cards | 🚧 0% |
| Portals | 🚧 0% |
| Deployment | 🚧 0% |

**Overall:** ~15% complete — foundation established.

---

## 📞 Contact

**Developer**
- Name: *[Your name]*
- Email: *[Your email]*
- GitHub: *[Your GitHub profile]*

**School**
- Brain International School
- Amasaman, near Police Station, Greater Accra, Ghana
- Phone: +233 XX XXX XXXX
- Email: info@braininternationalschool.edu.gh

---

## 📜 License

**Private and proprietary.**

© 2026 Brain International School. All rights reserved.

---

## 🙏 Acknowledgment

Built with ❤️ for the students, staff, and families of Brain International School.

> *"Every child who walks through our gates carries a spark of greatness. Our job is to ignite it."*
>
> — The BIS Family

---

**Where Learning Becomes a Journey to Greatness.**
