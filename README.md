# UCMS MBA 3rd Batch's Student Directory

A production-ready student directory built with React, Node.js, Express, MongoDB, Docker Compose, and persistent local upload storage.

## Features

- Add, edit, view, and delete student profiles.
- Upload a student photo with `multipart/form-data`.
- Store career details, required phone number, optional email, and social links.
- Search by name, roll number, company, or job title.
- Filter by employment status and location.
- Pagination, sorting, delete confirmation, loading states, and error states.
- Login is required to view, add, or edit student profiles.
- Admin users can create users and delete student profiles.
- Highlight currently employed full-time students.
- Persist MongoDB data in `mongo-data`.
- Persist uploaded images in `uploads-data`.

## Folder Structure

```text
student-directory/
  backend/
    src/
      config/
        db.js
      controllers/
        authController.js
        studentController.js
      middleware/
        auth.js
        errorHandler.js
        upload.js
      models/
        Student.js
        User.js
      routes/
        authRoutes.js
        studentRoutes.js
      server.js
    .dockerignore
    .env.example
    Dockerfile
    package.json
  frontend/
    src/
      components/
        Pagination.jsx
        SearchFilters.jsx
        StatusBadge.jsx
        StudentCard.jsx
      pages/
        Login.jsx
        StudentDetail.jsx
        StudentForm.jsx
        StudentList.jsx
        UserManagement.jsx
      services/
        api.js
      utils/
        studentForm.js
      App.jsx
      main.jsx
      styles.css
    .dockerignore
    .env.example
    Dockerfile
    index.html
    package.json
    server.js
  .env.example
  docker-compose.yml
  README.md
```

## API Endpoints

Base URL through your host Nginx proxy:

```text
/api
```

Direct backend URL during local testing:

```text
http://localhost:5000
```

Endpoints:

```text
POST   /students      login required
GET    /students      login required
GET    /students/:id  login required
PUT    /students/:id  login required
DELETE /students/:id  admin required
```

Auth endpoints:

```text
POST /auth/login       public
GET  /auth/users       admin required
POST /auth/users       admin required
```

The first admin account comes from environment variables. After logging in as that admin, use the Users page to create normal users or additional admins.

Supported query parameters:

```text
search=
name=
rollNumber=
company=
jobTitle=
status=
location=
page=
limit=
sortBy=createdAt|name|rollNumber|work.experienceYears|work.company
sortOrder=asc|desc
```

Uploaded images are served from:

```text
/uploads/<filename>
```

## Student Data Model

```text
name                  string, required
rollNumber            string, unique, required
phone                 string, required
email                 string, optional
work.jobTitle         string
work.company          string
work.department       string
work.location         string
work.status           Student | Intern | Full-time | Freelancer
work.experienceYears  number
socialLinks.facebook  string
socialLinks.linkedin  string
socialLinks.github    string
photo                 /uploads/<filename>
createdAt             date
```

## Run With Docker

For the production domain, make sure your DNS `A` record points `ucms.mindgnite.com` to the server public IP.

From this folder in WSL:

```bash
cp .env.example .env
docker compose up --build -d
```

Older Docker Compose installs may use:

```bash
docker-compose up --build
```

Then open:

```text
http://ucms.mindgnite.com
```

The frontend container is a Node static server bound to server localhost on port `4173` by default. The backend is bound to server localhost on port `5000` for direct API testing:

```text
http://localhost:4173
http://localhost:5000
```

Your host Nginx should receive public traffic for `ucms.mindgnite.com` and proxy to these local container ports.

## Environment Variables

Example values are included in `.env.example` and `backend/.env.example`:

```env
MONGO_URI=mongodb://mongo:27017/studentdb
PORT=5000
CORS_ORIGIN=http://ucms.mindgnite.com
UPLOAD_DIR=/uploads
FRONTEND_PORT=4173
ADMIN_USERNAME=admin
ADMIN_PASSWORD=change-this-password
JWT_SECRET=change-this-to-a-long-random-secret
```

Change `ADMIN_PASSWORD` and `JWT_SECRET` before using the app in production.

For local-only Docker testing on the same machine, you can set `FRONTEND_PORT=3000` and `CORS_ORIGIN=http://localhost:3000` in `.env`.

## Upload Persistence

The backend stores uploaded files in `/uploads`. Docker Compose maps that directory to the named volume `uploads-data`, so images remain available after containers restart.

MongoDB stores data in the named volume `mongo-data`, so student records also persist across restarts.

## Notes For Development

The frontend calls `/api/students`. In production, your host Nginx should proxy `/api` to the backend container and `/uploads` to backend static file serving.

For local non-Docker development, run MongoDB locally or update `MONGO_URI`, then start backend and frontend separately with:

```bash
cd backend
npm install
npm run dev

cd frontend
npm install
npm run dev
```

## WSL Deployment Notes

Use these steps when rebuilding from WSL:

```bash
cd /path/to/student-directory
cp .env.example .env
docker compose down
docker compose up --build -d
docker compose ps
```

The Docker frontend service does not bind public port `80`; it binds to server localhost on `FRONTEND_PORT`. Host Nginx should own public ports `80` and `443`.

## Host Nginx Example

Use this on the host machine, not inside the frontend container:

```nginx
server {
  listen 80;
  server_name ucms.mindgnite.com;

  client_max_body_size 6m;

  location /api/ {
    proxy_pass http://127.0.0.1:5000/;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
  }

  location /uploads/ {
    proxy_pass http://127.0.0.1:5000/uploads/;
    proxy_set_header Host $host;
  }

  location / {
    proxy_pass http://127.0.0.1:4173;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
  }
}
```

## Later HTTPS With Let's Encrypt

The app is currently configured for:

```text
http://ucms.mindgnite.com
```

When you switch to HTTPS, update:

```env
CORS_ORIGIN=https://ucms.mindgnite.com
```

Then rebuild the backend so the new origin is loaded:

```bash
docker compose up --build -d backend frontend
```

For Let's Encrypt, keep host Nginx on ports `80` and `443`, terminate HTTPS there, and proxy to this app's frontend container at `http://127.0.0.1:4173`.
