# Database Restructuring Summary

## Date: November 19, 2025

## Overview
Completed comprehensive database restructuring to simplify schema and add new tables for organization levels, relations, and upcoming events.

---

## Changes Implemented

### 1. **Removed _code and _name Columns**

All lookup tables now use only `_id` (UUID) as primary key and `name` for the display value:

#### Gender Table
- ❌ Removed: `gender_code`, `gender_name`
- ✅ Kept: `gender_id` (PK), `name`

```typescript
model Gender {
  genderId String   @id @default(uuid()) @map("gender_id") @db.Uuid
  name     String
  persons  Person[]
}
```

#### City Table  
- ❌ Removed: `city_code`
- ✅ Kept: `city_id` (PK), `name`

```typescript
model City {
  cityId  String   @id @default(uuid()) @map("city_id") @db.Uuid
  name    String
  persons Person[]
}
```

#### Ethnicity Table
- ❌ Removed: `ethnicity_code`, `ethnicity_name`
- ❌ Removed: Records with "Group A", "Group B", "Group C"
- ✅ Kept: `ethnicity_id` (PK with standardized UUIDs), `name`
- ✅ Added: 21 Indonesian ethnic groups with fixed UUIDs

```typescript
model Ethnicity {
  ethnicityId String   @id @default(uuid()) @map("ethnicity_id") @db.Uuid
  name        String
  persons     Person[]
}
```

#### Job Table
- ❌ Removed: `job_code`, `job_name`
- ✅ Kept: `job_id` (PK), `name`
- ✅ Added: "Other" job entry

```typescript
model Job {
  jobId   String   @id @default(uuid()) @map("job_id") @db.Uuid
  name    String
  persons Person[]
}
```

#### MaritalStatus Table
- ❌ Renamed: `marital_status_code` → `marital_status_id`
- ✅ Changed codes to unclear values: `ms1`, `ms2`, `ms3`, `ms4`

| Old Code | New ID | Name |
|----------|--------|------|
| single | ms1 | Single |
| married | ms2 | Married |
| divorced | ms3 | Divorced |
| undisclosed | ms4 | Undisclosed |

```typescript
model MaritalStatus {
  maritalStatusId String   @id @map("marital_status_id")
  name            String
  persons         Person[]
}
```

---

### 2. **Removed JobOther Table**

- ❌ **Dropped**: `job_other` table entirely
- ✅ **Replaced with**: Job entry with name='Other'

---

### 3. **Updated Person Table**

#### Added Columns:
- `is_free` (BOOLEAN, default: false)
- `organization_level_id` (UUID, FK to organization_level)

#### Renamed Columns:
- `birth_place_id` → `city_id`
- `marital_status` → `marital_status_id`

#### Removed Columns:
- ❌ `gender_code`
- ❌ `birth_place` (old city_code)
- ❌ `job_code`
- ❌ `ethnicity_code`

#### Current Person Structure:
```typescript
model Person {
  personId              String              @id @default(uuid())
  address               String?
  personName            String?
  firstName             String?
  lastName              String?
  salutation            String?
  genderId              String?             @db.Uuid
  birthDttm             DateTime?           @db.Date
  cityId                String?             @db.Uuid
  jobId                 String?             @db.Uuid
  ethnicityId           String?             @db.Uuid
  maritalStatusId       String?
  isFree                Boolean             @default(false)
  organizationLevelId   String?             @db.Uuid
  
  // Relations
  gender                Gender?
  city                  City?
  job                   Job?
  ethnicity             Ethnicity?
  maritalStatus         MaritalStatus?
  organizationLevel     OrganizationLevel?
  upcomingEvents        UpcomingEvent[]
  relationsAsGifter     Relation[]          @relation("PersonAsGifter")
  relationsAsReceiver   Relation[]          @relation("PersonAsReceiver")
}
```

---

### 4. **New Tables Added**

