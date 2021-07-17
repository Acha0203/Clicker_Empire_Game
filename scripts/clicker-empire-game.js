const config = {
	startPage: document.getElementById("startPage"),
	mainPage: document.getElementById("mainPage"),
}

class Player {
	constructor(name, age, money, days, burgers, incomePerClick, incomePerSec, intervalId, itemList = null) {
		this.name = name;
		this.age = age;
		this.money = money;
		this.days = days;
		this.burgers = burgers;
		this.incomePerClick = incomePerClick;
		this.incomePerSec = incomePerSec;
		this.intervalId = intervalId;
		if (itemList !== null) this.itemList = itemList;
		else this.initializeItems();
	}

	initializeItems() {
		let itemList = [
			new Item("Flip Machine", "ability", 500, 15000, 0, "+￥25 / click", "Get 25 extra yen per click", "images/burgers-1839090_1280.jpg"),
			new Item("Lemonade Stand", "property", 1000, 30000, 0, "+￥30 / sec", "Get 30 extra yen per second", "images/lemonade-999593_1280.jpg"),
			new Item("Ice Cream Truck", "property", 500, 100000, 0, "+￥120 / sec", "Get 120 extra yen per second", "images/ice-cream-410330_1280.jpg"),
			new Item("ETF Stock", "investment", -1, 300000, 0, "+0.1% of Total Price / sec", "Get 0.1% of the total price yen per second", "images/1005931.png"),
			new Item("ETF Bonds", "investment", -1, 300000, 0, "+0.07% of Total Price / sec", "Get 0.07% of the total price yen per second", "images/1005931.png"),
			new Item("House", "property", 100, 20000000, 0, "+￥32,000 / sec", "Get 32,000 extra yen per second", "images/house-1867187_1280.jpg"),
			new Item("Town House", "property", 100, 40000000, 0, "+￥64,000 / sec", "Get 64,000 extra yen per second", "images/bridge-1149423_1280.jpg"),
			new Item("Mansion", "property", 20, 250000000, 0, "+￥500,000 / sec", "Get 500,000 extra yen per second", "images/leland-stanford-mansion-1594362_640.jpg"),
			new Item("Industrial Space", "property", 10, 1000000000, 0, "+￥2,200,000 / sec", "Get 2,200,000 extra yen per second", "images/4365892_s.jpg"),
			new Item("Hotel Skyscraper", "property", 5, 10000000000, 0, "+￥25,000,000 / sec", "Get 25,000,000 extra yen per second", "images/the-palm-962785_1280.jpg"),
			new Item("Bullet-Speed Sky Railway", "property", 1, 10000000000000, 0, "+￥30,000,000,000 / sec", "Get 30,000,000,000 extra yen per second", "images/shinkansen-5237269_1280.jpg")
		];

		this.itemList = itemList;
	}

	// 1秒ごとに取得できる金額を返す
	getIncomePerSec() {
		let incomePerSec = this.itemList[1].amount * 30;

		incomePerSec += this.itemList[2].amount * 120;
		incomePerSec += Controller.calculateInterest(this.itemList[3]);
		incomePerSec += Controller.calculateInterest(this.itemList[4]);
		incomePerSec += this.itemList[5].amount * 32000;
		incomePerSec += this.itemList[6].amount * 64000;
		incomePerSec += this.itemList[7].amount * 500000;
		incomePerSec += this.itemList[8].amount * 2200000;
		incomePerSec += this.itemList[9].amount * 25000000;
		incomePerSec += this.itemList[10].amount * 30000000000;

		return incomePerSec;
	}

	// クリックごとに取得できる金額を返す
	getIncomePerClick() {
		return this.itemList[0].amount * 25 + 25;
	}
}

class Item {
	constructor(itemName, itemType, maxPurchases, price, amount, incomeInfo1, incomeInfo2, imgUrl) {
		this.itemName = itemName; // アイテム名
		this.itemType = itemType; // アイテムの種類
		this.maxPurchases = maxPurchases; // 最大購入数。-1の場合は上限なし
		this.price = price; // アイテムの価格
		this.amount = amount; // アイテムの購入数
		this.incomeInfo1 = incomeInfo1; // 取得できる金額の情報
		this.incomeInfo2 = incomeInfo2; // 取得できる金額の詳しい情報
		this.imgUrl = imgUrl; // 画像のUrl
	}
}

