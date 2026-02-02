# IPL AUCTION 2025 - LIVE AUCTION SYSTEM

## 🏏 Overview

A complete, production-ready IPL Auction website built for college tech symposiums. Features live bidding, smart bid increments, team management, and real-time updates with a premium dark theme UI.

---

## ✨ Features

### Core Functionality
- ✅ **10 IPL Teams** with official logos and dynamic budget tracking
- ✅ **Excel-based Player Upload** (Batters, Bowlers, All-rounders)
- ✅ **Custom Player Images** - Upload your own player photos (matches by filename)
- ✅ **Large Centered Player Display** - 300x300px images for better visibility
- ✅ **Smart Bidding Increments**:
  - Below 2 CR → +0.10 CR (10 lakhs)
  - 2-5 CR → +0.20 CR (20 lakhs)
  - Above 5 CR → +0.25 CR (25 lakhs)
- ✅ **Real-time Team Budget** updates
- ✅ **Sold/Unsold Tracking**
- ✅ **Team Squad Management**
- ✅ **Export Results** to Excel
- ✅ **Complete Reset** functionality
- ✅ **LocalStorage Persistence** (auction state saved automatically)

### UI/UX
- 🎨 Premium dark theme with neon/gradient accents
- 🎨 Glassmorphism design
- 🎨 Smooth animations and transitions
- 🎨 Responsive layout (laptop + projector optimized)
- 🎨 Professional IPL-style auction interface

---

## 📁 Project Structure

```
ipl-auction/
│
├── index.html              # Main HTML file
├── styles.css              # Premium styling
├── script.js               # Complete auction logic
├── SAMPLE_IPL_AUCTION_TEMPLATE.xlsx    # Excel template
├── SAMPLE_EXCEL_FORMAT.txt             # Format documentation
├── IMAGE_UPLOAD_GUIDE.txt              # Image upload instructions
└── README.md               # This file

Optional:
└── player-images/          # Folder for player photos (create this)
    ├── Virat Kohli.jpg
    ├── MS Dhoni (WK).jpg
    └── ... (your player images)
```

---

## 🚀 Quick Start

### 1. Setup

**Option A: Direct Open**
- Simply open `index.html` in a modern web browser (Chrome, Firefox, Edge)
- No server required - runs completely client-side

**Option B: Local Server (Recommended)**
```bash
# Python 3
python -m http.server 8000

# Python 2
python -m SimpleHTTPServer 8000

# Node.js (if you have http-server installed)
npx http-server

# Then open: http://localhost:8000
```

### 2. Upload Player Data

#### Step 2A: Upload Player Images (Optional but Recommended)
1. Prepare player images (JPG, PNG, etc.)
2. **Name files EXACTLY as player names** in Excel
   - Example: Excel has "Virat Kohli" → Image file: "Virat Kohli.jpg"
   - Example: Excel has "MS Dhoni (WK)" → Image file: "MS Dhoni (WK).png"
3. Click **"Choose Player Images"** button
4. Select all player images (Ctrl+Click multiple files)
5. Wait for confirmation: "✅ X images uploaded successfully!"

#### Step 2B: Upload Excel File
1. Click **"Choose Excel File"** button
2. Select your Excel file (see format below)
3. Players will be loaded automatically **in order**: All Batters → All Bowlers → All All-rounders
4. System automatically matches uploaded images to players by name
5. Auction screen will appear

**Note**: You can upload images before or after the Excel file. If uploaded after, the current player display will update automatically.

### 3. Excel File Format

#### Required Structure:
```
Column Layout:
- Columns A-C: S.NO | BATTERS | BASE CREDITS
- Columns E-F: BOWLERS | BASE CREDITS
- Columns H-I: ALL ROUNDERS | BASE CREDITS
```

#### Example:
```
| S.NO | BATTERS         | BASE CREDITS || BOWLERS        | BASE CREDITS || ALL ROUNDERS  | BASE CREDITS |
|------|-----------------|--------------|----------------|--------------|----------------|--------------|
| 1    | Ruturaj Gaikwad | 2            || Kuldeep Yadav  | 2            || Ravindra Jadeja| 2            |
| 2    | MS Dhoni (WK)   | 2            || Mitchell Starc | 2            || Axar Patel    | 2            |
```

