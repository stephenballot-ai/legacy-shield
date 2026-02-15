# 🛡️ LegacyShield UAT Protocols

## 1. Core Authentication & Account Management
*Goal: Verify users can securely enter and manage their account.*

| Step | Action | Expected Result | Status |
| :--- | :--- | :--- | :--- |
| **1.1** | **Sign Up** (New User) <br> Go to `/register`, enter valid email & strong password (>12 chars). | Account created. User redirected to Dashboard. "Verification email sent" toast (if applicable). | [ ] |
| **1.2** | **Login** <br> Go to `/login`, enter credentials. | Success. Redirect to Dashboard. Session is active. | [ ] |
| **1.3** | **Login (Wrong Password)** <br> Enter correct email, wrong password. | Error: "Invalid email or password". No specific detail on which failed. | [ ] |
| **1.4** | **Logout** <br> Click profile → "Sign out". | Session cleared. Redirected to `/login`. Back button shouldn't work. | [ ] |
| **1.5** | **Change Password** <br> Settings → Security → Change Password. | Success. Old password no longer works. New password works immediately. | [ ] |
| **1.6** | **2FA Setup (Optional)** <br> Settings → Security → Enable 2FA. Scan QR with authenticator app. | Setup complete. Recovery codes displayed (SAVE THESE). | [ ] |
| **1.7** | **Login with 2FA** <br> Logout, then Login again. | Prompts for 2FA code after password. Correct code logs you in. | [ ] |

## 2. Document Vault (The Core Product)
*Goal: Verify zero-knowledge encryption and file management.*

| Step | Action | Expected Result | Status |
| :--- | :--- | :--- | :--- |
| **2.1** | **Upload Document** <br> Dashboard → Upload. Select a PDF/JPG. Add tags/category. | Upload progress bar shows encryption → upload. File appears in list. | [ ] |
| **2.2** | **Preview File** <br> Click a file in the list. | **Client-side decryption** happens (loading spinner). File opens in preview modal. Content is readable. | [ ] |
| **2.3** | **Download File** <br> Click "Download" from preview or list action menu. | File downloads with correct filename and extension. File opens correctly locally. | [ ] |
| **2.4** | **Verify Encryption** <br> *Technical Check:* Inspect Network tab during upload. | Request payload to `/api/v1/files/upload` contains encrypted blob, **not** plaintext file. | [ ] |
| **2.5** | **Delete File** <br> Action menu → Delete. | File removed from UI immediately. (Verify in DB/Storage if possible: marked deleted or gone). | [ ] |
| **2.6** | **Search/Filter** <br> Use search bar or filter by Category/Tag. | List updates instantly. Correct files shown. Clearing filter shows all. | [ ] |

## 3. Emergency Access (The "Legacy" Part)
*Goal: Verify the "Dead Man's Switch" functionality.*

| Step | Action | Expected Result | Status |
| :--- | :--- | :--- | :--- |
| **3.1** | **Setup Emergency Access** <br> Emergency Access tab → Start Setup. | Wizard opens. | [ ] |
| **3.2** | **Create Unlock Phrase** <br> Enter a memorable phrase (e.g., "blue-ocean-sunset-2026"). | Phrase accepted. Key derivation starts (cpu intensive). | [ ] |
| **3.3** | **Re-encrypt Files** <br> Continue wizard. | Progress bar shows files being re-keyed for emergency access. Success message. | [ ] |
| **3.4** | **Add Trusted Contact** <br> Enter Name & Email of a trusted person (use a secondary email of yours). | Contact added to list. They receive an email (if email integration active) or you see "Email sent". | [ ] |
| **3.5** | **Emergency Portal Login** <br> **Incognito Window:** Go to `/emergency-portal`. Enter Owner Email + Unlock Phrase. | Access granted. **Read-only** view of the vault appears. | [ ] |
| **3.6** | **Emergency Download** <br> (In Emergency Portal) Click to download a file. | File decrypts and downloads correctly using the emergency key. | [ ] |
| **3.7** | **Rotate Keys** <br> (Owner Dashboard) Emergency Access → Rotate Key. Enter new phrase. | Old phrase invalidated. New phrase works. Contacts notified (if implemented). | [ ] |

## 4. Referrals & Growth
*Goal: Verify the viral loop.*

| Step | Action | Expected Result | Status |
| :--- | :--- | :--- | :--- |
| **4.1** | **View Referral Code** <br> Settings → Referrals (or Dashboard banner). | Unique code displayed (e.g., `REF123`). "Share" copy available. | [ ] |
| **4.2** | **Simulate Referral** <br> New Incognito window. Go to `/r/[CODE]`. Sign up. | New account created. | [ ] |
| **4.3** | **Verify Bonus** <br> (Owner Account) Check Dashboard/Settings. | Referral count increased. Storage limit increased (e.g., +7 docs). | [ ] |

## 5. System & Resilience
*Goal: Verify application robustness.*

| Step | Action | Expected Result | Status |
| :--- | :--- | :--- | :--- |
| **5.1** | **Session Timeout** <br> Wait 15 mins (or manually clear token cookie). Refresh page. | Redirected to login. "Session expired" message. | [ ] |
| **5.2** | **Network Offline** <br> Load Dashboard, turn off WiFi, try to navigate/upload. | Graceful error message ("No internet connection" or similar). No app crash. | [ ] |
| **5.3** | **Concurrent Sessions** <br> Login on Phone and Laptop simultaneously. | Both work. Upload on one reflects on the other (after refresh). | [ ] |
