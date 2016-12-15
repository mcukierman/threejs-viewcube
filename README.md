Threejs Viewcube Navigation Control
===================================

See [p17-khan.pdf](http://www.autodeskresearch.com/pdf/p17-khan.pdf) for an overview of
original research on this interface control.

## Basic usage

```js
var viewcubeElement = document.getElementById('viewcube');
var viewcube = new FOUR.Viewcube({
	domElement: viewcubeElement,
	display: {
		labels: true,
		sceneAxis: true
	},
	viewport: {
		camera: camera // your camera
	}
});
viewcube.enable();
```

sync viewcube on camera updates:
```js
viewcube.updateOrientation();
```

handle viewcube updates:
```js
viewcube.addEventListener('update', function(event){
	var yawPitch = event.direction;
	var view = event.view;
});
```

See `\demo` for example usage.

## TODO:
- update build process, dependencies

## Build dependencies

Install `node`, `npm` and `grunt`.
use `bower install` to load run-time dependencies. 
`npm install` before using `grunt`.