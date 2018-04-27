function readTextFile(file)
{
	var rawFile = new XMLHttpRequest();
	var res = "";
	rawFile.open("GET", file, false);
	rawFile.onreadystatechange = function()
	{
		if(rawFile.readyState === 4)
		{
			if(rawFile.status === 200 || rawFile.status == 0)
				res = rawFile.responseText;
		}
	}
	rawFile.send(null);
	return res;
}

function objReader(filename)
{
	var newObj = new Object();
	var contents = readTextFile(filename);
	var lines = contents.split('\n');
	var newVertices = [];
	var newNormals = [];
	var newTextures = [];
	var newIndices = [];
	for(var line = 0; line < lines.length; line++)
	{
		var tokens = lines[line].split(/\s\s*/);
		if(tokens[0] == "v") 
			for(j = 1; j < tokens.length; j++)
				newVertices.push(parseFloat(tokens[j]));
		if(tokens[0] == "vn") 
			for(j = 1; j < tokens.length; j++)
				newNormals.push(parseFloat(tokens[j]));
		if( tokens[0] == "vt" ) 
			for(j = 1; j < tokens.length; j++)
				newTextures.push(parseFloat(tokens[j]));
		if( tokens[0] == "f" )
			for(j = 1; j < tokens.length; j++)
				newIndices.push(parseInt(tokens[j].split('/')[0])-1);
	}
	// Assigning to the current model
	newObj.vertices = newVertices.slice();
	newObj.normals = newNormals.slice();
	newObj.textureCoords = newTextures.slice();
	newObj.VertexIndices = newIndices.slice();
	return newObj;
}