// distance-display.js - ไฟล์สำหรับแสดงระยะห่างระหว่างกล้องและมาร์คเกอร์

// เพิ่มตัวแปร Global ไว้ด้านบนสุดของไฟล์
window.markerDistance = {
	x: 0,
	y: 0,
	z: 0
};

// ลงทะเบียน component ชื่อ marker-distance ใน A-Frame
AFRAME.registerComponent("marker-distance", {
	// ฟังก์ชัน init จะทำงานเมื่อ component ถูกสร้างขึ้น
	init: function () {
		// สร้าง UI element สำหรับแสดงระยะห่างแต่ละแกน
		const axisDisplay = document.createElement("div");
		axisDisplay.id = "axis-display";
		axisDisplay.style.position = "fixed";
		axisDisplay.style.bottom = "10px";
		axisDisplay.style.left = "10px";
		axisDisplay.style.background = "rgba(0,0,0,0.7)";
		axisDisplay.style.color = "white";
		axisDisplay.style.padding = "10px";
		axisDisplay.style.fontFamily = "Arial, sans-serif";
		axisDisplay.style.zIndex = "999";
		document.body.appendChild(axisDisplay);

		this.marker = document.querySelector("a-marker");
		this.camera = document.querySelector("a-entity[camera]");
		this.axisDisplay = axisDisplay;
	},

	// ฟังก์ชัน tick จะทำงานทุกเฟรม
	tick: function () {
		// ตรวจสอบว่า marker ปรากฏอยู่ในภาพหรือไม่
		if (this.marker.object3D.visible) {
			const markerPosition = this.marker.object3D.position;
			const cameraPosition = this.camera.object3D.position;

			// คำนวณระยะห่างในแต่ละแกน
			const xDist = markerPosition.x - cameraPosition.x;
			const yDist = markerPosition.y - cameraPosition.y;
			const zDist = markerPosition.z - cameraPosition.z;

			// อัพเดทค่า Global
			window.markerDistance.x = xDist;
			window.markerDistance.y = yDist;
			window.markerDistance.z = zDist;

			// แสดงระยะห่างในแต่ละแกน
			this.axisDisplay.innerHTML = `
                ระยะห่างตามแกน:<br>
                X: ${xDist.toFixed(2)} เมตร<br>
                Y: ${yDist.toFixed(2)} เมตร<br>
                Z: ${zDist.toFixed(2)} เมตร
            `;
		}
	},
});
