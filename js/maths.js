//  Helper functions
function _argumentsToArray(args)
{
	return [].concat.apply([], Array.prototype.slice.apply(args));
}

//----------------------------------------------------------------------------

function radians(degrees)
{
	return degrees * Math.PI / 180.0;
}

//----------------------------------------------------------------------------

//  Vector Constructors
function vec2()
{
	var result = _argumentsToArray(arguments);

	switch (result.length)
	{
		case 0: result.push(0.0);
		case 1: result.push(0.0);
	}

	return result.splice( 0, 2 );
}

function vec3()
{
	var result = _argumentsToArray(arguments);

	switch (result.length)
	{
		case 0: result.push( 0.0 );
		case 1: result.push( 0.0 );
		case 2: result.push( 0.0 );
	}

	return result.splice(0, 3);
}

function vec4()
{
	var result = _argumentsToArray(arguments);

	switch (result.length)
	{
		case 0: result.push(0.0);
		case 1: result.push(0.0);
		case 2: result.push(0.0);
		case 3: result.push(1.0);
	}

	return result.splice( 0, 4 );
}

//  Matrix Constructors
function mat2()
{
	var v = _argumentsToArray(arguments);

	var m = [];
	switch(v.length) {
	case 0:
		v[0] = 1;
	case 1:
			m = [vec2(v[0], 0.0), vec2(0.0, v[0])];
			break;
	default:
		m.push(vec2(v)); v.splice(0, 2);
		m.push(vec2(v));
		break;
	}
	m.matrix = true;
	return m;
}

//----------------------------------------------------------------------------

function mat3()
{
	var v = _argumentsToArray(arguments);

	var m = [];
	switch (v.length) 
	{
		case 0:
			v[0] = 1;
		case 1:
			m = [vec3(v[0], 0.0, 0.0), vec3(0.0, v[0], 0.0), vec3(0.0,  0.0, v[0])];
			break;
	default:
			m.push(vec3(v)); v.splice(0, 3);
			m.push(vec3(v)); v.splice(0, 3);
			m.push(vec3(v));
			break;
	}
	m.matrix = true;
	return m;
}

//----------------------------------------------------------------------------

function mat4()
{
	var v = _argumentsToArray(arguments);

	var m = [];
	switch (v.length)
	{
		case 0:
			v[0] = 1;
		case 1:
			m = [vec4(v[0], 0.0, 0.0, 0.0 ), vec4(0.0, v[0], 0.0, 0.0 ), vec4(0.0, 0.0, v[0], 0.0), vec4(0.0,  0.0,  0.0,  v[0])];
			break;
	default:
			m.push(vec4(v));  v.splice(0, 4);
			m.push(vec4(v));  v.splice(0, 4);
			m.push(vec4(v));  v.splice(0, 4);
			m.push(vec4(v));
			break;
	}
	m.matrix = true;
	return m;
}

//  Generic Mathematical Operations for Vectors and Matrices
function equal(u, v)
{
	if(u.length != v.length) return false;
 
	if(u.matrix && v.matrix)
		for( var i = 0; i < u.length; ++i)
		{
			if(u[i].length != v[i].length) return false;
			for(var j = 0; j < u[i].length; ++j)
				if(u[i][j] !== v[i][j]) return false;
		}
	else if(u.matrix && !v.matrix || !u.matrix && v.matrix)
		return false;
	else
		for ( var i = 0; i < u.length; ++i )
			if ( u[i] !== v[i] ) return false;

	return true;
}

//----------------------------------------------------------------------------

function add( u, v )
{
	var result = [];

	if(u.matrix && v.matrix)
	{
		if(u.length != v.length)
			throw "add(): trying to add matrices of different dimensions";

		for(var i = 0; i < u.length; ++i)
		{
			if(u[i].length != v[i].length)
				throw "add(): trying to add matrices of different dimensions";
			result.push([]);
			for(var j = 0; j < u[i].length; ++j)
				result[i].push(u[i][j] + v[i][j]);
		}
		result.matrix = true;
		return result;
	}
	else if(u.matrix && !v.matrix || !u.matrix && v.matrix)
		throw "add(): trying to add matrix and non-matrix variables";
	else
	{
		if( u.length != v.length )
			throw "add(): vectors are not the same dimension";

		for ( var i = 0; i < u.length; ++i )
			result.push( u[i] + v[i] );
		return result;
	}
}

