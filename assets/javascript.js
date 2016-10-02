    Snake = function() {
        return {
            snake: [],
            stage: null,
            ring: $('<div class="ring" />'),
            engine: null,
            speed: null,
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
            direction: {},
            lastKeyCode: null,
            availableCells: [],
            keyCodes: {
                top: 38,
                left: 37,
                bottom: 40,
                right: 39
            },
            languages: ['ua', 'en', 'ru'],
            currentLanguage: 'ua',
            
            start: function(place){
                this.stage = this.buildStage(place).appendTo(place);
                this.tearDown();
            },
            
            tearDown: function(){
                var self = this;
                $(this.stage).on({
                    keyup: function(e) {
                        e.preventDefault();
                        self.keyListeners(e.keyCode);
                    },
                    click: function(e) {
                        self.clickListener(e.offsetX);
                    }
                });
                
                // default direction - top
                this.direction = {
                    'top': -20,
                    'left': 0
                };
                //up arrow
                this.lastKeyCode = 38;
                this.speed = 500;
                this.snake = [];
                this.availableCells = [];
                this.loadAvailableCells();
                this.speedStep = parseInt(this.speed*.8/this.totalCells);
                this.dotPosition = null;
            },
            
            keyListeners: function(keyCode) {
                var top, left;
                switch (keyCode) {
                    case 38:
                        if (this.lastKeyCode !== 38 && this.lastKeyCode !== 40) {
                            top = -1 * this.cell.height;
                            left = 0;
                        }
                        break;
                    case 37:
                        if (this.lastKeyCode !== 37 && this.lastKeyCode !== 39) {
                            top = 0;
                            left = -1 * this.cell.width;
                        }
                        break;
                    case 40:
                        if (this.lastKeyCode !== 38 && this.lastKeyCode !== 40) {
                            top = this.cell.height;
                            left = 0;
                        }
                        break;
                    case 39:
                        if (this.lastKeyCode !== 37 && this.lastKeyCode !== 39) {
                            top = 0;
                            left = this.cell.width;
                        }
                        break;
                }
                this.lastKeyCode = keyCode;

                if (top || left) {
                    this.direction = {
                        top: top,
                        left: left
                    };
                    this.restartTheEngine();
                }
            },
            
            clickListener: function(offsetX){
                var keyCode;
                if (offsetX > this.stageSize.width / 2){
                    if (this.lastKeyCode != this.keyCodes.right){
                        keyCode = this.keyCodes.right;
                    } else {
                        keyCode = this.keyCodes.bottom;
                    }
                } else {
                    if (this.lastKeyCode != this.keyCodes.left){
                        keyCode = this.keyCodes.left;
                    } else {
                        keyCode = this.keyCodes.top;
                    }
                }

                this.keyListeners(keyCode);
            },
            
            buildStage: function(place) {
                var size = this.resizeStage($(place).height() - 20, $(place).width() - 20);
                return $('<div class="stage" tabindex="0" />').css(size).append(this.buildStartUpScreen().css(size));
            },
            
            buildStartUpScreen: function(){
                var self = this;
                var word = Words[self.currentLanguage];
                return $('<div />')
                .css({
                    background: '#ffffff'
                })
                .append($('<div class="gameName" text="title" />').html(word.title))
                .append($('<div class="heightScore" text="hi_score" />').html(word.hi_score + this.getHighScore()))
                .append($('<a href="#" class="playButton" text="play" />').html(word.play).click(function(e){
                    e.preventDefault();
                    $(this).parent().remove();
                    $(window).on('keyup');
                    self.startTheGame();
                }).append($('<button />')));
            },
            
            buildGameOverStage: function(){
                var self = this;
                var word = Words[self.currentLanguage];
                return $('<div />')
                .css({
                    width: this.stage.width(), 
                    height: this.stage.height(),
                    background: '#ffffff'
                })
                .append($('<div class="gameOver" text="game_over" />').html(word.game_over))
                .append($('<div class="heightScore" text="hi_score"/>').html(word.hi_score + this.getHighScore()))
                .append($('<a href="#" />').append($('<button class="playAgainButton" text="try_again" />').html(word.try_again)).click(function(e){
                    e.preventDefault();
                    $(this).parent().remove();
                    self.tearDown();
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
                $(window).unbind('keyup');
                $(this.stage).html('').append(this.buildGameOverStage());
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
                var cell = this.availableCells[index];
                var ring = this.ring.clone().addClass('dot');
                ring.css(cell);
                return ring.appendTo(this.stage);
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
                    dot.removeClass('dot');
                    var last = this.snake[this.snake.length-1].position();
                    dot.css({'top': last.top, 'left': last.left});
                    this.snake.push(dot);
                    this.removePosition(last);
                    this.appearDot();

                    if (this.speed - this.speedStep >= this.maxSpeed) {
                        this.speed -= this.speedStep;
                    }
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
                            top: y,
                            left: x
                        });
                        y += this.cell.height;
                    }
                    x += this.cell.width;
                }
            },
            
            removePosition: function(removeCell) {
                this.availableCells = this.availableCells.filter(function(cell){
                    return cell.top !== removeCell.top || cell.left !== removeCell.left;
                });
            },
            
            addPosition: function(cell) {
                this.availableCells.push(cell);
            },
            
            addControlls: function(){
                var self = this;
                $('<div />').addClass('controllContainer')
                    .append($('<button />').addClass('language').click(function(){
                        var list = $('<ul />');
                        
                        for (var language in self.languages){
                            var li = $('<li />').addClass('language').html(language).click(function(){
                                self.switchLanguage($(this).html());
                            }).appendTo(list);
                            if (language == self.currentLanguage) {
                                li.addClass('currentLanguage');
                            }
                        }
                    })
                );
            },
            
            switchLanguage: function(language){
                this.currentLanguage = language;
                this.stage.find('text').each(function(){
                    $(this).html(Words[language][$(this).attr('text')]);
                });
            }
        };
    };