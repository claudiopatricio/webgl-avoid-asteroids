// Copyright (c) 2018 Cláudio Patrício
// 
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
// 
// The above copyright notice and this permission notice shall be included in all
// copies or substantial portions of the Software.
// 
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
// SOFTWARE.

var gl = null;
var mvMatrix = mat4();
var pMatrix = mat4();
var shaderProgram;
var meteors = new Object();
var ship = new Object();
var background = new Object();

var level = 1;
var score = 0;
var lifes = 3;
var pause = false;
var restart = false;
// Overlay vars
var levelElement;
var scoreElement;
var lifesElement;
var messageElement;
var message2Element;
var levelNode;
var scoreNode;
var lifesNode;
var messageNode;
var message2Node;

var currentlyPressedKeys = {};

var xRot = 0;
var yRot = 0;
var zRot = 0;

var xmax = 1.1;
var xmin = -1.1;
var ymax = 0.9;
var ymin = -0.9;

var lastTime = 0; // animate timer

function initGL(canvas)
{
	try
	{
		gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
		gl.viewportWidth = canvas.width;
		gl.viewportHeight = canvas.height;
		gl.enable(gl.BLEND);
	} catch (e) { }
	if (!gl)
		alert("Could not initialise WebGL, sorry :-(");
}

function resetShip()
{
	ship.tx = 0.0;
	ship.ty = -0.5;
	ship.tz = -2.0;

	ship.vx = 0.0;
	ship.vy = 0.0;

	ship.angleXX = 90.0;
	ship.angleYY = 0.0;
	ship.angleZZ = 0.0;

	ship.sx = 0.07;
	ship.sy = 0.07;
	ship.sz = 0.07;
}

function resetMeteors()
{
	meteors.tx = [];
	meteors.ty = [];
	meteors.tz = [];
	
	meteors.vx = [];
	meteors.vy = [];

	meteors.angleXX = [];
	meteors.angleYY = [];
	meteors.angleZZ = [];

	meteors.sx = [];
	meteors.sy = [];
	meteors.sz = [];
	for(var i = 0; i < 4; i++) // level 1
		resetMeteor(i);
}

function resetMeteor(id)
{
	meteors.tx[id] = Math.round(Math.random()) == 0 ? Math.random() * xmax : Math.random() * xmax * -1;
	meteors.ty[id] = Math.random() * ymax + ymax;
	meteors.tz[id] = -2.2;

	meteors.vx[id] = Math.random() * meteors.tx[id] * -1;
	meteors.vy[id] = Math.min(2, Math.sqrt(Math.max(0.5, Math.random() * level))) * -1;//Math.max(0.3, Math.random() * level) * -1;

	meteors.angleXX[id] = 0.0;
	meteors.angleYY[id] = 0.0;
	meteors.angleZZ[id] = 0.0;

	meteors.sx[id] = 0.1;
	meteors.sy[id] = 0.1;
	meteors.sz[id] = 0.1
}

function handleLoadedTexture(texture)
{
	gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
	gl.bindTexture(gl.TEXTURE_2D, texture);
	gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, texture.image);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_NEAREST);
	gl.generateMipmap(gl.TEXTURE_2D);
	gl.bindTexture(gl.TEXTURE_2D, null);
}

function initTexture(img_src)
{
	var newTexture = gl.createTexture();
	newTexture.image = new Image();
	newTexture.image.onload = function()
	{
		handleLoadedTexture(newTexture)
	}
	newTexture.image.src = img_src;
	return newTexture;
}

function initBuffers(obj)
{
	obj.VertexPositionBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, obj.VertexPositionBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(obj.vertices), gl.STATIC_DRAW);
	obj.VertexPositionBuffer.itemSize = 3;
	obj.VertexPositionBuffer.numItems = obj.vertices.length / 3;

	obj.VertexNormalBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, obj.VertexNormalBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(obj.normals), gl.STATIC_DRAW);
	obj.VertexNormalBuffer.itemSize = 3;
	obj.VertexNormalBuffer.numItems = obj.normals.length / 3;

	obj.VertexTextureCoordBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, obj.VertexTextureCoordBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(obj.textureCoords), gl.STATIC_DRAW);
	obj.VertexTextureCoordBuffer.itemSize = 2;
	obj.VertexTextureCoordBuffer.numItems = obj.textureCoords.length / 2;

	obj.VertexIndexBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, obj.VertexIndexBuffer);
	gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(obj.VertexIndices), gl.STATIC_DRAW);
	obj.VertexIndexBuffer.itemSize = 1;
	obj.VertexIndexBuffer.numItems = obj.VertexIndices.length;
	return obj;
}

