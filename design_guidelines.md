# SDCI Chat - Mobile Design Guidelines

## Architecture Decisions

### Authentication
**Auth Required** - The app requires full user account management with backend sync.

**Implementation:**
- Use SSO (Apple Sign-In for iOS, Google Sign-In for Android)
- Include email/password as fallback option
- Auth screens:
  - **Welcome Screen**: Logo, app tagline, "Sign in with Apple/Google" buttons, "Continue with Email" option
  - **Email Sign-In/Sign-Up Screen**: Email field, password field, "Forgot Password" link, toggle between sign-in/sign-up
  - Privacy policy & terms of service links (footer)
- **Profile Screen** includes:
  - Username (unique, searchable)
  - Display name
  - User avatar (system-generated or custom)
  - Bio (optional, 120 characters)
  - Account settings with "Log Out" and nested "Delete Account" (Settings > Account > Delete with double confirmation)

### Navigation Architecture
**Root Navigation: Tab Bar (4 tabs) + Floating Action Button**

**Tab Structure:**
1. **General** (globe icon) - General public chat
2. **Friends** (users icon) - Friends list & requests
3. **Messages** (message-circle icon) - DMs and group chats
4. **Profile** (user icon) - User profile & settings

**Floating Action Button (FAB):**
- Position: Bottom-right, above tab bar
- Action: "New Message" - opens modal to select friends for DM or create group
- Icon: edit or plus icon
- Visible on: Messages tab only

**Modal Screens (outside tab navigation):**
- User Search
- Friend Profile View
- Chat Screen (DM)
- Group Chat Screen
- Create Group
- Group Settings

## Screen Specifications

### 1. General Chat Screen
**Purpose:** Public chat channel for all users

**Layout:**
- **Header**: Custom transparent header
  - Title: "General Chat"
  - Right button: info icon (opens channel info modal)
  - Top inset: headerHeight + Spacing.xl
- **Main Content**: Scrollable message list (inverted FlatList)
  - Message bubbles with author names
  - Timestamps (relative, e.g., "2m ago")
  - System messages for user joins (subtle, gray)
- **Footer**: Message input bar (fixed at bottom)
  - Text input field (expandable, max 4 lines)
  - Send button (icon)
  - Bottom inset: tabBarHeight + Spacing.xl
- **Safe Area**: Top: headerHeight + Spacing.xl, Bottom: tabBarHeight + Spacing.xl

### 2. Friends Screen
**Purpose:** Manage friend list and requests

**Layout:**
- **Header**: Custom transparent header
  - Title: "Friends"
  - Right button: user-plus icon (opens User Search)
  - Top inset: headerHeight + Spacing.xl
- **Main Content**: Scrollable with sections
  - **Friend Requests Section** (if any):
    - Badge count on section header
    - List of request cards (accept/decline buttons)
  - **Friends List Section**:
    - Searchable list of friends
    - Each row: avatar, display name, online status indicator
    - Tap to view friend profile
- **Safe Area**: Top: headerHeight + Spacing.xl, Bottom: tabBarHeight + Spacing.xl

### 3. Messages Screen
**Purpose:** Access all DMs and group chats

**Layout:**
- **Header**: Custom transparent header
  - Title: "Messages"
  - Right button: search icon (filter conversations)
  - Top inset: headerHeight + Spacing.xl
- **Main Content**: Scrollable list of conversations
  - Each row: avatar/group icon, conversation name, last message preview, unread badge, timestamp
  - Swipe actions: pin, mute, delete
  - Empty state: "No messages yet" with illustration
- **FAB**: Bottom-right, "New Message" (edit icon)
  - Shadow: offset (0, 2), opacity 0.10, radius 2
- **Safe Area**: Top: headerHeight + Spacing.xl, Bottom: tabBarHeight + Spacing.xl + 72 (FAB clearance)

### 4. Profile Screen
**Purpose:** User profile and app settings

**Layout:**
- **Header**: Custom transparent header
  - Title: "Profile"
  - Right button: settings icon
  - Top inset: headerHeight + Spacing.xl
- **Main Content**: Scrollable form
  - Avatar (large, centered, tappable to change)
  - Display name field (inline edit)
  - Username (read-only, @username format)
  - Bio field (multiline, 120 char limit)
  - Settings sections:
    - **Notifications** (toggle switches)
    - **Privacy** (block list, visibility settings)
    - **About** (version, support links)
    - **Account** (log out, delete account)
- **Safe Area**: Top: headerHeight + Spacing.xl, Bottom: tabBarHeight + Spacing.xl

### 5. Chat Screen (Modal)
**Purpose:** One-on-one or group messaging

**Layout:**
- **Header**: Default navigation header (opaque)
  - Left: back button
  - Center: Friend name/Group name + online status or member count
  - Right: info icon (opens chat info)