#### OrganizationLevel Table
```typescript
model OrganizationLevel {
  organizationLevelId   String   @id @default(uuid())
  organizationLevelName String
  persons               Person[]
}
```

**Seeded Data:**
- `00000000-0000-0000-0000-000000000001` → "organization"
- `00000000-0000-0000-0000-000000000002` → "individual"

---

#### Relation Table
```typescript
model Relation {
  relationId   String  @id @default(uuid())
  relationName String
  description  String?
  gifterId     String? @db.Uuid
  receiverId   String? @db.Uuid

  gifter       Person? @relation("PersonAsGifter")
  receiver     Person? @relation("PersonAsReceiver")
  upcomingEvents UpcomingEvent[]
}
```

**Seeded Data (46 relation types):**
- PARENT, CHILD, FATHER, MOTHER, SON, DAUGHTER, SPOUSE
- SIBLING, OLDER_SIBLING, YOUNGER_SIBLING, BROTHER, SISTER, OLDER_BROTHER, OLDER_SISTER, YOUNGER_BROTHER, YOUNGER_SISTER
- GRANDPARENT, GRANDFATHER, GRANDMOTHER, GRANDCHILD, GRANDSON, GRANDDAUGHTER
- GREAT_GRANDPARENT, GREAT_GRANDCHILD
- PARENT_IN_LAW, FATHER_IN_LAW, MOTHER_IN_LAW, CHILD_IN_LAW, SON_IN_LAW, DAUGHTER_IN_LAW, SIBLING_IN_LAW
- STEP_PARENT, STEP_FATHER, STEP_MOTHER, STEP_CHILD, STEP_SIBLING
- ADOPTIVE_PARENT, ADOPTIVE_CHILD, GUARDIAN, WARD
- FRIEND, COLLEAGUE, MANAGER, SUBORDINATE, MENTOR, MENTEE

---

#### UpcomingEvent Table
```typescript
model UpcomingEvent {
  upcomingEventId    String    @id @default(uuid())
  personId           String    @db.Uuid
  upcomingEventTitle String
  relationId         String    @db.Uuid
  eventDate          DateTime  @db.Date

  person             Person    @relation(...)
  relation           Relation  @relation(...)
}
```

---

## Seeded Data Summary

| Table | Count | Notes |
|-------|-------|-------|
| **Gender** | 3 | Male, Female, Undisclosed |
| **MaritalStatus** | 4 | ms1, ms2, ms3, ms4 (Single, Married, Divorced, Undisclosed) |
| **Ethnicity** | 21 | Indonesian ethnic groups with standardized UUIDs |
| **City** | 99 | Major Indonesian cities + "Other" |
| **Job** | 21 | Common jobs + "Other" |
| **OrganizationLevel** | 2 | organization, individual |
| **Relation** | 46 | All family and social relations |
| **Access** | 3 | ac01, ac02, ac03 (menus) |
| **Users** | 3 | fardil.khalidi@gmail.com, attarasmawan@gmail.com, administrator@sevenrose.com |

---

## Migration Process

### What Was Done:

1. **Schema Update**: Updated `prisma/schema.prisma` with new structure
2. **Force Reset**: Used `prisma db push --force-reset` to drop and recreate all tables
3. **Client Generation**: Ran `prisma generate` to update Prisma Client
4. **Data Seeding**: Executed `prisma/seed.ts` to populate all tables

### Commands Run:
```bash
cd /home/tw-fardil/Documents/Fardil/Project/gf-be/gf-api

# Reset and push schema
pnpm prisma db push --force-reset --skip-generate

# Generate Prisma client
pnpm prisma generate

# Run seed
pnpm ts-node -T prisma/seed.ts
```

---

## Breaking Changes for Application Code

### ⚠️ DTOs and Services Need Updates

All references to `_code` fields in DTOs and services must be updated to use `_id` fields:

