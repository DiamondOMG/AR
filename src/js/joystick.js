// สร้างตัวแปร Global
window.throwingPower = {
	value: 0,
};

class Joystick {
	constructor() {
		this.isPressing = false;
		this.maxPower = 100;
		this.minPower = 0;
		this.decreasingPower = true;
		this.power = 0;

		this.createButtonUI();
		this.createPowerBar();
		this.createPowerDisplay();
		this.addEventListeners();
	}

	createButtonUI() {
		// สร้าง invisible touch area เต็มจอ
		const touchArea = document.createElement("div");
		touchArea.id = "touch-area";
		touchArea.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        z-index: 998;
    `;

		// สร้าง container สำหรับ effects
		const effectsContainer = document.createElement("div");
		effectsContainer.id = "effects-container";
		effectsContainer.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        pointer-events: none;
        z-index: 999;
    `;

		// เพิ่ม keyframes สำหรับ animations
		const style = document.createElement("style");
		style.textContent = `
        @keyframes ripple {
            0% {
                transform: translate(-50%, -50%) scale(0.1);
                opacity: 0.8;
            }
            100% {
                transform: translate(-50%, -50%) scale(1);
                opacity: 0;
            }
        }

        @keyframes glow {
            0% {
                transform: translate(-50%, -50%) scale(0.5);
                opacity: 0.9;
            }
            100% {
                transform: translate(-50%, -50%) scale(1.5);
                opacity: 0;
            }
        }

        @keyframes pulse {
            0% {
                transform: translate(-50%, -50%) scale(1);
                opacity: 0.7;
            }
            50% {
                transform: translate(-50%, -50%) scale(1.2);
                opacity: 0.4;
            }
            100% {
                transform: translate(-50%, -50%) scale(1);
                opacity: 0.7;
            }
        }
    `;
		document.head.appendChild(style);

		const createTouchEffect = (x, y) => {
			// สร้าง ripple effect ด้วยสีฟ้า-ม่วง
			const ripple = document.createElement("div");
			ripple.style.cssText = `
            position: absolute;
            left: ${x}px;
            top: ${y}px;
            width: 200px;
            height: 200px;
            background: radial-gradient(circle, rgba(100,149,237,0.5) 0%, rgba(147,112,219,0.2) 50%, rgba(0,0,0,0) 70%);
            border-radius: 50%;
            animation: ripple 1s cubic-bezier(0.4, 0, 0.2, 1) forwards;
        `;
			effectsContainer.appendChild(ripple);
			setTimeout(() => ripple.remove(), 1000);

			// สร้าง glow effect ด้วยสีฟ้า-ม่วงซ้อนกัน
			const glow = document.createElement("div");
			glow.style.cssText = `
            position: absolute;
            left: ${x}px;
            top: ${y}px;
            width: 150px;
            height: 150px;
            background: radial-gradient(circle, 
                rgba(100,149,237,0.6) 0%, 
                rgba(138,43,226,0.4) 40%, 
                rgba(147,112,219,0.2) 60%, 
                rgba(0,0,0,0) 80%);
            border-radius: 50%;
            filter: blur(5px);
            animation: glow 1.5s cubic-bezier(0.4, 0, 0.2, 1) forwards;
        `;
			effectsContainer.appendChild(glow);
			setTimeout(() => glow.remove(), 1500);

			// สร้าง pulse effect ด้วยไล่สีฟ้า-ม่วง
			const pulse = document.createElement("div");
			pulse.style.cssText = `
            position: absolute;
            left: ${x}px;
            top: ${y}px;
            width: 50px;
            height: 50px;
            background: linear-gradient(135deg, rgba(100,149,237,0.8) 0%, rgba(147,112,219,0.8) 100%);
            border-radius: 50%;
            box-shadow: 0 0 20px rgba(100,149,237,0.5), 0 0 40px rgba(147,112,219,0.3);
            animation: pulse 1s cubic-bezier(0.4, 0, 0.2, 1) infinite;
        `;
			effectsContainer.appendChild(pulse);

			// เพิ่ม outer glow effect
			const outerGlow = document.createElement("div");
			outerGlow.style.cssText = `
            position: absolute;
            left: ${x}px;
            top: ${y}px;
            width: 180px;
            height: 180px;
            background: radial-gradient(circle, 
                rgba(100,149,237,0.3) 0%, 
                rgba(147,112,219,0.2) 40%, 
                rgba(138,43,226,0.1) 70%, 
                rgba(0,0,0,0) 100%);
            border-radius: 50%;
            filter: blur(10px);
            animation: glow 2s cubic-bezier(0.4, 0, 0.2, 1) forwards;
        `;
			effectsContainer.appendChild(outerGlow);
			setTimeout(() => outerGlow.remove(), 2000);

			return pulse;
		};

		let activeEffect = null;

		// Event Listeners สำหรับ mouse
		touchArea.addEventListener("mousedown", (e) => {
			activeEffect = createTouchEffect(e.clientX, e.clientY);
			this.startPressing(e);
		});

		document.addEventListener("mouseup", () => {
			if (activeEffect) {
				activeEffect.remove();
				activeEffect = null;
			}
			this.stopPressing();
		});

		// Event Listeners สำหรับ touch
		touchArea.addEventListener("touchstart", (e) => {
			e.preventDefault();
			const touch = e.touches[0];
			activeEffect = createTouchEffect(touch.clientX, touch.clientY);
			this.startPressing(e);
		});

		document.addEventListener("touchend", () => {
			if (activeEffect) {
				activeEffect.remove();
				activeEffect = null;
			}
			this.stopPressing();
		});

		document.body.appendChild(touchArea);
		document.body.appendChild(effectsContainer);

		this.button = touchArea;
	}

