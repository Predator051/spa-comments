# 🧩 Laravel + React Cascade Comments App

A modern full-stack web application supporting **cascade (nested) comments** built on top of:

* ⚙️ **Laravel 12.x** (PHP 8.4)
* 🎨 **React (TypeScript)** using Vite
* 🐳 Docker-powered local development

## 📦 Tech Stack

### Backend

* **Laravel 12** – elegant PHP framework.
* **Inertia.js** – connects Laravel backend with React frontend without traditional APIs.
* **Laravel Reverb** – WebSocket broadcasting.
* **Predis** – Redis client for Laravel queue/events broadcasting.
* **Ziggy** – exposes Laravel routes to JavaScript.

### Frontend

* **React 19** – component-based UI.
* **TypeScript** – type-safe JavaScript.
* **Tailwind CSS 4** – utility-first styling.
* **Framer Motion** – for animations.
* **Radix UI** – unstyled accessible UI primitives.
* **Lucide Icons** – consistent icon set.
* **Zustand** – lightweight state management.
* **Vite** – fast dev server + build tool.

### Dev & Tooling

* **ESLint + Prettier** – code quality & formatting.
* **Pint** – Laravel PHP code formatter.
* **Docker Compose** – full-stack orchestration.
* **Concurrently** – for running parallel dev services.

---

## 🚀 Getting Started

### 1. Clone and Prepare Environment

```bash
git clone <your-repo-url>
cp .env.example .env
```

### 2. Build and Start Containers

```bash
docker-compose build
docker-compose up -d
```

### 3. Install dependencies

```bash
docker exec -it laravel_app composer install
docker exec -it laravel_node npm i
```

### 4. Run Laravel Migrations

```bash
docker exec -it laravel_app php artisan migrate
```

### 5. Build Frontend Assets

```bash
docker exec -it laravel_node sh -c "cd /var/www && npm run build"
```

### 6. Set permissions (if you see error with permissions)

```bash
chown -R www-data:www-data storage bootstrap/cache
chmod -R 775 storage bootstrap/cache
```

### 7. Create symbol link

```bash
docker exec -it laravel_app php artisan storage:link
```

### 8. Remove hot file

```bash
rm public/hot
```

### 8. In browser enter to

```bash
http://localhost:8001
```

---

## 🎯 Functional Overview

### 1. Comment Submission Form

* **Fields:**

    * `User Name` – required; only Latin letters/numbers; validated both client- and server-side.
    * `E-mail` – required; must be valid email format.
    * `Home Page` – optional; must be a valid URL if present.
    * `CAPTCHA` – required; either Google reCAPTCHA or custom text CAPTCHA (Latin letters/numbers).
    * `Text` – required; allows tags: `<a></a>`, `<code></code>`, `<i></i>`, `<strong></strong>`; all others are escaped; output is valid XHTML.

### 2. Main Page

* Displays **cascade (nested) comments**, unlimited depth.
* Top-level comments shown in a table with:

    * Sorting by: `User Name`, `E-mail`, `Date` (asc/desc)
    * Pagination: 25 comments/page
* Styled with **Tailwind CSS**, responsive layout encouraged.

### 3. File Uploads

* Supports image upload: JPG, PNG, GIF (max 320×240px; auto resize with aspect ratio)
* Supports text files: `.txt` up to 100KB

### 4. JavaScript and AJAX

* Client-side + server-side validation.
* Toolbar for formatting: `[i]`, `[strong]`, `[code]`, `[a]`
* Smooth animations for dynamic actions (e.g., comment appearance)

---

## 🧱 Dockerized Services

| Service          | Description                   |
| ---------------- | ----------------------------- |
| `laravel_app`    | Laravel app with PHP 8.4      |
| `laravel_reverb` | WebSockets via Laravel Reverb |
| `laravel_nginx`  | Web server proxy (port 80)    |
| `laravel_mysql`  | MySQL 8.0 DB                  |
| `laravel_redis`  | Redis event broadcasting      |
| `laravel_node`   | Vite + Node frontend build    |

---

## 📁 Project Structure Highlights

* `/resources/js/` – React front-end source
* `/app/` – Laravel application logic
* `/routes/web.php` – Laravel routes
* `/docker/` – environment configs for PHP, Nginx, etc.

---

## 📚 Dependency Breakdown

### Laravel Composer Packages

* `laravel/framework` – core Laravel package.
* `inertiajs/inertia-laravel` – glue for Laravel + React (SPA).
* `laravel/reverb` – native WebSocket server for Laravel.
* `tightenco/ziggy` – share Laravel routes to JS.
* `predis/predis` – Redis driver for broadcasting & queues.
* `laravel/pint` – opinionated PHP code styling.
* `nunomaduro/collision` – better CLI error display.

### Node.js Frontend Packages

* `@inertiajs/react` – React Inertia adapter.
* `@radix-ui/*` – accessible UI building blocks.
* `tailwindcss` + `tailwindcss-animate` – styling.
* `lucide-react` – modern SVG icons.
* `zustand` – simple state management.
* `vite` – frontend dev + bundler.
* `eslint`, `prettier`, `typescript` – tooling & DX.

---

## 🧪 Testing & Dev Utilities

* `yarn dev` – start Vite dev server
* `yarn build` – production frontend build
* `docker exec -it laravel_app php artisan test` – run Laravel test suite inside Docker container
* `composer test` – same as above
* `composer dev` – run Laravel server, queue, logs, Vite in parallel

> ✅ Currently, tests only cover the route responsible for **creating a comment**.

---

## 📌 Notes

* `.env` must be configured for database, Redis, Reverb, etc.
* Ensure ports like `5173` (Vite), `6379` (Redis), `3306` (MySQL), etc., are available.
* Laravel Reverb uses `.env` Reverb-specific vars.

---

## 📃 License

[MIT](LICENSE)

---
