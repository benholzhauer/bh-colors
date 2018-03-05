// bh-colors (main.js)
// Author: Ben Holzhauer

window.onload = function() {
  // Fade in body
  $("body").animate({ opacity: 1 }, 500);

  // Check if header is clicked and animate
  $("#header a").click(function() {
    $("body").animate({ opacity: "0" }, 500);

    setTimeout(function() {
      window.location.href = "index.html";
    }, 500);
    return false;
  });

  // Check if footer is clicked and animate
  $("#footer a").click(function() {
    $("body").animate({ opacity: "0" }, 500);

    setTimeout(function() {
      window.location.href = "https://benholzhauer.github.io/";
    }, 500);
    return false;
  });

  // Define renderer size
  const WIDTH = window.innerWidth;
  const HEIGHT = window.innerHeight;

  // Define camera attributes
  const FOV = 45;
  const ASPECT = WIDTH / HEIGHT;
  const NEAR = 0.1;
  const FAR = 10000;

  // Get container for rendering
  var container = document.querySelector("#container");

  // Construct GL scene and set background
  var glScene = new THREE.Scene();
  glScene.background = new THREE.Color(0x262626);

  // Construct camera and add to GL scene
  var camera = new THREE.PerspectiveCamera(FOV, ASPECT, NEAR, FAR);
  camera.position.set(4, -12, 12);
  camera.up = new THREE.Vector3(0, 0, 1);
  glScene.add(camera);

  // Construct GL renderer, set size, and attach to container
  var glRenderer = new THREE.WebGLRenderer({
    antialias: true
  });
  glRenderer.setSize(WIDTH, HEIGHT);
  container.appendChild(glRenderer.domElement);

  // Construct CSS scene
  var cssScene = new THREE.Scene();

  // Construct CSS renderer, set attributes, and attach to container
  var cssRenderer = new THREE.CSS3DRenderer({
    antialias: true
  });
  cssRenderer.setSize(WIDTH, HEIGHT);
  cssRenderer.domElement.style.position = "absolute";
  cssRenderer.domElement.style.top = 0;
  container.appendChild(cssRenderer.domElement);

  // Construct orbit controls and define attributes
  var controls = new THREE.OrbitControls(camera);
  controls.enableKeys = false;
  controls.enableDamping = true;
  controls.dampingFactor = 0.1;
  controls.enablePan = false;
  controls.rotateSpeed = 0.25;
  controls.maxPolarAngle = Math.PI / 2;
  controls.enableZoom = false;

  // Construct raycaster and mouse
  var raycaster = new THREE.Raycaster();
  var mouse = new THREE.Vector2();

  // Declare intersected object
  var intersected;

  // Define mouse flags
  var canHover = true;
  var canClick = true;

  // Construct ambient light and add to GL scene
  var ambientLight = new THREE.AmbientLight(0x808080);
  ambientLight.position.set(1, 1, 1);
  glScene.add(ambientLight);

  // Construct directional light and add to GL scene
  var directionalLight = new THREE.DirectionalLight(0xffffff);
  directionalLight.position.set(1, 1, 1);
  glScene.add(directionalLight);

  // Define empty array of interactive cubes and construct cube group
  var cubes = [];
  var cubeGroup = new THREE.Group();

  // Construct cube meshes, add to group, and add group to GL scene
  for (var i = -4; i <= 4; i++) {
    for (var j = -4; j <= 4; j++) {
      var cube = new THREE.Mesh(
        new THREE.BoxGeometry(),
        new THREE.MeshLambertMaterial({
          // Randomly define color
          color: new THREE.Color(Math.random(), Math.random(), Math.random())
        })
      );
      cube.position.set(i, j, 0);

      cubes.push(cube);
      cubeGroup.add(cube);
    }
  }
  glScene.add(cubeGroup);

  // Construct label group
  var labelGroup = new THREE.Group();

  // Construct label element and set attributes
  var labelElement = document.createElement("div");
  labelElement.style.opacity = 0;

  // Construct label object, add to group, and add group to CSS scene
  var label = new THREE.CSS3DObject(labelElement);
  label.scale.set(0.025, 0.025, 0.025);
  labelGroup.add(label);
  cssScene.add(labelGroup);

  // Define render function
  function Update(time) {
    // Get next frame
    requestAnimationFrame(Update);

    // Update tween animation
    TWEEN.update(time);

    // Keep label facing camera and animate
    label.quaternion.copy(camera.quaternion);
    labelGroup.position.z = 0.1 * Math.sin(time / 1000);

    // Animate cubes
    cubeGroup.position.z = 0.1 * Math.sin(time / 1000);

    // Check if mouse can hover
    if (canHover) {
      // Determine intersections
      var intersections = raycaster.intersectObjects(cubes);

      // Check for entering intersections
      if (intersections.length > 0) {
        if (intersected != intersections[0].object) {
          // Check if new object is intersected, following existing previous one
          if (intersected != null) {
            // Animate objects

            new TWEEN.Tween(intersected.position)
              .to({ z: 0 }, 500)
              .easing(TWEEN.Easing.Cubic.In)
              .start();

            new TWEEN.Tween(intersected.scale)
              .to({ z: 1 }, 500)
              .easing(TWEEN.Easing.Cubic.In)
              .start();

            new TWEEN.Tween(label.position)
              .to({ z: 0 }, 500)
              .easing(TWEEN.Easing.Cubic.In)
              .start();

            new TWEEN.Tween(labelElement.style)
              .to({ opacity: 0 }, 500)
              .easing(TWEEN.Easing.Cubic.In)
              .start();

            new TWEEN.Tween(glScene.background)
              .to(new THREE.Color(0x262626), 500)
              .easing(TWEEN.Easing.Cubic.In)
              .start();
          }

          // Get intersected object and define label
          intersected = intersections[0].object;
          labelElement.innerHTML =
            "#" +
            ("000000" + intersected.material.color.getHex().toString(16)).slice(
              -6
            );

          // Animate objects

          new TWEEN.Tween(intersected.position)
            .to({ z: 1.5 }, 500)
            .easing(TWEEN.Easing.Cubic.Out)
            .start();

          new TWEEN.Tween(intersected.scale)
            .to({ z: 4 }, 500)
            .easing(TWEEN.Easing.Cubic.Out)
            .start();

          new TWEEN.Tween(label.position)
            .to(
              {
                x: intersected.position.x,
                y: intersected.position.y,
                z: 4
              },
              500
            )
            .easing(TWEEN.Easing.Cubic.Out)
            .start();

          new TWEEN.Tween(labelElement.style)
            .to({ opacity: 1 }, 500)
            .easing(TWEEN.Easing.Cubic.Out)
            .start();

          new TWEEN.Tween(glScene.background)
            .to(intersected.material.color, 500)
            .easing(TWEEN.Easing.Cubic.Out)
            .start();
        }
      } else if (intersected != null) {
        // Check for exiting intersections
        // Animate objects

        new TWEEN.Tween(intersected.position)
          .to({ z: 0 }, 500)
          .easing(TWEEN.Easing.Cubic.In)
          .start();

        new TWEEN.Tween(intersected.scale)
          .to({ z: 1 }, 500)
          .easing(TWEEN.Easing.Cubic.In)
          .start();

        new TWEEN.Tween(label.position)
          .to({ z: 0 }, 500)
          .easing(TWEEN.Easing.Cubic.In)
          .start();

        new TWEEN.Tween(labelElement.style)
          .to({ opacity: 0 }, 500)
          .easing(TWEEN.Easing.Cubic.In)
          .start();

        new TWEEN.Tween(glScene.background)
          .to(new THREE.Color(0x262626), 500)
          .easing(TWEEN.Easing.Cubic.In)
          .start();

        // Reset intersected object
        intersected = null;
      }
    }

    // Render GL scene
    glRenderer.render(glScene, camera);

    // Render CSS scene
    cssRenderer.render(cssScene, camera);

    // Update controls
    controls.update();
  }

  // Render scenes
  Update();

  // Check if mouse is moving
  container.addEventListener("mousemove", function(event) {
    // Get mouse coordinates
    mouse.x = event.clientX / glRenderer.domElement.clientWidth * 2 - 1;
    mouse.y = -(event.clientY / glRenderer.domElement.clientHeight) * 2 + 1;

    // Set raycaster from camera
    raycaster.setFromCamera(mouse, camera);
  });

  // Check if mouse button is pressed
  container.addEventListener("mousedown", function(event) {
    // Make sure intersected object exists and mouse flags are true
    if (intersected != null && canHover && canClick) {
      // Set mouse flags
      canHover = false;
      canClick = false;

      // Animate cubes and remove non-intersected ones

      cubes.splice(cubes.indexOf(intersected), 1);

      for (var i = 0; i < cubes.length; i++) {
        new TWEEN.Tween(cubes[i].position)
          .to({ x: 0, y: 0, z: 0 }, 500)
          .easing(TWEEN.Easing.Cubic.Out)
          .start();

        new TWEEN.Tween(cubes[i].scale)
          .to({ x: 0.1, y: 0.1, z: 0.1 }, 500)
          .easing(TWEEN.Easing.Cubic.Out)
          .onComplete(function() {
            for (var j = 0; j < cubes.length; j++) {
              cubeGroup.remove(cubes[j]);
              cubes.splice(j, 1);
            }
          })
          .start();
      }

      // Animate objects

      new TWEEN.Tween(intersected.position)
        .to({ x: 0, y: 0, z: 0 }, 500)
        .easing(TWEEN.Easing.Cubic.Out)
        .start();

      new TWEEN.Tween(intersected.scale)
        .to({ x: 9, y: 9, z: 9 }, 500)
        .easing(TWEEN.Easing.Cubic.Out)
        .onComplete(function() {
          // Generate monochromatic cubes
          for (var i = -4; i <= 4; i++) {
            var t = -i / 10 + 0.5;

            if (i != 0) {
              var cube = new THREE.Mesh(
                new THREE.BoxGeometry(),
                new THREE.MeshLambertMaterial({
                  color: new THREE.Color(
                    Math.pow(t, -Math.log2(intersected.material.color.r)),
                    Math.pow(t, -Math.log2(intersected.material.color.g)),
                    Math.pow(t, -Math.log2(intersected.material.color.b))
                  )
                })
              );
              cube.scale.set(0.1, 0.1, 0.1);

              new TWEEN.Tween(cube.position)
                .to({ x: i, y: 0, z: 0 }, 500)
                .easing(TWEEN.Easing.Cubic.In)
                .start();

              new TWEEN.Tween(cube.scale)
                .to({ x: 1, y: 9, z: 1 }, 500)
                .easing(TWEEN.Easing.Cubic.In)
                .start();

              cubes.push(cube);
              cubeGroup.add(cube);
            }
          }

          // Continue animating objects

          new TWEEN.Tween(intersected.scale)
            .to({ x: 1, y: 9, z: 1 }, 500)
            .easing(TWEEN.Easing.Cubic.In)
            .onComplete(function() {
              // Reset intersected object
              cubes.push(intersected);
              intersected = null;

              // Reset flag
              canHover = true;
            })
            .start();

          new TWEEN.Tween(label.position)
            .to({ x: 0, y: 0, z: 0 }, 500)
            .easing(TWEEN.Easing.Cubic.In)
            .start();

          new TWEEN.Tween(labelElement.style)
            .to({ opacity: 0 }, 500)
            .easing(TWEEN.Easing.Cubic.In)
            .start();

          new TWEEN.Tween(glScene.background)
            .to(new THREE.Color(0x262626), 500)
            .easing(TWEEN.Easing.Cubic.In)
            .start();
        })
        .start();
    }
  });

  // Check if window is resized
  window.addEventListener("resize", function() {
    // Resize GL renderer
    glRenderer.setSize(window.innerWidth, window.innerHeight);

    // Resize CSS renderer
    cssRenderer.setSize(window.innerWidth, window.innerHeight);

    // Recalculate camera aspect ratio
    camera.aspect = window.innerWidth / window.innerHeight;

    // Update camera projection matrix
    camera.updateProjectionMatrix();
  });
};
