# 🚀 GiftFlow API - Quick Reference for Frontend

## Base URL
```
http://localhost:3000
```

## 🍪 Cookie Configuration (REQUIRED)

### Axios
```javascript
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3000',
  withCredentials: true  // ⚠️ REQUIRED for auth cookies
});
```

### Fetch
```javascript
fetch('http://localhost:3000/auth/login', {
  method: 'POST',
  credentials: 'include',  // ⚠️ REQUIRED for auth cookies
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email, password })
});
```

---

## 🔐 Authentication Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/auth/register` | Register new user | ❌ |
| POST | `/auth/login` | Login | ❌ |
| POST | `/login` | Login (alias) | ❌ |
| GET | `/auth/me` | Get current user | ✅ |
| POST | `/auth/refresh` | Refresh token | ✅ |
| POST | `/auth/logout` | Logout | ✅ |

### Register/Login Request
```json
{
  "email": "user@example.com",
  "password": "password123",
  "name": "John Doe"  // optional for register
}
```

### Response
```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "John Doe"
  },
  "accessToken": "jwt...",
  "refreshToken": "refresh..."
}
```

---

## 👤 Profile Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| PATCH | `/users/me/person` | Update own profile | ✅ |
| PATCH | `/users/:userId/person` | Update user (admin) | ✅ Admin |

### Update Profile Request (Preferred)
```json
{
  "personName": "John Doe",
  "firstName": "John",
  "lastName": "Doe",
  "salutation": "Mr",
  "address": "123 Main St",
  "birthDttm": "25/12/1990",
  
  "gender": {
    "id": "uuid-from-api-genders"
  },
  
  "birthPlace": {
    "id": "uuid-from-api-cities"
  },
  
  "job": {
    "id": "uuid-from-api-jobs"
  },
  
  "ethnicity": {
    "id": "uuid-from-api-ethnicities"
  },
  
  "marital": {
    "code": "single"
  }
}
```

**Note:** All fields are optional. Send only what changed.

---

## 📋 Lookup Endpoints (for Dropdowns)

| Method | Endpoint | Search | Response Format |
|--------|----------|--------|-----------------|
| GET | `/api/genders` | ❌ | `[{id, code, name}]` |
| GET | `/api/ethnicities?q=jawa` | ✅ | `[{id, code, name}]` |
| GET | `/api/jobs?q=engineer` | ✅ | `[{id, code, name}]` |
| GET | `/api/cities?q=jakarta` | ✅ | `[{city_id, city_code, name}]` |

### Example: Load Gender Dropdown
```javascript
const response = await api.get('/api/genders');
// [
//   { id: "uuid1", code: "male", name: "Male" },
//   { id: "uuid2", code: "female", name: "Female" },
//   { id: "uuid3", code: "undisclosed", name: "Undisclosed" }
// ]
```

---

## 📊 Available Lookup Codes

### Genders (3 options)
- `male` - Male
- `female` - Female
- `undisclosed` - Undisclosed

### Marital Status (4 options)
- `single` - Single
- `married` - Married
- `divorced` - Divorced
- `undisclosed` - Undisclosed

### Indonesian Ethnicities (21 options)
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
- `other` - Lainnya (Other)
- `undisclosed` - Tidak Disebutkan

### Jobs (20 options)
- `teacher`, `doctor`, `nurse`, `engineer`, `developer`
- `designer`, `architect`, `accountant`, `sales`, `marketing`
- `consultant`, `writer`, `photographer`, `chef`, `driver`
- `security`, `mechanic`, `student`, `researcher`, `entrepreneur`

### Cities (101 options)
Use search: `/api/cities?q=jakarta`
- Major cities: Jakarta, Surabaya, Bandung, Semarang, Medan, etc.

---

## 🎯 Common Workflows

### 1. User Registration & Profile Setup
```javascript
// Step 1: Register
await api.post('/auth/register', {
  email: 'user@example.com',
  password: 'password123',
  name: 'John Doe'
});

// Step 2: Load lookup data
const [genders, ethnicities, jobs, cities] = await Promise.all([
  api.get('/api/genders'),
  api.get('/api/ethnicities'),
  api.get('/api/jobs'),
  api.get('/api/cities')
]);

// Step 3: Update profile
await api.patch('/users/me/person', {
  personName: 'John Doe',
  firstName: 'John',
  lastName: 'Doe',
  birthDttm: '25/12/1990',
  gender: { id: genders.data[0].id },
  birthPlace: { id: cities.data.find(c => c.name === 'Jakarta').city_id },
  job: { id: jobs.data.find(j => j.code === 'engineer').id },
  ethnicity: { id: ethnicities.data.find(e => e.code === 'jawa').id }
});
```

### 2. Login & Fetch User Info
```javascript
// Login
await api.post('/auth/login', {
  email: 'user@example.com',
  password: 'password123'
});

// Get current user
const { data } = await api.get('/auth/me');
console.log(data); // { id, email, name, accesses, createdAt }
```

### 3. Search & Select Lookup
```javascript
// Search cities
const { data } = await api.get('/api/cities?q=jakarta');
// [
//   { city_id: "uuid", city_code: "ID-JKT", name: "Jakarta" },
//   ...
// ]

// Use in profile update
await api.patch('/users/me/person', {
  birthPlace: {
    id: data[0].city_id,
    code: data[0].city_code,
    name: data[0].name
  }
});
```

---

## ⚠️ Error Handling

### Common Error Codes
| Status | Meaning | Example |
|--------|---------|---------|
| 400 | Bad Request | Invalid date format |
| 401 | Unauthorized | Not logged in |
| 403 | Forbidden | Admin access required |
| 404 | Not Found | User not found |
| 409 | Conflict | Invalid lookup code |

### Error Response Format
```json
{
  "message": "Invalid genderCode: xyz",
  "error": "Conflict",
  "statusCode": 409
}
```

### Example Error Handling
```javascript
try {
  await api.patch('/users/me/person', profileData);
} catch (error) {
  if (error.response?.status === 401) {
    // Redirect to login
    router.push('/login');
  } else if (error.response?.status === 409) {
    // Show validation error
    alert(error.response.data.message);
  }
}
```

---

## 🧪 Test with cURL

### Register
```bash
curl -c cookies.txt -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123","name":"Test User"}'
```

### Get Current User (with cookies)
```bash
curl -b cookies.txt http://localhost:3000/auth/me
```

### Update Profile
```bash
curl -b cookies.txt -X PATCH http://localhost:3000/users/me/person \
  -H "Content-Type: application/json" \
  -d '{"firstName":"John","genderCode":"male"}'
```

---

## 📅 Date Format Support

Backend accepts multiple formats:
- ISO: `"1990-12-25"`
- DD/MM/YYYY: `"25/12/1990"`
- MM/DD/YYYY: `"12/25/1990"`

**Recommendation:** Use DD/MM/YYYY for consistency with Indonesian locale.

---

## 🔗 Additional Resources

- Full API Documentation: `docs/FRONTEND_API.md`
- Test Script: `scripts/test-complete-flow.sh`
- Base URL: `http://localhost:3000`

---

**Need Help?** Contact the backend team or check the full documentation.
