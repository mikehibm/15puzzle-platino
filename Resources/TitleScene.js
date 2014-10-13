(function() {
	var platino = require('co.lanica.platino');
	var ALmixer = platino.require('co.lanica.almixer');
	var ImageButton = require('ImageButton');

    //Use Transtion module.  https://github.com/jonbeebe/net.jonbeebe.platino.transition
	var Transition = require('net.jonbeebe.platino.transition');

	var TitleScene = function(window, game) {
		var CENTER_X = game.screen.width / 2;
		var CENTER_Y = game.screen.height / 2;

		var scene = platino.createScene();
		var bg, start0, start1, start2; 
		var transition = [], pieces = [];
		var tapped = false;
		
		//BGMを読み込む。
	    var bgm = ALmixer.LoadAll('sounds/game_maoudamashii_7_rock54.mp3');
		
	    var gotoGameScene = function(level){
	    	level = level-0;	//文字列を数値化。
	        var options = {
	            level:level, 
	            rows: level+3, 
	            cols: level+3, 
	            shuffleCount: (level+1) * 30,
	            timeLimit: 60
	        };
					
			var GameScene = require("GameScene");
			game.currentScene = new GameScene(window, game, options);
			game.replaceScene(game.currentScene);
	    };
	    
		var onScreenTouch = function(e) {
			var pos_x = e.x * game.touchScaleX;
			var pos_y = e.y * game.touchScaleY;
			if (scene && scene.forwardTouchToSprites){
	  			scene.forwardTouchToSprites(e.type, pos_x, pos_y);
			}
	    };
		
		var onStartButtonTapped = function(e){
			Ti.API.info("Start button tapped.", e.type);
			if (tapped) return;
			tapped = true;
			var type= e.type, sprite = e.source;
			var level = sprite.tag;
	        game.removeEventListener('touchstart', onScreenTouch);
			ALmixer.HaltChannel(0);
			gotoGameScene(level);
		};
		
		var onButtonTouch = function(e){
			Ti.API.info("Start button touched.");
			if (tapped) return;
			tapped = true;
			var type= e.type, sprite = e.source;
			var level = sprite.tag;
			
			if (level){
		        game.removeEventListener('touchstart', onScreenTouch);
				sprite.scale(1.1);
				
				setTimeout(function(){
					sprite.scale(1.0);
					ALmixer.HaltChannel(0);
					gotoGameScene(level);
				}, 300);
			}
		};
		
		var animatePieces = function(){
	        var pos = [{x: CENTER_X-280, y: CENTER_Y-448}, {x: CENTER_X+150, y: CENTER_Y-448}
	        		 , {x: CENTER_X+150, y: CENTER_Y-228}, {x: CENTER_X-280, y: CENTER_Y-228}];
	        var delay = 1000;
	        
	        for (var i = 0; i < 3; i++){
	            pieces[i] = platino.createSprite({image:"images/game_mikan.png" });
				game.setupSpriteSize(pieces[i], 0.4, 0.4);
	            //pieces[i].center = { x: pos[i].x, y: pos[i].y};	//これだとiOSとAndroidで描画位置が異なる。Androidだと中心指定にならない。
	            pieces[i].x = pos[i].x;
	            pieces[i].y = pos[i].y;
	            scene.add(pieces[i]);
	            
                transition[i] = new Transition([
					    { delay: delay*(2-i) }
					    ,{ duration: delay, x: pos[(i+1) % 4].x, y: pos[(i+1) % 4].y, easing: platino.ANIMATION_CURVE_CUBIC_OUT }
					    ,{ delay: delay*2 }
					    ,{ duration: delay, x: pos[(i+2) % 4].x, y: pos[(i+2) % 4].y, easing: platino.ANIMATION_CURVE_CUBIC_OUT }
					    ,{ delay: delay*2 }
					    ,{ duration: delay, x: pos[(i+3) % 4].x, y: pos[(i+3) % 4].y, easing: platino.ANIMATION_CURVE_CUBIC_OUT }
					    ,{ delay: delay*2 }
					    ,{ duration: delay, x: pos[i].x, y: pos[i].y, easing: platino.ANIMATION_CURVE_CUBIC_OUT }
					    ,{ delay: delay*i }
					]);
				transition[i].animate(pieces[i], -1);
	        }
	    };
	    

		
		var onSceneActivated = function(e) {
			Ti.API.info("TitleScene is being activated.");

			bg = platino.createSprite({ image:"images/game_title_bg.png" });
			game.setupSpriteSize(bg);
			bg.center = { x: CENTER_X, y: CENTER_Y };
			scene.add(bg);

			start0 = new ImageButton(game, { image:"images/game_start_easy.png", tag: "0" });
			start0.center = { x: CENTER_X, y: CENTER_Y };
			scene.add(start0);

			start1 = new ImageButton(game, {image:"images/game_start_normal.png", tag: "1" });
			start1.center = { x: CENTER_X, y: CENTER_Y+100 };
			scene.add(start1);

			start2 = new ImageButton(game, {image:"images/game_start_hard.png", tag: "2" });
			start2.center = { x: CENTER_X, y: CENTER_Y+200 };
			scene.add(start2);
			
			start0.addEventListener('tapped', onStartButtonTapped);
			start1.addEventListener('tapped', onStartButtonTapped);
			start2.addEventListener('tapped', onStartButtonTapped);
   			game.addEventListener('touchstart', onScreenTouch);
   			
			//BGM再生を開始。
			ALmixer.PlayChannel(0, bgm, -1);

	        //パズルピースのアニメーションを開始。
	        animatePieces();

			game.startCurrentScene();
			Ti.API.info("TitleScene activate DONE.");
        };

		var onSceneDeactivated = function(e) {
			if (bg){
				scene.remove(bg);
				bg.dispose();
	            bg = null;
			}

			if (start0){
		        start0.removeEventListener('tapped', onStartButtonTapped);
				scene.remove(start0);
	        	start0.cleanup();
	            start0 = null;
			}            

			if (start1){
		        start1.removeEventListener('tapped', onStartButtonTapped);
				scene.remove(start1);
				start1.cleanup();
	            start1 = null;
			}

			if (start2){
		        start2.removeEventListener('tapped', onStartButtonTapped);
				scene.remove(start2);
				start2.cleanup();
	            start2 = null;
			}
			
			if (transition){
				transition.forEach(function(element, index, array){
					element.dispose();
					transition[index] = null;
				});
				transition.length = 0;
				transition = null;
			}
			
			if (pieces){
				pieces.forEach(function(element, index, array){
					scene.remove(element);
					element.dispose();
					pieces[index] = null;
				});
				pieces.length = 0;
				pieces = null;
			}

			if (scene){
	        	scene.dispose();
	        	scene = null;
			}
        	
        	Ti.API.info("TitleScene deactivated.");
		};

		scene.addEventListener('activated', onSceneActivated);
		scene.addEventListener('deactivated', onSceneDeactivated);
		return scene;
	};

	module.exports = TitleScene;
}).call(this);