class Controller {
	// データをlocalStorageに保存し、成功したらtrueを返す
	static saveData(player) {
		let playerJsonString = JSON.stringify(player);
		try {
			localStorage.setItem(player.name, playerJsonString);
			return true;
		} catch { // 例外が発生した場合
			return false;
		}
	}

	// localStorageから取得したデータを返す
	static loadData(playerName) {
		let playerJsonString = localStorage.getItem(playerName);
		console.log(playerJsonString);

		return playerJsonString;
	}

	// タイトル画面を表示する
	static showStartPage() {
		View.displayNone(config.mainPage);
		View.displayBlock(config.startPage);
		config.mainPage.innerHTML = '';
		config.startPage.append(View.startGamePage());
	}

	// 新規プレイヤーを作成する
	static createNewPlayer(playerName) {
		let player = new Player(playerName, 20, 50000, 0, 0, 25, 0, null);

		if (playerName === "cheater") player.money = 100000000000000;

		return player;
	}

	// [Game Start]クリック後の処理
	static gameStart() {
		let newGame = document.getElementById("newGame");
		let playerName = config.startPage.querySelectorAll(`input[name="playerName"]`)[0].value;

		if (newGame.checked) {
			Controller.startNewGame(playerName);
		} else {
			Controller.startContinue(playerName);
		}
	}

	// 新規プレイヤーでゲームを始める(New Game)
	static startNewGame(playerName) {
		let player = Controller.createNewPlayer(playerName);
		Controller.enterMainGamePage(player);
	}

	// セーブデータからゲームを始める(Continue)
	static startContinue(playerName) {
		let player = {};
		let playerJsonString = Controller.loadData(playerName);

		if (playerJsonString === null) {
			alert("Your data is not saved. Your game will newly start. (データが保存されていません。New Game で始めます。)");
			Controller.startNewGame(playerName);
		} else {
			player = JSON.parse(playerJsonString);
			if (!Controller.inspectPlayerObject(player)) {
				alert("Your data is invalid. Your game will newly start. (不正なデータです。New Game で始めます。)");
				Controller.startNewGame(playerName);
			} else {
				Controller.enterMainGamePage(player);
			}
		}
	}

	// セーブデータの検証。有効なデータならtrueを返す。
	static inspectPlayerObject(player) {
		if (Object.prototype.toString.call(player) !== "[object Object]" ||
			Object.prototype.toString.call(player.name) !== "[object String]" ||
			Object.prototype.toString.call(player.age) !== "[object Number]" ||
			Object.prototype.toString.call(player.money) !== "[object Number]" ||
			Object.prototype.toString.call(player.burgers) !== "[object Number]" ||
			Object.prototype.toString.call(player.incomePerClick) !== "[object Number]" ||
			Object.prototype.toString.call(player.incomePerSec) !== "[object Number]" ||
			Object.prototype.toString.call(player.intervalId) !== "[object Number]" ||
			!Controller.inspectItemList(player.itemList) ||
			player.name === '' ||
			player.age < 20 ||
			player.money < 0 ||
			player.burgers < 0 ||
			player.incomePerClick < 0 ||
			player.incomePerSec < 0 ||
			player.intervalId < 1) {
			return false;
		}

		return true;
	}

	// アイテムリストの検証。有効なデータならtrueを返す。
	static inspectItemList(itemList) {
		for (let i = 0; i < itemList.length; i++) {
			if (!Controller.inspectItem(itemList[i])) return false;
		}

		return true;
	}

	// アイテムの検証。有効なデータならtrueを返す。
	static inspectItem(item) {
		if (Object.prototype.toString.call(item) !== "[object Object]" ||
			Object.prototype.toString.call(item.itemName) !== "[object String]" ||
			Object.prototype.toString.call(item.itemType) !== "[object String]" ||
			Object.prototype.toString.call(item.maxPurchases) !== "[object Number]" ||
			Object.prototype.toString.call(item.price) !== "[object Number]" ||
			Object.prototype.toString.call(item.amount) !== "[object Number]" ||
			Object.prototype.toString.call(item.incomeInfo1) !== "[object String]" ||
			Object.prototype.toString.call(item.incomeInfo2) !== "[object String]" ||
			Object.prototype.toString.call(item.imgUrl) !== "[object String]" ||
			item.itemName === '' ||
			item.itemType === '' ||
			item.maxPurchases < -1 ||
			item.price < 15000 ||
			item.amount < 0 ||
			item.incomeInfo1 === '' ||
			item.incomeInfo2 === '' ||
			item.imgUrl === '') {
			return false;
		}

		return true;
	}

