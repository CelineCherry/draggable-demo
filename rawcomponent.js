function breakTextIntoLines(string, width){
	var offset = 0;
	var lines = [];
	var i = 0;
	for (i = 0; i < string.length; i++){
		if (ctx.measureText(string.slice(offset, i)).width > width){
			var lineEnd = string.slice(0, i).lastIndexOf(" ") + 1;
			var line = string.slice(offset, lineEnd);
			lines.push(line);
			offset = lineEnd;
		}
	}
	lines.push(string.slice(offset));
	return lines;
}

function drawTextLines(x, y, lines, drawType = "fill"){
	var fontHeight = parseInt(ctx.font.match(/\d+/), 10);
	var i = 0;
	if(drawType == "fill"){
		for(i = 0; i < lines.length; i++){					
			ctx.fillText(lines[i], x, y + i * 1.75 * fontHeight);
		}
	}
	else if(drawType == "stroke"){
		for(i = 0; i < lines.length; i++){					
			ctx.strokeText(lines[i], x, y + i * 1.75 * fontHeight);
		}
	}
	else if(drawType == "both"){
		for(i = 0; i < lines.length; i++){
			ctx.strokeText(lines[i], x, y + i * 1.75 * fontHeight);	
			ctx.fillText(lines[i], x, y + i * 1.75 * fontHeight);
		}
	}
}

class Sprite {
	constructor(image, sX, sY, sWidth, sHeight){
		this.image = image;
		this.sX = sX;
		this.sY = sY;
		this.sWidth = sWidth;
		this.sHeight = sHeight;
	}
	render(dx, dy, dWidth, dHeight){
		ctx.drawImage(this.image, this.sX, this.sY, this.sWidth, this.sHeight, dx, dy, dWidth, dHeight);
	}
}

var spriteLib = [
	new Sprite(idontwannalose, 32, 0, 32, 32),
];


