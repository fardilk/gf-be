# API Updates Summary

## ✅ Completed Tasks

### 1. Updated DTOs (src/users/dto.ts)
- **Removed:** All `*Code` fields (genderCode, birthPlaceCode, jobCode, ethnicityCode, maritalStatus)
- **Added:** New UUID-based fields:
  - `genderId` (UUID)
  - `cityId` (UUID) - for birth place
  - `jobId` (UUID)
  - `ethnicityId` (UUID)
  - `maritalStatusId` (string: ms1-ms4)
  - `organizationLevelId` (UUID)
  - `isFree` (boolean)

### 2. Updated UsersService (src/users/users.service.ts)
- **Removed:** `resolveCityByAny()` method and all code-based lookups
- **Added:** `resolveCityById()` for UUID-based city lookup
- **Updated Methods:**
  - `updatePerson()`: Now validates all *Id fields against respective tables, includes all relations in response
  - `getPersonByUserId()`: Returns person with all nested relations (gender, city, job, ethnicity, maritalStatus, organizationLevel)

### 3. Created Relation Module
- **Files:**
  - `src/relation/relation.module.ts`
  - `src/relation/relation.service.ts`
  - `src/relation/relation.controller.ts`
  - `src/relation/relation.dto.ts`

- **Endpoints:**
  - `GET /relations` - List all relations with gifter/receiver details
  - `GET /relations/:id` - Get specific relation
  - `POST /relations` - Create new relation
  - `PATCH /relations/:id` - Update relation
  - `DELETE /relations/:id` - Delete relation

- **DTOs:**
  - `CreateRelationDto`: relationName (required), description, gifterId, receiverId
  - `UpdateRelationDto`: All fields optional

### 4. Created Picks Module
- **Files:**
  - `src/picks/picks.module.ts`
  - `src/picks/picks.service.ts`
  - `src/picks/picks.controller.ts`
  - `src/picks/picks.dto.ts`

- **PickItem Type:**
  ```typescript
  {
    id: string;
    title: string;
    imageUrl?: string;
    description?: string;
    cost?: string;
    savedAt: number;
    url: string;
  }
  ```

- **Endpoints:**
  - `GET /picks` - List all picks
  - `GET /picks/:id` - Get specific pick
  - `POST /picks` - Create new pick
  - `PATCH /picks/:id` - Update pick
  - `DELETE /picks/:id` - Delete pick

- **Storage:** In-memory for now (no database model yet)

## 🔧 Known Issues to Address

### Lookup Controllers Need Updates
The following controllers still reference old `code` fields and need to be updated to work with new schema:
- `src/lookups/cities.controller.ts`
- `src/lookups/genders.controller.ts`
- `src/lookups/jobs.controller.ts`
- `src/lookups/ethnicities.controller.ts`

### Legacy Scripts
- `scripts/backfill-city-id.ts` references old code fields

## 📋 Testing Checklist

### Person Endpoints
1. Login as `fardil.khalidi@gmail.com` (password: `default`)
2. Test GET `/users/me/person` - Should return person with nested relations
3. Test PATCH `/users/me/person` with new payload:
   ```json
   {
     "personName": "Test User",
     "genderId": "a0000000-0000-0000-0000-000000000001",
     "ethnicityId": "33333333-3333-3333-3333-333333333333",
     "cityId": "<uuid>",
     "jobId": "<uuid>",
     "maritalStatusId": "ms2",
     "organizationLevelId": "00000000-0000-0000-0000-000000000001",
     "isFree": false
   }
   ```

### Relation Endpoints
1. GET `/relations` - List all 46 seeded relation types
2. POST `/relations` - Create new relation:
   ```json
   {
     "relationName": "COUSIN",
     "description": "Cousin",
     "gifterId": "<person-uuid>",
     "receiverId": "<person-uuid>"
   }
   ```
3. GET `/relations/:id` - Get specific relation
4. PATCH `/relations/:id` - Update relation
5. DELETE `/relations/:id` - Delete relation

### Picks Endpoints
1. GET `/picks` - List all picks (initially empty)
2. POST `/picks` - Create new pick:
   ```json
   {
     "title": "Gaming Laptop",
     "imageUrl": "https://example.com/laptop.jpg",
     "description": "High-performance gaming laptop",
     "cost": "$1,500",
     "url": "https://example.com/product/123"
   }
   ```
3. GET `/picks/:id` - Get specific pick
4. PATCH `/picks/:id` - Update pick
5. DELETE `/picks/:id` - Delete pick

## 🔑 Seeded Data Reference

### Organization Levels
- `00000000-0000-0000-0000-000000000001`: organization
- `00000000-0000-0000-0000-000000000002`: individual

### Genders
- `a0000000-0000-0000-0000-000000000001`: Male
- `a0000000-0000-0000-0000-000000000002`: Female
- `a0000000-0000-0000-0000-000000000003`: Undisclosed

### Marital Status
- `ms1`: Single
- `ms2`: Married
- `ms3`: Divorced
- `ms4`: Undisclosed

### Ethnicities (Standardized UUIDs)
- `11111111-1111-1111-1111-111111111111`: Jawa
- `22222222-2222-2222-2222-222222222222`: Sunda
- `33333333-3333-3333-3333-333333333333`: Betawi
- `44444444-4444-4444-4444-444444444444`: Batak
- `55555555-5555-5555-5555-555555555555`: Minangkabau
- ...and 16 more (see seed.ts for full list)

### Sample Users
- `fardil.khalidi@gmail.com` (password: `default`, ac01: organization)
- `attarasmawan@gmail.com` (password: `default`, ac02: individual)
- `administrator@sevenrose.com` (password: `default`, ac03: administrator)

## 📝 Next Steps (Future)

1. Add database model for Picks (currently in-memory)
2. Update lookup controllers to work with new schema
3. Add UpcomingEvents CRUD endpoints
4. Update frontend documentation
5. Write integration tests
6. Fix legacy scripts that reference old code fields
