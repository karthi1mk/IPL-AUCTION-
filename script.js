// ============================
// GLOBAL STATE
// ============================

const TEAMS = {
    CSK: { name: 'CSK', color: '#FFFF3C', logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/2/2b/Chennai_Super_Kings_Logo.svg/330px-Chennai_Super_Kings_Logo.svg.png', budget: 100 },
    MI: { name: 'MI', color: '#004BA0', logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/c/cd/Mumbai_Indians_Logo.svg/330px-Mumbai_Indians_Logo.svg.png', budget: 100 },
    RCB: { name: 'RCB', color: '#EC1C24', logo: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTgiCJzrQpbgXvb98aMVay3ipBAPV__6w1o3A&s', budget: 100 },
    KKR: { name: 'KKR', color: '#3A225D', logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/4/4c/Kolkata_Knight_Riders_Logo.svg/330px-Kolkata_Knight_Riders_Logo.svg.png', budget: 100 },
    RR: { name: 'RR', color: '#EA1A85', logo: 'https://upload.wikimedia.org/wikipedia/en/5/5c/This_is_the_logo_for_Rajasthan_Royals%2C_a_cricket_team_playing_in_the_Indian_Premier_League_%28IPL%29.svg', budget: 100 },
    SRH: { name: 'SRH', color: '#FF822A', logo: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTCo0BUMSTb9AyeiPybNt-YXEcfe8mQ8Rm3yw&s', budget: 100 },
    DC: { name: 'DC', color: '#282968', logo: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTE2sZBm4xFDta-g--xJ1K_samiXtT81gGugw&s', budget: 100 },
    PBKS: { name: 'PBKS', color: '#DD1F2D', logo: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS4orvXJVq7qzpauCLUYj8vNQaa7IIRsTLXiA&s', budget: 100 },
    LSG: { name: 'LSG', color: '#1C84C6', logo: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQej-05EaEs65zRqiXxLaphKZKnrd-K2TZNhw&s', budget: 100 },
    GT: { name: 'GT', color: '#1C2841', logo: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQWeln5v7uugrA-GNGfp3qAyo74jkeNN0U7ww&s', budget: 100 }
};

let auctionState = {
    teams: JSON.parse(JSON.stringify(TEAMS)),
    players: [],
    currentPlayerIndex: 0,
    currentBid: 0,
    currentBiddingTeam: null,
    soldPlayers: [],
    unsoldPlayers: [],
    playerImages: {} // Store player images: { "Player Name": "base64_image_data" }
};

// ============================
// INITIALIZATION
// ============================

window.addEventListener('DOMContentLoaded', () => {
    loadStateFromStorage();
    if (auctionState.players.length > 0) {
        showAuctionSection();
    }
});

// ============================
// FILE UPLOAD & PARSING
// ============================

function handleImageUpload(event) {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    let processedCount = 0;
    const totalFiles = files.length;

    showImageUploadStatus(`📤 Uploading ${totalFiles} images...`, 'info');

    Array.from(files).forEach((file, index) => {
        if (!file.type.startsWith('image/')) {
            processedCount++;
            if (processedCount === totalFiles) {
                finalizeImageUpload(totalFiles);
            }
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            // Extract player name from filename (remove extension and clean up)
            const fileName = file.name;
            const playerName = fileName
                .substring(0, fileName.lastIndexOf('.'))
                .trim()
                .replace(/[_-]/g, ' '); // Replace underscores/hyphens with spaces

            // Store the base64 image data
            auctionState.playerImages[playerName] = e.target.result;

            processedCount++;
            if (processedCount === totalFiles) {
                finalizeImageUpload(totalFiles);
            }
        };
        reader.onerror = () => {
            processedCount++;
            if (processedCount === totalFiles) {
                finalizeImageUpload(totalFiles);
            }
        };
        reader.readAsDataURL(file);
    });
}

function finalizeImageUpload(totalFiles) {
    const uploadedCount = Object.keys(auctionState.playerImages).length;
    showImageUploadStatus(
        `✅ ${uploadedCount} of ${totalFiles} images uploaded successfully!`, 
        'success'
    );
    saveStateToStorage();

    // Update existing players with uploaded images
    if (auctionState.players.length > 0) {
        updatePlayerImages();
        if (document.getElementById('auctionSection').style.display !== 'none') {
            displayCurrentPlayer();
        }
    }
}

function updatePlayerImages() {
    auctionState.players.forEach(player => {
        const imagePath = findPlayerImage(player.name);
        if (imagePath) {
            player.image = imagePath;
        }
    });
    saveStateToStorage();
}

function showImageUploadStatus(message, type) {
    const statusEl = document.getElementById('imageUploadStatus');
    statusEl.textContent = message;
    statusEl.style.color = type === 'success' ? '#00ff88' : 
                           type === 'error' ? '#ff4444' : '#00d4ff';
}

function handleFileUpload(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            const data = new Uint8Array(e.target.result);
            const workbook = XLSX.read(data, { type: 'array' });
            const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
            const rows = XLSX.utils.sheet_to_json(firstSheet, { header: 1 });

            parseExcelData(rows);
            showUploadStatus('✅ Players loaded successfully!', 'success');
            setTimeout(() => {
                showAuctionSection();
            }, 1000);
        } catch (error) {
            showUploadStatus('❌ Error reading file. Please check format.', 'error');
            console.error('Error parsing Excel:', error);
        }
    };
    reader.readAsArrayBuffer(file);
}

function parseExcelData(rows) {
    const batters = [];
    const bowlers = [];
    const allRounders = [];
    
    // Skip header row (index 0)
    for (let i = 1; i < rows.length; i++) {
        const row = rows[i];
        
        // Parse BATTERS (columns 1, 2)
        if (row[1] && row[2]) {
            const playerName = String(row[1]).trim();
            batters.push({
                name: playerName,
                category: 'Batter',
                baseCredits: parseFloat(row[2]),
                image: findPlayerImage(playerName)
            });
        }
        
        // Parse BOWLERS (columns 4, 5)
        if (row[4] && row[5]) {
            const playerName = String(row[4]).trim();
            bowlers.push({
                name: playerName,
                category: 'Bowler',
                baseCredits: parseFloat(row[5]),
                image: findPlayerImage(playerName)
            });
        }
        
        // Parse ALL ROUNDERS (columns 7, 8)
        if (row[7] && row[8]) {
            const playerName = String(row[7]).trim();
            allRounders.push({
                name: playerName,
                category: 'All-rounder',
                baseCredits: parseFloat(row[8]),
                image: findPlayerImage(playerName)
            });
        }
    }
    
    // Combine in order: Batters → Bowlers → All-rounders
    auctionState.players = [...batters, ...bowlers, ...allRounders];
    saveStateToStorage();
}

function findPlayerImage(playerName) {
    // Try to find uploaded image for this player
    // Check exact match first
    if (auctionState.playerImages[playerName]) {
        return auctionState.playerImages[playerName];
    }
    
    // Try case-insensitive match
    const lowerName = playerName.toLowerCase();
    for (const [uploadedName, imageData] of Object.entries(auctionState.playerImages)) {
        if (uploadedName.toLowerCase() === lowerName) {
            return imageData;
        }
    }
    
    // Try partial match (uploaded name contains player name or vice versa)
    for (const [uploadedName, imageData] of Object.entries(auctionState.playerImages)) {
        const lowerUploadedName = uploadedName.toLowerCase();
        // Remove special characters for better matching
        const cleanPlayerName = playerName.replace(/[^a-zA-Z0-9\s]/g, '').toLowerCase();
        const cleanUploadedName = uploadedName.replace(/[^a-zA-Z0-9\s]/g, '').toLowerCase();
        
        if (cleanPlayerName.includes(cleanUploadedName) || cleanUploadedName.includes(cleanPlayerName)) {
            return imageData;
        }
    }
    
    // If no uploaded image found, generate avatar as fallback
    return generateAvatarUrl(playerName);
}

function generateAvatarUrl(name) {
    // Generate avatar using DiceBear API
    const cleanName = name.replace(/[^a-zA-Z0-9]/g, '');
    return `https://api.dicebear.com/7.x/avataaars/svg?seed=${cleanName}`;
}

function showUploadStatus(message, type) {
    const statusEl = document.getElementById('uploadStatus');
    statusEl.textContent = message;
    statusEl.style.color = type === 'success' ? '#00ff88' : '#ff4444';
}

// ============================
// UI DISPLAY
// ============================

function showAuctionSection() {
    document.getElementById('uploadSection').style.display = 'none';
    document.getElementById('auctionSection').style.display = 'block';
    
    renderTeams();
    renderTeamSelector();
    displayCurrentPlayer();
    updateStats();
    updateSoldUnsoldLists();
}

function renderTeams() {
    const grid = document.getElementById('teamsGrid');
    grid.innerHTML = '';
    
    Object.keys(auctionState.teams).forEach(teamKey => {
        const team = auctionState.teams[teamKey];
        const card = document.createElement('div');
        card.className = 'team-card';
        card.style.setProperty('--team-color', team.color);
        card.id = `team-${teamKey}`;
        
        const budgetClass = team.budget < 20 ? 'low' : '';
        
        card.innerHTML = `
            <div class="team-logo">
                <img src="${team.logo}" alt="${team.name}" onerror="this.style.display='none'">
            </div>
            <div class="team-name">${team.name}</div>
            <div class="team-budget ${budgetClass}">${team.budget.toFixed(2)} CR</div>
        `;
        
        grid.appendChild(card);
    });
}

function renderTeamSelector() {
    const selector = document.getElementById('teamSelector');
    selector.innerHTML = '<option value="">-- Select Team --</option>';
    
    Object.keys(auctionState.teams).forEach(teamKey => {
        const team = auctionState.teams[teamKey];
        const option = document.createElement('option');
        option.value = teamKey;
        option.textContent = `${team.name} (${team.budget.toFixed(2)} CR)`;
        selector.appendChild(option);
    });
}

function displayCurrentPlayer() {
    if (auctionState.currentPlayerIndex >= auctionState.players.length) {
        showCompletionMessage();
        return;
    }
    
    const player = auctionState.players[auctionState.currentPlayerIndex];
    
    // Update player image and info
    document.getElementById('playerImage').src = player.image;
    document.getElementById('playerName').textContent = player.name;
    document.getElementById('baseCredits').textContent = player.baseCredits.toFixed(2);
    
    // Update category badge
    const categoryEl = document.getElementById('playerCategory');
    categoryEl.textContent = player.category;
    categoryEl.className = 'player-category';
    
    if (player.category === 'Batter') {
        categoryEl.classList.add('category-batter');
    } else if (player.category === 'Bowler') {
        categoryEl.classList.add('category-bowler');
    } else {
        categoryEl.classList.add('category-allrounder');
    }
    
    // Reset bid to base credits
    auctionState.currentBid = player.baseCredits;
    updateBidDisplay();
    
    // Reset bidding team
    auctionState.currentBiddingTeam = null;
    updateBiddingTeamDisplay();
}

function updateBidDisplay() {
    document.getElementById('currentBid').textContent = `${auctionState.currentBid.toFixed(2)} CR`;
    updateIncrementDisplay();
}

function updateIncrementDisplay() {
    const increment = getSmartIncrement();
    document.getElementById('incrementAmount').textContent = increment.toFixed(2);
}

function updateBiddingTeamDisplay() {
    const teamEl = document.getElementById('biddingTeam');
    
    if (auctionState.currentBiddingTeam) {
        const team = auctionState.teams[auctionState.currentBiddingTeam];
        teamEl.textContent = `${team.name} Bidding`;
        teamEl.style.backgroundColor = team.color + '33';
        teamEl.style.borderColor = team.color;
        teamEl.style.color = team.color;
        
        // Highlight team card
        Object.keys(auctionState.teams).forEach(key => {
            const card = document.getElementById(`team-${key}`);
            if (card) {
                card.classList.remove('active');
            }
        });
        
        const activeCard = document.getElementById(`team-${auctionState.currentBiddingTeam}`);
        if (activeCard) {
            activeCard.classList.add('active');
        }
    } else {
        teamEl.textContent = 'No Bids Yet';
        teamEl.style.backgroundColor = 'rgba(0, 255, 136, 0.1)';
        teamEl.style.borderColor = 'rgba(0, 255, 136, 0.3)';
        teamEl.style.color = '#00ff88';
        
        // Remove all highlights
        Object.keys(auctionState.teams).forEach(key => {
            const card = document.getElementById(`team-${key}`);
            if (card) {
                card.classList.remove('active');
            }
        });
    }
}

function updateStats() {
    document.getElementById('totalPlayers').textContent = auctionState.players.length;
    document.getElementById('remainingPlayers').textContent = 
        auctionState.players.length - auctionState.currentPlayerIndex;
    document.getElementById('soldCount').textContent = auctionState.soldPlayers.length;
    document.getElementById('unsoldCount').textContent = auctionState.unsoldPlayers.length;
}

function showCompletionMessage() {
    const playerCard = document.querySelector('.player-card');
    playerCard.innerHTML = `
        <div style="padding: 3rem; text-align: center;">
            <div style="font-size: 5rem; margin-bottom: 1rem;">🏆</div>
            <h2 style="font-size: 2.5rem; margin-bottom: 1rem; color: #00ff88;">
                Auction Complete!
            </h2>
            <p style="font-size: 1.2rem; color: rgba(255,255,255,0.7);">
                All players have been auctioned
            </p>
        </div>
    `;
    
    document.querySelector('.bid-display').innerHTML = `
        <div style="padding: 3rem; text-align: center;">
            <h3 style="font-size: 1.8rem; color: #00ff88; margin-bottom: 1rem;">
                Final Stats
            </h3>
            <div style="font-size: 1.2rem; color: rgba(255,255,255,0.8);">
                <p>Total Sold: ${auctionState.soldPlayers.length}</p>
                <p>Total Unsold: ${auctionState.unsoldPlayers.length}</p>
            </div>
        </div>
    `;
}

// ============================
// BIDDING LOGIC
// ============================

function getSmartIncrement() {
    const bid = auctionState.currentBid;
    
    if (bid < 2) {
        return 0.10; // 10 lakhs
    } else if (bid >= 2 && bid <= 5) {
        return 0.20; // 20 lakhs
    } else {
        return 0.25; // 25 lakhs
    }
}

function increaseBid() {
    if (!auctionState.currentBiddingTeam) {
        alert('⚠️ Please select a bidding team first!');
        return;
    }
    
    const team = auctionState.teams[auctionState.currentBiddingTeam];
    const increment = getSmartIncrement();
    const newBid = auctionState.currentBid + increment;
    
    if (newBid > team.budget) {
        alert(`⚠️ ${team.name} doesn't have enough budget!\nRequired: ${newBid.toFixed(2)} CR\nAvailable: ${team.budget.toFixed(2)} CR`);
        return;
    }
    
    auctionState.currentBid = newBid;
    updateBidDisplay();
    saveStateToStorage();
}

function updateBiddingTeam() {
    const selector = document.getElementById('teamSelector');
    auctionState.currentBiddingTeam = selector.value || null;
    updateBiddingTeamDisplay();
    saveStateToStorage();
}

function markSold() {
    if (!auctionState.currentBiddingTeam) {
        alert('⚠️ Please select a bidding team first!');
        return;
    }
    
    const player = auctionState.players[auctionState.currentPlayerIndex];
    const team = auctionState.teams[auctionState.currentBiddingTeam];
    
    if (auctionState.currentBid > team.budget) {
        alert(`⚠️ ${team.name} doesn't have enough budget!`);
        return;
    }
    
    // Deduct budget
    team.budget -= auctionState.currentBid;
    
    // Add to sold players
    auctionState.soldPlayers.push({
        ...player,
        team: auctionState.currentBiddingTeam,
        soldPrice: auctionState.currentBid
    });
    
    // Show success animation
    showNotification(`✅ ${player.name} SOLD to ${team.name} for ${auctionState.currentBid.toFixed(2)} CR!`, 'success');
    
    renderTeams();
    updateStats();
    updateSoldUnsoldLists();
    saveStateToStorage();
    
    // Move to next player after delay
    setTimeout(() => {
        auctionState.currentPlayerIndex++;
        displayCurrentPlayer();
        saveStateToStorage();
    }, 1500);
}

function markUnsold() {
    const player = auctionState.players[auctionState.currentPlayerIndex];
    
    auctionState.unsoldPlayers.push(player);
    
    showNotification(`❌ ${player.name} remains UNSOLD`, 'error');
    
    updateStats();
    updateSoldUnsoldLists();
    saveStateToStorage();
    
    // Move to next player after delay
    setTimeout(() => {
        auctionState.currentPlayerIndex++;
        displayCurrentPlayer();
        saveStateToStorage();
    }, 1500);
}

function nextPlayer() {
    if (auctionState.currentPlayerIndex >= auctionState.players.length - 1) {
        alert('This is the last player!');
        return;
    }
    
    const confirmNext = confirm('Are you sure you want to skip to the next player without marking this one as sold/unsold?');
    if (confirmNext) {
        auctionState.currentPlayerIndex++;
        displayCurrentPlayer();
        saveStateToStorage();
    }
}

// ============================
// SOLD/UNSOLD LISTS
// ============================

function updateSoldUnsoldLists() {
    // Update sold list
    const soldList = document.getElementById('soldPlayersList');
    if (auctionState.soldPlayers.length === 0) {
        soldList.innerHTML = '<p style="text-align: center; color: rgba(255,255,255,0.5); padding: 2rem;">No players sold yet</p>';
    } else {
        soldList.innerHTML = auctionState.soldPlayers.map(player => {
            const team = auctionState.teams[player.team];
            return `
                <div class="player-item">
                    <span class="player-item-name">${player.name}</span>
                    <span class="player-item-team" style="background: ${team.color}33; color: ${team.color};">
                        ${team.name}
                    </span>
                    <span class="player-item-price">${player.soldPrice.toFixed(2)} CR</span>
                </div>
            `;
        }).join('');
    }
    
    // Update unsold list
    const unsoldList = document.getElementById('unsoldPlayersList');
    if (auctionState.unsoldPlayers.length === 0) {
        unsoldList.innerHTML = '<p style="text-align: center; color: rgba(255,255,255,0.5); padding: 2rem;">No unsold players yet</p>';
    } else {
        unsoldList.innerHTML = auctionState.unsoldPlayers.map(player => `
            <div class="player-item">
                <span class="player-item-name">${player.name}</span>
                <span class="player-item-team" style="background: rgba(255,255,255,0.1); color: rgba(255,255,255,0.6);">
                    ${player.category}
                </span>
                <span class="player-item-price" style="color: #ff4444;">UNSOLD</span>
            </div>
        `).join('');
    }
}

// ============================
// TEAM SQUADS MODAL
// ============================

function openTeamSquads() {
    const modal = document.getElementById('teamSquadsModal');
    const grid = document.getElementById('teamSquadsGrid');
    
    grid.innerHTML = '';
    
    Object.keys(auctionState.teams).forEach(teamKey => {
        const team = auctionState.teams[teamKey];
        const teamPlayers = auctionState.soldPlayers.filter(p => p.team === teamKey);
        const totalSpent = teamPlayers.reduce((sum, p) => sum + p.soldPrice, 0);
        
        const card = document.createElement('div');
        card.className = 'team-squad-card';
        card.style.setProperty('--team-color', team.color);
        
        const playersHTML = teamPlayers.length > 0 
            ? teamPlayers.map(p => `
                <div class="squad-player-item">
                    <span class="squad-player-name">${p.name}</span>
                    <span class="squad-player-price">${p.soldPrice.toFixed(2)} CR</span>
                </div>
            `).join('')
            : '<p style="text-align: center; color: rgba(255,255,255,0.4); padding: 1rem;">No players yet</p>';
        
        card.innerHTML = `
            <div class="team-squad-header">
                <div style="height: 80px; display: flex; align-items: center; justify-content: center; margin-bottom: 0.5rem;">
                    <img src="${team.logo}" alt="${team.name}" style="max-height: 100%; max-width: 100px; object-fit: contain;" onerror="this.style.display='none'">
                </div>
                <div class="team-squad-name">${team.name}</div>
                <div class="team-squad-stats">
                    <div class="squad-stat">
                        <div class="squad-stat-label">Players</div>
                        <div class="squad-stat-value">${teamPlayers.length}</div>
                    </div>
                    <div class="squad-stat">
                        <div class="squad-stat-label">Spent</div>
                        <div class="squad-stat-value">${totalSpent.toFixed(2)} CR</div>
                    </div>
                    <div class="squad-stat">
                        <div class="squad-stat-label">Remaining</div>
                        <div class="squad-stat-value">${team.budget.toFixed(2)} CR</div>
                    </div>
                </div>
            </div>
            <div class="squad-players-list">
                ${playersHTML}
            </div>
        `;
        
        grid.appendChild(card);
    });
    
    modal.style.display = 'block';
}

function closeTeamSquads() {
    document.getElementById('teamSquadsModal').style.display = 'none';
}

// Close modal on outside click
window.onclick = function(event) {
    const modal = document.getElementById('teamSquadsModal');
    if (event.target === modal) {
        closeTeamSquads();
    }
};

// ============================
// EXPORT & RESET
// ============================

function exportResults() {
    const exportData = [];
    
    // Add header
    exportData.push(['IPL AUCTION 2025 - FINAL RESULTS']);
    exportData.push([]);
    
    // Team-wise squads
    Object.keys(auctionState.teams).forEach(teamKey => {
        const team = auctionState.teams[teamKey];
        const teamPlayers = auctionState.soldPlayers.filter(p => p.team === teamKey);
        const totalSpent = teamPlayers.reduce((sum, p) => sum + p.soldPrice, 0);
        
        exportData.push([`${team.name} - Squad`]);
        exportData.push(['Player Name', 'Category', 'Sold Price (CR)']);
        
        teamPlayers.forEach(p => {
            exportData.push([p.name, p.category, p.soldPrice.toFixed(2)]);
        });
        
        exportData.push(['Total Spent:', '', totalSpent.toFixed(2)]);
        exportData.push(['Remaining Budget:', '', team.budget.toFixed(2)]);
        exportData.push([]);
    });
    
    // Unsold players
    if (auctionState.unsoldPlayers.length > 0) {
        exportData.push(['UNSOLD PLAYERS']);
        exportData.push(['Player Name', 'Category', 'Base Credits (CR)']);
        auctionState.unsoldPlayers.forEach(p => {
            exportData.push([p.name, p.category, p.baseCredits.toFixed(2)]);
        });
    }
    
    // Create workbook and export
    const ws = XLSX.utils.aoa_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Auction Results');
    
    XLSX.writeFile(wb, 'IPL_Auction_Results_2025.xlsx');
    
    showNotification('📊 Results exported successfully!', 'success');
}

function resetAuction() {
    const confirmReset = confirm(
        '⚠️ Are you sure you want to reset the entire auction?\n\n' +
        'This will:\n' +
        '• Clear all player data\n' +
        '• Reset all team budgets\n' +
        '• Clear sold and unsold lists\n' +
        '• Restart from the beginning\n\n' +
        'This action cannot be undone!'
    );
    
    if (confirmReset) {
        localStorage.removeItem('iplAuctionState');
        location.reload();
    }
}

// ============================
// LOCAL STORAGE
// ============================

function saveStateToStorage() {
    try {
        // Check if data is too large for localStorage (5MB limit)
        const stateString = JSON.stringify(auctionState);
        const sizeInMB = new Blob([stateString]).size / (1024 * 1024);
        
        if (sizeInMB > 4.5) {
            // If too large, save without images and show warning
            const stateWithoutImages = {
                ...auctionState,
                playerImages: {}
            };
            localStorage.setItem('iplAuctionState', JSON.stringify(stateWithoutImages));
            console.warn('⚠️ Player images not saved to localStorage (size limit). Images will need to be re-uploaded if page is refreshed.');
        } else {
            localStorage.setItem('iplAuctionState', stateString);
        }
    } catch (error) {
        // If localStorage quota exceeded, save without images
        console.error('localStorage error:', error);
        const stateWithoutImages = {
            ...auctionState,
            playerImages: {}
        };
        try {
            localStorage.setItem('iplAuctionState', JSON.stringify(stateWithoutImages));
        } catch (e) {
            console.error('Failed to save state:', e);
        }
    }
}

function loadStateFromStorage() {
    const saved = localStorage.getItem('iplAuctionState');
    if (saved) {
        const loadedState = JSON.parse(saved);
        auctionState = {
            ...auctionState,
            ...loadedState,
            playerImages: loadedState.playerImages || {} // Ensure playerImages exists
        };
    }
}

// ============================
// NOTIFICATIONS
// ============================

function showNotification(message, type) {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 30px;
        background: ${type === 'success' ? 'linear-gradient(135deg, #00ff88, #00d4aa)' : 
                      type === 'error' ? 'linear-gradient(135deg, #ff4444, #ff6b6b)' : 
                      'linear-gradient(135deg, #ffd700, #ffed4e)'};
        color: ${type === 'warning' ? '#0a0e27' : '#fff'};
        padding: 1.5rem 2rem;
        border-radius: 12px;
        font-size: 1.1rem;
        font-weight: 700;
        box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5);
        z-index: 10000;
        animation: slideInRight 0.5s ease;
    `;
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.5s ease';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 500);
    }, 3000);
}

// Add animation styles
const style = document.createElement('style');
style.textContent = `
    @keyframes slideOutRight {
        from {
            opacity: 1;
            transform: translateX(0);
        }
        to {
            opacity: 0;
            transform: translateX(100px);
        }
    }
`;
document.head.appendChild(style);
