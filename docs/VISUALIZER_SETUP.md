# Code Visualizer Setup Guide

## 🎯 What You Need to Do

### 1. Get Judge0 API Key (Required for Code Execution)

The code visualizer uses Judge0 API to safely execute code in a sandboxed environment.

#### Steps to Get API Key:

1. **Go to RapidAPI Judge0**
   - Visit: https://rapidapi.com/judge0-official/api/judge0-ce

2. **Sign Up / Log In**
   - Create a free RapidAPI account if you don't have one
   - Or log in with your existing account

3. **Subscribe to Judge0 CE (Free Tier)**
   - Click "Subscribe to Test" button
   - Select the **FREE** plan (50 requests/day)
   - No credit card required for free tier

4. **Copy Your API Key**
   - Once subscribed, you'll see your API key in the "X-RapidAPI-Key" field
   - Copy this key

### 2. Configure Backend Environment

1. **Navigate to backend folder:**
   ```bash
   cd backend
   ```

2. **Create .env file** (if it doesn't exist):
   ```bash
   copy .env.example .env
   ```
   (On Mac/Linux: `cp .env.example .env`)

3. **Edit .env file** and add your API key:
   ```env
   MONGO_URI=mongodb://localhost:27017/road-to-dsa
   PORT=5000
   JWT_SECRET=replace_with_secure_secret
   
   # Judge0 API Configuration
   RAPIDAPI_KEY=your_actual_api_key_here
   ```
   
   Replace `your_actual_api_key_here` with the API key you copied from RapidAPI.

### 3. Restart Backend Server

After adding the API key, restart your backend server:

```bash
# Stop the current server (Ctrl+C)
# Then start it again
npm start
```

### 4. Test the Feature

1. Open your browser and go to: `http://localhost:5173` (or your frontend URL)
2. Click on "Visualize" in the navigation menu
3. Try running the sample Java code
4. If configured correctly, you should see execution output!

---

## 🎨 Features Available

### ✅ Fully Implemented
- **Multi-language support**: Java, Python, C++, JavaScript, C
- **Code execution**: Safe sandboxed execution via Judge0
- **Monaco Editor**: Full VS Code editor with syntax highlighting
- **Execution output**: See stdout, stderr, compilation errors
- **Performance metrics**: View execution time and memory usage
- **Responsive design**: Works on mobile, tablet, and desktop
- **Dark mode support**: Matches your theme preference
- **Step controls**: Play/pause/step through code (basic implementation)
- **Code analysis**: Line-by-line code structure analysis

### 🚧 Ready for Enhancement
- **Variable tracking**: Currently shows mock data (can be enhanced with actual runtime traces)
- **Execution trace**: Shows line-by-line execution (can be enhanced with real variable states)
- **Control flow diagrams**: Framework ready (React Flow installed, waiting for AST implementation)

---

## 📋 API Rate Limits

**Free Tier (Judge0 CE):**
- 50 requests per day
- 2 second max CPU time per execution
- 128 MB memory limit

**For Production/Heavy Use:**
- Consider upgrading to paid RapidAPI plan
- Or self-host Judge0 using Docker (unlimited free executions)

---

## 🐛 Troubleshooting

### "Judge0 API key not configured" Error
- Make sure you added `RAPIDAPI_KEY` to your `.env` file
- Restart the backend server after adding the key

### "Invalid Judge0 API key" Error
- Double-check you copied the entire API key correctly
- Verify your RapidAPI subscription is active

### "Rate limit exceeded" Error
- You've hit the 50 requests/day limit on free tier
- Wait 24 hours or upgrade your plan
- Or switch to self-hosted Judge0

### Code Execution Timeout
- Judge0 free tier limits execution to 2 seconds
- Optimize your code or upgrade plan for longer execution times

---

## 🔒 Security Notes

- All code execution happens in Judge0's sandboxed environment
- Your server never directly executes user code
- Rate limiting is built-in via Judge0
- No sensitive data is stored

---

## 🚀 Future Enhancements (Optional)

If you want to enhance the visualizer further:

1. **Real Variable Tracking**
   - Instrument code with debug statements
   - Parse execution output to extract variable states

2. **Control Flow Visualization**
   - Parse code AST (Abstract Syntax Tree)
   - Generate flowcharts with React Flow
   - Highlight execution paths

3. **Self-Hosted Judge0**
   - Use Docker to run Judge0 locally
   - Unlimited free executions
   - No external API dependency

4. **Interactive Debugging**
   - Add breakpoints
   - Step into/over/out functionality
   - Watch expressions

---

## ✅ Verification Checklist

- [ ] RapidAPI account created
- [ ] Subscribed to Judge0 CE (free tier)
- [ ] API key copied
- [ ] `.env` file created in backend folder
- [ ] `RAPIDAPI_KEY` added to `.env`
- [ ] Backend server restarted
- [ ] Tested code execution in visualizer
- [ ] Execution output displays correctly

---

**Need Help?**
- Judge0 Documentation: https://ce.judge0.com/
- RapidAPI Support: https://rapidapi.com/judge0-official/api/judge0-ce/discussions

---

**All Done! 🎉**

Your Code Visualizer is now ready to use. Head to the "Visualize" page and start exploring how code executes step by step!
