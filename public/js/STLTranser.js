/**
 * @author future  http://github.com/jianglai3303
 *
 * Description: A THREE Transer for BufferGeometry and Geometry, translate .BufferGeometry/Geometry into STL file.
 *
 * Usage:
 *		var transer = new THREE.STLTranser(url);
 *		transer.trans2STL(geometry);
 * url is the http post url for tranfering the STL file to. Do not support to save the STL file by file system because 
 * of security concern.
 *
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

THREE.STLTranser.prototype.moveZ = function(geo,value){
	
	var m = new THREE.Matrix4();
	m.makeTranslation(0,0,value);
	geo.applyMatrix(m);
	var stl = this.trans2STL(geo);
	return stl;
}
THREE.STLTranser.prototype.moveX = function(geo,value){
	
	var m = new THREE.Matrix4();
	m.makeTranslation(value,0,0);
	geo.applyMatrix(m);
	var stl = this.trans2STL(geo);
	return stl;
}
THREE.STLTranser.prototype.moveY = function(geo,value){
	
	var m = new THREE.Matrix4();
	m.makeTranslation(0,value,0);
	geo.applyMatrix(m);
	var stl = this.trans2STL(geo);
	return stl;
}
THREE.STLTranser.prototype.rotateX = function(geo,value){
	
	var m = new THREE.Matrix4();
	m.makeRotationX(value);
	geo.applyMatrix(m);
	var stl = this.trans2STL(geo);
	return stl;
}