/**
 * @author future  http://github.com/jianglai3303
 *
 * Description: A THREE Transer for BufferGeometry and Geometry, translate .BufferGeometry/Geometry into STL file.
 * And this library supports all formats of STL file (ascii or binary)
 *
 * Usage:
 * For simple ascii STL file:
 *		var transer = new THREE.STLTranser();
 *		var stl = transer.trans2STL(geometry);
 * For binary STL file:
 *		var transer = new THREE.STLTranser();
 *		var blob = transer.trans2STLBin(geometry);
 *	
 * blob is the HTML5 standard binary file format.You can transfer it to the server 
 * by binary.js: https://github.com/binaryjs/binaryjs
 *
 */
 
THREE.STLTranser = function(){
};

THREE.STLTranser.prototype.post = function(url, params){
		var temp = document.createElement("form");        
		temp.action = url;        
		temp.method = "post";        
		temp.style.display = "none";        
		for (var x in params) {        
			var opt = document.createElement("textarea");        
			opt.name = x;        
			opt.value = params[x];      
			temp.appendChild(opt);        
		}        
		document.body.appendChild(temp);        
		temp.submit();        
		return temp; 
}

/**
Generated templete looks like below:
	solid Test_Model
	  facet normal 1 0 0
		  outer loop
			vertex 0 0 0
			vertex 0 0 2
			vertex 0 2 0
		  endloop
	  endfacet
	  ......
	  ......
	endsolid Test_Model
*/
THREE.STLTranser.prototype.trans2STL = function(geo){
	if ( (geo instanceof THREE.BufferGeometry == false)&&(geo instanceof THREE.Geometry == false) ) {
		console.error( 'not an instance of THREE.BufferGeometry or THREE.Geometry.', geo );
		return;
	}
	if(geo.faces){
		var vertices = geo.vertices;
		var faces = geo.faces;
		var stl = "solid Test_Model\n";
		for(var index in faces){
			stl = stl + "  facet normal "+ faces[index].normal.x+" "+faces[index].normal.y+" "+faces[index].normal.z+"\n";
			stl = stl + "    outer loop\n"
			var a = faces[index].a;
			var b = faces[index].b;
			var c = faces[index].c;
			stl = stl +  "      vertex "+vertices[a].x+" "+vertices[a].y+" "+vertices[a].z+"\n"
			+"      vertex "+vertices[b].x+" "+vertices[b].y+" "+vertices[b].z+"\n"
			+"      vertex "+vertices[c].x+" "+vertices[c].y+" "+vertices[c].z+"\n";
			stl = stl + "    endloop\n";
			stl = stl + "  endfacet\n"
		}
		stl =  stl+ "endsolid Test_Model";
	}else{
		var positions = geo.attributes.position.array;
		var normals = geo.attributes.normal.array;
		console.log(positions);
		var stl = "solid Test_Model\n";
		for(var i=0; i<positions.length; i=i+9){
			stl = stl + "  facet normal "+ normals[i]+" "+normals[i+1]+" "+normals[i+2]+"\n";
			stl = stl + "    outer loop\n"
			stl = stl +  "      vertex "+positions[i]+" "+positions[i+1]+" "+positions[i+2]+"\n"
			+  "      vertex "+positions[i+3]+" "+positions[i+4]+" "+positions[i+5]+"\n"
			+  "      vertex "+positions[i+6]+" "+positions[i+7]+" "+positions[i+8]+"\n";
			stl = stl + "    endloop\n";
			stl = stl + "  endfacet\n"
		}
		stl =  stl+ "endsolid Test_Model";
	}
	return stl;
}


/**
For a binary stl file.
First 80 bytes are used for storing name of the file.the next 4 bytes are used for storing number
of the facets.And following is a loop of facet. Each facet have 50 bytes:
12 bytes normal verctor x,y,z
12*3 bytes for three vertices
2 bytes for additional info

*/
THREE.STLTranser.prototype.trans2STLBin = function(geo){
	if ( (geo instanceof THREE.BufferGeometry == false)&&(geo instanceof THREE.Geometry == false) ) {
		console.error( 'not an instance of THREE.BufferGeometry or THREE.Geometry.', geo );
		return;
	}
	if(geo.faces){
		var vertices = geo.vertices;
		var faces = geo.faces;
		var fileSize = faces.length*50+84;
		var stl = new ArrayBuffer(fileSize);
		console.log(fileSize);
		var dv = new DataView(stl);
		for(var i =0; i<80; i=i+1){
			dv.setUint8(i,0,true);
		}
		dv.setUint32( 80,faces.length,true);
		var dataOffset = 84;
		var faceLength = 12 * 4 + 2;
		for(var index in faces){
			var start = dataOffset + index * faceLength;
			dv.setFloat32(start,faces[index].normal.x,true);
			dv.setFloat32(start+4,faces[index].normal.y,true);
			dv.setFloat32(start+8,faces[index].normal.z,true);
			var vindex =[faces[index].a,faces[index].b,faces[index].c];
			
			for ( var i = 1; i <= 3; i ++ ) {
				var vstart = start + i * 12;
				dv.setFloat32(vstart,vertices[vindex[i-1]].x,true);
				dv.setFloat32(vstart+4,vertices[vindex[i-1]].y,true);
				dv.setFloat32(vstart+8,vertices[vindex[i-1]].z,true);
			}
			dv.setUint16(start + 48, 0,true);
		}
		return stl;
	}else{
		var positions = geo.attributes.position.array;
		var normals = geo.attributes.normal.array;
		var fileSize = positions.length/9*50+84;
		var stl = new ArrayBuffer(fileSize);
		console.log(fileSize);
		var dv = new DataView(stl);
		for(var i =0; i<80; i=i+1){
			dv.setUint8(i,0,true);
		}
		dv.setUint32( 80,positions.length/9,true);
		var dataOffset = 84;
		var faceLength = 12 * 4 + 2;
		
		for(var i=0; i<positions.length; i=i+9){
			var start = dataOffset + i/9 * faceLength;
			dv.setFloat32(start,normals[i],true);
			dv.setFloat32(start+4,normals[i+1],true);
			dv.setFloat32(start+8,normals[i+2],true);

			for ( var j = 0; j < 9; j ++ ) {
				var vstart = start + 12 + j * 4;
				dv.setFloat32(vstart,positions[i+j],true);
			}
			dv.setUint16(start + 48, 0,true);
		}
		return stl;
	}
	
}