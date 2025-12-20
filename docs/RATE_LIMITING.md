# Daily Rate Limiting - Implementation Summary

## ✅ What's Been Added

### Daily Execution Limit: **45 executions per day**

Your code visualizer now tracks and limits daily usage to prevent exceeding the Judge0 free tier (50/day), keeping a 5-execution buffer for safety.

---

## 🎯 Features Implemented

### 1. **Daily Usage Counter** (Top Right of Page)
- Shows "X / 45 executions left today"
- Color-coded:
  - 🟢 Green (16+): Safe zone
  - 🟡 Amber (6-15): Getting low
  - 🔴 Red (0-5): Critical/Reached

### 2. **Warning Banners**
- **At 10 or fewer remaining**: Yellow warning banner appears
- **At 0 remaining**: Red "Limit Reached" banner blocks execution

### 3. **Toast Notifications**
- **At 40+ executions**: "Getting close to limit!" warning
- **At 45 executions**: "Daily limit reached!" error toast
- **When trying to execute at limit**: "Come back tomorrow" message

### 4. **Button States**
- Run button shows "Limit Reached" when blocked
- Button disabled and grayed out at 45/45
- Tooltip shows reason when hovering

### 5. **Automatic Daily Reset**
- Counter resets automatically at midnight (server timezone)
- Fresh 45 executions every day
- No manual action needed

---

## 🔧 How It Works

### Backend (`visualizeController.js`)
```javascript
// In-memory tracking per user per day
dailyUsage: { "userId-2025-12-19": 23 }

// On each execution:
1. Check if user has executions left
2. If at limit → return 429 error
3. If under limit → execute code
4. Increment counter
5. Return usage stats in response
```

### Frontend (`CodeVisualize.jsx`)
```javascript
// Fetches usage every minute
usage: { used: 23, limit: 45, remaining: 22 }

// Shows in UI:
- Counter badge in header
- Warning banners
- Button state
- Toast notifications
```

---

## 📊 Usage Stats Included in Response

Every execution returns:
```json
{
  "status": "Accepted",
  "output": "...",
  "usage": {
    "used": 23,
    "limit": 45,
    "remaining": 22
  }
}
```

---

## 🚀 API Endpoints

### `POST /api/visualize/execute`
- Executes code
- Increments usage counter
- Returns execution result + usage stats
- Returns 429 error if limit reached

### `GET /api/visualize/usage?userId=xxx`
- Get current daily usage
- No execution required
- Refreshes counter display

---

## 🎨 UI Behavior Examples

### Scenario 1: Fresh Day (0/45 used)
- Counter shows "45 / 45 executions left" (green)
- No warnings
- Run button enabled
- Execute freely

### Scenario 2: Getting Close (38/45 used)
- Counter shows "7 / 45 executions left" (amber)
- Toast warning: "Getting close to limit! 7 remaining"
- Run button still enabled
- Yellow banner appears

### Scenario 3: Limit Reached (45/45 used)
- Counter shows "0 / 45 executions left" (red)
- Red "Daily Limit Reached" banner
- Run button disabled, says "Limit Reached"
- Toast: "You've used all 45 executions. Come back tomorrow!"
- Cannot execute code

### Scenario 4: Next Day
- Counter resets to "45 / 45 executions left"
- All warnings cleared
- Fresh start!

---

## 💾 Data Storage

**Current Implementation**: In-memory Map
- Pros: Simple, fast, no database needed
- Cons: Resets on server restart

**For Production**: Consider Redis or MongoDB
```javascript
// Redis example (future enhancement)
await redis.incr(`usage:${userId}:${date}`)
await redis.expire(`usage:${userId}:${date}`, 86400) // 24h
```

---

## 🔒 Why 45 Instead of 50?

Judge0 free tier = 50 requests/day

We set limit to **45** to:
1. Leave 5-request safety buffer
2. Account for potential errors/retries
3. Avoid accidental overages

---

## 📱 Mobile Responsive

All features work on:
- 📱 Mobile phones (320px+)
- 📱 Tablets (768px+)
- 💻 Laptops (1024px+)
- 🖥️ Desktops (1440px+)

Counter badge stacks vertically on mobile, horizontally on desktop.

---

## 🧪 Testing Your Implementation

1. **Run code 5 times** → No warnings yet
2. **Run 35 more times (40 total)** → Warning toast appears
3. **Run 5 more times (45 total)** → Error toast, button disabled
4. **Try to run again** → Button disabled, toast error
5. **Check tomorrow** → Counter reset to 45

---

## ✅ Complete Checklist

- [x] Backend tracks daily usage per user
- [x] Backend blocks execution at 45
- [x] Backend returns usage stats
- [x] Frontend shows counter badge
- [x] Frontend displays warning banners
- [x] Frontend shows toast notifications
- [x] Frontend disables button at limit
- [x] Auto-reset at midnight
- [x] Mobile responsive design
- [x] Dark mode compatible

---

**All Set! 🎉**

Your users will now see their daily execution count and get warnings before hitting the limit. The system automatically resets every day, so they get fresh 45 executions daily.
