# Doctor–Patient Consultation Backend

A REST API for a simple healthcare consultation platform. Patients can register, browse
doctors, start a consultation, exchange chat messages, and doctors can manage the
consultation lifecycle.

## Tech Stack

- Node.js + Express.js
- PostgreSQL with Sequelize ORM
- JWT authentication
- bcrypt for password hashing
- express-validator for request validation

## Project Structure

```
src/
├── controllers/     # Request handlers — parse input, call services, shape response
├── routes/           # Route definitions and middleware wiring
├── services/         # Business logic and DB queries
├── models/            # Sequelize models + associations (index.js)
├── middleware/       # auth, role guard, validation, error handler
├── config/            # env loader, DB connection
├── utils/              # ApiError, catchAsync, JWT helpers, validation rules
└── app.js              # App bootstrap
```

## Setup

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Create a PostgreSQL database**
   ```sql
   CREATE DATABASE consultation_db;
   ```

3. **Configure environment variables**

   Copy `.env.example` to `.env` and fill in your own values:
   ```bash
   cp .env.example .env
   ```
   ```
   DATABASE_URL="postgresql://username:password@localhost:5432/consultation_db?schema=public"
   JWT_SECRET="a_long_random_secret_string"
   JWT_EXPIRES_IN="7d"
   PORT=5000
   ```

4. **Run the server**
   ```bash
   npm start        # production
   npm run dev       # with nodemon, auto-restart
   ```

   On boot, the app connects to Postgres and calls `sequelize.sync()`, which creates
   the `users`, `doctor_profiles`, `consultations`, and `messages` tables automatically
   if they don't already exist. No separate migration step is needed for this assignment's scope.

5. **Verify it's running**
   ```bash
   curl http://localhost:5000/health
   # {"status":"ok"}
   ```

## Database Schema

```mermaid
erDiagram
    USER ||--o| DOCTOR_PROFILE : has_one
    USER ||--o{ CONSULTATION : "as patient"
    USER ||--o{ CONSULTATION : "as doctor"
    CONSULTATION ||--o{ MESSAGE : contains
    USER ||--o{ MESSAGE : sends

    USER {
        int id PK
        string name
        string email UK
        string password
        enum role "PATIENT | DOCTOR"
        timestamp createdAt
    }
    DOCTOR_PROFILE {
        int id PK
        int user_id FK
        string specialization
        int years_of_experience
    }
    CONSULTATION {
        int id PK
        int patient_id FK
        int doctor_id FK
        enum status "PENDING | ACTIVE | COMPLETED"
        timestamp createdAt
        timestamp updatedAt
    }
    MESSAGE {
        int id PK
        int consultation_id FK
        int sender_id FK
        text message
        timestamp timestamp
    }
```

**users**
| column     | type                  | notes                  |
|------------|-----------------------|-------------------------|
| id         | integer, PK           | auto-increment          |
| name       | string                | required                |
| email      | string, unique        | required, validated     |
| password   | string                | bcrypt hash, never returned in responses |
| role       | enum: PATIENT, DOCTOR | required                |
| createdAt  | timestamp             |                         |

**doctor_profiles** (1:1 with users, only for DOCTOR role)
| column            | type    | notes                |
|-------------------|---------|----------------------|
| id                | integer, PK |                  |
| user_id           | integer, FK → users, unique |   |
| specialization    | string  | required             |
| years_of_experience | integer | required           |

**consultations**
| column     | type                                  | notes                |
|------------|----------------------------------------|----------------------|
| id         | integer, PK                            |                      |
| patient_id | integer, FK → users                    |                      |
| doctor_id  | integer, FK → users                    |                      |
| status     | enum: PENDING, ACTIVE, COMPLETED       | default PENDING      |
| createdAt  | timestamp                              |                      |
| updatedAt  | timestamp                              |                      |

**messages**
| column          | type                    | notes            |
|-----------------|-------------------------|------------------|
| id              | integer, PK             |                  |
| consultation_id | integer, FK → consultations |              |
| sender_id       | integer, FK → users     |                  |
| message         | text                    | required         |
| timestamp       | timestamp               | createdAt alias  |

