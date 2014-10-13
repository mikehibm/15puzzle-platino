var platino = require('co.lanica.platino');

(function() {
	var ApplicationWindow = function() {
		
		var tmp_numbers = [];
		
		var window = Ti.UI.createWindow({
			backgroundColor: 'black',
			orientationModes: [Ti.UI.PORTRAIT, Ti.UI.UPSIDE_PORTRAIT], //others: Ti.UI.LANDSCAPE_LEFT, Ti.UI.LANDSCAPE_RIGHT
			fullscreen: true,
			statusBarHidden: true,
			navBarHidden: true
		});


	    if (Ti.Platform.osname == 'android') {
	    	//Hide ActionBar on Android.
			window.addEventListener('open', function(){
				if (window.activity && window.activity.actionBar){
		  			window.activity.actionBar.hide();
				}
			});
	    }

		var game = platino.createGameView();
		
	    if (Ti.Platform.osname == 'android') {
			game.fps = 60;	//Androidでは少しFPSを落とした方が無難かも。
		} else {
			game.fps = 60;
		}
		
		game.color(0, 0, 0);
		game.debug = false; // disables debug logs (not to be used for production)

		// additional options: 
		game.keepScreenOn = false;
		game.textureFilter = platino.OPENGL_LINEAR;
		game.setUsePerspective(false); // for isometric
		game.enableOnDrawFrameEvent = true;
		game.enableOnLoadSpriteEvent = false; // optimization: disables 'onloadsprite' and 'onunloadsprite' event except selected sprite by registerOnLoadSpriteName(name) or registerOnLoadSpriteTag(tag)
		game.enableOnLoadTextureEvent = false; // optimization: disables 'onloadtexture' event except selected texture by registerOnLoadTextureName(name)
		game.enableOnFpsEvent = false; // optimization: disables 'onfps' event
		//game.onFpsInterval = 5000; // sets 'onfps' event interval in msec (default: 5000)

		// Set your target screen resolution (in points) below
		var screenWidth = Ti.Platform.displayCaps.platformWidth;
		var screenHeight = Ti.Platform.displayCaps.platformHeight;
		Ti.API.info("Screen Size = ", screenWidth, screenHeight);
		
		game.TARGET_SCREEN = {
			width: 640,
			height: screenHeight * 640 / screenWidth
		};
		Ti.API.info("game.TARGET_SCREEN = ", game.TARGET_SCREEN.width, game.TARGET_SCREEN.height);
		
		game.touchScaleX = 1;
		game.touchScaleY = 1;

		// Updates screen scale
		var updateScreenSize = function() {
			Ti.API.info("game.size = ", game.size.width, game.size.height);
			var screenScale = game.size.width / game.TARGET_SCREEN.width;

			game.screen = {
				width: game.size.width / screenScale,
				height: game.size.height / screenScale
			};
			Ti.API.info("game.screen = ", game.screen.width, game.screen.height);

			game.touchScaleX = game.screen.width  / screenWidth;
			game.touchScaleY = game.screen.height / screenHeight;
			game.screenScale = game.screen.width / game.TARGET_SCREEN.width;
			
			Ti.API.info("touchScaleX,Y = ", game.touchScaleX, game.touchScaleY);
			Ti.API.info("screenScale = ", screenScale);
		};

		// Loads TitleScene.js as starting point to the app
		game.addEventListener('onload', function(e) {
			updateScreenSize();

			var TitleScene  = require("TitleScene");
			game.currentScene = new TitleScene(window, game);
			game.pushScene(game.currentScene);
			game.start();
		});

		game.addEventListener('onsurfacechanged', function(e) {
				game.orientation = e.orientation;
				updateScreenSize();
		});
		
		// Convenience function to convert Titanium coordinate from a Platino coordinate
		game.getTiScale = function(x, y) {
			return {
					x: (x / game.touchScaleX),
					y: (y / game.touchScaleY) 
				};
		};

		game.setupSpriteSize = function(sprite, zoom_x, zoom_y) {
			if (!zoom_x) zoom_x = 1.0;
			if (!zoom_y) zoom_y = 1.0;
			var width = sprite.width * zoom_x / game.screenScale;
			var height = sprite.height * zoom_y / game.screenScale;
			sprite.width = (width < 1) ? 1 : width;
			sprite.height = (height < 1) ? 1 : height;
		};
		
		game.fillZero = function( value, length ) {
	    	var str = String(value); 
            if (str.length < length){
            	tmp_numbers.length = 0;
            	tmp_numbers.length = ( length + 1 ) - str.length; 
            	str = tmp_numbers.join( '0' ) + value;
           }
           return str.slice(0,2) + "." + str.slice(2);
        };
	
		
		// Free up game resources when window is closed
		window.addEventListener('close', function(e) {
			game = null;
		});
		
	    // Show exit dialog when Android back button is pressed
	    var closing = false;
	    window.addEventListener('android:back', function(e) {
	        if (closing) return;
	        closing = true;
	        
	        var dlg = Ti.UI.createAlertDialog({ message : 'Exit?', buttonNames : ['OK','Cancel']});
	            dlg.addEventListener("click", function(e) {
	            if (e.index === 0) {
	            
	                // push closing scene on top of scenes
	                // so that gameview can have chance to clean all resources
	                var ClosingScene  = require("ClosingScene");
	                game.currentScene = new ClosingScene(window, game);
	                game.pushScene(game.currentScene);
	                
	                dlg.hide();
	            } else {
	                closing = false;
	            }
	        });
	    
	        dlg.show();
	    });
	    
		window.add(game);
		return window;
	};

	module.exports = ApplicationWindow;
})();







