const elements = {};
let addedPostcards = [];
let currentTab = 'buy';

// Updated postcard data from wiki
const PC_TYPES = [
    // Shop postcards (buyable)
    { name: "Basic Postcard", fame: 1, duration: 30, price: 2500, currency: "rubbles", buyable: true },
    { name: "Luxury Postcard", fame: 2, duration: 30, price: 10, currency: "luna", buyable: true },
    { name: "Surprise Postcard", fame: 42, duration: 4, price: 42000, currency: "rubbles", buyable: true },
    { name: "Dice Postcard", fame: 25, duration: 20, price: 50, currency: "luna", buyable: true, note: "1-50 fame, 1-40 days" },
    { name: "Lover Postcard", fame: 40, duration: 14, price: 100, currency: "luna", buyable: false, note: "Unobtainable" },
    { name: "Warning Postcard", fame: -1, duration: 30, price: 3000, currency: "rubbles", buyable: true },
    { name: "Punishment Postcard", fame: -10, duration: 15, price: 50, currency: "luna", buyable: true },

    // Event postcards (not buyable)
    { name: "4th Anniversary Postcard", fame: 80, duration: 4, buyable: false },
    { name: "10th Anniversary Postcard", fame: 10, duration: 10, buyable: false },
    { name: "Sebatdon", fame: 100, duration: 1, buyable: false },
    { name: "Butterfly Postcard", fame: 6.5, duration: 10, buyable: false, note: "0-13 fame" },
    { name: "Horrible School Report Card", fame: -7, duration: 14, buyable: false },
    { name: "Postcard of Apology", fame: 7, duration: 14, buyable: false },
    { name: "Full Moon Postcard", fame: 3, duration: 15, buyable: false, note: "1 or 5 fame" },
    { name: "Santa Postcard", fame: 4, duration: 20, buyable: false },
    { name: "Ghost Postcard", fame: 3, duration: 30, buyable: false },
    { name: "Toy Postcard", fame: 3, duration: 30, buyable: false },
    { name: "Recommendation Postcard", fame: 1, duration: 100, buyable: false },
    { name: "Christmas Postcard", fame: 2, duration: 30, buyable: false },
    { name: "Trump Postcard", fame: 2.5, duration: 4, buyable: false, note: "1-4 fame" },
    { name: "Halloween Postcard", fame: 2, duration: 30, buyable: false },
    { name: "Beach Postcard", fame: 3, duration: 30, buyable: false },
    { name: "Noble Postcard", fame: 5, duration: 30, buyable: false },
    { name: "Unity Postcard", fame: 3, duration: 3, buyable: false, note: "Guild members" },
    { name: "Mentors Postcard", fame: 4, duration: 20, buyable: false },
    { name: "Hell's Postcard", fame: -15, duration: 30, buyable: false },
    { name: "Emperor's Edict", fame: 1, duration: 100, buyable: false }
];

// Constants
const BASE_LIMIT = 42;
const LIMIT_INCREMENT = 10;
const BASE_UPGRADE_COST = 10000;
const BASE_RUBBLES_PER_FAME = 100;

function initializeElements() {
    const ids = [
        'currentLimit', 'rubbles', 'currentLimitTarget', 'targetLimit', 'targetResult',
        'fame', 'buildingBuff', 'levelBuff', 'resultBox', 'rubbleResult',
        'fameResult', 'pcList', 'pcTypeSelect', 'pcQuantity',
        'buyPcSelect', 'buyQuantity', 'buyResult'
    ];

    ids.forEach(id => {
        elements[id] = document.getElementById(id);
    });
}

function initializeDropdowns() {
    // Fame predictor dropdown (all postcards)
    PC_TYPES.forEach((pc, index) => {
        const option = document.createElement('option');
        option.value = index;
        option.textContent = `${pc.name} (${pc.fame >= 0 ? '+' : ''}${pc.fame} fame)`;
        elements.pcTypeSelect.appendChild(option);
    });

    // Buy calculator dropdown (only buyable postcards)
    PC_TYPES.filter(pc => pc.buyable).forEach((pc, originalIndex) => {
        const index = PC_TYPES.indexOf(pc);
        const option = document.createElement('option');
        option.value = index;
        const priceText = `${pc.price.toLocaleString()} ${pc.currency}`;
        option.textContent = `${pc.name} - ${priceText}`;
        elements.buyPcSelect.appendChild(option);
    });
}

function switchTab(tab) {
    currentTab = tab;
    document.getElementById('buyTab').style.display = tab === 'buy' ? 'block' : 'none';
    document.getElementById('fameTab').style.display = tab === 'fame' ? 'block' : 'none';

    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    document.querySelector(`.tab[onclick="switchTab('${tab}')"]`).classList.add('active');
}

