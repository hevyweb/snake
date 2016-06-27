$(document).ready(function(){
    Snake = function(){
        return {
            snake: [],

            stage: null,

            ring: null,
            
            engine: null,
            
            speed: 500,
            
            maxSpeed: 50,
            
            speedStep: null,
            
            dotPosition: null,

            configs: {
                width: 20,
                height: 20,
                sector: {
                    colls: 4,
                    rows: 3,
                    width: null,
                    height: null
                }
            },
            
            direction: {
                'top': -20,
                'left': 0
            },
            
            lastKeyCode: 38,
            
            lastSector: 0,

            init: function(){
                
                $('body').html('');
                $(window).keyup(this.setEventListeners(this));
                this.buildStage();
                this.speedStep = parseInt(this.configs.sector.horizontalCells*this.configs.sector.verticalCells/Math.PI);
            },

            setEventListeners: function (self){
                return function(e){
                    var top, left;
                    switch(e.keyCode){
                        case 38:
                            if (self.lastKeyCode !== 38 && self.lastKeyCode !== 40) {
                                top = -1 * self.configs.height;
                                left = 0;
                            }
                            break;
                        case 37:
                            if (self.lastKeyCode !== 37 && self.lastKeyCode !== 39) {
                                top = 0;
                                left = -1 * self.configs.width;
                            }
                            break;
                        case 40:
                            if (self.lastKeyCode !== 38 && self.lastKeyCode !== 40) {
                                top = self.configs.height;
                                left = 0;
                            }
                            break;
                        case 39:
                            if (self.lastKeyCode !== 37 && self.lastKeyCode !== 39) {
                                top = 0;
                                left = self.configs.width;
                            }
                            break;
                    }
                    self.lastKeyCode = e.keyCode;
                    
                    if (top || left){
                        self.direction = {
                            top: top,
                            left: left
                        };
                        self.restartTheEngine();
                    }
                };
            },
            
            buildStage: function (){
                var height = parseInt($(window).height()/2);
                var width = parseInt($(window).width()/2);
                this.stage = $('<div class="stage" />').css(this.resizeStage(height, width)).appendTo('body');
                var self = this;
                $('<div class="startBtn">Go!</div>').appendTo(this.stage).click(function(){
                    $(this).animate({
                        opacity: 0,
                        height: 0,
                        width: 0,
                        "line-height": 0,
                        "font-size": 0
                    }, 400, function(){
                        $(this).remove();
                        self.startTheGame();
                    });
                });
            },
            
            resizeStage: function(height, width) {
                this.configs.sector.width = Math.floor(Math.floor(width/this.configs.width)/this.configs.sector.colls)*this.configs.width;
                this.configs.sector.height = Math.floor(Math.floor(height/this.configs.height)/this.configs.sector.rows)*this.configs.height;
                this.configs.sector.horizontalCells = this.configs.sector.width/this.configs.width;
                this.configs.sector.verticalCells = this.configs.sector.height/this.configs.height;

                return {
                    'width': this.configs.sector.width * this.configs.sector.colls,
                    'height': this.configs.sector.height * this.configs.sector.rows
                };
            },

            startTheGame: function(){
                this.addRing(4);
                var self = this;
                this.engine = setInterval(function(){self.run();}, this.speed);
                setTimeout(function(){self.appearDot();}, 500);
            },
            
            stopTheGame: function(){
                clearInterval(this.engine);
                alert('You loose');
            },
            
            restartTheEngine: function(){
                clearInterval(this.engine);
                var self = this;
                self.run();
                this.engine = setInterval(function(){self.run();}, this.speed);
            },

            addRing: function(n){
                var ring;
                if (this.ring === null){
                    this.ring = $('<div class="ring"></div>');
                }
                for (;n>0;n--) {
                    ring = this.ring.clone();
                    if (!this.snake.length) {
                        ring.addClass('head');
                    }
                    this.stage.append(ring);
                    this.reorder(ring);
                    this.snake.push(ring);
                }
            },

            reorder: function(ring){
                var x, y, lastRing;
                switch (this.detectDirection()) {
                    case 'up':
                        x = 0;
                        y = -1*this.configs.height;
                        break;
                    case 'left':
                        x = -1 * this.configs.width;
                        y = 0;
                        break;
                    case 'right':
                        x = this.configs.width;
                        y = 0;
                        break;
                    default:
                        x = 0;
                        y = this.configs.height;
                }
                var snakeLength = this.snake.length;
                if (snakeLength) {
                    lastRing = this.snake[snakeLength-1].position();
                } else {
                    lastRing = {
                        left: Math.floor(this.configs.sector.horizontalCells*this.configs.sector.colls/2)*this.configs.width,
                        top: Math.floor(this.configs.sector.verticalCells*this.configs.sector.rows/2)*this.configs.height
                    };
                }

                ring.css({
                    left: lastRing.left+x,
                    top: lastRing.top+y
                });

            },

            detectDirection: function(){
                var snakeLength = this.snake.length;
                var direction = 'down';
                if (snakeLength) {
                    var lastRing = this.snake[snakeLength-1].position();
                    if (snakeLength>1){
                        var preLastRing = this.snake[snakeLength-2].position();
                        if (lastRing.left === preLastRing.left){
                            if (lastRing.top<preLastRing.top){
                                direction = 'up';
                            }
                        } else {
                            if (lastRing.left < preLastRing.left){
                                direction = 'right';
                            } else {
                                direction = 'left';
                            }
                        }
                    }
                }
                return direction;
            },
            
            run: function(){
                var ring, ringPosition, lastPosition, newPosition;
                for(var n = 0; n<this.snake.length; n++)
                {
                    ring = this.snake[n];
                    ringPosition = ring.position();
                    if (n){
                        newPosition = lastPosition;
                    } else {
                        newPosition = {
                            'left' : ringPosition.left + this.direction.left,
                            'top' : ringPosition.top + this.direction.top
                        };
                        if (this.checkValidPosition(newPosition)){
                            return this.stopTheGame();
                        }
                
                        this.eatDot(newPosition);
                    }

                    ring.css(newPosition);
                    lastPosition = ringPosition;
                }
            },
            
            checkValidPosition: function(newPosition){
                if (
                    newPosition.left<0 || 
                    newPosition.top<0 || 
                    newPosition.top+this.configs.height > this.stage.height() || 
                    newPosition.left+this.configs.width > this.stage.width()
                ){
                    return true;
                } else {
                    for(var l = this.snake.length-1;l>0;l--){
                        movingRing = this.snake[l].position();
                        if (newPosition.left === movingRing.left && newPosition.top === movingRing.top) {
                            return true;
                        }
                    }
                }
                return false;
            },
            
            appearDot: function(){
                var sector = this.lastSector;
                do {
                    var wrongPosition = false;
                    while(sector === this.lastSector) {
                        sector = Math.ceil(Math.random() * (this.configs.sector.rows * this.configs.sector.colls - 1));
                    }
                    var row = Math.floor(sector/this.configs.sector.colls);
                    var coll = sector%this.configs.sector.colls;
                    var top = row * this.configs.sector.height + Math.floor(Math.random() * this.configs.sector.verticalCells)*this.configs.height;
                    var left = coll * this.configs.sector.width + Math.floor(Math.random() * this.configs.sector.horizontalCells)*this.configs.width;
                    for (var l = this.snake.length - 1; l >= 0; l--){
                        var position = $(this.snake[l]).position();
                        if (position.top === top || position.left === left) {
                            wrongPosition = true;
                        }
                    }
                } while(wrongPosition);
                
                return $('<div class="ring dot"></div>')
                    .css({
                        'top': top,
                        'left': left
                    })
                    .appendTo(this.stage);
            },
            
            moveToTheTail: function(){
                
            },
            
            eatDot: function(headPosition){
                var dot = $('.dot');
                if (!dot.length) {
                    return;
                }
                if (this.dotPosition === null) {
                    this.dotPosition = dot.position();
                }

                if (this.dotPosition.top === headPosition.top && this.dotPosition.left === headPosition.left){
                    this.dotPosition = null;
                    dot.removeClass('dot');
                    this.snake.push(dot);
                    this.appearDot();
                    
                    if (this.speed - this.speedStep >= this.maxSpeed) {
                        this.speed -= this.speedStep;
                    }
                    console.log(this.speed);
                }                
            }
        };
    };
    var game = new Snake();
    game.init();
});