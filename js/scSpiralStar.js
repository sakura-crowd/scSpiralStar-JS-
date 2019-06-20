/**
 * @file らせん状に移動する星とポインタを追尾する円のインタラクティブなアニメーションを行うJSライブラリです。
 * @author SakuraCrowd
 * @license https://github.com/sakura-crowd/scSpiralStar-JS-/blob/master/license.txt を参照してください。
 * @version v1.0.0
 */

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// グローバル変数の定義
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * グローバル空間に定義する名前空間。
 * @type {Object}
 */ 
window.scSpiralStar = {};

/**
 * Viewer オブジェクトのリスト。
 * @type {Array.<Viewer>}
 */
window.scSpiralStar.viewers = [];

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Ball クラス
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * マウスポインタの軌道に表示し、次第にフェードアウトするボールを管理します。
 * @param {Number} _r ボールの大きさです。
 * @param {Number} _color ボールのカラーコードです。
 * @param {Number} _alphaBegin ボールのアルファ値の初期値です。 1.0 で不透明、 0.0 で透明です。
 * @param {Number} _alphaAdder 毎フレーム、アルファ値に加算される値です。負の値を指定することで徐々に透明になります。
 * @constructor
 */
	
window.scSpiralStar.Ball = function(_r, _color, _alphaBegin, _alphaAdder)
{
	let starStyle = new PIXI.TextStyle({
		fontSize: _r,
		fontWeight: "bold",
		fill: _color,
	});
	this.sprite_ = new PIXI.Text("●", starStyle);
	this.sprite_.anchor.set(0.5, 0.5);
	this.sprite_.x = 0;
	this.sprite_.y = 0;
	this.sprite_.alpha = 0;
	this.sprite_.alphaBegin_ = _alphaBegin;
	this.alphaAdder_ = _alphaAdder;
	this.enabled_ = false;
}

/**
 * 指定した座標にボールの位置を変更し、アルファ値を初期値に戻し、描画を有効にします。
 * @param {Number} _x ボールの位置(横)
 * @param {Number} _y ボールの位置(縦)
 * @function
 */
window.scSpiralStar.Ball.prototype.reset = function(_x, _y)
{
	this.sprite_.x = _x;
	this.sprite_.y = _y;
	this.sprite_.alpha = this.sprite_.alphaBegin_;
	this.enabled_ = true;
}

/**
 * 毎フレーム呼び出され、オブジェクトの状態を更新します。
 * @function
 */
window.scSpiralStar.Ball.prototype.update = function()
{
	if (this.enabled_ == false){return;}

	this.sprite_.alpha += this.alphaAdder_;
	if (this.sprite_.alpha <= 0)
	{
		this.enabled_ = false;
	}
}

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Star クラス
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * Star クラスのコンストラクタです。
 * @constructor
 * @classdesc 螺旋移動する星型を管理するクラスです。
 * @param {Number} _size 星の大きさです。
 * @param {Number} _color 星のカラーコードです。
 * @param {Number} _xOffset 螺旋移動の原点(横)です。
 * @param {Number} _yOffset 螺旋移動の原点(縦)です。
 * @param {Number} _rOffset 初期の回転済み角度(ラジアン)です。
 * @param {Number} _rLimit 指定された角度(ラジアン)だけ回転すると無効状態になります。
 * @param {Number} _rRotate 螺旋移動の座標を回転させる角度(ラジアン)です。複数の星がずれて螺旋移動するための設定です。
 * @param {Number} _speed 移動速度です。
 */
window.scSpiralStar.Star = function(_size, _color, _xOffset, _yOffset, _rOffset, _rLimit, _rRotate, _speed = 10)
{
	let starStyle = new PIXI.TextStyle({
		fontSize: _size,
		fontWeight: "bold",
		fill: _color,
	});
	this.sprite_ = new PIXI.Text("★", starStyle);
	this.sprite_.anchor.set(0.5, 0.5);
	//this.sprite_.visible = false;

	this.rOffset_ = _rOffset;
	this.xOffset_ = _xOffset;
	this.yOffset_ = _yOffset;
	this.r_ = _rOffset;
	this.rLimit_ = _rLimit;
	this.rRotate_ = _rRotate;
	this.speed_ = _speed;
	this.flgMoveEnd_ = false;
}

