class MenuElement {
	constructor(data, /*x, y, w, h*/ color, border = false, text = false){
		//data consists of a shape type and data.
		this.type = data[0];
		if(data[0] == "rectangle"){
			this.x = data[1];
			this.y = data[2];
			this.w = data[3];
			this.h = data[4];
		}
		else if (data[0] == "circle"){
			this.x = data[1];
			this.y = data[2];
			this.r = data[3];
		}
		else if (data[0] == "image"){
			this.imageData = data[1];
			this.x = data[2];
			this.y = data[3];
			this.w = data[4];
			this.h = data[5];
		}
		else if (data[0] == "path"){
			this.path = data[1]
			this.x = data[2];
			this.y = data[3];
		}

		if(color){this.color = color;}
		if(border){
			this.borderWidth = border[0];
			this.borderColor = border[1];
		}
		else {
			this.borderWidth = false;
			this.borderColor = 0;
		}

		if(text){
			this.text = text[0];
			this.textColor = text[1];
			this.font = text[2];
		}
		else {
			this.text = false;
			this.textColor = 0;
			this.font = 0;
		}
	}
	render(){ 
		//check type and execute specific render. paths render with transform and reset transform
		// text comes after specific render, rotate before.
		if(this.type == "rectangle"){
			if(this.text){drawBox(this.x, this.y, this.w, this.h, this.color, this.borderWidth, this.borderColor, this.text, this.textColor, this.font);}
			else {drawBox(this.x, this.y, this.w, this.h, this.color, this.borderWidth, this.borderColor);}
		}
		if(this.type == "circle"){
			ctx.beginPath();
			ctx.arc(this.x, this.y, this.r, 0, 2*Math.PI);
			if (this.color){ctx.fillStyle = this.color; ctx.fill();}
			if (this.borderWidth){
				ctx.lineWidth = this.borderWidth; 
				ctx.fillStyle = this.borderColor; 
				ctx.stroke();
			}
		}
		if(this.type == "image"){
			ctx.drawImage(this.imageData, this.x, this.y, this.w, this.h);
		} //drawImage
		if(this.type == "path"){
			if (this.color){
				ctx.fillStyle = this.color; 
				ctx.save(); 
				ctx.translate(this.x, this.y);
				ctx.fill(this.path);
				ctx.restore();
			}
			if (this.borderWidth){
				ctx.lineWidth = this.borderWidth; 
				ctx.fillStyle = this.borderColor;
				ctx.save(); 
				ctx.translate(this.x, this.y);
				ctx.stroke(this.path);
				ctx.restore();
			}
		} //transform and reset
	}
	checkClick(mx, my){
		//type based collison checking, for paths use subtract and point in path.
		if(this.type == "rectangle" || this.type == "image"){
			if(this.x < mx && mx < this.x + this.w && this.y < my && my < this.y + this.h){
				return true;
			}
			else {
				return false;
			}
		}
		if(this.type == "circle"){
			if(Math.sqrt( Math.pow((this.x-mx), 2) + Math.pow((this.y-my), 2)) < this.r){
				return true;
			}
			else {	
				return false;
			}
		}
		if(this.type == "path"){
			ctx.translate(this.x, this.y);
			var hit = ctx.isPointInPath(this.path,mx,my);
			ctx.translate(-this.x, -this.y);
			return hit;
		}
	} 
}