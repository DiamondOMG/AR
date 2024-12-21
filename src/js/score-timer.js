// ตัวแปร Global สำหรับสถานะเกม
window.gameState = {
	isGameStarted: false,
	timeRemaining: 60,
	isCountingDown: false,
	score: 0,
};

AFRAME.registerComponent("score-timer", {
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

		// 4. UI สำหรับแสดงคะแนน (ใต้ timer)
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

		// เพิ่มส่วนของปุ่มต่างๆ
		this.buttonsContainer = document.createElement("div");
		this.buttonsContainer.style.cssText = `
            margin-top: 20px;
            display: flex;
            flex-direction: column;
            gap: 10px;
        `;

		// สร้างปุ่มทั้ง 4 ปุ่ม
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

		this.restartButton = document.createElement("button");
		this.restartButton.textContent = "เล่นใหม่";
		this.restartButton.style.cssText = buttonStyles;
		this.restartButton.onclick = () => this.restartGame();

		this.saveButton = document.createElement("button");
		this.saveButton.textContent = "บันทึกคะแนน";
		this.saveButton.style.cssText = buttonStyles;

		this.leaderboardButton = document.createElement("button");
		this.leaderboardButton.textContent = "ตารางคะแนน";
		this.leaderboardButton.style.cssText = buttonStyles;
		this.leaderboardButton.onclick = () => this.showLeaderboard();

		this.feedbackButton = document.createElement("button");
		this.feedbackButton.textContent = "ข้อเสนอแนะ";
		this.feedbackButton.style.cssText = buttonStyles;
		this.feedbackButton.onclick = () => this.showFeedbackUI();

		// เพิ่มปุ่มเข้าไปใน container
		this.buttonsContainer.appendChild(this.restartButton);
		this.buttonsContainer.appendChild(this.saveButton);
		this.buttonsContainer.appendChild(this.leaderboardButton);
		this.buttonsContainer.appendChild(this.feedbackButton);
		this.endGameDisplay.appendChild(this.buttonsContainer);

		document.body.appendChild(this.countdownDisplay);
		document.body.appendChild(this.gameTimerDisplay);
		document.body.appendChild(this.endGameDisplay);
		document.body.appendChild(this.scoreDisplay);

		// อ้างอิงถึง marker
		this.marker = document.querySelector("a-marker");

		// เริ่มตรวจสอบ marker
		this.checkMarkerVisibility();

		// อัพเดทคะแนนทุกครั้งที่มีการเปลี่ยนแปลง
		this.updateScore();

		// สร้าง UI สำหรับบันทึกคะแนน
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

		// สร้างฟอร์มสำหรับกรอกชื่อ
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

		// สร้างปุ่มสำหรับบันทึกและย้อนกลับ
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
		this.confirmSaveButton.onclick = () => this.submitScore();

		this.cancelSaveButton = document.createElement("button");
		this.cancelSaveButton.textContent = "ย้อนกลับ";
		this.cancelSaveButton.style.cssText = buttonStyles;
		this.cancelSaveButton.onclick = () => this.closeSaveScore();

		saveScoreButtons.appendChild(this.cancelSaveButton);
		saveScoreButtons.appendChild(this.confirmSaveButton);

		this.saveScoreDisplay.appendChild(this.nameInput);
		this.saveScoreDisplay.appendChild(saveScoreButtons);
		document.body.appendChild(this.saveScoreDisplay);

		// แก้ไข event listener ของปุ่มบันทึกคะแนนเดิม
		this.saveButton.onclick = () => this.showSaveScore();
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
		window.gameState.timeRemaining = 60;
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
				this.endGameDisplay.appendChild(this.buttonsContainer);
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
		const url = `${window.APP_CONFIG?.SUPABASE_BASE_URL}/user`;

		try {
			const response = await fetch(url, {
				method: "GET",
				headers: {
					"Content-Type": "application/json",
					apikey: window.APP_CONFIG?.SUPABASE_KEY,
					Authorization: `Bearer ${window.APP_CONFIG?.SUPABASE_KEY}`,
				},
			});

			if (!response.ok) {
				throw new Error("Failed to fetch leaderboard");
			}

			const data = await response.json();

			// สร้าง UI สำหรับแสดงผลตารางคะแนน
			const leaderboardDisplay = document.createElement("div");
			leaderboardDisplay.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: linear-gradient(145deg, #2c3e50, #3498db);
            color: white;
            padding: 30px;
            font-family: 'Kanit', Arial, sans-serif;
            border-radius: 15px;
            z-index: 1001;
            width: 90%;
            max-width: 600px;
            max-height: 80vh;
            overflow-y: auto;
            box-shadow: 0 10px 30px rgba(0,0,0,0.3);
        `;

			// เพิ่มหัวข้อ
			const title = document.createElement("h2");
			title.textContent = "🏆 ตารางคะแนน";
			title.style.cssText = `
            margin-bottom: 25px;
            font-size: 28px;
            text-align: center;
            color: #fff;
            text-shadow: 2px 2px 4px rgba(0,0,0,0.2);
        `;
			leaderboardDisplay.appendChild(title);

			// สร้างตาราง
			const table = document.createElement("table");
			table.style.cssText = `
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
            background: rgba(255,255,255,0.1);
            border-radius: 10px;
            overflow: hidden;
        `;

			// สร้างส่วนหัวตาราง
			const thead = document.createElement("thead");
			thead.innerHTML = `
            <tr style="background: rgba(0,0,0,0.2);">
                <th style="padding: 15px; text-align: center; width: 80px;">อันดับ</th>
                <th style="padding: 15px; text-align: left;">ชื่อผู้เล่น</th>
                <th style="padding: 15px; text-align: center;">คะแนน</th>
            </tr>
        `;
			table.appendChild(thead);

			// สร้างเนื้อหาตาราง
			const tbody = document.createElement("tbody");
			data
				.sort((a, b) => b.score - a.score)
				.forEach((user, index) => {
					const tr = document.createElement("tr");
					tr.style.cssText = `
                    transition: background 0.3s;
                    ${
											index % 2 === 0
												? "background: rgba(255,255,255,0.05);"
												: ""
										}
                `;
					tr.onmouseover = () => {
						tr.style.background = "rgba(255,255,255,0.15)";
					};
					tr.onmouseout = () => {
						tr.style.background =
							index % 2 === 0 ? "rgba(255,255,255,0.05)" : "";
					};

					tr.innerHTML = `
                    <td style="padding: 12px; text-align: center; font-weight: bold;">
                        ${getMedalEmoji(index + 1)}
                    </td>
                    <td style="padding: 12px;">${user.name}</td>
                    <td style="padding: 12px; text-align: center; font-weight: bold;">${
											user.score
										}</td>
                `;
					tbody.appendChild(tr);
				});
			table.appendChild(tbody);
			leaderboardDisplay.appendChild(table);

			// ปุ่มปิด
			const closeButton = document.createElement("button");
			closeButton.textContent = "ปิด";
			closeButton.style.cssText = `
            display: block;
            margin: 0 auto;
            padding: 12px 30px;
            border: none;
            border-radius: 25px;
            background: #e74c3c;
            color: white;
            font-size: 16px;
            cursor: pointer;
            transition: background 0.3s;
            font-family: 'Kanit', Arial, sans-serif;
        `;
			closeButton.onmouseover = () => {
				closeButton.style.background = "#c0392b";
			};
			closeButton.onmouseout = () => {
				closeButton.style.background = "#e74c3c";
			};
			closeButton.onclick = () => {
				document.body.removeChild(leaderboardDisplay);
			};

			leaderboardDisplay.appendChild(closeButton);
			document.body.appendChild(leaderboardDisplay);
		} catch (error) {
			alert("เกิดข้อผิดพลาดในการดึงข้อมูลตารางคะแนน");
			console.error(error);
		}

		function getMedalEmoji(rank) {
			switch (rank) {
				case 1:
					return "🥇";
				case 2:
					return "🥈";
				case 3:
					return "🥉";
				default:
					return rank;
			}
		}
	},

	showFeedbackUI: async function () {
		// สร้าง container หลัก
		const feedbackDisplay = document.createElement("div");
		feedbackDisplay.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: linear-gradient(145deg, #2c3e50, #3498db);
        color: white;
        padding: 30px;
        font-family: 'Kanit', Arial, sans-serif;
        border-radius: 15px;
        z-index: 1001;
        width: 90%;
        max-width: 500px;
        box-shadow: 0 10px 30px rgba(0,0,0,0.3);
    `;

		// สร้าง content
		feedbackDisplay.innerHTML = `
        <h2 style="text-align: center; margin-bottom: 20px; font-size: 24px;">🎮 ข้อเสนอแนะ</h2>
        
        <input type="text" id="feedback-name" placeholder="ชื่อผู้เล่น" style="
            width: 100%;
            padding: 8px;
            margin-bottom: 15px;
            border: none;
            border-radius: 5px;
            font-size: 16px;
            box-sizing: border-box;
        ">

        <div style="margin-bottom: 15px;">
            <div style="margin-bottom: 5px;">ให้คะแนนเกม (1-10)</div>
            <div style="display: flex; gap: 5px;">
                ${Array.from({ length: 10 }, (_, i) => i + 1)
									.map(
										(num) => `
                        <button class="rating-btn" data-rating="${num}" style="
                            flex: 1;
                            padding: 8px;
                            border: none;
                            border-radius: 5px;
                            background: rgba(255,255,255,0.1);
                            color: white;
                            cursor: pointer;
                            transition: background 0.3s;
                        ">${num}</button>
                    `
									)
									.join("")}
            </div>
        </div>

        <textarea id="feedback-comment" placeholder="แสดงความคิดเห็น" style="
            width: 100%;
            padding: 8px;
            margin-bottom: 20px;
            border: none;
            border-radius: 5px;
            font-size: 16px;
            min-height: 100px;
            resize: vertical;
            box-sizing: border-box;
        "></textarea>

        <div style="display: flex; gap: 10px; justify-content: center;">
            <button id="cancel-feedback" style="
                padding: 10px 20px;
                border: none;
                border-radius: 25px;
                background: #95a5a6;
                color: white;
                font-size: 16px;
                cursor: pointer;
                transition: background 0.3s;
            ">ยกเลิก</button>
            <button id="submit-feedback" style="
                padding: 10px 20px;
                border: none;
                border-radius: 25px;
                background: #2ecc71;
                color: white;
                font-size: 16px;
                cursor: pointer;
                transition: background 0.3s;
            ">ส่งข้อเสนอแนะ</button>
        </div>
    `;

		// เพิ่ม event listeners
		let selectedRating = 0;
		const ratingButtons = feedbackDisplay.querySelectorAll(".rating-btn");

		ratingButtons.forEach((btn) => {
			btn.onclick = () => {
				selectedRating = parseInt(btn.dataset.rating);
				ratingButtons.forEach(
					(b) => (b.style.background = "rgba(255,255,255,0.1)")
				);
				btn.style.background = "#f1c40f";
			};
		});

		// ปุ่มยกเลิก
		feedbackDisplay.querySelector("#cancel-feedback").onclick = () => {
			document.body.removeChild(feedbackDisplay);
		};

		// ปุ่มส่ง
		feedbackDisplay.querySelector("#submit-feedback").onclick = async () => {
			const name = feedbackDisplay.querySelector("#feedback-name").value.trim();
			const comment = feedbackDisplay
				.querySelector("#feedback-comment")
				.value.trim();

			if (!name) {
				alert("กรุณากรอกชื่อของคุณ");
				return;
			}
			if (selectedRating === 0) {
				alert("กรุณาให้คะแนนเกม");
				return;
			}

			try {
				const response = await fetch(
					`${window.APP_CONFIG?.SUPABASE_BASE_URL}/review`,
					{
						method: "POST",
						headers: {
							"Content-Type": "application/json",
							apikey: window.APP_CONFIG?.SUPABASE_KEY,
							Authorization: `Bearer ${window.APP_CONFIG?.SUPABASE_KEY}`,
						},
						body: JSON.stringify({
							name: name,
							rateGame: selectedRating,
							comment: comment,
						}),
					}
				);

				if (response.ok) {
					alert("ส่งข้อเสนอแนะเรียบร้อยแล้ว ขอบคุณสำหรับความคิดเห็น!");
					document.body.removeChild(feedbackDisplay);
				} else {
					throw new Error("Failed to submit feedback");
				}
			} catch (error) {
				alert("เกิดข้อผิดพลาดในการส่งข้อเสนอแนะ");
				console.error(error);
			}
		};

		document.body.appendChild(feedbackDisplay);
	},
});
