$(document).ready(function(){
    Snake = function(){
        return {
            snake: [],

            stage: null,

            ring: null,
            
            engine: null,

            configs: {
                width: 20,
                height: 20
            },
            
            direction: {
                'top': -20,
                'left': 0
            },
            
            lastKeyCode: 38,

            init: function(){
                $('body').html('');
                $(window).keydown(this.setEventListeners(this));
                this.buildStage();
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
                }
            },
            
            buildStage: function (){
                this.stage = $('<div class="stage" />').css({
                    'height': parseInt($(window).height()/2),
                    'margin-top': parseInt($(window).height()/4)
                }).appendTo('body');
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

            startTheGame: function(){
                this.addRing(4);
                var self = this;
                this.engine = setInterval(function(){self.run()}, 500);
            },
            
            stopTheGame: function(){
                clearInterval(this.engine);
                alert('You loose');
            },
            
            restartTheEngine: function(){
                clearInterval(this.engine);
                var self = this;
                this.engine = setInterval(function(){self.run()}, 500);
            },

            addRing: function(n){
                var ring;
                if (this.ring === null){
                    this.ring = $('<div class="ring"></div>');
                }
                for (;n>0;n--) {
                    ring = this.ring.clone();
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
                        left: parseInt((this.stage.width() - this.configs.width*2)/2),
                        top: parseInt((this.stage.height() - this.configs.height*2)/2)
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
                var ring, ringPosition, lastPosition, newPosition, stopTheGame = 0;
                for(var n = 0, l = this.snake.length; n<l; n++)
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
                        if (newPosition.left<0){
                            newPosition.left = 0;
                            stopTheGame = true;
                        }
                        
                        if (newPosition.top<0) {
                            newPosition.top = 0;
                            stopTheGame = true;
                        }
                        
                        if (newPosition.top+this.configs.height > this.stage.height()){
                            newPosition.top = this.stage.height() - this.configs.height;
                            stopTheGame = true;
                        }
                        
                        if (newPosition.left+this.configs.width > this.stage.width()){
                            newPosition.left = this.stage.width() - this.configs.width;
                            stopTheGame = true;
                        }
                    }

                    ring.css(newPosition);
                    lastPosition = ringPosition;
                }
                if (stopTheGame) {
                    this.stopTheGame();
                }   
            }
        };
    };
    var game = new Snake();
    game.init();
});