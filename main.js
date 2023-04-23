// All information for this mod comes from the wiki
// Code loosely based on CookiStocker

const SHOW_NOTIFICATIONS = true;

const BROKER_ICON = [1, 33];

const MODES = {
    STABLE: 0,
    SLOWLY_RISING: 1,
    SLOWLY_FALLING: 2,
    RAPIDLY_RISING: 3,
    RAPIDLY_FALLING: 4,
    FLUCTUATING: 5
}

function notify({
    title = 'Auto Stocks',
    body,
    icon = BROKER_ICON,
    fade = true,
    show = SHOW_NOTIFICATIONS,
}) {
    if (show) {
        Game.Notify(title, body, icon, fade);
    }
}

var stocksMarketMinigame;

function shouldBuy(good) {
    if (!good.active) {
        return false;
    }
    if (good.stock > 0) {
        return false;
    }
    if (good.val > (stocksMarketMinigame.getRestingVal(good.id) * 0.1)) {
        return false;
    }
    if (good.val === 1) {
        return true;
    }
    if (
        good.mode === MODES.SLOWLY_FALLING ||
        good.mode === MODES.RAPIDLY_FALLING
    ) {
        return false;
    }
    return true;
}

function shouldSell(good) {
    if (good.stock === 0) {
        return false;
    }
    if (
        good.val < (100 + 3 * (Game.Objects["Bank"].level - 1)) || 
        good.val < (stocksMarketMinigame.getRestingVal(good.id) * 1.25)
    ) {
        return false;
    }
    if (
        good.mode === MODES.SLOWLY_RISING ||
        good.mode === MODES.RAPIDLY_RISING
    ) {
        return false;
    }
    return true;
}

function runAutoStocks() {
    setTimeout(
        () => {
            stocksMarketMinigame.goodsById.forEach((good, goodId) => {
                if (shouldBuy(good)) {
                    notify({
                        body: `Buying ${good.symbol} at \$${Math.round(good.val * 1000) / 1000}`,
                        icon: good.icon,
                    });
                    stocksMarketMinigame.buyGood(goodId, 1000000);
                }
                if (shouldSell(good)) {
                    notify({
                        body: `Selling ${good.symbol} at \$${Math.round(good.val * 1000) / 1000}`,
                        icon: good.icon,
                    });
                    stocksMarketMinigame.sellGood(goodId, 1000000)
                }
            });

            runAutoStocks();
        },
        1000 * stocksMarketMinigame.secondsPerTick / 2
    );
}

const autoStocks = {
    init:function() {
        this.autoStocks();
    },
    autoStocks:function() {
        stocksMarketMinigame = Game.ObjectsById[5].minigame;
        if (!stocksMarketMinigame) {
            setTimeout(
                () => {
                    this.autoStocks();
                },
                500
            );
            return;
        }
        notify({
            title: 'Auto Stocks has started',
            body: 'Stocks will be automatically traded now.',
            fade: false,
            show: true,
        });

        runAutoStocks();
    },
}

setTimeout(
    function waitForGame() {
        if (typeof Game === 'object' && Game.ready) {
            Game.registerMod(
                "autostocks",
                autoStocks
            );
        }
        else {
            setTimeout(waitForGame, 100);
        }
    }
);