	// メイン画面を表示してタイマーを開始する
	static enterMainGamePage(player) {
		View.displayNone(config.startPage);
		View.displayBlock(config.mainPage);
		config.startPage.innerHTML = '';
		config.mainPage.append(View.mainGamePage(player));
		Controller.startTimer(player);
	}

	// 秒ごとの処理
	static startTimer(player) {
		player.intervalId = setInterval(function () {
			// 所持金の更新
			player.money += player.incomePerSec;
			View.displayMoney(player.money);
			// 日にちの更新
			player.days++;
			View.displayDays(player.days)
			// 年齢の更新
			if (player.days !== 0 && player.days % 365 == 0) {
				player.age++;
				View.displayAge(player.age);
			}
		}, 1000);
	}

	// タイマー一時停止
	static stopTimer(intervalId) {
		clearInterval(intervalId);
	}

	// 所持金が購入金額よりも大きければtrue、そうでないならfalseを返す
	static judgeWhetherMoneyIsGreater(player, itemIndex, itemAmount) {
		return player.money < parseInt(itemAmount) * player.itemList[itemIndex].price;
	}

	// アイテム所持数が上限よりも低ければtrue、そうでないならfalseを返す
	static judgeWhetherItemsAreMax(player, itemIndex, itemAmount) {
		return player.itemList[itemIndex].maxPurchases < parseInt(itemAmount) + player.itemList[itemIndex].amount && player.itemList[itemIndex].itemType !== "investment";
	}

	// アイテム購入時の処理
	static updatePlayerData(player, itemIndex, itemAmount) {
		// 所持金を計算
		player.money -= parseInt(itemAmount) * player.itemList[itemIndex].price;
		View.displayMoney(player.money);
		// アイテムの所持数を更新
		player.itemList[itemIndex].amount += parseInt(itemAmount);
		// 購入品がFlip Machineの場合はクリックごとの取得金額を更新
		// 購入品がETF Stockの場合は価格と秒ごとの取得金額を更新
		// 購入品がそれ以外の場合は秒ごとの取得金額を更新
		if (player.itemList[itemIndex].itemName === "Flip Machine") {
			Controller.updateIncomePerClick(player);
		} else if (player.itemList[itemIndex].itemName === "ETF Stock") {
			player.itemList[itemIndex].price *= 1.1;
			Controller.updateIncomePerSec(player);
		} else {
			Controller.updateIncomePerSec(player);
		}
	}

	// クリックごとの取得金額を更新
	static updateIncomePerClick(player) {
		player.incomePerClick = player.getIncomePerClick();
		View.displayIncomePerClick(player.incomePerClick);
	}

	// 秒ごとの取得金額を更新
	static updateIncomePerSec(player) {
		player.incomePerSec = player.getIncomePerSec();
		View.displayIncomePerSec(player.incomePerSec);
	}

	// 購入画面からアイテムリスト表示に戻る
	static backToItemList(container, player) {
		container.innerHTML = '';
		container.append(View.getItemListCon(player));
		// タイマー再開
		Controller.startTimer(player);
	}

	// 利息を計算
	static calculateInterest(item) {
		let interest = 0;
		let itemPrice = item.price;
		let interestRate = 0.0007;

		if (item.itemName === "ETF Stock") {
			itemPrice = item.price / 1.1;
			interestRate = 0.001;
		};

		interest = Math.floor(itemPrice * item.amount * interestRate);

		return interest;
	}
}

class View {
	static displayNone(ele) {
		ele.classList.remove("d-block");
		ele.classList.add("d-none");
	}

	static displayBlock(ele) {
		ele.classList.remove("d-none");
		ele.classList.add("d-block");
	}