function drawShip(obj)
{
	mvMatrix = mat4();
	mvMatrix = mult(mvMatrix, translationMatrix(0, 0, 0));
	mvMatrix = mult(mvMatrix, rotationZZMatrix(0));
	mvMatrix = mult(mvMatrix, rotationYYMatrix(0));
	mvMatrix = mult(mvMatrix, rotationXXMatrix(0));
	mvMatrix = mult(mvMatrix, scalingMatrix(1, 1, 1));
	// Passing the Model View Matrix to apply the current transformation
	var mvUniform = gl.getUniformLocation(shaderProgram, "uMVMatrix");
	gl.uniformMatrix4fv(mvUniform, false, new Float32Array(flatten(mvMatrix)));

	gl.bindBuffer(gl.ARRAY_BUFFER, obj.VertexPositionBuffer);
	gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, obj.VertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);

	gl.bindBuffer(gl.ARRAY_BUFFER, obj.VertexNormalBuffer);
	gl.vertexAttribPointer(shaderProgram.vertexNormalAttribute, obj.VertexNormalBuffer.itemSize, gl.FLOAT, false, 0, 0);

	gl.bindBuffer(gl.ARRAY_BUFFER, obj.VertexTextureCoordBuffer);
	gl.vertexAttribPointer(shaderProgram.textureCoordAttribute, obj.VertexTextureCoordBuffer.itemSize, gl.FLOAT, false, 0, 0);

	gl.activeTexture(gl.TEXTURE0);
	gl.bindTexture(gl.TEXTURE_2D, obj.texture);
	gl.uniform1i(shaderProgram.samplerUniform, 0);

	/*gl.blendFunc(gl.SRC_ALPHA, gl.ONE);
	var alpha = 0.01
	gl.uniform1f(shaderProgram.alphaUniform, alpha);*/

	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, obj.VertexIndexBuffer);

	var normalMatrix = mat3();
	toInverseMat3(mvMatrix, normalMatrix);
	transpose(normalMatrix);
	gl.uniformMatrix3fv(shaderProgram.nMatrixUniform, false, normalMatrix);

	gl.drawElements(gl.TRIANGLES, obj.VertexIndexBuffer.numItems, gl.UNSIGNED_SHORT, 0);
}

function drawObject(obj)
{
	mvMatrix = mat4();
	mvMatrix = mult(mvMatrix, translationMatrix(obj.tx, obj.ty, obj.tz));
	mvMatrix = mult(mvMatrix, rotationZZMatrix(obj.angleZZ));
	mvMatrix = mult(mvMatrix, rotationYYMatrix(obj.angleYY));
	mvMatrix = mult(mvMatrix, rotationXXMatrix(obj.angleXX));
	mvMatrix = mult(mvMatrix, scalingMatrix(obj.sx, obj.sy, obj.sz));
	// Passing the Model View Matrix to apply the current transformation
	var mvUniform = gl.getUniformLocation(shaderProgram, "uMVMatrix");
	gl.uniformMatrix4fv(mvUniform, false, new Float32Array(flatten(mvMatrix)));

	gl.bindBuffer(gl.ARRAY_BUFFER, obj.VertexPositionBuffer);
	gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, obj.VertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);

	gl.bindBuffer(gl.ARRAY_BUFFER, obj.VertexNormalBuffer);
	gl.vertexAttribPointer(shaderProgram.vertexNormalAttribute, obj.VertexNormalBuffer.itemSize, gl.FLOAT, false, 0, 0);

	gl.bindBuffer(gl.ARRAY_BUFFER, obj.VertexTextureCoordBuffer);
	gl.vertexAttribPointer(shaderProgram.textureCoordAttribute, obj.VertexTextureCoordBuffer.itemSize, gl.FLOAT, false, 0, 0);

	gl.activeTexture(gl.TEXTURE0);
	gl.bindTexture(gl.TEXTURE_2D, obj.texture);
	gl.uniform1i(shaderProgram.samplerUniform, 0);

	gl.blendFunc(gl.SRC_ALPHA, gl.ONE);
	var alpha = 0.01
	gl.uniform1f(shaderProgram.alphaUniform, alpha);

	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, obj.VertexIndexBuffer);

	var normalMatrix = mat3();
	toInverseMat3(mvMatrix, normalMatrix);
	transpose(normalMatrix);
	gl.uniformMatrix3fv(shaderProgram.nMatrixUniform, false, normalMatrix);

	gl.drawElements(gl.TRIANGLES, obj.VertexIndexBuffer.numItems, gl.UNSIGNED_SHORT, 0);
}

