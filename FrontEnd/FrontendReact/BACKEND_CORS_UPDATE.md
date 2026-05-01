# ⚙️ Backend CORS Configuration Update

## 📋 Current Issue

Backend CORS is currently configured for port **5173** (Vite default), but frontend is running on port **5174** (due to port conflict).

## ✅ Solution

Update `Program.cs` in your backend to allow both ports:

### File: `D:\FInd_Op_Web_Project\FindFootballOppsites\BackEnd\FInd_Op_Web\FInd_Op_Web\Program.cs`

**Find this section:**
```csharp
// Add CORS Policy to allow React frontend
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowReactApp",
        policy =>
        {
            policy.WithOrigins("http://localhost:5173", "http://127.0.0.1:5173") // Default Vite port
                  .AllowAnyHeader()
                  .AllowAnyMethod()
                  .AllowCredentials(); // Important for Cookie authentication
        });
});
```

**Replace with:**
```csharp
// Add CORS Policy to allow React frontend
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowReactApp",
        policy =>
        {
            policy.WithOrigins(
                "http://localhost:5173", 
                "http://127.0.0.1:5173",
                "http://localhost:5174",     // ← ADD THIS LINE
                "http://127.0.0.1:5174"      // ← ADD THIS LINE
            )
                  .AllowAnyHeader()
                  .AllowAnyMethod()
                  .AllowCredentials(); // Important for Cookie authentication
        });
});
```

## 📝 Step-by-Step

1. Open the backend solution in Visual Studio
2. Find `Program.cs` file
3. Locate the CORS configuration (around line 13-23)
4. Add the two lines for port 5174
5. Save the file
6. Rebuild the backend
7. Run the backend
8. The frontend should now connect successfully

## 🧪 Verify Connection

After updating:

1. Start Backend (port 5000)
```bash
cd D:\FInd_Op_Web_Project\FindFootballOppsites\BackEnd\FInd_Op_Web\FInd_Op_Web
dotnet run
```

2. Frontend should automatically connect
3. Test by attempting to login at http://localhost:5174/login
4. Use credentials: admin / admin123 (select Admin role)

## 🎯 Expected Result

✅ No CORS errors in browser console
✅ Login request succeeds
✅ JWT token received and stored
✅ Dashboard loads with data

## 📞 If Still Having Issues

**Check in browser DevTools Console:**
- CORS error message → Backend needs update
- 401 Unauthorized → Token issue, try login again  
- 500 Server Error → Backend error, check backend logs
- "Cannot reach backend" → Backend not running or wrong URL

**Check Network Tab:**
- Look at login request
- See response headers
- Verify `access-control-allow-origin` includes current port

**Backend Logs:**
```bash
# Should show CORS is working when request arrives
# Watch for any authentication errors
```

---

**Backend Changes Summary:**
- File: `Program.cs`
- Section: CORS Configuration
- Change: Add ports 5174
- Rebuild: Yes, required
- Restart: Yes, required
