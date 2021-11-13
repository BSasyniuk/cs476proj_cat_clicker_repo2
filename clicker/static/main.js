var game = {
    score: 0,
    totalScore: 0,
    totalClicks: 0,
    clickValue: 1,

    addToScore: function(amount) {
        this.score += amount;
        this.totalScore += amount;
        display.updateScore();
    },

    // Tallies income of purchased auto clickers
    getScorePerSecond: function() {
        var scorePerSecond = 0;
        for (i = 0; i < powerup.name.length; i++) {
            scorePerSecond += powerup.income[i] * powerup.count[i];
        }
        return scorePerSecond;
    }
};

var powerup = {
    name: [
        "Treat",
        "Catnip",
        "Tuna"
    ],
    count: [
        0, 
        0, 
        0
    ],
    // income = # clicks/second earned per powerup
    income: [
        1,
        10,
        20
    ],
    //original cost
    base_cost: [
        15,
        30,
        50
    ],
    // actual cost will increase with each powerup purchased
    cost: [
        15,
        30,
        50
    ],

    purchase: function(index) {
        if (game.score >= this.cost[index]) {
            game.score -= this.cost[index];
            this.count[index]++;
            // cost increases by this much with each one purchased
            this.cost[index] = Math.ceil(this.base_cost[index] + this.count[index] * 5.5); // maybe make the 5.0 into a global var COST_FACTOR ?
            display.updateScore();
            display.updateShop();
            display.updateUpgrades();
        }
    }
};

var upgrade = {
    name: [
        "Stone Fingers",
        "Iron Fingers",
        "Stone Clicker"
    ],
    description: [
        "Treats are twice as efficient",
        "Treats are twice as efficient",
        "The mouse is twice as efficient"
    ],
    type: [
        "powerup",
        "powerup",
        "click"
    ],
    cost: [
        300,
        500,
        300
    ],
    powerupIndex: [
        0, // treat powerup is at index 0
        0,
        -1 // does not impact a powerup
    ],
    requirement: [
        1, // you need to have purchased 1 treat before you can buy this upgrade
        5,
        1
    ],
    bonus: [
        2, // it doubles the income
        2,
        2
    ],
    purchased: [
        false, // init to not purchased yet
        false,
        false
    ],

    purchase: function(index) {
        if (!this.purchased[index] && game.score >= this.cost[index]) {
            if (this.type[index] == "powerup" && powerup.count[this.powerupIndex[index]] >= this.requirement[index]) {
                game.score -= this.cost[index];
                powerup.income[this.powerupIndex[index]] *= this.bonus[index];
                this.purchased[index] = true;
                display.updateUpgrades();
                display.updateScore();
            } else if (this.type[index] == "click" && game.totalClicks >= this.requirement[index]) {
                game.score -= this.cost[index];
                game.clickValue *= this.bonus[index];
                this.purchased[index] = true;
                display.updateUpgrades();
                display.updateScore();
            }
        }
    }
};

var display = {
    updateScore: function() {
        document.getElementById("score").innerHTML = game.score;
        document.getElementById("scorepersecond").innerHTML = game.getScorePerSecond();
        document.title = game.score + " clicks - Cat Clicker";
    },

    updateShop: function() {
        document.getElementById("shopContainer").innerHTML = "";
        for (i = 0; i < powerup.name.length; i++) {
            document.getElementById("shopContainer").innerHTML += '<table class="shopButton unselectable" onclick="powerup.purchase('+i+')"><tr><td id="image"><img src="'+powerup_images[i]+'"></td><td id="nameAndCost"><p>'+powerup.name[i]+'</p><p><span>'+powerup.cost[i]+'</span> clicks</p></td><td id="amount"><span>'+powerup.count[i]+'</span></td></tr></table>'
        }
    },

    updateUpgrades: function() {
        document.getElementById("upgradeContainer").innerHTML = "";
        for (i = 0; i < upgrade.name.length; i++) {
            if (!upgrade.purchased[i]) {
                if (upgrade.type[i] == "powerup" && powerup.count[upgrade.powerupIndex[i]] >= upgrade.requirement[i]) {
                    document.getElementById("upgradeContainer").innerHTML += ' <img src="'+upgrade_images[i]+'" title="'+upgrade.name[i]+' &#10; '+upgrade.description[i]+' &#10; ('+upgrade.cost[i]+' clicks)" onclick="upgrade.purchase('+i+')">';
                } else if (upgrade.type[i] == "click" && game.totalClicks >= upgrade.requirement[i]) {
                    document.getElementById("upgradeContainer").innerHTML += '<img src="'+upgrade_images[i]+'" title="'+upgrade.name[i]+' &#10; '+upgrade.description[i]+' &#10; ('+upgrade.cost[i]+' clicks)" onclick="upgrade.purchase('+i+')">';
                }
            }
        }
    },
};

function saveGame () {
    var gameSave = {
        score: game.score,
        totalScore: game.totalScore,
        totalClicks: game.totalClicks,
        clickValue: game.clickValue,
        powerupCount: powerup.count,
        upgradePurchased: upgrade.purchased,
    };
    var saved_data = JSON.stringify(gameSave);
    document.getElementById("gameSaveId").value = saved_data;
    return true;
}

function loadGame() {
    var savedGame = JSON.parse(document.getElementById('loaded_game').textContent);
    if (savedGame !== null) {
        if (typeof savedGame.score !== "undefined") game.score = savedGame.score;
        if (typeof savedGame.totalScore !== "undefined") game.totalScore = savedGame.totalScore;
        if (typeof savedGame.totalClicks !== "undefined") game.totalClicks = savedGame.totalClicks;
        if (typeof savedGame.clickValue !== "undefined") game.clickValue = savedGame.clickValue;
        if (typeof savedGame.powerupCount !== "undefined") {
            for (i = 0; i < savedGame.powerupCount.length; i++) {
                powerup.count[i] = savedGame.powerupCount[i];
            }
        }
        for (i = 0; i < savedGame.powerupCount.length; i++) {
            powerup.cost[i] = Math.ceil(powerup.base_cost[i] + savedGame.powerupCount[i] * 5.5);
        }
        if (typeof savedGame.upgradePurchased !== "undefined") {
            for (i = 0; i < savedGame.upgradePurchased.length; i++) {
                upgrade.purchased[i] = savedGame.upgradePurchased[i];
                if (upgrade.type[i] == "powerup" && savedGame.upgradePurchased[i] == true) {
                    powerup.income[upgrade.powerupIndex[i]] *= upgrade.bonus[i];
                }
            }
        }
    }
};

// increment score when badge is clicked
document.getElementById("clicker").addEventListener("click", function() {
    game.totalClicks++;
    game.addToScore(game.clickValue);
}, false);

// load everything when game homepage is opened
window.onload = function() {
    loadGame();
    display.updateScore();
    display.updateUpgrades();
    display.updateShop();
};

// autoclicks every 1 second
setInterval (function() {
    game.score += game.getScorePerSecond();
    game.totalScore += game.getScorePerSecond();
    display.updateScore();
}, 1000) // 1000ms = 1 second

// updates score and upgrades every 10 seconds
setInterval (function() {
    display.updateScore();
    display.updateUpgrades();
}, 10000) // 10000ms = 10 seconds

// suppresses 'Confirm Form Resubmission' alert when refreshing the page after saving
if ( window.history.replaceState ) {
    window.history.replaceState( null, null, window.location.href );
  }