**Relationships**
- `User` 1:1 `DoctorProfile` (only when role = DOCTOR)
- `User` 1:many `Consultation` — twice, once as `patient`, once as `doctor`
- `Consultation` 1:many `Message`
- `User` 1:many `Message` (as sender)

## API Documentation

All protected routes require a header: `Authorization: Bearer <token>`

### Auth

**POST /auth/register**
```json
// Patient
{
  "name": "Ravi Kumar",
  "email": "ravi@example.com",
  "password": "password123",
  "role": "PATIENT"
}

// Doctor — specialization & yearsOfExperience required
{
  "name": "Dr. Anjali Mehta",
  "email": "anjali@example.com",
  "password": "password123",
  "role": "DOCTOR",
  "specialization": "Cardiology",
  "yearsOfExperience": 8
}
```
Response `201`:
```json
{ "success": true, "data": { "token": "...", "user": { "id": 1, "name": "...", "email": "...", "role": "PATIENT", "createdAt": "..." } } }
```

**POST /auth/login**
```json
{ "email": "ravi@example.com", "password": "password123" }
```
Response `200`: same shape as register.

**GET /profile** — returns the logged-in user's profile (includes `doctorProfile` if role is DOCTOR).

### Doctors

**GET /doctors** — list all doctors with their profile info.
**GET /doctors/:id** — get a single doctor by id.

### Consultations

**POST /consultations** — *patients only*. Body: `{ "doctorId": 2 }`. Creates a consultation with status `PENDING`.

**GET /consultations** — lists consultations for the logged-in user (as patient or doctor, depending on role).

**GET /consultations/:id** — get one consultation. Only the assigned patient or doctor can view it.

**PATCH /consultations/:id/status** — *assigned doctor only*. Body: `{ "status": "ACTIVE" }` (or `COMPLETED`). Fails with `400` if the consultation is already `COMPLETED`.

### Chat

**POST /consultations/:id/messages** — *assigned patient or doctor only*. Body: `{ "message": "..." }`. Fails with `400` once the consultation is `COMPLETED`.

**GET /consultations/:id/messages** — returns all messages for the consultation in chronological order.

## Sample curl requests

```bash
# Register a patient
curl -X POST http://localhost:5000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Ravi Kumar","email":"ravi@example.com","password":"password123","role":"PATIENT"}'

# Login
curl -X POST http://localhost:5000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"ravi@example.com","password":"password123"}'

# List doctors (replace TOKEN)
curl http://localhost:5000/doctors -H "Authorization: Bearer TOKEN"

# Create a consultation (patient token, replace DOCTOR_ID)
curl -X POST http://localhost:5000/consultations \
  -H "Authorization: Bearer TOKEN" -H "Content-Type: application/json" \
  -d '{"doctorId": 2}'

# Send a message
curl -X POST http://localhost:5000/consultations/1/messages \
  -H "Authorization: Bearer TOKEN" -H "Content-Type: application/json" \
  -d '{"message":"Doctor, I have had a fever for 3 days"}'
```

A full Postman collection is included at `postman_collection.json` — it auto-saves
tokens and IDs from responses into collection variables, so you can run requests
in order without manually copying values.

## Assumptions Made

- A user's role is fixed at registration; there's no endpoint to change a PATIENT to a DOCTOR or vice versa.
- Only one `DoctorProfile` per doctor user (1:1), matching the assignment's simple scope.
- `sequelize.sync()` is used instead of formal migrations, since the assignment scope is a 1–2 day take-home. In a production setting this would be replaced by `sequelize-cli` migrations.
- A consultation can only ever have one assigned doctor — there's no re-assignment endpoint.
- Status transitions aren't restricted to a strict order (e.g. PENDING → ACTIVE → COMPLETED); the assigned doctor can set any of the three non-COMPLETED-locked values at any point before completion, since the spec didn't require a strict state machine.
- Messages and status updates are blocked entirely once a consultation is COMPLETED, per the "cannot be modified" rule.
- Passwords require a minimum of 6 characters — not specified in the assignment, added as reasonable baseline validation.

## Bonus Not Implemented

Real-time chat (Socket.io), Swagger docs, and Docker setup were left out to prioritize
a fully correct, thoroughly tested core implementation within the given timeframe.
The REST-based chat endpoints (`POST`/`GET /consultations/:id/messages`) satisfy the
functional chat requirement via polling.