//----------------------------------------------------------------------------

function subtract(u, v)
{
	var result = [];

	if(u.matrix && v.matrix)
	{
		if( u.length != v.length)
			throw "subtract(): trying to subtract matrices of different dimensions";

		for(var i = 0; i < u.length; ++i)
		{
			if(u[i].length != v[i].length)
				throw "subtract(): trying to subtact matrices of different dimensions";
			result.push( [] );
			for(var j = 0; j < u[i].length; ++j)
				result[i].push(u[i][j] - v[i][j]);
		}
		result.matrix = true;
		return result;
	}
	else if( u.matrix && !v.matrix || !u.matrix && v.matrix)
		throw "subtact(): trying to subtact  matrix and non-matrix variables";
	else
	{
		if(u.length != v.length)
			throw "subtract(): vectors are not the same length";

		for(var i = 0; i < u.length; ++i)
			result.push( u[i] - v[i]);
			return result;
	}
}

//----------------------------------------------------------------------------

function mult(u, v)
{
	var result = [];

	if(u.matrix && v.matrix)
	{
		if(u.length != v.length)
			throw "mult(): trying to add matrices of different dimensions";

		for(var i = 0; i < u.length; ++i)
			if(u[i].length != v[i].length)
				throw "mult(): trying to add matrices of different dimensions";


		for(var i = 0; i < u.length; ++i)
		{
			result.push([]);
			for(var j = 0; j < v.length; ++j)
			{
				var sum = 0.0;
				for(var k = 0; k < u.length; ++k)
					sum += u[i][k] * v[k][j];
				result[i].push(sum);
			}
		}
		result.matrix = true;
		return result;
	}
	else
	{
			if(u.length != v.length)
				throw "mult(): vectors are not the same dimension";

			for(var i = 0; i < u.length; ++i)
				result.push( u[i] * v[i]);
			return result;
	}
}

//  Matrix Functions
function transpose(m)
{
	if(!m.matrix)
		return "transpose(): trying to transpose a non-matrix";

	var result = [];
	for(var i = 0; i < m.length; ++i)
	{
		result.push([]);
		for(var j = 0; j < m[i].length; ++j)
			result[i].push( m[j][i] );
	}
	result.matrix = true;
	return result;
}

//  Helper function: Column-major 1D representation
function flatten(v)
{
	if(v.matrix === true)
		v = transpose(v);

	var n = v.length;
	var elemsAreArrays = false;

	if (Array.isArray(v[0]))
	{
		elemsAreArrays = true;
		n *= v[0].length;
	}

	var floats = new Float32Array(n);

	if(elemsAreArrays)
	{
		var idx = 0;
		for(var i = 0; i < v.length; ++i)
			for(var j = 0; j < v[i].length; ++j)
				floats[idx++] = v[i][j];
	}
	else
		for( var i = 0; i < v.length; ++i)
			floats[i] = v[i];

	return floats;
}

//  To get the number of bytes
var sizeof = {
	'vec2' : new Float32Array(flatten(vec2())).byteLength,
	'vec3' : new Float32Array(flatten(vec3())).byteLength,
	'vec4' : new Float32Array(flatten(vec4())).byteLength,
	'mat2' : new Float32Array(flatten(mat2())).byteLength,
	'mat3' : new Float32Array(flatten(mat3())).byteLength,
	'mat4' : new Float32Array(flatten(mat4())).byteLength
};

//  Constructing the 4 x 4 transformation matrices - J. Madeira 
function rotationXXMatrix(degrees)
{
	m = mat4();
	m[1][1] = Math.cos(radians(degrees));
	m[1][2] = -Math.sin(radians(degrees));
	m[2][1] = Math.sin(radians(degrees));
	m[2][2] = Math.cos(radians(degrees))
	return m;
}

function rotationYYMatrix( degrees )
{
	m = mat4();
	m[0][0] = Math.cos(radians(degrees));
	m[0][2] = Math.sin(radians(degrees));
	m[2][0] = -Math.sin(radians(degrees));
	m[2][2] = Math.cos(radians(degrees))
	return m;
}

function rotationZZMatrix(degrees)
{
	m = mat4();
	m[0][0] = Math.cos(radians(degrees));
	m[0][1] = -Math.sin(radians(degrees));
	m[1][0] = Math.sin(radians(degrees));
	m[1][1] = Math.cos(radians(degrees))
	return m;
}