function drawMeteors(obj)
{
	for(var i = 0; i < obj.tx.length; i++)
	{
		mvMatrix = mat4();
		mvMatrix = mult(mvMatrix, translationMatrix(obj.tx[i], obj.ty[i], obj.tz[i]));
		mvMatrix = mult(mvMatrix, rotationZZMatrix(obj.angleZZ[i]));
		mvMatrix = mult(mvMatrix, rotationYYMatrix(obj.angleYY[i]));
		mvMatrix = mult(mvMatrix, rotationXXMatrix(obj.angleXX[i]));
		mvMatrix = mult(mvMatrix, scalingMatrix(obj.sx[i], obj.sy[i], obj.sz[i]));
		// Passing the Model View Matrix to apply the current transformation
		var mvUniform = gl.getUniformLocation(shaderProgram, "uMVMatrix");
		gl.uniformMatrix4fv(mvUniform, false, new Float32Array(flatten(mvMatrix)));

		gl.bindBuffer(gl.ARRAY_BUFFER, obj.VertexPositionBuffer);
		gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, obj.VertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);

		gl.bindBuffer(gl.ARRAY_BUFFER, obj.VertexNormalBuffer);
		gl.vertexAttribPointer(shaderProgram.vertexNormalAttribute, obj.VertexNormalBuffer.itemSize, gl.FLOAT, false, 0, 0);

		gl.bindBuffer(gl.ARRAY_BUFFER, obj.VertexTextureCoordBuffer);
		gl.vertexAttribPointer(shaderProgram.textureCoordAttribute, obj.VertexTextureCoordBuffer.itemSize, gl.FLOAT, false, 0, 0);

		gl.activeTexture(gl.TEXTURE0);
		gl.bindTexture(gl.TEXTURE_2D, obj.texture);
		gl.uniform1i(shaderProgram.samplerUniform, 0);

		/*gl.blendFunc(gl.SRC_ALPHA, gl.ONE);
		var alpha = 0.5
		gl.uniform1f(shaderProgram.alphaUniform, alpha);*/

		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, obj.VertexIndexBuffer);

		var normalMatrix = mat3();
		toInverseMat3(mvMatrix, normalMatrix);
		transpose(normalMatrix);
		gl.uniformMatrix3fv(shaderProgram.nMatrixUniform, false, normalMatrix);

		gl.drawElements(gl.TRIANGLES, obj.VertexIndexBuffer.numItems, gl.UNSIGNED_SHORT, 0);
	}
}

function drawScene()
{
	gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
	pMatrix = perspective(45, gl.viewportWidth / gl.viewportHeight, 0.1, 10.0);
	// Passing the Projection Matrix to apply the current projection
	var pUniform = gl.getUniformLocation(shaderProgram, "uPMatrix");
	gl.uniformMatrix4fv(pUniform, false, new Float32Array(flatten(pMatrix)));

	gl.uniform1i(shaderProgram.useLightingUniform, true);
	gl.uniform3f(shaderProgram.ambientColorUniform, 1.0, 1.0, 1.0);
	var lightingDirection = [0.5, 0.5, 1.0];
	var adjustedLD = vec3();
	adjustedLD = add(adjustedLD, lightingDirection);
	normalize(adjustedLD);
	scale(adjustedLD, -1);
	gl.uniform3fv(shaderProgram.lightingDirectionUniform, adjustedLD);
	gl.uniform3f(shaderProgram.directionalColorUniform, 1.0, 1.0, 1.0);

	drawObject(background);
	drawObject(ship);
	drawMeteors(meteors);

}

function detectColisions()
{
	if(!restart && !pause)
	{
		for(var i = 0; i < meteors.tx.length; i++)
		{
			if(((ship.ty + 0.18) > meteors.ty[i]  && (ship.ty - 0.05) < meteors.ty[i] && (ship.tx > (meteors.tx[i] - 0.06) && ship.tx < meteors.tx[i] + 0.06)) ||
				 ((ship.ty + 0.05) > meteors.ty[i]  && (ship.ty - 0.18) < (meteors.ty[i]) && (ship.tx > (meteors.tx[i] - 0.2 * Math.cos(Math.abs(ship.angleYY))) && ship.tx < (meteors.tx[i] + Math.cos(Math.abs(ship.angleYY)) * 0.2))))
			{
				restart = true;
				lifes--;
				if(lifes < 1)
				{
					messageNode.nodeValue = "GAME OVER";
					message2Node.nodeValue = "Press Space to restart game";
				}
				else
				{
					messageNode.nodeValue = "COLLISION!!!";
					message2Node.nodeValue = "Press Space to continue";
				}
			}
		}
	}
}

