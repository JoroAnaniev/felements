# Hartbeespoort Dam Monitoring Dashboard - Complete Recreation Prompt

## Overview
Build a comprehensive dam monitoring dashboard for Hartbeespoort Dam (South Africa) with buoy sensor data across 5 zones, real-time monitoring, advanced analytics, AI simulation, role-based access control, and a complete authentication system. The dashboard is called "Harties Action" with a custom logo used throughout.

---

## BRAND IDENTITY

### Logo & Branding
- Custom logo named "Harties Action" - use a professional water/dam monitoring themed logo
- Logo appears in: Login screen, Register screen, Sidebar header, Mobile header
- Primary brand colors: Deep forest green (#2d5016) with earth tones
- Professional, modern, sophisticated design language

### Color System
**Light Mode:**
- Background: Subtle gradient `linear-gradient(135deg, #f8fbf8 0%, #eef7ee 50%, #f2f9f2 100%)`
- Primary: `#2d5016` (deep green)
- Cards: White with glass effect `rgba(255, 255, 255, 0.95)` with backdrop blur
- Success: `#16a34a` with gradient `linear-gradient(135deg, #22c55e 0%, #16a34a 100%)`
- Warning: `#d97706` with gradient `linear-gradient(135deg, #f59e0b 0%, #d97706 100%)`
- Critical/Danger: `#dc2626` with gradient `linear-gradient(135deg, #ef4444 0%, #dc2626 100%)`

**Dark Mode:**
- Background: Dark gradient `linear-gradient(135deg, #0a1a0a 0%, #0f2e0f 50%, #0d1f0d 100%)`
- Primary: `#7ba05b` (lighter green for contrast)
- Cards: `rgba(26, 46, 26, 0.95)` with dark glass effect
- All other colors adjusted for dark mode visibility

### Typography
- Professional sans-serif font family
- Headings: Bold/Semibold weights with tight letter spacing
- Body: Regular weight, 1.6 line height
- Labels: Medium weight, slightly tracked

---

## DATA STRUCTURE

### Buoy Data
10 buoys positioned across Hartbeespoort Dam with the following structure:

```typescript
interface BuoyData {
  id: string;              // e.g., 'buoy-1'
  name: string;            // e.g., 'North Zone Alpha'
  zone: 'zone1' | 'zone2' | 'zone3' | 'zone4' | 'zone5';
  location: { x: number; y: number };  // Percentage-based (42-58% range)
  status: 'good' | 'warning' | 'critical';
  sensors: {
    tss: number;         // Total Suspended Solids (mg/L) - Normal: <3000, Warning: 3000-5000, Critical: >5000
    do: number;          // Dissolved Oxygen (mg/L) - Critical: <4.5, Warning: 4.5-6.0, Normal: >6.0
    phosphate: number;   // mg/L - Normal: <0.2, Warning: 0.2-0.3, Critical: >0.3
    ph: number;          // pH Level - Critical: <6.5 or >8.5, Warning: 6.5-6.8 or 8.2-8.5, Normal: 6.8-8.2
    temperature: number; // °C
  };
  lastUpdate: string;      // e.g., '2024-10-06 14:30'
  alerts: string[];        // Array of alert messages
}
```

### Initial 10 Buoys (exact positions preserved):
1. **buoy-1**: North Zone Alpha (Zone 1) - { x: 48.5, y: 42.0 } - Status: good
2. **buoy-2**: Central Monitor Beta (Zone 3) - { x: 52.0, y: 50.0 } - Status: warning
3. **buoy-3**: South Checkpoint (Zone 5) - { x: 46.0, y: 58.0 } - Status: good
4. **buoy-4**: West Inlet Gamma (Zone 4) - { x: 42.0, y: 52.0 } - Status: critical
5. **buoy-5**: Northeast Outpost (Zone 2) - { x: 56.0, y: 44.0 } - Status: good
6. **buoy-6**: Central East Delta (Zone 3) - { x: 54.0, y: 54.0 } - Status: warning
7. **buoy-7**: South Basin Echo (Zone 5) - { x: 50.0, y: 60.0 } - Status: good
8. **buoy-8**: North Inlet Primary (Zone 1) - { x: 44.0, y: 46.0 } - Status: good
9. **buoy-9**: West Central Zeta (Zone 4) - { x: 46.0, y: 48.0 } - Status: warning
10. **buoy-10**: Northeast Ridge (Zone 2) - { x: 58.0, y: 48.0 } - Status: good

### Zone Definitions
- **Zone 1 - North**: Northern inlet area (color: #4a7c59)
- **Zone 2 - Northeast**: Northeast ridge and monitoring area (color: #7ba05b)
- **Zone 3 - Central**: Central deep water monitoring (color: #9cb86f)
- **Zone 4 - West**: Western inlet and shallow areas (color: #5d8233)
- **Zone 5 - South**: Southern basin and outlet (color: #6a8a3a)

### Action Log Structure
```typescript
interface ActionLog {
  id: string;
  timestamp: string;
  user: string;
  action: string;
  buoyId: string;
  details: string;
  category: 'maintenance' | 'calibration' | 'inspection' | 'alert' | 'system';
}
```

---

## AUTHENTICATION & USER MANAGEMENT

### 1. Login Screen
- **Layout**: Full-screen centered card on gradient background
- **Elements**:
  - Harties Action logo at top
  - "Welcome Back" heading
  - Email input field with Mail icon
  - Password input field with Lock icon and toggle show/hide (Eye/EyeOff icons)
  - "Login" button (gradient-primary background)
  - "Continue as Guest" button (outline style)
  - "New user? Register here" link
- **Functionality**:
  - Mock authentication (any email/password works)
  - Auto-assign role based on email:
    - Contains 'admin': Admin role
    - Contains 'viewer': Viewer role  
    - Contains 'harties' or 'hartbeespoort': "Hartbeespoort Local Municipality" org + Viewer role
    - Default: Operator role, "Independent Organization"
  - Session saved to localStorage
  - Toast notification on successful login

### 2. Register Screen
- **Layout**: Full-screen centered card with step-by-step form
- **Form Fields**:
  - First Name (required)
  - Last Name (required)
  - Email (required, validated)
  - Organization dropdown: "Independent Organization", "Hartbeespoort Local Municipality", "Other"
  - Role dropdown: Admin, Operator, Viewer
    - **IMPORTANT**: If "Hartbeespoort Local Municipality" selected, role auto-locks to "Viewer" (disabled dropdown)
  - Password (required, min 8 characters, toggle visibility)
  - Confirm Password (must match)
- **Elements**:
  - Back button to return to login
  - "Register" button
  - "Continue as Guest" option
  - Harties Action logo
- **Validation**: Show inline error messages for invalid fields

### 3. Guest Mode
- **Access**: Limited read-only access
- **Restrictions**:
  - Cannot log actions
  - Cannot configure buoy positions
  - Cannot edit profile
  - See "Login for full access" prompts on restricted features
- **Banner**: Show persistent "Guest Mode" indicator in header

### 4. Session Persistence
- Save user session to localStorage
- Auto-restore on page refresh
- Include user data and guest mode flag
- Don't log out on page refresh

---

## ROLE-BASED ACCESS CONTROL (RBAC)

### Admin Role
- **Full access** to all features
- Can configure buoy positions (drag & drop)
- Can view and export all data
- Can log actions
- Can access advanced analytics

### Operator Role
- View all dashboard data
- Log actions and maintenance
- View analytics
- Cannot configure buoy positions
- Can export data

### Viewer Role
- **Read-only access**
- View dashboard and sensor data
- View reports and analytics
- **Cannot** log actions
- **Cannot** configure buoys
- **Cannot** export data
- Restricted: Show lock icons on disabled features

### Organization Restriction
- Users from "Hartbeespoort Local Municipality" are **always** Viewers
- Cannot change role during registration
- Role dropdown disabled with tooltip explaining restriction

---

## NAVIGATION & LAYOUT

### Sidebar (Desktop)
- **Header**: Harties Action logo + "Harties Action" text
- **Navigation Items**:
  - 🏠 Dashboard (default page)
  - 📊 Analytics (advanced charts)
  - 📝 Action Logging
  - 📄 Reports
  - 🗺️ Full Map View
  - 👤 Profile
- **Footer**:
  - User info card (avatar, name, role badge)
  - Dark mode toggle (Moon/Sun icons)
  - Logout button
- **Styling**: Glass effect background, primary green highlights on active items

### Mobile Header
- Hamburger menu icon
- Harties Action logo (center)
- User avatar (right)
- Drawer sidebar slides in from left

---

## PAGE 1: MAIN DASHBOARD

### Header Section
- **Title**: "Hartbeespoort Dam Monitoring"
- **Controls Row**:
  - Zone Filter Dropdown: "Overall View", "Zone 1 - North", "Zone 2 - Northeast", "Zone 3 - Central", "Zone 4 - West", "Zone 5 - South"
  - "Alerts Only" toggle button (shows only buoys with alerts)
  - "Configure Buoys" button (Admin only - opens BuoyPositionConfigurator modal)

### Status Overview Cards (4 cards in grid)
1. **Operational** - Count of good status buoys - Green gradient background, CheckCircle icon
2. **Warnings** - Count of warning status buoys - Orange gradient background, AlertTriangle icon
3. **Critical** - Count of critical status buoys - Red gradient background, AlertCircle icon
4. **Total Sensors** - Total filtered buoys - Blue gradient background, Activity icon

### Main Content (2-column layout on desktop, stacked on mobile)

#### Left Column (60% width)

**Dam Overview Map Card**
- **Header**: "Dam Overview Map" with Clock icon and "Auto-updating every 5 seconds"
- **Visual**: Stylized dam map with gradient blue water area
- **Buoys**: Rendered as circular markers with:
  - Pulse animation on hover
  - Color-coded by status (green/orange/red)
  - Positioned at exact x/y percentages
  - Click to select and show details
  - Selected buoy has larger size and ring animation
- **Controls Overlay** (top-right):
  - "Fullscreen" button (expands to full map page)
  - "Legend" button (shows/hides legend)
- **Map Features**:
  - Dam outline shape
  - Water gradient (light blue to darker blue)
  - Zone boundaries (subtle dotted lines)
  - Buoy labels on hover
  - Responsive sizing

**Legend Component** (collapsible panel)
- **Status Colors Section**:
  - 🟢 Operational: "All parameters within normal range"
  - 🟠 Warning: "One or more parameters elevated"
  - 🔴 Critical: "Immediate attention required"
- **Zone Descriptions**:
  - Each zone with color indicator and geographic description
- **Parameter Thresholds** (with tooltips):
  - TSS: mg/L ranges
  - DO: mg/L ranges
  - pH: acceptable ranges
  - Phosphate: mg/L ranges

#### Right Column (40% width)

**Recent Actions Panel** (if no buoy selected)
- List of 5 most recent action logs
- Each log shows:
  - Timestamp
  - User name with avatar
  - Action type badge (Maintenance/Calibration/Alert/etc)
  - Buoy name
  - Details text
- Category color coding
- "View All Logs" button (navigates to logging page)

**Sensor Details Panel** (when buoy selected)
- **Header**: Buoy name, status badge, zone badge
- **Sensor Readings Grid**:
  - TSS with Droplets icon
  - DO with Waves icon
  - pH with FlaskConical icon
  - Phosphate with TestTube icon
  - Temperature with Thermometer icon
- Each reading shows:
  - Current value
  - Unit of measurement
  - Status indicator (normal/warning/critical)
  - Small trend arrow (up/down/stable)
- **Active Alerts Section** (if any):
  - Red alert box with AlertTriangle icon
  - List of alert messages
- **Diagnostics Panel**:
  - "Probable Causes" section (based on sensor readings)
  - "Recommended Actions" section with priority badges
  - Smart analysis (e.g., "Low DO + High TSS = Algae bloom likely")
- **Quick Actions** (role-based):
  - "Log Maintenance" button (Admin/Operator only)
  - "View History" button
  - "Export Data" button (Admin/Operator only)
- **Close** button (X icon) - clears selection

---

## PAGE 2: ADVANCED ANALYTICS

### Header
- Title: "Advanced Analytics & Predictions"
- Subtitle: "AI-powered insights and trend analysis"
- Back to Dashboard button

### Tabs System
Four tabs: "Trends", "Predictive", "Comparative", "Spatial"

#### Tab 1: Trends
- **Water Quality Trend Chart**: Line chart showing TSS, DO, pH over time
- **Temperature Trends**: Area chart with temperature variations
- **Alert Frequency**: Bar chart showing alerts by day/week
- **Parameter Correlation**: Scatter plot showing relationships between parameters

#### Tab 2: Predictive
- **AI Insights Cards** (generated by simulation engine):
  - Each card shows:
    - Insight title
    - Confidence score (percentage)
    - Description
    - Predicted timeframe
    - Affected buoys
    - Recommended action badge (Immediate/Soon/Routine)
  - Color-coded by severity
- **Prediction Accuracy Indicator**: Shows confidence level
- **Future Trends Projection**: Line chart with projected values

#### Tab 3: Comparative
- **Zone Comparison**: Radar chart comparing all 5 zones on key parameters
- **Buoy Performance Table**: Sortable table comparing all 10 buoys
- **Best/Worst Performers**: Cards highlighting top and bottom performers
- **Threshold Compliance**: Progress bars showing how close each parameter is to thresholds

#### Tab 4: Spatial
- **Heatmap Overlays**: Show concentration of parameters across zones
- **Zone Performance Cards**: Grid of 5 cards, one per zone
- **Geographic Insights**: Identify patterns by location

### Key Metrics Banner (top of page)
- Average DO across all buoys
- Average pH
- Average TSS
- Total active alerts
- System health score (calculated)

---

## PAGE 3: ACTION LOGGING

### Header
- Title: "Action & Maintenance Logging"
- "New Action" button (opens logging modal - Admin/Operator only)

### Filters Row
- Date range picker
- User filter dropdown
- Category filter: All/Maintenance/Calibration/Inspection/Alert/System
- Buoy filter: All or specific buoy
- Search bar for details text

### Action Log Table
- **Columns**: Timestamp, User (with avatar), Action, Buoy, Category (badge), Details
- **Sorting**: Click column headers to sort
- **Pagination**: 20 items per page
- **Row Hover**: Highlight and show "View Details" button
- **Empty State**: "No actions logged yet" with illustration

### New Action Modal (Admin/Operator only)
- **Fields**:
  - Action type dropdown (Maintenance/Calibration/Inspection/Manual Check)
  - Select buoy (dropdown with search)
  - Details textarea (required)
  - User auto-filled (current logged-in user)
  - Timestamp auto-filled (current time)
- **Buttons**: "Log Action" (primary), "Cancel" (secondary)
- **Validation**: Ensure all required fields filled
- **Success**: Toast notification + close modal + refresh log list

### Restricted Access (Viewer/Guest)
- Show lock icon on "New Action" button
- Tooltip: "Viewers cannot log actions. Contact your administrator."
- Table is read-only

---

## PAGE 4: REPORTS

### Header
- Title: "Reports & Data Export"
- Time range selector: Last 7 days / Last 30 days / Last 90 days / Custom
- "Export Report" button (generates PDF - Admin/Operator only)

### Report Type Tabs
- Summary Report
- Detailed Analysis
- Compliance Report

#### Summary Report Tab
- **Water Quality Overview Card**:
  - Average values for all parameters
  - Comparison to previous period (% change with trend arrows)
  - Status pie chart (good/warning/critical distribution)
- **Zone Performance Grid**: 5 cards showing summary per zone
- **Alert Summary**: Total alerts, breakdown by severity
- **Most Active Buoys**: Top 3 buoys with most alerts

#### Detailed Analysis Tab
- **Water Quality Trends**: Line charts for each parameter over selected time range
- **Buoy Status History**: Timeline showing when each buoy changed status
- **Sensor Readings Table**: Sortable, filterable table with all readings
- **Statistical Summary**: Min/Max/Average/Median for each parameter

#### Compliance Report Tab
- **Threshold Compliance**: Show % of time each parameter was in normal range
- **SLA Metrics**: Uptime, response times (mock data)
- **Incident Log**: All critical alerts during period
- **Recommendations**: Automated recommendations based on data

### Export Functionality
- **Options Modal**:
  - Format: PDF / CSV / Excel
  - Include: All data / Summary only / Charts only
  - Date range confirmation
- **Action**: Show toast "Export generated successfully" (mock - no actual file)
- **Restriction**: Viewer/Guest see "Upgrade to export" message

---

## PAGE 5: FULLSCREEN MAP

### Layout
- **Full viewport map** (no sidebar, minimal header)
- **Minimal Header Bar**:
  - Harties Action logo (left)
  - "Fullscreen Map View" title (center)
  - Zone filter dropdown
  - Close button (returns to dashboard)
  - User avatar with dropdown

### Map Features
- All 10 buoys displayed at exact positions
- Larger buoy markers (more detail visible)
- Click buoy to open floating info panel
- Zone boundaries clearly marked with labels
- Legend always visible (bottom-left corner)
- **Admin Only**: "Configure Buoys" button opens drag-and-drop mode

### Floating Info Panel (when buoy selected)
- Appears next to selected buoy
- Shows: Buoy name, status, all sensor readings, alerts
- "View Full Details" button (navigates to dashboard with sensor selected)
- Close button

### Keyboard Navigation
- Arrow keys to cycle through buoys
- Escape to deselect
- Tab to navigate controls

---

## PAGE 6: PROFILE

### Layout
- Split screen: Left sidebar (30%) + Right content (70%)

### Left Sidebar
- Large user avatar (editable)
- User name
- Email
- Role badge
- Organization badge
- "Member since" date
- "Edit Profile" button

### Right Content

#### Personal Information Section
- **Fields** (editable):
  - First Name
  - Last Name
  - Email (read-only)
  - Phone number
  - Location
- **Save Changes** button
- **Cancel** button

#### Organization Section
- Organization name (read-only)
- Role (read-only)
- **For Hartbeespoort Local**: Badge showing "Viewer access only"

#### Account Settings Section
- **Dark Mode Toggle**: Switch with Moon/Sun icon
- **Notification Preferences** (mock checkboxes):
  - Email notifications for critical alerts
  - SMS notifications
  - Weekly summary reports
- **Language**: Dropdown (English selected, others disabled)

#### Security Section
- **Change Password** button (opens modal)
- **Two-Factor Authentication** toggle (mock)
- **Active Sessions**: Show current session info

#### Danger Zone
- **Delete Account** button (red, opens confirmation modal)

---

## SPECIAL FEATURES

### 1. Buoy Position Configurator (Admin Only)
- **Trigger**: "Configure Buoys" button in dashboard or fullscreen map
- **Modal/Overlay**: Full-screen drag-and-drop interface
- **Features**:
  - Dam map with all 10 buoys
  - Drag any buoy to new position
  - Visual grid overlay to help with positioning
  - Real-time coordinate display (x%, y%)
  - "Reset to Default" button
  - "Save Positions" button (saves to localStorage)
  - "Cancel" button (discards changes)
- **Constraints**: Buoys must stay within water area (42-58% range recommended)
- **Feedback**: Toast notification on save

### 2. Dark Mode
- Toggle in sidebar footer and profile page
- Persisted to localStorage
- Smooth transition animation
- All colors inverted appropriately
- Chart colors adjusted for contrast

### 3. AI Simulation Engine
- **Background Process**: Updates buoy data every 5 seconds
- **Simulates**:
  - Natural parameter variation (±15% randomness)
  - Gradual trends (increasing/decreasing over time)
  - Anomalies (sudden spikes/drops)
  - Correlated changes (e.g., high temp → low DO)
- **Generates Alerts**:
  - When parameters cross thresholds
  - Adds alert strings to buoy.alerts array
  - Updates buoy.status accordingly
- **Predictive Insights**:
  - Analyzes trends to predict future states
  - Generates insight objects with:
    - Title
    - Description
    - Confidence score
    - Timeframe
    - Affected buoys
    - Recommended actions
  - Displays in Analytics page
  - Shows toast notification for high-priority insights

### 4. Diagnostics Panel
- **Displayed in**: Sensor Details Panel when buoy selected
- **Probable Causes Section**:
  - Analyzes current sensor readings
  - Shows likely causes of issues
  - Examples:
    - Low DO + High TSS = "Possible algae bloom"
    - High pH + Low DO = "Photosynthetic activity"
    - High temp + Low DO = "Thermal stratification"
- **Recommended Actions Section**:
  - Lists 3-5 actionable recommendations
  - Priority badges: "Immediate", "Soon", "Routine"
  - Specific to detected issues
  - Examples:
    - "Deploy aeration system immediately"
    - "Schedule maintenance within 24 hours"
    - "Monitor trend - no action yet"

### 5. Legend with Tooltips
- **Status Colors**: Hover over each status for detailed explanation
- **Zones**: Hover over zone color for geographic description
- **Parameters**: Hover over parameter name for threshold details
- **Collapsible**: Show/Hide toggle
- **Persistent**: Stays visible in map view

### 6. Mobile Responsive Design
- **Breakpoints**:
  - Mobile: < 768px
  - Tablet: 768px - 1024px
  - Desktop: > 1024px
- **Mobile Adaptations**:
  - Hamburger menu with drawer sidebar
  - Stacked layout (no columns)
  - Simplified charts (fewer data points)
  - Touch-optimized buttons (min 44px tap targets)
  - Swipe gestures for navigation
  - Bottom navigation bar (optional)

### 7. Toast Notifications
- Use Sonner library (import from "sonner@2.0.3")
- **Types**:
  - Success: Green, CheckCircle icon
  - Error: Red, AlertCircle icon
  - Warning: Orange, AlertTriangle icon
  - Info: Blue, Info icon
- **Triggers**:
  - Login/Logout
  - Action logged
  - Settings saved
  - Buoy positions saved
  - Export initiated
  - AI prediction alerts
  - Dark mode toggled

---

## TECHNICAL IMPLEMENTATION

### Tech Stack
- **React** (TypeScript)
- **Tailwind CSS** (v4.0) for styling
- **Shadcn/UI** components from `/components/ui/`
- **Lucide React** for icons
- **Recharts** for data visualization
- **Motion (Framer Motion)** for animations
- **Sonner** for toast notifications
- **React Hook Form** for form validation

### State Management
- React useState for local component state
- Prop drilling for shared state
- localStorage for persistence:
  - User session
  - Dark mode preference
  - Buoy positions

### File Structure
```
/App.tsx                           // Main app with routing
/components/
  /MainDashboard.tsx              // Page 1
  /AdvancedAnalytics.tsx          // Page 2
  /ActionLogging.tsx              // Page 3
  /Reports.tsx                    // Page 4
  /FullscreenMap.tsx              // Page 5
  /ProfileScreen.tsx              // Page 6
  /LoginScreen.tsx                // Login page
  /RegisterScreen.tsx             // Register page
  /Sidebar.tsx                    // Desktop sidebar
  /MobileLayout.tsx               // Mobile layout wrapper
  /DamMap.tsx                     // Map component (reusable)
  /BuoyInfoPanel.tsx              // Buoy info card
  /BuoyPositionConfigurator.tsx   // Drag-drop configurator
  /Legend.tsx                     // Map legend
  /DiagnosticsPanel.tsx           // Diagnostics display
  /SensorDetailsPanel.tsx         // Full sensor details
  /RecentActionsPanel.tsx         // Action log display
  /SystemOverview.tsx             // Stats cards
  /DataSimulationEngine.tsx       // AI simulation logic
  /NotificationSystem.tsx         // Toast wrapper
  /ui/                            // Shadcn components
/styles/globals.css               // Global styles & design tokens
```

### Key Implementation Notes

1. **Buoy Positioning**:
   - Use percentage-based coordinates (x: 42-58%, y: 42-60%)
   - Calculate absolute position: `left: ${x}%`, `top: ${y}%`
   - Parent container must have `position: relative`
   - Use transforms for centering: `transform: translate(-50%, -50%)`

2. **Status Determination**:
   - Check all sensor values against thresholds
   - If ANY parameter is critical → status = 'critical'
   - Else if ANY parameter is warning → status = 'warning'
   - Else → status = 'good'
   - Update alerts array accordingly

3. **Zone Filtering**:
   - Filter buoys array by `buoy.zone === selectedZone`
   - If zone is 'overall', show all buoys
   - Update stats based on filtered buoys

4. **Role Checks**:
   ```typescript
   const isAdmin = currentUser?.role === 'Admin';
   const canLog = isAdmin || currentUser?.role === 'Operator';
   const isRestricted = currentUser?.role === 'Viewer' || isGuestMode;
   ```

5. **Simulation Loop**:
   - setInterval every 5000ms
   - Update each buoy's sensors with ±15% variation
   - Check thresholds after each update
   - Generate alerts if thresholds crossed
   - Emit predictive insights every 30 seconds

6. **Dark Mode Toggle**:
   ```typescript
   useEffect(() => {
     if (isDarkMode) {
       document.documentElement.classList.add('dark');
     } else {
       document.documentElement.classList.remove('dark');
     }
   }, [isDarkMode]);
   ```

7. **Session Persistence**:
   ```typescript
   // Save on login
   localStorage.setItem('user-session', JSON.stringify({ user, isGuest }));
   
   // Restore on mount
   useEffect(() => {
     const saved = localStorage.getItem('user-session');
     if (saved) {
       const { user, isGuest } = JSON.parse(saved);
       setCurrentUser(user);
       setIsGuestMode(isGuest);
       setCurrentPage('dashboard');
     }
   }, []);
   ```

---

## INTERACTIONS & ANIMATIONS

### Buoy Interactions
- **Hover**: Scale to 1.1, show pulsing ring, display name tooltip
- **Click**: Select buoy, scale to 1.2, show persistent ring, open details panel
- **Active**: Pulse animation (scale 0.95 ↔ 1.05 loop)

### Button Interactions
- **Hover**: Slightly darker background, subtle scale (1.02)
- **Click**: Quick press animation (scale 0.98)
- **Disabled**: Opacity 0.5, cursor not-allowed, no hover effect

### Card Animations
- **Enter**: Fade in + slide up (motion.div with initial/animate)
- **Hover**: Lift shadow (shadow-md → shadow-lg)
- **Exit**: Fade out (when filtering changes)

### Page Transitions
- **Navigation**: Fade out → Fade in (250ms duration)
- **Modal Open**: Scale from 0.95 → 1.0 + fade in
- **Modal Close**: Scale to 0.95 + fade out

### Chart Animations
- **Data Load**: Animate values from 0 to actual value (800ms)
- **Update**: Smooth transition between values (300ms)
- **Hover**: Highlight data point, show detailed tooltip

---

## ACCESSIBILITY

### Keyboard Navigation
- Tab through all interactive elements
- Enter/Space to activate buttons
- Escape to close modals/panels
- Arrow keys to navigate buoys (on map focus)

### Screen Reader Support
- Semantic HTML (header, nav, main, aside, article)
- ARIA labels on icon-only buttons
- ARIA live regions for dynamic updates
- Alt text on all images

### Color Contrast
- WCAG AA compliant (4.5:1 minimum)
- Status colors have sufficient contrast
- Dark mode maintains contrast ratios

### Touch Targets
- Minimum 44px height/width on mobile
- Adequate spacing between interactive elements

---

## TESTING SCENARIOS

### User Flows to Test
1. **Guest Mode**: Enter as guest → View dashboard → Try restricted feature → See lock message → Login
2. **Admin Flow**: Login as admin → Configure buoys → Drag to new positions → Save → Verify persistence
3. **Operator Flow**: Login as operator → Log maintenance action → View in action log
4. **Viewer Flow**: Login as viewer → Try to log action → See restriction → Export report → See restriction
5. **Hartbeespoort Local**: Register with "Hartbeespoort Local" org → Role auto-set to Viewer → Cannot change
6. **Dark Mode**: Toggle dark mode → Navigate all pages → Verify all elements visible → Refresh page → Mode persists
7. **Zone Filtering**: Select Zone 1 → See only Zone 1 buoys → Stats update → Select overall → All buoys return
8. **Alerts Only**: Toggle alerts → See only buoys with alerts → Toggle off → All return
9. **Buoy Selection**: Click buoy → Details panel opens → Auto-scroll → View diagnostics → Close panel
10. **Session Persistence**: Login → Refresh page → Still logged in → Navigate away → Return → Still logged in

---

## MOCK DATA NOTES

- All API calls are mocked (no real backend)
- Simulation engine generates realistic sensor variations
- Action logs are stored in component state (reset on refresh unless localStorage implemented)
- Export functions show toast but don't generate actual files
- User registration creates mock user objects (no database)

---

## FINAL CHECKLIST

Before considering complete, ensure:
- [ ] All 10 buoys render at exact specified coordinates
- [ ] All 6 pages fully implemented and accessible
- [ ] Login/Register/Guest mode all functional
- [ ] Role-based restrictions working correctly
- [ ] Dark mode toggle works on all pages
- [ ] Session persists on page refresh
- [ ] Buoy position configurator works for admins
- [ ] AI simulation updates data every 5 seconds
- [ ] Diagnostics panel shows for selected buoy
- [ ] Legend component displays correctly
- [ ] Zone filtering works
- [ ] Alerts-only filter works
- [ ] Mobile responsive (test at 375px, 768px, 1024px)
- [ ] All icons display correctly (Lucide React)
- [ ] Toast notifications appear for key actions
- [ ] Sidebar navigation works
- [ ] Profile page fully editable
- [ ] Hartbeespoort Local users locked to Viewer role
- [ ] All charts render with Recharts
- [ ] Analytics page shows all 4 tabs
- [ ] Reports page shows all 3 report types
- [ ] Action logging table functional
- [ ] Fullscreen map opens and closes
- [ ] No console errors
- [ ] Harties Action logo appears in all specified locations

---

## DESIGN GUIDELINES

### Spacing
- Use Tailwind's spacing scale: 4, 6, 8, 12, 16, 24 units most common
- Card padding: p-6 on desktop, p-4 on mobile
- Section gaps: gap-6 or gap-8
- Grid gaps: gap-4

### Border Radius
- Buttons: rounded-lg (8px)
- Cards: rounded-xl (12px)
- Modals: rounded-2xl (16px)
- Badges: rounded-full

### Shadows
- Cards: shadow-lg
- Modals: shadow-xl
- Hover states: shadow-xl transition
- Buoys: shadow-md with glow on hover

### Gradients
- Use CSS variables: gradient-primary, gradient-success, etc.
- Apply with Tailwind classes: `className="gradient-primary text-white"`

### Icons
- Standard size: w-5 h-5 (20px)
- Large icons: w-6 h-6 (24px)
- Metric card icons: w-8 h-8 (32px)
- Always include mr-2 when paired with text

---

## ADDITIONAL FEATURES (NICE TO HAVE)

If time permits, consider adding:
- [ ] Historical data viewer (calendar picker to see past states)
- [ ] Comparison mode (select 2 buoys to compare side-by-side)
- [ ] Notification center (bell icon with unread count)
- [ ] Favorite buoys (star to bookmark frequently monitored buoys)
- [ ] Custom alerts (user-defined threshold settings)
- [ ] Team management (admin can invite users, assign roles)
- [ ] Audit log (track who changed what and when)
- [ ] API documentation page (for future real API integration)
- [ ] Help/FAQ page with searchable content
- [ ] Keyboard shortcuts cheat sheet (? key to open)
- [ ] Data export scheduler (schedule automatic reports)
- [ ] Webhook integrations (send alerts to external systems)

---

## PROMPT SUMMARY

**This prompt describes a complete, production-ready dam monitoring dashboard with:**
- 10 precisely positioned sensor buoys across 5 zones
- Full authentication system (Login, Register, Guest mode)
- Role-based access control (Admin, Operator, Viewer)
- 6 fully functional pages (Dashboard, Analytics, Logging, Reports, Map, Profile)
- Real-time AI simulation engine updating sensor data
- Advanced diagnostics and predictive insights
- Drag-and-drop buoy repositioning for admins
- Dark mode with persistence
- Session persistence (no logout on refresh)
- Mobile-responsive design
- Professional glassmorphic UI with green/earth tones
- Comprehensive data visualization with charts and maps
- Action logging and export capabilities
- Organization-based restrictions (Hartbeespoort Local → Viewer only)

**All design tokens, color codes, component structures, data schemas, and interaction patterns are specified in detail for exact recreation.**
