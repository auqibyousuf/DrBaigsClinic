# Authentication Guide - How CMS_AUTH_TOKEN Works

## 🔐 How Authentication Works

The CMS uses a **two-step authentication system**:

1. **Password Login** → You enter your password
2. **Token Cookie** → Server gives you a secret token cookie
3. **Token Verification** → Every API request checks if you have the correct token

## 📝 Step-by-Step Authentication Flow

### Step 1: You Log In
```
You → Enter Password → /api/cms/auth (POST)
```

### Step 2: Server Checks Password
```
Server compares your password with CMS_PASSWORD
✅ Correct → Sets cookie with CMS_AUTH_TOKEN
❌ Wrong → Returns error
```

### Step 3: Cookie is Set
```
Server sets a cookie named "cms-auth"
Cookie value = CMS_AUTH_TOKEN
Cookie expires in 7 days
```

### Step 4: Future Requests
```
Every API request → Server checks cookie
Cookie matches CMS_AUTH_TOKEN? → ✅ Authorized
Cookie doesn't match? → ❌ Unauthorized
```

## 🛠️ How to Set Up Your Token

### Option 1: Create `.env.local` File (Local Development)

1. **Create the file** in your project root:
   ```bash
   cd /Users/auqib/code/personal/DrBaigsClinic
   touch .env.local
   ```

2. **Add your credentials**:
   ```env
   CMS_PASSWORD=YourSecurePassword123!
   CMS_AUTH_TOKEN=your-unique-secret-token-here
   ```

3. **Generate a secure token** (recommended):
   ```bash
   # On Mac/Linux:
   openssl rand -hex 32

   # Example output:
   # a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6
   ```

4. **Use the generated token**:
   ```env
   CMS_PASSWORD=MyStrongPassword123!
   CMS_AUTH_TOKEN=a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6
   ```

### Option 2: Set in Vercel (Production)

1. Go to your Vercel project dashboard
2. Navigate to **Settings** → **Environment Variables**
3. Add:
   - **Name**: `CMS_PASSWORD`
   - **Value**: Your secure password
   - **Environment**: Production, Preview, Development
4. Add:
   - **Name**: `CMS_AUTH_TOKEN`
   - **Value**: Your generated token (use `openssl rand -hex 32`)
   - **Environment**: Production, Preview, Development

## 👥 How Multiple Users Can Access

### Important: Shared Password System

**The current system uses a shared password approach:**

- ✅ **Multiple people CAN use the admin panel**
- ✅ **Everyone uses the SAME password** (`CMS_PASSWORD`)
- ✅ **Everyone gets the SAME token** (`CMS_AUTH_TOKEN`) when they log in
- ✅ **Anyone who knows the password can access**

### How It Works for Multiple Users:

1. **You set up ONE password and ONE token** in `.env.local` or Vercel
2. **Share the password** with trusted team members/staff
3. **Each person logs in** with the same password
4. **Each person gets the same token** in their browser cookie
5. **All users can access** the admin panel

### Example Scenario:

```
You (Admin) → Sets password: "Clinic2024!"
Staff Member 1 → Logs in with "Clinic2024!" → Gets token cookie ✅
Staff Member 2 → Logs in with "Clinic2024!" → Gets token cookie ✅
Both can now edit content!
```

### Limitations:

- ❌ **No individual user accounts** - everyone shares the same password
- ❌ **No user tracking** - can't see who made which changes
- ❌ **No different permission levels** - all users have full access
- ❌ **If password is compromised** - everyone loses access (change password immediately)

### When to Use This System:

✅ **Good for:**
- Small teams (2-5 trusted people)
- Simple content management
- No need for user tracking
- Quick setup without a database

❌ **Not ideal for:**
- Large teams (10+ people)
- Need to track who made changes
- Need different permission levels (admin vs editor)
- Need individual user accounts

### If You Need Individual User Accounts:

If you need separate accounts for each user, you would need to:
1. Add a database (e.g., PostgreSQL, MongoDB)
2. Store individual user credentials
3. Generate unique tokens per user
4. Implement user management system

This would require significant changes to the current system.

## 🔒 How It Ensures Only Authorized People Can Access

### The Security Mechanism

1. **Only People Who Know the Password Can Access**
   - Password is stored in `.env.local` (never committed to git)
   - Only people you share the password with can access
   - Server checks password before giving the token