function animate()
{
	var timeNow = new Date().getTime();
	if(lastTime != 0) {
		if(!pause && !restart)
		{
			var elapsed = timeNow - lastTime;
			elapsed = elapsed / 1000; // seconds

			// Ship
			if(currentlyPressedKeys[37]) // Left
			{
				ship.vx -= 5*elapsed; // 5u/s
				if(ship.vx < -2.0) ship.vx = -2.0;
				if(ship.angleYY > 0) ship.angleYY -= (360 * elapsed);
				else ship.angleYY -= (180 * elapsed);
				if(ship.angleYY < -60) ship.angleYY = -60;
			}
			else if(currentlyPressedKeys[39]) // Right
			{
				ship.vx += 5*elapsed; // 5u/s
				if(ship.vx > 2.0) ship.vx = 2.0;
				if(ship.angleYY < 0) ship.angleYY += (360 * elapsed);
				else ship.angleYY += (180 * elapsed);
				if(ship.angleYY > 60) ship.angleYY = 60;
			}
			else
			{
				if(ship.vx > 0.1) ship.vx -= 2.5*elapsed;
				else if(ship.vx < -0.1) ship.vx += 2.5*elapsed;
				else ship.vx = 0;
				if(ship.angleYY > 5) ship.angleYY -= (60 * elapsed);
				else if(ship.angleYY < -5) ship.angleYY += (60 * elapsed);
				else ship.angleYY = 0.0;
			}
			if(currentlyPressedKeys[38]) // Up
			{
				ship.vy += 5*elapsed; // 5u/s
				if(ship.vy > 2.0) ship.vy = 2.0;
			}
			else if(currentlyPressedKeys[40]) // Down
			{
				ship.vy -= 5*elapsed; // 5u/s
				if(ship.vy < -2.0) ship.vy = -2.0;
			}
			else
			{
				if(ship.vy > 0.1) ship.vy -= 2.5*elapsed;
				else if(ship.vy < -0.1) ship.vy += 2.5*elapsed;
				else ship.vy = 0;
			}

			ship.tx += ship.vx*elapsed;
			if(ship.tx < -1.0)
			{
				ship.tx = -1.0;
				ship.vx = 0.0;
			}
			else if(ship.tx > 1.0)
			{
				ship.tx = 1.0;
				ship.vx = 0.0;
			}

			ship.ty += ship.vy*elapsed;
			if(ship.ty < -0.7)
			{
				ship.ty = -0.7;
				ship.vy = 0.0;
			}
			else if(ship.ty > 0.75)
			{
				ship.ty = 0.75;
				ship.vy = 0.0;
			}
			
			// Meteors
			for(var i=0; i < meteors.tx.length; i++)
			{
				meteors.tx[i] += meteors.vx[i] * elapsed;
				meteors.ty[i] += meteors.vy[i] * elapsed;
				if(meteors.tx[i] > xmax || meteors.tx[i] < xmin || meteors.ty[i] < ymin)
					resetMeteor(i);
			}
			score += elapsed;
			level = (score > 1 ? Math.floor(Math.sqrt(score)) : 1);
			levelNode.nodeValue = level;
			scoreNode.nodeValue = Math.round(score * 1000);
			lifesNode.nodeValue = lifes;
			
			while(Math.round(Math.sqrt(level * 4)) > meteors.tx.length)
			{
				resetMeteor(meteors.tx.length);
				console.log("Level " + level);
				console.log("Score " + Math.floor(score));
			}
		}
	}
	
	lastTime = timeNow;
}

function setEventListeners(canvas)
{
	function handleKeyDown(event)
	{
		currentlyPressedKeys[event.keyCode] = true;
	}
	function handleKeyUp(event)
	{
		currentlyPressedKeys[event.keyCode] = false;
		// Special Keys
		if(event.keyCode == 80) // Pause (P)
		{
			if(!restart)
			{
				pause = !pause;
				if(pause) messageNode.nodeValue = "PAUSE";
				else messageNode.nodeValue = "";
			}
		}
		if(event.keyCode == 32) // Restart (Space)
		{
			if(restart)
			{
				restart = false;
				if(lifes < 1)
				{
					lifes = 3;
					score = 0;
					level = 1;
					resetMeteors();
					resetShip();
					messageNode.nodeValue = "";
					message2Node.nodeValue = "";
				}
				else
				{
					for(var i = 0; i < meteors.tx.length; i++)
						resetMeteor(i);
					resetShip();
					messageNode.nodeValue = "";
					message2Node.nodeValue = "";
				}
			}
		}
	}
	document.onkeydown = handleKeyDown;
	document.onkeyup = handleKeyUp;     
}