function scalingMatrix(sx, sy, sz)
{
	m = mat4();
	m[0][0] = sx;
	m[1][1] = sy;
	m[2][2] = sz;
	return m;
}

function translationMatrix(tx, ty, tz)
{
	m = mat4();
	m[0][3] = tx;
	m[1][3] = ty;
	m[2][3] = tz;
	return m;
}

//----------------------------------------------------------------------------

//  Projection Matrix Generators - Angel / Shreiner
function ortho( left, right, bottom, top, near, far )
{
	if(left == right) { throw "ortho(): left and right are equal"; }
	if(bottom == top) { throw "ortho(): bottom and top are equal"; }
	if(near == far)   { throw "ortho(): near and far are equal"; }

	var w = right - left;
	var h = top - bottom;
	var d = far - near;

	var result = mat4();
	result[0][0] = 2.0 / w;
	result[1][1] = 2.0 / h;
	result[2][2] = -2.0 / d;
	result[0][3] = -(left + right) / w;
	result[1][3] = -(top + bottom) / h;
	result[2][3] = -(near + far) / d;
	return result;
}

//----------------------------------------------------------------------------

function perspective(fovy, aspect, near, far)
{
	var f = 1.0 / Math.tan(radians(fovy) / 2);
	var d = far - near;

	var result = mat4();
	result[0][0] = f / aspect;
	result[1][1] = f;
	result[2][2] = -(near + far) / d;
	result[2][3] = -2 * near * far / d;
	result[3][2] = -1;
	result[3][3] = 0.0;
	return result;
}

function normalize(v)
{
	var squaresSum = v[0] * v[0] + v[1] * v[1] + v[2] * v[2];
	var norm = Math.sqrt( squaresSum );
	v[0] /= norm;
	v[1] /= norm;
	v[2] /= norm;
}

function scale(v, val)
{
	for(var i = 0; i < v.length; i++)
	{
		v[i] *= val;
	}
}

function toInverseMat3(a, out)
{
	var a00 = a[0], a01 = a[1], a02 = a[2],
			a10 = a[3], a11 = a[4], a12 = a[5],
			a20 = a[6], a21 = a[7], a22 = a[8],

			b01 = a22 * a11 - a12 * a21,
			b11 = -a22 * a10 + a12 * a20,
			b21 = a21 * a10 - a11 * a20,

			// Calculate the determinant
			det = a00 * b01 + a01 * b11 + a02 * b21;

	if (!det)
		return null;
	det = 1.0 / det;

	out[0] = b01 * det;
	out[1] = (-a22 * a01 + a02 * a21) * det;
	out[2] = (a12 * a01 - a02 * a11) * det;
	out[3] = b11 * det;
	out[4] = (a22 * a00 - a02 * a20) * det;
	out[5] = (-a12 * a00 + a02 * a10) * det;
	out[6] = b21 * det;
	out[7] = (-a21 * a00 + a01 * a20) * det;
	out[8] = (a11 * a00 - a01 * a10) * det;
	return out;
}

function vectorProduct(v1, v2)
{
	var res = vec3();
	res[0] = v1[1] * v2[2] - v1[2] * v2[1];
	res[1] = - ( v1[0] * v2[2] - v1[2] * v2[0] );
	res[2] = v1[0] * v2[1] - v1[1] * v2[0];
	return res;
}

function computeNormalVector(p0, p1, p2)
{
	var v1 = vec3();
	var v2 = vec3();

	var result = vec3();
	v1[0] = p1[0] - p0[0];
	v1[1] = p1[1] - p0[1];
	v1[2] = p1[2] - p0[2];
	v2[0] = p2[0] - p0[0];
	v2[1] = p2[1] - p0[1];
	v2[2] = p2[2] - p0[2];
	result = vectorProduct(v1, v2);
	normalize(result);
	return result;
}

function computeVertexNormals(coordsArray, normalsArray)
{
	normalsArray.splice(0, normalsArray.length);
	for(var index = 0; index < coordsArray.length; index += 9)
	{
		var normalVector = computeNormalVector(coordsArray.slice(index, index + 3), coordsArray.slice(index + 3, index + 6), coordsArray.slice(index + 6, index + 9));
		for(var j = 0; j < 3; j++)
			normalsArray.push( normalVector[0], normalVector[1], normalVector[2] ); 
	}
}