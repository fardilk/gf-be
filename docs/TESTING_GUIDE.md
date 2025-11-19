# Testing Guide - GiftFlow API

## Overview
This document provides guidance for testing the GiftFlow API endpoints including unit tests, E2E tests, and manual testing.

## Quick Test Script

Run the complete flow test:
```bash
cd /home/tw-fardil/Documents/Fardil/Project/gf-be/gf-api
./scripts/test-complete-flow.sh
```

This tests:
- ✅ All lookup endpoints (genders, ethnicities, jobs, cities)
- ✅ Registration with cookies
- ✅ Authentication and /auth/me
- ✅ Profile update with nested objects
- ✅ Profile update with legacy code fields
- ✅ Logout and cookie clearing

---

## Manual Testing with cURL

### 1. Test Lookup Endpoints

```bash
# Genders (should return 3)
curl http://localhost:3000/api/genders | jq '.'

# Ethnicities (should return 21+)
curl http://localhost:3000/api/ethnicities | jq '. | length'

# Jobs (should return 20)
curl http://localhost:3000/api/jobs | jq '. | length'

# Cities (should return 101 total, API returns top 20)
curl http://localhost:3000/api/cities | jq '. | length'

# Search cities
curl 'http://localhost:3000/api/cities?q=jakarta' | jq '.'
```

### 2. Test Authentication Flow

```bash
# Register (creates cookie file)
curl -c cookies.txt -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "testuser@example.com",
    "password": "Test123!",
    "name": "Test User"
  }' | jq '.'

# Login (updates cookies)
curl -c cookies.txt -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "testuser@example.com",
    "password": "Test123!"
  }' | jq '.'

# Get current user (uses cookies)
curl -b cookies.txt http://localhost:3000/auth/me | jq '.'

# Refresh token
curl -b cookies.txt -c cookies.txt -X POST http://localhost:3000/auth/refresh | jq '.'

# Logout
curl -b cookies.txt -X POST http://localhost:3000/auth/logout | jq '.'

# Verify unauthorized after logout
curl -b cookies.txt http://localhost:3000/auth/me
# Should return: {"message":"Unauthorized","statusCode":401}

# Cleanup
rm cookies.txt
```

### 3. Test Profile Updates

```bash
# First, login and save cookies
curl -c cookies.txt -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"testuser@example.com","password":"Test123!"}' > /dev/null

# Get lookup IDs
GENDER_ID=$(curl -s http://localhost:3000/api/genders | jq -r '.[] | select(.code=="male") | .id')
JOB_ID=$(curl -s http://localhost:3000/api/jobs | jq -r '.[] | select(.code=="engineer") | .id')
ETHNICITY_ID=$(curl -s http://localhost:3000/api/ethnicities | jq -r '.[] | select(.code=="jawa") | .id')
CITY_ID=$(curl -s 'http://localhost:3000/api/cities?q=jakarta' | jq -r '.[0].city_id')

# Update with nested objects (preferred method)
curl -b cookies.txt -X PATCH http://localhost:3000/users/me/person \
  -H "Content-Type: application/json" \
  -d "{
    \"personName\": \"Test User Updated\",
    \"firstName\": \"Test\",
    \"lastName\": \"User\",
    \"salutation\": \"Mr\",
    \"address\": \"123 Test Street\",
    \"birthDttm\": \"15/08/1995\",
    \"gender\": {
      \"id\": \"$GENDER_ID\",
      \"code\": \"male\",
      \"name\": \"Male\"
    },
    \"birthPlace\": {
      \"id\": \"$CITY_ID\",
      \"code\": \"ID-JKT\",
      \"name\": \"Jakarta\"
    },
    \"job\": {
      \"id\": \"$JOB_ID\",
      \"code\": \"engineer\",
      \"name\": \"Engineer\"
    },
    \"ethnicity\": {
      \"id\": \"$ETHNICITY_ID\",
      \"code\": \"jawa\",
      \"name\": \"Jawa\"
    },
    \"marital\": {
      \"code\": \"single\",
      \"name\": \"Single\"
    }
  }" | jq '.'

# Update with legacy code fields (backward compatibility)
curl -b cookies.txt -X PATCH http://localhost:3000/users/me/person \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "UpdatedName",
    "genderCode": "female",
    "birthPlaceCode": "ID-SBY",
    "jobCode": "doctor",
    "ethnicityCode": "sunda"
  }' | jq '.'

# Cleanup
rm cookies.txt
```

### 4. Test Date Formats