	static startGamePage() {
		let container = document.createElement("div");
		container.classList.add("city", "vh-100", "d-flex", "justify-content-center", "align-items-center");

		let initinalForm = document.createElement("div");
		initinalForm.classList.add("d-flex", "flex-column", "justify-content-center", "align-items-center", "bg-white", "col-md-4", "col-6", "p-4");

		let titleH2 = document.createElement("h2");
		titleH2.classList.add("pb-3", "text-center");
		titleH2.innerHTML = "Clicker Empire Game";

		let gameForm = document.createElement("form");
		gameForm.setAttribute("id", "gameForm");
		gameForm.setAttribute("onsubmit", "Controller.gameStart(); event.preventDefault()");

		let formDiv1 = document.createElement("div");
		formDiv1.classList.add("form-group", "d-flex", "flex-wrap", "justify-content-center");

		// New Gameボタン
		let newGameBtnDiv = document.createElement("div");
		newGameBtnDiv.classList.add("form-check", "mb-3", "mx-3");
		let continueBtnDiv = newGameBtnDiv.cloneNode(true);

		let newGameBtn = document.createElement("input");
		newGameBtn.classList.add("form-check-input");
		newGameBtn.setAttribute("type", "radio");
		let continueBtn = newGameBtn.cloneNode(true);

		newGameBtn.setAttribute("name", "gameType");
		newGameBtn.setAttribute("value", "newGame");
		newGameBtn.setAttribute("id", "newGame");
		newGameBtn.defaultChecked = true;

		let newGameBtnLabel = document.createElement("label");
		newGameBtnLabel.classList.add("form-check-label");
		let continueBtnLabel = newGameBtnLabel.cloneNode(true);

		newGameBtnLabel.setAttribute("htmlFor", "newGame");
		newGameBtnLabel.innerHTML = "New Game";

		newGameBtnDiv.append(newGameBtn, newGameBtnLabel);

		// Continueボタン
		continueBtn.setAttribute("name", "gameType");
		continueBtn.setAttribute("value", "continue");
		continueBtn.setAttribute("id", "continue");

		continueBtnLabel.setAttribute("htmlFor", "continue");
		continueBtnLabel.innerHTML = "Continue";

		continueBtnDiv.append(continueBtn, continueBtnLabel);
		formDiv1.append(newGameBtnDiv, continueBtnDiv);

		let formDiv2 = document.createElement("div");
		formDiv2.classList.add("form-group");
		let formDiv3 = formDiv2.cloneNode(true);

		// プレイヤー名の入力ボックス
		let inputPlayerName = document.createElement("input");
		inputPlayerName.classList.add("player-name", "col-12", "mb-2");
		inputPlayerName.setAttribute("type", "text");
		inputPlayerName.setAttribute("name", "playerName");
		inputPlayerName.setAttribute("placeholder", "Your name");
		inputPlayerName.required = true;

		formDiv2.append(inputPlayerName);

		// [Game Start]ボタン
		let startBtn = document.createElement("button");
		startBtn.classList.add("btn", "btn-primary", "col-12");
		startBtn.setAttribute("type", "submit");
		startBtn.innerHTML = "Game Start";

		formDiv3.append(startBtn);
		gameForm.append(formDiv1, formDiv2, formDiv3);
		initinalForm.append(titleH2, gameForm);
		container.append(initinalForm);

		return container;
	}

