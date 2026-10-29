# CampusCoins Mobile Application (React Native & Expo)

A full-fledged cross-platform mobile application for **CampusCoins** — allowing college students to report infrastructure issues, track resolutions in real-time, earn CampusCoins bounties, climb campus leaderboards, and redeem exciting rewards.

---

## 📱 Features

1. **Quick Mobile Authentication & Demo Switcher**
   - Supabase email/password authentication with college email validation.
   - One-tap quick demo profile switcher (Student: Alex Rivera, Staff: David Vance, Admin: Dr. Eleanor Vance).
   - Auto-detects whether the backend is online or offline.

2. **Student Dashboard & Campus Activity**
   - Live CampusCoins balance pill with animated CC rewards indicator.
   - Quick report hero card.
   - Real-time campus metrics (My Reports, Resolved, Campus Rank).
   - Quick action shortcuts (Store, Ranks, Missions, Wallet).
   - Recent campus maintenance activity with live status pills and upvoting.

3. **Issue Reporting with Location Cascading**
   - Report issues with photo attachments and priority tags (Low, Medium, High, Emergency).
   - Category selector: Infrastructure, Electrical, Sanitation, Lab Equipment, WiFi/Network, Furniture.
   - Location selectors: Building, Floor, Room number/landmark.
   - Instant coin reward feedback upon reporting.

4. **Detailed Issue Tracker & Timeline**
   - Complete 4-step progress timeline: *Submitted* ➔ *Assigned to Facilities* ➔ *Technician Dispatched* ➔ *Resolved & Verified*.
   - Student community upvoting system with live counters.
   - User resolution confirmation button.

5. **Campus Rewards Store & Voucher System**
   - Clean dark-gold styled wallet balance banner.
   - Catalog categories: Food & Drinks (Cafeteria Snack Combos), Stationery (Printing Credits), Facility Perks (Library Study Pod Passes), College Merchandise (CampusCoins Hoodies).
   - Instant coin redemption with unique generated voucher codes (`CC-RED-XXXXXX`).
   - "My Vouchers" redemption history tab.

6. **Campus Leaderboard & Podium**
   - Top 3 student podium with Gold (#1), Silver (#2), and Bronze (#3) crowns/medals.
   - Complete campus rankings list with department and coins count.
   - Highlighted user position.

7. **Daily Quests & Missions**
   - Active streaks tracker (e.g. 3-day active streak 🔥).
   - Interactive progress bars with "+CC" claim buttons.
   - Campus badges showcase (Campus Pioneer, Eagle Eye, Green Sentinel, Campus Hero).

8. **Digital Student ID & Server Configuration**
   - Dark modern student ID card with roll number, department, and active status.
   - Dynamic Server IP config (allows testing on physical Android/iPhone over Wi-Fi).

---

## 🚀 How to Run the Mobile App

### 1. Start the Backend (if not already running)
```bash
npm run dev:backend
```
*Backend runs on `http://localhost:5000`*

### 2. Start the Mobile App
From the root directory:
```bash
npm run dev:mobile
```
Or inside the `mobile` directory:
```bash
cd mobile
npm start
```

### 3. Open on Your Phone or Emulator

- **Physical Android or iPhone (Recommended)**:
  1. Install the free **Expo Go** app from Google Play Store or Apple App Store.
  2. Make sure your phone and laptop are connected to the **same Wi-Fi network**.
  3. Scan the QR code shown in your terminal with Expo Go (on Android) or Camera app (on iOS).
  4. In the app profile screen, verify the server IP is set to `http://<your-laptop-ip>:5000`.

- **Web Browser**:
  ```bash
  cd mobile
  npm run web
  ```

- **Android Emulator**:
  ```bash
  cd mobile
  npm run android
  ```

---

## 🛠️ Tech Stack

- **Framework**: React Native 0.88 + Expo SDK 58
- **Navigation**: React Navigation 7 (Native Stack + Bottom Tabs)
- **Icons**: Expo Vector Icons (Ionicons)
- **Networking**: Axios (with base URL resolver & Supabase JWT / mock auth interceptor)
- **State & Storage**: React Context + `@react-native-async-storage/async-storage`
- **Backend Compatibility**: Connects directly to the CampusCoins Node.js/Express + Supabase PostgreSQL backend.

