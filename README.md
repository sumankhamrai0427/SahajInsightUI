# React Router + Tailwind CSS Application

A complete, production-ready React application with Angular-style nested routing using React Router v6+ and Tailwind CSS.

## 🚀 Features

- **React Router v6+** with nested routing (Angular router-outlet pattern)
- **Tailwind CSS** for modern, responsive styling
- **Layout System** with Sidebar and Header
- **Authentication Pages** (Login without layout)
- **Dashboard Pages** (with layout wrapper)
- **Fully Responsive** design for all screen sizes
- **Clean Architecture** with scalable folder structure

## 📁 Folder Structure

```
src/
├── assets/              # Static assets (images, fonts, etc.)
├── components/          # Reusable components
│   ├── Layout/
│   │   ├── Layout.jsx   # Main layout wrapper with Outlet
│   │   ├── Sidebar.jsx  # Responsive sidebar navigation
│   │   └── Header.jsx   # Top header bar
│   └── UI/              # Reusable UI components
├── pages/               # Page components
│   ├── Auth/
│   │   └── Login.jsx    # Login page (no layout)
│   └── Dashboard/
│       └── VendorDashboard.jsx  # Dashboard page (with layout)
├── routes/
│   └── AppRoutes.jsx    # Route configuration
├── hooks/               # Custom React hooks
├── utils/               # Utility functions
├── context/             # React context providers
├── styles/
│   └── index.css        # Tailwind CSS + custom styles
├── main.jsx             # Application entry point
└── App.jsx              # Root component
```

## 🎯 Routing Structure

### Login Page (NO LAYOUT)
```
Root → <Routes> → Login
```
- Full-screen, centered design
- No sidebar or header
- Responsive login form

### Dashboard Pages (WITH LAYOUT)
```
Root → <Routes> → Layout → <Outlet> → VendorDashboard
```
- Sidebar navigation
- Fixed header
- Main content area with nested routes

## 🛠️ Installation

1. **Install dependencies:**
```bash
npm install
```

2. **Start development server:**
```bash
npm run dev
```

3. **Build for production:**
```bash
npm run build
```

## 📦 Dependencies

- **react** (^18.3.1) - UI library
- **react-dom** (^18.3.1) - React DOM renderer
- **react-router-dom** (^6.22.0) - Routing library
- **tailwindcss** (^3.4.1) - Utility-first CSS framework
- **vite** (^5.1.4) - Build tool

## 🎨 Tailwind Configuration

Custom color palette and utilities are configured in `tailwind.config.js`:
- Primary color scheme (blue)
- Custom component classes (btn-primary, input-field, card)
- Responsive breakpoints

## 🧩 Key Components

### Layout.jsx
Main layout wrapper that includes:
- Sidebar (collapsible on mobile)
- Header (fixed top bar)
- `<Outlet />` for nested route rendering

### Sidebar.jsx
Responsive navigation sidebar:
- Desktop: Always visible
- Mobile: Slide-in with backdrop overlay
- Active link highlighting
- User profile section

### Header.jsx
Top navigation bar:
- Mobile menu toggle
- Search bar
- Notifications
- User profile dropdown

### Login.jsx
Full-screen authentication page:
- Email/password form
- Social login options
- Responsive design
- No layout wrapper

### VendorDashboard.jsx
Main dashboard page:
- Statistics cards
- Chart placeholders
- Recent orders table
- Fully responsive grid layout

## 📱 Responsive Design

- **Mobile First**: Optimized for mobile devices
- **Breakpoints**: sm, md, lg, xl (Tailwind defaults)
- **Sidebar**: Collapses to hamburger menu on mobile
- **Grid Layouts**: Responsive columns that stack on mobile

## 🔐 Authentication Flow

1. User visits `/login` (no layout)
2. After successful login, navigate to `/dashboard`
3. Dashboard renders with full layout (sidebar + header)
4. Protected routes can be added with authentication guards

## 🎯 Adding New Routes

### Without Layout (like Login):
```jsx
<Route path="/signup" element={<Signup />} />
```

### With Layout (like Dashboard):
```jsx
<Route path="/" element={<Layout />}>
  <Route path="products" element={<Products />} />
  <Route path="orders" element={<Orders />} />
</Route>
```

## 🎨 Styling Guidelines

- Use Tailwind utility classes
- Custom components in `@layer components`
- Consistent color scheme (primary-*)
- Smooth transitions and hover effects
- Semantic HTML elements

## 📝 Code Quality

- Clean, readable code
- Commented important blocks
- Functional components with hooks
- PropTypes for type checking (optional)
- ESLint configuration (optional)

## 🚀 Production Deployment

1. Build the application:
```bash
npm run build
```

2. Preview production build:
```bash
npm run preview
```

3. Deploy the `dist` folder to your hosting service

## 📄 License

MIT License - feel free to use this template for your projects!

---

**Built with ❤️ using React, React Router, and Tailwind CSS**
