import { GameUI } from "./game-ui.js";

// ตัวแปร Global สำหรับสถานะเกม
window.gameState = {
	isGameStarted: false,
	timeRemaining: 6,
	isCountingDown: false,
	score: 0,
};

AFRAME.registerComponent("score-timer", {
	init: function () {
		// สร้าง UI
		this.ui = new GameUI();

		// อ้างอิงถึง UI elements
		this.countdownDisplay = this.ui.countdownDisplay;
		this.gameTimerDisplay = this.ui.gameTimerDisplay;
		this.endGameDisplay = this.ui.endGameDisplay;
		this.scoreDisplay = this.ui.scoreDisplay;
		this.saveScoreDisplay = this.ui.saveScoreDisplay;
		this.nameInput = this.ui.nameInput;

		// ตั้งค่า event listeners
		this.ui.restartButton.onclick = () => this.restartGame();
		this.ui.saveButton.onclick = () => this.showSaveScore();
		this.ui.confirmSaveButton.onclick = () => this.submitScore();
		this.ui.cancelSaveButton.onclick = () => this.closeSaveScore();
		this.ui.leaderboardButton.onclick = () => this.showLeaderboard();
		this.ui.closeLeaderboardButton.onclick = () => this.closeLeaderboard();

		// อ้างอิงถึง marker
		this.marker = document.querySelector("a-marker");

		// เริ่มตรวจสอบ marker
		this.checkMarkerVisibility();

		// อัพเดทคะแนนทุกครั้งที่มีการเปลี่ยนแปลง
		this.updateScore();
	},

	updateScore: function () {
		this.scoreDisplay.textContent = `คะแนน: ${window.gameState.score}`;
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
		this.countdownDisplay.style.display = "block";

		const countInterval = setInterval(() => {
			if (count > 0) {
				this.countdownDisplay.textContent = `เกมจะเริ่มใน ${count}`;
				count--;
			} else {
				clearInterval(countInterval);
				this.countdownDisplay.style.display = "none";
				this.startGame();
			}
		}, 1000);
	},

	startGame: function () {
		window.gameState.isGameStarted = true;
		window.gameState.timeRemaining = 6;
		window.gameState.score = 0;
		this.gameTimerDisplay.style.display = "block";
		this.scoreDisplay.style.display = "block"; // แสดง UI คะแนน
		this.updateScore(); // อัพเดทคะแนนตอนเริ่มเกม
		this.startGameTimer();
	},

	startGameTimer: function () {
		const gameInterval = setInterval(() => {
			if (window.gameState.timeRemaining > 0) {
				this.gameTimerDisplay.textContent = `เวลา: ${window.gameState.timeRemaining} วินาที`;
				this.updateScore();
				window.gameState.timeRemaining--;
			} else {
				this.gameTimerDisplay.style.display = "none";
				this.scoreDisplay.style.display = "none";
				this.endGameDisplay.style.display = "block";
				this.endGameDisplay.innerHTML = `<div>หมดเวลา!</div><div>คะแนนของคุณ: ${window.gameState.score}</div>`;
				this.endGameDisplay.appendChild(this.ui.buttonsContainer);
				clearInterval(gameInterval);
			}
		}, 1000);
	},

	// เพิ่มฟังก์ชันสำหรับเริ่มเกมใหม่
	restartGame: function () {
		this.endGameDisplay.style.display = "none";
		window.gameState.isGameStarted = false;
		window.gameState.isCountingDown = false;
		window.gameState.score = 0;
		this.startCountdown();
	},

	// เพิ่มฟังก์ชันใหม่
	showSaveScore: function () {
		this.saveScoreDisplay.style.display = "block";
		this.nameInput.value = ""; // เคลียร์ค่าเก่า
	},

	closeSaveScore: function () {
		this.saveScoreDisplay.style.display = "none";
	},

	submitScore: async function () {
		const playerName = this.nameInput.value.trim();
		if (!playerName) {
			alert("กรุณากรอกชื่อของคุณ");
			return;
		}

		const url = `${window.APP_CONFIG?.SUPABASE_BASE_URL}/rpc/upsert_score`;

		try {
			const response = await fetch(url, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					apikey: window.APP_CONFIG?.SUPABASE_KEY,
					Authorization: `Bearer ${window.APP_CONFIG?.SUPABASE_KEY}`,
				},
				body: JSON.stringify({
					p_name: playerName,
					p_score: window.gameState.score,
				}),
			});

			if (response.ok) {
				alert("บันทึกคะแนนสำเร็จ!");
				this.closeSaveScore();
			} else {
				throw new Error("Failed to save score");
			}
		} catch (error) {
			alert("เกิดข้อผิดพลาดในการบันทึกคะแนน");
		}
	},

	showLeaderboard: async function () {
		try {
			const response = await fetch(
				`${window.APP_CONFIG?.SUPABASE_BASE_URL}/user`,
				{
					headers: {
						apikey: window.APP_CONFIG?.SUPABASE_KEY,
						Authorization: `Bearer ${window.APP_CONFIG?.SUPABASE_KEY}`,
					},
				}
			);

			if (!response.ok) throw new Error("Failed to fetch leaderboard");

			const scores = await response.json();

			// เรียงลำดับคะแนนจากมากไปน้อย
			scores.sort((a, b) => b.score - a.score);

			// สร้าง HTML สำหรับแสดงคะแนน (แสดง 20 อันดับแรก)
			let html = `
				<table style="width: 100%; border-collapse: collapse;">
					<tr style="border-bottom: 1px solid rgba(255,255,255,0.2);">
						<th style="padding: 10px; text-align: center;">อันดับ</th>
						<th style="padding: 10px; text-align: left;">ชื่อ</th>
						<th style="padding: 10px; text-align: right;">คะแนน</th>
					</tr>
				`;

			scores.slice(0, 20).forEach((score, index) => {
				html += `
					<tr style="border-bottom: 1px solid rgba(255,255,255,0.1);">
						<td style="padding: 10px; text-align: center;">${index + 1}</td>
						<td style="padding: 10px; text-align: left;">${score.name}</td>
						<td style="padding: 10px; text-align: right;">${score.score}</td>
					</tr>
				`;
			});

			html += "</table>";

			this.ui.scoresContainer.innerHTML = html;
			this.ui.leaderboardDisplay.style.display = "block";
		} catch (error) {
			console.error("Error fetching leaderboard:", error);
			alert("ไม่สามารถโหลดตารางคะแนนได้");
		}
	},

	closeLeaderboard: function () {
		this.ui.leaderboardDisplay.style.display = "none";
	},
});