function tick()
{
	requestAnimFrame(tick);
	animate();
	detectColisions()
	if(!pause && !restart)
		drawScene();
}

function loadBackground()
{
	background.vertices = [
		// Front face
		-1.0, -1.0,  1.0,
		 1.0, -1.0,  1.0,
		 1.0,  1.0,  1.0,
		-1.0,  1.0,  1.0,
		// Back face
		-1.0, -1.0, -1.0,
		-1.0,  1.0, -1.0,
		 1.0,  1.0, -1.0,
		 1.0, -1.0, -1.0,
		// Top face
		-1.0,  1.0, -1.0,
		-1.0,  1.0,  1.0,
		 1.0,  1.0,  1.0,
		 1.0,  1.0, -1.0,
		// Bottom face
		-1.0, -1.0, -1.0,
		 1.0, -1.0, -1.0,
		 1.0, -1.0,  1.0,
		-1.0, -1.0,  1.0,
		// Right face
		 1.0, -1.0, -1.0,
		 1.0,  1.0, -1.0,
		 1.0,  1.0,  1.0,
		 1.0, -1.0,  1.0,
		// Left face
		-1.0, -1.0, -1.0,
		-1.0, -1.0,  1.0,
		-1.0,  1.0,  1.0,
		-1.0,  1.0, -1.0
	];
	background.textureCoords = [
		// Front face
		0.0, 0.0,
		1.0, 0.0,
		1.0, 1.0,
		0.0, 1.0,
		// Back face
		1.0, 0.0,
		1.0, 1.0,
		0.0, 1.0,
		0.0, 0.0,
		// Top face
		0.0, 1.0,
		0.0, 0.0,
		1.0, 0.0,
		1.0, 1.0,
		// Bottom face
		1.0, 1.0,
		0.0, 1.0,
		0.0, 0.0,
		1.0, 0.0,
		// Right face
		1.0, 0.0,
		1.0, 1.0,
		0.0, 1.0,
		0.0, 0.0,
		// Left face
		0.0, 0.0,
		1.0, 0.0,
		1.0, 1.0,
		0.0, 1.0,
	];
	background.VertexIndices = [
			0, 1, 2,      0, 2, 3,    // Front face
			4, 5, 6,      4, 6, 7,    // Back face
			8, 9, 10,     8, 10, 11,  // Top face
			12, 13, 14,   12, 14, 15, // Bottom face
			16, 17, 18,   16, 18, 19, // Right face
			20, 21, 22,   20, 22, 23  // Left face
	];
	background.normals = [];
	computeVertexNormals(background.vertices, background.normals);
	background.tx = 0.0;
	background.ty = 0;
	background.tz = -5.0;

	background.angleXX = 90.0;
	background.angleYY = 0.0;
	background.angleZZ = 0.0;

	background.sx = 1.8;
	background.sy = 1.8;
	background.sz = 1.8;
}

function webGLStart()
{
	var canvas = document.getElementById("canvas");
	initGL(canvas);
	shaderProgram = initShaders(gl);
	setEventListeners(canvas);

	// Overlay elements
	levelElement = document.getElementById("level");
	scoreElement = document.getElementById("score");
	lifesElement = document.getElementById("lifes");
	messageElement = document.getElementById("message");
	message2Element = document.getElementById("message2");
	levelNode = document.createTextNode("");
	scoreNode = document.createTextNode("");
	lifesNode = document.createTextNode("");
	messageNode = document.createTextNode("");
	message2Node = document.createTextNode("");
	levelElement.appendChild(levelNode);
	scoreElement.appendChild(scoreNode);
	lifesElement.appendChild(lifesNode);
	messageElement.appendChild(messageNode);
	message2Element.appendChild(message2Node);

	ship = objReader('models/ship.obj');
	resetShip();
	ship = initBuffers(ship);
	ship.texture = initTexture('models/ship.png');

	meteors = objReader('models/meteor.obj');
	resetMeteors(meteors);
	meteors = initBuffers(meteors);
	meteors.texture = initTexture('models/meteor.png');

	loadBackground();
	background = initBuffers(background);
	background.texture = initTexture('models/background.png');

	gl.clearColor(0.0, 0.0, 0.0, 1.0);
	gl.enable(gl.DEPTH_TEST);

	tick();
}