	static mainGamePage(player) {
		let mainDiv = document.createElement("div");
		mainDiv.classList.add("min-vh-100", "d-flex", "justify-content-center", "align-items-center");

		let outerDiv = document.createElement("div");
		outerDiv.classList.add("metallic", "row", "justify-content-around", "col-12");

		// 左側のレンダリング
		let leftSideDiv = document.createElement("div");
		leftSideDiv.classList.add("concavity", "d-flex", "flex-column", "justify-content-between", "col-md-4", "col-11", "my-2");

		let infoCon = document.createElement("div");
		infoCon.classList.add("metallic", "m-3", "text-center");

		// ハンバーガーの数の表示
		let burgersCon = document.createElement("div");
		burgersCon.classList.add("d-flex", "justify-content-center", "flex-wrap", "my-2");

		// クリックごとの取得金額の表示
		let incomePerClickCon = burgersCon.cloneNode(true);

		// 秒ごとの取得金額の表示
		let incomePerSecCon = burgersCon.cloneNode(true);

		// ハンバーガーの数の表示
		let numberOfBurgersDiv = document.createElement("div");
		numberOfBurgersDiv.classList.add("mx-1");

		let burgersUnitDiv = numberOfBurgersDiv.cloneNode(true);
		let incomePerClickDiv = numberOfBurgersDiv.cloneNode(true);
		let incomePerClickUnitDiv = numberOfBurgersDiv.cloneNode(true);

		numberOfBurgersDiv.setAttribute("id", "numberOfBurgers");
		numberOfBurgersDiv.append(View.getNumberOfBurgersP(player.burgers));

		let burgersUnitP = document.createElement("p");
		burgersUnitP.classList.add("large-font", "user-select-none");
		burgersUnitP.innerHTML = "Burgers";
		burgersUnitDiv.append(burgersUnitP);

		burgersCon.append(numberOfBurgersDiv, burgersUnitDiv);

		// クリックごとの取得金額の表示
		incomePerClickDiv.setAttribute("id", "incomePerClick");
		incomePerClickDiv.append(View.getIncomePerClickP(player.incomePerClick));

		let incomePerClickUnitP = document.createElement("p");
		incomePerClickUnitP.classList.add("small-font", "user-select-none");
		let incomePerSecUnitP = incomePerClickUnitP.cloneNode(true);

		incomePerClickUnitP.innerHTML = "per click";
		incomePerClickUnitDiv.append(incomePerClickUnitP);

		incomePerClickCon.append(incomePerClickDiv, incomePerClickUnitDiv);

		// 秒ごとの取得金額の表示
		let incomePerSecUnitDiv = document.createElement("div");
		incomePerSecUnitDiv.classList.add("mx-1");
		let incomePerSecDiv = incomePerSecUnitDiv.cloneNode(true);

		incomePerSecDiv.setAttribute("id", "incomePerSec");
		incomePerSecDiv.append(View.getIncomePerSecP(player.incomePerSec));

		incomePerSecUnitP.innerHTML = "per sec";
		incomePerSecUnitDiv.append(incomePerSecUnitP);

		incomePerSecCon.append(incomePerSecDiv, incomePerSecUnitDiv);
		infoCon.append(burgersCon, incomePerClickCon, incomePerSecCon);

		// ハンバーガーの表示
		let burgerDiv = document.createElement("div");
		burgerDiv.classList.add("d-flex", "justify-content-center", "align-items-center", "burger-div");

		let burgerImage = document.createElement("img");
		burgerImage.src = "images/cheeseburger-34315.svg";
		burgerImage.classList.add("m-4", "hamburger", "hover-hamburger", "user-select-none", "img-fluid");
		burgerImage.setAttribute("name", "hamburger");
		burgerImage.setAttribute("id", "hamburger");

		burgerImage.addEventListener("click", function () {
			// クリック時の処理。ハンバーガーと所持金を追加
			player.burgers++;
			player.money += player.incomePerClick;
			View.displayNumberOfBurgers(player.burgers);
			View.displayMoney(player.money);

		});

		burgerDiv.append(burgerImage);
		leftSideDiv.append(infoCon, burgerDiv);

		// 右側のレンダリング
		let rightSideDiv = document.createElement("div");
		rightSideDiv.classList.add("flex-column", "align-items-center", "col-md-8", "col-12");

		let playerDataDiv = document.createElement("div");
		playerDataDiv.classList.add("text-line", "row", "d-flex", "justify-content-center", "align-items-center", "mt-2");

		// プレイヤー名の表示
		let playerNameDiv = document.createElement("div");
		playerNameDiv.classList.add("text-center", "col-4");
		let playerNameP = document.createElement("p");
		playerNameP.classList.add("middle-font");
		playerNameP.innerHTML = player.name;
		playerNameDiv.append(playerNameP);

		// 年齢の表示
		let ageCon = document.createElement("div");
		ageCon.classList.add("d-flex", "justify-content-center", "col-4");
		let daysCon = ageCon.cloneNode(true);

		let ageDiv = document.createElement("div");
		ageDiv.classList.add("mx-1");
		let ageUnitDiv = ageDiv.cloneNode(true);
		let daysDiv = ageDiv.cloneNode(true);
		let daysUnitDiv = ageDiv.cloneNode(true);

		ageDiv.setAttribute("id", "age");
		ageDiv.append(View.getAgeP(player.age));

		let ageUnitP = document.createElement("p");
		ageUnitP.classList.add("middle-font", "py-2");
		let daysUnitP = ageUnitP.cloneNode(true);

		ageUnitP.innerHTML = "yrs old";
		ageUnitDiv.append(ageUnitP);
		ageCon.append(ageDiv, ageUnitDiv);

		// 日数の表示
		daysDiv.setAttribute("id", "days");
		daysDiv.append(View.getDaysP(player.days));
		daysUnitP.innerHTML = "days";
		daysUnitDiv.append(daysUnitP);
		daysCon.append(daysDiv, daysUnitDiv);

		playerDataDiv.append(playerNameDiv, ageCon, daysCon);

		// 所持金の表示
		let moneyCon = document.createElement("div");
		let moneyDiv = document.createElement("div");
		moneyDiv.classList.add("concavity", "container", "d-flex", "justify-content-end", "col-12", "mt-2");
		moneyDiv.setAttribute("id", "money");
		moneyDiv.append(View.getMoneyP(player.money));

		moneyCon.append(moneyDiv);

		// 説明文の表示
		let descriptionDiv = document.createElement("div");
		descriptionDiv.classList.add("text-center");
		let descriptionP = document.createElement("p");
		descriptionP.classList.add("middle-font", "p-2");
		descriptionP.innerHTML = "To make a lot of money, purchase items!"
		descriptionDiv.append(descriptionP);

		// アイテムリストの表示
		let itemListDiv = document.createElement("div");
		itemListDiv.classList.add("item-list-div", "concavity", "my-2", "col-12");
		itemListDiv.append(View.getItemListCon(player));

		// リセットボタンとセーブボタンの表示
		let buttonDiv = document.createElement("div");
		buttonDiv.classList.add("d-flex", "justify-content-end");
		buttonDiv.innerHTML = View.getResetSaveButtonString();

		let resetBtn = buttonDiv.querySelectorAll(".reset-btn")[0];

		resetBtn.addEventListener("click", function () {
			// リセット処理
			Controller.stopTimer(player.intervalId);
			let resetFlag = window.confirm("Do you want to reset? (リセットしますか？)");
			if (resetFlag) {
				Controller.showStartPage();
			} else {
				Controller.startTimer(player);
			}
		});

		let saveBtn = buttonDiv.querySelectorAll(".save-btn")[0];

		saveBtn.addEventListener("click", function () {
			// セーブ処理
			let result = Controller.saveData(player);
			if (result) alert("Your data has been successfully saved! Enter the same name when you resume this game. (データは正常に保存されました。ゲームを再開するときに同じ名前を入力してください。)");
			else alert("Saving your data has been failed. (データの保存に失敗しました。)");
		});

		rightSideDiv.append(playerDataDiv, moneyCon, descriptionDiv, itemListDiv, buttonDiv);
		outerDiv.append(leftSideDiv, rightSideDiv);
		mainDiv.append(outerDiv);

		return mainDiv;
	}

