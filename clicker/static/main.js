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
        2,
        5
    ],
    //original cost
    base_cost: [
        15,
        30,
        60
    ],
    // actual cost will increase with each powerup purchased
    cost: [
        15,
        30,
        60
    ],

    purchase: function(index) {
        if (game.score >= this.cost[index]) {
            game.score -= this.cost[index];
            this.count[index]++;
            // cost increases by this much with each one purchased
            this.cost[index] = Math.ceil(this.base_cost[index] + this.count[index] * 20.0);
            display.updateScore();
            display.updateShop();
            display.updateUpgrades();
        }
    }
};

var upgrade = {
    name: [
        "Tasty Treats",
        "Mouse Master",
        "Catnip Crazy"
    ],
    description: [
        "Treats are twice as efficient",
        "The mouse is twice as efficient",
        "Catnip is twice as efficient"
    ],
    type: [
        "powerup",
        "click",
        "powerup"
    ],
    cost: [
        300,
        500,
        1000
    ],
    powerupIndex: [
        0, // treat powerup is at index 0
        -1,
        1 // does not impact a powerup
    ],
    requirement: [
        1, // you need to have purchased 1 treat before you can buy this upgrade
        50, // click cat badge 50 manually times before you can buy this upgrade
        3 // purchase 3 catnips before you can buy this upgrade
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
            document.getElementById("shopContainer").innerHTML += '<table class="shopButton unselectable" onclick="powerup.purchase('+i+')" title="Autoclicks '+powerup.income[i]+'x per second"><tr><td id="image"><img src="'+powerup_images[i]+'"></td><td id="nameAndCost"><p>'+powerup.name[i]+'</p><p><span>'+powerup.cost[i]+'</span> clicks</p></td><td id="amount"><span>'+powerup.count[i]+'</span></td></tr></table>'
        }
    },

    updateUpgrades: function() {
        // document.getElementById("upgradeContainer").innerHTML = "";
        for (i = 0; i < upgrade.name.length; i++) {
            if (!upgrade.purchased[i]) {
                if (upgrade.type[i] == "powerup" && powerup.count[upgrade.powerupIndex[i]] >= upgrade.requirement[i]) {
                    if (i == 0) {
                        document.getElementById("upg1").innerHTML = "";
                        document.getElementById("upg1").innerHTML = ' <img src="'+upgrade_images[i]+'" title="'+upgrade.name[i]+' &#10; '+upgrade.description[i]+' &#10; ('+upgrade.cost[i]+' clicks)" onclick="upgrade.purchase('+i+')">';
                    }
                    if (i == 2) {
                        document.getElementById("upg3").innerHTML = "";
                        document.getElementById("upg3").innerHTML = ' <img src="'+upgrade_images[i]+'" title="'+upgrade.name[i]+' &#10; '+upgrade.description[i]+' &#10; ('+upgrade.cost[i]+' clicks)" onclick="upgrade.purchase('+i+')">';
                    }
                } else if (upgrade.type[i] == "click" && game.totalClicks >= upgrade.requirement[i]) {
                    document.getElementById("upg2").innerHTML = "";
                    document.getElementById("upg2").innerHTML = '<img src="'+upgrade_images[i]+'" title="'+upgrade.name[i]+' &#10; '+upgrade.description[i]+' &#10; ('+upgrade.cost[i]+' clicks)" onclick="upgrade.purchase('+i+')">';
                }
            }
            else if (upgrade.purchased[i]) {
                if (i == 0) {
                    document.getElementById("upg1").innerHTML = "";
                }
                if (i == 1) {
                    document.getElementById("upg2").innerHTML = "";
                }
                if (i == 2) {
                    document.getElementById("upg3").innerHTML = "";
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
            powerup.cost[i] = Math.ceil(powerup.base_cost[i] + savedGame.powerupCount[i] * 20.0);
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

// updates score and upgrades every 5 seconds
setInterval (function() {
    display.updateScore();
    display.updateUpgrades();
}, 5000) // 10000ms = 10 seconds

// suppresses 'Confirm Form Resubmission' alert when refreshing the page after saving
if ( window.history.replaceState ) {
    window.history.replaceState( null, null, window.location.href );
  }