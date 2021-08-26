function main() {
  const canvas = document.querySelector("#canvas");
  canvas.height = windows.innerHeight;
  canvas.width = windows.innerWidth;
  const gl = getContext("webgl");

  if (gl === null) {
    alert("Seu navegaor não suporta WEBGL");
    return;
  }
  var vertices = [
    -1, -1, -1, 1, -1, -1, 1, 1, -1, , -1, 1, -1,
    -1, -1, 1, 1, -1, 1, 1, 1, 1, -1, 1, 1,
    -1, -1, -1, -1, 1, -1, -1, 1, 1, -1, -1, 1,
    1, -1, -1, 1, 1, -1, 1, 1, 1, 1, -1, 1,
    -1, -1, -1, -1, -1, 1, 1, -1, 1, 1, -1, -1,
    -1, 1, -1, -1, 1, 1, 1, 1, 1, 1, 1, -1,
  ];

  var colors = [
    0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1,
    1, 0, 1, 1, 0, 1, 1, 0, 1, 1, 0, 1,
    1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
    1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0,
    1, 1, 0, 1, 1, 0, 1, 1, 0, 1, 1, 0,
    0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0,
  ];

  var indices = [
    0, 1, 2, 0, 2, 3, 4, 5, 6, 4, 6, 7,
    8, 9, 10, 8, 10, 11, 12, 13, 14, 12, 14, 15,
    16, 17, 18, 16, 18, 19, 20, 21, 22, 20, 22, 23
  ];
  // Armazenando dados no vertex_buffer
  var vertex_buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, vertex_buffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);

  //Armazenandodados no color buffer
  var color_buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, color_buffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);

  //Armazenando no index buffer
  var indexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);

  //--------- SHADERS --------
  var vertCode = 'attribute vec3 position;' +
    'uniform mat4 Pmatrix;' +
    'uniform mat4 Vmatrix;' +
    'uniform mat4 Mmatrix;' +
    'attribute vec3 color;' +
    'verying vec3 vColor;' +
    'void main(void){' +
    'gl_Position = Pmatrix*Vmatrix*Mmatrix*vec4(position, 1.);' +
    'vColor = color;' +
    '}';

  var fragCode = 'precision mediump float;' +
    'varying vec3 vColor;' +
    'void main(void){' +
    'gl_FragColor = vec4(vColor, 1.);' +
    '}';
  var vertShader = gl.createShader(gl.VERTEX_SHADER);
  gl.shaderSource(vertShader, vertCode);
  gl.compileShader(vertShader);

  var fragShader = gl.createShader(gl.FRAGMENT_SHADER);
  gl.shaderSource(fragShader, fragCode);
  gl.compileShader(fragShader);

  var shaderProgram = gl.createProgram();
  gl.attachShader(shaderProgram, vertShader);
  gl.attachShader(shaderProgram, fragShader);
  gl.linkProgram(shaderProgram);


  // ------- vertex shader --------
  var Pmatrix = gl.getUniformLocation(shaderProgram, "Pmatrix");
  var Vmatrix = gl.getUniformLocation(shaderProgram, "Vmatrix");
  var Mmatrix = gl.getUniformLocation(shaderProgram, "Mmatrix");

  var position = gl.getAttribLocation(shaderProgram, "position");
  gl.bindBuffer(gl.ARRAY_BUFFER, vertex_buffer);
  gl.vertexAttribPointer(position, 3, gl.FLOAT, false, 0, 0);

  // Position
  var color = gl.getAttribLocation(shaderProgram, "color");
  gl.enableVertexAttribArray(position);
  gl.bindBuffer(gl.ARRAY_BUFFER, color_buffer);
  gl.vertexAttribPointer(color, 3, gl.FLOAT, false, 0, 0);

  //Color
  gl.enableVertexAttribArray(color);
  gl.useProgram(shaderProgram);

  // ------- matrizes ---------
  var proj_matrix = getProjection(40, canvas.width / canvas.height, 1, 100);

  //Movimento
  var mov_matrix = [1, 0, 0, 0,
    0, 1, 0, 0,
    0, 0, 1, 0,
    0, 0, 0, 1,
  ];
  //Visualização
  var view_matrix = mov_matrix;

  //translação da câmera no eixo Z
  view_matrix[14] -= 10;

  var angle = 0.01;
  var fps = 1000 / 60;
  setInterval(function () {

    //rotação do cubo
    rotateZ(mov_matrix, angle);
    rotateX(mov_matrix, angle);
    rotateY(mov_matrix, angle);

    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LEQUAL);
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clearDepth(1.0);

    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.uniformMatrix4fv(Pmatrix, false, proj_matrix);
    gl.uniformMatrix4fv(Vmatrix, false, view_matrix);
    gl.uniformMatrix4fv(Mmatrix, false, mov_matrix);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
    gl.drawElements(gl.TRIANGLES, indices.length, gl.UNSIGNED_SHORT, 0);

  }, fps);

}

window.onload = main;

//========TRANSFORMAÇÕES=========
function rotateZ(m, angle) {

  var c = Math.cos(angle);
  var s = Math.sin(angle);
  var mv0 = m[0], mv4 = m[4], mv8 = m[8];

  m[0] = c * m[0] - s * m[1];
  m[4] = c * m[4] - s * m[5];
  m[8] = c * m[8] - s * m[9];

  m[1] = c * m[1] + s * mv0;
  m[5] = c * m[5] + s * mv4;
  m[9] = c * m[9] + s * mv8;

}

function rotateY(m, angle) { }

function rotateX(m, angle) { }

function getProjection(angle, a, zMin, zMax) { }






















