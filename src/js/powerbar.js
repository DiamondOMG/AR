// สร้างตัวแปร Global
window.throwingPower = {
    value: 0,
  };
  
  class Joystick {
    constructor() {
      this.isPressing = false;
      this.maxPower = 100;
      this.minPower = 0;
      this.decreasingPower = true; // flag เพื่อให้ตัวเลขวิ่งลงเมื่อกดแช่
      this.power = 0;
  
      // สร้างปุ่มโยนแบบซ่อน (สำหรับทริกเกอร์ event)
      this.createHiddenButton();
      // สร้าง UI ปุ่ม
      this.createButtonUI();
      // สร้างแถบพลัง
      this.createPowerBar();
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
      const button = document.createElement("button");
      button.id = "joystick-button";
      button.textContent = "Hold to Power";
      button.style.cssText = `
          background-color: rgba(255, 255, 255, 0.3); /* วงกลมสีใสขุ่น */
          color: white;
          width: 100px; /* กำหนดขนาดของปุ่มให้เป็นวงกลม */
          height: 100px; /* กำหนดขนาดของปุ่มให้เป็นวงกลม */
          font-size: 24px;
          border-radius: 50%; /* ทำให้เป็นวงกลม */
          border: none;
          cursor: pointer;
          position: fixed;
          top: 80%; /* อยู่ตรงกลางจอในแนวตั้ง */
          left: 50%; /* อยู่ตรงกลางจอในแนวนอน */
          transform: translate(-50%, -50%); /* ทำให้ปุ่มอยู่ตรงกลาง */
          z-index: 999;
          text-align: center;
          display: flex;
          align-items: center;
          justify-content: center;
      `;
  
      const container = document.createElement("div");
      container.id = "button-container";
      container.appendChild(button);
      document.body.appendChild(container);
  
      // สร้างแสดงเปอร์เซ็นต์ที่มุมขวาล่าง
      const powerDisplay = document.createElement("div");
      powerDisplay.id = "power-display";
      powerDisplay.style.cssText = `
          position: fixed;
          bottom: 20px; /* เลื่อนขึ้นจากขอบล่าง */
          right: 20px; /* อยู่ที่มุมขวาล่าง */
          color: white;
          font-size: 24px;
          text-shadow: 1px 1px 2px black;
      `;
      powerDisplay.textContent = "0%";
  
      document.body.appendChild(powerDisplay);
  
      this.button = button;
      this.powerDisplay = powerDisplay;
    }
  
    createPowerBar() {
      // สร้างแถบพลัง
      const powerBar = document.createElement("div");
      powerBar.id = "power-bar";
      powerBar.style.cssText = `
          position: fixed;
          bottom: 100px; /* อยู่เหนือปุ่ม */
          left: 50%;
          transform: translateX(-50%);
          width: 30px;
          height: 200px;
          background: linear-gradient(to top, red, yellow, green); /* ไล่สีจากแดงขึ้นไปเขียว */
          border-radius: 15px;
          display: flex;
          align-items: flex-end;
          justify-content: center;
          z-index: 999;
      `;
  
      // สร้างพอยต์เตอร์
      const pointer = document.createElement("div");
      pointer.id = "pointer";
      pointer.style.cssText = `
          width: 20px;
          height: 20px;
          background-color: white;
          border-radius: 50%;
          position: absolute;
          bottom: 0; /* พอยต์เตอร์เริ่มต้นที่ล่างสุด */
      `;
      powerBar.appendChild(pointer);
      document.body.appendChild(powerBar);
  
      this.powerBar = powerBar;
      this.pointer = pointer;
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
      this.decreasingPower = true; // ตั้งค่าให้ลดลงเมื่อกดแช่
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
  
      // ถ้า power ลดลง จนถึง 0 ให้เริ่มเพิ่มใหม่
      if (this.decreasingPower) {
        if (this.power > this.minPower) {
          this.power -= 1; // ลดค่า power
        } else {
          this.decreasingPower = false; // ถ้า power ถึง 0 ให้เริ่มเพิ่มใหม่
        }
      } else {
        if (this.power < this.maxPower) {
          this.power += 1; // เพิ่มค่า power
        } else {
          this.decreasingPower = true; // เมื่อ power ถึง 100 ให้กลับไปลดลง
        }
      }
  
      // อัพเดทค่าแสดงความแรง
      this.powerDisplay.textContent = `${this.power}%`;
      window.throwingPower.value = this.power;
  
      // อัพเดตตำแหน่งของ pointer ในแถบพลัง
      const pointerPosition = (this.power / this.maxPower) * 100;
      this.pointer.style.bottom = `${pointerPosition}%`;
  
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
  
  