AFRAME.registerComponent("throw-model", {
  schema: {
    defaultPosition: { default: "0 -0.5 -2" },
    scale: { default: "0.02 0.02 0.02" },
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
    this.defaultY = y;
    this.defaultZ = z;

    this.swayAmount = 0.5; // ระยะการเคลื่อนที่ซ้าย-ขวา
    this.swaySpeed = 0.001; // ความเร็วในการเคลื่อนที่
    this.lastUpdate = Date.now();
    this.startSway();

    //! สร้าง UI สำหรับแสดงค่าพิกัด ----------------
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
    //! สร้าง UI สำหรับแสดงค่าพิกัด ----------------

    this.el.addEventListener("loaded", () => {
      // สร้าง UFO entity
      const scene = document.querySelector("a-scene");
      this.ufo = document.createElement("a-entity");

      // ตั้งค่าคุณสมบัติของ UFO
      this.ufo.setAttribute("id", "throwing-ufo");
      this.ufo.setAttribute("gltf-model", "#throwing-model");
      this.ufo.setAttribute("scale", this.data.scale);
      this.ufo.setAttribute("position", this.data.defaultPosition);
      this.ufo.setAttribute("animation", {
        property: "rotation",
        to: "0 360 0",
        dur: 5000,

        loop: true,
        easing: "linear",
      });

      // เพิ่ม UFO เข้าไปใน camera entity
      const camera = document.querySelector("[camera]");
      camera.appendChild(this.ufo);

      // เพิ่ม event listener สำหรับปุ่มโยน
      const throwButton = document.getElementById("throwButton");
      throwButton.addEventListener("click", () => this.throwObject());
    });
  },

  startSway: function () {
    if (!this.isThrown) {
      const currentTime = Date.now();
      const deltaTime = currentTime - this.lastUpdate;

      // คำนวณตำแหน่ง x แบบ sine wave
      const newX = Math.sin(currentTime * this.swaySpeed) * this.swayAmount;
      this.defaultX = newX;

      if (this.ufo) {
        const currentPos = this.ufo.getAttribute("position");
        this.ufo.setAttribute(
          "position",
          `${newX} ${currentPos.y} ${currentPos.z}`
        );

        // อัพเดทค่าแสดงผล x
        document.getElementById("x-distance").textContent = newX.toFixed(2);
      }

      this.swayAnimation = requestAnimationFrame(() => this.startSway());
      this.lastUpdate = currentTime;
    }
  },

  throwObject: function () {
    if (this.isThrown) return;

    // หยุดการแกว่งไปมา
    cancelAnimationFrame(this.swayAnimation);
    this.count = true;

    // ใช้ค่า power จากตัวแปร Global
    const power = window.throwingPower.value;
    this.initialVelocity = 15 * (power / 100);

    this.isThrown = true;
    this.throwStartTime = Date.now();

    // เริ่ม animation loop
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

    this.ufo.setAttribute("position", `${x} ${y} ${z}`);

    document.getElementById("z-distance").textContent = z.toFixed(2);
    document.getElementById("y-distance").textContent = y.toFixed(2);
    document.getElementById("x-distance").textContent = x.toFixed(2);

    // เช็คระยะทางและเปลี่ยนสีห่วง
    const ring = document.querySelector("#santa-model");

    // ดึงค่าระยะห่างจริงจาก Global variable
    const markerZ = window.markerDistance.z;
    const markerY = window.markerDistance.y;
    const markerX = window.markerDistance.x;

    // คำนวณช่วง tolerance สำหรับทุกแกน
    const toleranceZ = Math.abs(markerZ * 0.1);
    const toleranceY = Math.abs(markerY * 0.15) + 0.2;
    const toleranceX = 0.5;

    const minZ = markerZ - toleranceZ;
    const maxZ = markerZ + toleranceZ;
    const minY = markerY - toleranceY;
    const maxY = markerY + toleranceY;
    const minX = markerX - toleranceX;
    const maxX = markerX + toleranceX;

    // เช็คว่าทั้ง x, y และ z อยู่ในช่วง tolerance ของระยะห่างจริง
    if (
      z >= minZ &&
      z <= maxZ &&
      y >= minY &&
      y <= maxY &&
      x >= minX &&
      x <= maxX &&
      this.count
    ) {
      ring.setAttribute("material", "color: #00ff00");
      window.gameState.score += 3;
      console.log(this.count);
      this.count = false;
    } else {
      ring.setAttribute("material", "color: #ff0000"); 
    }

    // เช็คว่าจบการเคลื่อนที่หรือยัง
    if (y < -10 || z < -30) {
      this.isThrown = false;
      this.count = false;
      this.ufo.setAttribute("position", this.data.defaultPosition);
      ring.setAttribute("material", "color: #ff0000");
      cancelAnimationFrame(this.animationLoop);

      // เริ่มการแกว่งใหม่
      this.startSway();

      // รีเซ็ตค่าแสดงผลโดยใช้ค่าจาก defaultPosition
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
