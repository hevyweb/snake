$(document).ready(function() {
    Snake = function() {
        return {
            snake: [],
            stage: null,
            ring: $('<div class="ring"></div>'),
            engine: null,
            speed: 500,
            maxSpeed: 50,
            speedStep: null,
            dotPosition: null,
            cell: {
                width: 20,
                height: 20
            },
            stageSize: {
                width: null,
                height: null
            },
            direction: {
                'top': -20,
                'left': 0
            },
            lastKeyCode: 38,
            availableCells: [],
            init: function(place) {
                $(window).keyup(this.setEventListeners(this));
                this.buildStage(place);
                this.loadAvailableCells();
                this.speedStep = parseInt(this.totalCells / Math.PI);
            },
            setEventListeners: function(self) {
                return function(e) {
                    var top, left;
                    switch (e.keyCode) {
                        case 38:
                            if (self.lastKeyCode !== 38 && self.lastKeyCode !== 40) {
                                top = -1 * self.cell.height;
                                left = 0;
                            }
                            break;
                        case 37:
                            if (self.lastKeyCode !== 37 && self.lastKeyCode !== 39) {
                                top = 0;
                                left = -1 * self.cell.width;
                            }
                            break;
                        case 40:
                            if (self.lastKeyCode !== 38 && self.lastKeyCode !== 40) {
                                top = self.cell.height;
                                left = 0;
                            }
                            break;
                        case 39:
                            if (self.lastKeyCode !== 37 && self.lastKeyCode !== 39) {
                                top = 0;
                                left = self.cell.width;
                            }
                            break;
                    }
                    self.lastKeyCode = e.keyCode;

                    if (top || left) {
                        self.direction = {
                            top: top,
                            left: left
                        };
                        self.restartTheEngine();
                    }
                };
            },
            buildStage: function(place) {
                var height = $(place).height();
                var width = $(place).width();
                this.stage = $('<div class="stage" />').css(this.resizeStage(height, width)).appendTo(place);
                var self = this;
                this.buildStartUpScreen().appendTo(this.stage);
            },
            
            buildStartUpScreen: function(){
                var self = this;
                return $('<div />')
                .css({
                    width: this.stage.width(), 
                    height: this.stage.height(),
                    background: '#ffffff'
                })
                .append($('<div class="gameName" />').html('Snake'))
                .append($('<div class="heightScore" />').html('HI score: ' + this.getHighScore()))
                .append($('<button class="playButton" />').html('Play').click(function(){
                    $(this).parent().remove();
                    self.startTheGame();
                }));
            },
            
            getHighScore: function(){
                var matches = document.cookie.match(new RegExp(
                  "(?:^|; )score=([^;]*)"
                ));
                return matches ? decodeURIComponent(matches[1]) : 0;
            },
            
            setHighScore: function(){
                var highScore = this.snake.length;
                if (highScore > this.getHighScore()) {
                    document.cookie = 'score=' + this.snake.length;
                }
            },
            
            resizeStage: function(height, width) {
                var horizontalCells = Math.floor(width / this.cell.width);
                var verticalCells = Math.floor(height / this.cell.height);
                this.totalCells = horizontalCells * verticalCells;
                this.stageSize = {
                    width: horizontalCells * this.cell.width,
                    height: verticalCells * this.cell.height
                };

                return this.stageSize;
            },
            startTheGame: function() {
                this.addRing(4);
                var self = this;
                this.engine = setInterval(function() {
                    self.run();
                }, this.speed);
                setTimeout(function() {
                    self.appearDot();
                }, 500);
            },
            stopTheGame: function() {
                clearInterval(this.engine);
                this.setHighScore();
                alert('You loose');
            },
            restartTheEngine: function() {
                clearInterval(this.engine);
                var self = this;
                self.run();
                this.engine = setInterval(function() {
                    self.run();
                }, this.speed);
            },
            addRing: function(n) {
                var ring;
                for (; n > 0; n--) {
                    ring = this.ring.clone();
                    if (!this.snake.length) {
                        ring.addClass('head');
                    }
                    this.stage.append(ring);
                    this.reorder(ring);
                    this.snake.push(ring);
                }
            },
            reorder: function(ring) {
                var x, y, lastRing;
                switch (this.detectDirection()) {
                    case 'up':
                        x = 0;
                        y = -1 * this.cell.height;
                        break;
                    case 'left':
                        x = -1 * this.cell.width;
                        y = 0;
                        break;
                    case 'right':
                        x = this.cell.width;
                        y = 0;
                        break;
                    default:
                        x = 0;
                        y = this.cell.height;
                }
                var snakeLength = this.snake.length;
                if (snakeLength) {
                    lastRing = this.snake[snakeLength - 1].position();
                } else {
                    lastRing = {
                        left: Math.floor(parseInt(this.stageSize.width/2) / this.cell.width) * this.cell.width,
                        top: Math.floor(parseInt(this.stageSize.height/2) / this.cell.height) * this.cell.height
                    };
                }

                ring.css({
                    left: lastRing.left + x,
                    top: lastRing.top + y
                });

            },
            detectDirection: function() {
                var snakeLength = this.snake.length;
                var direction = 'down';
                if (snakeLength) {
                    var lastRing = this.snake[snakeLength - 1].position();
                    if (snakeLength > 1) {
                        var preLastRing = this.snake[snakeLength - 2].position();
                        if (lastRing.left === preLastRing.left) {
                            if (lastRing.top < preLastRing.top) {
                                direction = 'up';
                            }
                        } else {
                            if (lastRing.left < preLastRing.left) {
                                direction = 'right';
                            } else {
                                direction = 'left';
                            }
                        }
                    }
                }
                return direction;
            },
            run: function() {
                var ring, ringPosition, lastPosition, newPosition;
                var snakeSize = this.snake.length-1;
                for (var n = 0; n <= snakeSize; n++)
                {
                    ring = this.snake[n];
                    ringPosition = ring.position();
                    if (n) {
                        newPosition = lastPosition;
                        if (n == snakeSize){
                            this.addPosition(ringPosition);
                        }
                    } else {
                        newPosition = {
                            'left': ringPosition.left + this.direction.left,
                            'top': ringPosition.top + this.direction.top
                        };
                        if (this.checkValidPosition(newPosition)) {
                            return this.stopTheGame();
                        }
                        
                        this.removePosition(newPosition);

                        this.eatDot(newPosition);
                    }

                    ring.css(newPosition);
                    lastPosition = ringPosition;
                }
            },
            checkValidPosition: function(newPosition) {
                if (
                        newPosition.left < 0 ||
                        newPosition.top < 0 ||
                        newPosition.top + this.cell.height > this.stage.height() ||
                        newPosition.left + this.cell.width > this.stage.width()
                        ) {
                    return true;
                } else {
                    for (var l = this.snake.length - 1; l > 0; l--) {
                        movingRing = this.snake[l].position();
                        if (newPosition.left === movingRing.left && newPosition.top === movingRing.top) {
                            return true;
                        }
                    }
                }
                return false;
            },
            appearDot: function() {
                var index = parseInt(Math.random() * (this.availableCells.length - 1));
                this.availableCells.slice(index, 1);
                var cell = this.availableCells[index]
                var ring = this.ring.clone().addClass('dot');
                ring.css(cell);
                return ring.appendTo(this.stage);
            },
            moveToTheTail: function() {

            },
            eatDot: function(headPosition) {
                var dot = $('.dot');
                if (!dot.length) {
                    return;
                }
                if (this.dotPosition === null) {
                    this.dotPosition = dot.position();
                }

                if (this.dotPosition.top === headPosition.top && this.dotPosition.left === headPosition.left) {
                    this.dotPosition = null;
                    dot.remove();
                    this.addRing(1);
                    /*dot.removeClass('dot');
                     this.snake.push(dot);
                     */this.appearDot();

                    if (this.speed - this.speedStep >= this.maxSpeed) {
                        this.speed -= this.speedStep;
                    }
                    console.log(this.speed);
                }
            },
            loadAvailableCells: function() {
                var x = 0;
                var y;
                var width = this.stage.width();
                var height = this.stage.height();
                while (x < width) {
                    y = 0;
                    while (y < height) {
                        this.availableCells.push({
                            top: x,
                            left: y
                        });
                        y += this.cell.height;
                    }
                    x += this.cell.width;
                }
            },
            
            removePosition: function(cell) {
                var index = this.availableCells.indexOf(cell);
                this.availableCells.slice(index, 1);
            },
            
            addPosition: function(cell) {
                this.availableCells.push(cell);
            }
        };
    };
    var game = new Snake();
    game.init($('#placeToInsert'));
});