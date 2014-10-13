(function() {

    //SpriteはBuiltinクラスで継承出来ないため、Factoryパターンを使用
    var PieceFactory = {

        create: function(number, isBlank, w, h, pos ) {
			var sprite = platino.createSprite({image:"images/game_mikan.png", tag: number, center: pos });
            sprite.width = w * 0.95;
			sprite.height = h * 0.95;
			sprite.anchorPoint = { x: 0.5, y: 0.5 };
            sprite.followParentAlpha = false;

            if (!isBlank){
				var FONT_SIZE = 50;
				var shadow = platino.createTextSprite({
										text: ''+number, 
										fontSize: FONT_SIZE, 
										textAlign: Ti.UI.TEXT_ALIGNMENT_CENTER
									});
                shadow.color(1, 1, 1);
                
                var offset_x = 0, offset_y = 0;
           		if (Ti.Platform.osname == 'android') {
           			offset_x = 14 + (number >= 10 ? 14 : 0);
           			offset_y = 28;
				}
                shadow.x = (sprite.width - shadow.width) / 2 + 3 - offset_x;
                shadow.y = (sprite.height - shadow.height) / 2 + 3 - offset_y;
                sprite.addChildNode(shadow);
            
				var text = platino.createTextSprite({
										text: ''+number, 
										fontSize: FONT_SIZE, 
										textAlign: Ti.UI.TEXT_ALIGNMENT_CENTER
									});
                text.color(0.65, 0.35, 0.1);
                text.x = (sprite.width - text.width) / 2 - offset_x;
                text.y = (sprite.height - text.height) / 2 - offset_y;
                sprite.addChildNode(text);
    
				sprite.addEventListener('touchstart', function(){
					Ti.API.info("Piece: touchstart.");
                    var e = { type: "piece_touch",
                    		  number: number,
                    		  piece: sprite,
                    		  moved: false
                    		 };
                    sprite.fireEvent(e.type, e);
					Ti.API.info("Piece: touchstart: e.moved=", e.moved);
                    if (!e.moved){
                        //var cur_pos = puzzle.locateNumber(number);
                        // var cur_x = sprite.parent.parent.calcPiecePos(cur_pos.row, cur_pos.col).x;
                        // createjs.Tween.get(sprite, {loop:false})
                                // .to({alpha:0.2, x:cur_x-10}, 120, createjs.Ease.quadIn)
                                // .to({alpha:1,   x:cur_x+10}, 120, createjs.Ease.quadIn)
                                // .to({x:cur_x}, 120, createjs.Ease.quadIn);
                    }
				});
    
            } else {
            	sprite.alpha = 0;
            }
            
            // 数値をセット
            sprite.number = number;
	        sprite.name = "P" + number;
            sprite.isBlank = isBlank;

            return sprite;
        }
        
    };

	module.exports = PieceFactory;
}).call(this);







