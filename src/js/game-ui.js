export class GameUI {
	constructor() {
		this.createCountdownDisplay();
		this.createGameTimerDisplay();
		this.createEndGameDisplay();
		this.createScoreDisplay();
		this.createSaveScoreDisplay();
		this.createLeaderboardDisplay();

		// เพิ่ม UI elements เข้า DOM
		document.body.appendChild(this.countdownDisplay);
		document.body.appendChild(this.gameTimerDisplay);
		document.body.appendChild(this.endGameDisplay);
		document.body.appendChild(this.scoreDisplay);
		document.body.appendChild(this.saveScoreDisplay);
		document.body.appendChild(this.leaderboardDisplay);
	}

	createCountdownDisplay() {
		// UI สำหรับนับถอยหลัง 3 วิ (กลางจอ)
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
	}

	createGameTimerDisplay() {
		// UI สำหรับแสดงเวลา 60 วิ (มุมซ้ายบน)
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
	}

	createEndGameDisplay() {
		// UI สำหรับแสดงหมดเวลา (กลางจอ)
		this.endGameDisplay = document.createElement("div");
		this.endGameDisplay.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: rgba(0,0,0,0.9);
      color: white;
      padding: 30px;
      font-size: 24px;
      font-family: Arial, sans-serif;
      border-radius: 10px;
      z-index: 1000;
      text-align: center;
      display: none;
      min-width: 300px;
    `;

		// สร้างปุ่มต่างๆ
		this.createButtons();
	}

	createScoreDisplay() {
		// UI สำหรับแสดงคะแนน (ใต้ timer)
		this.scoreDisplay = document.createElement("div");
		this.scoreDisplay.style.cssText = `
      position: fixed;
      top: 70px;
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
	}

	createSaveScoreDisplay() {
		// UI สำหรับบันทึกคะแนน
		this.saveScoreDisplay = document.createElement("div");
		this.saveScoreDisplay.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: rgba(0,0,0,0.9);
      color: white;
      padding: 30px;
      font-size: 20px;
      font-family: Arial, sans-serif;
      border-radius: 10px;
      z-index: 1001;
      text-align: center;
      display: none;
      min-width: 300px;
    `;

		this.createNameInput();
		this.createSaveScoreButtons();
	}

	createButtons() {
		const buttonStyles = `
      padding: 10px 20px;
      margin: 5px;
      border: none;
      border-radius: 5px;
      background: #4CAF50;
      color: white;
      font-size: 16px;
      cursor: pointer;
      transition: background 0.3s;
    `;

		this.buttonsContainer = document.createElement("div");
		this.buttonsContainer.style.cssText = `
      margin-top: 20px;
      display: flex;
      flex-direction: column;
      gap: 10px;
    `;

		this.restartButton = document.createElement("button");
		this.restartButton.textContent = "เล่นใหม่";
		this.restartButton.style.cssText = buttonStyles;

		this.saveButton = document.createElement("button");
		this.saveButton.textContent = "บันทึกคะแนน";
		this.saveButton.style.cssText = buttonStyles;

		this.leaderboardButton = document.createElement("button");
		this.leaderboardButton.textContent = "ตารางคะแนน";
		this.leaderboardButton.style.cssText = buttonStyles;

		this.feedbackButton = document.createElement("button");
		this.feedbackButton.textContent = "ข้อเสนอแนะ";
		this.feedbackButton.style.cssText = buttonStyles;

		this.buttonsContainer.appendChild(this.restartButton);
		this.buttonsContainer.appendChild(this.saveButton);
		this.buttonsContainer.appendChild(this.leaderboardButton);
		this.buttonsContainer.appendChild(this.feedbackButton);
		this.endGameDisplay.appendChild(this.buttonsContainer);
	}

	createNameInput() {
		this.nameInput = document.createElement("input");
		this.nameInput.type = "text";
		this.nameInput.placeholder = "กรุณากรอกชื่อของคุณ";
		this.nameInput.style.cssText = `
      width: 100%;
      padding: 10px;
      margin: 10px 0;
      border: none;
      border-radius: 5px;
      font-size: 16px;
    `;
		this.saveScoreDisplay.appendChild(this.nameInput);
	}

	createSaveScoreButtons() {
		const buttonStyles = `
      padding: 10px 20px;
      margin: 5px;
      border: none;
      border-radius: 5px;
      background: #4CAF50;
      color: white;
      font-size: 16px;
      cursor: pointer;
      transition: background 0.3s;
    `;

		const saveScoreButtons = document.createElement("div");
		saveScoreButtons.style.cssText = `
      display: flex;
      gap: 10px;
      justify-content: center;
      margin-top: 20px;
    `;

		this.confirmSaveButton = document.createElement("button");
		this.confirmSaveButton.textContent = "บันทึก";
		this.confirmSaveButton.style.cssText = buttonStyles;

		this.cancelSaveButton = document.createElement("button");
		this.cancelSaveButton.textContent = "ย้อนกลับ";
		this.cancelSaveButton.style.cssText = buttonStyles;

		saveScoreButtons.appendChild(this.cancelSaveButton);
		saveScoreButtons.appendChild(this.confirmSaveButton);
		this.saveScoreDisplay.appendChild(saveScoreButtons);
	}

	createLeaderboardDisplay() {
		this.leaderboardDisplay = document.createElement("div");
		this.leaderboardDisplay.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: rgba(0,0,0,0.9);
      color: white;
      padding: 30px;
      font-size: 20px;
      font-family: Arial, sans-serif;
      border-radius: 10px;
      z-index: 1002;
      text-align: center;
      display: none;
      width: 80%;
      max-width: 500px;
      max-height: 80vh;
    `;

		// สร้าง header
		const header = document.createElement("h2");
		header.textContent = "ตารางคะแนนสูงสุด";
		header.style.marginBottom = "20px";

		// สร้าง container สำหรับตารางคะแนน
		this.scoresContainer = document.createElement("div");
		this.scoresContainer.style.cssText = `
      max-height: 60vh;
      overflow-y: auto;
      margin-bottom: 20px;
      padding: 0 10px;
    `;

		// สร้างปุ่มปิด
		this.closeLeaderboardButton = document.createElement("button");
		this.closeLeaderboardButton.textContent = "ปิด";
		this.closeLeaderboardButton.style.cssText = `
      padding: 10px 20px;
      border: none;
      border-radius: 5px;
      background: #4CAF50;
      color: white;
      font-size: 16px;
      cursor: pointer;
    `;

		this.leaderboardDisplay.appendChild(header);
		this.leaderboardDisplay.appendChild(this.scoresContainer);
		this.leaderboardDisplay.appendChild(this.closeLeaderboardButton);
		document.body.appendChild(this.leaderboardDisplay);
	}
}