/**
 * 毎フレーム呼び出され、星を移動させます。有効時間が過ぎたら状態を無効にします。
 * @function
 */
window.scSpiralStar.Star.prototype.move = function() {
	this.r_ += 0.1;
	// 螺旋
	this.sprite_.x = this.speed_ * (this.r_ * Math.cos(this.r_)) + this.xOffset_;
	this.sprite_.y = this.speed_ * (this.r_ * Math.sin(this.r_)) + this.yOffset_;

	// Offset原点の回転
	let x0 = this.sprite_.x - this.xOffset_;
	let y0 = this.sprite_.y - this.yOffset_;
	this.sprite_.x = x0 * Math.cos(this.rRotate_) - y0 * Math.sin(this.rRotate_) + this.xOffset_
	this.sprite_.y = x0 * Math.sin(this.rRotate_) + y0 * Math.cos(this.rRotate_) + this.yOffset_;

	// 削除
	if (this.r_ > this.rLimit_) {
		this.flgMoveEnd_ = true;
	}
}

/**
 * 範囲内からランダムな値を返します。
 * @function
 */
window.scSpiralStar.randomWithinRange = function(_min, _max)
{
	if (_min === _max) {
		return _min;
	}
	return Math.floor(Math.random() * (_max - _min + 1)) + _min;
}

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// パラメータの規定値
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * パラメータの規定値です。 setup 関数の第二引数で上書きすることができます。省略したパラメータの値は以下の値になります。
 * パラメータの説明は ReadMe.md を参照してください。
 * @type {Object}
 */
window.scSpiralStar.viewerParamBase = {
	cntStarMin: 3,
	cntStarMax: 6,
	sizeStarMin: 10,
	sizeStarMax: 80,
	speedStarMin: 5,
	speedStarMax: 15,
	limitStarRotateMin: 2.0 * Math.PI * 1,
	limitStarRotateMax: 2.0 * Math.PI * 9,
	starColorList: [0xff1493, 0xffa500, 0x7fffd4, 0x556b2f, 0x4169e1, 0x778899, 0xdaa520],

	cntBall: 128,
	sizeBall: 50,
	ballAlphaBegin: 1,
	ballAlphaAdder: -0.08,
	ballColorList: [0xffff88],

	intervalRandomSpawnMin: 100,
	intervalRandomSpawnMax: 150,

	backgroundColor: 0x191970,
}

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Viewer クラス
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * 描画全体を管理する Viewer クラスを構築します。
 * @constructor
 * @classdesc 描画に必要な星や円のスプライトを生成し PIXI.Application で管理します。
 * @param {String} _tag_id 描画対象の div などの ID です。
 * @param {Object} _param window.scSpiralStar.viewerParamBase を上書きするためのオブジェクトです。
 */ 
