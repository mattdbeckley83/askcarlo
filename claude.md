# Yonderlust Beta - Project Context

## Project Overview

Yonderlust is an AI-powered backpacking trip planning application that helps users manage gear, plan trips, and get personalized recommendations through Carlo, an AI assistant.

**Status:** Fresh rebuild on new template (beta.yonderlust.app)
**Previous version:** alpha.yonderlust.app (reference for features, not code)

## Core Philosophy

**MVP-First Approach:**
- Start simple, add complexity based on user feedback
- Single gear list per user (no multi-list complexity yet)
- User-controlled analytics flags (matches LighterPack UX)
- Clean schema that can evolve

**Key Principle:** Build what users ask for, not what we assume they need.

## Tech Stack

**Frontend:**
- Next.js 15+ (App Router)
- React 19
- Tailwind CSS
- Template: ThemeForest Next.js starter

**Backend:**
- Supabase (PostgreSQL + Row Level Security)
- Clerk (Authentication)

**AI:**
- Anthropic Claude API (Sonnet 4)
- Perplexity AI (web search enrichment)

## Database Schema

### Core Tables

#### users
```sql
- id (uuid, primary key) - from Clerk
- email (text)
- first_name (text, nullable)
- last_name (text, nullable)
- has_added_gear (boolean, default false)
- first_gear_added_at (timestamp, nullable)
- has_added_trip (boolean, default false)
- first_trip_added_at (timestamp, nullable)
- has_used_carlo_chat (boolean, default false)
- first_carlo_chat_at (timestamp, nullable)
- has_completed_profile (boolean, default false)
- profile_completed_at (timestamp, nullable)
- onboarding_completed (boolean, default false)
- created_at (timestamp)
- updated_at (timestamp)
```

#### activities
```sql
- id (uuid, primary key)
- name (text) - "Backpacking", "Hiking", etc.
- description (text, nullable)
- created_at (timestamp)
```

**Seeded values:**
- Backpacking
- Hiking
- Mountaineering
- Camping
- Thru-Hiking
- Ultralight
- Wilderness
- Section Hiking
- Winter
- Urban

#### item_types
```sql
- id (uuid, primary key)
- name (text) - "gear", "food", "fuel", "water"
- description (text, nullable)
- created_at (timestamp)
```

**Seeded values:** gear, food, fuel, water

#### categories
```sql
- id (uuid, primary key)
- name (text) - "Shelter", "Sleep", "Cooking", etc.
- color (text) - hex color for UI
- created_at (timestamp)
```

**Note:** Categories are NOT linked to item_types. Users assign both manually.

**Seeded values:** Shelter, Sleep, Cooking, Water, Clothing, Footwear, Backpack, Electronics, Food Storage, Misc, Breakfast, Lunch, Dinner, Snacks, Canister Fuel, Liquid Fuel, Alcohol Fuel

#### items
```sql
- id (uuid, primary key)
- user_id (uuid, foreign key → users)
- item_type_id (uuid, foreign key → item_types)
- category_id (uuid, foreign key → categories, nullable)
- name (text)
- brand (text, nullable)
- weight (numeric, nullable)
- weight_unit (text) - "lb", "oz", "g", "kg"
- description (text, nullable)
- product_url (text, nullable)
- calories (integer, nullable) - for food items
- servings (numeric, nullable) - for food items
- created_at (timestamp)
- updated_at (timestamp)
```

**Key decisions:**
- Single table for all items (gear, food, fuel, water)
- Type determined by item_type_id
- No item_lists table - all users have one master list (MVP)

#### trips
```sql
- id (uuid, primary key)
- user_id (uuid, foreign key → users)
- activity_id (uuid, foreign key → activities, nullable)
- name (text)
- start_date (date, nullable)
- end_date (date, nullable)
- notes (text, nullable)
- created_at (timestamp)
- updated_at (timestamp)
```

#### trip_items
```sql
- id (uuid, primary key)
- trip_id (uuid, foreign key → trips, on delete cascade)
- item_id (uuid, foreign key → items)
- quantity (integer, default 1)
- is_worn (boolean, default false)
- is_consumable (boolean, default false)
- created_at (timestamp)
```