- **Main Content**: Scrollable message list (inverted FlatList)
  - Message bubbles (sender vs. receiver styling)
  - Read receipts (checkmarks)
  - Typing indicators
- **Footer**: Message input bar
  - Text input (expandable)
  - Attachment button (optional, Phase 2)
  - Send button
  - Bottom inset: insets.bottom + Spacing.xl
- **Safe Area**: Top: Spacing.xl, Bottom: insets.bottom + Spacing.xl

### 6. User Search Screen (Modal)
**Purpose:** Find users by username to send friend requests

**Layout:**
- **Header**: Default navigation header with search bar
  - Left: cancel button
  - Center: search input field
- **Main Content**: List of search results
  - Each row: avatar, display name, username, "Add Friend" button
  - Empty state: "No users found"
- **Safe Area**: Top: Spacing.xl, Bottom: insets.bottom + Spacing.xl

### 7. Create Group Screen (Modal)
**Purpose:** Select friends and name a group chat

**Layout:**
- **Header**: Default navigation header
  - Left: cancel button
  - Title: "New Group"
  - Right: "Create" button (disabled until valid)
- **Main Content**: Scrollable form
  - Group name field (required)
  - Selected members chips (horizontally scrollable)
  - Friend selection list (checkboxes)
- **Safe Area**: Top: Spacing.xl, Bottom: insets.bottom + Spacing.xl

## Design System

### Color Palette
**Primary Color:** #5B7FFF (vibrant blue - trust, communication)
**Secondary Color:** #7C3AED (purple accent - energy, creativity)

**Neutrals:**
- Background: #FFFFFF (light mode), #000000 (dark mode)
- Surface: #F7F8FA (light), #1C1C1E (dark)
- Border: #E5E7EB (light), #38383A (dark)
- Text Primary: #1F2937 (light), #FFFFFF (dark)
- Text Secondary: #6B7280 (light), #98989D (dark)

**Semantic:**
- Success: #10B981 (friend request accepted, online status)
- Error: #EF4444 (delete, decline)
- Warning: #F59E0B (notification badge)

**Message Bubbles:**
- Sent: Primary color (#5B7FFF) with white text
- Received: Surface color with primary text
- System: Border color with secondary text

### Typography
**Font Family:** System default (SF Pro for iOS, Roboto for Android)

**Scales:**
- Header Large: 34pt, Bold (screen titles)
- Header: 28pt, Semibold (modal titles)
- Title: 20pt, Semibold (section headers)
- Body: 17pt, Regular (message content, list items)
- Subhead: 15pt, Regular (timestamps, secondary info)
- Caption: 13pt, Regular (helper text)

### Spacing
- xs: 4px
- sm: 8px
- md: 12px
- lg: 16px
- xl: 24px
- 2xl: 32px

### Component Specifications

**Message Bubble:**
- Padding: Spacing.md (horizontal), Spacing.sm (vertical)
- Border radius: 18px
- Max width: 75% of screen width
- Sent messages: align right
- Received messages: align left with sender name above

**Friend Request Card:**
- Background: Surface color
- Border radius: 12px
- Padding: Spacing.lg
- Accept button: Primary color, rounded
- Decline button: Text-only, error color

**Conversation Row:**
- Height: 72px
- Avatar: 48px circle
- Unread badge: circle, warning color, white number
- Pressed state: background tint (5% primary color)

**FAB:**
- Size: 56x56px
- Border radius: 28px (circle)
- Background: Primary color
- Icon: white, 24px
- Shadow: offset (0, 2), opacity 0.10, radius 2
- Pressed state: scale 0.95

**Search Bar:**
- Height: 36px
- Border radius: 10px
- Background: Surface color
- Icon: Secondary text color
- Pressed state: border color tint

### Interaction Design
- **All touchable elements:** Scale to 0.97 on press or background tint
- **Swipe actions:** Reveal at 60px swipe, snap at 120px
- **Pull to refresh:** Standard iOS/Android behavior on message lists
- **Typing indicator:** Animated ellipsis in received message bubble position
- **Haptic feedback:** Light impact on friend request sent, message sent, important actions

### Accessibility
- Minimum touch target: 44x44px
- Color contrast ratio: 4.5:1 for body text, 3:1 for large text
- VoiceOver labels for all interactive elements
- Support for Dynamic Type (text scaling)
- Keyboard navigation for text inputs
- Screen reader announcements for new messages

### Required Assets
1. **App Icon** - Stylized chat bubble with "SC" monogram
2. **Empty State Illustrations** (simple line art):
   - No messages yet (envelope icon)
   - No friends yet (users icon)
   - Search no results (magnifying glass icon)
3. **Default Avatars** (6 preset geometric patterns in primary/secondary colors):
   - Circle gradient
   - Square grid
   - Triangle mosaic
   - Wave pattern
   - Dots array
   - Stripe diagonal

All icons use Feather icon set from @expo/vector-icons. No emojis in UI.