#### Before (Old):
```typescript
// DTO
export class PersonUpdateDto {
  genderCode?: string;
  birthPlaceCode?: string;
  jobCode?: string;
  ethnicityCode?: string;
  maritalStatus?: string;
}

// Service
await prisma.person.update({
  where: { personId },
  data: {
    genderCode: dto.genderCode,
    birthPlaceCode: dto.birthPlaceCode,
    // ...
  }
});
```

#### After (New):
```typescript
// DTO
export class PersonUpdateDto {
  genderId?: string;        // UUID
  cityId?: string;          // UUID (was birthPlaceId)
  jobId?: string;           // UUID
  ethnicityId?: string;     // UUID
  maritalStatusId?: string; // ms1, ms2, ms3, ms4
  isFree?: boolean;         // NEW
  organizationLevelId?: string; // NEW
}

// Service
await prisma.person.update({
  where: { personId },
  data: {
    genderId: dto.genderId,
    cityId: dto.cityId,
    jobId: dto.jobId,
    ethnicityId: dto.ethnicityId,
    maritalStatusId: dto.maritalStatusId,
    isFree: dto.isFree,
    organizationLevelId: dto.organizationLevelId,
  }
});
```

---

## Standardized UUIDs Reference

### Ethnicities (Fixed UUIDs):
```
11111111-1111-1111-1111-111111111111 → Jawa
22222222-2222-2222-2222-222222222222 → Sunda
33333333-3333-3333-3333-333333333333 → Betawi
44444444-4444-4444-4444-444444444444 → Batak
55555555-5555-5555-5555-555555555555 → Minangkabau
66666666-6666-6666-6666-666666666666 → Bugis
77777777-7777-7777-7777-777777777777 → Madura
88888888-8888-8888-8888-888888888888 → Banjar
99999999-9999-9999-9999-999999999999 → Bali
aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa → Aceh
bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb → Dayak
cccccccc-cccc-cccc-cccc-cccccccccccc → Makassar
dddddddd-dddd-dddd-dddd-dddddddddddd → Lampung
eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee → Palembang
ffffffff-ffff-ffff-ffff-ffffffffffff → Gorontalo
10101010-1010-1010-1010-101010101010 → Toraja
20202020-2020-2020-2020-202020202020 → Minahasa
30303030-3030-3030-3030-303030303030 → Nias
40404040-4040-4040-4040-404040404040 → Sasak
50505050-5050-5050-5050-505050505050 → Lainnya
60606060-6060-6060-6060-606060606060 → Tidak Disebutkan
```

### Genders (Fixed UUIDs):
```
a0000000-0000-0000-0000-000000000001 → Male
a0000000-0000-0000-0000-000000000002 → Female
a0000000-0000-0000-0000-000000000003 → Undisclosed
```

### Organization Levels (Fixed UUIDs):
```
00000000-0000-0000-0000-000000000001 → organization
00000000-0000-0000-0000-000000000002 → individual
```

---

## Next Steps

1. ✅ **Update DTOs** (`src/users/dto.ts`) to use `_id` fields
2. ✅ **Update UsersService** (`src/users/users.service.ts`) to work with new schema
3. ✅ **Update Controllers** to handle new fields (isFree, organizationLevelId)
4. ✅ **Add CRUD endpoints** for:
   - Relations
   - UpcomingEvents
   - OrganizationLevels (admin)
5. ✅ **Update frontend API documentation**
6. ✅ **Write tests** for new structure

---

## Verification

Run verification script to check schema:
```bash
pnpm ts-node -T scripts/verify-schema.ts
```

Expected output shows all tables with proper `_id` primary keys and seeded data.

---

## Files Modified

- ✅ `prisma/schema.prisma` - Complete restructure
- ✅ `prisma/seed.ts` - New seed with all data
- ✅ `scripts/verify-schema.ts` - Verification script
- ⚠️ `src/users/dto.ts` - **Needs update**
- ⚠️ `src/users/users.service.ts` - **Needs update**
- ⚠️ `src/users/users.controller.ts` - **Needs update**

---

**Status**: ✅ Database migration complete and verified. Service layer updates pending.