**Critical:** No weight snapshot. Changes to item weight affect ALL trips retroactively (by design for MVP).

#### conversations
```sql
- id (uuid, primary key)
- user_id (uuid, foreign key → users)
- title (text, nullable) - auto-generated
- template (text, nullable) - "upgrade_gear", "compare_gear", null
- created_at (timestamp)
- updated_at (timestamp)
```

#### conversation_messages
```sql
- id (uuid, primary key)
- conversation_id (uuid, foreign key → conversations, on delete cascade)
- role (text) - "user" or "assistant"
- content (text)
- created_at (timestamp)
```

## Analytics Logic

**Simple, user-controlled (matches LighterPack):**
```javascript
Total Weight = SUM(item.weight × trip_item.quantity)
Consumable Weight = SUM(item.weight × trip_item.quantity) WHERE trip_item.is_consumable = true
Worn Weight = SUM(item.weight × trip_item.quantity) WHERE trip_item.is_worn = true
Base Weight = Total Weight - Consumable Weight - Worn Weight
```

**Key points:**
- User controls is_consumable and is_worn flags
- Users can make mistakes (mark tent as consumable)
- This is intentional - matches industry standard (LighterPack)
- Users learn quickly from seeing analytics

## Authentication & Authorization

**Clerk Integration:**
- Handles all authentication (email, OAuth)
- User ID synced to Supabase users table
- Clerk metadata stores subscription tier: `planType: "free" | "pro"`

**Row Level Security (RLS):**
- All user data tables: Users can only access their own data
- Reference tables (activities, item_types, categories): Public read for authenticated users

## Feature Priorities

### Phase 1 (Current - MVP)
1. ✅ Database setup
2. Clerk authentication
3. Gear management (single list)
4. Trip planning
5. Basic analytics (total/base/worn/consumable weight)
6. Carlo AI assistant (basic chat)

### Phase 2 (User-Driven)
- Multi-list support (if users request)
- Advanced Carlo templates (upgrade gear, compare gear)
- Food pantry
- Import from LighterPack

### Phase 3 (Future)
- Weight snapshots for trips
- Advanced analytics
- Mobile app

## Code Standards

**File Organization:**
```
/app/(auth-pages)     - Clerk auth pages
/app/(protected)      - Authenticated pages
/app/api              - API routes
/components/ui        - Reusable UI components
/components/features  - Feature-specific components
/lib                  - Utilities (supabase, helpers)
```

**Naming Conventions:**
- Components: PascalCase (`GearList.jsx`)
- Utilities: camelCase (`calculateWeight.js`)
- API routes: kebab-case folders

**Data Fetching:**
- Use Supabase client directly in components
- Server components where possible
- Client components only when needed (forms, interactions)

**Error Handling:**
- Always wrap Supabase calls in try/catch
- Show user-friendly error messages
- Log errors for debugging

## Environment Variables
```
NEXT_PUBLIC_SUPABASE_URL=https://[project].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[anon_key]
SUPABASE_SERVICE_ROLE_KEY=[service_key]
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=[clerk_key]
CLERK_SECRET_KEY=[clerk_secret]
```

## Testing Strategy

**Manual testing focus (MVP):**
- Test all CRUD operations for gear/trips
- Verify RLS policies work correctly
- Test analytics calculations
- Verify Clerk auth flow

## Common Pitfalls to Avoid

1. **Over-engineering:** Don't add features users haven't requested
2. **Schema complexity:** Keep tables simple, add complexity only when needed
3. **Premature optimization:** Build for current users, not theoretical scale
4. **Ignoring alpha:** Reference alpha.yonderlust.app for UX patterns that work

## Reference Links

- Alpha app (feature reference): https://alpha.yonderlust.app
- Supabase project: https://supabase.com/dashboard/project/hjgtrlosyxursmzfkliz
- Vercel deployment: https://beta.yonderlust.app

## Current Status

**Completed:**
- ✅ Database schema created
- ✅ Tables seeded with reference data
- ✅ RLS policies configured
- ✅ Environment variables set in Vercel

**Next steps:**
1. Install Supabase + Clerk dependencies
2. Configure authentication
3. Build gear management features
4. Build trip planning features
5. Integrate Carlo AI assistant

---

*Last updated: December 2025*
