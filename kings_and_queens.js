"use strict";
var RectButton = /** @class */ (function () {
    function RectButton(x, y, width, height, onClick) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.onClick = onClick;
    }
    ;
    RectButton.prototype.inBounds = function (coords) {
        return (coords.x >= this.x && coords.x <= (this.x + this.width) &&
            coords.y >= this.y && coords.y <= (this.y + this.height));
    };
    RectButton.prototype.draw = function (context) {
        context.fillRect(this.x, this.y, this.width, this.height);
    };
    return RectButton;
}());
var AssetType;
(function (AssetType) {
    AssetType[AssetType["head"] = 0] = "head";
    AssetType[AssetType["eyes"] = 1] = "eyes";
    AssetType[AssetType["mouth"] = 2] = "mouth";
    AssetType[AssetType["body"] = 3] = "body";
    AssetType[AssetType["hair"] = 4] = "hair";
    AssetType[AssetType["hat"] = 5] = "hat";
    AssetType[AssetType["clothes"] = 6] = "clothes";
})(AssetType || (AssetType = {}));
var AssetRepository = /** @class */ (function () {
    function AssetRepository() {
        this.assets = this.loadAssets();
    }
    AssetRepository.prototype.loadAssets = function () {
        var assetsDiv = document.querySelector('#assets');
        var assets = {};
        for (var assetId in AssetType) {
            var assetType_1 = AssetType[assetId];
            assets[assetType_1] = [];
        }
        for (var i = 0; i < assetsDiv.children.length; i++) {
            var image = assetsDiv.children[i];
            if (image.tagName !== 'IMG') {
                throw "Expected image found asset " + image.tagName + " in loadAssets";
            }
            var imageSrc = image.attributes["src"].value;
            var imageName = imageSrc.substring("assets/".length);
            for (var assetId in AssetType) {
                var assetType = AssetType[assetId];
                if (imageName.substring(0, assetType.length) === assetType) {
                    assets[assetType].push(image);
                }
            }
        }
        return assets;
    };
    AssetRepository.prototype.getImage = function (assetType, reference) {
        return this.assets[AssetType[assetType]][reference];
    };
    AssetRepository.prototype.numAssets = function (assetType) {
        return this.assets[AssetType[assetType]].length;
    };
    return AssetRepository;
}());
var repository = new AssetRepository();
var Person = /** @class */ (function () {
    function Person(head, eyes, mouth, body, hair, hat) {
        this.head = head;
        this.eyes = eyes;
        this.mouth = mouth;
        this.body = body;
        this.hair = hair;
        this.hat = hat;
    }
    Person.prototype.draw = function (context) {
        context.drawImage(repository.getImage(AssetType.body, this.body), 100, 300);
        context.drawImage(repository.getImage(AssetType.head, this.head), 120, 100);
        context.drawImage(repository.getImage(AssetType.eyes, this.eyes), 120, 100);
        context.drawImage(repository.getImage(AssetType.mouth, this.mouth), 120, 100);
        context.drawImage(repository.getImage(AssetType.hair, this.hair), 70, 45);
        context.drawImage(repository.getImage(AssetType.hat, this.hat), 120, 100);
    };
    return Person;
}());
function canvasCoordinates(canvas, e) {
    var clientBounds = canvas.getClientRects()[0];
    return {
        x: e.clientX - clientBounds.x - 1,
        y: e.clientY - clientBounds.y - 1
    };
}
function run() {
    var canvas = document.querySelector('#glCanvas');
    var ctxt = canvas.getContext('2d');
    var baseVelocity = 1;
    var cameraLocation = { x: 0, y: 0 };
    var objectSize = 50;
    var objectGap = 50;
    var speedModifier = 0.1;
    var yOffset = objectSize / 2;
    var xOffset = objectSize / 2;
    function selectNextHandler(assetType) {
        return function (e) {
            var assetName = AssetType[assetType];
            person[assetName] = (person[assetName] + 1) % repository.numAssets(assetType);
        };
    }
    var person = new Person(0, 0, 0, 0, 0, 0);
    var buttons = [
        new RectButton(700, 110, 80, 60, selectNextHandler(AssetType.hat)),
        //new RectButton(700, 250, 60, 40, function(MouseEvent) {person.hair = (person.hair + 1) % repository.numAssets(AssetType.hair)}),
        new RectButton(700, 240, 80, 60, selectNextHandler(AssetType.eyes)),
        new RectButton(700, 340, 80, 60, selectNextHandler(AssetType.mouth)),
    ];
    canvas.onclick = function (e) {
        // TODO: if the canvas moves for some reason, will have to make these coordinates work
        // properly
        if (e.clientX > canvas.clientWidth || e.clientY > canvas.clientHeight) {
            return;
        }
        else {
            for (var i in buttons) {
                var button = buttons[i];
                var coordinates = canvasCoordinates(canvas, e);
                if (button.inBounds(coordinates)) {
                    button.onClick(e);
                }
                ;
            }
        }
    };
    function doFrame() {
        // There is some inexplicable jitter/tearing that's happening using this drawing method
        // I tried stepping a frame at a time pausing before the clearRect was called and still
        // saw it appear so it might be some kind of graphics card driver issue or something
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        ctxt.clearRect(0, 0, window.innerWidth, window.innerHeight);
        person.draw(ctxt);
        for (var i = 0; i < buttons.length; i++) {
            var button = buttons[i];
            button.draw(ctxt);
        }
        window.requestAnimationFrame(doFrame);
    }
    window.requestAnimationFrame(doFrame);
}
window.onload = run;
//# sourceMappingURL=kings_and_queens.js.map