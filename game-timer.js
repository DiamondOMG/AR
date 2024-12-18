// ตัวแปร Global สำหรับสถานะเกม
window.gameState = {
  isGameStarted: false,
  timeRemaining: 60,
  isCountingDown: false,
  score: 0
};

AFRAME.registerComponent("game-timer", {
  init: function () {
    // 1. UI สำหรับนับถอยหลัง 3 วิ (กลางจอ)
    this.countdownDisplay = document.createElement("div");
    this.countdownDisplay.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: rgba(0,0,0,0.7);
            color: white;
            padding: 20px;
            font-size: 24px;
            font-family: Arial, sans-serif;
            border-radius: 10px;
            z-index: 1000;
            text-align: center;
            display: none;
        `;

    // 2. UI สำหรับแสดงเวลา 60 วิ (มุมซ้ายบน)
    this.gameTimerDisplay = document.createElement("div");
    this.gameTimerDisplay.style.cssText = `
            position: fixed;
            top: 20px;
            left: 20px;
            background: rgba(0,0,0,0.7);
            color: white;
            padding: 10px 20px;
            font-size: 20px;
            font-family: Arial, sans-serif;
            border-radius: 5px;
            z-index: 1000;
            text-align: center;
            display: none;
        `;

    // 3. UI สำหรับแสดงหมดเวลา (กลางจอ)
    this.endGameDisplay = document.createElement("div");
    this.endGameDisplay.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: rgba(0,0,0,0.7);
            color: white;
            padding: 20px;
            font-size: 24px;
            font-family: Arial, sans-serif;
            border-radius: 10px;
            z-index: 1000;
            text-align: center;
            display: none;
        `;

    document.body.appendChild(this.countdownDisplay);
    document.body.appendChild(this.gameTimerDisplay);
    document.body.appendChild(this.endGameDisplay);

    // อ้างอิงถึง marker
    this.marker = document.querySelector("a-marker");

    // เริ่มตรวจสอบ marker
    this.checkMarkerVisibility();
  },

  checkMarkerVisibility: function () {
    if (
      this.marker.object3D.visible &&
      !window.gameState.isGameStarted &&
      !window.gameState.isCountingDown
    ) {
      window.gameState.isCountingDown = true;
      this.startCountdown();
    }
    requestAnimationFrame(() => this.checkMarkerVisibility());
  },

  startCountdown: function () {
    let count = 3;
    this.countdownDisplay.style.display = 'block';
    
    const countInterval = setInterval(() => {
      if (count > 0) {
        this.countdownDisplay.textContent = `เกมจะเริ่มใน ${count}`;
        count--;
      } else {
        clearInterval(countInterval);
        this.countdownDisplay.style.display = 'none';
        this.startGame();
      }
    }, 1000);
  },

  startGame: function () {
    window.gameState.isGameStarted = true;
    window.gameState.timeRemaining = 60;
    window.gameState.score = 0;
    this.gameTimerDisplay.style.display = 'block';
    this.startGameTimer();
  },

  startGameTimer: function () {
    const gameInterval = setInterval(() => {
      if (window.gameState.timeRemaining > 0) {
        this.gameTimerDisplay.textContent = `เวลา: ${window.gameState.timeRemaining} วินาที`;
        window.gameState.timeRemaining--;
      } else {
        this.gameTimerDisplay.style.display = 'none';
        this.endGameDisplay.style.display = 'block';
        this.endGameDisplay.textContent = `หมดเวลา!\nคะแนนของคุณ: ${window.gameState.score}`;
        setTimeout(() => {
          this.endGameDisplay.style.display = 'none';
          window.gameState.isGameStarted = false;
          window.gameState.isCountingDown = false;
        }, 2000);
        clearInterval(gameInterval);
      }
    }, 1000);
  },
});
