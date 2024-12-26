import throwXYZ$ from "./globalState";

AFRAME.registerComponent("throw-model", {
	schema: {
		defaultPosition: { default: "0 -0.5 -2" },
		scale: { default: "0.2 0.2 0.2" },
	},
	init: function () {
		this.isThrown = false;
		this.count = false;
		this.throwStartTime = 0;
		this.initialVelocity = 15;
		this.angle = 45;
		this.gravity = 9.8;

		// แยกค่าพิกัดเริ่มต้นจาก defaultPosition
		const [x, y, z] = this.data.defaultPosition.split(" ").map(Number);
		this.defaultX = x;
		this.defaultY = y; //!ใช้เช็ค offset ที่เกินมา
		this.defaultZ = z;

		this.swayAmount = 0.5;
		this.swaySpeed = 0.001;
		this.lastUpdate = Date.now();

		//! สร้าง UI สำหรับแสดงค่าพิกัด
		const distanceDisplay = document.createElement("div");
		distanceDisplay.style.cssText = `
      position: fixed;
      top: 10px;
      right: 10px;
      background: rgba(0,0,0,0.7);
      color: white;
      padding: 10px;
      z-index: 999;
      border-radius: 5px;
      font-family: Arial, sans-serif;
    `;
		distanceDisplay.innerHTML = `
      <div>X: <span id="x-distance">${this.defaultX}</span> เมตร</div>
      <div>Y: <span id="y-distance">${this.defaultY}</span> เมตร</div>
      <div>Z: <span id="z-distance">${this.defaultZ}</span> เมตร</div>
    `;
		document.body.appendChild(distanceDisplay);

		// ตั้งค่าคุณสมบัติของ entity
		this.el.setAttribute("gltf-model", "#throwing-model");
		this.el.setAttribute("scale", this.data.scale);
		this.el.setAttribute("position", this.data.defaultPosition);
		this.el.setAttribute("animation", {
			property: "rotation",
			to: "0 360 0",
			dur: 5000,
			loop: true,
			easing: "linear",
		});

		const throwButton = document.getElementById("throwButton");
		throwButton.addEventListener("click", () => this.throwObject());
	},

	startSway: function () {
		if (!this.isThrown) {
			const currentTime = Date.now();
			const deltaTime = currentTime - this.lastUpdate;

			const newX = Math.sin(currentTime * this.swaySpeed) * this.swayAmount;
			this.defaultX = newX;

			const currentPos = this.el.getAttribute("position");
			this.el.setAttribute(
				"position",
				`${newX} ${currentPos.y} ${currentPos.z}`
			);

			document.getElementById("x-distance").textContent = newX.toFixed(2);

			this.swayAnimation = requestAnimationFrame(() => this.startSway());
			this.lastUpdate = currentTime;
		}
	},

	throwObject: function () {
		if (this.isThrown) return;

		cancelAnimationFrame(this.swayAnimation);
		this.count = true;

		const power = window.throwingPower.value;
		this.initialVelocity = 15 * (power / 100);

		this.isThrown = true;
		this.throwStartTime = Date.now();

		this.animationLoop = requestAnimationFrame(() => this.updatePosition());
	},

	updatePosition: function () {
		if (!this.isThrown) return;

		const t = (Date.now() - this.throwStartTime) / 1000;
		const angleRad = (this.angle * Math.PI) / 180;

		const v0 = this.initialVelocity;
		const y =
			this.defaultY +
			(v0 * Math.sin(angleRad) * t - 0.5 * this.gravity * t * t);
		const z = this.defaultZ + -v0 * Math.cos(angleRad) * t;
		const x = this.defaultX;

		this.el.setAttribute("position", `${x} ${y} ${z}`);

		document.getElementById("z-distance").textContent = z.toFixed(2);
		document.getElementById("y-distance").textContent = y.toFixed(2);
		document.getElementById("x-distance").textContent = x.toFixed(2);

		// เช็คระยะทางและเปลี่ยนสีห่วง
		const ring = document.querySelector("#santa-model");

		const markerZ = window.markerDistance.z;
		const markerY = window.markerDistance.y;
		const markerX = window.markerDistance.x;

		const toleranceZ = Math.abs(markerZ * 0.1);
		const toleranceY = Math.abs(markerY * 0.1) + 0.2;
		const toleranceX = 0.3;

		const minZ = markerZ - toleranceZ;
		const maxZ = markerZ + toleranceZ;
		const minY = markerY - toleranceY;
		const maxY = markerY + toleranceY;
		const minX = markerX - toleranceX;
		const maxX = markerX + toleranceX;

		if (
			z >= minZ &&
			z <= maxZ &&
			y >= minY &&
			y <= maxY &&
			x >= minX &&
			x <= maxX &&
			this.count
		) {
			const sound = document.querySelector("#success-sound");
			sound.currentTime = 0;
			sound.play();

			ring.setAttribute("material", "color: #00ff00");
			ring.setAttribute("animation", {
				property: "scale",
				from: "0.6 0.6 0.6",
				to: "0.8 0.8 0.8",
				dur: 500,
				easing: "easeOutQuad",
			});

			setTimeout(() => {
				ring.setAttribute("animation", {
					property: "scale",
					from: "0.8 0.8 0.8",
					to: "0.6 0.6 0.6",
					dur: 500,
					easing: "easeInQuad",
				});
			}, 500);

			setTimeout(() => {
				ring.setAttribute("material", "color: #ff0000");
			}, 1000);

			window.gameState.score += 3;
			this.count = false;
		}

		if (y < -10 || z < -30) {
			this.isThrown = false;
			this.count = false;
			this.el.setAttribute("position", this.data.defaultPosition);
			ring.setAttribute("material", "color: #ff0000");
			cancelAnimationFrame(this.animationLoop);

			document.getElementById("z-distance").textContent =
				this.defaultZ.toFixed(2);
			document.getElementById("y-distance").textContent =
				this.defaultY.toFixed(2);
			document.getElementById("x-distance").textContent =
				this.defaultX.toFixed(2);
		} else {
			this.animationLoop = requestAnimationFrame(() => this.updatePosition());
		}
	},
});