	static getResetSaveButtonString() {
		let resetSaveButtonString =
			`
		<div>
			<div class="redo-save-btn hover-btn p-2 my-3 reset-btn">
				<i class="fas fa-redo fa-3x text-white"></i>
			</div>
		</div>
		<div>
			<div class="redo-save-btn hover-btn p-2 m-3 save-btn">
				<i class="fas fa-save fa-3x text-white"></i>
			</div>
		</div>
		`;

		return resetSaveButtonString;
	}

	// ハンバーガーの数を表示するp要素を返す
	static getNumberOfBurgersP(burgers) {
		let burgersP = document.createElement("p");
		burgersP.classList.add("large-font", "user-select-none");
		burgersP.innerHTML = burgers.toLocaleString();

		return burgersP;
	}

	// クリックごとの取得金額を表示するp要素を返す
	static getIncomePerClickP(incomePerClick) {
		let incomePerClickP = document.createElement("p");
		incomePerClickP.classList.add("small-font", "user-select-none");
		incomePerClickP.innerHTML = "￥" + incomePerClick.toLocaleString();

		return incomePerClickP;
	}

	// 秒ごとの取得金額を表示するp要素を返す
	static getIncomePerSecP(incomePerSec) {
		let incomePerSecP = document.createElement("p");
		incomePerSecP.classList.add("small-font", "user-select-none");
		incomePerSecP.innerHTML = "￥" + incomePerSec.toLocaleString();

		return incomePerSecP;
	}

	// 年齢を表示するp要素を返す
	static getAgeP(age) {
		let ageP = document.createElement("p");
		ageP.classList.add("middle-font", "py-2");
		ageP.innerHTML = age;

		return ageP;
	}

