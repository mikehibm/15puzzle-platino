/*
 * Single Window Application Template:
 * A basic starting point for your application.  Mostly a blank canvas.
 *
 * In app.js, we generally take care of a few things:
 * - Bootstrap the application with any data we need
 * - Check for dependencies like device type, platform version or network connection
 * - Require and open our top-level UI component
 *
 */

//bootstrap and check dependencies
if (Ti.version < 1.8) {
  alert('Sorry - this application template requires Titanium Mobile SDK 1.8 or later');
}

var platino = require('co.lanica.platino');
var ALmixer = platino.require('co.lanica.almixer');
  
// This is a single context application with multiple windows in a stack
(function() {
	
  // //render appropriate components based on the platform and form factor
  // var osname = Ti.Platform.osname,
    // version = Ti.Platform.version,
    // height = Ti.Platform.displayCaps.platformHeight,
    // width = Ti.Platform.displayCaps.platformWidth;

	ALmixer.Init(0,0,0);

	var Window = require('ApplicationWindow');
	var app_window = new Window();
  
	/* It is recommended that you setup the remaining event listeners for the window after 
 	 * it is opened on Android, so wait for it to open via event listener,
 	 * otherwise window.getActivity may return null on Android or the wrong activity.
	 * (But remember to setup the this 'open' event listener before calling open() or you might miss the event, especially on iOS.)
	 * Also note that the window MUST be a heavyweight window (e.g. using fullscreen or navbar settings)
	 * otherwise, there will be no event listener callbacks. (Lightweight windows are gone as of Ti 3.2.0.GA)
	 */
	app_window.addEventListener('open', function(){
			SetupApplicationLifeCycleHandlers(app_window);
		}
	);
	
  	app_window.open({fullscreen:true, navBarHidden:true, exitOnClose:true});
  
})();

/* You should copy all the event handlers below into your app. 
 * It makes sure that when an app is paused, the audio pauses, and when resumed, audio is resumed.
 * Additionally, when Android exits an app, it calls ALmixer_Quit() which is necessary to make sure
 * the audio system is properly cleaned up, or there could be problems on the next launch.
 */
/// @param the_window This variable is required for only Android. It should be you main application window.
function SetupApplicationLifeCycleHandlers(the_window)
{
	var application_reference;
	if(Ti.Platform.osname == 'android')
	{
		// For Android, we don't really have a global application reference. 
		// So we use the main game window's activity instead.
		// The window must be opened before we call getActivity()
		// Titanium.Android.currentActivity isn't good because it can change on you.
		application_reference = the_window.getActivity();
	}
	else
	{
		application_reference = Titanium.App;
	}

	application_reference.addEventListener('pause', 
		function()
		{
			Ti.API.info("pause called");
 			ALmixer.BeginInterruption();
		}
	);
	
	// onuserleavehint was introduced in Ti 3.2.0.GA to better handle Android events.
	// You need 3.2.0.GA for this to have any effect, but it is safe to run this on older versions because it will be a no-op.
	application_reference.addEventListener('onuserleavehint', 
		function()
		{
			Ti.API.info("onuserleavehint called");
 			ALmixer.BeginInterruption();
		}
	);


	// I think this is triggered when resuming Titanium phone call interruptions.	
	application_reference.addEventListener('resume', 
		function()
		{
			Ti.API.info("resume called");
			ALmixer.EndInterruption();
		}
	);

	// I think this is triggered for resuming all other paused events.
	application_reference.addEventListener('resumed', 
		function()
		{
			Ti.API.info("resumed called");
			ALmixer.EndInterruption();
		}
	);
}



