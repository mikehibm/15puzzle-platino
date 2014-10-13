(function() {
	var platino = require('co.lanica.platino');
	var Ranking = require('Ranking');
	var ImageButton = require('ImageButton');

    //Use Transtion module.  https://github.com/jonbeebe/net.jonbeebe.platino.transition
	var Transition = require('net.jonbeebe.platino.transition');

	var ResultScene = function(window, game, options) {
		var CENTER_X = game.screen.width / 2;
		var CENTER_Y = game.screen.height / 2;
		
		var scene = platino.createScene();
		var bg, btnHome, scoreLabel, highScoreLabel;
		var highScoreTranstion;
		
		var onResultScreenTouch = function(e) {
			var pos_x = e.x * game.touchScaleX;
			var pos_y = e.y * game.touchScaleY;
			if (scene && scene.forwardTouchToSprites){
	  			scene.forwardTouchToSprites(e.type, pos_x, pos_y);
			}
	    };
		
		var onHomeTouch = function(e){
			ALmixer.HaltChannel(0);
			var TitleScene  = require("TitleScene");
			game.currentScene = new TitleScene(window, game);
			game.replaceScene(game.currentScene);
		};
		
		
		//スコアの表示
		var showScore = function() {
	        var HIGHSCORE_Y = CENTER_Y - 260;
	        var RANKING_Y = CENTER_Y - 180;
	        var HIGHSCORE_COLOR = 0xFF8888;
	
            var sc = Math.round(options.time) +"";
            sc = (sc.substr(0, sc.length-2) || "0") + '"' + sc.substr(sc.length-2, 2);

			//時間表示用ラベル			
			scoreLabel = platino.createTextSprite({
									text: sc,  
									fontSize: 90, 
									width: 300,
									height: 96,
									textAlign: Ti.UI.TEXT_ALIGNMENT_CENTER
								});
            scoreLabel.color(1, 1, 1);
            scoreLabel.center = { x: CENTER_X, y: HIGHSCORE_Y -96};
            scene.add(scoreLabel);

			//ランキング情報を取得。	        
	        var ranking = new Ranking();
	        var level = options.level+"";
	        var name = "";
	        var time = options.time -0;
	        ranking.submit(level, name, time, function(ranking){
	            Ti.API.info("Ranking: ", JSON.stringify(ranking));
	
	            var is_best = ranking.rank <= 1;
	            if (is_best){
					highScoreLabel = platino.createTextSprite({
											text: "NEW HIGH SCORE!!", 
											fontSize: 72, 
											width: 660,
											height: 74,
											textAlign: Ti.UI.TEXT_ALIGNMENT_CENTER
										});
	                highScoreLabel.color(1, 0.4, 0.4);
	                highScoreLabel.center = { x: CENTER_X +640, y: HIGHSCORE_Y}; 
	                highScoreLabel.text = "NEW HIGH SCORE!!";
	                scene.add(highScoreLabel);
	                
	                highScoreTranstion = new Transition([
						     { duration: 1000, x: CENTER_X-highScoreLabel.width/2, easing: platino.ANIMATION_CURVE_QUAD_OUT }
						    ,{ duration: 500, alpha: 0, easing: platino.ANIMATION_CURVE_CUBIC_OUT }
						    ,{ duration: 1000, alpha: 1, easing: platino.ANIMATION_CURVE_CUBIC_OUT }
						    ,{ delay: 500 }
						    ,{ duration: 1000, x: game.screen.width*-2, easing: platino.ANIMATION_CURVE_QUAD_IN }
						    ,{ duration: 1, x: game.screen.width*2 }
						]);
					highScoreTranstion.animate(highScoreLabel, -1);
	            }
	                
	            for (var i = 0; i < 10; ++i){
					var lblNum = platino.createTextSprite({
											text: (i+1) + ". ", 
											fontSize: 38, 
											width: 70,
											height: 40,
											textAlign: Ti.UI.TEXT_ALIGNMENT_RIGHT
										});
	                lblNum.color(1, 1, 1);
	                lblNum.x = CENTER_X - 260 + ((i / 5)|0) * 290;
	                lblNum.y = RANKING_Y + (i % 5)*50;
	                scene.add(lblNum);
	
	                if (ranking.top10[i] && ranking.top10[i].score){
	                    var sc = Math.round(ranking.top10[i].score) +"";
	                    sc = (sc.substr(0, sc.length-2) || "0") + '"' + sc.substr(sc.length-2, 2);
	
						var label = platino.createTextSprite({
												text: sc, 
												fontSize: 38, 
												width: 200,
												height: 40,
												textAlign: Ti.UI.TEXT_ALIGNMENT_LEFT
											});
	                    label.color(1, 1, 1);
	                    label.x = CENTER_X - 166 + ((i / 5)|0) * 270;
	                    label.y = RANKING_Y + (i % 5)*50;
	                    scene.add(label);
	                    
	                    //Top 10に今回のスコアが入っている時は赤色で点滅表示。
	                    if (ranking.rank == i+1){
	                        lblNum.color(1, 0.4, 0.4);
	                        label.color(1, 0.4, 0.4);

	                        [lblNum, label].forEach(function(element, index, array){
			                	var transform  = platino.createTransform({
									                		duration: 500,
									                		alpha: 0,
									                		easing: platino.ANIMATION_CURVE_CUBIC_IN,
									                		autoreverse: true,
									                		repeat: -1
								                	});
								element.transform(transform);
	                        });
	                    }
	                }
	            }
	        });
	    };
	    
		var onSceneActivated = function(e) {
			Ti.API.info("ResultScene has been activated.");
			
			bg = platino.createSprite({ image:"images/game_bg.png" });
			game.setupSpriteSize(bg);
			bg.center = { x: CENTER_X, y: CENTER_Y };
			bg.alpha = 0.4;
			scene.add(bg);

			btnHome = new ImageButton(game, { image:"images/game_btn_home.png", tag: "home" });
			btnHome.center = { x: 52, y: 52 };
			scene.add(btnHome);

			//スコアを表示。
			showScore();
			
			btnHome.addEventListener('tapped', onHomeTouch);
   			game.addEventListener('touchstart', onResultScreenTouch);
			game.startCurrentScene();
		};

		var onSceneDeactivated = function(e) {
	        game.removeEventListener('touchstart', onResultScreenTouch);
			Ti.API.info("ResultScene touchstart event removed.");

			if (bg){
				scene.remove(bg);
				bg.dispose();
	            bg = null;
			}

			if (btnHome){
		        btnHome.removeEventListener('tapped', onHomeTouch);
				scene.remove(btnHome);
				btnHome.cleanup();
	            btnHome = null;
			}
			
			if (highScoreTranstion){
				highScoreTranstion.dispose();
				highScoreTranstion = null;
			}

			if (scene){
	        	scene.dispose();
	        	scene = null;
			}
        	
			Ti.API.info("ResultScene has been deactivated.");
		};
		

		scene.addEventListener('activated', onSceneActivated);
		scene.addEventListener('deactivated', onSceneDeactivated);
		return scene;
	};

	module.exports = ResultScene;
}).call(this);