```bash
# Login first
curl -c cookies.txt -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"testuser@example.com","password":"Test123!"}' > /dev/null

# Test ISO format
curl -b cookies.txt -X PATCH http://localhost:3000/users/me/person \
  -H "Content-Type: application/json" \
  -d '{"birthDttm": "1995-08-15"}' | jq '.person.birthDttm'

# Test DD/MM/YYYY format
curl -b cookies.txt -X PATCH http://localhost:3000/users/me/person \
  -H "Content-Type: application/json" \
  -d '{"birthDttm": "15/08/1995"}' | jq '.person.birthDttm'

# Test MM/DD/YYYY format
curl -b cookies.txt -X PATCH http://localhost:3000/users/me/person \
  -H "Content-Type: application/json" \
  -d '{"birthDttm": "08/15/1995"}' | jq '.person.birthDttm'

# Cleanup
rm cookies.txt
```

### 5. Test Error Cases

```bash
# 401 Unauthorized - no cookies
curl http://localhost:3000/auth/me
# Expected: {"message":"Unauthorized","statusCode":401}

# 400 Bad Request - invalid date
curl -c cookies.txt -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"testuser@example.com","password":"Test123!"}' > /dev/null

curl -b cookies.txt -X PATCH http://localhost:3000/users/me/person \
  -H "Content-Type: application/json" \
  -d '{"birthDttm": "invalid-date"}'
# Expected: 400 error

# 409 Conflict - invalid gender code
curl -b cookies.txt -X PATCH http://localhost:3000/users/me/person \
  -H "Content-Type: application/json" \
  -d '{"genderCode": "invalid_gender"}'
# Expected: 409 error

rm cookies.txt
```

---

## Unit Testing (Jest)

### Run Unit Tests
```bash
cd /home/tw-fardil/Documents/Fardil/Project/gf-be/gf-api
pnpm test
```

### Run Specific Test Suite
```bash
pnpm test -- users.service.spec
pnpm test -- auth.controller.spec
```

### Run with Coverage
```bash
pnpm test:cov
```

### Example Unit Test Structure

```typescript
// src/users/users.service.spec.ts
describe('UsersService', () => {
  describe('updatePerson', () => {
    it('should update person with nested gender object', async () => {
      const dto = {
        gender: { id: 'uuid', code: 'male', name: 'Male' }
      };
      const result = await service.updatePerson(userId, dto);
      expect(result.person.genderCode).toBe('male');
      expect(result.person.genderId).toBe('uuid');
    });

    it('should update person with legacy genderCode', async () => {
      const dto = { genderCode: 'female' };
      const result = await service.updatePerson(userId, dto);
      expect(result.person.genderCode).toBe('female');
    });

    it('should parse DD/MM/YYYY date format', async () => {
      const dto = { birthDttm: '25/12/1990' };
      const result = await service.updatePerson(userId, dto);
      expect(result.person.birthDttm).toBe('1990-12-25T00:00:00.000Z');
    });

    it('should throw 409 for invalid gender code', async () => {
      const dto = { genderCode: 'invalid' };
      await expect(service.updatePerson(userId, dto))
        .rejects.toThrow(ConflictException);
    });
  });
});
```

---

## E2E Testing

### Run E2E Tests
```bash
cd /home/tw-fardil/Documents/Fardil/Project/gf-be/gf-api
pnpm test:e2e
```

### Example E2E Test Structure

```typescript
// test/profile-update.e2e-spec.ts
describe('Profile Update (e2e)', () => {
  let app: INestApplication;
  let cookies: string[];

  beforeAll(async () => {
    // Setup test app
  });

  it('/auth/register (POST) - should register and set cookies', () => {
    return request(app.getHttpServer())
      .post('/auth/register')
      .send({ email: 'test@example.com', password: 'test123' })
      .expect(201)
      .then(res => {
        expect(res.body.accessToken).toBeDefined();
        cookies = res.headers['set-cookie'];
      });
  });

  it('/users/me/person (PATCH) - should update with nested objects', () => {
    return request(app.getHttpServer())
      .patch('/users/me/person')
      .set('Cookie', cookies)
      .send({
        firstName: 'John',
        gender: { code: 'male' },
        birthPlace: { code: 'ID-JKT' }
      })
      .expect(200)
      .then(res => {
        expect(res.body.person.firstName).toBe('John');
        expect(res.body.person.genderCode).toBe('male');
      });
  });
});
```

---

## Database Verification

### Check Seed Data
```bash
cd /home/tw-fardil/Documents/Fardil/Project/gf-be/gf-api

# Run seed
pnpm run db:seed

# Verify with Prisma Studio
pnpm prisma studio
```