	createPowerDisplay() {
		// สร้างแสดงเปอร์เซ็นต์
		const powerDisplay = document.createElement("div");
		powerDisplay.id = "power-display";
		powerDisplay.style.cssText = `
    position: fixed;
    bottom: 30%;
    right: 20px;
    display: flex;
    flex-direction: column;
    align-items: center;
    z-index: 999;
    color: white; /* สีขาว */
    font-size: 1.5rem; /* ตัวใหญ่ขึ้น */
    font-family: 'Comic Sans MS', 'Arial', sans-serif; /* ฟอนต์น่ารักๆ */
    text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.5); /* เพิ่มเงาให้ตัวหนังสือ */
`;

		powerDisplay.textContent = "0%";

		document.body.appendChild(powerDisplay);
		this.powerDisplay = powerDisplay;
	}

	createPowerBar() {
		// สร้าง container สำหรับ power bar และ display
		const powerContainer = document.createElement("div");
		powerContainer.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        display: flex;
        flex-direction: column;
        align-items: center;
        z-index: 999;
    `;

		// สร้างแถบพลัง
		const powerBar = document.createElement("div");
		powerBar.id = "power-bar";
		powerBar.style.cssText = `
        width: 30px;
        height: 200px;
        background: linear-gradient(to top, red, yellow, green);
        border-radius: 15px;
        display: flex;
        align-items: flex-end;
        justify-content: center;
        border: 3px solid black;
        box-sizing: border-box;
        position: relative; /* เพิ่มเพื่อให้เป็นจุดอ้างอิงสำหรับ pointer */
    `;

		// สร้างพอยต์เตอร์
		const pointer = document.createElement("div");
		pointer.id = "pointer";
		pointer.style.cssText = `
        width: 24px; /* ปรับให้พอดีกับความกว้างของ power bar */
        height: 24px;
        background-color: white;
        border-radius: 50%;
        position: absolute;
        bottom: 0;
        left: 50%;
        transform: translateX(-50%);
        border: 2px solid black;
        box-sizing: border-box;
    `;

		powerBar.appendChild(pointer);
		powerContainer.appendChild(powerBar);
		document.body.appendChild(powerContainer);

		this.powerBar = powerBar;
		this.pointer = pointer;
	}

	addEventListeners() {
		this.button.addEventListener("mousedown", this.startPressing.bind(this));
		document.addEventListener("mouseup", this.stopPressing.bind(this));

		this.button.addEventListener("touchstart", this.startPressing.bind(this));
		document.addEventListener("touchend", this.stopPressing.bind(this));
	}

	startPressing(e) {
		this.isPressing = true;
		this.startTime = Date.now();
		this.decreasingPower = true;
		this.updatePower();
	}

	stopPressing() {
		if (this.isPressing) {
			this.isPressing = false;

			const throwButton = document.getElementById("throwButton");
			if (throwButton) {
				throwButton.click();
			}

			// เพิ่มการรีเซ็ตค่ากลับมา
			this.power = 0;
			this.powerDisplay.textContent = "0%";
			window.throwingPower.value = 0;
			this.pointer.style.bottom = "0px";
		}
	}

	updatePower() {
		if (!this.isPressing) return;

		if (this.decreasingPower) {
			if (this.power > this.minPower) {
				this.power -= 0.2;
			} else {
				this.decreasingPower = false;
			}
		} else {
			if (this.power < this.maxPower) {
				this.power += 0.2;
			} else {
				this.decreasingPower = true;
			}
		}

		this.powerDisplay.textContent = `${Math.round(this.power)}%`;
		window.throwingPower.value = this.power;

		// คำนวณตำแหน่งของ pointer ภายในขอบเขตของ power bar
		const barHeight = this.powerBar.clientHeight - this.pointer.clientHeight;
		const pointerPosition = (this.power / this.maxPower) * barHeight;
		this.pointer.style.bottom = `${pointerPosition}px`;

		if (this.isPressing) {
			requestAnimationFrame(this.updatePower.bind(this));
		}
	}
}

window.addEventListener("load", () => {
	new Joystick();
});
