$(document).ready( function(){
    $('#game a').click( function(){
        $('#game').removeClass('selected');
    });
    game = new Game();
});

function Point(args){
    this.x = args.x;
    this.y = args.y;
    this.color = args.color;
    this.value = args.value;
    this.clicked = false;
}

function Game() {
    
    this.board    = document.getElementById('board');
    this.ctx      = this.board.getContext('2d');
    this.click    = null;
    this.ui       = new Ui( this );
    //this.music    = 'music/music.ogg';
    this.music    = 'music/pruebas/test.ogg';
    this.audio    = null;
    this.lastSecs = -1;
    this.points   = [];
    this.pointsDrawed = 0;
    this.clicks = 0;
    this.clicksOk = 0;
}

Game.prototype.getAudioSamples = function(event, game) {
    
    var data = event.frameBuffer;
    var draw = false;

    var min = Math.min.apply(null,data);
    var max = Math.max.apply(null,data);

    var value = Math.round((max - min) * 1000) / 1000;
    
    if(this.lastSecs != Math.floor(event.time)){
        this.points.shift();
        this.lastSecs = Math.floor(event.time); 
        draw = true;
    }

    if(value > 1.7 && this.points.length < 3){
        
        this.points.push(new Point({
            x: Math.random() * 310,
            y: Math.random() * 310,
            color: ['green','red','yellow','orange','white'][Math.floor(Math.random() * 5)],
            value: value
        }));
        
        this.pointsDrawed++;
    }
    
    if(draw){
        
        this.ctx.clearRect(0, 0, this.board.width, this.board.height);   
        
        for(var i = 0; i < this.points.length; i++){
            this.ctx.beginPath();
            this.ctx.arc(this.points[i].x, this.points[i].y, 40, 0, 2 * Math.PI, false);
            this.ctx.fillStyle = this.points[i].color;
            this.globalAlpha = 0.5;
            this.ctx.fill();
            this.ctx.lineWidth = 1;
            this.ctx.strokeStyle = '#003300';
            this.ctx.stroke(); 
        }
    }
}

Game.prototype.gameEnded = function(game) {
    alert("Result!\nClicked: " + this.clicks + "\nClicked Ok: " + this.clicksOk);
}

Game.prototype.start = function() {
    
    this.lastSecs = -1;
    this.pointsDrawed = 0;
    this.audio = new Audio();
    this.audio.src = this.music;

    this.pointsDrawed = 0;
    this.clicks = 0;
    this.clicksOk = 0;

    this.audio.play();

    this.audio.addEventListener('MozAudioAvailable', function(event){ game.getAudioSamples(event); }, false);
    this.audio.addEventListener('ended', function(event){ game.gameEnded(event); }, false);

    this.ctx.clearRect(0, 0, this.board.width, this.board.height);
    
    $('#container canvas').click( function( e ){
        var p = $('canvas').offset();        
        game.clickAt({
            x: parseInt((e.pageX - p.left)),
            y: parseInt((e.pageY - p.top))
        });
    });
}

Game.prototype.clickAt = function( click ) {
    this.clicks++;
    for(var i = 0; i < this.points.length; i++){
        if( Math.pow(click.x - this.points[i].x, 2) + Math.pow(click.y - this.points[i].y, 2) < Math.pow(40, 2)){
            if(!this.points[i].clicked){
                this.clicksOk++;
            }
            this.points[i].clicked = true;
            break;
        }
    }
}

function Ui( game ) {
    this.game = game;
    this.mainMenu = $('#main-menu').show();
    this.game_    = $('#game').hide();
    
    this.mainMenuArcade = this.mainMenu.find('a.arcade');
    var that = this;
    this.mainMenuArcade.click(function(){
        setTimeout( function(){ window.scrollTo(0, 1);}, 1 );
        that.mainMenu.hide();
        that.game_.show();
        that.game.start();
    });
}