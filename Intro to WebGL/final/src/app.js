// ********************************************************************************
// - app.js

var SCREEN_WIDTH          = window.innerWidth;
var SCREEN_HEIGHT         = window.innerHeight;
var windowHalfX           = SCREEN_WIDTH / 2;
var windowHalfY           = SCREEN_HEIGHT / 2;

var container, camera, scene, renderer, controls, stats;
var palette = ["#ECF0F1", "#7877F9", "#3498DB", "#FFA446", "#7AA8FF"];

var cubes = []; var spheres = [];
var icosahedron, icosFrame, icosFrameGeom;

// ********************************************************************************
// - Initialization

function init() {

  // * Setup
  setupRenderer();
  setupScene();
  setupCamera();
  setupLights();
  setupControls();
  bindEventListeners();
  setupStats();

  // * Draw
  drawLines();
  drawOrb();
  drawOrbFrame();
  drawOrbVertices();
  drawDebris();
}

// ******************************************************************************
// - Animation

function render() {
  controls.update();
  stats.update();

  camera.position.x++;
  camera.position.y++;
  camera.lookAt(scene.position);

  // * Animate
  renderer.render(scene, camera);
  requestAnimationFrame(render);
}

// ******************************************************************************
// - Setup Routines

function setupCamera() {
  camera = new THREE.PerspectiveCamera(75, SCREEN_WIDTH / SCREEN_HEIGHT, 1, 5000);
  camera.position.z = 1000;
  camera.position.y = windowHalfY;
  camera.position.x = windowHalfX;
}

function setupScene() {
  scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2('#FCF7E1', 0.0011);
}

function setupRenderer() {
  renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
  renderer.setClearColor("#FCF7E1");
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(SCREEN_WIDTH, SCREEN_HEIGHT);
  container = document.getElementById('container');
  container.appendChild(renderer.domElement);
}

function setupLights() {
  var dLWhite = new THREE.DirectionalLight('#FFFFFF');
  dLWhite.position.set(1, 1, 1);
  scene.add(dLWhite);

  var dLRed = new THREE.DirectionalLight('#D92B6A');
  dLRed.position.set(-5, -1, -10);
  scene.add(dLRed);

  var pLWhite = new THREE.PointLight("#FFFFFF", 1.2, 200);
  pLWhite.position.set(100, 100, 100);
  scene.add(pLWhite);
}

function setupStats() {
  stats = new Stats();
  stats.domElement.style.position = 'absolute';
  stats.domElement.style.top = '0px';
  stats.domElement.style.zIndex = 100;
  container.appendChild(stats.domElement);
}

function setupControls() {
  controls = new THREE.TrackballControls(camera, renderer.domElement);
  controls.rotateSpeed = 2.0;
  controls.zoomSpeed = 1;
  controls.panSpeed = 1;
  controls.dampingFactor = 0.3;
  controls.minDistance = 600;
  controls.maxDistance = 1000;
}

function bindEventListeners() {
  window.addEventListener('resize', onWindowResize);
}

// ******************************************************************************
// - Draw Routines

function drawLines() {
  for (var i = 0; i < 300; i++) {
    var geometry = new THREE.Geometry();
    var vertex = new THREE.Vector3(Math.random() * 2 - 1, Math.random() * 2 - 1, Math.random() * 2 - 1);
    vertex.normalize();
    vertex.multiplyScalar(500);
    geometry.vertices.push(vertex);

    var vertex2 = vertex.clone();
    vertex2.multiplyScalar(Math.random() * 0.3 + 1);
    geometry.vertices.push(vertex2);

    var line = new THREE.Line(geometry, new THREE.LineBasicMaterial({
      color: '#FFFFFF',
      transparent: true,
      opacity: 0.25
    }));
    scene.add(line);
  }
}

function drawOrb() {
  var icosGeometry = new THREE.OctahedronGeometry(350, 2);
  var icosMaterial = new THREE.MeshPhongMaterial({
    color: '#D92B6A',
    shading: THREE.FlatShading,
    vertexColors: THREE.FaceColors
  });

  icosahedron = new THREE.Mesh(icosGeometry, icosMaterial);
  scene.add(icosahedron);
}

function drawOrbFrame() {
  icosFrameGeom = new THREE.OctahedronGeometry(400, 2);
  var icosWire = new THREE.MeshPhongMaterial({
    color: '#FFFFFF',
    transparent: true,
    opacity: 0.2,
    wireframe: true
  });

  icosFrame = new THREE.Mesh(icosFrameGeom, icosWire);
  scene.add(icosFrame);
}

function drawOrbVertices() {
  for (i in icosFrameGeom.vertices) {
    var sphereG = new THREE.SphereGeometry(5, 32, 32);
    var sphereM = new THREE.MeshBasicMaterial({ color: '#FFFFFF', transparent: true, shading: THREE.FlatShading});
    spheres.push(new THREE.Mesh(sphereG, sphereM));
    spheres[i].position.set(icosFrameGeom.vertices[i].x, icosFrameGeom.vertices[i].y, icosFrameGeom.vertices[i].z)
    scene.add(spheres[i]);
  }
}

function drawDebris() {
  var polyGeometry = new THREE.CylinderGeometry(0, 10, 20, 4, 1);
  var polyMaterial =  new THREE.MeshPhongMaterial({ color: '#FFFFFF', shading: THREE.FlatShading });

  for (var i = 0; i < 100; i++) {
    var mesh = new THREE.Mesh( polyGeometry, polyMaterial );
    mesh.position.set((Math.random() - 0.5 ) * 1000, (Math.random() - 0.5 ) * 1000, (Math.random() - 0.5 ) * 1000)
    mesh.updateMatrix();
    mesh.matrixAutoUpdate = false;
    scene.add(mesh);
  }

  for (var i = 0; i < 255; i++) {
    var cubeGeometry = new THREE.CubeGeometry(15, 15, 15);
    var cubeMaterial = new THREE.MeshPhongMaterial({
      color: palette[Math.floor(Math.random() * palette.length)],
      specular: '#FFFFFF',
      shininess: 20,
      reflectivity: 1.5,
      shading: THREE.FlatShading
    });

    cubes[i] = new THREE.Mesh(cubeGeometry, cubeMaterial);
    cubes[i].position.set((Math.random() - 0.5) * 1000, (Math.random() - 0.5) * 1000, (Math.random() - 0.5) * 1000);
    cubes[i].updateMatrix();
    scene.add(cubes[i]);
  }
}

// ******************************************************************************
// - Events

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

// ******************************************************************************
// - Init

init();
render();
