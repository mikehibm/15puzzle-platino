(function() {
	var platino = require('co.lanica.platino');
	var ALmixer = platino.require('co.lanica.almixer');
	var Stage = require('Stage');
	var PieceFactory = require('Piece');
	var ImageButton = require('ImageButton');

    var STATE = {
        LOADING: "loading",
        PLAYING: "playing",
        COMPLETE: "complete",
        TIMEUP: "timeup"
    };

	var GameScene = function(window, game, options) {
        var state = STATE.LOADING;
		var CENTER_X = game.screen.width / 2;
		var CENTER_Y = game.screen.height / 2;
		
		var scene = platino.createScene();
		
		var bg, btnHome, btnRestart
	      , timeBar, timeBarBg01, timeBarBg02
	      , timeUpLabel, scoreLabel, timeStart, timeNow
	      , cloud1, cloud2, cloud3;
		
		//BGMと効果音を読み込む。
	    var bgm = ALmixer.LoadAll('sounds/game_maoudamashii_7_rock52.mp3');
	    var se_clear = ALmixer.LoadAll('sounds/se_maoudamashii_9_jingle06.mp3');
	    var se_correct = ALmixer.LoadAll("sounds/se_maoudamashii_se_finger01.mp3");
        var se_ng = ALmixer.LoadAll("sounds/se_maoudamashii_onepoint26.mp3");

	    var puzzle = new Stage(options);
	    var ROWS = puzzle.rows;
	    var COLS = puzzle.cols;
	    var PADDING_X = game.screen.width * 0.08;
	    var PIECE_W = (game.screen.width - (PADDING_X*2))/COLS;
	    var PIECE_H = (game.screen.width - (PADDING_X*2))/ROWS;
	    var pieceGroup = [];

		
		var onGameScreenTouch = function(e) {
			Ti.API.info("Screen touched.", e.type, e.x, e.y, game.touchScaleX, game.touchScaleY);
			var pos_x = e.x * game.touchScaleX;
			var pos_y = e.y * game.touchScaleY;
			Ti.API.info("converted = ", pos_x, pos_y);
			if (scene && scene.forwardTouchToSprites){
	  			scene.forwardTouchToSprites(e.type, pos_x, pos_y);
			}
	    };
		
		var onHomeTouch = function(e){
			Ti.API.info("Home button touched.");

			ALmixer.HaltChannel(0);
			var TitleScene  = require("TitleScene");
			game.currentScene = new TitleScene(window, game);
			game.replaceScene(game.currentScene);
		};
		
		var onRestartTouch = function(e){
			Ti.API.info("Restart button touched.");
			
			startShuffle();
			ALmixer.PlayChannel(0, bgm, -1);
		};
		
	    var startShuffle = function(){
	        if (timeUpLabel){
	            scene.remove(timeUpLabel);
	            timeUpLabel.dispose();
	            timeUpLabel = null;
	        }
	        state = STATE.LOADING;
	        puzzle.shufflePieces();
	        updatePieces();
	        timeStart = -1;
	        timeNow = 0;
	        timeBar.scaleX = 1;
	        state = STATE.PLAYING;
	    };
	
        var calcPiecePos = function(row, col){
            return { 
            		 x: CENTER_X - (COLS / 2 * PIECE_W) + (col * PIECE_W) + PIECE_W / 2, 
            		 y: CENTER_Y - (ROWS / 2 * PIECE_H) + (row * PIECE_H) + PIECE_H / 2
            	   };
        };

	    var showPieces = function (puzzle, level){
	        var piece, number, isBlank, sprite, i, j , n = 0, pos;
			
			pieceGroup = [];
	        
	        for (i = 0; i < ROWS; ++i){
	            for (j = 0; j < COLS; ++j){
	                number = puzzle.pieces[i][j];
	                isBlank = (number == puzzle.pieceNum);
	                pos = calcPiecePos(i, j);
	            
	                piece = PieceFactory.create(number, isBlank, PIECE_W, PIECE_H, pos);
	                scene.add(piece);
	                pieceGroup.push(piece);
					//Ti.API.info("showPieces: j,i,x,y=", j, i, pos.x, pos.y);
	                piece.addEventListener("piece_touch", onTouchPiece);
	            }
	        }
	    };
	
	    var onTouchPiece = function (e) {
			Ti.API.info("onTouchPiece: ", e.number);
	        if (state !== STATE.PLAYING) return;
	
	        e.moved = puzzle.swapPieces(e.number);
	        if (e.moved){
	            //動いた時の効果音を再生
      			ALmixer.PlayChannel(se_correct);

	            updatePieces();
	            if (puzzle.checkClear()){
	                onClear();
	            }
	        } else {
	            //動かせなかった時の効果音を再生
      			ALmixer.PlayChannel(se_ng);
	        }
	    };
	    
	
	    
	    var findPieceByNum = function (num){
	    	var len = pieceGroup.length;
	    	for (var i = 0; i < len; i++){
		        var piece = pieceGroup[i];
		        if (piece.name === "P" + num){
		        	return piece;
		        }
	    	}
	        return null;
	    };
	    
	    var update = function (e) {
	        if (state !== STATE.PLAYING) return;
	        
	        if (timeStart === undefined || timeStart <= 0){
	        	timeStart = e.uptime;	
	        }
	        timeNow = (e.uptime - timeStart) * 100 | 0;
	        
	        //時間表示を更新
	        scoreLabel.text = game.fillZero(timeNow, 4);
	        puzzle.time = timeNow;
	        
	        //制限時間のバーを更新。
	        if (puzzle.timeLimit * 100 - timeNow <= 0){
	            onTimeUp();
	        } else {
	            timeBar.scaleX = 1.0 - (timeNow / (puzzle.timeLimit * 100));
	        }
	    };
	    
	    var updatePieces = function (){
	        var piece;
	        for (var i = 0; i < ROWS; ++i) {
	            for (var j = 0; j < COLS; ++j) {
	                var num = puzzle.getNumber(i, j);
	                piece = findPieceByNum(num);
	                var new_pos = calcPiecePos(i, j);
	                if (piece.x != new_pos.x || piece.y != new_pos.y){
	                	var transform  = platino.createTransform();
	                	transform.duration = 280;
						transform.x = new_pos.x - piece.width/2;
						transform.y = new_pos.y - piece.height/2;
						transform.easing = platino.ANIMATION_CURVE_QUAD_OUT;
						piece.transform(transform);
	                }
	            }
	        }        
	    };
	    
	    var animateCloud = function (cloud, time){
	        cloud.x = cloud.width + game.screen.width * (1 + Math.random()*0.2);
	        
        	var transform  = platino.createTransform();
        	transform.duration = time;
        	transform.repeat = -1;
			transform.x = -cloud.width;
			cloud.transform(transform);
	    };
	    
	    var onClear = function (){
	        //時間表示・制限時間バーの更新を停止。
	        state = STATE.COMPLETE;

	        //クリアの効果音を再生
      		ALmixer.PlayChannel(se_clear);
	        //BGM再生を停止
			ALmixer.HaltChannel(0);
	
			setTimeout(function(){
				//結果表示画面を開く。
		        options.time = puzzle.time;
				var ResultScene  = require("ResultScene");
				game.currentScene = new ResultScene(window, game, options);
				game.replaceScene(game.currentScene);
			}, 500);
	    };
	    
	    var onTimeUp = function (){
	        state = STATE.TIMEUP;

	        //クリアの効果音を再生
      		ALmixer.PlayChannel(se_clear);
	        //BGM再生を停止
			ALmixer.HaltChannel(0);

	        scoreLabel.text = puzzle.timeLimit + ".00";
	        timeBar.scaleX = 0;
	        
			timeUpLabel = platino.createSprite({image:"images/game_timeup.png" });
			game.setupSpriteSize(timeUpLabel);
	        timeUpLabel.center = {x: CENTER_X, y: CENTER_Y};
			scene.add(timeUpLabel);
	    };
	
		var onSceneActivated = function(e) {
			//背景
			bg = platino.createSprite({ image:"images/game_bg.png" });
			game.setupSpriteSize(bg);
			bg.center = { x: CENTER_X, y: CENTER_Y };
			scene.add(bg);
			
			//雲1
			cloud1 = platino.createSprite({image:"images/game_cloud1.png" });
			scene.add(cloud1);
	        cloud1.y = game.screen.height * (0.1 + Math.random()*0.1);
			
			//雲2
			cloud2 = platino.createSprite({image:"images/game_cloud2.png" });
			scene.add(cloud2);
	        cloud2.y = game.screen.height * (0.2 + Math.random()*0.1);
			
			//雲3
			cloud3 = platino.createSprite({image:"images/game_cloud3.png" });
			scene.add(cloud3);
	        cloud3.y = game.screen.height * (0.3 + Math.random()*0.1);

			//Homeボタン
			btnHome = new ImageButton(game, { image:"images/game_btn_home.png", tag: "home" });
			btnHome.center = { x: 52, y: 52 };
			scene.add(btnHome);

			//Restartボタン
			btnRestart = new ImageButton(game, {image:"images/game_restart.png", tag: "restart" });
			btnRestart.center = { x: CENTER_X, y: game.screen.height - 100 };
			scene.add(btnRestart);

	        // ピースを作成
	        showPieces(puzzle, options.level);
	        
	        //時間を示すバーの生成
	        timeBarBg02 = platino.createSprite( {image: "images/game_timebar_bg02.png"} );
			game.setupSpriteSize(timeBarBg02);
			timeBarBg02.center = { x: CENTER_X, y: 128 };
			scene.add(timeBarBg02);
			
	        timeBar = platino.createSprite( {image: "images/game_timebar.png"} );
			game.setupSpriteSize(timeBar);
			timeBar.center = { x:CENTER_X, y: 126 };
			timeBar.anchorPoint = { x:0, y: 0.5 };
			scene.add(timeBar);

	        timeBarBg01 = platino.createSprite( {image: "images/game_timebar_bg01.png"} );
			game.setupSpriteSize(timeBarBg01);
			timeBarBg01.center = { x: CENTER_X, y: 128 };
			scene.add(timeBarBg01);

			//時間表示用ラベル			
			scoreLabel = platino.createTextSprite({
									text: '00.00', 
									fontSize: 60, 
									width: 200,
									height: 64,
									textAlign: Ti.UI.TEXT_ALIGNMENT_RIGHT
								});
            scoreLabel.color(1, 1, 1);
            scoreLabel.center = { x: CENTER_X+128, y: 50};
            scene.add(scoreLabel);

			btnHome.addEventListener('tapped', onHomeTouch);
			btnRestart.addEventListener('tapped', onRestartTouch);
			
   			game.addEventListener('touchstart', onGameScreenTouch);
			Ti.API.info("GameScene touchstart event added.");

	        //シャッフルよりも先に最初の描画処理を走らせるためにsetTimeoutが必要。
	        setTimeout(function(){
	            //シャッフルしてゲーム開始。
	            startShuffle();
	    
	            //タイムのカウントを開始。
				game.addEventListener('enterframe', update);
	        }, 50);
	        
	        //雲のアニメーションを開始。
	        animateCloud(cloud1, 8000);
	        animateCloud(cloud2, 7000);
	        animateCloud(cloud3, 6000);

			//BGMを再生開始。
			ALmixer.PlayChannel(0, bgm, -1);
			game.startCurrentScene();
		};

		var onSceneDeactivated = function(e) {
			game.removeEventListener('enterframe', update);
	        game.removeEventListener('touchstart', onGameScreenTouch);

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

			if (btnRestart){
		        btnRestart.removeEventListener('tapped', onRestartTouch);
				scene.remove(btnRestart);
				btnRestart.cleanup();
	            btnRestart = null;
			}
			
			if (timeBar){
				scene.remove(timeBar);
				timeBar.dispose();
				timeBar = null;
			}
			
			if (timeBarBg01){
				scene.remove(timeBarBg01);
				timeBarBg01.dispose();
				timeBarBg01 = null;
			}
			
			if (timeBarBg02){
				scene.remove(timeBarBg02);
				timeBarBg02.dispose();
				timeBarBg02 = null;
			}
			
			if (timeUpLabel){
				scene.remove(timeUpLabel);
				timeUpLabel.dispose();
				timeUpLabel = null;
			}
			
			if (scoreLabel){
				scene.remove(scoreLabel);
				scoreLabel.dispose();
				scoreLabel = null;
			}
	        if (cloud1){
				scene.remove(cloud1);
				cloud1.dispose();
				cloud1 = null;
	        }
	        
	        if (cloud2){
				scene.remove(cloud2);
				cloud2.dispose();
				cloud2 = null;
	        }
	        
	        if (cloud3){
				scene.remove(cloud3);
				cloud3.dispose();
				cloud3 = null;
	        }

			if (scene){
	        	scene.dispose();
	        	scene = null;
			}
        	
			Ti.API.info("GameScene has been deactivated.");
		};

		scene.addEventListener('activated', onSceneActivated);
		scene.addEventListener('deactivated', onSceneDeactivated);
		return scene;
	};

	module.exports = GameScene;
}).call(this);