window.scSpiralStar.Viewer = function(_tag_id, _param)
{
	// パラメータを引数に応じて上書き
	let _paramMerged = Object.assign(window.scSpiralStar.viewerParamBase, _param);

	// パラメータをメンバ変数に保持
	this.tag_id_ = _tag_id;
	this.target_ =  $("#" + _tag_id);
	this.ballList_ = [];
	this.ballIndex_ = 0;
	this.starList_ = [];

	this.cntStarMin_ = _paramMerged.cntStarMin;	// TODO _paramで変更できる
	this.cntStarMax_ = _paramMerged.cntStarMax;
	if (this.cntStarMax_ <= this.cntStarMin_)
	{
		this.cntStarMax_, this.cntStarMin_ = this.cntStarMin_, this.cntStarMax_;
	}

	this.sizeStarMin_ = _paramMerged.sizeStarMin;
	this.sizeStarMax_ = _paramMerged.sizeStarMax;
	if (this.sizeStarMax <= this.sizeStarMin_)
	{
		this.sizeStarMax, this.sizeStarMin_ = this.sizeStarMin_, this.sizeStarMax;
	}

	this.speedStarMin_ = _paramMerged.speedStarMin;
	this.speedStarMax_ = _paramMerged.speedStarMax;
	if (this.speedStarMax <= this.speedStarMin_)
	{
		this.speedStarMax, this.speedStarMin_ = this.speedStarMin_, this.speedStarMax;
	}

	this.limitStarRotateMin_ = _paramMerged.limitStarRotateMin;
	this.limitStarRotateMax_ = _paramMerged.limitStarRotateMax;
	if (this.limitStarRotateMax <= this.limitStarRotateMin_)
	{
		this.limitStarRotateMax, this.limitStarRotateMin_ = this.limitStarRotateMin_, this.limitStarRotateMax;
	}

	this.starColorList = _paramMerged.starColorList;

	this.cntBall_ = _paramMerged.cntBall;
	this.sizeBall_ = _paramMerged.sizeBall;
	this.ballColorList_ = _paramMerged.ballColorList;
	this.ballAlphaBegin_ = _paramMerged.ballAlphaBegin;
	this.ballAlphaAdder_ = _paramMerged.ballAlphaAdder;

	this.intervalRandomSpawnMin_ = _paramMerged.intervalRandomSpawnMin;
	this.intervalRandomSpawnMax_ = _paramMerged.intervalRandomSpawnMax;
	if (this.intervalRandomSpawnMax_ <= this.intervalRandomSpawnMin_)
	{
		this.intervalRandomSpawnMax_, this.intervalRandomSpawnMin_ = this.intervalRandomSpawnMin_, this.intervalRandomSpawnMax_;
	}

	this.intervalRandomSpawn = window.scSpiralStar.randomWithinRange(this.intervalRandomSpawnMin_, this.intervalRandomSpawnMax_);

	// console.log("tag_id_ = " + this.tag_id_)
	// console.log("w = " + this.target_.width() + ", h = " + this.target_.height())

	// PIXI.Application オブジェクトの作成
	this.app = new PIXI.Application({ 
		width: this.target_.width(),
		height: this.target_.height(),
		backgroundColor: _paramMerged.backgroundColor,
		antialiasing: true,
		transparent: false,
		resolution: 1
	});

	// リサイズイベントの設定
	window.addEventListener('resize', function(){
		this.app.renderer.resize(this.target_.width(), this.target_.height());
	}.bind(this));
	// クリックイベントの設定
	this.interactionManager = new PIXI.interaction.InteractionManager(this.app.renderer);
	this.interactionManager
	.on('mousedown', (event) => {
		const position = event.data.getLocalPosition(this.app.stage);
		//console.log("click" + position.x + ", " + position.y);

		this.spawn(position.x, position.y);
		this.intervalRandomSpawn = this.intervalRandomSpawnMin_;	// クリックされた場合は自動発生を行わせないように自動発生までのカウントをリセットする
		return;
	})
	// マウス移動イベントの設定
	.on('mousemove', (event) => {
		const position = event.data.getLocalPosition(this.app.stage);

		this.ballList_[this.ballIndex_].reset(position.x, position.y);
		this.ballIndex_++;
		if (this.ballIndex_ >= this.ballList_.length)
		{
			this.ballIndex_ = 0;
		}
		return;
	});

	// ball を一定数作成。
	for (let i = 0; i < this.cntBall_; ++i)
	{
		let _color = this.ballColorList_[Math.floor(Math.random() * this.ballColorList_.length)];
		let _ball = new window.scSpiralStar.Ball(this.sizeBall_, _color, this.ballAlphaBegin_, this.ballAlphaAdder_);
		this.app.stage.addChild(_ball.sprite_)
		this.ballList_.push(_ball);
	}

	// DOMにレンダラーのビューを追加
	this.target_.append(this.app.view);
	// 更新処理の開始
	this.update();
}

