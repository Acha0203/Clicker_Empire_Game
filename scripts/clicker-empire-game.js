const config = {
	startPage: document.getElementById("startPage"),
	mainPage: document.getElementById("mainPage"),
}

class Player {
	constructor(name, age, money, days, burgers, incomePerClick, incomePerSec, intervalId, timerStopFlag, itemList = null) {
		this.name = name;
		this.age = age;
		this.money = money;
		this.days = days;
		this.burgers = burgers;
		this.incomePerClick = incomePerClick; // クリックごとの取得金額
		this.incomePerSec = incomePerSec; // 秒ごとの取得金額
		this.intervalId = intervalId; // タイマーのID
		this.timerStopFlag = timerStopFlag; // タイマー停止中フラグ
		if (itemList !== null) this.itemList = itemList;
		else this.initializeItems();
	}

	initializeItems() {
		let itemList = [
			new Item("Flip Machine", "ability", 500, 15000, 0, "+￥25 / click", "Get 25 extra yen per click", "images/burgers-1839090_1280.jpg"),
			new Item("Lemonade Stand", "property", 1000, 30000, 0, "+￥30 / sec", "Get 30 extra yen / sec", "images/lemonade-999593_1280.jpg"),
			new Item("Ice Cream Truck", "property", 500, 100000, 0, "+￥120 / sec", "Get 120 extra yen / sec", "images/ice-cream-410330_1280.jpg"),
			new Item("ETF Stock", "investment", -1, 300000, 0, "+0.1% of Total Price / sec", "Get 0.1% of the total price yen / sec", "images/1005931.png"),
			new Item("ETF Bonds", "investment", -1, 300000, 0, "+0.07% of Total Price / sec", "Get 0.07% of the total price yen / sec", "images/1005931.png"),
			new Item("House", "property", 100, 20000000, 0, "+￥32,000 / sec", "Get 32,000 extra yen / sec", "images/house-1867187_1280.jpg"),
			new Item("Town House", "property", 100, 40000000, 0, "+￥64,000 / sec", "Get 64,000 extra yen / sec", "images/bridge-1149423_1280.jpg"),
			new Item("Mansion", "property", 20, 250000000, 0, "+￥500,000 / sec", "Get 500,000 extra yen / sec", "images/leland-stanford-mansion-1594362_640.jpg"),
			new Item("Industrial Space", "property", 10, 1000000000, 0, "+￥2,200,000 / sec", "Get 2,200,000 extra yen / sec", "images/factory-947425_1280.jpg"),
			new Item("Hotel Skyscraper", "property", 5, 10000000000, 0, "+￥25,000,000 / sec", "Get 25,000,000 extra yen / sec", "images/the-palm-962785_1280.jpg"),
			new Item("Bullet-Speed Sky Railway", "property", 1, 10000000000000, 0, "+￥30,000,000,000 / sec", "Get 30,000,000,000 extra yen / sec", "images/shinkansen-5237269_1280.jpg")
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

	// タイトル画面を表示する
	static showStartPage() {
		View.displayNone(config.mainPage);
		View.displayBlock(config.startPage);
		config.mainPage.innerHTML = '';
		config.startPage.append(View.createStartGamePage());
	}

	// 新規プレイヤーを作成する
	static createNewPlayer(playerName) {
		let player = new Player(playerName, 20, 50000, 0, 0, 25, 0, null, false);

		if (playerName === "cheater") player.money = 10000000000000;

		return player;
	}

	// [Game Start]クリック後の処理
	static gameStart() {
		const newGame = document.getElementById("newGame");
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
		let continueData = {};
		let playerJsonString = localStorage.getItem(playerName);

		if (playerJsonString === null) {
			alert("Your data is not saved. Your game will newly start. (データが保存されていません。New Game で始めます。)");
			Controller.startNewGame(playerName);
		} else {
			continueData = JSON.parse(playerJsonString);
			if (!Controller.inspectPlayerObject(continueData)) {
				alert("Your data is invalid. Your game will newly start. (不正なデータです。New Game で始めます。)");
				Controller.startNewGame(playerName);
			} else {
				let player = Controller.createContinuePlayer(continueData)
				Controller.enterMainGamePage(player);
			}
		}
	}

	// ロードしたデータからプレイヤーオブジェクトを作成して返す
	static createContinuePlayer(continueData) {
		let player = new Player(
			continueData.name,
			continueData.age,
			continueData.money,
			continueData.days,
			continueData.burgers,
			continueData.incomePerClick,
			continueData.incomePerSec,
			continueData.intervalId,
			false,
			continueData.itemList
		);

		return player;
	}

	// セーブデータの検証。有効なデータならtrueを返す。
	static inspectPlayerObject(player) {
		if (Object.prototype.toString.call(player) !== "[object Object]" ||
			Object.prototype.toString.call(player.name) !== "[object String]" ||
			Object.prototype.toString.call(player.age) !== "[object Number]" ||
			Object.prototype.toString.call(player.money) !== "[object Number]" ||
			Object.prototype.toString.call(player.days) !== "[object Number]" ||
			Object.prototype.toString.call(player.burgers) !== "[object Number]" ||
			Object.prototype.toString.call(player.incomePerClick) !== "[object Number]" ||
			Object.prototype.toString.call(player.incomePerSec) !== "[object Number]" ||
			Object.prototype.toString.call(player.intervalId) !== "[object Number]" ||
			Object.prototype.toString.call(player.timerStopFlag) !== "[object Boolean]" ||
			!Controller.inspectItemList(player.itemList) ||
			player.name === '' ||
			player.age < 20 ||
			player.money < 0 ||
			player.days < 0 ||
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
		config.mainPage.append(View.createMainGamePage(player));
		Controller.startTimer(player);
	}

	// 秒ごとの処理
	static startTimer(player) {
		player.timerStopFlag = false; // タイマー停止中フラグをfalseにする

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
	static stopTimer(player) {
		clearInterval(player.intervalId);
		player.timerStopFlag = true; // タイマー停止中フラグをtrueにする
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

		if (player.itemList[itemIndex].itemName === "Flip Machine") {
			// 購入品がFlip Machineの場合はクリックごとの取得金額を更新
			Controller.updateIncomePerClick(player);
		} else if (player.itemList[itemIndex].itemName === "ETF Stock") {
			// 購入品がETF Stockの場合は価格と秒ごとの取得金額を更新
			player.itemList[itemIndex].price *= 1.1;
			Controller.updateIncomePerSec(player);
		} else {
			// 購入品がそれ以外の場合は秒ごとの取得金額を更新
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

	// 購入画面からゲーム画面に戻る
	static backToGame(player, mask, itemPurchaseDialog) {
		// 購入画面を閉じる
		itemPurchaseDialog.innerHTML = '';
		itemPurchaseDialog.classList.add("hidden");
		// 画面を明るくする
		mask.classList.add("hidden");

		// アイテムリストを書き換える
		const itemListDiv = config.mainPage.querySelectorAll(".item-list-div")[0];
		itemListDiv.innerHTML = '';
		itemListDiv.append(View.createItemListCon(player));
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

	// ゲーム開始画面のdiv要素を返す
	static createStartGamePage() {
		let container = document.createElement("div");
		container.classList.add("city", "vh-100", "d-flex", "justify-content-center", "align-items-center");

		let initinalForm = document.createElement("div");
		initinalForm.classList.add("d-flex", "flex-column", "justify-content-center", "align-items-center", "bg-white", "col-md-4", "col-6", "p-4");

		// タイトル
		let titleH2 = document.createElement("h2");
		titleH2.classList.add("pb-3", "text-center");
		titleH2.innerHTML = "Clicker Empire Game";

		let gameForm = document.createElement("form");
		gameForm.setAttribute("id", "gameForm");
		gameForm.setAttribute("onsubmit", "Controller.gameStart(); event.preventDefault()");

		// ゲームタイプを選ぶラジオボタンの表示
		let radioButtonDiv = View.createRadioButtonDiv();

		// プレイヤー名の入力ボックス
		let playerNameDiv = View.createPlayerNameDiv();

		// [Game Start]ボタン
		let startButtonDiv = View.createStartButtonDiv();

		gameForm.append(radioButtonDiv, playerNameDiv, startButtonDiv);
		initinalForm.append(titleH2, gameForm);
		container.append(initinalForm);

		return container;
	}

	// ゲームタイプを選ぶラジオボタンのdiv要素を返す
	static createRadioButtonDiv() {
		let radioButtonDiv = document.createElement("div");
		radioButtonDiv.classList.add("form-group", "d-flex", "flex-wrap", "justify-content-center");

		// New Gameボタン
		let newGameBtnDiv = document.createElement("div");
		newGameBtnDiv.classList.add("form-check", "mb-3", "mx-3");
		let continueBtnDiv = newGameBtnDiv.cloneNode(true);

		let newGameBtn = document.createElement("input");
		newGameBtn.classList.add("form-check-input");
		newGameBtn.setAttribute("type", "radio");
		newGameBtn.setAttribute("name", "gameType");
		let continueBtn = newGameBtn.cloneNode(true);

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
		continueBtn.setAttribute("value", "continue");
		continueBtn.setAttribute("id", "continue");

		continueBtnLabel.setAttribute("htmlFor", "continue");
		continueBtnLabel.innerHTML = "Continue";

		continueBtnDiv.append(continueBtn, continueBtnLabel);
		radioButtonDiv.append(newGameBtnDiv, continueBtnDiv);

		return radioButtonDiv;
	}

	// プレイヤー名入力ボックスのdiv要素を返す
	static createPlayerNameDiv() {
		let playerNameDiv = document.createElement("div");
		playerNameDiv.classList.add("form-group");

		let inputPlayerName = document.createElement("input");
		inputPlayerName.classList.add("player-name", "col-12", "mb-2");
		inputPlayerName.setAttribute("type", "text");
		inputPlayerName.setAttribute("name", "playerName");
		inputPlayerName.setAttribute("placeholder", "Your name");
		inputPlayerName.required = true;

		playerNameDiv.append(inputPlayerName);

		return playerNameDiv;
	}

	// [Game Start]ボタンのdiv要素を返す
	static createStartButtonDiv() {
		let startButtonDiv = document.createElement("div");
		startButtonDiv.classList.add("form-group");

		let startBtn = document.createElement("button");
		startBtn.classList.add("btn", "btn-primary", "col-12");
		startBtn.setAttribute("type", "submit");
		startBtn.innerHTML = "Game Start";

		startButtonDiv.append(startBtn);

		return startButtonDiv;
	}

	// ゲームのメイン画面のdiv要素を返す
	static createMainGamePage(player) {
		let mainDiv = document.createElement("div");
		mainDiv.classList.add("min-vh-100", "d-flex", "justify-content-center", "align-items-center");

		let outerDiv = document.createElement("div");
		outerDiv.classList.add("metallic", "row", "justify-content-around", "col-12");

		// 左側の表示
		let leftSideDiv = View.createLeftSideDiv(player);

		// 右側の表示
		let rightSideDiv = View.createRightSideDiv(player);

		outerDiv.append(leftSideDiv, rightSideDiv);
		mainDiv.append(outerDiv);

		return mainDiv;
	}

	// ゲームのメイン画面左側のdiv要素を返す
	static createLeftSideDiv(player) {
		let leftSideDiv = document.createElement("div");
		leftSideDiv.classList.add("concavity", "d-flex", "flex-column", "justify-content-between", "col-md-4", "col-11", "my-2");

		// ハンバーガーの数と所得金額の表示
		let incomeInfoCon = View.createIncomeInfoCon(player);
		// ハンバーガーの表示
		let burgerDiv = View.createBurgerDiv(player);

		leftSideDiv.append(incomeInfoCon, burgerDiv);

		return leftSideDiv;
	}

	// ハンバーガーの数と所得金額のdiv要素を返す
	static createIncomeInfoCon(player) {
		let incomeInfoCon = document.createElement("div");
		incomeInfoCon.classList.add("metallic", "m-3", "p-2");

		// ハンバーガーの数の表示
		let burgersCon = document.createElement("div");
		burgersCon.classList.add("d-flex", "justify-content-center", "flex-wrap", "my-1");
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
		numberOfBurgersDiv.append(View.createNumberOfBurgersP(player.burgers));

		let burgersUnitP = document.createElement("p");
		burgersUnitP.classList.add("large-font", "user-select-none");
		burgersUnitP.innerHTML = "Burgers";
		burgersUnitDiv.append(burgersUnitP);

		burgersCon.append(numberOfBurgersDiv, burgersUnitDiv);

		// クリックごとの取得金額の表示
		incomePerClickDiv.setAttribute("id", "incomePerClick");
		incomePerClickDiv.append(View.createIncomePerClickP(player.incomePerClick));

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
		incomePerSecDiv.append(View.createIncomePerSecP(player.incomePerSec));

		incomePerSecUnitP.innerHTML = "per sec";
		incomePerSecUnitDiv.append(incomePerSecUnitP);

		incomePerSecCon.append(incomePerSecDiv, incomePerSecUnitDiv);
		incomeInfoCon.append(burgersCon, incomePerClickCon, incomePerSecCon);

		return incomeInfoCon;
	}

	// ハンバーガーのdiv要素を返す
	static createBurgerDiv(player) {
		let burgerDiv = document.createElement("div");
		burgerDiv.classList.add("d-flex", "justify-content-center", "align-items-center", "burger-div");

		let burgerImage = document.createElement("img");
		burgerImage.src = "images/cheeseburger-34315.svg";
		burgerImage.classList.add("m-4", "hamburger", "hover-hamburger", "user-select-none", "img-fluid");
		burgerImage.setAttribute("name", "hamburger");
		burgerImage.setAttribute("id", "hamburger");

		burgerImage.addEventListener("click", function () {
			// ハンバーガーと所持金を追加
			player.burgers++;
			player.money += player.incomePerClick;
			View.displayNumberOfBurgers(player.burgers);
			View.displayMoney(player.money);
		});

		burgerDiv.append(burgerImage);

		return burgerDiv;
	}

	// ゲームメイン画面右側のdiv要素を返す
	static createRightSideDiv(player) {
		let rightSideDiv = document.createElement("div");
		rightSideDiv.classList.add("flex-column", "align-items-center", "col-md-8", "col-12");

		// プレイヤー情報の表示
		let playerDataDiv = View.createPlayerDataCon(player.name, player.age, player.days);

		// 所持金の表示
		let moneyCon = View.createMoneyCon(player.money);

		// 説明文の表示
		let descriptionDiv = View.createDescriptionDiv();

		// アイテムリストの表示
		let itemListDiv = document.createElement("div");
		itemListDiv.classList.add("item-list-div", "concavity", "my-2", "col-12");
		itemListDiv.append(View.createItemListCon(player));

		// リセットボタンとセーブボタンの表示
		let buttonDiv = View.createResetSaveButtonDiv(player);

		rightSideDiv.append(playerDataDiv, moneyCon, descriptionDiv, itemListDiv, buttonDiv);

		return rightSideDiv;
	}

	// プレイヤー情報のdiv要素を返す
	static createPlayerDataCon(name, age, days) {
		let playerDataCon = document.createElement("div");
		playerDataCon.classList.add("text-line", "row", "d-flex", "justify-content-center", "align-items-center", "mt-2");

		// プレイヤー名の表示
		let playerNameDiv = document.createElement("div");
		playerNameDiv.classList.add("text-center", "col-4");
		let playerNameP = document.createElement("p");
		playerNameP.classList.add("middle-font");
		playerNameP.innerHTML = name;
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
		ageDiv.append(View.createAgeP(age));

		let ageUnitP = document.createElement("p");
		ageUnitP.classList.add("middle-font", "py-2");
		let daysUnitP = ageUnitP.cloneNode(true);

		ageUnitP.innerHTML = "yrs old";
		ageUnitDiv.append(ageUnitP);
		ageCon.append(ageDiv, ageUnitDiv);

		// 日数の表示
		daysDiv.setAttribute("id", "days");
		daysDiv.append(View.createDaysP(days));
		daysUnitP.innerHTML = "days";
		daysUnitDiv.append(daysUnitP);
		daysCon.append(daysDiv, daysUnitDiv);

		playerDataCon.append(playerNameDiv, ageCon, daysCon);

		return playerDataCon;
	}

	// 所持金のdiv要素を返す
	static createMoneyCon(money) {
		let moneyCon = document.createElement("div");
		let moneyDiv = document.createElement("div");
		moneyDiv.classList.add("concavity", "d-flex", "justify-content-end", "col-12", "mt-3");
		moneyDiv.setAttribute("id", "money");
		moneyDiv.append(View.createMoneyP(money));
		moneyCon.append(moneyDiv);

		return moneyCon;
	}

	// 説明文のdiv要素を返す
	static createDescriptionDiv() {
		let descriptionDiv = document.createElement("div");
		descriptionDiv.classList.add("text-center");
		let descriptionP = document.createElement("p");
		descriptionP.classList.add("middle-font", "p-2");
		descriptionP.innerHTML = "To make a lot of money, purchase items!"
		descriptionDiv.append(descriptionP);

		return descriptionDiv;
	}

	// リセットボタンとセーブボタンのdiv要素を返す
	static createResetSaveButtonDiv(player) {
		let buttonDiv = document.createElement("div");
		buttonDiv.classList.add("d-flex", "justify-content-end");
		buttonDiv.innerHTML =
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

		let resetBtn = buttonDiv.querySelectorAll(".reset-btn")[0];

		resetBtn.addEventListener("click", function () {
			// リセット処理
			Controller.stopTimer(player);
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
			// 処理中はタイマーを止める
			Controller.stopTimer(player);
			let result = Controller.saveData(player);
			if (result) {
				alert("Your data has been successfully saved! Enter the same name when you resume this game. (データは正常に保存されました。ゲームを再開するときに同じ名前を入力してください。)");
				Controller.startTimer(player);
			} else {
				alert("Saving your data has been failed. (データの保存に失敗しました。)");
				Controller.startTimer(player);
			}
		});

		return buttonDiv;
	}

	// ハンバーガーの数を表示するp要素を返す
	static createNumberOfBurgersP(burgers) {
		let burgersP = document.createElement("p");
		burgersP.classList.add("large-font", "user-select-none");
		burgersP.innerHTML = burgers.toLocaleString();

		return burgersP;
	}

	// クリックごとの取得金額を表示するp要素を返す
	static createIncomePerClickP(incomePerClick) {
		let incomePerClickP = document.createElement("p");
		incomePerClickP.classList.add("small-font", "user-select-none");
		incomePerClickP.innerHTML = "￥" + incomePerClick.toLocaleString();

		return incomePerClickP;
	}

	// 秒ごとの取得金額を表示するp要素を返す
	static createIncomePerSecP(incomePerSec) {
		let incomePerSecP = document.createElement("p");
		incomePerSecP.classList.add("small-font", "user-select-none");
		incomePerSecP.innerHTML = "￥" + incomePerSec.toLocaleString();

		return incomePerSecP;
	}

	// 年齢を表示するp要素を返す
	static createAgeP(age) {
		let ageP = document.createElement("p");
		ageP.classList.add("middle-font", "py-2");
		ageP.innerHTML = age;

		return ageP;
	}

	// 日数を表示するp要素を返す
	static createDaysP(days) {
		let daysP = document.createElement("p");
		daysP.classList.add("middle-font", "py-2");
		daysP.innerHTML = days.toLocaleString();

		return daysP;
	}

	// 所持金を表示するp要素を返す
	static createMoneyP(money) {
		let moneyP = document.createElement("p");
		moneyP.classList.add("large-font", "px-2");
		moneyP.innerHTML = "￥" + money.toLocaleString();

		return moneyP;
	}

	// アイテムリストのdiv要素を返す
	static createItemListCon(player) {
		let container = document.createElement("div");
		container.innerHTML = View.createItemListString(player.itemList);

		for (let i = 0; i < player.itemList.length; i++) {
			container.querySelectorAll(".item-list")[i].addEventListener("click", function () {
				// アイテム購入画面が開いている間はタイマーを止める
				Controller.stopTimer(player);
				// アイテム購入画面を表示する

				View.displayItemPurchaseDialog(player, i);
			});
		}

		return container;
	}

	static createItemListString(itemList) {
		let itemListString = "";

		for (let i = 0; i < itemList.length; i++) {
			let itemAmount = "0";
			// アイテム購入数が10000を超えた場合は「Many」と表示する
			if (itemList[i].amount >= 10000) itemAmount = "Many";
			else itemAmount = itemList[i].amount.toString();

			itemListString +=
				`
				<div class="item-list metallic row m-3 p-2 hover-item">
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
	static displayItemPurchaseDialog(player, itemIndex) {
		const itemPurchaseDialog = document.getElementById("modal");
		itemPurchaseDialog.classList.remove("hidden");
		itemPurchaseDialog.classList.add("col-md-7", "col-12");
		itemPurchaseDialog.innerHTML = View.createPurchaseDialogString(player, itemIndex);

		// ダイアログ以外を暗くする
		const mask = document.getElementById("mask");
		mask.classList.remove("hidden");

		const goBackBtn = document.getElementById("goBackBtn");
		const purchaseBtn = document.getElementById("purchaseBtn");
		const itemAmount = document.getElementById("itemAmount");

		// inputタグのmax属性を設定
		if (player.itemList[itemIndex].maxPurchases !== -1) itemAmount.setAttribute("max", player.itemList[itemIndex].maxPurchases - player.itemList[itemIndex].amount);

		itemAmount.addEventListener("change", function () {
			// 合計金額の表示
			View.displayTotalAmount(itemAmount.value, player.itemList[itemIndex].price);
			if (itemAmount.value !== "0") purchaseBtn.disabled = false;
			else purchaseBtn.disabled = true; // 購入数0のときはPurchaseボタンをグレーアウト
		});

		goBackBtn.addEventListener("click", function () {
			// ゲーム画面に戻る
			Controller.backToGame(player, mask, itemPurchaseDialog);
		});

		purchaseBtn.addEventListener("click", function () {
			// Purchaseボタンを押したときの処理
			if (Controller.judgeWhetherMoneyIsGreater(player, itemIndex, itemAmount.value)) {
				alert("You don't have enough money to purchase this item. (お金が足りません。)");
			} else if (Controller.judgeWhetherItemsAreMax(player, itemIndex, itemAmount.value)) {
				alert("You can't purchase this item anymore. (このアイテムはこれ以上購入できません。)");
			} else { // 購入可能なら購入処理へ
				Controller.updatePlayerData(player, itemIndex, itemAmount.value);
				// ゲーム画面に戻る
				Controller.backToGame(player, mask, itemPurchaseDialog);
			}
		});
	}

	// アイテム購入画面のHTMLを返す
	static createPurchaseDialogString(player, itemIndex) {
		let purchaseDialogString = '';
		// 最大購入数が-1なら「∞」を表示する
		let maxItem = player.itemList[itemIndex].maxPurchases;
		if (maxItem === -1) maxItem = "∞"

		purchaseDialogString =
			`
			<div class="metallic flex-column justify-content-around align-items-center p-4">
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
					<p class="middle-font text-center my-2 ml-3">How Many would you like to purchase?</p>
					<div class="concavity container d-flex justify-content-end col-12 my-2">
						<p class="small-font text-end">￥${player.money.toLocaleString()}</p>
					</div>
					<input id="itemAmount" type="number" class="text-end col-12 ml-3" min="0" value="0">
				</div>
				<div id="totalAmount" class="text-end my-2 mr-4">
					<p class="small-font">Total: ￥0</p>
				</div>
				<div class="row">
					<div class="d-flex justify-content-stert col-6 mb-3">
						<button class="btn btn-light dark-green col-12" id="goBackBtn">Go Back</button>
					</div>
					<div class="d-flex justify-content-end col-6 mb-3">
						<button class="btn btn-green col-12" id="purchaseBtn" disabled>Purchase</button>
					</div>
				</div>
			</div>
		`;

		return purchaseDialogString;
	}

	// 購入画面の合計金額を表示するp要素を返す
	static createTotalAmountP(itemAmount, itemPrice) {
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
		numberOfBurgersDiv.append(View.createNumberOfBurgersP(burgers));
	}

	// クリックごとの所得金額を表示する
	static displayIncomePerClick(incomePerClick) {
		let incomePerClickDiv = config.mainPage.querySelectorAll("#incomePerClick")[0];
		incomePerClickDiv.innerHTML = '';
		incomePerClickDiv.append(View.createIncomePerClickP(incomePerClick));
	}

	// 秒ごとの所得金額を表示する
	static displayIncomePerSec(incomePerSec) {
		let incomePerSecDiv = config.mainPage.querySelectorAll("#incomePerSec")[0];
		incomePerSecDiv.innerHTML = '';
		incomePerSecDiv.append(View.createIncomePerSecP(incomePerSec));
	}

	// 所持金を表示する
	static displayMoney(money) {
		let moneyDiv = config.mainPage.querySelectorAll("#money")[0];
		moneyDiv.innerHTML = '';
		moneyDiv.append(View.createMoneyP(money));
	}

	// 日にちを表示する
	static displayDays(days) {
		let daysDiv = config.mainPage.querySelectorAll("#days")[0];
		daysDiv.innerHTML = '';
		daysDiv.append(View.createDaysP(days));
	}

	// 年齢を表示する
	static displayAge(age) {
		let ageDiv = config.mainPage.querySelectorAll("#age")[0];
		ageDiv.innerHTML = '';
		ageDiv.append(View.createAgeP(age));
	}

	// 購入画面の合計金額を表示する
	static displayTotalAmount(itemAmount, price) {
		const totalAmountDiv = document.getElementById("totalAmount");
		totalAmountDiv.innerHTML = '';
		totalAmountDiv.append(View.createTotalAmountP(itemAmount, price));
	}
}

Controller.showStartPage();