function calculateUpgradePossibilities(currentLimit, availableRubbles) {
    const upgradesDone = (currentLimit - BASE_LIMIT) / LIMIT_INCREMENT;

    if (upgradesDone < 0 || upgradesDone % 1 !== 0) {
        return { error: "Invalid postbag limit. It must be 42 + (10 × upgrades)." };
    }

    let totalCost = 0;
    let upgradeCount = 0;
    let nextUpgradeIndex = upgradesDone;

    while (true) {
        const nextCost = BASE_UPGRADE_COST * (nextUpgradeIndex + 1);
        if (totalCost + nextCost <= availableRubbles) {
            totalCost += nextCost;
            upgradeCount++;
            nextUpgradeIndex++;
        } else {
            break;
        }
    }

    return {
        upgradeCount,
        totalCost,
        newLimit: currentLimit + (LIMIT_INCREMENT * upgradeCount),
        remaining: availableRubbles - totalCost
    };
}

function calculateTargetUpgradeCost(currentLimit, targetLimit) {
    const currentUpgrades = (currentLimit - BASE_LIMIT) / LIMIT_INCREMENT;
    const targetUpgrades = (targetLimit - BASE_LIMIT) / LIMIT_INCREMENT;

    if (currentUpgrades < 0 || currentUpgrades % 1 !== 0) {
        return { error: "Invalid current limit. Must be 42 + (10 × upgrades)." };
    }

    if (targetUpgrades < 0 || targetUpgrades % 1 !== 0) {
        return { error: "Invalid target limit. Must be 42 + (10 × upgrades)." };
    }

    if (targetLimit <= currentLimit) {
        return { error: "Target limit must be higher than current limit." };
    }

    let totalCost = 0;
    for (let i = currentUpgrades; i < targetUpgrades; i++) {
        totalCost += BASE_UPGRADE_COST * (i + 1);
    }

    return {
        upgradesNeeded: targetUpgrades - currentUpgrades,
        totalCost,
        currentLimit,
        targetLimit
    };
}

function checkUpgrades() {
    const currentLimit = parseInt(elements.currentLimit.value);
    const rubbles = parseInt(elements.rubbles.value);

    const result = calculateUpgradePossibilities(currentLimit, rubbles);

    if (result.error) {
        elements.resultBox.innerHTML = `<b>⚠️ ${result.error}</b>`;
        elements.resultBox.classList.add('error');
        return;
    }

    elements.resultBox.classList.remove('error');
    elements.resultBox.innerHTML = `
    ✅ You can afford <b>${result.upgradeCount}</b> upgrade(s)<br>
    💸 Total cost: <b>${result.totalCost.toLocaleString()}</b> rubbles<br>
    🧳 New Postbag Limit: <b>${result.newLimit}</b><br>
    🪙 Rubbles remaining: <b>${result.remaining.toLocaleString()}</b>
  `;
    animateResult(elements.resultBox);
}

function calculateTargetCost() {
    const currentLimit = parseInt(elements.currentLimitTarget.value);
    const targetLimit = parseInt(elements.targetLimit.value);

    const result = calculateTargetUpgradeCost(currentLimit, targetLimit);

    if (result.error) {
        elements.targetResult.innerHTML = `<b>⚠️ ${result.error}</b>`;
        elements.targetResult.classList.add('error');
        return;
    }

    elements.targetResult.classList.remove('error');
    elements.targetResult.innerHTML = `
    🎯 Upgrades needed: <b>${result.upgradesNeeded}</b><br>
    💰 Total cost: <b>${result.totalCost.toLocaleString()}</b> rubbles<br>
    📈 From ${result.currentLimit} → ${result.targetLimit} capacity<br>
    <button onclick="fillRubbles(${result.totalCost})" style="margin-top:1rem">⬇️ Use in Upgrade Checker</button>
  `;
    animateResult(elements.targetResult);
}

function calculateRubbles() {
    const fame = parseFloat(elements.fame.value);
    const buildingBuff = parseFloat(elements.buildingBuff.value) / 100;
    const levelBuff = parseFloat(elements.levelBuff.value) / 100;

    const baseRubbles = fame * BASE_RUBBLES_PER_FAME;
    const totalBuff = buildingBuff + levelBuff;
    const buffedRubbles = Math.floor(baseRubbles * (1 + totalBuff));

    elements.rubbleResult.innerHTML = `
    ⭐ Base rubbles: <b>${baseRubbles.toLocaleString()}</b><br>
    📈 With buffs (+${(totalBuff * 100).toFixed(1)}%): <b>${buffedRubbles.toLocaleString()}</b> rubbles<br>
    <button onclick="fillRubbles(${buffedRubbles})" style="margin-top:1rem">⬇️ Use in Upgrade Checker</button>
  `;
    animateResult(elements.rubbleResult);
}

