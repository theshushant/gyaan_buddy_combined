# Dark Mode Introduction Flow

## Where Dark Mode is Introduced:

### 1. **themeSlice.js (Module Load - FIRST)**
   - **Line 30-31**: When the module loads, it immediately:
     - Gets initial theme from localStorage or system preference
     - Applies the 'dark' class to `<html>` element BEFORE React renders
   - **Line 17-27**: `applyThemeClass()` function applies the class
   - **Line 41-73**: `toggleTheme` reducer applies the class when toggling
   - **Line 74-79**: `setTheme` reducer applies the class when setting
   - **Line 80-85**: `initializeTheme` reducer applies the class when initializing

### 2. **main.jsx (Store Creation)**
   - **Line 10**: Dispatches `initializeTheme()` action when store is created
   - This happens BEFORE React renders

### 3. **App.jsx (Component Mount)**
   - **Line 90-92**: Dispatches `initializeTheme()` again in useEffect
   - **Line 95-105**: Has its own useEffect that watches theme state and applies the class
   - ⚠️ **REDUNDANT**: Reducers already apply the class

### 4. **Settings.jsx (Component Mount)**
   - **Line 16-26**: Has its own useEffect that applies the dark class
   - ⚠️ **REDUNDANT**: Should not be here

## Flow Summary:

```
1. themeSlice.js module loads
   └─> getInitialTheme() reads localStorage/system preference
   └─> applyThemeClass() applies 'dark' class IMMEDIATELY (line 31)

2. main.jsx executes
   └─> store.dispatch(initializeTheme()) 

3. App.jsx mounts
   └─> useEffect dispatches initializeTheme() again
   └─> useEffect watches theme and applies class (redundant)

4. Settings.jsx mounts
   └─> useEffect applies class (redundant)
```

## Issues:

1. **Multiple initializations**: Theme is initialized in 3 places
2. **Redundant class application**: App.jsx and Settings.jsx both apply the class
3. **Race conditions**: Multiple places trying to apply the class could conflict

## Recommendation:

Keep only:
- ✅ themeSlice.js line 31 (immediate application on module load)
- ✅ Reducers in themeSlice.js (handle state changes)
- ❌ Remove App.jsx useEffect (line 95-105)
- ❌ Remove Settings.jsx useEffect (line 16-26)
- ❌ Consider removing one initializeTheme dispatch (keep either main.jsx or App.jsx, not both)

