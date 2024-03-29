
// GameBoard code below

var socket = io.connect("http://24.16.255.56:8888");
var game = null;

window.onload = function () {

    var saveButton = document.getElementById("save");
    var loadButton = document.getElementById("load");

    saveButton.onclick = function() {
        saveData();
    }
    function saveData() {
        console.log("Saving data");
        
        var objectsList = [];
        for (var i = 0; i < game.entities.length; i++) {
            var entityObj = game.entities[i];
            objectsList.push({
                            radius: entityObj.radius,
                            colors: entityObj.colors,
                            color: entityObj.color,
                            x: entityObj.x,
                            y: entityObj.y,
                            velocity: entityObj.velocity
                            });
        }
        socket.emit("save", {studentname: "Anh Nguyen", statename: "myState", data: {objects: objectsList}});
        console.log("Saved data state");
    }


    loadButton.onclick = function() {
        loadData();
    }
        
    function loadData() {
        console.log("Loading");
        socket.emit("load", { studentname: "Anh Nguyen", statename: "myState" });    
        console.log("Loaded data state");
    }
        
    socket.on("load", function (data) {
     console.log(data.data);
        game.entities = [];
        for (var i = 0; i < data.data.objects.length; i++) {
            var objectData = data.data.objects[i];
            
            var circle = new Circle(game);
            circle.radius = objectData.radius;
            circle.colors = objectData.colors;
            circle.color = objectData.color;
            circle.x = objectData.x;
            circle.y = objectData.y;
            circle.velocity = objectData.velocity;
            game.addEntity(circle);            
        }
        game.loop();
    });

};
var minRadius = 20;
var maxRadius = 50;
var minColor = 0;
var maxColor = 7;


function distance(a, b) {
    var dx = a.x - b.x;
    var dy = a.y - b.y;
    return Math.sqrt(dx * dx + dy * dy);
}

function Circle(game) {
    this.radius = 20;
    this.visualRadius = 500;
    this.colors = ["Red", "Green", "Blue", "White", "Yellow", "Purple", "Cyan"];
    this.mutateBank = [];
    this.color;
    this.setNotIt();
    Entity.call(this, game, this.radius + Math.random() * (800 - this.radius * 2), this.radius + Math.random() * (800 - this.radius * 2));

    this.velocity = { x: Math.random() * 1000, y: Math.random() * 1000 };
    var speed = Math.sqrt(this.velocity.x * this.velocity.x + this.velocity.y * this.velocity.y);
    if (speed > maxSpeed) {
        var ratio = maxSpeed / speed;
        this.velocity.x *= ratio;
        this.velocity.y *= ratio;
    }
};

Circle.prototype = new Entity();
Circle.prototype.constructor = Circle;

Circle.prototype.setIt = function () {
    
    this.it = true;
    // this.color = 0;
    this.visualRadius = 500;
};

Circle.prototype.setNotIt = function () {
    this.it = false;
    // this.color = 3;
    this.visualRadius = 200;
};

Circle.prototype.setRandomRadius = function () {
    var rdmRad;
    rdmRad = Math.random(minRadius, maxRadius);
    rdmRad = Math.ceil(rdmRad * 20);
    if (rdmRad < 5) {
        rdmRad = rdmRad +10;
    }
    this.radius = rdmRad;
};

Circle.prototype.eat = function (other) {
    if (this.radius > other.radius) {
        this.radius = this.radius + other.radius;
        if (this.radius > maxRadius) {
            this.radius = maxRadius;
        }
    }
    this.color = other.color;
    this.mutateColor(other);
}

Circle.prototype.gotEaten = function () {
    this.removeFromWorld = true;
}

Circle.prototype.setRandomColor = function () {
    var rdmNumber;
    rdmNumber = Math.random(0,7);
    rdmNumber = rdmNumber*100;
    rdmNumber = rdmNumber/10;
    this.color = Math.floor(rdmNumber);
    this.mutateBank.push(Math.floor(rdmNumber));
}
Circle.prototype.mutateColor = function(other) {
    this.mutateBank.push[other.color];

}

Circle.prototype.collide = function (other) {
    return distance(this, other) < this.radius + other.radius;
};

Circle.prototype.collideLeft = function () {
    return (this.x - this.radius) < 0;
};

Circle.prototype.collideRight = function () {
    return (this.x + this.radius) > 800;
};

Circle.prototype.collideTop = function () {
    return (this.y - this.radius) < 0;
};

Circle.prototype.collideBottom = function () {
    return (this.y + this.radius) > 800;
};

