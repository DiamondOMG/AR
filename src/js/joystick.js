// สร้างตัวแปร Global
window.throwingPower = {
	value: 0,
};

class Joystick {
	constructor() {
		this.isDragging = false;
		this.startY = 0;
		this.dragDistance = 0;
		this.maxDrag = 100;

		// สร้างปุ่มโยนแบบซ่อน (สำหรับทริกเกอร์ event)
		this.createHiddenButton();
		// สร้าง UI จอยสติ๊ก
		this.createJoystickUI();
		// เพิ่ม event listeners
		this.addEventListeners();
	}

	createHiddenButton() {
		// สร้างปุ่มซ่อนสำหรับทริกเกอร์
		const hiddenButton = document.createElement("button");
		hiddenButton.id = "throwButton";
		hiddenButton.style.display = "none";
		document.body.appendChild(hiddenButton);
	}

	createJoystickUI() {
		const container = document.createElement("div");
		container.id = "joystick-container";
		container.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            z-index: 999;
            text-align: center;
        `;

		// สัวแสดงความแรง
		const powerDisplay = document.createElement("div");
		powerDisplay.id = "power-display";
		powerDisplay.style.cssText = `
            color: white;
            font-size: 24px;
            margin-bottom: 10px;
            text-shadow: 1px 1px 2px black;
        `;
		powerDisplay.textContent = " 0%";

		// แถบจอยสติ๊ก
		const joystickArea = document.createElement("div");
		joystickArea.id = "joystick-area";
		joystickArea.style.cssText = `
            width: 60px;
            height: 150px;
            background: rgba(255,255,255,0.2);
            border: 2px solid white;
            border-radius: 30px;
            position: relative;
            touch-action: none;
        `;

		// สุ่มจอยสติ๊ก
		const knob = document.createElement("div");
		knob.id = "joystick-knob";
		knob.style.cssText = `
            width: 50px;
            height: 50px;
            background: white;
            border-radius: 25px;
            position: absolute;
            left: 5px;
            top: 5px;
            cursor: pointer;
            box-shadow: 0 0 10px rgba(0,0,0,0.3);
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: bold;
            color: #666;
            user-select: none;
        `;
		knob.textContent = "↓";

		// ประกอบ UI
		joystickArea.appendChild(knob);
		container.appendChild(powerDisplay);
		container.appendChild(joystickArea);
		document.body.appendChild(container);

		this.knob = knob;
		this.powerDisplay = powerDisplay;
		this.joystickArea = joystickArea;
	}

	addEventListeners() {
		// Mouse Events
		this.knob.addEventListener("mousedown", this.startDragging.bind(this));
		document.addEventListener("mousemove", this.onDrag.bind(this));
		document.addEventListener("mouseup", this.stopDragging.bind(this));

		// Touch Events
		this.knob.addEventListener("touchstart", this.startDragging.bind(this));
		document.addEventListener("touchmove", this.onDrag.bind(this), {
			passive: false,
		});
		document.addEventListener("touchend", this.stopDragging.bind(this));
	}

	startDragging(e) {
		this.isDragging = true;
		this.startY = e.type.includes("touch") ? e.touches[0].clientY : e.clientY;
		this.knob.style.transition = "none";
	}

	onDrag(e) {
		if (!this.isDragging) return;

		e.preventDefault();
		const currentY = e.type.includes("touch")
			? e.touches[0].clientY
			: e.clientY;
		this.dragDistance = Math.max(
			0,
			Math.min(currentY - this.startY, this.maxDrag)
		);

		// อัพเดทตำแหน่งปุ่ม
		const newY = Math.min(Math.max(5 + this.dragDistance, 5), 105);
		this.knob.style.top = `${newY}px`;

		// แสดงค่าความแรง
		const power = Math.round((this.dragDistance / this.maxDrag) * 100);
		this.powerDisplay.textContent = `${power}%`;

		// อัพเดทค่า Global
		window.throwingPower.value = power;
	}

	stopDragging() {
		if (!this.isDragging) return;
		this.isDragging = false;

		// รีเซ็ตตำแหน่งปุ่ม
		this.knob.style.transition = "top 0.2s";
		this.knob.style.top = "5px";

		// สริกเกอร์การโยน
		const throwButton = document.getElementById("throwButton");
		if (throwButton && this.dragDistance > 0) {
			throwButton.click();
		}

		// รีเซ็ตค่า
		this.dragDistance = 0;
		this.powerDisplay.textContent = "0%";
	}
}

// สร้าง instance เมื่อโหลดหน้าเว็บ
window.addEventListener("load", () => {
	new Joystick();
});
