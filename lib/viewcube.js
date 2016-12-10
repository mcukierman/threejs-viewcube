/* globals THREE: false, TWEEN: false, Promise: false, console: false */

var FOUR = FOUR || {};

/**
 * Common event identifiers.
 * @type {String}
 */
FOUR.EVENT = {
    BACKGROUND_CHANGE: 'background-change',
    CAMERA_CHANGE: 'camera-change',
    CONTEXT_MENU: 'contextmenu',
    CONTINUOUS_UPDATE_END: 'continuous-update-end',
    CONTINUOUS_UPDATE_START: 'continuous-update-start',
    CONTROLLER_CHANGE: 'controller-change',
    INDEX: 'index',
    KEY_DOWN: 'keydown',
    KEY_UP: 'keyup',
    MOUSE_DOWN: 'mousedown',
    MOUSE_MOVE: 'mousemove',
    MOUSE_UP: 'mouseup',
    RENDER: 'render',
    RESIZE: 'resize',
    UPDATE: 'update'
};

FOUR.Viewcube = (function () {
    "use strict";

    /**
     * View orientation controller.
     * @param {Object} config Configurations
     * @param {Object} _camera
     * @constructor
     */
    function Viewcube(config, _camera) {
        THREE.EventDispatcher.call(this);
        config = config || {};

        if (config instanceof HTMLElement && _camera instanceof THREE.Camera)
        {
            config = { domElement: config, viewport: { camera: _camera }};
        }

        var self = this;

        self.CUBE_FACE_SIZE = 70;
        self.CUBE_EDGE_SIZE = 15;
        self.CUBE_LABEL_SIZE = 99;
        self.COMPASS_COLOR = 0x666666;
        self.COMPASS_OPACITY = 0.8;

        self.FACE_COLOUR = 0x4a5f70;
        self.FACE_OPACITY_MOUSE_OFF = 0;
        self.FACE_OPACITY_MOUSE_NOT_OVER = 0.1;
        self.FACE_OPACITY_MOUSE_OVER = 0.8;
        //self.FACE_COLOUR = 0xff0000;
        //self.FACE_OPACITY_MOUSE_NOT_OVER = 1;
        //self.FACE_OPACITY_MOUSE_OVER = 1;
        self.FACES = {
            TOP: 0,
            FRONT: 1,
            RIGHT: 2,
            BACK: 3,
            LEFT: 4,
            BOTTOM: 5,

            TOP_FRONT_EDGE: 6,
            TOP_RIGHT_EDGE: 7,
            TOP_BACK_EDGE: 8,
            TOP_LEFT_EDGE: 9,

            FRONT_RIGHT_EDGE: 10,
            BACK_RIGHT_EDGE: 11,
            BACK_LEFT_EDGE: 12,
            FRONT_LEFT_EDGE: 13,

            BOTTOM_FRONT_EDGE: 14,
            BOTTOM_RIGHT_EDGE: 15,
            BOTTOM_BACK_EDGE: 16,
            BOTTOM_LEFT_EDGE: 17,

            TOP_FRONT_RIGHT_CORNER: 18,
            TOP_BACK_RIGHT_CORNER: 19,
            TOP_BACK_LEFT_CORNER: 20,
            TOP_FRONT_LEFT_CORNER: 21,

            BOTTOM_FRONT_RIGHT_CORNER: 22,
            BOTTOM_BACK_RIGHT_CORNER: 23,
            BOTTOM_BACK_LEFT_CORNER: 24,
            BOTTOM_FRONT_LEFT_CORNER: 25
        };
        self.ARROWS_MAP = {};
        self.ARROWS_MAP[self.FACES.FRONT] = [self.FACES.TOP, self.FACES.RIGHT, self.FACES.BOTTOM, self.FACES.LEFT];
        self.ARROWS_MAP[self.FACES.RIGHT] = [self.FACES.TOP, self.FACES.BACK, self.FACES.BOTTOM, self.FACES.FRONT];
        self.ARROWS_MAP[self.FACES.BACK] = [self.FACES.TOP, self.FACES.LEFT, self.FACES.BOTTOM, self.FACES.RIGHT];
		self.ARROWS_MAP[self.FACES.LEFT] = [self.FACES.TOP, self.FACES.FRONT, self.FACES.BOTTOM, self.FACES.BACK];
		self.ARROWS_MAP[self.FACES.TOP] = [self.FACES.BACK, self.FACES.RIGHT, self.FACES.FRONT, self.FACES.LEFT];
		self.ARROWS_MAP[self.FACES.BOTTOM] = [self.FACES.FRONT, self.FACES.RIGHT, self.FACES.BACK, self.FACES.LEFT];

        self.LABELS_HOVER_OFF = 0.5;
        self.LABELS_HOVER = 1;
        self.MODES = {SELECT: 0, READONLY: 1};
        self.OFFSET = 1;

        self.ROTATION_0 = 0;
        self.ROTATION_90 = Math.PI / 2;
        self.ROTATION_180 = Math.PI;
        self.ROTATION_270 = Math.PI * 1.5;
        self.ROTATION_360 = Math.PI * 2;

        var HALF = 45;
        var Y_FRONT = 0, Y_LEFT=-90, Y_RIGHT=90, Y_BACK=180;
        var P_CENTER = 0, P_TOP = 90, P_BOTTOM=-90;
        self.ROTATIONS_PRESET = [];
        self.ROTATIONS_PRESET[self.FACES.BACK] = [Y_BACK, Y_FRONT];
        self.ROTATIONS_PRESET[self.FACES.BACK_LEFT_EDGE] = [Y_BACK + HALF, P_CENTER ];
        self.ROTATIONS_PRESET[self.FACES.BACK_RIGHT_EDGE] = [Y_BACK - HALF, P_CENTER ];
        self.ROTATIONS_PRESET[self.FACES.BOTTOM] = [Y_FRONT, P_BOTTOM ];
        self.ROTATIONS_PRESET[self.FACES.BOTTOM_BACK_EDGE] = [Y_BACK, P_BOTTOM + HALF ];
        self.ROTATIONS_PRESET[self.FACES.BOTTOM_BACK_LEFT_CORNER] = [Y_BACK + HALF, P_BOTTOM + HALF ];
        self.ROTATIONS_PRESET[self.FACES.BOTTOM_BACK_RIGHT_CORNER] = [Y_BACK - HALF, P_BOTTOM + HALF ];
        self.ROTATIONS_PRESET[self.FACES.BOTTOM_FRONT_EDGE] = [Y_FRONT, P_BOTTOM + HALF];
        self.ROTATIONS_PRESET[self.FACES.BOTTOM_FRONT_LEFT_CORNER] = [Y_FRONT - HALF, P_BOTTOM + HALF];
        self.ROTATIONS_PRESET[self.FACES.BOTTOM_FRONT_RIGHT_CORNER] = [Y_FRONT + HALF, P_BOTTOM + HALF];
        self.ROTATIONS_PRESET[self.FACES.BOTTOM_LEFT_EDGE] = [Y_LEFT, P_BOTTOM + HALF];
        self.ROTATIONS_PRESET[self.FACES.BOTTOM_RIGHT_EDGE] = [Y_RIGHT, P_BOTTOM + HALF];
        self.ROTATIONS_PRESET[self.FACES.FRONT] = [Y_FRONT, P_CENTER ];
        self.ROTATIONS_PRESET[self.FACES.FRONT_LEFT_EDGE] = [Y_FRONT - HALF, P_CENTER];
        self.ROTATIONS_PRESET[self.FACES.FRONT_RIGHT_EDGE] = [Y_FRONT + HALF, P_CENTER];
        self.ROTATIONS_PRESET[self.FACES.LEFT] = [Y_LEFT, P_CENTER];
        self.ROTATIONS_PRESET[self.FACES.RIGHT] = [Y_RIGHT, P_CENTER];
        self.ROTATIONS_PRESET[self.FACES.TOP] = [Y_FRONT, P_TOP ];
        self.ROTATIONS_PRESET[self.FACES.TOP_BACK_EDGE] = [Y_BACK, P_TOP - HALF ];
        self.ROTATIONS_PRESET[self.FACES.TOP_BACK_LEFT_CORNER] = [Y_BACK + HALF, P_TOP - HALF ];
        self.ROTATIONS_PRESET[self.FACES.TOP_BACK_RIGHT_CORNER] = [Y_BACK - HALF, P_TOP - HALF ];
        self.ROTATIONS_PRESET[self.FACES.TOP_FRONT_EDGE] = [Y_FRONT, P_TOP - HALF];
        self.ROTATIONS_PRESET[self.FACES.TOP_FRONT_LEFT_CORNER] = [Y_FRONT - HALF, P_TOP - HALF ];
        self.ROTATIONS_PRESET[self.FACES.TOP_FRONT_RIGHT_CORNER] = [Y_FRONT + HALF, P_TOP - HALF ];
        self.ROTATIONS_PRESET[self.FACES.TOP_LEFT_EDGE] = [Y_LEFT, P_TOP - HALF];
        self.ROTATIONS_PRESET[self.FACES.TOP_RIGHT_EDGE] = [Y_RIGHT, P_TOP - HALF];

        self.X_AXIS = new THREE.Vector3(1, 0, 0);
        self.Y_AXIS = new THREE.Vector3(0, 1, 0);
        self.Z_AXIS = new THREE.Vector3(0, 0, 1);

        self.camera = null; // viewcube camera
        self.compass = new THREE.Object3D();
        self.control = new THREE.Object3D();
        self.cube = new THREE.Object3D();
        self.display = {
            controlAxis: false,
            sceneAxis: false,
            cameraAxis: false,
            compass: false,
            cube: true,
            labels: true,
            normals: false
        };
        self.domElement = config.domElement;
        self.enabled = false;
        self.fov = 50; // 50
        self.cameraDistance = 210;
        self.frontFace = null;
        self.labelSize = 128;
        self.labelFontSize = self.labelSize * 0.2; // to be adaptive to label size by default
        self.labelFontFamily = "Arial";
        self.labels = [];
        self.labels[self.FACES.TOP]   = 'TOP';
        self.labels[self.FACES.FRONT] = 'FRONT';
        self.labels[self.FACES.RIGHT] = 'RIGHT';
        self.labels[self.FACES.LEFT]  = 'LEFT';
        self.labels[self.FACES.BACK]  = 'BACK';
        self.labels[self.FACES.BOTTOM]= 'BOTTOM';
        self.labelRotation = [];
        self.labelRotation[self.FACES.FRONT]  = 0;
        self.labelRotation[self.FACES.LEFT]   = 90;
        self.labelRotation[self.FACES.RIGHT]  = 270;
        self.labelRotation[self.FACES.BACK]   = 180;
        self.labelRotation[self.FACES.BOTTOM] = 180;

        self.label_anisotropy = 8;
        self.listeners = {};
        self.materials = {compass: null, face: null, faces: []};
        self.mouse = new THREE.Vector2();
        self.raycaster = new THREE.Raycaster();
        self.renderContinuous = false;
        self.scene = new THREE.Scene();
        self.view = new THREE.Object3D();
        self.viewport = config.viewport; // target viewport
        self.ambientColor = 0xffffff;

        self.compass.name = 'compass';
        self.control.name = 'control';
        self.cube.name = 'cube';

        self.updateTween = true; // if user uses tween too, no need to update twice

        self.extendObj(self, config);

        self.arrows = {};
        self.currentView = self.FACES.FRONT;

        // renderer
        self.renderer = new THREE.WebGLRenderer({alpha: true, antialias: true});
        self.renderer.setSize(self.domElement.clientWidth, self.domElement.clientHeight);
        self.domElement.appendChild(self.renderer.domElement);

        self.scene.add(self.control);
        self.scene.add(self.view);

        self.setupCamera();
        self.setupLights();
        self.setupMaterials();
        self.setupGeometry();
        self.setupHtmlUI();

        setTimeout(function () {
            self.updateOrientation();
            self.onMouseLeave();
        }, 0);
    }

    Viewcube.prototype = Object.create(THREE.EventDispatcher.prototype);

    //Viewcube.prototype.constructor = Viewcube;

    Viewcube.prototype.extendObj = function(target, source){
        var self = this;
        Object.keys(source).forEach(function (key) {
            if (key === 'display')
                self.extendObj(target[key], source[key]);
            else
                target[key] = source[key];
        });
    };

    Viewcube.prototype.disable = function () {
        var self = this;
        self.enabled = false;
        Object.keys(self.listeners).forEach(function (key) {
            var listener = self.listeners[key];
            listener.element.removeEventListener(listener.event, listener.fn);
        });
    };

    Viewcube.prototype.enable = function () {
        var self = this;

        function addListener(element, event, fn) {
            self.listeners[event] = {
                element: element,
                event: event,
                fn: fn.bind(self)
            };
            element.addEventListener(event, self.listeners[event].fn, false);
        }

        addListener(self.domElement, 'contextmenu', self.onContextMenu);
        addListener(self.domElement, 'mouseenter', self.onMouseEnter);
        addListener(self.domElement, 'mouseleave', self.onMouseLeave);
        addListener(self.domElement, 'mousemove', self.onMouseMove);
        addListener(self.domElement, 'mouseover', self.onMouseOver);
        addListener(self.domElement, 'mouseup', self.onMouseUp);
        addListener(window, 'keydown', self.render);
        addListener(window, 'mousemove', self.render);

        addListener(self.arrows.up, 'click', self.onArrowUp);
        addListener(self.arrows.down, 'click', self.onArrowDown);
        addListener(self.arrows.left, 'click', self.onArrowLeft);
        addListener(self.arrows.right, 'click', self.onArrowRight);

        self.enabled = true;
    };

    Viewcube.prototype.getFaceLabel = function (val) {
        var match = null, self = this;
        Object.keys(self.FACES).forEach(function (key) {
            if (self.FACES[key] === val) {
                match = key;
            }
        });
        return match;
    };

    Viewcube.prototype.makeCompass = function (name, x, y, z, radius, segments, color, opacity) {
        var obj = new THREE.Object3D();
        var material = new THREE.MeshBasicMaterial({color: color});

        var circleGeometry = new THREE.CircleGeometry(radius, segments);
        var circle = new THREE.Mesh(circleGeometry, material);
        obj.add(circle);
        obj.name = name;
        obj.opacity = opacity;
        obj.position.x = x;
        obj.position.y = y;
        obj.position.z = z;
        return obj;
    };

    Viewcube.prototype.makeCorner = function (name, w, x, y, z, rotations) {
        var face1, face2, face3, geometry, material, obj, self = this;
        obj = new THREE.Object3D();
        material = self.materials.face.clone();
        self.materials.faces.push(material);

        geometry = new THREE.PlaneGeometry(w, w);
        face1 = new THREE.Mesh(geometry, material);
        face1.name = name;
        face1.position.setX(w / 2);
        face1.position.setY(w / 2);

        geometry = new THREE.PlaneGeometry(w, w);
        face2 = new THREE.Mesh(geometry, material);
        face2.name = name;
        face2.position.setX(w / 2);
        face2.position.setZ(-w / 2);
        face2.rotateOnAxis(new THREE.Vector3(1, 0, 0), Math.PI / 2);

        geometry = new THREE.PlaneGeometry(w, w);
        face3 = new THREE.Mesh(geometry, material);
        face3.name = name;
        face3.position.setY(w / 2);
        face3.position.setZ(-w / 2);
        face3.rotateOnAxis(new THREE.Vector3(0, 1, 0), -Math.PI / 2);

        obj.add(face1);
        obj.add(face2);
        obj.add(face3);
        obj.name = name;
        obj.position.x = x;
        obj.position.y = y;
        obj.position.z = z;
        rotations.forEach(function (rotation) {
            obj.rotateOnAxis(rotation.axis, rotation.rad);
        });
        return obj;
    };

    Viewcube.prototype.makeEdge = function (name, w, h, x, y, z, rotations) {
        var face1, face2, geometry, material, obj, self = this;
        material = self.materials.face.clone();
        self.materials.faces.push(material);

        obj = new THREE.Object3D();

        geometry = new THREE.PlaneGeometry(w, h);
        face1 = new THREE.Mesh(geometry, material);
        face1.name = name;
        face1.position.setY(h / 2);

        geometry = new THREE.PlaneGeometry(w, h);
        face2 = new THREE.Mesh(geometry, material);
        face2.name = name;
        face2.position.setZ(-h / 2);
        face2.rotateOnAxis(new THREE.Vector3(1, 0, 0), Math.PI / 2);

        obj.add(face1);
        obj.add(face2);
        obj.name = name;
        obj.position.x = x;
        obj.position.y = y;
        obj.position.z = z;
        rotations.forEach(function (rotation) {
            obj.rotateOnAxis(rotation.axis, rotation.rad);
        });
        return obj;
    };

    Viewcube.prototype.makeFace = function (name, w, x, y, z, rotations) {
        var face, geometry, material, self = this;
        geometry = new THREE.PlaneGeometry(w, w);
        material = self.materials.face.clone();
        self.materials.faces.push(material);

        face = new THREE.Mesh(geometry, material);
        face.name = name;
        face.position.setX(x);
        face.position.setY(y);
        face.position.setZ(z);
        rotations.forEach(function (rotation) {
            face.rotateOnAxis(rotation.axis, rotation.rad);
        });
        return face;
    };

    Viewcube.prototype.onContextMenu = function (event) {
        event.preventDefault();
    };

    Viewcube.prototype.onMouseEnter = function () {
        var self = this;
        self.tweenControlOpacity(self.materials.faces, self.FACE_OPACITY_MOUSE_OFF, self.FACE_OPACITY_MOUSE_NOT_OVER);
		for (var key in self.arrows) {
			if (self.arrows.hasOwnProperty(key))
				self.tweenControlOpacity(self.arrows[key], self.LABELS_HOVER_OFF, self.LABELS_HOVER);
		}
        if (self.display.labels)
            self.tweenControlOpacity(self.materials.labels, self.LABELS_HOVER_OFF, self.LABELS_HOVER);
    };

    Viewcube.prototype.onMouseLeave = function () {
        var self = this;
        self.tweenControlOpacity(self.materials.face, self.FACE_OPACITY_MOUSE_NOT_OVER, self.FACE_OPACITY_MOUSE_OFF);
        for (var key in self.arrows) {
            if (self.arrows.hasOwnProperty(key))
			    self.tweenControlOpacity(self.arrows[key], self.LABELS_HOVER, self.LABELS_HOVER_OFF);
		}
        if (self.display.labels)
            self.tweenControlOpacity(self.materials.labels, self.LABELS_HOVER, self.LABELS_HOVER_OFF);
    };

    Viewcube.prototype.onMouseMove = function (event) {
        var self = this;
        //console.info(event);
        self.mouse.x = (event.offsetX / self.domElement.clientWidth) * 2 - 1;
        self.mouse.y = -(event.offsetY / self.domElement.clientHeight) * 2 + 1;
        self.raycaster.setFromCamera(self.mouse, self.camera);
        // reset opacity for all scene objects
        self.scene.traverse(function (obj) {
            if (obj.name !== 'labels' && obj.name !== 'controlAxis' && obj.name != 'sceneAxis' && obj.material) {
                obj.material.opacity = self.FACE_OPACITY_MOUSE_NOT_OVER;
            }
        });
        // calculate objects intersecting the picking ray
        var intersects = self.raycaster.intersectObjects(self.cube.children, true);
        if (intersects.length > 0 && intersects[0].object.name !== 'labels') {
            var label = self.getFaceLabel(intersects[0].object.name);
            //console.info('over', label, intersects);
            intersects[0].object.material.opacity = self.FACE_OPACITY_MOUSE_OVER;
        }
    };

    Viewcube.prototype.onMouseOver = function (event) {
    };

    Viewcube.prototype.onMouseUp = function (event) {
        var self = this;
        //console.info(event);
        // calculate mouse position in normalized device coordinates
        // (-1 to +1) for both components
        self.mouse.x = (event.offsetX / self.domElement.clientWidth) * 2 - 1;
        self.mouse.y = -(event.offsetY / self.domElement.clientHeight) * 2 + 1;
        // update the picking ray with the camera and mouse position
        self.raycaster.setFromCamera(self.mouse, self.camera);
        // calculate objects intersecting the picking ray
        var intersects = self.raycaster.intersectObjects(self.cube.children, true);
        if (intersects.length > 0) {
            var label = self.getFaceLabel(intersects[0].object.name);
            // console.info('click', label, intersects);
            self.setView(intersects[0].object.name);
        }
    };

    Viewcube.prototype.render = function () {
        this.renderer.render(this.scene, this.camera);
    };

    Viewcube.prototype.setupCamera = function () {
        var self = this;
        self.camera = new THREE.PerspectiveCamera(self.fov, self.domElement.clientWidth / self.domElement.clientHeight, 0.1, 1000);
        self.camera.name = 'camera';
        self.camera.position.x = 0;
        self.camera.position.y = 0;
        self.camera.position.z = self.cameraDistance;
        self.camera.up = new THREE.Vector3(0, 1, 0);
        self.camera.lookAt(new THREE.Vector3(0, 0, 0));
        self.view.add(self.camera);
    };

    Viewcube.prototype.setupGeometry = function () {
        var self = this;
        // build cube control
        if (self.display.cube) {

            if (self.display.labels) {
                var geometry = new THREE.BoxGeometry(self.CUBE_LABEL_SIZE, self.CUBE_LABEL_SIZE, self.CUBE_LABEL_SIZE);
                var labels = new THREE.Mesh(geometry, self.materials.labels);
                labels.name = 'labels';
                self.cube.add(labels);
            }

            // faces
            var topFace = self.makeFace(self.FACES.TOP, 70, 0, 0, 50, [{axis: self.Z_AXIS, rad: self.ROTATION_90}]);
            var frontFace = self.makeFace(self.FACES.FRONT, 70, 0, -50, 0, [{axis: self.X_AXIS, rad: self.ROTATION_90}]);
            var rightFace = self.makeFace(self.FACES.RIGHT, 70, 50, 0, 0, [{
                axis: self.X_AXIS,
                rad: self.ROTATION_90
            }, {axis: self.Y_AXIS, rad: self.ROTATION_90}]);
            var backFace = self.makeFace(self.FACES.BACK, 70, 0, 50, 0, [{axis: self.X_AXIS, rad: self.ROTATION_270}]);
            var leftFace = self.makeFace(self.FACES.LEFT, 70, -50, 0, 0, [{
                axis: self.Y_AXIS,
                rad: self.ROTATION_270
            }, {axis: self.Z_AXIS, rad: self.ROTATION_90}]);
            var bottomFace = self.makeFace(self.FACES.BOTTOM, 70, 0, 0, -50, [{
                axis: self.Y_AXIS,
                rad: self.ROTATION_180
            }, {axis: self.Z_AXIS, rad: self.ROTATION_90}]);
            self.frontFace = frontFace;

            // edges
            var topFrontEdge = self.makeEdge(self.FACES.TOP_FRONT_EDGE, 70, 15, 0, -50, 50, [{
                axis: self.Z_AXIS,
                rad: self.ROTATION_0
            }]);
            var topRightEdge = self.makeEdge(self.FACES.TOP_RIGHT_EDGE, 70, 15, 50, 0, 50, [{
                axis: self.Z_AXIS,
                rad: self.ROTATION_90
            }]);
            var topBackEdge = self.makeEdge(self.FACES.TOP_BACK_EDGE, 70, 15, 0, 50, 50, [{
                axis: self.Z_AXIS,
                rad: self.ROTATION_180
            }]);
            var topLeftEdge = self.makeEdge(self.FACES.TOP_LEFT_EDGE, 70, 15, -50, 0, 50, [{
                axis: self.Z_AXIS,
                rad: self.ROTATION_270
            }]);

            var bottomFrontEdge = self.makeEdge(self.FACES.BOTTOM_FRONT_EDGE, 70, 15, 0, -50, -50, [{
                axis: self.Z_AXIS,
                rad: self.ROTATION_0
            }, {axis: self.Y_AXIS, rad: self.ROTATION_180}]);
            var bottomRightEdge = self.makeEdge(self.FACES.BOTTOM_RIGHT_EDGE, 70, 15, 50, 0, -50, [{
                axis: self.Z_AXIS,
                rad: self.ROTATION_90
            }, {axis: self.Y_AXIS, rad: self.ROTATION_180}]);
            var bottomBackEdge = self.makeEdge(self.FACES.BOTTOM_BACK_EDGE, 70, 15, 0, 50, -50, [{
                axis: self.Z_AXIS,
                rad: self.ROTATION_180
            }, {axis: self.Y_AXIS, rad: self.ROTATION_180}]);
            var bottomLeftEdge = self.makeEdge(self.FACES.BOTTOM_LEFT_EDGE, 70, 15, -50, 0, -50, [{
                axis: self.Z_AXIS,
                rad: self.ROTATION_270
            }, {axis: self.Y_AXIS, rad: self.ROTATION_180}]);

            var frontRightEdge = self.makeEdge(self.FACES.FRONT_RIGHT_EDGE, 70, 15, 50, -50, 0, [{
                axis: self.X_AXIS,
                rad: self.ROTATION_0
            }, {axis: self.Y_AXIS, rad: self.ROTATION_90}]);
            var backRightEdge = self.makeEdge(self.FACES.BACK_RIGHT_EDGE, 70, 15, 50, 50, 0, [{
                axis: self.X_AXIS,
                rad: self.ROTATION_180
            }, {axis: self.Y_AXIS, rad: self.ROTATION_90}]);
            var backLeftEdge = self.makeEdge(self.FACES.BACK_LEFT_EDGE, 70, 15, -50, 50, 0, [{
                axis: self.X_AXIS,
                rad: self.ROTATION_180
            }, {axis: self.Y_AXIS, rad: self.ROTATION_270}]);
            var frontLeftEdge = self.makeEdge(self.FACES.FRONT_LEFT_EDGE, 70, 15, -50, -50, 0, [{
                axis: self.X_AXIS,
                rad: self.ROTATION_0
            }, {axis: self.Y_AXIS, rad: self.ROTATION_270}]);

            // corners
            var topFrontLeftCorner = self.makeCorner(self.FACES.TOP_FRONT_LEFT_CORNER, 15, -50, -50, 50, [{
                axis: self.Z_AXIS,
                rad: self.ROTATION_0
            }]);
            var topFrontRightCorner = self.makeCorner(self.FACES.TOP_FRONT_RIGHT_CORNER, 15, 50, -50, 50, [{
                axis: self.Z_AXIS,
                rad: self.ROTATION_90
            }]);
            var topBackRightCorner = self.makeCorner(self.FACES.TOP_BACK_RIGHT_CORNER, 15, 50, 50, 50, [{
                axis: self.Z_AXIS,
                rad: self.ROTATION_180
            }]);
            var topBackLeftCorner = self.makeCorner(self.FACES.TOP_BACK_LEFT_CORNER, 15, -50, 50, 50, [{
                axis: self.Z_AXIS,
                rad: self.ROTATION_270
            }]);

            var bottomFrontLeftCorner = self.makeCorner(self.FACES.BOTTOM_FRONT_LEFT_CORNER, 15, -50, -50, -50, [{
                axis: self.Y_AXIS,
                rad: self.ROTATION_180
            }, {axis: self.Z_AXIS, rad: self.ROTATION_90}]);
            var bottomFrontRightCorner = self.makeCorner(self.FACES.BOTTOM_FRONT_RIGHT_CORNER, 15, 50, -50, -50, [{
                axis: self.Y_AXIS,
                rad: self.ROTATION_180
            }, {axis: self.Z_AXIS, rad: self.ROTATION_0}]);
            var bottomBackRightCorner = self.makeCorner(self.FACES.BOTTOM_BACK_RIGHT_CORNER, 15, 50, 50, -50, [{
                axis: self.Y_AXIS,
                rad: self.ROTATION_180
            }, {axis: self.Z_AXIS, rad: self.ROTATION_270}]);
            var bottomBackLeftCorner = self.makeCorner(self.FACES.BOTTOM_BACK_LEFT_CORNER, 15, -50, 50, -50, [{
                axis: self.Y_AXIS,
                rad: self.ROTATION_180
            }, {axis: self.Z_AXIS, rad: self.ROTATION_180}]);

            self.cube.add(topFace);
            self.cube.add(frontFace);
            self.cube.add(rightFace);
            self.cube.add(backFace);
            self.cube.add(leftFace);
            self.cube.add(bottomFace);

            self.cube.add(topFrontEdge);
            self.cube.add(topRightEdge);
            self.cube.add(topBackEdge);
            self.cube.add(topLeftEdge);

            self.cube.add(bottomFrontEdge);
            self.cube.add(bottomRightEdge);
            self.cube.add(bottomBackEdge);
            self.cube.add(bottomLeftEdge);

            self.cube.add(frontRightEdge);
            self.cube.add(backRightEdge);
            self.cube.add(backLeftEdge);
            self.cube.add(frontLeftEdge);

            self.cube.add(topFrontLeftCorner);
            self.cube.add(topFrontRightCorner);
            self.cube.add(topBackRightCorner);
            self.cube.add(topBackLeftCorner);

            self.cube.add(bottomFrontLeftCorner);
            self.cube.add(bottomFrontRightCorner);
            self.cube.add(bottomBackRightCorner);
            self.cube.add(bottomBackLeftCorner);


            self.control.add(self.cube);
        }

        if (self.display.compass) {
            var compass = self.makeCompass('compass', 0, 0, -55, 90, 64, self.COMPASS_COLOR, self.COMPASS_OPACITY);
            self.control.add(compass);
        }

        if (self.display.controlAxis) {
            var controlAxis = new THREE.AxisHelper(100);
            // TODO: fix orientation in geometry.. not like this
            controlAxis.name = 'controlAxis';
            controlAxis.rotateX(self.ROTATION_90);
            self.cube.add(controlAxis);
        }

        if (self.display.sceneAxis) {
            var sceneAxis = new THREE.AxisHelper(150);
            sceneAxis.name = 'sceneAxis';
            self.scene.add(sceneAxis);
        }

        if (self.display.cameraAxis) {
            var cameraAxis = new THREE.AxisHelper(100);
            self.view.add(cameraAxis);
        }

        // TODO: fix orientation in geometry.. not like this
        self.control.rotateX(self.ROTATION_270);

        self.scene.add(self.control);
    };

    Viewcube.prototype.setupLights = function () {
        var self = this;

        // ambient light
        var ambientLight = new THREE.AmbientLight(self.ambientColor);
        ambientLight.intensity = 0.85;
        self.view.add(ambientLight);

        // top, left spotlight
        var topLeftSpot = new THREE.SpotLight(0xffffff);
        topLeftSpot.lookAt( new THREE.Vector3() );
        topLeftSpot.position.set(250, -250, 250);
        topLeftSpot.intensity = 1;

        // top, right spotlight
        var topRightSpot = new THREE.SpotLight(0xffffff);
        topRightSpot.lookAt( new THREE.Vector3() );
        topRightSpot.position.set(250, 250, 250);
        topRightSpot.intensity = 0.4;

        self.view.add(topLeftSpot);
        self.view.add(topRightSpot);
    };

    Viewcube.prototype.labelTextTexture = function (text, view) {
        var self = this;
        // 128
        var rotate = self.labelRotation[view];
        var color = "#000000";
        var backGroundColor = "#aaaaaa";
        var canvas = document.createElement("canvas");
        canvas.width = self.labelSize;
        canvas.height = self.labelSize;
        var context = canvas.getContext("2d");

        if(backGroundColor) {
            context.fillStyle = backGroundColor;
            context.fillRect(0, 0, canvas.width, canvas.height);
        }

        context.save();
        context.translate( canvas.width / 2, canvas.height / 2 );
        if (rotate) {
            context.rotate(THREE.Math.degToRad(rotate));
        }
        context.font = self.labelFontSize + "px " + self.labelFontFamily;
        // var textWidth = context.measureText(text).width;
        context = canvas.getContext("2d");
        context.textAlign = "center";
        context.textBaseline = "middle";
        context.fillStyle = color;
        context.fillText(text, 0, 0);
        context.restore();

        context.strokeStyle = "#000000";
        // context.setLineDash([10, 6]);/*dashes are 5px and spaces are 3px*/
        // context.strokeRect(0, 0, canvas.width, canvas.height);
        var texture = new THREE.Texture(canvas);
        texture.needsUpdate = true;

        return texture;
    };

    Viewcube.prototype.labelMaterial = function (loader, view) {
        var self = this;
        var label = self.labels[view];
        var texture = this.labelTextTexture(label, view);

        // var texture = loader.load('/lib/img/' + this.labelSize + "/" + side + ".png");
        texture.anisotropy = this.label_anisotropy;
        return new THREE.MeshPhongMaterial({
            color: 0xAAAAAA,
            opacity: this.LABELS_HOVER_OFF,
            map: texture,
            transparent: true
        });
    };

    Viewcube.prototype.setupMaterials = function () {
        var self = this;
        var loader = new THREE.TextureLoader();
        // faces
        self.materials.face = new THREE.MeshBasicMaterial({
            alphaTest: 0.5,
            color: self.FACE_COLOUR,
            opacity: self.FACE_OPACITY_MOUSE_OFF,
            transparent: true
        });
        //self.materials.face = new THREE.MeshBasicMaterial({color: self.FACE_COLOUR, alphaTest: 0.5});
        self.materials.face.side = THREE.DoubleSide;
        // labels
        if (self.display.labels) {
            self.label_anisotropy = Math.min(self.label_anisotropy, self.renderer.getMaxAnisotropy());
            var label1 = self.labelMaterial(loader, self.FACES.TOP);
            var label2 = self.labelMaterial(loader, self.FACES.FRONT);
            var label3 = self.labelMaterial(loader, self.FACES.RIGHT);
            var label4 = self.labelMaterial(loader, self.FACES.LEFT);
            var label5 = self.labelMaterial(loader, self.FACES.BACK);
            var label6 = self.labelMaterial(loader, self.FACES.BOTTOM);
            var labels = [label3, label4, label5, label2, label1, label6];
            self.materials.labels = new THREE.MeshFaceMaterial(labels);
        }
    };

    Viewcube.prototype.setView = function (view) {
        // console.info("setView", view);
        this.currentView = view;

        if (typeof this.ROTATIONS_PRESET[view] === 'undefined') {
            console.warn('view not found', view);
            // not sure if it's right... but reject will force developer to catch rejects even if he doesn't need Promises at all
            return new Promise(function (resolve) { resolve() });
        }

        var yawPitch = this.ROTATIONS_PRESET[view];
        this.dispatchEvent({
            type: FOUR.EVENT.UPDATE,
            view: view,
            direction: {yaw: THREE.Math.degToRad(yawPitch[0]), pitch: THREE.Math.degToRad(yawPitch[1])}
        });

        this.showArrows(view);

        return this.tweenViewRotationByYawPitch(yawPitch[0], yawPitch[1]);
    };

    Viewcube.prototype.tweenControlOpacity = function (material, start, finish) {
        var self = this;
        return new Promise(function (resolve) {
            var o1 = {opacity: start};
            var o2 = {opacity: finish};
            var tween = new TWEEN.Tween(o1).to(o2, 1000);

            function setOpacity(material, opacity) {
                if (Array.isArray(material)) {
                    material.forEach(function (m) {
                        setOpacity(m, opacity);
                    });
                }
                if (material instanceof THREE.MultiMaterial) {
                    material.materials.forEach(function (m) {
                        m.opacity = opacity;
                    });
                } else if (material instanceof HTMLElement) {
					material.style.opacity = opacity;
                } else {
					material.opacity = opacity;
                }
            }

            tween.easing(TWEEN.Easing.Cubic.InOut);
            tween.onComplete(function () {
                setOpacity(material, this.opacity);
                self.render();
                self.renderContinuous = false;
                resolve();
            });
            tween.onUpdate(function () {
                setOpacity(material, this.opacity);
                self.render();
            });
            self.renderContinuous = true;
            tween.start();
            self.render();
        });
    };

    Viewcube.prototype.tweenViewRotationByYawPitch = function (dYaw, dPitch, duration) {
        var euler = new THREE.Euler(-THREE.Math.degToRad(dPitch), THREE.Math.degToRad(dYaw), 0, "YXZ");
        return this.tweenViewRotation( euler, duration );
    };

    Viewcube.prototype.tweenViewRotation = function (rx, ry, rz, duration) {
        var self = this;
        return new Promise(function (resolve) {
            var targetEuler;
            if (rx instanceof THREE.Euler)
                targetEuler = rx;
            else
                targetEuler = new THREE.Euler(rx, ry, rz, 'XYZ');
            var startQuaternion = self.view.quaternion.clone();
            var endQuaternion = new THREE.Quaternion().setFromEuler(targetEuler);

            var start = {t: 0};
            var finish = {t: 1};

            var tween = new TWEEN.Tween(start).to(finish, duration || 1000);
            tween.easing(TWEEN.Easing.Cubic.InOut);
            tween.onComplete(function () {
                THREE.Quaternion.slerp(startQuaternion, endQuaternion, self.view.quaternion, this.t);
                self.render();
                self.renderContinuous = false;
                resolve();
            });
            tween.onUpdate(function () {
                // console.log("tween.update", startQuaternion, endQuaternion, this.t);
                THREE.Quaternion.slerp(startQuaternion, endQuaternion, self.view.quaternion, this.t);

                self.render();
            });
            self.renderContinuous = true;
            tween.start();
            self.render();
        });
    };

    Viewcube.prototype.update = function () {
        var self = this;
        if (self.updateTween)
            TWEEN.update();
        if (self.renderContinuous) {
            requestAnimationFrame(self.update.bind(self));
        }
    };

    Viewcube.prototype.updateOrientation = function () {
        var self = this;
        var euler = new THREE.Euler(
            self.viewport.camera.rotation.x,
            self.viewport.camera.rotation.y,
            self.viewport.camera.rotation.z,
            'XYZ'
        );
        self.view.quaternion.setFromEuler(euler);
        self.showArrows(-1);
        self.render();
    };

    Viewcube.prototype.setupHtmlUI = function(){
        var self = this;
        self.arrows.up = self.createDivArrow("top");
		self.arrows.down = self.createDivArrow("bottom");
		self.arrows.left = self.createDivArrow("left");
		self.arrows.right = self.createDivArrow("right");

        self.domElement.appendChild(self.arrows.up);
        self.domElement.appendChild(self.arrows.down);
        self.domElement.appendChild(self.arrows.left);
        self.domElement.appendChild(self.arrows.right);
    };

    Viewcube.prototype.showArrows = function(view){
        var self = this;
        var map = self.ARROWS_MAP[view];
        var show = typeof map !== 'undefined';
        var display = show? "block" : "none";

        self.arrows.up.style.display = display;
        self.arrows.down.style.display = display;
        self.arrows.left.style.display = display;
        self.arrows.right.style.display = display;
    };
    
	Viewcube.prototype.createDivArrow = function(direction){
		var outer_div = document.createElement("div");
        var arrow_div = document.createElement("div");
		var color = "#666666";
		var size = Math.min(this.domElement.clientWidth, this.domElement.clientHeight)/100*7;
		var margin = "2%";
		var opposite_side_of = { top: "bottom", bottom: "top", left: "right", right: "left" };
        outer_div.style.display = "none";
        outer_div.style.cursor = "pointer";
        outer_div.style.position = "absolute";
        arrow_div.style.width = 0;
        arrow_div.style.height = 0;

        var transparent_style = size + "px solid transparent";
        var visible_style = size + "px solid " + color;

		outer_div.style[direction] = margin;
        switch (direction) {
            case "top":
            case "bottom":
                // position
				outer_div.style["left"] = "50%";
				outer_div.style["margin-left"] = (-size) + "px";
				// css corner
				arrow_div.style["border-left"] = transparent_style;
			    arrow_div.style["border-right"] = transparent_style;

			    break;
            case "left":
            case "right":
				// position
				outer_div.style["top"] = "50%";
				outer_div.style["margin-top"] = (-size/2) + "px";
				// css corner
				arrow_div.style["border-top"] = transparent_style;
				arrow_div.style["border-bottom"] = transparent_style;
				break;
        }
		arrow_div.style["border-" + opposite_side_of[direction]] = visible_style;

        outer_div.appendChild(arrow_div);
        return outer_div;
	};

	Viewcube.prototype.tryToMapRoll = function(map_index){
		var self = this;
		var map = self.ARROWS_MAP[self.currentView];
		if (typeof map !== 'undefined') {
			self.setView(map[map_index]);
		}
	};

    Viewcube.prototype.onArrowUp = function(){
        this.tryToMapRoll(0);
    };
    Viewcube.prototype.onArrowRight = function(){
		this.tryToMapRoll(1);
    };
    Viewcube.prototype.onArrowDown = function(){
		this.tryToMapRoll(2);
    };
    Viewcube.prototype.onArrowLeft = function(){
		this.tryToMapRoll(3);
    };


    return Viewcube;

}());
