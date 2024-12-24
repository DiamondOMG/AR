// สร้างตัวแปร Global
window.throwingPower = {
    value: 0,
};

class Joystick {
    constructor() {
        this.isPressing = false;
        this.maxPower = 100;

        // สร้างปุ่มโยนแบบซ่อน (สำหรับทริกเกอร์ event)
        this.createHiddenButton();
        // สร้าง UI ปุ่ม
        this.createButtonUI();
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

    createButtonUI() {
        const container = document.createElement("div");
        container.id = "button-container";
        container.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            z-index: 999;
            text-align: center;
        `;

        // แสดงความแรง
        const powerDisplay = document.createElement("div");
        powerDisplay.id = "power-display";
        powerDisplay.style.cssText = `
            color: white;
            font-size: 24px;
            margin-bottom: 10px;
            text-shadow: 1px 1px 2px black;
        `;
        powerDisplay.textContent = " 0%";

        // สร้างปุ่มสำหรับกด
        const button = document.createElement("button");
        button.id = "joystick-button";
        button.textContent = "Hold to Power";
        button.style.cssText = `
            background-color: #4CAF50;
            color: white;
            padding: 20px;
            font-size: 18px;
            border-radius: 5px;
            border: none;
            cursor: pointer;
        `;

        // ประกอบ UI
        container.appendChild(powerDisplay);
        container.appendChild(button);
        document.body.appendChild(container);

        this.button = button;
        this.powerDisplay = powerDisplay;
    }

    addEventListeners() {
        // Mouse Events
        this.button.addEventListener("mousedown", this.startPressing.bind(this));
        document.addEventListener("mouseup", this.stopPressing.bind(this));

        // Touch Events
        this.button.addEventListener("touchstart", this.startPressing.bind(this));
        document.addEventListener("touchend", this.stopPressing.bind(this));
    }

    startPressing(e) {
        this.isPressing = true;
        this.startTime = Date.now();
        this.updatePower();
    }

    stopPressing() {
        if (this.isPressing) {
            this.isPressing = false;

            // สริกเกอร์การโยน
            const throwButton = document.getElementById("throwButton");
            if (throwButton) {
                throwButton.click();
            }

            // รีเซ็ตค่า
            this.powerDisplay.textContent = "0%";
            window.throwingPower.value = 0;
        }
    }

    updatePower() {
        if (!this.isPressing) return;

        const elapsedTime = Date.now() - this.startTime;
        const power = Math.min((elapsedTime / 1000) * this.maxPower, this.maxPower);

        // อัพเดทค่าแสดงความแรง
        this.powerDisplay.textContent = `${Math.round(power)}%`;
        window.throwingPower.value = Math.round(power);

        // ถ้าปล่อยปุ่ม จะหยุดการอัพเดท
        if (this.isPressing) {
            requestAnimationFrame(this.updatePower.bind(this));
        }
    }
}

// สร้าง instance เมื่อโหลดหน้าเว็บ
window.addEventListener("load", () => {
    new Joystick();
});