	// 日数を表示するp要素を返す
	static getDaysP(days) {
		let daysP = document.createElement("p");
		daysP.classList.add("middle-font", "py-2");
		daysP.innerHTML = days.toLocaleString();

		return daysP;
	}

	// 所持金を表示するp要素を返す
	static getMoneyP(money) {
		let moneyP = document.createElement("p");
		moneyP.classList.add("large-font");
		moneyP.innerHTML = "￥" + money.toLocaleString();

		return moneyP;
	}

	// アイテムリストのコンテナを返す
	static getItemListCon(player) {
		let container = document.createElement("div");
		container.innerHTML = View.getItemListString(player.itemList);

		for (let i = 0; i < player.itemList.length; i++) {
			container.querySelectorAll(".item-list")[i].addEventListener("click", function () {
				View.displayNone(container);
				View.createItemPurchaseDialog(player, i);
				// アイテム購入画面が開いている間はタイマーを止める
				Controller.stopTimer(player.intervalId);
			});
		}

		return container;
	}

	static getItemListString(itemList) {
		let itemListString = "";

		for (let i = 0; i < itemList.length; i++) {
			let itemAmount = "0";
			// アイテム購入数が10000を超えた場合は「Many」と表示する
			if (itemList[i].amount >= 10000) itemAmount = "Many";
			else itemAmount = itemList[i].amount.toString();

			itemListString +=
				`
				<div class="item-list metallic row m-2 p-2 hover-item">
					<div class="col-4 d-flex justify-content-center align-items-center">
						<img src="${itemList[i].imgUrl}" class="item-size">
					</div>
					<div class="col-8">
						<div class="row">
							<div class="text-start col-8">
								<div>
									<p class="middle-font pt-2">${itemList[i].itemName}</p>
								</div>
								<div class="d-flex justify-content-between flex-wrap">
									<div class="item-info text-start">
										<p class="small-font py-1">￥${itemList[i].price.toLocaleString()}</p>
									</div>
								</div>
							</div>
							<div class="d-flex justify-content-center align-items-center col-4 pt-3">
								<p class="large-font item-amount">${itemAmount}</p>
							</div>
						</div>
						<div class="item-info text-start">
							<p class="small-font font-green pb-2">${itemList[i].incomeInfo1}</p>
						</div>
					</div>
				</div>
			`;
		}

		return itemListString;
	}

	// オブジェクトplayerとitemのインデックスを受け取ってアイテム購入ダイアログを表示する
	static createItemPurchaseDialog(player, itemIndex) {
		let itemListDiv = config.mainPage.querySelectorAll(".item-list-div")[0];
		itemListDiv.innerHTML = View.getPurchaseDialogString(player, itemIndex);

		let goBackBtn = itemListDiv.querySelectorAll(".back-btn")[0];
		let purchaseBtn = itemListDiv.querySelectorAll(".purchase-btn")[0];
		let itemAmount = itemListDiv.querySelectorAll(".item-amount")[0];
		// inputタグのmax属性を設定
		if (player.itemList[itemIndex].maxPurchases !== -1) itemAmount.setAttribute("max", player.itemList[itemIndex].maxPurchases - player.itemList[itemIndex].amount);

		itemAmount.addEventListener("change", function () {
			View.displayTotalAmount(itemAmount.value, player.itemList[itemIndex].price);
			if (itemAmount.value !== "0") purchaseBtn.disabled = false;
			else purchaseBtn.disabled = true;
		});

		goBackBtn.addEventListener("click", function () {
			Controller.backToItemList(itemListDiv, player);
		});

		purchaseBtn.addEventListener("click", function () {
			// Purchaseボタンを押したときの処理
			if (Controller.judgeWhetherMoneyIsGreater(player, itemIndex, itemAmount.value)) {
				alert("You don't have enough money to purchase this item. (お金が足りません。)");
			} else if (Controller.judgeWhetherItemsAreMax(player, itemIndex, itemAmount.value)) {
				alert("You can't purchase this item anymore. (このアイテムはこれ以上購入できません。)");
			} else { // 購入可能なら購入処理へ
				Controller.updatePlayerData(player, itemIndex, itemAmount.value);
				// アイテムリストに戻る
				Controller.backToItemList(itemListDiv, player);
			}
		});
	}

