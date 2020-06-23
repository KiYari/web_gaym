
			let cannon, x, y, cores_angle, cannon_angle, x_cannon, y_cannon;
			let START = 0;
			let reload;
			let gun_cores = [];
			let hp = 3;
			let idTimer;
			let level = 1;
			let score_points;
			let name;

			function getRandomInt(min, max) {
				min = Math.ceil(min);
				max = Math.floor(max);
				return Math.floor(Math.random() * (max - min + 1)) + min;
			}

			function rad(n) {
				return n * Math.PI / 180;
			}
			// hp
			let heart = new Image();
			heart.src = 'src/img/marine.png';
			// bg
			let mainBg = new Image(canvas.width, canvas.height);
			mainBg.src = 'src/img/bg.jpg';
			// enemie_sprites
			let ling = new Image();
			ling.src = 'src/img/ling.png';
			let gua = new Image();
			gua.src = 'src/img/gua.png';
			let ultra = new Image();
			ultra.src  = 'src/img/ultra.png';
			let tank = new Image();
			tank.src  = 'src/img/st_platform.png';

			let enemies_type;
			let enemy1 = [100, 0.5, ling, 120];
			let enemy2 = [300, 0.8, gua, 150];
			let enemy3 = [120, 0.6, ultra, 200];


			// init
			function init(){
				canvas = document.getElementById('canvas');
				if (canvas.getContext) {

					reload = 150; // reload_speed

					cores_angle = rad(60);
					cannon_angle = rad(60);

					START = 0;

					x_cannon = 50; // Gun
					y_cannon = canvas.height - 65;
					cannon = new Cannon;
					gun_cores = [];

					enemies = []; //Enemies
					score_points = 0;
					enemies_type = [enemy1, enemy2, enemy3];

					ctx = canvas.getContext('2d');
					x = canvas.getBoundingClientRect().left;
					y = canvas.getBoundingClientRect().top;
					getName();
					drawBack(ctx, canvas.width, canvas.height);
				}
			}

			function drawBack(ctx) {
				ctx.clearRect(0,0, canvas.width, canvas.height);
				ctx.drawImage(mainBg, 0, 0, canvas.width, canvas.height);
				cannon.draw(ctx);
				for (let i = 0; i < gun_cores.length; i++) {
					gun_cores[i].draw(ctx);
				}
				for (let i = 0; i < enemies.length; i++) {
					enemies[i].draw(ctx);
				}
				collusion();
				if (reload < 201) {
					reload++;
				}
				progressBar(ctx);
				info(ctx);
			}
			// Cannon
			Cannon = new Class({
				draw: function (ctx) {
					with (this) {
						ctx.drawImage(tank,-200,320);
						ctx.save()
						ctx.translate(x_cannon, y_cannon);
						ctx.rotate(cannon_angle);
						ctx.fillStyle = '#575454';
						ctx.beginPath();
						ctx.moveTo(-15, 33);
						ctx.lineTo(-15, -100);
						ctx.lineTo(15, -100);
						ctx.lineTo(15, 33);
						ctx.lineTo(-15, 33);
						ctx.fill();
						ctx.closePath();
						ctx.restore()
						ctx.save();
					}
				}
			})
			// entities
			GunCore = new Class({
				initialize: function (angle) {
					this.posX = 0;
					this.posY = 0;
					this.speed = 30;
					this.angle = angle
					this.size = 8;
				},
				draw: function (ctx) {
					ctx.fillStyle = '#30ff37';
					ctx.save();
					ctx.translate(x_cannon, y_cannon);
					ctx.beginPath();
					ctx.arc(this.posX, -this.posY, this.size, 0, 2 * Math.PI, false);
					ctx.closePath();
					ctx.fill();
					ctx.restore();
					this.physics();
				},
				physics: function () {
					this.posY = this.posX * Math.tan(this.angle) - (0.8 * (this.posX ** 2) /
							(2 * (this.speed ** 2) * (Math.cos(this.angle) ** 2)));
					this.posX += this.speed * Math.cos(this.angle) / 5;
				}
			})
			// enemies
			Enemies = new Class({
				initialize: function (pX, pY, speed, img, size) {
					this.posX = pX;
					this.posY = pY;
					this.speed = speed;
					this.img = img
					this.size = size;
				},
				draw: function (ctx) {
					ctx.drawImage(this.img, this.posX - this.size / 2, canvas.height - this.posY - this.size / 2,
							this.size, this.size);

				},
				getPoints: function () {
					return this.size / 10;
				}
			})

			function get_enemy(step) {
				let type = getRandomInt(0, 2);
				let enemy = new Enemies(canvas.width + step, enemies_type[type][0],
						enemies_type[type][1], enemies_type[type][2], enemies_type[type][3]);
				enemies.push(enemy);
			}


			// Shooting
			function goInput(){
				if (START === 1 && reload >= 150 ) {
					let core = new GunCore(cores_angle);
					gun_cores.push(core);
					reload = score_points / 1000;
				}
			}
			function rotate_cannon(event) {
				if (START === 1){
					let x1 = event.x - x - x_cannon;
					let y1 = canvas.height + y - event.y;
					if (x1 >= 0 && y1 >= 0 ){
						cores_angle = Math.atan2(y1, x1);
						cannon_angle = Math.atan2(x1, y1);
					}
				}
			}

			// Reload
			function progressBar(ctx) {
				ctx.save();
				ctx.translate(x_cannon - 45, y_cannon + 30);
				ctx.fillStyle = 'green';
				ctx.beginPath();
				ctx.fillRect(0, -150, 10, -( reload / 3));
				ctx.fill();
				ctx.restore();
				ctx.save();
			}

			function collusion() {
				for (let i = 0; i < gun_cores.length; i++) {
					if (gun_cores[i].posX > canvas.width ||  gun_cores[i].posY > canvas.height) {
						gun_cores.splice(i, 1)
					}
				}
			}


			// Start Game
			function start() {

				if (START === 1) {
					clearInterval(idTimer);
				}
				START = 1;
				idTimer = setInterval('gameLoop()', 1);
			}


			function gameLoop() {
				if (hp > 0) {
					drawBack(ctx);
					let step = 0;
					level = score_points / 300 + 1;
					let enemy_amount = level * 2;
					for (let i = 0; i < gun_cores.length; i++) {
						for (let j = 0; j < enemies.length; j++) {
							if (gun_cores[i] && enemies[j]) {
								if (kill(gun_cores[i], enemies[j])) {
									score_points += enemies[j].getPoints();
									enemies.splice(j, 1);
									gun_cores.splice(i, 1);
								}
							}
						}
					}
					for (let i = 0; i < enemies.length; i++) {
						if (enemies[i].posX <= 140) {
							enemies.splice(i, 1)
							hp--;
						}
					}
					// Enemies pathing
					for (let i = 0; i < enemies.length; i++) {
						enemies[i].posX -= enemies[i].speed + score_points / 1500;
					}

					while (enemies.length < enemy_amount) {
						get_enemy(step);
						step += 150;
					}
				}
				else {
					end_game();
				}
			}
			function kill(figure1, figure2) {
				let clashX = false;
				let clashY = false;
				if (figure1.posX - figure2.size / 2 <= figure2.posX && figure1.posX + figure2.size / 2 >= figure2.posX) clashX = true;
				if (figure1.posY - figure2.size / 2 <= figure2.posY && figure1.posY + figure2.size / 2 >= figure2.posY) clashY = true;
				return clashX && clashY
			}
			// xp
			function info(ctx) {
				document.getElementById("exp").innerHTML = score_points;
				let step_hp = 0;
				for (let i = 0; i < hp; i++) {
					ctx.drawImage(heart, 10 + step_hp, 30, 50, 50);
					step_hp += 40;
				}
			}
			function getName() {
				name = prompt('Input your nickname');
				if (name === '') {
					getName();
				}
			}

			function pause() {
				clearInterval(idTimer);
				START = 0;
			}
			function restart() {
				clearInterval(idTimer);
				discharge();
				start();
			}

			function discharge() {
				level = 1;
				hp = 3;
				START = 0
				score_points = 0;
				gun_cores = [];
				enemies = [];
				reload = 150;
				drawBack(ctx);
			}

			function end_game() {
				alert("GAME OVER");
				localStorage.setItem(name, score_points);
				clearInterval(idTimer);
				discharge();
				display_table();
			}
			// Score board
			function display_table() {
				let elements = [];
				for (let i = 0; i<localStorage.length; i++){
					let key = localStorage.key(i);
					elements.push([localStorage.getItem(key), key]);
				}
				elements = elements.sort(function (a, b) {
					return parseInt(a, 10) - parseInt(b, 10);
				}).reverse();
				let html = "<table id=\"gen\"><th>Nickname</th><th>Score</th>";
				for (let i = 0; i < localStorage.length && i < 15; i++) {
					html += "<tr aling=\"center\">";
					for (let j = 0; j < 1; j++) {
						html += "<td>" + elements[i][1] + "</td>";
						html += "<td>" + elements[i][0] + "</td>"
					}
					html += "</tr>";
				}
				html += "</table>";

				document.getElementById("table").innerHTML = html;
			}
			function change_name() {
				localStorage.setItem(name, score_points);
				discharge();
				getName();
			}
