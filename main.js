(function(){
	var w = 800, h = 600;
	var requestId;
	var Player = function() {
		this.x = 0;
		this.y = 0;
		this.vx = 0;
		this.vy = 0;
		this.stasis = true;
	}
	var p = new Player();

	var Bullet = function(){
		this.x = 0;
		this.y = 0;
		this.v = 0;
		this.exist = false;
	}
	var bullet = [];
	var bullet_max = 500;
	var exist_bullet = false;

	var Enemy = function(){
		this.x = 0;
		this.y = 0;
		this.vx = 0;
		this.vy = 0;
		this.exist = false;
	}
	var EnemyBullet = function(){
		this.x = 0;
		this.y = 0;
		this.v = 0;
		this.exist = false;
	}
	var enemy = [];
	var enemy_bullet = [];

	var cnt_damage = 0;
	var cnt_shot = 0;
	var cnt_hit = 0;


	var canvas = document.getElementById('canvas');
	canvas.addEventListener("click", onClick, false);
	canvas.addEventListener('mousemove', onMove, false);
	var ctx = canvas.getContext('2d');
	
	init();
	requestId = window.requestAnimationFrame(renderTitle); 

	function init(){
		for(var i = 0; i < bullet_max; i++){
			bullet[i] = new Bullet();
			enemy[i] = new Enemy();
			enemy_bullet[i] = new EnemyBullet();
		}
	}

	function addVelocity(x,y){
		if(p.vx*x<0){
			p.vx = 0;
		}
		if(p.vy*x<0){
			p.vy = 0;
		}
		p.vx += x;
		p.vy += y;
		velocityLimit();
		if(p.stasis)
			move();
	}

	function move(){
		p.stasis = false;
		//var timer = 0;
		//while(p.vx!=0 || p.vy!=0){
			//timer++;
			//if(timer == 100){
				//console.log("pos:"+p.x +" "+p.y+" "+p.vx+" "+p.vy);
				timer = 0;
				p.x += p.vx;
				p.y += p.vy;
				if(p.vx>0){
					p.vx -= 1;
				}else if(p.vx<0){
					p.vx += 1;
				}
				if(p.vy>0){
					p.vy -= 1;
				}else if(p.vy<0){
					p.vy += 1;
				}
			//}
		//}
		moveLimit();
		if(p.vx!=0 || p.vy!=0){
			window.requestAnimationFrame(move); 
		}else{
			p.stasis = true;
		}
	}

	function velocityLimit(){
		var max = 5;
		if(keyOn[16])max=2;
		if(p.vx>max)p.vx=max;
		if(p.vy>max)p.vy=max;
		if(p.vx<-max)p.vx=-max;
		if(p.vy<-max)p.vy=-max;
	}

	function moveLimit(){
		if(p.x>w-10)p.x=w-10;
		if(p.y>h-10)p.y=h-10;
		if(p.x<0)p.x=0;
		if(p.y<0)p.y=0;
	}

	function renderTitle(){
		var str = "SampleText";
		var margin = w - 20*str.length;
		ctx.fillStyle = '#aaa';
		ctx.fillRect(0,0,w,h);
		ctx.font= 'bold 40px Meiryo';
		ctx.strokeStyle = '#333';
		ctx.lineWidth = 6;
		ctx.lineJoin = 'round';
		ctx.fillStyle = '#fff';
		/*
		ctx.strokeText(str,margin/2,455,510);
		ctx.fillText(str,margin/2,455);
		*/

		onKeyCheck();

		drawBlock();
		ctx.fillStyle = '#fff';
		ctx.fillRect(p.x-5,p.y-5,10,10);
		ctx.fillStyle = '#a40';
		for(var i = 0; i < bullet_max; i++){
			if(enemy[i].exist)
				ctx.fillRect(enemy[i].x-25,enemy[i].y,50,5);
			if(enemy_bullet[i].exist)
				ctx.fillRect(enemy_bullet[i].x,enemy_bullet[i].y,5,5);
		}
		ctx.fillStyle = '#fff';
		for(var i = 0; i < bullet_max; i++){
			if(bullet[i].exist)
				ctx.fillRect(bullet[i].x,bullet[i].y,5,5);
		}

		ctx.fillText("スコア "+cnt_hit,400,50);
		ctx.fillText("hit率 "+Math.floor(cnt_hit*100/cnt_shot)+"%",400,150);
		ctx.fillText(cnt_damage+" 被弾",400,250);
		ctx.fillText("SHOT : space key",400,350);
		ctx.fillText("enemy : P key",400,400);
		requestId = window.requestAnimationFrame(renderTitle); 
	}

	function hitCheck_Bullet(num,x,y){
		for(var i = 0; i < bullet_max; i++){
			if(enemy[i].exist && Math.abs(enemy[i].x-x)<25 && Math.abs(enemy[i].y-y)<5){
				//console.log("hit:"+Math.abs(enemy[i].x-x)+" "+Math.abs(enemy[i].y-y)+" "+enemy[i].x+" "+enemy[i].y+" b "+x+" "+y);
				enemy[i].exist = false;
				bullet[num].exist = false;
				popEnemy();
				cnt_hit++;
				break;
			}
		}
	}
	function hitCheck_EnemyBullet(){
		for(var i = 0; i < bullet_max; i++){
			if(enemy_bullet[i].exist && Math.abs(p.x-enemy_bullet[i].x)<5 && Math.abs(p.y-enemy_bullet[i].y)<5){
				//console.log("hit:"+Math.abs(enemy[i].x-x)+" "+Math.abs(enemy[i].y-y)+" "+enemy[i].x+" "+enemy[i].y+" b "+x+" "+y);
				enemy_bullet[i].exist = false;
				cnt_damage++;
				break;
			}
		}
	}

	var enemy_flag = false;
	function popEnemy(){
		var x = Math.floor(Math.random()*300);
		for(var i = 0; i < bullet_max; i++){
			if(!enemy[i].exist){
				enemy[i].exist = true;
				enemy[i].x = 50 + x;
				enemy[i].y = 50;
				enemy[i].vx = -2 + Math.floor(Math.random()*5);
				enemy[i].vy = 1;
				break;
			}
		}
		if(!enemy_flag)
			moveEnemy();
	}

	var enemy_bullet_flag = false;
	function shotEnemy(x,y){
		for(var i = 0; i < bullet_max; i++){
			if(!enemy_bullet[i].exist){
				enemy_bullet[i].exist = true;
				enemy_bullet[i].x = x;
				enemy_bullet[i].y = y;
				enemy_bullet[i].vx = -2 + Math.floor(Math.random()*5);
				enemy_bullet[i].vy = 2;
				break;
			}
		}
		if(!enemy_bullet_flag)
			moveEnemyBullet();
	}

	function moveEnemy(){
		enemy_flag = true;
		var v = false;
		for(var i = 0; i < bullet_max; i++){
			if(enemy[i].exist){
				v = true;
				if(enemy[i].x<50 || enemy[i].x>350)
					enemy[i].vx *= -1;
				enemy[i].x += enemy[i].vx;
				enemy[i].y += enemy[i].vy;
				if(enemy[i].y>550)
					enemy[i].exist = false;
				if(enemy[i].y%10==0){
					var r = Math.floor(Math.random()*3);
					if(r==0){
						shotEnemy(enemy[i].x,enemy[i].y);
					}
				}
			}
		}
		if(v){
			window.requestAnimationFrame(moveEnemy);
		}else{
			enemy_flag = false;
		}
	}

	function moveEnemyBullet(){
		enemy_bullet_flag = true;
		var v = false;
		for(var i = 0; i < bullet_max; i++){
			if(enemy_bullet[i].exist){
				v = true;
				enemy_bullet[i].x += enemy_bullet[i].vx;
				enemy_bullet[i].y += enemy_bullet[i].vy;
				if(enemy_bullet[i].y>550 || enemy_bullet[i].x<50 || enemy_bullet[i].x>350)
					enemy_bullet[i].exist = false;
			}
			hitCheck_EnemyBullet();
		}
		if(v){
			window.requestAnimationFrame(moveEnemyBullet);
		}else{
			enemy_bullet_flag = false;
		}
	}

	var flag = false;
	function moveBullet(){
		exist_bullet = true;
		var v = false;
		for(var i = 0; i < bullet_max; i++){
			if(bullet[i].exist){
				v = true;
				bullet[i].v += 1;
				if(bullet[i].v > 80)bullet[i].v = 80;
				//bullet[i].y -= bullet[i].v;
				bullet[i].y -= Math.floor(Math.sqrt(bullet[i].v));
				hitCheck_Bullet(i,bullet[i].x,bullet[i].y);
			}
			if(bullet[i].y<0)
				bullet[i].exist = false;
		}
		if(v){
			window.requestAnimationFrame(moveBullet);
		}else{
			exist_bullet = false;
		}
	}

	function genBullet(){
		for(var i = 0; i < bullet_max; i++){
			if(!bullet[i].exist){
				bullet[i].x = p.x;
				bullet[i].y = p.y;
				bullet[i].v = 0;
				bullet[i].exist = true;
				cnt_shot++;
				break; 
			}
		}
		if(!exist_bullet)
			moveBullet();
	}

	function onKeyCheck(){
		var spd = 5;
		if(keyOn[32]){//space
			genBullet();
			keyOn[32] = false;
		}
		if(keyOn[80]){//p
			popEnemy();
			keyOn[80] = false;
		}
		if(keyOn[16])spd=2;
		if(keyOn[65])addVelocity(-spd,0);//a
		if(keyOn[83])addVelocity(0,spd);//s
		if(keyOn[68])addVelocity(spd,0);//d
		if(keyOn[87])addVelocity(0,-spd);//w
		if(keyOn[37])addVelocity(-spd,0);//←
		if(keyOn[40])addVelocity(0,spd);//↓
		if(keyOn[39])addVelocity(spd,0);//→
		if(keyOn[38])addVelocity(0,-spd);//↑
	}

	function drawBlock(){
		var hh = 50, ww = 50;
		ctx.fillStyle = '#222';
		ctx.fillRect(ww,hh,300,500);
		ctx.fillStyle = '#ddd';
		ctx.fillRect(ww+5,hh+5,300-10,500-10);
	}

	function onClick(e){
		var rect = e.target.getBoundingClientRect();
		var x =  Math.round(e.clientX - rect.left);
		var y =  Math.round(e.clientY - rect.top);
		console.log("click "+x+" "+y);
	}

	function onMove(e){
		var rect = e.target.getBoundingClientRect();
		var x =  Math.round(e.clientX - rect.left);
		var y =  Math.round(e.clientY - rect.top);
		//console.log(x+" "+y);
	}
	var keyOn = [];
	document.onkeydown = function (e){
		var key = e.keyCode;
		console.log(key);
		var spd = 7;
		keyOn[key] = true;
	};

	document.onkeyup = function (e){
		var key = e.keyCode;
		keyOn[key] = false;
	};
})();