#### Important Notes:
- First row is **header row**
- BASE CREDITS in **Crores** (e.g., 2 = 2 Crores)
- Decimal values supported (e.g., 1.5, 0.5)
- Empty cells are ignored
- Special characters allowed (✈️, (WK), etc.)
- Use provided `SAMPLE_IPL_AUCTION_TEMPLATE.xlsx` as reference
- **Players appear in order**: Row 2-8 Batters first, then Row 2-8 Bowlers, then Row 2-8 All-rounders

---

## 🎮 How to Use

### Admin Controls

#### 1. **Select Bidding Team**
- Choose team from dropdown
- Team card will highlight
- Budget will be checked automatically

#### 2. **Increase Bid**
- Click "Increase Bid" button
- Increment adjusts automatically based on current bid
- Cannot exceed team budget

#### 3. **Mark Player Status**
- **SOLD**: Assigns player to bidding team, deducts budget
- **UNSOLD**: Moves player to unsold list
- Auto-advances to next player after 1.5s

#### 4. **Navigation**
- **Team Squads**: View all team rosters and budgets
- **Export**: Download Excel file with complete results
- **Reset**: Clear everything and start fresh
- **Next Player**: Skip to next player (with confirmation)

---

## 📊 Auction Workflow

```
1. Upload Player Images (optional)
   ↓
2. Upload Excel File
   ↓
3. Players Load in Order: Batters → Bowlers → All-rounders
   ↓
4. First Batter Appears (Large 300x300px Image)
   ↓
5. Select Bidding Team
   ↓
6. Increase Bid (using smart increments)
   ↓
7. Mark as SOLD or UNSOLD
   ↓
8. Auto-advance to Next Player
   ↓
9. Repeat: All Batters → All Bowlers → All All-rounders
   ↓
10. Export Final Results
```

---

## 💾 Data Persistence

### LocalStorage
- Auction state saved automatically after every action
- Persists across browser refreshes
- Includes:
  - All players (sold/unsold)
  - Team budgets
  - Current player index
  - Bid amounts
  - Team assignments

### Clear Data
- Click "Reset" button to clear all data
- Confirmation dialog prevents accidental resets

---

## 📤 Export Format

Exported Excel file includes:

```
IPL AUCTION 2025 - FINAL RESULTS

CSK - Squad
Player Name       | Category      | Sold Price (CR)
Ruturaj Gaikwad  | Batter        | 2.30
Total Spent:     |               | 15.50
Remaining Budget:|               | 84.50

[Repeated for all 10 teams]

UNSOLD PLAYERS
Player Name      | Category      | Base Credits (CR)
[List of unsold players]
```

---

## 🎨 Teams & Logos

| Team | Full Name          | Color Code | Budget | Logo Source |
|------|--------------------|------------|--------|-------------|
| CSK  | Chennai Super Kings| #FFFF3C    | 100 CR | Official Logo |
| MI   | Mumbai Indians     | #004BA0    | 100 CR | Official Logo |
| RCB  | Royal Challengers  | #EC1C24    | 100 CR | Official Logo |
| KKR  | Kolkata Knight R.  | #3A225D    | 100 CR | Official Logo |
| RR   | Rajasthan Royals   | #EA1A85    | 100 CR | Official Logo |
| SRH  | Sunrisers Hyderabad| #FF822A    | 100 CR | Official Logo |
| DC   | Delhi Capitals     | #282968    | 100 CR | Official Logo |
| PBKS | Punjab Kings       | #DD1F2D    | 100 CR | Official Logo |
| LSG  | Lucknow Super Giants| #1C84C6   | 100 CR | Official Logo |
| GT   | Gujarat Titans     | #1C2841    | 100 CR | Official Logo |

**Note**: Team logos are fetched from Wikimedia Commons (official IPL team logos)

---

## 🛠️ Technical Details

### Technologies
- **HTML5** - Structure
- **CSS3** - Styling (Flexbox, Grid, Animations)
- **Vanilla JavaScript** - Logic (ES6+)
- **SheetJS (XLSX)** - Excel parsing
- **DiceBear API** - Avatar generation

### Browser Requirements
- Modern browser with JavaScript enabled
- ES6+ support
- LocalStorage support
- Recommended: Chrome 90+, Firefox 88+, Edge 90+

### Performance
- Lightweight (~50KB total)
- No backend required
- Instant load times
- Smooth 60fps animations

---

## 🔧 Customization

### Change Team Budgets
```javascript
// In script.js, lines 6-15
const TEAMS = {
    CSK: { name: 'CSK', color: '#FFFF3C', logo: '🦁', budget: 100 },
    // Change budget values here
}
```

