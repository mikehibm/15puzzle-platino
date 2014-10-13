var platino = require('co.lanica.platino');

var ImageButton = function(game, options) {
	
	var btn = platino.createSprite(options);
	var done = false;
	
	btn.onTouchStart = function(e){
		if (done) return;
		done = true;
		btn.scale(1.1);	
		setTimeout(function(){
			btn.scale(1.0);
			btn.fireEvent('tapped', { x: e.x, y: e.y });
			done = false;
		}, 200);
	};
	
	btn.cleanup = function(){
		btn.removeEventListener('touchstart', btn.onTouchStart);
		btn.dispose();
		Ti.API.info("ImageButton disposed.");
	};

	game.setupSpriteSize(btn);
	btn.addEventListener('touchstart', btn.onTouchStart);
	return btn;
};

module.exports = ImageButton;








