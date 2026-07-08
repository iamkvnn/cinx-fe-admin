# Cinx - System Administration Panel (FE Admin)

The **Cinx FE Admin** project is the Admin Dashboard for the **Cinx** e-learning platform. It is built using **React 19**, **Vite 8**, **TypeScript**, and the modern **Tailwind CSS v4** styling framework.

---

## 🚀 Tech Stack

*   **Core**: React 19 (supporting the latest Concurrent Features & Hooks), TypeScript (Type safety).
*   **Build Tool**: Vite 8 (Ultra-fast Hot Module Replacement).
*   **Styling**: Tailwind CSS v4 (using the `@tailwindcss/vite` plugin for direct compilation), Shadcn UI, Base UI, Lucide Icons.
*   **State Management**: Zustand (lightweight and fast global state management).
*   **Data Fetching**: TanStack React Query v5 (server state management, caching, and automatic synchronization).
*   **Form & Validation**: React Hook Form combined with Zod (ensuring type safety for input validation).
*   **HTTP Client**: Axios (configured with Interceptors for automatic token refresh and attaching Authorization headers).
*   **Realtime**: `@stomp/stompjs` (WebSocket/STOMP connection for real-time notifications).
*   **Charts**: Recharts (interactive statistics and revenue/user charts on the Dashboard).

---

## 📁 Project Directory Structure

```text
src/
├── app/               # Main application configuration (App, Providers, Router)
│   ├── App.tsx
│   ├── providers.tsx  # Wraps React Query, Themes, etc.
│   └── router.tsx     # App routing using React Router v7
├── assets/            # Static assets (images, fonts, etc.)
├── components/        # Shared UI Components across the system
│   ├── common/        # System components (e.g., ProtectedRoute)
│   ├── shared/        # Shared components between pages
│   └── ui/            # Basic UI components from Shadcn (Button, Dialog, Table, etc.)
├── config/            # Environment variable configuration
├── features/          # Core feature modules (Feature-based structure)
│   ├── auth/          # Authentication, forgot password, OAuth2
│   ├── categories/    # Course category management
│   ├── courses/       # Course approval and course list management
│   ├── dashboard/     # Overview dashboard with revenue/user statistics and charts
│   ├── instructors/   # Instructor approval requests and management
│   ├── notifications/ # Notification management and real-time alerts
│   ├── policies/      # Terms and policy management
│   ├── reports/       # User reports and abuse/ticket handling
│   ├── users/         # Student/user management and Admin profile
│   └── vouchers/      # Discount/coupon management
├── hooks/             # Global custom React hooks
├── layouts/           # Page layouts (AdminLayout, AuthLayout)
├── lib/               # Third-party library configurations (Axios client, QueryClient)
├── services/          # Automatically generated API services from Swagger
├── styles/            # Global styles and CSS configurations
├── types/             # TypeScript types (both auto-generated and manual)
└── utils/             # Helper utility functions
```

---

## 🔄 Automatic API Client Generation (Codegen)

This project integrates the `@iamkvnn/swagger-ts-codegen` tool to automatically generate API client functions (services) and type definitions (types) from the backend Swagger/OpenAPI documentation.

Detailed configuration can be found in [codegen.config.json](file:///d:/University/Third/TLCN/cinx-fe-admin/codegen.config.json).

### How to synchronize/regenerate API code:
Whenever backend APIs change, run the following command to update client code:

```bash
pnpm swagger-generate
```

This command scans the Swagger documents defined at:
*   Auth: `https://api.shiny.id.vn/v3/api-docs/auth`
*   User: `https://api.shiny.id.vn/v3/api-docs/user`
*   Course: `https://api.shiny.id.vn/v3/api-docs/course`
*   Learning: `https://api.shiny.id.vn/v3/api-docs/learning`
*   Enrollment: `https://api.shiny.id.vn/v3/api-docs/enrollment`
*   Notification: `https://api.shiny.id.vn/v3/api-docs/notification`
*   Social: `https://api.shiny.id.vn/v3/api-docs/social`

Then it generates matching clients and interfaces inside `src/services` and `src/types`.

---

## 🛠️ Installation & Local Development

### 1. Prerequisites
*   **Node.js**: Version `>= 20.x`
*   **Package Manager**: `pnpm` (Recommended)

### 2. Dependency Installation
Run the following command in the root directory to install all dependencies:
```bash
pnpm install
```

### 3. Environment Variable Configuration
Create or edit the `.env` file in the root directory:
```env
# Backend API URL (defaults to https://api.shiny.id.vn if empty)
VITE_API_URL=https://api.shiny.id.vn

# Google OAuth Client ID for logging in via Google accounts
VITE_GOOGLE_CLIENT_ID=

# Docker Settings
DOCKERHUB_USERNAME=
HOST_PORT=5173
```

### 4. Run the Project in Development Mode
```bash
pnpm dev
```
The application will run at: `http://localhost:5173`.

### 5. Build for Production
```bash
pnpm build
```
The production bundle will be generated in the `dist/` directory.

---

## 🐳 Docker Deployment

The project is preconfigured with a `Dockerfile` and `docker-compose.yml` for easy deployment.

### Run using Docker Compose:
```bash
docker compose up -d --build
```
The application will be compiled and served via Nginx inside the container, accessible on the port configured in `HOST_PORT` in `.env` (defaults to port `5173`).


