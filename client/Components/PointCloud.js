import React, { Component } from 'react';
import io from 'socket.io-client';
import Leap from 'leapjs';

/*
 Fucking rad webgl ones
  https://threejs.org/examples/#webgl_loader_mmd_audio
  https://threejs.org/examples/#webgl_gpgpu_birds
  https://threejs.org/examples/#webgl_materials_modified
  https://threejs.org/examples/#webgl_buffergeometry_instancing_billboards
  https://threejs.org/examples/#webgl_buffergeometry_drawcalls
 */
const socket = io("localhost:8888", { transports: ['websocket', 'polling'] }); // eslint-disable-line
let THREE = null;

export default class PointCloud extends Component {
  constructor(props) {
    super(props);
    this.state = {
      boxWidth: 1000,
      boxHeight: 1000,
      Z: 500,
      Y: 500,
      scale: 2,
      mouseX: 0,
      mouseY: 0,
    };

    this.initSocket = ::this.initSocket;
    this.pointCloud1 = ::this.pointCloud1;
    this.birdCloud = ::this.birdCloud;
  }
  componentDidMount() {
    this.pointCloud1();
  }
  birdCloud() {
    if ( ! Detector.webgl ) Detector.addGetWebGLMessage();
var hash = document.location.hash.substr( 1 );
if (hash) hash = parseInt(hash, 0);
/* TEXTURE WIDTH FOR SIMULATION */
var WIDTH = hash || 32;
var BIRDS = WIDTH * WIDTH;
// Custom Geometry - using 3 triangles each. No UVs, no normals currently.
THREE.BirdGeometry = function () {
  var triangles = BIRDS * 3;
  var points = triangles * 3;
  THREE.BufferGeometry.call( this );
  var vertices = new THREE.BufferAttribute( new Float32Array( points * 3 ), 3 );
  var birdColors = new THREE.BufferAttribute( new Float32Array( points * 3 ), 3 );
  var references = new THREE.BufferAttribute( new Float32Array( points * 2 ), 2 );
  var birdVertex = new THREE.BufferAttribute( new Float32Array( points ), 1 );
  this.addAttribute( 'position', vertices );
  this.addAttribute( 'birdColor', birdColors );
  this.addAttribute( 'reference', references );
  this.addAttribute( 'birdVertex', birdVertex );
  // this.addAttribute( 'normal', new Float32Array( points * 3 ), 3 );
  var v = 0;
  function verts_push() {
    for (var i=0; i < arguments.length; i++) {
      vertices.array[v++] = arguments[i];
    }
  }
  var wingsSpan = 20;
  for (var f = 0; f<BIRDS; f++ ) {
    // Body
    verts_push(
      0, -0, -20,
      0, 4, -20,
      0, 0, 30
    );
    // Left Wing
    verts_push(
      0, 0, -15,
      -wingsSpan, 0, 0,
      0, 0, 15
    );
    // Right Wing
    verts_push(
      0, 0, 15,
      wingsSpan, 0, 0,
      0, 0, -15
    );
  }
  for( var v = 0; v < triangles * 3; v++ ) {
    var i = ~~(v / 3);
    var x = (i % WIDTH) / WIDTH;
    var y = ~~(i / WIDTH) / WIDTH;
    var c = new THREE.Color(
      0x444444 +
      ~~(v / 9) / BIRDS * 0x666666
    );
    birdColors.array[ v * 3 + 0 ] = c.r;
    birdColors.array[ v * 3 + 1 ] = c.g;
    birdColors.array[ v * 3 + 2 ] = c.b;
    references.array[ v * 2     ] = x;
    references.array[ v * 2 + 1 ] = y;
    birdVertex.array[ v         ] = v % 9;
  }
  this.scale( 0.2, 0.2, 0.2 );
};
THREE.BirdGeometry.prototype = Object.create( THREE.BufferGeometry.prototype );
var container, stats;
var camera, scene, renderer, geometry, i, h, color;
var mouseX = 0, mouseY = 0;
var windowHalfX = window.innerWidth / 2;
var windowHalfY = window.innerHeight / 2;
var BOUNDS = 800, BOUNDS_HALF = BOUNDS / 2;
document.getElementById('birds').innerText = BIRDS;
function change(n) {
  location.hash = n;
  location.reload();
  return false;
}
var options = '';
for (i=1; i<7; i++) {
  var j = Math.pow(2, i);
  options += '<a href="#" onclick="return change(' + j + ')">' + (j * j) + '</a> ';
}
document.getElementById('options').innerHTML = options;
var last = performance.now();
var gpuCompute;
var velocityVariable;
var positionVariable;
var positionUniforms;
var velocityUniforms;
var birdUniforms;
init();
animate();
function init() {
  container = document.createElement( 'div' );
  document.body.appendChild( container );
  camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 1, 3000 );
  camera.position.z = 350;
  scene = new THREE.Scene();
  scene.background = new THREE.Color( 0xffffff );
  scene.fog = new THREE.Fog( 0xffffff, 100, 1000 );
  renderer = new THREE.WebGLRenderer();
  renderer.setPixelRatio( window.devicePixelRatio );
  renderer.setSize( window.innerWidth, window.innerHeight );
  container.appendChild( renderer.domElement );
  initComputeRenderer();
  stats = new Stats();
  container.appendChild( stats.dom );
  document.addEventListener( 'mousemove', onDocumentMouseMove, false );
  document.addEventListener( 'touchstart', onDocumentTouchStart, false );
  document.addEventListener( 'touchmove', onDocumentTouchMove, false );
  //
  window.addEventListener( 'resize', onWindowResize, false );
  var gui = new dat.GUI();
  var effectController = {
    seperation: 20.0,
    alignment: 20.0,
    cohesion: 20.0,
    freedom: 0.75
  };
  var valuesChanger = function() {
    velocityUniforms.seperationDistance.value = effectController.seperation;
    velocityUniforms.alignmentDistance.value = effectController.alignment;
    velocityUniforms.cohesionDistance.value = effectController.cohesion;
    velocityUniforms.freedomFactor.value = effectController.freedom;
  };
  valuesChanger();
  gui.add( effectController, "seperation", 0.0, 100.0, 1.0 ).onChange( valuesChanger );
  gui.add( effectController, "alignment", 0.0, 100, 0.001 ).onChange( valuesChanger );
  gui.add( effectController, "cohesion", 0.0, 100, 0.025 ).onChange( valuesChanger );
  gui.close();
  initBirds();
}
function initComputeRenderer() {
      gpuCompute = new GPUComputationRenderer( WIDTH, WIDTH, renderer );
  var dtPosition = gpuCompute.createTexture();
  var dtVelocity = gpuCompute.createTexture();
  fillPositionTexture( dtPosition );
  fillVelocityTexture( dtVelocity );
  velocityVariable = gpuCompute.addVariable( "textureVelocity", document.getElementById( 'fragmentShaderVelocity' ).textContent, dtVelocity );
  positionVariable = gpuCompute.addVariable( "texturePosition", document.getElementById( 'fragmentShaderPosition' ).textContent, dtPosition );
  gpuCompute.setVariableDependencies( velocityVariable, [ positionVariable, velocityVariable ] );
  gpuCompute.setVariableDependencies( positionVariable, [ positionVariable, velocityVariable ] );
  positionUniforms = positionVariable.material.uniforms;
  velocityUniforms = velocityVariable.material.uniforms;
  positionUniforms.time = { value: 0.0 };
  positionUniforms.delta = { value: 0.0 };
  velocityUniforms.time = { value: 1.0 };
  velocityUniforms.delta = { value: 0.0 };
  velocityUniforms.testing = { value: 1.0 };
  velocityUniforms.seperationDistance = { value: 1.0 };
  velocityUniforms.alignmentDistance = { value: 1.0 };
  velocityUniforms.cohesionDistance = { value: 1.0 };
  velocityUniforms.freedomFactor = { value: 1.0 };
  velocityUniforms.predator = { value: new THREE.Vector3() };
  velocityVariable.material.defines.BOUNDS = BOUNDS.toFixed( 2 );
  velocityVariable.wrapS = THREE.RepeatWrapping;
  velocityVariable.wrapT = THREE.RepeatWrapping;
  positionVariable.wrapS = THREE.RepeatWrapping;
  positionVariable.wrapT = THREE.RepeatWrapping;
  var error = gpuCompute.init();
  if ( error !== null ) {
      console.error( error );
  }
}
function initBirds() {
  var geometry = new THREE.BirdGeometry();
  // For Vertex and Fragment
  birdUniforms = {
    color: { value: new THREE.Color( 0xff2200 ) },
    texturePosition: { value: null },
    textureVelocity: { value: null },
    time: { value: 1.0 },
    delta: { value: 0.0 }
  };
  // ShaderMaterial
  var material = new THREE.ShaderMaterial( {
    uniforms:       birdUniforms,
    vertexShader:   document.getElementById( 'birdVS' ).textContent,
    fragmentShader: document.getElementById( 'birdFS' ).textContent,
    side: THREE.DoubleSide
  });
  var birdMesh = new THREE.Mesh( geometry, material );
    birdMesh.rotation.y = Math.PI / 2;
    birdMesh.matrixAutoUpdate = false;
    birdMesh.updateMatrix();
    scene.add(birdMesh);
  }
  function fillPositionTexture( texture ) {
    var theArray = texture.image.data;
    for ( var k = 0, kl = theArray.length; k < kl; k += 4 ) {
      var x = Math.random() * BOUNDS - BOUNDS_HALF;
      var y = Math.random() * BOUNDS - BOUNDS_HALF;
      var z = Math.random() * BOUNDS - BOUNDS_HALF;
      theArray[ k + 0 ] = x;
      theArray[ k + 1 ] = y;
      theArray[ k + 2 ] = z;
      theArray[ k + 3 ] = 1;
    }
  }
  function fillVelocityTexture( texture ) {
    var theArray = texture.image.data;
    for ( var k = 0, kl = theArray.length; k < kl; k += 4 ) {
      var x = Math.random() - 0.5;
      var y = Math.random() - 0.5;
      var z = Math.random() - 0.5;
      theArray[ k + 0 ] = x * 10;
      theArray[ k + 1 ] = y * 10;
      theArray[ k + 2 ] = z * 10;
      theArray[ k + 3 ] = 1;
    }
  }
  function onWindowResize() {
    windowHalfX = window.innerWidth / 2;
    windowHalfY = window.innerHeight / 2;
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize( window.innerWidth, window.innerHeight );
  }
  function onDocumentMouseMove( event ) {
    mouseX = event.clientX - windowHalfX;
    mouseY = event.clientY - windowHalfY;
  }
  function onDocumentTouchStart( event ) {
    if ( event.touches.length === 1 ) {
      event.preventDefault();
      mouseX = event.touches[ 0 ].pageX - windowHalfX;
      mouseY = event.touches[ 0 ].pageY - windowHalfY;
    }
  }
  function onDocumentTouchMove( event ) {
    if ( event.touches.length === 1 ) {
      event.preventDefault();
      mouseX = event.touches[ 0 ].pageX - windowHalfX;
      mouseY = event.touches[ 0 ].pageY - windowHalfY;
    }
  }
  //
  function animate() {
    requestAnimationFrame( animate );
    render();
    stats.update();
  }
  function render() {
    var now = performance.now();
    var delta = (now - last) / 1000;
    if (delta > 1) delta = 1; // safety cap on large deltas
    last = now;
    positionUniforms.time.value = now;
    positionUniforms.delta.value = delta;
    velocityUniforms.time.value = now;
    velocityUniforms.delta.value = delta;
    birdUniforms.time.value = now;
    birdUniforms.delta.value = delta;
    velocityUniforms.predator.value.set( 0.5 * mouseX / windowHalfX, - 0.5 * mouseY / windowHalfY, 0 );
    mouseX = 10000;
    mouseY = 10000;
    gpuCompute.compute();
    birdUniforms.texturePosition.value = gpuCompute.getCurrentRenderTarget( positionVariable ).texture;
    birdUniforms.textureVelocity.value = gpuCompute.getCurrentRenderTarget( velocityVariable ).texture;
    renderer.render( scene, camera );
  }
  }
  pointCloud1() {
    THREE = require('three');
    // console.log('THREE ', THREE);
    this.initSocket();
    var scene, camera, renderer;

    // I guess we need this stuff too
    // const { mouseX, mouseY } = this.state;
    var container, HEIGHT,
        WIDTH, fieldOfView, aspectRatio,
        nearPlane, farPlane, stats,
        geometry, particleCount,
        i, h, color, size,
        materials = [],
        // mouseX = 0,
        // mouseY = 0,
        windowHalfX, windowHalfY, cameraZ,
        fogHex, fogDensity, parameters = {},
        parameterCount, particles;

    function animate() {
      requestAnimationFrame(animate);
      render();
      stats.update();
    }

    const render = () => {
        var time = Date.now() * 0.00005;

        camera.position.x += (this.state.mouseX - camera.position.x) * 0.05;
        camera.position.y += (-this.state.mouseY - camera.position.y) * 0.05;

        camera.lookAt(scene.position);

        for (i = 0; i < scene.children.length; i++) {

            var object = scene.children[i];

            if (object instanceof THREE.Points) {

                object.rotation.y = time * (i < 4 ? i + 1 : -(i + 1));
            }
        }

        for (i = 0; i < materials.length; i++) {

            color = parameters[i][0];

            h = (360 * (color[0] + time) % 360) / 360;
            materials[i].color.setHSL(h, color[1], color[2]);
        }

        renderer.render(scene, camera);
    }

    const onDocumentMouseMove = (e) => {
      try {
        const mouseX = e.clientX - windowHalfX;
        const mouseY = e.clientY - windowHalfY;
        this.setState({ mouseX, mouseY });
      } catch (e) {
        console.log('here?');
      }
    };
    HEIGHT = window.innerHeight;
    WIDTH = window.innerWidth;
    windowHalfX = WIDTH / 2;
    windowHalfY = HEIGHT / 2;

    fieldOfView = 75;
    aspectRatio = WIDTH / HEIGHT;
    nearPlane = 1;
    farPlane = 3000;

    /*
      fieldOfView — Camera frustum vertical field of view.
      aspectRatio — Camera frustum aspect ratio.
      nearPlane — Camera frustum near plane.
      farPlane — Camera frustum far plane.

      - https://threejs.org/docs/#Reference/Cameras/PerspectiveCamera

      In geometry, a frustum (plural: frusta or frustums)
      is the portion of a solid (normally a cone or pyramid)
      that lies between two parallel planes cutting it. - wikipedia.
    */

    cameraZ = farPlane / 3; /*	So, 1000? Yes! move on!	*/
    fogHex = 0x000000; /* As black as your heart.	*/
    fogDensity = 0.0003; /* So not terribly dense?	*/

    camera = new THREE.PerspectiveCamera(fieldOfView, aspectRatio, nearPlane, farPlane);
    camera.position.z = cameraZ;

    scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(fogHex, fogDensity);

    container = document.createElement('div');
    document.body.appendChild(container);
    document.body.style.margin = 0;
    document.body.style.overflow = 'hidden';

    geometry = new THREE.Geometry(); /*	NO ONE SAID ANYTHING ABOUT MATH! UGH!	*/

    particleCount = 20000; /* Leagues under the sea */


    for (i = 0; i < particleCount; i++) {

        var vertex = new THREE.Vector3();
        vertex.x = Math.random() * 2000 - 1000;
        vertex.y = Math.random() * 2000 - 1000;
        vertex.z = Math.random() * 2000 - 1000;

        geometry.vertices.push(vertex);
    }


    parameters = [
      [
        [1, 1, 0.5], 5
      ],
      [
        [0.95, 1, 0.5], 4
      ],
      [
        [0.90, 1, 0.5], 3
      ],
      [
        [0.85, 1, 0.5], 2
      ],
      [
        [0.80, 1, 0.5], 1
      ]
    ];
    parameterCount = parameters.length;

    for (i = 0; i < parameterCount; i++) {

        color = parameters[i][0];
        size = parameters[i][1];

        materials[i] = new THREE.PointsMaterial({
            size: size
        });

        particles = new THREE.Points(geometry, materials[i]);

        particles.rotation.x = Math.random() * 6;
        particles.rotation.y = Math.random() * 6;
        particles.rotation.z = Math.random() * 6;

        scene.add(particles);
    }

    renderer = new THREE.WebGLRenderer(); /*	Rendererererers particles.	*/
    renderer.setPixelRatio(window.devicePixelRatio); /*	Probably 1; unless you're fancy.	*/
    renderer.setSize(WIDTH, HEIGHT); /*	Full screen baby Wooooo!	*/

    container.appendChild(renderer.domElement); /* Let's add all this crazy junk to the page.	*/

    stats = new Stats();
    stats.domElement.style.position = 'absolute';
    stats.domElement.style.top = '0px';
    stats.domElement.style.right = '0px';
    container.appendChild(stats.domElement);

    // window.addEventListener('resize', onWindowResize, false);
    document.addEventListener('mousemove', onDocumentMouseMove, false);
    // document.addEventListener('touchstart', onDocumentTouchStart, false);
    // document.addEventListener('touchmove', onDocumentTouchMove, false);
    setTimeout(() => animate(), 200);
  }
  initSocket() {
    socket.on('connect', () => {
      console.warn('point cloud connected');
    });
    socket.on('coords', (coords) => {
      const SCALE = this.state.scale;
      const width = coords.width * SCALE;
      const height = coords.height * SCALE;
      const centerWidth = width / 2;
      const centerHeight = height / 2;
      const Z = (((coords.z * width) * SCALE) + centerWidth);
      const Y = (((coords.y * height) * SCALE) + centerHeight);
      if (this.state.width !== width && this.state.height !== height && this.state.centerWidth !== centerWidth && this.state.centerHeight !== centerHeight) {
        this.setState({ width, height, centerWidth, centerHeight });
      }
      this.setState({ mouseX: Z, mouseY: Y });
    });
  }
  render() {
    return (
      <div >
        point cloud
      </div>
    );
  }
}