class Shape {
	constructor(type, color, borderWidth, borderColor, opacity, rotation, data, x, y, ...dimensions){
		this.type = type;
		if(color){this.color = color;}
		if(borderWidth){this.borderWidth = borderWidth;}
		if(borderColor){this.borderColor = borderColor;}
		if(opacity && opacity != 1){this.opacity = opacity;}
		if(rotation && rotation != 0 || rotation != 360){
			if(typeof rotation == "object"){this.r = rotation[0]; this.rAxis = rotation[1]}
			else{
				this.r = rotation;
			}
		}
		this.x = x;
		this.y = y;

		if(type == "rectangle" || type == "image"){
			this.w = dimensions[0];
			this.h = dimensions[1];
			if(type == "image"){
				this.imageData = data;
			}
		}
		else if (type == "circle"){
			this.r = dimensions[0];
		}
		else if (type == "path"){
			this.path = new Path2D(data);
			var newElement = document.createElementNS("http://www.w3.org/2000/svg", 'path'); //Create a path in SVG's namespace
			newElement.id = "temp";
			newElement.setAttribute("d",data); //Set path's data
			if (this.borderWidth){newElement.style.strokeWidth = this.borderWidth + "px";} //Set stroke width
			pathBuffer.appendChild(newElement);
			var dimensions = document.getElementById("temp").getBoundingClientRect();
			this.w = dimensions.width;
			this.h = dimensions.height;
			newElement.remove();
		}
		else if (type == "text"){
			this.font = dimensions[0];
			if(dimensions[2]){this.align = dimensions[2]}
			if(dimensions[3]){this.baseline = dimensions[3]}
			if(dimensions[1]){
				ctx.font = this.font;
				this.text = breakTextIntoLines(data, dimensions[1]);
				ctx.textBaseline = "top";
				this.h = ctx.measureText(this.text[0]).actualBoundingBoxDescent*this.text.length*1.25;
				this.w = ctx.measureText(this.text[0]).width;
			}
			else {
				this.text = data;
				ctx.font = this.font;
				ctx.textBaseline = "top";
				this.w = ctx.measureText(this.text).width;
				this.h = ctx.measureText(this.text).actualBoundingBoxDescent;
				
			}
		}
	}
	render(offsetX, offsetY, offsetAlpha){
		var x = offsetX ? this.x + offsetX : this.x;
		var y = offsetY ? this.y + offsetY : this.y;
		if(this.alpha){
			var alpha = offsetAlpha ? this.opacity + offsetAlpha : this.opacity; 
			ctx.globalAlpha = alpha;
		}
		if(this.r){
			if(!this.rAxis){this.rAxis = [this.w/2, this.h/2];}
			ctx.save();
			ctx.translate(x + this.rAxis[0], y + this.rAxis[1]);
			ctx.rotate(this.r * degrees);
				
			x = -this.rAxis[0];
			y = -this.rAxis[1];
			//x = this.w/-2;
			//y = this.h/-2;
			//ctx.translate(-this.rAxis[0], -this.rAxis[1]);
		}

		if(this.type == "rectangle"){
			if(this.borderWidth){
				ctx.strokeStyle = this.borderColor;
				ctx.lineWidth = this.borderWidth;
				ctx.strokeRect(x,y, this.w,this.h);
			}
			ctx.fillStyle = this.color;
			ctx.fillRect(x,y, this.w,this.h);
		}
		else if(this.type == "circle"){
			ctx.beginPath();
			ctx.arc(x, y, this.r, 0, 2*Math.PI);
			if (this.color){ctx.fillStyle = this.color; ctx.fill();}
			if (this.borderWidth){
				ctx.lineWidth = this.borderWidth;
				ctx.strokeStyle = this.borderColor;
				ctx.stroke();
			}
		}
		else if(this.type == "image"){
			if(this.borderWidth){
				ctx.strokeStyle = this.borderColor;
				ctx.lineWidth = this.borderWidth;
				ctx.strokeRect(x,y, this.w,this.h);
			}
			if (this.imageData instanceof Sprite){this.imageData.render(x, y, this.w, this.h)}
			else {ctx.drawImage(this.imageData, x, y, this.w, this.h);}
			if (this.color){
				ctx.fillStyle = this.color;
				ctx.fillRect(x,y, this.w,this.h);
			}
		}
		else if(this.type == "path"){
			if (this.color){
				ctx.fillStyle = this.color; 
				ctx.save(); 
				ctx.translate(x, y);
				ctx.fill(this.path);
				ctx.restore();
			}
			if (this.borderWidth){
				ctx.lineWidth = this.borderWidth; 
				ctx.strokeStyle = this.borderColor;
				ctx.save();
				ctx.translate(x, y);
				ctx.stroke(this.path);
				ctx.restore();
			}
		}
		else if (this.type == "text"){
			ctx.font = this.font;			
			if(this.align){ctx.textAlign = this.align;}
			if(this.baseline){ctx.textBaseline = this.baseline;}
			if(Array.isArray(this.text)){
				var fontHeight = parseInt(ctx.font.match(/\d+/), 10);
				var i = 0;
				if(this.borderWidth){
					ctx.lineWidth = this.borderWidth;
					ctx.strokeStyle = this.borderColor;
					for(i = 0; i < this.text.length; i++){					
						ctx.strokeText(this.text[i], x, y + i * 1.25 * fontHeight);
					}
				}
				if(this.color){
					ctx.fillStyle = this.color;
					for(i = 0; i < this.text.length; i++){					
						ctx.fillText(this.text[i], x, y + i * 1.25 * fontHeight);
					}
				}
			}
			else {
				if(this.borderWidth){
					ctx.lineWidth = this.borderWidth;
					ctx.strokeStyle = this.borderColor;	
					ctx.strokeText(this.text, x, y);
				}
				if(this.color){			
					ctx.fillStyle = this.color;	
					ctx.fillText(this.text, x, y);
				}
			}
			ctx.textAlign = "left";
			ctx.textBaseline = "top";
		}
		if(alpha){ctx.globalAlpha = 1;}
		if(this.r){ctx.restore();}
	}
	checkClick(mx, my, offsetX, offsetY){
		var x = offsetX ? this.x + offsetX : this.x;
		var y = offsetY ? this.y + offsetY : this.y;
		//type based collison checking, for paths use subtract and point in path.
		if(this.type == "rectangle" || this.type == "image" || this.type == "text"){
			if(x < mx && mx < x + this.w && y < my && my < y + this.h){
				return true;
			}
			else {
				return false;
			}
		}
		if(this.type == "circle"){
			if(Math.sqrt( Math.pow((x - mx), 2) + Math.pow((y - my), 2)) < this.r){
				return true;
			}
			else {	
				return false;
			}
			
		}
		if(this.type == "path"){
			ctx.translate(x, y);
			var hit = ctx.isPointInPath(this.path,mx,my);
			ctx.translate(-x, -y);
			return hit;
		}
	}
}

class VisualElement {
	constructor(x, y, shapes, collider = false){
		this.x = x;
		this.y = y;
		this.shapes = shapes;
		if (collider) {this.collider = collider;} // add special case for when collider is an index of shapes.
		else {
			if(Array.isArray(shapes)){this.collider = shapes[0];}
			else {this.collider = shapes;}
		}
	}
	render(){
		if(Array.isArray(this.shapes)){
			var shape = 0;
			for (shape of this.shapes){
				shape.render(this.x, this.y, false, this.x, this.y, this.x, this.y); //this.x, this.y
			}
		}
		else {
			this.shapes.render(this.x, this.y, false, this.x, this.y);
		}
	}
	checkClick(mx, my){
		return this.collider.checkClick(mx, my, this.x, this.y);
	} 
}