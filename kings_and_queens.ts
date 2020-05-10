"use strict";

class RectButton {

    constructor(public x: number,
                public y: number,
                public width: number,
                public height: number,
                public onClick: (MouseEvent) => void) {
        
    };

    inBounds(coords: CanvasCoordinates): boolean {
        return (
            coords.x >= this.x && coords.x <= (this.x + this.width) &&
            coords.y >= this.y && coords.y <= (this.y + this.height)
        );
    }

    draw(context: CanvasRenderingContext2D) {
        context.fillRect(this.x, this.y, this.width, this.height);
    }
}

enum AssetType {
    head,
    eyes,
    mouth,
    body,
    hair,
    hat,
    clothes
}


class AssetRepository {

    assets: {[id: string]: HTMLImageElement[]}
    
    constructor() {
        this.assets = this.loadAssets()
    }

    loadAssets(): {[id: string]: HTMLImageElement[]} {
        let assetsDiv = document.querySelector('#assets');
        let assets: {[id: number]: HTMLImageElement[]} = {};
        for (let assetId in AssetType) {
            let assetType: string = AssetType[assetId];
            assets[assetType] = [];
        }
        for (let i = 0; i < assetsDiv.children.length; i++) {
            let image: HTMLImageElement = assetsDiv.children[i] as HTMLImageElement;
            if (image.tagName !== 'IMG') {
                throw "Expected image found asset " + image.tagName + " in loadAssets";
            }
            let imageSrc: string = image.attributes["src"].value
            let imageName: string = imageSrc.substring("assets/".length);
            for (let assetId in AssetType) {
                var assetType = AssetType[assetId]
                if (imageName.substring(0, assetType.length) === assetType) {
                    assets[assetType].push(image);
                }
            }
        }
        return assets;
    }

    getImage(assetType: AssetType, reference: number): HTMLImageElement {
        return this.assets[AssetType[assetType]][reference];
    }

    numAssets(assetType: AssetType): number {
        return this.assets[AssetType[assetType]].length;
    }
}

let repository = new AssetRepository();

class Person {
    constructor(public head: number,
                public eyes: number,
                public mouth: number,
                public body: number,
                public hair: number,
                public hat: number) {

    }

    draw(context: CanvasRenderingContext2D) {
        context.drawImage(repository.getImage(AssetType.body, this.body), 100, 300)
        context.drawImage(repository.getImage(AssetType.head, this.head), 120, 100)
        context.drawImage(repository.getImage(AssetType.eyes, this.eyes), 120, 100)
        context.drawImage(repository.getImage(AssetType.mouth, this.mouth), 120, 100)
        context.drawImage(repository.getImage(AssetType.hair, this.hair), 70, 45)
        context.drawImage(repository.getImage(AssetType.hat, this.hat), 120, 100)
    }
}

interface CanvasCoordinates {
    x: number,
    y: number
}

function canvasCoordinates(canvas: HTMLCanvasElement, e: MouseEvent): CanvasCoordinates {
    let clientBounds: DOMRect = canvas.getClientRects()[0]
    return {
        x: e.clientX - clientBounds.x - 1,
        y: e.clientY - clientBounds.y - 1
    }
}

function run() {
    var canvas: HTMLCanvasElement = document.querySelector('#glCanvas');
    var ctxt = canvas.getContext('2d');

    var baseVelocity = 1;
    var cameraLocation = {x: 0, y: 0}
    var objectSize = 50;
    var objectGap = 50;
    var speedModifier = 0.1
    var yOffset = objectSize / 2;
    var xOffset = objectSize / 2;

    function selectNextHandler(assetType: AssetType) {
        return function(e: MouseEvent) {
            var assetName = AssetType[assetType];
            person[assetName] = (person[assetName] + 1) % repository.numAssets(assetType);
            e.preventDefault();
        }
    }

    var person = new Person(0, 0, 0, 0, 0, 0);
    var buttons = [
        new RectButton(700, 200, 60, 40, selectNextHandler(AssetType.hat)),
        //new RectButton(700, 250, 60, 40, function(MouseEvent) {person.hair = (person.hair + 1) % repository.numAssets(AssetType.hair)}),
        new RectButton(700, 300, 60, 40, selectNextHandler(AssetType.eyes)),
        new RectButton(700, 350, 60, 40, selectNextHandler(AssetType.mouth)),
        //new RectButton(700, 400, 60, 40, function(MouseEvent) {person.head = (person.head + 1) % repository.numAssets(AssetType.head)}),
        //new RectButton(700, 500, 60, 40, function(MouseEvent) {person.body = (person.body + 1) % repository.numAssets(AssetType.body)})
    ]

    canvas.onclick = function(e: MouseEvent) {
        // TODO: if the canvas moves for some reason, will have to make these coordinates work
        // properly
        if (e.clientX > canvas.clientWidth || e.clientY > canvas.clientHeight) {
            return;
        }
        else {
            for (let i in buttons) {
                let button: RectButton = buttons[i];
                let coordinates = canvasCoordinates(canvas, e);
                if (button.inBounds(coordinates)) {
                    button.onClick(e);
                };
            }
        }
    }
    function doFrame() {
        // There is some inexplicable jitter/tearing that's happening using this drawing method
        // I tried stepping a frame at a time pausing before the clearRect was called and still
        // saw it appear so it might be some kind of graphics card driver issue or something
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        ctxt.clearRect(0, 0, window.innerWidth, window.innerHeight)
        person.draw(ctxt);
        for (var i = 0; i < buttons.length; i++) {
            var button = buttons[i];
            button.draw(ctxt);
        }
        window.requestAnimationFrame(doFrame);
    }
    window.requestAnimationFrame(doFrame);
}


window.onload = run