'use strict';

let canvas = document.getElementById('canvas');

let scene = new THREE.Scene();
let uniforms = {
    resolution: {type: 'v2', value: new THREE.Vector2(0, 0)},
    texture: {type: 't', value: null}
};

let fragmentShader = `
  uniform vec2 resolution;
  uniform sampler2D texture;
  
  void main() {
    vec2 position = gl_FragCoord.xy / resolution.xy;
    vec4 pixelColor = texture2D(texture, position);
    gl_FragColor = pixelColor;
  }
`;

loadTexture("http://localhost:5000/images/kabelka.jpg")
  .then(texture => {
    texture.minFilter = THREE.LinearFilter;
    uniforms.texture = {type:'t', value:texture};
    uniforms.texture.value = texture;
    
    let material = new THREE.ShaderMaterial({uniforms, fragmentShader, transparent: true});
    let geometry = new THREE.PlaneGeometry( 10, 10 );
    let sprite = new THREE.Mesh( geometry, material );
    scene.add(sprite);
    sprite.position.z = -1;
    
    // it's important to update canvas size before creating renderer, images gets cropped otherwise :(
    canvas.width = texture.image.width;
    canvas.height = texture.image.height;
    let renderer = new THREE.WebGLRenderer({
        canvas,
        alpha: true,
        // for color eyedropper to work we need to keep rendered data in buffer (alternative would be to rerender
        // before getting pixel data)
        preserveDrawingBuffer: true // TODO: this can decrease performance, retest
    });
    let camera = new THREE.PerspectiveCamera(75, canvas.width / canvas.height, 0.1, 1000);
    uniforms.resolution.value = new THREE.Vector2(canvas.width, canvas.height);
    renderer.render( scene, camera );
  })

function loadTexture(url) {
    return new Promise((resolve, reject) => {
        var loader = new THREE.TextureLoader();
        // TODO: think about security implications of this
        //Allows us to load an external image
        loader.crossOrigin = '';

        loader.load(
            url,
            function onLoad(texture) {
                resolve(texture);
            },
            function onProgress(xhr) {

            },
            function onError( xhr ) {
                // TODO: pass error properly
                reject();
            }
        );
    });
}