### Modify Bid Increments
```javascript
// In script.js, function getSmartIncrement()
if (bid < 2) {
    return 0.10; // Change increment values
}
```

---

## 🐛 Troubleshooting

### Excel Upload Not Working
- Check file format (.xlsx or .xls)
- Ensure columns match template structure
- Verify BASE CREDITS are numeric
- Check browser console for errors

### Player Images Not Showing
- Verify filename matches Excel player name exactly
- Check file is valid image format (jpg, png, gif, webp)
- Try re-uploading images after Excel file
- Check browser console for matching errors
- See IMAGE_UPLOAD_GUIDE.txt for detailed naming rules

### Images Disappear After Refresh
- Total image size likely exceeds 4.5MB
- Compress images using tinypng.com or similar
- Re-upload images each session if needed
- Use smaller image files (< 200KB recommended)

### Players Not Displaying
- Clear browser cache
- Check localStorage (DevTools → Application → LocalStorage)
- Try Reset button and re-upload

### Budget Not Updating
- Check if team was selected before bidding
- Verify bid amount doesn't exceed budget
- Check browser console for errors

### Timer Not Working
- Ensure Start button was clicked
- Check if timer was paused
- Reset timer if stuck

---

## 📱 Display Recommendations

### Projector Setup
- Resolution: 1920x1080 (Full HD) recommended
- Browser: Full-screen mode (F11)
- Zoom: 100% (Ctrl+0)
- Dark room for best contrast

### Laptop Setup
- Screen brightness: 80-100%
- Browser zoom: 100-110%
- Close other applications for performance

---

## 🎯 Best Practices

1. **Before Auction**:
   - Test Excel upload with sample file
   - Verify all players loaded correctly
   - Check team budgets are correct
   - Test timer functionality

2. **During Auction**:
   - Always select team before bidding
   - Use timer to maintain pace
   - Save state periodically (auto-saved)
   - Keep export backup

3. **After Auction**:
   - Export results immediately
   - Take screenshot of final squads
   - Save Excel backup
   - Reset only after confirmation

---

## 📝 Excel Template Tips

### Creating Your Own
1. Open Excel/Google Sheets
2. Create 3 main columns: BATTERS, BOWLERS, ALL ROUNDERS
3. Add BASE CREDITS column under each
4. Fill player names and credits
5. Save as .xlsx
6. Upload to system

### Data Entry Tips
- Use consistent decimal format (1.5, not 1,5)
- Keep player names under 30 characters
- Remove extra spaces
- Test with small file first
- Use provided template as guide

---

## 🔒 Security & Privacy

- No data sent to external servers
- All processing happens client-side
- LocalStorage is browser-specific
- Clear data with Reset button
- No tracking or analytics

---

## 🎓 Support

### Common Questions

**Q: Can I pause and resume auction?**
A: Yes! All data is saved automatically. Just close and reopen the page.

**Q: How many players can I upload?**
A: No strict limit, but 50-100 players recommended for smooth performance.

**Q: Can I edit player data after upload?**
A: No, you need to reset and re-upload. Edit the Excel file instead.

**Q: What if browser crashes?**
A: Data is saved in localStorage. Reopen page to continue.

**Q: Can multiple people access simultaneously?**
A: No, this is a single-admin system. One browser instance only.

---

## 📜 License

Free to use for college tech symposiums and non-commercial events.

---

## 🙏 Credits

Built for college tech symposiums with ❤️

**Features:**
- Smart bidding logic
- Real-time updates
- Premium UI/UX
- Complete auction management

---

## 📞 Quick Reference Card

```
KEYBOARD SHORTCUTS:
None (all mouse/touch controlled)

IMPORTANT BUTTONS:
🎯 Increase Bid → Add smart increment
✅ SOLD → Assign to team & deduct budget
❌ UNSOLD → Move to unsold list
⏭️ NEXT → Skip player (with warning)
📊 Export → Download Excel results
🔄 Reset → Clear all data

SMART INCREMENTS:
< 2 CR → +0.10 CR
2-5 CR → +0.20 CR  
> 5 CR → +0.25 CR

TIMER:
Default: 30 seconds
Warning: Red at ≤10 seconds
```

---

**Ready to start your IPL Auction? Upload your Excel file and let the bidding begin! 🏏🔥**