Circle.prototype.update = function () {
    Entity.prototype.update.call(this);
 //  console.log(this.velocity);

    this.x += this.velocity.x * this.game.clockTick;
    this.y += this.velocity.y * this.game.clockTick;

    if (this.collideLeft()) {
        this.x = 800 - this.radius;
    }
    if (this.collideRight()) {
        this.x = 0 + this.radius;
    }
    if (this.collideTop()) {
        this.y = 800 - this.radius;
    }
    if (this.collideBottom()) {
        this.y = 0 + this.radius;
    }
    // if (this.collideLeft() || this.collideRight()) {
    //     this.velocity.x = -this.velocity.x * friction;
    //     if (this.collideLeft()) this.x = this.radius;
    //     if (this.collideRight()) this.x = 800 - this.radius;
    //     this.x += this.velocity.x * this.game.clockTick;
    //     this.y += this.velocity.y * this.game.clockTick;
    // }

    // if (this.collideTop() || this.collideBottom()) {
    //     this.velocity.y = -this.velocity.y * friction;
    //     if (this.collideTop()) this.y = this.radius;
    //     if (this.collideBottom()) this.y = 800 - this.radius;
    //     this.x += this.velocity.x * this.game.clockTick;
    //     this.y += this.velocity.y * this.game.clockTick;
    // }
  
    for (var i = 0; i < this.game.entities.length; i++) {
        var ent = this.game.entities[i];
        if (ent !== this && this.collide(ent)) {
            var temp = { x: this.velocity.x, y: this.velocity.y };

            var dist = distance(this, ent);
            var delta = this.radius + ent.radius - dist;
            var difX = (this.x - ent.x)/dist;
            var difY = (this.y - ent.y)/dist;

            this.x += difX * delta / 2;
            this.y += difY * delta / 2;
            ent.x -= difX * delta / 2;
            ent.y -= difY * delta / 2;

            this.velocity.x = ent.velocity.x * friction;
            this.velocity.y = ent.velocity.y * friction;
            ent.velocity.x = temp.x * friction;
            ent.velocity.y = temp.y * friction;
            this.x += this.velocity.x * this.game.clockTick;
            this.y += this.velocity.y * this.game.clockTick;
            ent.x += ent.velocity.x * this.game.clockTick;
            ent.y += ent.velocity.y * this.game.clockTick;
            if (this.it) {
                // this.setNotIt();
                this.eat(ent);
                // ent.setIt();
            }
            else if (ent.it) {
                // this.setIt();
                this.gotEaten();
                console.log('eaten');
            }
        }

        
        if (ent != this && this.collide({ x: ent.x, y: ent.y, radius: this.visualRadius })) {
            var dist = distance(this, ent);
            if (this.it && dist > this.radius + ent.radius + 10) {
                var difX = (ent.x - this.x)/dist;
                var difY = (ent.y - this.y)/dist;
                this.velocity.x += difX * acceleration / (dist*dist);
                this.velocity.y += difY * acceleration / (dist * dist);
                var speed = Math.sqrt(this.velocity.x*this.velocity.x + this.velocity.y*this.velocity.y);
                if (speed > maxSpeed) {
                    var ratio = maxSpeed / speed;
                    this.velocity.x *= ratio;
                    this.velocity.y *= ratio;
                }
            }
            //this is the predator
            if (ent.it && dist > this.radius + ent.radius) {
                var difX = (ent.x - this.x) / dist;
                var difY = (ent.y - this.y) / dist;
                this.velocity.x -= difX * acceleration / (dist * dist);
                this.velocity.y -= difY * acceleration / (dist * dist);
                var speed = Math.sqrt(this.velocity.x * this.velocity.x + this.velocity.y * this.velocity.y);
                if (speed > maxSpeed) {
                    var ratio = maxSpeed / speed;
                    this.velocity.x *= ratio;
                    this.velocity.y *= ratio;
                }
            }
        }
    }


    this.velocity.x -= (1 - friction) * this.game.clockTick * this.velocity.x;
    this.velocity.y -= (1 - friction) * this.game.clockTick * this.velocity.y;
};

Circle.prototype.draw = function (ctx) {
    ctx.beginPath();
    ctx.fillStyle = this.colors[this.color];
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
    ctx.fill();
    // this.drawMutation(ctx);
    ctx.closePath();

};

Circle.prototype.drawMutation = function (ctx) {
    var mutateLength = this.mutateBank.length;

    for (var i = mutateLength; i > 0; i --) {
        ctx.beginPath();
        ctx.fillStyle = this.colors[this.mutateBank[i]];
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false );
        ctx.fill();
        ctx.closePath();
    }
}



// the "main" code begins here
var friction = 1;
var acceleration = 1000000;
var maxSpeed = 200;

var ASSET_MANAGER = new AssetManager();

ASSET_MANAGER.queueDownload("./img/960px-Blank_Go_board.png");

ASSET_MANAGER.downloadAll(function () {
    console.log("starting up da sheild");
    var canvas = document.getElementById('gameWorld');
    var ctx = canvas.getContext('2d');
    var GAMEEngine = new GameEngine();
    
    var circle = new Circle(GAMEEngine);
    game = GAMEEngine;
    circle.setIt();
    GAMEEngine.addEntity(circle);
    for (var i = 0; i < 100; i++) {
        circle = new Circle(GAMEEngine);
        if (i % 25 == 0) {
            circle.setIt();
        }
        circle.setRandomRadius();
        circle.setRandomColor();
        GAMEEngine.addEntity(circle);
    }

    GAMEEngine.init(ctx);
    GAMEEngine.start();
});