	// アイテム購入画面のHTMLを返す
	static getPurchaseDialogString(player, itemIndex) {
		let purchaseDialogString = '';
		// 最大購入数が-1なら「∞」を表示する
		let maxItem = player.itemList[itemIndex].maxPurchases;
		if (maxItem === -1) maxItem = "∞"

		purchaseDialogString =
			`
			<div class="metallic flex-column justify-content-around align-items-center m-2 p-4">
				<div class="text-center col-12 m-1">
					<p class="x-large-font">${player.itemList[itemIndex].itemName}</p>
				</div>
				<div class="row">
					<div class="text-start col-7 mt-2 ml-3">
						<p class="small-font">You have: ${player.itemList[itemIndex].amount}</p>
						<p class="small-font">Max Purchases: ${maxItem}</p>
						<p class="small-font">Price: ￥${player.itemList[itemIndex].price.toLocaleString()}</p>
						<p class="small-font font-green">${player.itemList[itemIndex].incomeInfo2}</p>
					</div>
					<div class="d-flex align-items-start justify-content-end col-5 mt-2">
						<img src="${player.itemList[itemIndex].imgUrl}" class="item-size-l img-fluid">
					</div>
				</div>
				<div class="form-group">
					<label class="middle-font text-center my-2 ml-3" for="itemAmount">
						How Many would you like to purchase?
					</label>
					<input id="itemAmount" type="number" class="text-end col-12 ml-3 item-amount" min="0" value="0">
				</div>
				<div id="totalAmount" class="text-end my-2 mr-4">
					<p class="small-font">Total: ￥0</p>
				</div>
				<div class="row">
					<div class="d-flex justify-content-stert col-6 mb-3">
						<button class="btn btn-light text-success col-12 back-btn">Go Back</button>
					</div>
					<div class="d-flex justify-content-end col-6 mb-3">
						<button class="btn btn-success col-12 purchase-btn" disabled>Purchase</button>
					</div>
				</div>
			</div>
		`;

		return purchaseDialogString;
	}

	// 購入画面の合計金額を表示するp要素を返す
	static getTotalAmountP(itemAmount, itemPrice) {
		let totalAmount = itemPrice * itemAmount;
		let totalAmountP = document.createElement("p");
		totalAmountP.classList.add("small-font");
		totalAmountP.innerHTML = "Total: ￥" + totalAmount.toLocaleString();

		return totalAmountP;
	}

	// ハンバーガーの数を表示する
	static displayNumberOfBurgers(burgers) {
		let numberOfBurgersDiv = config.mainPage.querySelectorAll("#numberOfBurgers")[0];
		numberOfBurgersDiv.innerHTML = '';
		numberOfBurgersDiv.append(View.getNumberOfBurgersP(burgers));
	}

	// クリックごとの所得金額を表示する
	static displayIncomePerClick(incomePerClick) {
		let incomePerClickDiv = config.mainPage.querySelectorAll("#incomePerClick")[0];
		incomePerClickDiv.innerHTML = '';
		incomePerClickDiv.append(View.getIncomePerClickP(incomePerClick));
	}

	// 秒ごとの所得金額を表示する
	static displayIncomePerSec(incomePerSec) {
		let incomePerSecDiv = config.mainPage.querySelectorAll("#incomePerSec")[0];
		incomePerSecDiv.innerHTML = '';
		incomePerSecDiv.append(View.getIncomePerSecP(incomePerSec));
	}

	// 所持金を表示する
	static displayMoney(money) {
		let moneyDiv = config.mainPage.querySelectorAll("#money")[0];
		moneyDiv.innerHTML = '';
		moneyDiv.append(View.getMoneyP(money));
	}

	// 日にちを表示する
	static displayDays(days) {
		let daysDiv = config.mainPage.querySelectorAll("#days")[0];
		daysDiv.innerHTML = '';
		daysDiv.append(View.getDaysP(days));
	}

	// 年齢を表示する
	static displayAge(age) {
		let ageDiv = config.mainPage.querySelectorAll("#age")[0];
		ageDiv.innerHTML = '';
		ageDiv.append(View.getAgeP(age));
	}

	// 購入画面の合計金額を表示する
	static displayTotalAmount(itemAmount, price) {
		let totalAmountDiv = config.mainPage.querySelectorAll("#totalAmount")[0];
		totalAmountDiv.innerHTML = '';
		totalAmountDiv.append(View.getTotalAmountP(itemAmount, price));
	}
}

Controller.showStartPage();