2. **Token is Secret**
   - Token is stored in `.env.local` (never committed to git)
   - Only the server knows what the correct token should be
   - Cookie is `httpOnly` (JavaScript can't read it)
   - Cookie is `secure` in production (only sent over HTTPS)

3. **Cookie Verification**
   - Every API request checks: `Does the cookie match CMS_AUTH_TOKEN?`
   - If YES → User is authorized ✅
   - If NO → Access denied ❌

### Why This Works

```
┌─────────────────────────────────────────┐
│  Someone tries to access admin panel    │
└─────────────────────────────────────────┘
                    │
                    ▼
         ┌──────────────────────┐
         │  Do they have cookie?│
         └──────────────────────┘
                    │
        ┌───────────┴───────────┐
        │                       │
        ▼                       ▼
   ┌─────────┐           ┌──────────┐
   │   YES   │           │    NO    │
   └─────────┘           └──────────┘
        │                       │
        ▼                       ▼
┌───────────────┐      ┌──────────────┐
│ Check if token│      │  Redirect to │
│ matches env   │      │  login page  │
└───────────────┘      └──────────────┘
        │
   ┌────┴────┐
   │         │
   ▼         ▼
┌─────┐  ┌──────┐
│ YES │  │  NO │
└─────┘  └──────┘
   │         │
   ▼         ▼
✅ Allow   ❌ Deny
```

## 🎯 Example: Complete Setup

### 1. Generate Your Token
```bash
openssl rand -hex 32
# Output: 7f3a9b2c1d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b
```

### 2. Create `.env.local`
```env
CMS_PASSWORD=DrBaigsClinic2024!
CMS_AUTH_TOKEN=7f3a9b2c1d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b
```

### 3. Restart Your Dev Server
```bash
# Stop the server (Ctrl+C)
# Then restart:
npm run dev
```

### 4. Test Login
- Go to `http://localhost:3000/admin`
- Enter password: `DrBaigsClinic2024!`
- You should be logged in!

## 🚨 Security Best Practices

### ✅ DO:
- Use a **strong, unique password** (12+ characters, mix of letters, numbers, symbols)
- Generate a **long, random token** (32+ characters)
- Keep `.env.local` **private** (never commit to git)
- Use **different tokens** for development and production
- Set tokens in **Vercel environment variables** for production

### ❌ DON'T:
- Use simple passwords like "admin123" in production
- Share your `.env.local` file
- Commit `.env.local` to git (it's already in `.gitignore`)
- Use the same token for multiple projects
- Share your token with others

## 🔍 How to Verify It's Working

### Check 1: Login Works
1. Go to `/admin`
2. Enter your password
3. Should redirect to `/admin/dashboard`

### Check 2: Cookie is Set
1. Open browser DevTools (F12)
2. Go to **Application** → **Cookies**
3. Look for cookie named `cms-auth`
4. Value should match your `CMS_AUTH_TOKEN`

### Check 3: API Requests Work
1. Open browser DevTools → **Network** tab
2. Make a change in admin panel
3. Check the API request
4. Should return `200 OK` (not `401 Unauthorized`)

### Check 4: Logout Works
1. Click logout
2. Cookie should be deleted
3. Try accessing `/admin/dashboard` directly
4. Should redirect to login page

## 🐛 Troubleshooting

### "Unauthorized" Error
- **Check**: Is `.env.local` file created?
- **Check**: Are environment variables set correctly?
- **Check**: Did you restart the dev server after creating `.env.local`?
- **Check**: Is the cookie being set? (Check DevTools → Application → Cookies)

### Can't Login
- **Check**: Password matches `CMS_PASSWORD` exactly (case-sensitive)
- **Check**: No extra spaces in `.env.local`
- **Check**: Server console for error messages

### Cookie Not Working
- **Check**: Browser allows cookies
- **Check**: Not in incognito/private mode
- **Check**: `credentials: 'include'` in fetch requests (already added)

## 📚 Summary

**CMS_AUTH_TOKEN** is a shared secret key that:
1. Is stored in `.env.local` (or Vercel environment variables)
2. Gets set as a cookie when anyone logs in with the correct password
3. Is checked on every API request to verify the user is authorized
4. Works without a database (perfect for static sites!)
5. **Is the same for all users** - everyone who knows the password gets the same token

**Think of it like:**
- **Password** = Shared office key (everyone who needs access gets a copy)
- **Token** = Same ID badge for everyone (proves you belong inside)

**For Multiple Users:**
- Share the password with trusted team members
- Everyone uses the same password to log in
- Everyone gets the same token cookie
- All authorized users can edit content

Both password and token are needed, and both should be kept secret! 🔐
