# GiftFlow API - Frontend Integration Guide

## Base URL
```
http://localhost:3000
```

## Authentication

### 1. Register
**POST** `/auth/register`

**Request:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "name": "John Doe"
}
```

**Response:**
```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "John Doe",
    "accesses": [],
    "createdAt": "2025-11-05T00:00:00.000Z"
  },
  "accessToken": "jwt.token.here",
  "refreshToken": "refresh.token.here"
}
```

**Notes:**
- Sets `access_token` and `refresh_token` as httpOnly cookies
- Frontend should use `withCredentials: true` (Axios) or `credentials: 'include'` (fetch)

### 2. Login
**POST** `/auth/login`

**Request:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:** Same as Register

### 3. Login (Alias)
**POST** `/login`

Same as `/auth/login`

### 4. Get Current User
**GET** `/auth/me`

**Headers:** `Authorization: Bearer {token}` OR use cookies

**Response:**
```json
{
  "id": "uuid",
  "email": "user@example.com",
  "name": "John Doe",
  "accesses": [
    { "id": "ac01", "name": "organization" }
  ],
  "createdAt": "2025-11-05T00:00:00.000Z"
}
```

### 5. Refresh Token
**POST** `/auth/refresh`

**Request (optional - reads from cookie if not provided):**
```json
{
  "refreshToken": "refresh.token.here"
}
```

**Response:**
```json
{
  "accessToken": "new.jwt.token",
  "refreshToken": "new.refresh.token"
}
```

### 6. Logout
**POST** `/auth/logout`

**Headers:** `Authorization: Bearer {token}` OR use cookies

**Response:**
```json
{
  "message": "Logged out successfully"
}
```

---

## User Profile

### 7. Update My Person Profile
**PATCH** `/users/me/person`

**Headers:** `Authorization: Bearer {token}` OR use cookies

**Request (flexible - all fields optional):**
```json
{
  "personName": "John Doe",
  "firstName": "John",
  "lastName": "Doe",
  "salutation": "Mr",
  "address": "123 Main St",
  "birthDttm": "12/25/1990",
  
  "gender": {
    "id": "uuid-or-use-code",
    "code": "male",
    "name": "Male"
  },
  
  "birthPlace": {
    "id": "uuid-or-use-code",
    "code": "ID-JKT",
    "name": "Jakarta"
  },
  
  "job": {
    "id": "uuid-or-use-code",
    "code": "engineer",
    "name": "Engineer"
  },
  
  "ethnicity": {
    "id": "uuid-or-use-code",
    "code": "jawa",
    "name": "Jawa"
  },
  
  "marital": {
    "id": "uuid-or-use-code",
    "code": "single",
    "name": "Single"
  }
}
```

**Response:**
```json
{
  "person": {
    "personId": "uuid",
    "personName": "John Doe",
    "firstName": "John",
    "lastName": "Doe",
    "salutation": "Mr",
    "address": "123 Main St",
    "genderCode": "male",
    "birthDttm": "1990-12-25",
    "birthPlaceCode": "ID-JKT",
    "jobCode": "engineer",
    "ethnicityCode": "jawa",
    "maritalStatus": "single",
    "birthPlace": {
      "id": "city-uuid",
      "code": "ID-JKT",
      "name": "Jakarta"
    }
  }
}
```

**Notes:**
- Birth date accepts: ISO (`1990-12-25`), DD/MM/YYYY (`25/12/1990`), or MM/DD/YYYY (`12/25/1990`)
- For lookup fields, you can send:
  - Nested object with `id` (preferred)
  - Nested object with `code`
  - Nested object with `name` (backend will resolve)
  - Legacy: just the code string (e.g., `"genderCode": "male"`)

### 8. Update Another User's Person (Admin)
**PATCH** `/users/:userId/person`

**Headers:** `Authorization: Bearer {token}` (must be admin)

**Request/Response:** Same as Update My Person

---

## Lookup Endpoints

### 9. Get Genders
**GET** `/api/genders`

**Response:**
```json
[
  { "id": "uuid", "code": "male", "name": "Male" },
  { "id": "uuid", "code": "female", "name": "Female" },
  { "id": "uuid", "code": "undisclosed", "name": "Undisclosed" }
]
```

### 10. Get Ethnicities
**GET** `/api/ethnicities?q={search}`

**Query Parameters:**
- `q` (optional): Search term

**Response:**
```json
[
  { "id": "uuid", "code": "jawa", "name": "Jawa" },
  { "id": "uuid", "code": "sunda", "name": "Sunda" },
  { "id": "uuid", "code": "betawi", "name": "Betawi" },
  { "id": "uuid", "code": "batak", "name": "Batak" },
  { "id": "uuid", "code": "minangkabau", "name": "Minangkabau" },
  { "id": "uuid", "code": "bugis", "name": "Bugis" },
  { "id": "uuid", "code": "madura", "name": "Madura" },
  { "id": "uuid", "code": "banjar", "name": "Banjar" },
  { "id": "uuid", "code": "bali", "name": "Bali" },
  { "id": "uuid", "code": "other", "name": "Lainnya" },
  { "id": "uuid", "code": "undisclosed", "name": "Tidak Disebutkan" }
]
```

### 11. Get Jobs
**GET** `/api/jobs?q={search}`

**Query Parameters:**
- `q` (optional): Search term

**Response:**
```json
[
  { "id": "uuid", "code": "engineer", "name": "Engineer" },
  { "id": "uuid", "code": "developer", "name": "Software Developer" },
  { "id": "uuid", "code": "teacher", "name": "Teacher" },
  { "id": "uuid", "code": "doctor", "name": "Doctor" }
]
```

### 12. Get Cities
**GET** `/api/cities?q={search}`

**Query Parameters:**
- `q` (optional): Search term

**Response:**
```json
[
  { "city_id": "uuid", "city_code": "ID-JKT", "name": "Jakarta" },
  { "city_id": "uuid", "city_code": "ID-SBY", "name": "Surabaya" },
  { "city_id": "uuid", "city_code": "ID-BDG", "name": "Bandung" }
]
```

**Notes:**
- Returns top 20 results
- Case-insensitive search
- Searches by city name

### 13. Get Menu (Based on User Access)
**GET** `/menu`

**Headers:** `Authorization: Bearer {token}` OR use cookies

**Response:**
```json
{
  "access": {
    "id": "ac01",
    "name": "organization",
    "menu": [
      {
        "key": "dashboard",
        "title": "Dashboard",
        "url": "/dashboard",
        "icon": "fa:fa-gauge"
      },
      {
        "key": "occasion",
        "title": "Occasions",
        "url": "/occasion",
        "icon": "fa:fa-calendar-days",
        "children": [
          { "key": "occasion-list", "title": "List", "url": "/occasion" },
          { "key": "occasion-create", "title": "Create", "url": "/occasion/create" }
        ]
      }
    ]
  }
}
```

**Notes:**
- Priority: ac03 (administrator) > ac01 (organization) > ac02 (individual)
- Returns the highest-priority access menu for the user

---

## Admin Endpoints

### 14. Create User (Admin)
**POST** `/users`

**Headers:** `Authorization: Bearer {token}` (must be admin)

**Request:**
```json
{
  "email": "newuser@example.com",
  "password": "password123",
  "personName": "Jane Doe",
  "firstName": "Jane",
  "lastName": "Doe",
  "address": "456 Oak Ave",
  "accessIds": ["ac02"]
}
```

**Response:**
```json
{
  "user": {
    "id": "uuid",
    "email": "newuser@example.com",
    "name": "Jane Doe",
    "accesses": [
      { "id": "ac02", "name": "individual" }
    ],
    "createdAt": "2025-11-05T00:00:00.000Z"
  }
}
```

---

## CORS & Credentials

**Important:** All authenticated requests must include credentials:

### Axios Example:
```javascript
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3000',
  withCredentials: true, // Required for cookies
});