/**
 * 毎フレーム呼び出され、表示を更新します。
 * @function
 */
window.scSpiralStar.Viewer.prototype.update = function () {
	requestAnimationFrame(window.scSpiralStar.Viewer.prototype.update.bind(this));

	// 現在有効な全ての星を動かす
	for (let i = 0; i < this.starList_.length; ++i)
	{
		this.starList_[i].move();
		if (this.starList_[i].flgMoveEnd_ === true)
		{
			// 有効時間が経過して無効になった星はリストから外す
			this.app.stage.removeChild(this.starList_[i].sprite_);
			delete this.starList_[i];
		}
	}
	this.starList_ = this.starList_.filter(item => item.flgMoveEnd_ !== true);	// splice よりも高速らしい。
	
	// 一定時間の経過後に星をランダムな位置に出現させる
	this.intervalRandomSpawn--;
	if (this.intervalRandomSpawn <= 0)
	{
		this.spawn(Math.floor(Math.random() * this.target_.width()), Math.floor(Math.random() * this.target_.height()));
		this.intervalRandomSpawn = window.scSpiralStar.randomWithinRange(this.intervalRandomSpawnMin_, this.intervalRandomSpawnMax_);;
	}

	// ポインタを追尾する円のアルファ値を更新する
	for (let i = 0; i < this.ballList_.length; ++i)
	{
		this.ballList_[i].update();
	}
}

/**
 * 指定された位置に星を出現させます。星の個数、色、速度、有効時間は設定の範囲でランダムに決められます。
 * @param {Number} _x ボールの位置(横)
 * @param {Number} _y ボールの位置(縦)
 * @function
 */
window.scSpiralStar.Viewer.prototype.spawn = function(_x, _y)
{
	let _rRotate = 0;
	let _color = this.starColorList[Math.floor(Math.random() * this.starColorList.length)];
	let _cntStar = window.scSpiralStar.randomWithinRange(this.cntStarMin_, this.cntStarMax_);
	let _sizeStar = window.scSpiralStar.randomWithinRange(this.sizeStarMin_, this.sizeStarMax_);
	let _speedStar = window.scSpiralStar.randomWithinRange(this.speedStarMin_, this.speedStarMax_);
	let _limitStarRotate = window.scSpiralStar.randomWithinRange(this.limitStarRotateMin_, this.limitStarRotateMax_);
	for (let i = 0; i < _cntStar; ++i)
	{
		_rRotate += 2.0 * Math.PI / (_cntStar);	// 2*PIは360度と同じ。
		let _star = new window.scSpiralStar.Star(_sizeStar, _color, _x, _y, 0.0, _limitStarRotate, _rRotate, _speedStar);
		this.app.stage.addChild(_star.sprite_);
		this.starList_.push(_star);
	}
}

// window.scSpiralStar.Viewer.prototype.cleanup = function()
// {	
// }

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// 外部関数
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * 指定された ID の要素で scSpiralStar のアニメーションを開始します。
 * @param {String} _tag_id 描画対象の div などの ID です。
 * @param {Object} _param window.scSpiralStar.viewerParamBase を上書きするためのオブジェクトです。
 * @function
 */
window.scSpiralStar.setup = function(_tag_id, _param)
{
	let _viewer = new window.scSpiralStar.Viewer(_tag_id, _param);
	window.scSpiralStar.viewers.push(_viewer);
}

/// 指定された ID の要素での scSpiralStar の実行を終了します。
// window.scSpiralStar.cleanup = function(_tag_id)
// {
// 	let _foundViewer = window.scSpiralStar.viewers.find(function(_viewer){return _iewer.tag_id_ === _tag_id;})	// 削除対象の Viewer を見つける
// 	window.scSpiralStar.viewers = window.scSpiralStar.viewers.filter(_viewer => {return _viewer !== _foundViewer;})	// リストから削除
// 	_foundViewer.cleanup();	// Viewer 自身を削除
// }