function calculatePurchaseCost() {
    const selectedIndex = elements.buyPcSelect.value;
    const quantity = parseInt(elements.buyQuantity.value) || 1;

    if (!selectedIndex) {
        elements.buyResult.innerHTML = '<b>⚠️ Please select a postcard type</b>';
        elements.buyResult.classList.add('error');
        return;
    }

    const pc = PC_TYPES[selectedIndex];
    const totalCost = pc.price * quantity;
    const totalFame = pc.fame * quantity;

    elements.buyResult.classList.remove('error');
    elements.buyResult.innerHTML = `
    💳 <b>${pc.name}</b> × ${quantity}<br>
    💰 Total cost: <b>${totalCost.toLocaleString()} ${pc.currency}</b><br>
    ⭐ Total fame: <b>${totalFame >= 0 ? '+' : ''}${totalFame}</b> for ${pc.duration} days<br>
    ${pc.note ? `<small>📝 ${pc.note}</small><br>` : ''}
    ${pc.currency === 'rubbles' ? `<button onclick="showRubbleConversion(${totalCost})" style="margin-top:1rem">💰 Calculate Fame Needed</button>` : ''}
  `;
    animateResult(elements.buyResult);
}

function showRubbleConversion(rubblesNeeded) {
    const fameNeeded = Math.ceil(rubblesNeeded / BASE_RUBBLES_PER_FAME);
    const buildingBuff = parseFloat(elements.buildingBuff.value) / 100 || 0;
    const levelBuff = parseFloat(elements.levelBuff.value) / 100 || 0;
    const totalBuff = buildingBuff + levelBuff;

    const fameNeededWithBuffs = Math.ceil(rubblesNeeded / (BASE_RUBBLES_PER_FAME * (1 + totalBuff)));

    elements.buyResult.innerHTML += `
    <div class="price-info">
      💡 <b>Fame needed for ${rubblesNeeded.toLocaleString()} rubbles:</b><br>
      • Without buffs: <b>${fameNeeded.toLocaleString()}</b> fame<br>
      • With your buffs (+${(totalBuff * 100).toFixed(1)}%): <b>${fameNeededWithBuffs.toLocaleString()}</b> fame
    </div>
  `;
}

function calculateFame() {
    const totalFame = addedPostcards.reduce((sum, pc) => sum + (pc.fame * pc.quantity), 0);

    if (addedPostcards.length === 0) {
        elements.fameResult.innerHTML = 'Please add some postcards first!';
        elements.fameResult.classList.add('error');
        return;
    }

    elements.fameResult.classList.remove('error');
    elements.fameResult.innerHTML = `
    🎉 Total Fame: <b>${totalFame >= 0 ? '+' : ''}${totalFame.toLocaleString()}</b><br>
    📊 From ${addedPostcards.length} postcard type${addedPostcards.length !== 1 ? 's' : ''}<br>
    <button onclick="applyFame(${totalFame})" style="margin-top:1rem">➡ Fill Fame Calculator</button>
  `;
    animateResult(elements.fameResult);
}

function addPostcard() {
    const selectedIndex = elements.pcTypeSelect.value;
    const quantity = parseInt(elements.pcQuantity.value) || 1;

    if (!selectedIndex) {
        alert('Please select a postcard type');
        return;
    }

    const pcType = PC_TYPES[selectedIndex];
    const existingIndex = addedPostcards.findIndex(pc => pc.typeIndex == selectedIndex);

    if (existingIndex >= 0) {
        addedPostcards[existingIndex].quantity += quantity;
    } else {
        addedPostcards.push({
            typeIndex: selectedIndex,
            name: pcType.name,
            fame: pcType.fame,
            quantity: quantity
        });
    }

    renderPostcardList();
    elements.pcTypeSelect.value = '';
    elements.pcQuantity.value = 1;
}

function removePostcard(index) {
    addedPostcards.splice(index, 1);
    renderPostcardList();
}

function updateQuantity(index, change) {
    addedPostcards[index].quantity += change;
    if (addedPostcards[index].quantity <= 0) {
        removePostcard(index);
    } else {
        renderPostcardList();
    }
}

function renderPostcardList() {
    if (addedPostcards.length === 0) {
        elements.pcList.innerHTML = '<p style="color: #888; text-align: center; padding: 1rem;">No postcards added yet</p>';
        return;
    }

    elements.pcList.innerHTML = addedPostcards.map((pc, index) => `
    <div class="pc-item">
      <div class="pc-item-info">
        <strong>${pc.name}</strong><br>
        <small>${pc.fame >= 0 ? '+' : ''}${pc.fame} fame each × ${pc.quantity} = ${pc.fame >= 0 ? '+' : ''}${(pc.fame * pc.quantity).toFixed(1)} total</small>
      </div>
      <div class="pc-item-controls">
        <button onclick="updateQuantity(${index}, -1)">−</button>
        <span style="min-width: 30px; text-align: center;">${pc.quantity}</span>
        <button onclick="updateQuantity(${index}, 1)">+</button>
        <button onclick="removePostcard(${index})" class="remove-btn">✕</button>
      </div>
    </div>
  `).join('');
}

function fillRubbles(amount) {
    elements.rubbles.value = amount;
    elements.rubbles.scrollIntoView({ behavior: "smooth" });
}

function applyFame(fame) {
    elements.fame.value = fame;
    elements.fame.scrollIntoView({ behavior: "smooth" });
}

function animateResult(element) {
    element.style.opacity = '0';
    requestAnimationFrame(() => {
        element.style.opacity = '1';
    });
}

// Initialize everything when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    initializeElements();
    initializeDropdowns();
    renderPostcardList();
});