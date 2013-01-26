$(document).ready( function(){
    setTimeout( function(){ window.scrollTo(0, 1);}, 1 );
    $('#game a').click( function(){
        $('#game a').removeClass('selected');
        switch ( $(this).attr('class') ) {
            case 'red'   : game.color = 1; break;
            case 'green' : game.color = 2; break;
            case 'blue'  : game.color = 3; break;
            case 'yellow': game.color = 4; break;
        }
        $(this).addClass('selected');
    });
    game = new Game();
    $(window).bind('orientationchange');
});

function Game() {
    var canvas1     = document.getElementById('canvas1');
    var canvas2     = document.getElementById('canvas2');
    this.ctx1       = canvas1.getContext('2d');
    this.ctx2       = canvas2.getContext('2d');
    this.click      = null;
    this.resolution = 300/4;
    this.areas      = []
    this.color      = 1;
    this.level      = 1;
    this.ui         = new Ui( this );
}

Game.prototype.loadLevel = function() {
    $('#game h1').html('Level '+this.level );
    this.areas = [];
    if ( this.level == 1 ) {
        this.areas.push(new Area({game:this,id:0,points:[0,2,22,20],neighbours:[1]}));
        this.areas.push(new Area({game:this,id:1,points:[2,4,24,22],neighbours:[0]}));
    } else if ( this.level == 2 ) {
        this.areas.push(new Area({game:this,id:0,points:[0,2,12],neighbours:[1,2]}));
        this.areas.push(new Area({game:this,id:1,points:[0,12,10],neighbours:[0,6]}));
        this.areas.push(new Area({game:this,id:2,points:[2,8,13,12],neighbours:[0,3,4,5]}));
        this.areas.push(new Area({game:this,id:3,points:[2,4,9,8],neighbours:[2,4]}));
        this.areas.push(new Area({game:this,id:4,points:[8,9,19,18],neighbours:[2,3,5]}));
        this.areas.push(new Area({game:this,id:5,points:[12,13,18,19,24,22],neighbours:[2,4,8]}));
        this.areas.push(new Area({game:this,id:6,points:[10,12,15],neighbours:[1,8]}));
        this.areas.push(new Area({game:this,id:7,points:[15,21,20],neighbours:[8]}));
        this.areas.push(new Area({game:this,id:8,points:[12,22,21,15],neighbours:[5,6,7]}));
    }
}
Game.prototype.start = function() {
    this.ctx1.clearRect(0,0,310,310);
    this.ctx2.clearRect(0,0,310,310);
    this.loadLevel();
    $('#container canvas').click( function( e ){
        var p = $('canvas').offset();        
        game.clickAt({x:parseInt((e.pageX-p.left)),y:parseInt((e.pageY-p.top))});
    });
    for ( var i=0; i<this.areas.length; i++ ) {
        var a = this.areas[i];
        a.drawLines( this.ctx2 );
    }
}
Game.prototype.clickAt = function( click ) {
    this.click = click;
    for ( var i=0; i<this.areas.length; i++ ) {
        var a = this.areas[i];
        a.draw( this.ctx1 );
    }
    var ok = true;
    for ( var i=0; i<this.areas.length; i++ ) {
        var a = this.areas[i];
        if ( !a.isOk() ) {
            ok = false;
        }
    }
    if ( ok ) {
        if ( this.level == 2 ) {
            alert('You reached the end of the DEMO');
            var that = this;
            setTimeout( function(){
                $('#container canvas').unbind('click');
                $('#game').hide();
                $('#main-menu').show();
            },1000);
        } else {
            var that = this;
            setTimeout( function(){
                $('#container canvas').unbind('click');
                that.level++;
                that.start();
            },1000);
        }
    }
}
function Area( args ) {
    this.game       = args.game;
    this.id         = args.id;
    this.points     = args.points;
    this.neighbours = args.neighbours;
    this.color      = 0;
}
Area.prototype.isOk = function() {
    if ( this.color == 0 ) return false;
    for ( var i=0; i<this.neighbours.length; i++ ) {
        var id = this.neighbours[i];
        var color = this.game.areas[id].color;
        if ( color == this.color ) return false;
    }
    return true;
}
Area.prototype.draw = function( ctx ) {
    ctx.beginPath();
    for ( var i=0; i<this.points.length; i++ ) {
        var p = this.xy( this.points[i] );
        if ( i == 0 ) ctx.moveTo( 5+p.x+0.5, 5+p.y+0.5 );
        else ctx.lineTo( 5+p.x+0.5, 5+p.y+0.5 );
    }
    ctx.closePath();
    var colors = ['','#f84732','#63b352','rgb(34,169,253)','#fed100'];
    if ( this.color > 0 ) {
        ctx.fillStyle = colors[this.color];
        ctx.fill();
    }
    if ( this.game.click && ctx.isPointInPath( this.game.click.x, this.game.click.y ) ) {
        this.color = this.game.color;
        this.game.click = null;
        ctx.fillStyle = colors[this.color];
        ctx.fill();
    }
}
Area.prototype.drawLines = function( ctx ) {
    ctx.beginPath();
    for ( var i=0; i<this.points.length; i++ ) {
        var p = this.xy( this.points[i] );
        if ( i == 0 ) ctx.moveTo( 5+p.x+0.5, 5+p.y+0.5 );
        else ctx.lineTo( 5+p.x+0.5, 5+p.y+0.5 );
    }
    ctx.closePath();
    ctx.lineWidth   = 2;
    ctx.lineJoin    = "round";	
    ctx.strokeStyle = 'white';
    ctx.stroke();
}
Area.prototype.xy = function( point ) {
    return {x:this.game.resolution*(point%5),y:this.game.resolution*parseInt(point/5)};
}
function Ui( game ) {
    this.game = game;
    this.mainMenu = $('#main-menu').show();
    this.levels   = $('#levels').hide();
    this.game_     = $('#game').hide();
    
    this.mainMenuArcade = this.mainMenu.find('a.arcade');
    var that = this;
    this.mainMenuArcade.click(function(){
        setTimeout( function(){ window.scrollTo(0, 1);}, 1 );
        that.mainMenu.hide();
        that.levels.show(); 
    });
    this.levels.find('a').click( function(){
        if ( parseInt($(this).text()) > 0 ) {
            var level = parseInt($(this).text());
            that.levels.hide();
            that.game.level = level;
            that.game.start();
            that.game_.show();
        }
    });
}