### Verify Lookup Tables Have UUIDs
```sql
-- In Prisma Studio or psql

-- Check genders (should have 3 rows with UUIDs)
SELECT gender_id, gender_code, gender_name FROM gender;

-- Check ethnicities (should have 21+ rows with UUIDs)
SELECT ethnicity_id, ethnicity_code, ethnicity_name FROM ethnicity;

-- Check jobs (should have 20 rows with UUIDs)
SELECT job_id, job_code, job_name FROM job;

-- Check cities (should have 101 rows with UUIDs)
SELECT city_id, city_code, city_name FROM city LIMIT 10;
```

### Verify Person FK Relationships
```sql
-- Check person records have proper FKs
SELECT 
  person_id,
  person_name,
  gender_id,
  gender_code,
  job_id,
  job_code,
  ethnicity_id,
  ethnicity_code,
  birth_place_id,
  birth_place_code
FROM person
LIMIT 5;
```

---

## Integration Testing Checklist

### Auth Flow
- [ ] Register creates user + person
- [ ] Register sets httpOnly cookies
- [ ] Login authenticates and sets cookies
- [ ] /auth/me works with cookies only
- [ ] /auth/me works with Authorization header
- [ ] Refresh token rotates tokens
- [ ] Logout clears cookies

### Profile Update
- [ ] Update with nested gender object
- [ ] Update with nested birthPlace object
- [ ] Update with nested job object
- [ ] Update with nested ethnicity object
- [ ] Update with nested marital object
- [ ] Update with legacy genderCode
- [ ] Update with legacy birthPlaceCode
- [ ] All updates set both ID and code FK fields
- [ ] Date parsing works for DD/MM/YYYY
- [ ] Date parsing works for MM/DD/YYYY
- [ ] Date parsing works for ISO format

### Lookups
- [ ] /api/genders returns 3 items with UUIDs
- [ ] /api/ethnicities returns 21+ Indonesian ethnicities
- [ ] /api/jobs returns 20 common jobs
- [ ] /api/cities returns Indonesian cities
- [ ] Search works on ethnicities, jobs, cities
- [ ] All lookup items have {id, code, name}

### Error Handling
- [ ] 401 when not authenticated
- [ ] 400 for invalid date format
- [ ] 409 for invalid lookup code
- [ ] 404 for non-existent user
- [ ] FK constraint errors handled gracefully

### CORS & Cookies
- [ ] CORS allows credentials
- [ ] Cookies work from different origin
- [ ] Set-Cookie header included in response
- [ ] Cookie flags: httpOnly, sameSite

---

## Performance Testing

### Test with Apache Bench (ab)
```bash
# Test lookup endpoint performance
ab -n 1000 -c 10 http://localhost:3000/api/genders

# Test authenticated endpoint
# (need to extract cookie first)
COOKIE="access_token=jwt..."
ab -n 1000 -c 10 -H "Cookie: $COOKIE" http://localhost:3000/auth/me
```

### Test with wrk
```bash
wrk -t2 -c10 -d30s http://localhost:3000/api/genders
```

---

## Troubleshooting

### Issue: "Unauthorized" on /auth/me
**Solution:** Ensure cookies are included in request
```bash
# Wrong: curl http://localhost:3000/auth/me
# Right: curl -b cookies.txt http://localhost:3000/auth/me
```

### Issue: Lookup returns null IDs
**Solution:** Run migration script
```bash
pnpm ts-node -T scripts/migrate-lookup-ids.ts
```

### Issue: Invalid FK constraint error
**Solution:** Verify lookup data exists
```bash
# Check if ethnicity exists
curl http://localhost:3000/api/ethnicities | grep "jawa"

# Re-run seed if needed
pnpm run db:seed
```

### Issue: Date parsing returns wrong date
**Solution:** Check date format sent
```bash
# Use DD/MM/YYYY for Indonesian locale
# "25/12/1990" → December 25, 1990
```

---

## CI/CD Testing Commands

```yaml
# .github/workflows/test.yml
- name: Run unit tests
  run: pnpm test

- name: Run e2e tests
  run: pnpm test:e2e

- name: Run complete flow test
  run: ./scripts/test-complete-flow.sh

- name: Check build
  run: pnpm run build
```

---

## Next Steps

1. **Write Missing Unit Tests:**
   - `UsersService.updatePerson` with all lookup types
   - `UsersService.resolveGenderByAny`, etc.
   - Date parsing edge cases

2. **Write E2E Tests:**
   - Complete auth flow
   - Profile update with all lookup types
   - Error scenarios

3. **Add Integration Tests:**
   - FK constraint validations
   - Concurrent user updates
   - Token refresh race conditions

4. **Performance Tests:**
   - Lookup endpoint response time
   - Auth flow latency
   - Database query optimization

5. **Security Tests:**
   - SQL injection attempts
   - XSS in profile fields
   - Cookie security flags
   - JWT expiration

---

**Status:** Basic testing implemented, comprehensive test suite pending.
