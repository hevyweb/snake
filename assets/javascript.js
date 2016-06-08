$(document).ready(function(){
    Snake = function(){
        return {
            snake: [],

            stage: null,

            ring: null,

            configs: {
                width: 20,
                height: 20
            },

            init: function(){
                $('body').html('');
                this.buildStage()
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
                    })
                });
            },

            startTheGame: function(){
                this.addRing(3);
            },

            addRing: function(n){
                var ring;
                if (this.ring == null){
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
                var x,y;
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
                    var lastRing = this.snake[snakeLength-1].position;
                } else {
                    var lastRing = {
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
                        if (lastRing.left == preLastRing.left){
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
            }
        }
    };
    var game = new Snake();
    game.init();
});