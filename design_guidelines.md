# Design Guidelines: Studio Booking & Scheduling System

## Design Approach

**Selected Approach:** Design System (Material Design 3) + Productivity Tool References (Linear, Notion)

**Justification:** This is a data-intensive enterprise productivity tool where efficiency, clarity, and professional polish are paramount. Material Design 3 provides robust components for complex data interactions, while Linear and Notion offer modern patterns for clean enterprise UX.

**Core Principles:**
- Clarity over decoration
- Information hierarchy through typography and spacing
- Consistent, predictable interactions
- Professional, trustworthy aesthetic

---

## Typography System

**Font Family:** Inter (primary), SF Pro Display (fallback)
- **Display/Headers:** 600 weight, tight tracking
- **Body/Forms:** 400 weight, standard tracking  
- **Labels/Secondary:** 500 weight, wide tracking, uppercase for section headers

**Scale:**
- Page titles: text-3xl (30px)
- Section headers: text-xl (20px)
- Card titles: text-lg (18px)
- Body text: text-base (16px)
- Form labels: text-sm (14px)
- Helper text: text-xs (12px)

---

## Layout System

**Spacing Primitives:** Tailwind units of 2, 4, 6, 8, 12, 16
- Tight spacing: p-2, gap-2 (internal card elements)
- Standard spacing: p-4, gap-4 (most components)
- Section spacing: p-8, gap-8 (between major sections)
- Page margins: p-12, p-16 (outer containers)

**Grid System:**
- Main container: max-w-7xl with px-6
- Two-column dashboard: 40% calendar / 60% booking grid on desktop
- Form layouts: Two-column (grid-cols-2) with gap-6
- Master data tables: Single column full-width

---

## Component Library

### Navigation & Layout

**Top Menu Bar:**
- Fixed header with shadow-sm, h-14
- Left: Company logo + selected company name
- Center: Horizontal navigation (Operations, Masters, Reports, Utility, Windows)
- Right: User profile + logout
- Menu items: px-4, hover state with underline indicator

**Sidebar Navigation (for submenus):**
- w-64, fixed left panel for master data sections
- List items with icon + label, hover background transition
- Active state: border-l-4 accent indicator

### Dashboard Components

**Calendar Widget:**
- Modern calendar grid with rounded-lg border
- Selected date: filled accent background
- Today: border accent indicator
- Bookings: small dot indicators beneath dates
- Month navigation: arrow buttons at top

**Booking Grid/Table:**
- Striped rows (subtle background alternation)
- Sticky header row with shadow
- Sortable columns with arrow indicators
- Row hover: background highlight
- Action buttons: icon-only in last column
- Search bar: mb-4 with icon-left input

**Filters Section:**
- Horizontal layout with gap-4
- Checkbox for "Hide Canceled Bookings"
- Date range picker
- Status filter dropdown
- Grouped with border-b separator below

### Forms & Modals

**Booking Form Modal:**
- Centered overlay with backdrop blur
- Modal width: max-w-2xl
- Header: text-xl title + close button (top-right)
- Body: Scrollable form with py-6, px-8
- Two-column grid for date/time fields
- Single column for dropdowns and text areas
- Footer: Sticky with action buttons (right-aligned)

**Input Fields:**
- Label: text-sm, font-medium, mb-2
- Input: border rounded-lg, px-4, py-2.5, focus ring-2
- Helper text: text-xs, text-gray-600, mt-1
- Error state: border-red, helper text-red
- Disabled state: background-gray-100, cursor-not-allowed

**Time Pickers:**
- Inline format (HH:MM) with colon separator
- Spinner controls on focus
- Validation for 24-hour format

**Dropdowns:**
- Custom select with chevron-down icon
- Dropdown menu: shadow-lg, rounded-lg, max-h-60 with scroll
- Options: px-4, py-2, hover background
- Selected option: checkmark icon on right

### Data Display

**Master Data Cards:**
- Grid layout (grid-cols-3, gap-6) for room/customer/project cards
- Each card: border, rounded-lg, p-6, shadow-sm
- Card header with title + edit/delete icons
- Card body with key-value pairs
- Status indicator: small badge (rounded-full, px-3, py-1)

**Status Badges:**
- Tentative: neutral tone, border style
- Confirmed: success tone, filled
- Planning: warning tone, filled
- Completed: secondary tone, filled
- Canceled: error tone with strikethrough

**Conflict Indicator:**
- Warning banner above booking form when conflict detected
- Icon-left with exclamation triangle
- "Ignore Conflict" checkbox inline
- Background: warning subtle fill

### Buttons & Actions

**Primary Actions:**
- Solid filled, rounded-lg, px-6, py-2.5
- Used for: Add Booking, Save, Confirm

**Secondary Actions:**
- Outline style, rounded-lg, px-6, py-2.5
- Used for: Modify, Cancel, Export

**Destructive Actions:**
- Error tone, outline style
- Used for: Delete, Cancel Booking

**Icon Buttons:**
- Square with p-2, rounded-lg
- Hover background transition
- Used for: Edit, Delete in table rows

**Button Groups:**
- Joined with rounded corners only on ends
- No gap between buttons
- Used for: Report format selection (PDF/Excel)

### Reports Interface

**Report Generation Panel:**
- Form layout with report type selection (radio group)
- Date range inputs (from/to)
- Filter criteria (dropdowns)
- Preview area with table/chart sample
- Export buttons (PDF, Excel) at bottom

---

## Authentication Screen

**Login Layout:**
- Centered card: max-w-md, shadow-xl, rounded-2xl, p-8
- Logo/branding at top (mb-8)
- Vertical form fields with gap-6
- Company dropdown with icon
- Auto-filled date (read-only, subtle background)
- Full-width login button at bottom
- Clean, minimal design with ample whitespace

---

## Icons

**Library:** Heroicons (outline for most UI, solid for filled states)
**CDN:** Latest version via unpkg

**Icon Usage:**
- Navigation: 20px (w-5, h-5)
- Form fields: 16px (w-4, h-4) 
- Action buttons: 18px (w-4.5, h-4.5)
- Status indicators: 14px (w-3.5, h-3.5)

---

## Visual Treatment

**Elevation System:**
- Cards: shadow-sm
- Modals: shadow-xl
- Dropdowns: shadow-lg
- Hover states: shadow-md transition

**Borders:**
- Default: 1px solid, subtle gray
- Focus: 2px ring with accent
- Dividers: border-b with lighter gray

**Corners:**
- Small components: rounded-lg (8px)
- Cards/modals: rounded-xl (12px)
- Buttons: rounded-lg (8px)
- Inputs: rounded-lg (8px)

**Spacing Consistency:**
- Section padding: py-8
- Card padding: p-6
- Form field gaps: gap-6
- Button padding: px-6, py-2.5

---

## Images

No images required for this enterprise application. Focus on clean data presentation, icons for visual hierarchy, and consistent component design.