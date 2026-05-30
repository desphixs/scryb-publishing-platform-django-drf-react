# Scryb: Full-Stack Publishing Platform

Scryb is a clean, modern, and high-performance publishing platform built specifically for writers who love Markdown. It provides authors with a clutter-free drafting interface, instant publishing, and fully responsive reading experiences, alongside community interactions like comments, likes, and bookmarks.

This application is designed as an educational project featured on [staqed.com](https://staqed.com), the premier platform where you can learn to build real-world, industry-standard full-stack web applications from scratch.

---

## Technical Stack

The architecture separates the frontend and backend to demonstrate modern production design:

- **Backend:** Python & Django with Django REST Framework (DRF) for hand-crafted RESTful API endpoints.
- **Database:** SQLite for lightweight and robust relational data storage.
- **Frontend:** Next.js (App Router) with TypeScript for highly optimized client-side pages and server-side pre-rendering.
- **Styling & UI:** Tailwind CSS for a modern, responsive, utility-first user interface and Lucide React for consistent iconography.

---

## Core Application Features

- **Authentication System:** Pre-built traditional credential login, social auth integrations (Google and GitHub), and passwordless flow templates.
- **Markdown Writing Engine:** Write articles in Markdown text and view them rendered beautifully as clean HTML on the reading pages.
- **Complete CRUD Controls:** Dedicated author dashboards for drafting, editing, listing, and safely deleting user posts.
- **Nested Social Features:** Relational databases enabling interactive post reactions, including real-time toggle likes, nested post comments, and private user bookmark lists.
- **Theme Integration:** Clean, elegant dark and light mode UI matching premium design standards.

---

## Project Structure

```text
scryb/
├── backend/            # Django REST API (endpoints, post app, models, userauths)
├── frontend/           # Next.js App Router (dashboard, public pages, UI components)
└── docs/               # Detailed study plans and tasks for the building process
```

---

## Getting Started

### 1. Prerequisites

Make sure you have the following installed on your machine:

- Python 3.12+
- Node.js 18+ & npm

### 2. Backend Setup

1. Navigate to the backend folder:
    ```bash
    cd backend
    ```
2. Create and activate a Python virtual environment:
    ```bash
    python -m venv venv
    # On Windows:
    .\venv\Scripts\activate
    # On macOS/Linux:
    source venv/bin/activate
    ```
3. Install the required Python packages:
    ```bash
    pip install -r requirements.txt
    ```
4. Create your local environment file:
    - Copy `.env.template` to `.env`.
    - Configure the default development variables.
5. Run migrations to initialize the database:
    ```bash
    python manage.py migrate
    ```
6. Start the Django development server (default port `8000`):
    ```bash
    python manage.py runserver
    ```

### 3. Frontend Setup

1. Navigate to the frontend folder:
    ```bash
    cd ../frontend
    ```
2. Install the node packages:
    ```bash
    npm install
    ```
3. Create your local environment file:
    - Copy `.env.template` to `.env.local`.
    - Configure the API base URLs to point to your backend.
4. Start the Next.js development server (default port `3000`):
    ```bash
    npm run dev
    ```

Now open your browser and navigate to `http://localhost:3000` to interact with the full application!

---

## Learning Goals on Staqed

While building Scryb on [staqed.com](https://staqed.com), you will master:

1.  **Explicit Data Flow:** Unpacking HTTP requests, manually validating payloads with Django serializers, and returning raw JSON data through custom DRF `APIView`s without relying on magic shortcuts.
2.  **Relational Database Design:** Connecting authors, posts, comments, likes, and bookmarks with appropriate foreign keys and unique constraints in SQLite.
3.  **Modern React Architecture:** Fetching data through clean API layers, synchronizing client and server-side state, and building interactive, beautiful user interfaces with Next.js and Tailwind CSS.

---

_This project is part of the full-stack developer path on [staqed.com](https://staqed.com)._
