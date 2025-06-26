  const elements = {
    currentLimit: null,
    rubbles: null,
    fame: null,
    buildingBuff: null,
    levelBuff: null,
    resultBox: null,
    rubbleResult: null,
    fameResult: null,
    pcList: null,
    pcTypeSelect: null,
    pcQuantity: null
  };

  // Store added postcards
  let addedPostcards = [];

  // Postcard configuration
  const PC_TYPES = [
    // Negative fame postcards
    { name: "Hell's Postcard", fame: -15 },
    { name: "Punishment Postcard", fame: -10 },
    { name: "Horrible School Report Card", fame: -7 },
    { name: "Warning Postcard", fame: -1 },
    
    // Regular postcards (sorted by fame value)
    { name: "Basic Postcard", fame: 1 },
    { name: "Recommendation Postcard", fame: 1 },
    { name: "Emperor's Edict", fame: 1 },
    { name: "Luxury Postcard", fame: 2 },
    { name: "Christmas Postcard", fame: 2 },
    { name: "Halloween Postcard", fame: 2 },
    { name: "Ghost Postcard", fame: 3 },
    { name: "Toy Postcard", fame: 3 },
    { name: "Beach Postcard", fame: 3 },
    { name: "Unity Postcard", fame: 3 },
    { name: "Santa Postcard", fame: 4 },
    { name: "Mentors Postcard", fame: 4 },
    { name: "Noble Postcard", fame: 5 },
    { name: "Postcard of Apology", fame: 7 },
    { name: "10th Anniversary Postcard", fame: 10 },
    { name: "Lover Postcard", fame: 40 },
    { name: "Surprise Postcard", fame: 42 },
    { name: "4th Anniversary Postcard", fame: 80 },
    { name: "Sebatdon", fame: 100 },
    
    // Variable fame postcards (using average/typical values)
    { name: "Full Moon Postcard (avg)", fame: 3 },
    { name: "Trump Postcard (avg)", fame: 2.5 },
    { name: "Butterfly Postcard (avg)", fame: 6.5 },
    { name: "Dice Postcard (avg)", fame: 25 }
  ];

  // Constants
  const BASE_LIMIT = 42;
  const LIMIT_INCREMENT = 10;
  const BASE_UPGRADE_COST = 10000;
  const BASE_RUBBLES_PER_FAME = 100;

  // Cache DOM elements on load
  function initializeElements() {
    elements.currentLimit = document.getElementById('currentLimit');
    elements.rubbles = document.getElementById('rubbles');
    elements.fame = document.getElementById('fame');
    elements.buildingBuff = document.getElementById('buildingBuff');
    elements.levelBuff = document.getElementById('levelBuff');
    elements.resultBox = document.getElementById('resultBox');
    elements.rubbleResult = document.getElementById('rubbleResult');
    elements.fameResult = document.getElementById('fameResult');
    elements.pcList = document.getElementById('pcList');
    elements.pcTypeSelect = document.getElementById('pcTypeSelect');
    elements.pcQuantity = document.getElementById('pcQuantity');
  }

  // Initialize postcard dropdown
  function initializePostcardDropdown() {
    PC_TYPES.forEach((pc, index) => {
      const option = document.createElement('option');
      option.value = index;
      option.textContent = `${pc.name} (${pc.fame >= 0 ? '+' : ''}${pc.fame} fame)`;
      elements.pcTypeSelect.appendChild(option);
    });
  }

  // Optimized upgrade calculation
  function calculateUpgradePossibilities(currentLimit, availableRubbles) {
    const upgradesDone = (currentLimit - BASE_LIMIT) / LIMIT_INCREMENT;
    
    if (upgradesDone < 0 || upgradesDone % 1 !== 0) {
      return { error: "Invalid postbag limit. It must be 42 + (10 × upgrades)." };
    }

    let totalCost = 0;
    let upgradeCount = 0;
    let nextUpgradeIndex = upgradesDone;

    // Calculate maximum upgrades possible
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

  // Main functions
  function checkUpgrades() {
    const currentLimit = parseInt(elements.currentLimit.value);
    const rubbles = parseInt(elements.rubbles.value);

    const result = calculateUpgradePossibilities(currentLimit, rubbles);

    if (result.error) {
      elements.resultBox.innerHTML = `<b>⚠️ ${result.error}</b>`;
      return;
    }

    elements.resultBox.innerHTML = `
      ✅ You can afford <b>${result.upgradeCount}</b> upgrade(s).<br>
      💸 Total cost: <b>${result.totalCost.toLocaleString()}</b> rubbles<br>
      🧳 New Postbag Limit: <b>${result.newLimit}</b><br>
      🪙 Rubbles left: <b>${result.remaining.toLocaleString()}</b>
    `;
    animateResult(elements.resultBox);
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
      📈 With buffs (${(totalBuff * 100).toFixed(1)}%): <b>${buffedRubbles.toLocaleString()}</b> rubbles<br>
      <button onclick="fillRubbles(${buffedRubbles})" style="margin-top:1rem">⬇️ Use this in Upgrade Checker</button>
    `;
    animateResult(elements.rubbleResult);
  }

  function calculateFame() {
    const totalFame = addedPostcards.reduce((sum, pc) => sum + (pc.fame * pc.quantity), 0);
    
    if (addedPostcards.length === 0) {
      elements.fameResult.innerHTML = 'Please add some postcards first!';
      return;
    }

    elements.fameResult.innerHTML = `
      🎉 Total Fame: <b>${totalFame >= 0 ? '+' : ''}${totalFame.toLocaleString()}</b><br>
      <small>From ${addedPostcards.length} postcard type${addedPostcards.length !== 1 ? 's' : ''}</small><br>
      <button onclick="applyFame(${totalFame})" style="margin-top:1rem">➡ Fill Fame Calculator</button>
    `;
    animateResult(elements.fameResult);
  }

  // Postcard management functions
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
          <small>${pc.fame >= 0 ? '+' : ''}${pc.fame} fame each × ${pc.quantity} = ${pc.fame >= 0 ? '+' : ''}${pc.fame * pc.quantity} total</small>
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

  // Utility functions
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
    initializePostcardDropdown();
    renderPostcardList();
  });