// Login
await api.post('/auth/login', { email, password });

// Update profile
await api.patch('/users/me/person', personData);
```

### Fetch Example:
```javascript
// Login
await fetch('http://localhost:3000/auth/login', {
  method: 'POST',
  credentials: 'include', // Required for cookies
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email, password }),
});

// Update profile
await fetch('http://localhost:3000/users/me/person', {
  method: 'PATCH',
  credentials: 'include',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(personData),
});
```

---

## Available Lookup Codes

### Gender Codes:
- `male` - Male
- `female` - Female
- `undisclosed` - Undisclosed

### Marital Status Codes:
- `single` - Single
- `married` - Married
- `divorced` - Divorced
- `undisclosed` - Undisclosed

### Indonesian Ethnicity Codes:
- `jawa` - Jawa
- `sunda` - Sunda
- `betawi` - Betawi
- `batak` - Batak
- `minangkabau` - Minangkabau
- `bugis` - Bugis
- `madura` - Madura
- `banjar` - Banjar
- `bali` - Bali
- `aceh` - Aceh
- `dayak` - Dayak
- `makassar` - Makassar
- `lampung` - Lampung
- `palembang` - Palembang
- `gorontalo` - Gorontalo
- `toraja` - Toraja
- `minahasa` - Minahasa
- `nias` - Nias
- `sasak` - Sasak
- `other` - Lainnya
- `undisclosed` - Tidak Disebutkan

### Job Codes:
- `teacher`, `doctor`, `nurse`, `engineer`, `developer`, `designer`, `architect`
- `accountant`, `sales`, `marketing`, `consultant`, `writer`, `photographer`
- `chef`, `driver`, `security`, `mechanic`, `student`, `researcher`, `entrepreneur`

### City Codes:
- 101 Indonesian cities including:
- `ID-JKT` (Jakarta), `ID-SBY` (Surabaya), `ID-BDG` (Bandung), etc.
- Use `/api/cities` endpoint to get full list

---

## Error Responses

### 400 Bad Request
```json
{
  "message": ["birthDttm must be a valid date"],
  "error": "Bad Request",
  "statusCode": 400
}
```

### 401 Unauthorized
```json
{
  "message": "Unauthorized",
  "statusCode": 401
}
```

### 403 Forbidden
```json
{
  "message": "Admin access required",
  "error": "Forbidden",
  "statusCode": 403
}
```

### 404 Not Found
```json
{
  "message": "User not found",
  "error": "Not Found",
  "statusCode": 404
}
```

### 409 Conflict
```json
{
  "message": "Invalid genderCode: invalid_code",
  "error": "Conflict",
  "statusCode": 409
}
```

---

## Testing Checklist

- [ ] Register new user with cookies
- [ ] Login and verify cookies are set
- [ ] Call `/auth/me` with cookies (no Authorization header needed)
- [ ] Fetch all lookup endpoints (`/api/genders`, `/api/ethnicities`, `/api/jobs`, `/api/cities`)
- [ ] Update person profile with nested objects (preferred)
- [ ] Update person profile with legacy code fields
- [ ] Test date formats: ISO, DD/MM/YYYY, MM/DD/YYYY
- [ ] Verify 401 when not authenticated
- [ ] Test refresh token flow
- [ ] Logout and verify cookies are cleared
