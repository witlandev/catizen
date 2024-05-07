! function() {
    "use strict";
    class n {
        static get(t, e, i) {
            return i ? Laya.Pool.getItemByCreateFun(t, i) : Laya.Pool.getItemByClass(t, e)
        }
        static put(t, e) {
            e && Laya.Pool.recover(t, e)
        }
    }
    class F {
        constructor() {
            this._urls = [], this._reference = 0, this._activeTime = 0
        }
        static create(t) {
            let e = n.get(F._sign, F);
            return e.setData(t), e
        }
        setData(t) {
            this._urls = t
        }
        destroy() {
            this._urls.forEach(t => {
                Laya.loader.clearRes(t)
            }), this._urls = [], this._reference = 0, this._activeTime = 0, n.put(F._sign, this)
        }
        canDestroy(t) {
            return !(0 < this._reference) && !(t - this._activeTime < 1e5)
        }
        addReference() {
            this._reference += 1, this._activeTime = Date.newDate().getTime()
        }
        removeReference() {
            --this._reference
        }
    }
    F._sign = "p_ResInfo";
    class a extends Laya.Animation {
        static registerTimer() {
            Laya.timer.loop(6e4, null, a.checkUnusedRes)
        }
        static checkUnusedRes() {
            if (a._resRef.size) {
                var e, i, s = Date.newDate().getTime();
                let t = a._resRef;
                for ([e, i] of t) i.canDestroy(s) && (i.destroy(), t.delete(e))
            }
        }
        static addResRef(t) {
            let e = a._resRef.get(t);
            e || (e = F.create([t]), a._resRef.set(t, e)), e.addReference()
        }
        static removeResRef(t) {
            let e = a._resRef.get(t);
            e && e.removeReference()
        }
        static create() {
            return n.get(a._sign, a)
        }
        loadAtlas(t, e = null, i = "") {
            return a.addResRef(t), this._skin = t, super.loadAtlas(t, e, i), this
        }
        recover() {
            a.removeResRef(this._skin), this.destroyed || (this.clear(), this.offAll(), this.removeSelf(), this._skin = null, n.put(a._sign, this))
        }
        destroy(t) {
            a.removeResRef(this._skin), super.destroy(t)
        }
    }
    a._resRef = new Map, a._sign = "p_Animation", a.registerTimer();
    class B extends Laya.UIComponent {
        constructor(t = !1) {
            super(), this._autoPlay = !1, this._loopCount = 0, this._completedLoop = 0, this._autoRemove = !1, this._noAdjustSize = !1, this._baseScaleX = 1, this._baseScaleY = 1, this._aniScaleX = 1, this._aniScaleY = 1, this._initBaseScale = !1, this._noAdjustSize = t;
            this.ani = new a;
            this.addChild(this.ani)
        }
        get loopCount() {
            return this._loopCount
        }
        set loopCount(t) {
            this._completedLoop = 0, this.ani.off(Laya.Event.COMPLETE, this, this.onLoopComplete), 0 < t && this.ani.on(Laya.Event.COMPLETE, this, this.onLoopComplete), this._loopCount = t
        }
        get autoRemove() {
            return this._autoRemove
        }
        set autoRemove(t) {
            this._autoRemove = t
        }
        get autoPlay() {
            return this._autoPlay
        }
        set autoPlay(t) {
            this._autoPlay != t && (this._autoPlay = t, (this.ani.autoPlay = t) || (this.ani.graphics = null))
        }
        get isPlaying() {
            return this.ani.isPlaying
        }
        get skin() {
            return this._skin
        }
        set skin(t) {
            this._skin != t && (this._removeAsset(this._skin), "" != (this._skin = t) && (this._addAsset(t), Laya.loader.loadP(t, null, Laya.Loader.ATLAS, 2).then(() => {
                this.setAtlas(t)
            })))
        }
        get miniAniScaleX() {
            return this._aniScaleX
        }
        get miniAniScaleY() {
            return this._aniScaleY
        }
        set scaleAniX(t) {
            this._baseScaleX = t, this.scaleX = this._aniScaleX * this._baseScaleX
        }
        get scaleAniX() {
            return this._baseScaleX
        }
        set scaleAniY(t) {
            this._baseScaleY = t, this.scaleY = this._aniScaleY * this._baseScaleY
        }
        get scaleAniY() {
            return this._baseScaleY
        }
        _addAsset(t) {}
        _removeAsset(t) {}
        setAtlas(e) {
            if (!this.destroyed) {
                var i = Laya.Loader.getRes(e);
                if (i) {
                    let t = 1;
                    for (var s in i.mc) {
                        s = i.mc[s];
                        this.ani.interval = 1e3 / s.frameRate, s.scale && (t = parseFloat(s.scale));
                        break
                    }
                    this._aniScaleX = this._aniScaleY = t, this._initBaseScale || (this._baseScaleX = this.scaleX, this._baseScaleY = this.scaleY, this._initBaseScale = !0), this.scaleAniX = this._baseScaleX, this.scaleAniY = this._baseScaleY, this._noAdjustSize || this.adjustBoundSize(i), this.ani.frames = a.createFrames(e, ""), this.autoPlay || (this.ani.graphics = null), this.event(Laya.Event.LOADED)
                }
            }
        }
        adjustBoundSize(t) {
            let e = 0,
                i = 0;
            for (var s in t.res) {
                s = t.res[s];
                e = Math.max(e, s.w), i = Math.max(i, s.h)
            }
            this.width = this.width || e, this.height = this.height || i, this.ani.x = this.width / 2, this.ani.y = this.height / 2
        }
        play(t) {
            this.ani.play(t)
        }
        gotoAndStop(t) {
            this.ani.gotoAndStop(t)
        }
        stop() {
            this.ani.stop(), this.ani.graphics = null
        }
        clear() {
            this._skin = "", this.ani.clear()
        }
        onLoopComplete() {
            this._completedLoop++, 0 < this._loopCount && this._completedLoop >= this._loopCount && Laya.timer.callLater(this, () => {
                this.stop(), this.event(Laya.Event.COMPLETE), this._autoRemove && this.removeSelf()
            })
        }
        get animation() {
            return this.ani
        }
        destroy(t = !0) {
            this.scaleX = 1, this.scaleY = 1, this._aniScaleX = 1, this._aniScaleY = 1, this._baseScaleX = 1, this._baseScaleY = 1, this._initBaseScale = !1, this.offAll(), this.clear(), super.destroy(t)
        }
    }
    class U {
        constructor(t) {
            this._downMode = !1, this._clicked = !1, this.outed = !1, this.canceled = !1, this.scale = .9, this.button = t
        }
        static create(t) {
            return new U(t)
        }
        onEvent(t) {
            let e = t.type;
            e === Laya.Event.MOUSE_DOWN ? this.promise = this.scaleDown().then(() => {}) : e === Laya.Event.MOUSE_OUT || e === Laya.Event.MOUSE_UP ? (this.outed = !0, this.promise && this.promise.then(() => this.scaleUp())) : e === Laya.Event.CLICK && (this._clicked = !0, this.promise && this.promise.then(() => !this.outed && this.scaleUp()).then(() => {
                this._clicked = !1, this.doClick()
            })), this.promise && this.promise.then(() => {
                if (!this.canceled) {
                    let t = this.button;
                    t.selected || t.setState(Laya.Button.stateMap[e])
                }
            })
        }
        scaleDown() {
            return this.downMode = !0, Promise.resolve(void 0)
        }
        scaleUp() {
            return this.downMode = !1, Promise.resolve(void 0)
        }
        get downMode() {
            return this._downMode
        }
        set downMode(t) {
            let e = this.button;
            var i, s, a, n, o, h, r;
            e.parent && this._downMode != t && (this._downMode = t, e.parent, i = e.left, s = e.right, a = e.top, n = e.bottom, e.top = e.bottom = e.left = e.right = NaN, t ? (this._oldPivotX = e.pivotX, this._oldPivotY = e.pivotY, t = .5 * e.width, r = .5 * e.height, o = (t - this._oldPivotX) * e.scaleX, h = (r - this._oldPivotY) * e.scaleY, e.pivot(t, r), e.pos(e.x + o, e.y + h), e.set_scaleX(e.scaleX * this.scale), e.set_scaleY(e.scaleY * this.scale)) : (e.set_scaleX(e.scaleX / this.scale), e.set_scaleY(e.scaleY / this.scale), t = (this._oldPivotX - e.pivotX) * e.scaleX, r = (this._oldPivotY - e.pivotY) * e.scaleY, e.pivot(this._oldPivotX, this._oldPivotY), e.pos(e.x + t, e.y + r), e.left = i, e.right = s, e.top = a, e.bottom = n))
        }
        cancel() {
            this.downMode && (this._clicked && this.doClick(), this.downMode = !1)
        }
        doClick() {
            if (!this.downMode) {
                let t = this.button;
                t.toggle && (t.selected = !t.selected), t.clickHandler && t.clickHandler.run()
            }
        }
    }
    class G extends Laya.Button {
        constructor() {
            super(...arguments), this._enableAnimating = !0, this._reversed = !1, this._reverseDirection = G.REVERSE_HORIZONTAL, this.enableLongPress = !1
        }
        onAwake() {
            super.onAwake(), this.text.wordWrap = !0, this.text.x += 15
        }
        get enableAnimating() {
            return this._enableAnimating
        }
        set enableAnimating(t) {
            this._enableAnimating = t
        }
        set image(t) {
            if (this._imageSkin != t) {
                if (!this._image) {
                    let t = this._image = new Laya.Image;
                    t.anchorX = t.anchorY = .5, t.centerX = -0, t.centerY = -8, this.addChild(t)
                }
                this._imageSkin = t, this._image.skin = t, Laya.timer.callLater(this, this.changeImages)
            }
        }
        get image() {
            return this._imageSkin
        }
        get imageItem() {
            return this._image
        }
        get effectOn() {
            return this._effectOn
        }
        set effectOn(t) {
            this._effectOn != t && (this._effectOn = t, Laya.timer.callLater(this, this.updateEffect))
        }
        get effect() {
            return this._effect
        }
        set effect(t) {
            this._effect != t && (this._effect = t, Laya.timer.callLater(this, this.updateEffect))
        }
        get effectAutoScale() {
            return this._effectAutoScale
        }
        set effectAutoScale(t) {
            this._effectAutoScale = t
        }
        get effectLayer() {
            return this._effectLayer
        }
        set effectLayer(t) {
            this._effectLayer != t && (this._effectLayer = t, Laya.timer.callLater(this, this.updateEffect))
        }
        get reverseDirection() {
            return this._reverseDirection
        }
        set reverseDirection(t) {
            this._reverseDirection != t && (this._reverseDirection = t)
        }
        get reversed() {
            return this._reversed
        }
        set reversed(t) {
            this._reversed != t && (this._reversed = t)
        }
        updateEffect() {
            if (this._effect)
                if (this._effectOn) {
                    var e = this._effectLayer || G.LAYER_BOTTOM;
                    let t = this._effectAni;
                    t || ((t = this._effectAni = new B).centerX = t.centerY = 0, e == G.LAYER_TOP ? this.addChild(t) : e == G.LAYER_BOTTOM && this.addChildAt(t, 0)), t.autoPlay = !0, t.skin != this._effect && (t.skin = this._effect, this._effectAutoScale && t.once(Laya.Event.LOADED, this, () => {
                        t.scaleX = this.width / t.width, t.scaleY = this.height / t.height
                    }))
                } else {
                    let t = this._effectAni;
                    t && (t.autoPlay = !1)
                }
            else this._effectAni && (this._effectAni.autoPlay = !1)
        }
        onMouse(t) {
            this.enableAnimating ? !1 === this.toggle && this._selected || (this._mouseClick || (this._mouseClick = U.create(this)), t.type !== Laya.Event.MOUSE_DOWN && t.type !== Laya.Event.MOUSE_OVER || this._mouseClick.cancel(), this._mouseClick.onEvent(t), this.enableLongPress && t.type == Laya.Event.MOUSE_DOWN && t.stopPropagation()) : super.onMouse(t)
        }
        changeImages() {
            if (!this.destroyed) {
                let t = Laya.Loader.getRes(this._imageSkin);
                var e, i, s;
                t && (t.$_GID || (t.$_GID = Laya.Utils.getGID()), e = t.$_GID, (i = Laya.WeakObject.I.get(e)) ? this._imageSources = i : (this._imageSources = [t], i = Laya.Loader.getRes(this.getStateRes(this._imageSkin, "down")), s = Laya.Loader.getRes(this.getStateRes(this._imageSkin, "select")), i && this._imageSources.push(i), s && (i || this._imageSources.push(t), this._imageSources.push(s)), Laya.WeakObject.I.set(e, this._imageSources)))
            }
        }
        changeClips() {
            if (!this.destroyed && this._skin) {
                let t = Laya.Loader.getRes(this._skin);
                var e, i, s, a, n;
                t && (e = t.sourceWidth, i = t.sourceHeight, t.$_GID || (t.$_GID = Laya.Utils.getGID()), s = t.$_GID, (a = Laya.WeakObject.I.get(s)) ? this._sources = a : (this._sources = [t], a = Laya.Loader.getRes(this.getStateRes(this._skin, "down")), n = Laya.Loader.getRes(this.getStateRes(this._skin, "select")), a && this._sources.push(a), n && (a || this._sources.push(t), this._sources.push(n)), Laya.WeakObject.I.set(s, this._sources)), this._autoSize ? (this._bitmap.width = this.width || e, this._bitmap.height = this.height || i, this._text && (this._text.width = this._bitmap.width - 30, this._text.height = this._bitmap.height)) : this._text && (this._text.x = e))
            }
        }
        setState(t) {
            this.state = t
        }
        changeState() {
            var t;
            this.destroyed || (this._stateChanged = !1, this.runCallLater(this.changeClips), this._sources && (t = this._sources.length, t = this._state < t ? this._state : t - 1, t = this._sources[t], this._bitmap.source = t), this.runCallLater(this.changeImages), this._imageSources && this._image && (t = this._imageSources.length, t = this._state < t ? this._state : t - 1, t = this._imageSources[t], this._image.source = t), this.label && this._sources && (t = this._sources.length, t = this._state < t ? this._state : t - 1, this._text.color = this._labelColors[t], this._strokeColors && (this._text.strokeColor = this._strokeColors[t])))
        }
        getStateRes(t, e) {
            var i = t.lastIndexOf(".");
            return i < 0 ? t : t.substr(0, i) + "$" + e + t.substr(i)
        }
        destroy(t = !0) {
            Laya.timer.clearAll(this), super.destroy(t)
        }
    }
    G.REVERSE_HORIZONTAL = "horizontal", G.REVERSE_VERTICAL = "vertical", G.LAYER_TOP = "top", G.LAYER_BOTTOM = "bottom";
    class q extends Laya.CheckBox {}
    class O extends Laya.ComboBox {}
    class H extends Laya.HBox {
        constructor() {
            super(), this.filterVisible = !1, this.enable = !0, this.filterHandler = new Laya.Handler(this, this._defaultFilter)
        }
        sortItem(t) {
            this.sortHandler && this.sortHandler.runWith([t])
        }
        _defaultFilter(t) {
            return !!t && !(this.filterVisible && !t.visible)
        }
        changeItems() {
            if (this.enable) {
                this._itemChanged = !1;
                let i = [],
                    s = 0;
                for (let t = 0, e = this.numChildren; t < e; t++) {
                    var n = this.getChildAt(t);
                    this.filterHandler.runWith(n) && (i.push(n), s = this.height || Math.max(s, n.height * n.scaleY))
                }
                this.sortItem(i);
                let a = 0;
                for (let e = 0, t = i.length; e < t; e++) {
                    let t = i[e];
                    t.x = a, a += t.width * t.scaleX + this._space, this._align == H.TOP ? t.y = 0 : this._align == H.MIDDLE ? t.y = .5 * (s - t.height * t.scaleY) : this._align == H.BOTTOM && (t.y = s - t.height * t.scaleY)
                }
                this.event(Laya.Event.RESIZE), this.onCompResize()
            }
        }
        get contentWidth() {
            return this.measureWidth
        }
        get contentHeight() {
            return this.measureHeight
        }
        commitMeasure() {
            super.commitMeasure(), this.runCallLater(this.changeItems)
        }
    }
    class W extends Laya.VBox {
        constructor() {
            super(), this.filterVisible = !1, this.enable = !0, this.filterHandler = new Laya.Handler(this, this._defaultFilter)
        }
        sortItem(t) {
            this.sortHandler && this.sortHandler.runWith([t])
        }
        _defaultFilter(t) {
            return !!t && !(this.filterVisible && !t.visible)
        }
        changeItems() {
            if (this.enable) {
                this._itemChanged = !1;
                let i = [],
                    s = 0;
                for (let t = 0, e = this.numChildren; t < e; t++) {
                    var a = this.getChildAt(t);
                    this.filterHandler.runWith(a) && (i.push(a), s = this.width || Math.max(s, a.width * a.scaleX))
                }
                this.sortItem(i);
                var n = 0;
                for (let e = 0, t = i.length; e < t; e++) {
                    let t = i[e];
                    t.y = n, n += t.height * t.scaleY + this._space, this._align == W.LEFT ? t.x = 0 : this._align == W.CENTER ? t.x = .5 * (s - t.width * t.scaleX) : this._align == W.RIGHT && (t.x = s - t.width * t.scaleX)
                }
                this.event(Laya.Event.RESIZE), this.onCompResize()
            }
        }
        get contentWidth() {
            return this.measureWidth
        }
        get contentHeight() {
            return this.measureHeight
        }
        commitMeasure() {
            super.commitMeasure(), this.runCallLater(this.changeItems)
        }
    }

    function V(s) {
        for (var e in s.on(Laya.Event.CLICK, s, (e, i) => {
                var s = i.target.name;
                if (s) {
                    let t = e["onClick" + s];
                    t && t.call(e, i)
                }
            }, [s]), s)
            if (s.hasOwnProperty(e)) {
                if (e.includes("m_chb_")) {
                    let t = s[e];
                    var i = e.replace("m_chb_", ""),
                        i = s["onSelect" + i];
                    i && (t.clickHandler = Laya.Handler.create(s, i, [t], !1))
                }
                if (e.includes("m_cob_")) {
                    let t = s[e];
                    var i = e.replace("m_cob_", ""),
                        a = s["onSelect" + i];
                    a && (t.selectHandler = Laya.Handler.create(s, a, null, !1))
                }
                if (e.includes("m_lst_")) {
                    let t = s[e];
                    a = e.replace("m_lst_", "");
                    let i = s["onSelect" + a];
                    i && (t.selectHandler = Laya.Handler.create(s, i, null, !1)), t.renderHandler = Laya.Handler.create(s, (t, e) => {
                        t.dataChanged && t.dataChanged(e)
                    }, null, !1), (i = s["onClick" + a]) && (t.mouseHandler = Laya.Handler.create(s, (t, e) => {
                        t.type == Laya.Event.CLICK && i && i.apply(s, [t, e])
                    }, null, !1)), t.scrollBar && (t.scrollBar.elasticDistance = 100, t.scrollBar.elasticBackTime = 200, t.scrollBar.hide = !0)
                }
                if (e.includes("m_sli_")) {
                    let t = s[e];
                    var n = e.replace("m_sli_", ""),
                        n = s["onChange" + n];
                    n && (t.changeHandler = Laya.Handler.create(s, n, null, !1))
                }
                if (e.includes("m_rg_")) {
                    let t = s[e];
                    var n = e.replace("m_rg_", ""),
                        o = s["onSelect" + n];
                    o && (t.selectHandler = Laya.Handler.create(s, o, null, !1))
                }
                if (e.includes("m_tab_")) {
                    let t = s[e];
                    var o = e.replace("m_tab_", ""),
                        h = s["onSelect" + o];
                    h && (t.selectHandler = Laya.Handler.create(s, h, null, !1))
                }
                if (e.includes("m_pan_")) {
                    let t = s[e];
                    t.vScrollBar && (t.vScrollBar.elasticDistance = 100, t.vScrollBar.elasticBackTime = 200, t.vScrollBar.hide = !0), t.hScrollBar && (t.hScrollBar.elasticDistance = 100, t.hScrollBar.elasticBackTime = 200, t.hScrollBar.hide = !0)
                }
            }
    }

    function Y(e) {
        for (var i in e)
            if (e.hasOwnProperty(i)) {
                if (i.includes("m_chb_")) {
                    let t = e[i];
                    t.clickHandler && (t.clickHandler.recover(), t.clickHandler = null)
                }
                if (i.includes("m_cob_")) {
                    let t = e[i];
                    t.selectHandler && (t.selectHandler.recover(), t.selectHandler = null)
                }
                if (i.includes("m_lst_")) {
                    let t = e[i];
                    t.renderHandler && (t.renderHandler.recover(), t.renderHandler = null), t.selectHandler && (t.selectHandler.recover(), t.selectHandler = null), t.mouseHandler && (t.mouseHandler.recover(), t.mouseHandler = null)
                }
                if (i.includes("m_sli_")) {
                    let t = e[i];
                    t.changeHandler && (t.changeHandler.recover(), t.changeHandler = null)
                }
                if (i.includes("m_rg_")) {
                    let t = e[i];
                    t.selectHandler && (t.selectHandler.recover(), t.selectHandler = null)
                }
                if (i.includes("m_tab_")) {
                    let t = e[i];
                    t.selectHandler && (t.selectHandler.recover(), t.selectHandler = null)
                }
            }
    }
    let X = new Laya.EventDispatcher;
    class z extends Laya.Scene {
        onAwake() {
            super.onAwake(), this.registerModelEvents(!0), V(this)
        }
        onDestroy() {
            super.onDestroy(), this.registerModelEvents(!1), Y(this)
        }
        registerModelEvents(e) {
            this._modelEvents && this._modelEvents.length && this._modelEvents.forEach(t => {
                e ? X.on(t.eventType, this, t.handler) : X.off(t.eventType, this, t.handler)
            })
        }
    }
    class j extends Laya.View {
        constructor() {
            super(...arguments), this._preFuncs = [], this._preUrls = []
        }
        get assetCollector() {
            return this._assetCollector
        }
        set assetCollector(t) {
            this._assetCollector = t
        }
        onAwake() {
            super.onAwake(), this.adaptBg(), this.registerModelEvents(!0), V(this)
        }
        onDestroy() {
            super.onDestroy(), this.registerModelEvents(!1), this.cancelLoadRes(), Laya.Tween.clearAll(this), Y(this)
        }
        openView() {
            return new Promise((t, e) => {
                this.addPreFunc(() => this.loadViewComplete()), this.addPreFunc(() => this.loadPreRes());
                let i = [];
                this._preFuncs.forEach(t => i.push(t())), Promise.all(i).then(() => {
                    (this.destroyed ? e : t)()
                }).catch(t => {
                    console.error(t), e()
                })
            })
        }
        loadP(t, e, i, s, a) {
            return Laya.loader.loadP(t, null, e, i, s, a)
        }
        registerModelEvents(e) {
            this._modelEvents && this._modelEvents.length && this._modelEvents.forEach(t => {
                e ? X.on(t.eventType, this, t.handler) : X.off(t.eventType, this, t.handler)
            })
        }
        addPreRes(t) {
            Array.isArray(t) ? this._preUrls = t : this._preUrls.push(t)
        }
        addPreFunc(t) {
            this._preFuncs.pushOnce(t)
        }
        loadViewComplete() {
            return this._viewCreated ? Promise.resolve(this) : new Promise((t, e) => {
                this.once("onViewCreated", this, () => t(this))
            })
        }
        loadPreRes() {
            return this._preUrls.length ? new Promise((t, e) => {
                this.loadP(this._preUrls, null, 0).then(() => {
                    this._preUrls = null, t()
                })
            }) : Promise.resolve()
        }
        cancelLoadRes() {
            this._preUrls && (Laya.loader.cancelLoadByUrls(this._preUrls), this._preUrls = null)
        }
        adaptBg() {
            let t = this.m_img_AdaptBg;
            var e;
            t && (e = Mmobay.Utils.getScreenInfo(), t.size(e.stageWidth, e.stageHeight), t.centerX = t.centerY = 0, t.mouseEnabled = !0, t.mouseThrough = !1)
        }
    }
    const $ = {};
    var c, K, o;
    (e = c = c || {})[e.Fight = 0] = "Fight", e[e.Main = 1] = "Main", e[e.Secondary = 2] = "Secondary", e[e.Fixui = 3] = "Fixui", e[e.Popup = 4] = "Popup", e[e.Effect = 5] = "Effect", e[e.Toast = 6] = "Toast", e[e.Loading = 7] = "Loading", e[e.System = 8] = "System", (e = K = K || {})[e.Yes = 1] = "Yes", e[e.No = 2] = "No", e[e.YesNo = 3] = "YesNo", (e = o = o || {})[e.None = 0] = "None", e[e.Yes = 1] = "Yes", e[e.No = 2] = "No", e[e.Skip = 3] = "Skip";
    class J extends Laya.UIComponent {
        constructor(t) {
            super(), this.size(560, 1120), this.centerX = this.centerY = 0, this.name = t.name, this.zOrder = t.zOrder, this.mouseThrough = !0, this._layer = t.layer
        }
        get layer() {
            return this._layer
        }
    }
    class s {
        constructor() {
            this._mainDlgs = [], this._secondaryDlgs = [], this._popupDlgs = []
        }
        static get instance() {
            return s._instance
        }
        static init() {
            let t = [{
                    name: "fight",
                    layer: c.Fight,
                    zOrder: 1100
                }, {
                    name: "main",
                    layer: c.Main,
                    zOrder: 1200
                }, {
                    name: "secondary",
                    layer: c.Secondary,
                    zOrder: 1300
                }, {
                    name: "fixui",
                    layer: c.Fixui,
                    zOrder: 1400
                }, {
                    name: "popup",
                    layer: c.Popup,
                    zOrder: 1500
                }, {
                    name: "effect",
                    layer: c.Effect,
                    zOrder: 1600
                }, {
                    name: "toast",
                    layer: c.Toast,
                    zOrder: 1700
                }, {
                    name: "loading",
                    layer: c.Loading,
                    zOrder: 1800
                }, {
                    name: "system",
                    layer: c.System,
                    zOrder: 1900
                }],
                e = (t.forEach(t => {
                    var e = new J(t);
                    Laya.stage.addChild(e), this._containers[t.layer] = e
                }), s._instance = new s);
            e.createMask(), e.crateFixui()
        }
        static add2Container(t, e) {
            let i = s._containers[e];
            i && i.addChild(t)
        }
        get fightLayer() {
            return s._containers[c.Fight]
        }
        get mainLayer() {
            return s._containers[c.Main]
        }
        get secondaryLayer() {
            return s._containers[c.Secondary]
        }
        get fixuiLayer() {
            return s._containers[c.Fixui]
        }
        get popupLayer() {
            return s._containers[c.Popup]
        }
        get effectLayer() {
            return s._containers[c.Effect]
        }
        get systemLayer() {
            return s._containers[c.System]
        }
        enableShield(t) {
            if (t) {
                if (!this._boxShield) {
                    let t = this._boxShield = new Laya.Box;
                    t.zOrder = 2e3, t.size(Laya.stage.width, Laya.stage.height), t.centerX = t.centerY = 0, t.mouseEnabled = !0
                }
                Laya.stage.addChild(this._boxShield)
            } else this._boxShield && this._boxShield.removeSelf()
        }
        show(e, i = c.Popup, t = $) {
            if (e && !e.destroyed)
                if (i == c.Main) this.add2Main(e, t);
                else if (i == c.Secondary) this.add2Secondary(e, t);
            else if (i == c.Popup) this.add2Popup(e, t);
            else {
                let t = s._containers[i];
                t.addChild(e)
            }
        }
        close(e, t = o.None, i) {
            if (e && !e.destroyed) {
                var s = e.parent;
                if (s) "secondary" == s.name ? this.checkSecondary(e) : "popup" == s.name && this.checkPopup(e);
                else {
                    for (let t = 0; t < this._secondaryDlgs.length; t++)
                        if (e == this._secondaryDlgs[t]) {
                            this._secondaryDlgs.splice(t, 1);
                            break
                        } for (let t = 0; t < this._popupDlgs.length; t++)
                        if (e == this._popupDlgs[t]) {
                            this._popupDlgs.splice(t, 1);
                            break
                        }
                }
                e.event(Laya.Event.CLOSE, i ? [t, i] : t), e.destroy()
            }
        }
        clearMain() {
            let t = this._mainDlgs;
            t.forEach(t => {
                t.destroy()
            }), this._mainDlgs.length = 0
        }
        add2Main(t, e) {
            let i = this._mainDlgs.pop();
            i && i.destroy(), this.mainLayer.addChild(t), this._mainDlgs.push(t)
        }
        add2Secondary(t, i) {
            if (t.hitTestPrior = !1, i.isInstant) {
                var s = this._secondaryDlgs.length;
                for (let e = 0; e < s; e++) {
                    let t = this._secondaryDlgs[e];
                    if (t instanceof i.cf) {
                        this._secondaryDlgs.splice(e, 1), t.destroy();
                        break
                    }
                }
            }
            if (i.hideCurrent) {
                var e = this._secondaryDlgs.length;
                let t = this._secondaryDlgs[e - 1];
                t && t.removeSelf()
            }
            this.secondaryLayer.addChild(t), this._secondaryDlgs.push(t), this.mainLayer.removeSelf()
        }
        add2Popup(t, e) {
            if (t.hitTestPrior = !1, e.clearPopup) this._popupDlgs.forEach(t => {
                t.event(Laya.Event.CLOSE, o.None), t.destroy()
            }), this._popupDlgs = [];
            else {
                var i = this._popupDlgs.length;
                let t = this._popupDlgs[i - 1];
                e.retainPopup ? t && (t.zOrder = -1) : t && t.removeSelf()
            }
            this.popupLayer.addChild(t), this._popupDlgs.push(t), t.zOrder = this._popupDlgs.length, e.showEffect && Laya.Tween.from(t, {
                alpha: 0,
                scaleX: .8,
                scaleY: .8
            }, 200, Laya.Ease.backOut), this._boxMask.visible = !0
        }
        checkSecondary(e) {
            for (let t = 0; t < this._secondaryDlgs.length; t++)
                if (e == this._secondaryDlgs[t]) {
                    this._secondaryDlgs.splice(t, 1);
                    break
                } var t = this._secondaryDlgs.length,
                t = this._secondaryDlgs[t - 1];
            t && this.secondaryLayer.addChild(t), 0 != this._secondaryDlgs.length || this.mainLayer.parent || Laya.stage.addChild(this.mainLayer)
        }
        getCurSecondaryDlg() {
            var t = this._secondaryDlgs.length;
            return this._secondaryDlgs[t - 1] || null
        }
        checkPopup(e) {
            for (let t = 0; t < this._popupDlgs.length; t++)
                if (e == this._popupDlgs[t]) {
                    this._popupDlgs.splice(t, 1);
                    break
                } var i = this._popupDlgs.length;
            if (i) {
                let t = this._popupDlgs[i - 1];
                t.zOrder = i, this.popupLayer.addChild(t)
            } else this._boxMask.visible = !1
        }
        removeTopPopup() {
            var t = this._popupDlgs.length,
                t = this._popupDlgs[t - 1];
            t.closeOnSide && this.close(t)
        }
        removeAllPopup() {
            this._popupDlgs.forEach(t => {
                t.event(Laya.Event.CLOSE, o.None), t.destroy()
            }), this._popupDlgs = [], this._boxMask.visible = !1
        }
        removeAllsecondary() {
            this._secondaryDlgs.forEach(t => {
                t.event(Laya.Event.CLOSE, o.None), t.destroy()
            }), this._secondaryDlgs = [], this.checkSecondary(null)
        }
        createMask() {
            let t = new Laya.Box;
            t.size(Laya.stage.width + 2, Laya.stage.height), t.bgColor = "#000000", t.zOrder = 0, t.alpha = .7, t.centerX = t.centerY = 0, t.visible = !1, t.mouseThrough = !1, t.mouseEnabled = !0, t.on(Laya.Event.CLICK, this, this.removeTopPopup), this._boxMask = t, this.popupLayer.addChild(t)
        }
        crateFixui() {
            if (!(Mmobay.adaptOffsetHeight <= 0)) {
                let t = .5 * Mmobay.adaptOffsetHeight,
                    e = (t < 80 && (t = 80), new Laya.Box),
                    i = (e.size(560, t), e.centerX = 0, e.top = -t, e.on(Laya.Event.CLICK, this, () => {
                        console.log("click top fixui")
                    }), this.fixuiLayer.addChild(e), new Laya.Image("cat/ui_comm/s9_po9.png")),
                    s = (i.sizeGrid = "1,1,1,1", i.left = i.right = 0, i.top = i.bottom = -2, e.addChild(i), new Laya.Image("cat/ui_comm/fix_flower.png")),
                    a = (s.bottom = 0, s.left = 65, s.scaleX = -1, e.addChild(s), new Laya.Image("cat/ui_comm/fix_flower.png")),
                    n = (a.bottom = 0, a.right = 0, e.addChild(a), new Laya.Box);
                n.size(560, t), n.centerX = 0, n.bottom = -t, n.on(Laya.Event.CLICK, this, () => {
                    console.log("click bottom fixui")
                }), this.fixuiLayer.addChild(n), (i = new Laya.Image("cat/ui_comm/s9_po9.png")).sizeGrid = "1,1,1,1", i.left = i.right = 0, i.top = i.bottom = -1, n.addChild(i), (s = new Laya.Image("cat/ui_comm/fix_flower.png")).scaleX = -1, s.left = 65, s.top = 0, n.addChild(s), (a = new Laya.Image("cat/ui_comm/fix_flower.png")).top = 0, a.right = 0, n.addChild(a)
            }
        }
    }
    s._containers = {}, window.DialogManager = s;
    class Z extends Laya.UIComponent {
        constructor(e, t = 0, i) {
            super();
            let s = 560,
                a = (0 < Mmobay.adaptOffsetWidth && (s += Mmobay.adaptOffsetWidth), this.size(s, 72), this.top = 0, this.centerX = 0, new G("cat/ui_comm/img_public_btn_back.png"));
            if (a.stateNum = 1, a.left = 7, a.centerY = 0, a.name = "Back", this.addChild(a), !i && e) {
                let t = new Laya.Label(e);
                t.fontSize = 24, t.x += 10, t.color = "#ffffff", t.centerX = t.centerY = 0, t.bold = !0, t.wordWrap = !0, t.width = 390, t.align = "center", this.addChild(t), this._txtInfo = t
            }
            this.mouseThrough = !0
        }
        update(t) {
            this._txtInfo.text = t
        }
    }
    class Q extends j {
        constructor() {
            super(...arguments), this.m_closeOnSide = !0
        }
        static get manager() {
            return s.instance
        }
        get closeOnSide() {
            return this.m_closeOnSide
        }
        set closeOnSide(t) {
            this.m_closeOnSide = t
        }
        get title() {
            return this._title
        }
        showDialog(t, e) {
            this.closeOnSide = e.closeOnSide, Q.manager.show(this, t, e)
        }
        closeDialog(t = o.No, e) {
            Q.manager.close(this, t, e)
        }
        wait() {
            return new Promise((i, t) => {
                this.once(Laya.Event.CLOSE, this, (t, e) => {
                    i({
                        type: t,
                        data: e
                    })
                })
            })
        }
        checkOpen() {
            return !0
        }
        addTitle(t, e, i) {
            this._title || (t = new Z(t, !!e, i), this._title = t, this.addChild(t))
        }
        updateTitle(t) {
            this._title && this._title.update(t)
        }
        onClickClose(t) {
            this.closeDialog()
        }
        onClickBack(t) {
            this.closeDialog()
        }
        onClickHelp(t) {}
    }
    var t, e = j,
        i = Q,
        h = Laya.ClassUtils.regClass,
        r = t = t || {};
    r = (r = r.cat || (r.cat = {})).views || (r.views = {});
    {
        r = r.common || (r.common = {});
        class Ii extends i {
            constructor() {
                super()
            }
            createChildren() {
                super.createChildren(), this.loadScene("cat/views/common/BuyItemDlg")
            }
        }
        r.BuyItemDlgUI = Ii, h("ui.cat.views.common.BuyItemDlgUI", Ii);
        class Ri extends i {
            constructor() {
                super()
            }
            createChildren() {
                super.createChildren(), this.loadScene("cat/views/common/CommRewardDlg")
            }
        }
        r.CommRewardDlgUI = Ri, h("ui.cat.views.common.CommRewardDlgUI", Ri);
        class Ti extends e {
            constructor() {
                super()
            }
            createChildren() {
                super.createChildren(), this.loadScene("cat/views/common/CountView")
            }
        }
        r.CountViewUI = Ti, h("ui.cat.views.common.CountViewUI", Ti);
        class Ei extends e {
            constructor() {
                super()
            }
            createChildren() {
                super.createChildren(), this.loadScene("cat/views/common/FingerView")
            }
        }
        r.FingerViewUI = Ei, h("ui.cat.views.common.FingerViewUI", Ei);
        class Ai extends e {
            constructor() {
                super()
            }
            createChildren() {
                super.createChildren(), this.loadScene("cat/views/common/FishCoinView")
            }
        }
        r.FishCoinViewUI = Ai, h("ui.cat.views.common.FishCoinViewUI", Ai);
        class Mi extends e {
            constructor() {
                super()
            }
            createChildren() {
                super.createChildren(), this.loadScene("cat/views/common/LoadingView")
            }
        }
        r.LoadingViewUI = Mi, h("ui.cat.views.common.LoadingViewUI", Mi);
        class Ni extends e {
            constructor() {
                super()
            }
            createChildren() {
                super.createChildren(), this.loadScene("cat/views/common/LvView")
            }
        }
        r.LvViewUI = Ni, h("ui.cat.views.common.LvViewUI", Ni);
        class Pi extends i {
            constructor() {
                super()
            }
            createChildren() {
                super.createChildren(), this.loadScene("cat/views/common/MsgBox")
            }
        }
        r.MsgBoxUI = Pi, h("ui.cat.views.common.MsgBoxUI", Pi);
        class Fi extends e {
            constructor() {
                super()
            }
            createChildren() {
                super.createChildren(), this.loadScene("cat/views/common/NewView")
            }
        }
        r.NewViewUI = Fi, h("ui.cat.views.common.NewViewUI", Fi);
        class Bi extends e {
            constructor() {
                super()
            }
            createChildren() {
                super.createChildren(), this.loadScene("cat/views/common/SystemNotice")
            }
        }
        r.SystemNoticeUI = Bi, h("ui.cat.views.common.SystemNoticeUI", Bi);
        class Ui extends e {
            constructor() {
                super()
            }
            createChildren() {
                super.createChildren(), this.loadScene("cat/views/common/ToastView")
            }
        }
        r.ToastViewUI = Ui, h("ui.cat.views.common.ToastViewUI", Ui);
        class Gi extends e {
            constructor() {
                super()
            }
            createChildren() {
                super.createChildren(), this.loadScene("cat/views/common/WifiView")
            }
        }
        r.WifiViewUI = Gi, h("ui.cat.views.common.WifiViewUI", Gi)
    }
    r = t = t || {};
    r = (r = r.cat || (r.cat = {})).views || (r.views = {});
    {
        r = r.entrance || (r.entrance = {});
        class qi extends e {
            constructor() {
                super()
            }
            createChildren() {
                super.createChildren(), this.loadScene("cat/views/entrance/GameEntrance")
            }
        }
        r.GameEntranceUI = qi, h("ui.cat.views.entrance.GameEntranceUI", qi)
    }
    r = t = t || {};
    r = (r = r.cat || (r.cat = {})).views || (r.views = {});
    {
        r = r.fish || (r.fish = {});
        class Oi extends i {
            constructor() {
                super()
            }
            createChildren() {
                super.createChildren(), this.loadScene("cat/views/fish/FishAutoDlg")
            }
        }
        r.FishAutoDlgUI = Oi, h("ui.cat.views.fish.FishAutoDlgUI", Oi);
        class Hi extends i {
            constructor() {
                super()
            }
            createChildren() {
                super.createChildren(), this.loadScene("cat/views/fish/FishDlg")
            }
        }
        r.FishDlgUI = Hi, h("ui.cat.views.fish.FishDlgUI", Hi);
        class Wi extends e {
            constructor() {
                super()
            }
            createChildren() {
                super.createChildren(), this.loadScene("cat/views/fish/FishHistoryCellView")
            }
        }
        r.FishHistoryCellViewUI = Wi, h("ui.cat.views.fish.FishHistoryCellViewUI", Wi);
        class Vi extends e {
            constructor() {
                super()
            }
            createChildren() {
                super.createChildren(), this.loadScene("cat/views/fish/FishItemView")
            }
        }
        r.FishItemViewUI = Vi, h("ui.cat.views.fish.FishItemViewUI", Vi);
        class Yi extends e {
            constructor() {
                super()
            }
            createChildren() {
                super.createChildren(), this.loadScene("cat/views/fish/FishRankCellView")
            }
        }
        r.FishRankCellViewUI = Yi, h("ui.cat.views.fish.FishRankCellViewUI", Yi);
        class Xi extends i {
            constructor() {
                super()
            }
            createChildren() {
                super.createChildren(), this.loadScene("cat/views/fish/FishRankDlg")
            }
        }
        r.FishRankDlgUI = Xi, h("ui.cat.views.fish.FishRankDlgUI", Xi);
        class zi extends e {
            constructor() {
                super()
            }
            createChildren() {
                super.createChildren(), this.loadScene("cat/views/fish/FishRewardDetailCellView")
            }
        }
        r.FishRewardDetailCellViewUI = zi, h("ui.cat.views.fish.FishRewardDetailCellViewUI", zi);
        class ji extends i {
            constructor() {
                super()
            }
            createChildren() {
                super.createChildren(), this.loadScene("cat/views/fish/FishRewardDetailDlg")
            }
        }
        r.FishRewardDetailDlgUI = ji, h("ui.cat.views.fish.FishRewardDetailDlgUI", ji);
        class $i extends i {
            constructor() {
                super()
            }
            createChildren() {
                super.createChildren(), this.loadScene("cat/views/fish/FishRewardDlg")
            }
        }
        r.FishRewardDlgUI = $i, h("ui.cat.views.fish.FishRewardDlgUI", $i);
        class Ki extends i {
            constructor() {
                super()
            }
            createChildren() {
                super.createChildren(), this.loadScene("cat/views/fish/FishRewardRuleDlg")
            }
        }
        r.FishRewardRuleDlgUI = Ki, h("ui.cat.views.fish.FishRewardRuleDlgUI", Ki);
        class Ji extends i {
            constructor() {
                super()
            }
            createChildren() {
                super.createChildren(), this.loadScene("cat/views/fish/FishRuleDlg")
            }
        }
        r.FishRuleDlgUI = Ji, h("ui.cat.views.fish.FishRuleDlgUI", Ji);
        class Zi extends i {
            constructor() {
                super()
            }
            createChildren() {
                super.createChildren(), this.loadScene("cat/views/fish/FishSuccDlg")
            }
        }
        r.FishSuccDlgUI = Zi, h("ui.cat.views.fish.FishSuccDlgUI", Zi);
        class Qi extends i {
            constructor() {
                super()
            }
            createChildren() {
                super.createChildren(), this.loadScene("cat/views/fish/FishUpgradeDlg")
            }
        }
        r.FishUpgradeDlgUI = Qi, h("ui.cat.views.fish.FishUpgradeDlgUI", Qi)
    }
    r = t = t || {};
    r = (r = r.cat || (r.cat = {})).views || (r.views = {});
    {
        r = r.home || (r.home = {});
        class ts extends i {
            constructor() {
                super()
            }
            createChildren() {
                super.createChildren(), this.loadScene("cat/views/home/AutoDlg")
            }
        }
        r.AutoDlgUI = ts, h("ui.cat.views.home.AutoDlgUI", ts);
        class es extends i {
            constructor() {
                super()
            }
            createChildren() {
                super.createChildren(), this.loadScene("cat/views/home/ChooseWalletDlg")
            }
        }
        r.ChooseWalletDlgUI = es, h("ui.cat.views.home.ChooseWalletDlgUI", es);
        class is extends i {
            constructor() {
                super()
            }
            createChildren() {
                super.createChildren(), this.loadScene("cat/views/home/FirstRechargeDlg")
            }
        }
        r.FirstRechargeDlgUI = is, h("ui.cat.views.home.FirstRechargeDlgUI", is);
        class ss extends i {
            constructor() {
                super()
            }
            createChildren() {
                super.createChildren(), this.loadScene("cat/views/home/OffLineDlg")
            }
        }
        r.OffLineDlgUI = ss, h("ui.cat.views.home.OffLineDlgUI", ss);
        class as extends i {
            constructor() {
                super()
            }
            createChildren() {
                super.createChildren(), this.loadScene("cat/views/home/OfficeDlg")
            }
        }
        r.OfficeDlgUI = as, h("ui.cat.views.home.OfficeDlgUI", as);
        class ns extends i {
            constructor() {
                super()
            }
            createChildren() {
                super.createChildren(), this.loadScene("cat/views/home/PurchaseMethodDlg")
            }
        }
        r.PurchaseMethodDlgUI = ns, h("ui.cat.views.home.PurchaseMethodDlgUI", ns);
        class os extends i {
            constructor() {
                super()
            }
            createChildren() {
                super.createChildren(), this.loadScene("cat/views/home/RandomEventsDlg")
            }
        }
        r.RandomEventsDlgUI = os, h("ui.cat.views.home.RandomEventsDlgUI", os);
        class hs extends e {
            constructor() {
                super()
            }
            createChildren() {
                super.createChildren(), this.loadScene("cat/views/home/ShopCellView")
            }
        }
        r.ShopCellViewUI = hs, h("ui.cat.views.home.ShopCellViewUI", hs);
        class rs extends i {
            constructor() {
                super()
            }
            createChildren() {
                super.createChildren(), this.loadScene("cat/views/home/ShopDlg")
            }
        }
        r.ShopDlgUI = rs, h("ui.cat.views.home.ShopDlgUI", rs);
        class ls extends i {
            constructor() {
                super()
            }
            createChildren() {
                super.createChildren(), this.loadScene("cat/views/home/SpeedDlg")
            }
        }
        r.SpeedDlgUI = ls, h("ui.cat.views.home.SpeedDlgUI", ls);
        class cs extends e {
            constructor() {
                super()
            }
            createChildren() {
                super.createChildren(), this.loadScene("cat/views/home/SumCatView")
            }
        }
        r.SumCatViewUI = cs, h("ui.cat.views.home.SumCatViewUI", cs);
        class ms extends i {
            constructor() {
                super()
            }
            createChildren() {
                super.createChildren(), this.loadScene("cat/views/home/UpGradeDlg")
            }
        }
        r.UpGradeDlgUI = ms, h("ui.cat.views.home.UpGradeDlgUI", ms)
    }
    r = t = t || {};
    r = (r = r.cat || (r.cat = {})).views || (r.views = {});
    {
        r = r.lunchPool || (r.lunchPool = {});
        class ds extends e {
            constructor() {
                super()
            }
            createChildren() {
                super.createChildren(), this.loadScene("cat/views/lunchPool/AssetCellView")
            }
        }
        r.AssetCellViewUI = ds, h("ui.cat.views.lunchPool.AssetCellViewUI", ds);
        class _s extends i {
            constructor() {
                super()
            }
            createChildren() {
                super.createChildren(), this.loadScene("cat/views/lunchPool/AssetsDlg")
            }
        }
        r.AssetsDlgUI = _s, h("ui.cat.views.lunchPool.AssetsDlgUI", _s);
        class us extends i {
            constructor() {
                super()
            }
            createChildren() {
                super.createChildren(), this.loadScene("cat/views/lunchPool/BoostMiningDlg")
            }
        }
        r.BoostMiningDlgUI = us, h("ui.cat.views.lunchPool.BoostMiningDlgUI", us);
        class gs extends e {
            constructor() {
                super()
            }
            createChildren() {
                super.createChildren(), this.loadScene("cat/views/lunchPool/LunchCellView")
            }
        }
        r.LunchCellViewUI = gs, h("ui.cat.views.lunchPool.LunchCellViewUI", gs);
        class ps extends e {
            constructor() {
                super()
            }
            createChildren() {
                super.createChildren(), this.loadScene("cat/views/lunchPool/LunchDetailView")
            }
        }
        r.LunchDetailViewUI = ps, h("ui.cat.views.lunchPool.LunchDetailViewUI", ps);
        class Cs extends i {
            constructor() {
                super()
            }
            createChildren() {
                super.createChildren(), this.loadScene("cat/views/lunchPool/LunchDlg")
            }
        }
        r.LunchDlgUI = Cs, h("ui.cat.views.lunchPool.LunchDlgUI", Cs);
        class ys extends e {
            constructor() {
                super()
            }
            createChildren() {
                super.createChildren(), this.loadScene("cat/views/lunchPool/LunchInfoView")
            }
        }
        r.LunchInfoViewUI = ys, h("ui.cat.views.lunchPool.LunchInfoViewUI", ys);
        class vs extends i {
            constructor() {
                super()
            }
            createChildren() {
                super.createChildren(), this.loadScene("cat/views/lunchPool/LunchListDlg")
            }
        }
        r.LunchListDlgUI = vs, h("ui.cat.views.lunchPool.LunchListDlgUI", vs);
        class fs extends i {
            constructor() {
                super()
            }
            createChildren() {
                super.createChildren(), this.loadScene("cat/views/lunchPool/StakeCatBackDlg")
            }
        }
        r.StakeCatBackDlgUI = fs, h("ui.cat.views.lunchPool.StakeCatBackDlgUI", fs);
        class bs extends i {
            constructor() {
                super()
            }
            createChildren() {
                super.createChildren(), this.loadScene("cat/views/lunchPool/StakeCatDlg")
            }
        }
        r.StakeCatDlgUI = bs, h("ui.cat.views.lunchPool.StakeCatDlgUI", bs);
        class ks extends i {
            constructor() {
                super()
            }
            createChildren() {
                super.createChildren(), this.loadScene("cat/views/lunchPool/StakeFishBackDlg")
            }
        }
        r.StakeFishBackDlgUI = ks, h("ui.cat.views.lunchPool.StakeFishBackDlgUI", ks);
        class ws extends i {
            constructor() {
                super()
            }
            createChildren() {
                super.createChildren(), this.loadScene("cat/views/lunchPool/StakeFishDlg")
            }
        }
        r.StakeFishDlgUI = ws, h("ui.cat.views.lunchPool.StakeFishDlgUI", ws)
    }
    r = t = t || {};
    r = (r = r.cat || (r.cat = {})).views || (r.views = {});
    {
        r = r.recharge || (r.recharge = {});
        class Ss extends e {
            constructor() {
                super()
            }
            createChildren() {
                super.createChildren(), this.loadScene("cat/views/recharge/RechargeCellView")
            }
        }
        r.RechargeCellViewUI = Ss, h("ui.cat.views.recharge.RechargeCellViewUI", Ss);
        class xs extends i {
            constructor() {
                super()
            }
            createChildren() {
                super.createChildren(), this.loadScene("cat/views/recharge/RechargeDlg")
            }
        }
        r.RechargeDlgUI = xs, h("ui.cat.views.recharge.RechargeDlgUI", xs);
        class Ls extends i {
            constructor() {
                super()
            }
            createChildren() {
                super.createChildren(), this.loadScene("cat/views/recharge/RechargeProcessingDlg")
            }
        }
        r.RechargeProcessingDlgUI = Ls, h("ui.cat.views.recharge.RechargeProcessingDlgUI", Ls);
        class Ds extends i {
            constructor() {
                super()
            }
            createChildren() {
                super.createChildren(), this.loadScene("cat/views/recharge/RechargeSuccessDlg")
            }
        }
        r.RechargeSuccessDlgUI = Ds, h("ui.cat.views.recharge.RechargeSuccessDlgUI", Ds)
    }
    r = t = t || {};
    r = (r = r.cat || (r.cat = {})).views || (r.views = {});
    {
        r = r.squad || (r.squad = {});
        class Is extends e {
            constructor() {
                super()
            }
            createChildren() {
                super.createChildren(), this.loadScene("cat/views/squad/BoostCellView")
            }
        }
        r.BoostCellViewUI = Is, h("ui.cat.views.squad.BoostCellViewUI", Is);
        class Rs extends i {
            constructor() {
                super()
            }
            createChildren() {
                super.createChildren(), this.loadScene("cat/views/squad/FrenZoneDlg")
            }
        }
        r.FrenZoneDlgUI = Rs, h("ui.cat.views.squad.FrenZoneDlgUI", Rs);
        class Ts extends e {
            constructor() {
                super()
            }
            createChildren() {
                super.createChildren(), this.loadScene("cat/views/squad/FriendCellView")
            }
        }
        r.FriendCellViewUI = Ts, h("ui.cat.views.squad.FriendCellViewUI", Ts);
        class Es extends e {
            constructor() {
                super()
            }
            createChildren() {
                super.createChildren(), this.loadScene("cat/views/squad/FriendInviteCellView")
            }
        }
        r.FriendInviteCellViewUI = Es, h("ui.cat.views.squad.FriendInviteCellViewUI", Es);
        class As extends e {
            constructor() {
                super()
            }
            createChildren() {
                super.createChildren(), this.loadScene("cat/views/squad/HeadView")
            }
        }
        r.HeadViewUI = As, h("ui.cat.views.squad.HeadViewUI", As);
        class Ms extends i {
            constructor() {
                super()
            }
            createChildren() {
                super.createChildren(), this.loadScene("cat/views/squad/InviteDetailShowDlg")
            }
        }
        r.InviteDetailShowDlgUI = Ms, h("ui.cat.views.squad.InviteDetailShowDlgUI", Ms);
        class Ns extends i {
            constructor() {
                super()
            }
            createChildren() {
                super.createChildren(), this.loadScene("cat/views/squad/InvitePartyKingsDlg")
            }
        }
        r.InvitePartyKingsDlgUI = Ns, h("ui.cat.views.squad.InvitePartyKingsDlgUI", Ns);
        class Ps extends i {
            constructor() {
                super()
            }
            createChildren() {
                super.createChildren(), this.loadScene("cat/views/squad/JoinSquadListDlg")
            }
        }
        r.JoinSquadListDlgUI = Ps, h("ui.cat.views.squad.JoinSquadListDlgUI", Ps);
        class Fs extends e {
            constructor() {
                super()
            }
            createChildren() {
                super.createChildren(), this.loadScene("cat/views/squad/RankCellView")
            }
        }
        r.RankCellViewUI = Fs, h("ui.cat.views.squad.RankCellViewUI", Fs);
        class Bs extends i {
            constructor() {
                super()
            }
            createChildren() {
                super.createChildren(), this.loadScene("cat/views/squad/SquadBoostDlg")
            }
        }
        r.SquadBoostDlgUI = Bs, h("ui.cat.views.squad.SquadBoostDlgUI", Bs);
        class Us extends e {
            constructor() {
                super()
            }
            createChildren() {
                super.createChildren(), this.loadScene("cat/views/squad/SquadCellView")
            }
        }
        r.SquadCellViewUI = Us, h("ui.cat.views.squad.SquadCellViewUI", Us);
        class Gs extends i {
            constructor() {
                super()
            }
            createChildren() {
                super.createChildren(), this.loadScene("cat/views/squad/SquadInfoDlg")
            }
        }
        r.SquadInfoDlgUI = Gs, h("ui.cat.views.squad.SquadInfoDlgUI", Gs);
        class qs extends i {
            constructor() {
                super()
            }
            createChildren() {
                super.createChildren(), this.loadScene("cat/views/squad/SquadRankListDlg")
            }
        }
        r.SquadRankListDlgUI = qs, h("ui.cat.views.squad.SquadRankListDlgUI", qs);
        class Os extends i {
            constructor() {
                super()
            }
            createChildren() {
                super.createChildren(), this.loadScene("cat/views/squad/TotalScoreDetailDlg")
            }
        }
        r.TotalScoreDetailDlgUI = Os, h("ui.cat.views.squad.TotalScoreDetailDlgUI", Os);
        class Hs extends i {
            constructor() {
                super()
            }
            createChildren() {
                super.createChildren(), this.loadScene("cat/views/squad/TotalScoreShowDlg")
            }
        }
        r.TotalScoreShowDlgUI = Hs, h("ui.cat.views.squad.TotalScoreShowDlgUI", Hs)
    }
    class l {}
    l.GAME_LOCKED = "onGameLockChange", l.DATA_LOADED = "onDataLoaded", l.ENTER_GAME = "onEnterGame", l.NET_DISCONNECTED = "onNetDisconnected", l.NET_RECONNECTED = "onNetReconnected", l.NET_RESTARTGAME = "onNetRestartGame", l.NET_TYPE_CHANGE = "onNetTypeChanged", l.REENTER_GAME = "onReEnterGame", l.CLUB_UPDATE = "onClubUpdate", l.CREATE_VIEW_DONE = "onCreateViewDone", l.FISHCOIN_CHANGE = "onFishCoinChange", l.COUNT_CHANGE = "onCountChange", l.UPDATE_FISH_SYS = "onUpdateFishSys", l.DO_CONTINUE_FISH = "onDoContinueFish", l.FISHDATA_CHANGE = "onFishDataChange", l.MOVE_CAT = "onMoveCat", l.CAT_MATCH = "onCatMatch", l.SHAKE_CAT = "onShakeCat", l.UPDATE_CAT = "onUpdateCat", l.MaxCAT_CHANGE = "onMaxCatChange", l.UPDATE_ITEM = "onUpdateItem", l.BUY_CAT = "onBuyCat", l.UPDATE_SPEED = "onUpdateSpeed", l.UPDATE_OUTPUT = "onUpdateOutPut", l.UPDATE_OFFLINEGOLD = "onUpdateOffLineGold", l.HOME_GOLD_ANI = "onHomeGoldAni", l.OPNE_AIR_DROP = "onOpenAirDrop", l.AIR_DROP = "onAirDrop", l.RANDOM_EVENT_TIME_CHANGE = "onRandomEventTimeChange", l.WALLET_CONNECTED = "onWalletConnected", l.WALLET_DISCONNECT = "onWalletDisconnect", l.RECHARGE_SUCCESS = "onRechargeSuccess", l.SPEED_FREE = "onSpeedFree", l.UPDATE_LUNCH = "onUpdateLunch", l.POOLBONUS = "onPoolBonus";
    class tt {
        constructor(t = 0) {
            this._delay = 0, this._queue = [], this._timerEnabled = !1, this._delay = t
        }
        static create(t) {
            t = new tt(t);
            return this._queues.pushOnce(t), t
        }
        add(t, e) {
            this._queue.push({
                item: t,
                cb: e
            }), this._timerEnabled || (Laya.timer.loop(this._delay, this, this.onTimer), this._timerEnabled = !0)
        }
        onTimer() {
            let e = this._queue;
            if (0 < e.length) {
                let t = e.shift();
                t.cb(t.item)
            }
            0 == e.length && (Laya.timer.clear(this, this.onTimer), this._timerEnabled = !1)
        }
        remove(e) {
            var t = this._queue.findIndex(t => t.item == e); - 1 != t && this._queue.splice(t, 1)
        }
        clear() {
            Laya.timer.clear(this, this.onTimer), tt._queues.remove(this), this._queue = []
        }
    }
    tt._queues = [];
    const et = {};
    let it = {};
    var m;
    const st = tt.create(1e3);
    let at, nt, ot, ht, rt, lt;

    function ct(t, e, i) {
        let s = new t(...(i || {}).params || []);
        return s.checkOpen() ? (i.cf = t, s.centerY = s.centerX = 0, -1 == t.name.indexOf("BattleView") && ut(), s.openView().then(() => (gt(), s.pivotX = s.width / 2, s.pivotY = s.height / 2, s.showDialog(e, i), s)).catch(() => (gt(), null))) : Promise.reject({
            code: -1,
            message: "еЉџиѓЅдёЌеЏЇејЂеђЇ"
        })
    }

    function mt(t) {
        t.loadingImpl && (at = t.loadingImpl), t.wifiImpl && (nt = t.wifiImpl), t.msgBoxImpl && (ot = t.msgBoxImpl), t.toastImpl && (ht = t.toastImpl), t.verifyPwdImpl && (rt = t.verifyPwdImpl), t.opCheckLimit && (lt = t.opCheckLimit), t.modelEventsDispatcher && (t = t.modelEventsDispatcher, X = t), s.init()
    }

    function d(t, e = $) {
        return null == e.isInstant && (e.isInstant = !0), ct(t, c.Secondary, e)
    }

    function _(t, e = $) {
        return null == e.closeOnSide && (e.closeOnSide = !0), null == e.showEffect && (e.showEffect = !0), ct(t, c.Popup, e)
    }

    function u(t, e) {
        let i = new t(...(e || {}).params || []);
        return i.openView().then(() => (Laya.timer.frameOnce(1, this, () => {
            e && e.dispatch && N.event(l.CREATE_VIEW_DONE)
        }), i))
    }

    function dt(t, e) {
        e != c.Popup && s.add2Container(t, e)
    }

    function _t(t) {
        return ct(ot, c.Popup, {
            params: [t],
            closeOnSide: !0,
            showEffect: !0,
            clearPopup: t.clearPopup
        }).then(t => t.wait())
    }

    function g(t) {
        t = [t];
        let e = new ht(...t);
        e.openView().then(() => {
            e.mouseEnabled = !1, e.mouseThrough = !0, dt(e, c.Toast)
        })
    }

    function ut() {
        return at.show(), () => {
            at.reduce()
        }
    }

    function gt() {
        at.clear()
    }

    function pt() {
        nt && nt.clear()
    }
    class Ct {
        constructor() {
            this.finished = !1, this.defaultTimeOut = 2e4, this.transId = 0, this.startTime = 0, this._timeOutNum = 0, this.timeoutMax = 5
        }
        static create() {
            return n.get(Ct._sign, Ct)
        }
        get timeout() {
            let t = this.defaultTimeOut;
            var e = this.opt;
            return t = e && e.timeout ? e.timeout : t
        }
        open(t, e, i, s) {
            this.resolve = t, this.reject = e, this.onClearHandler = i, (this.opt = s) && s.noLoading && 0 != s.silent || this.showLoading(), Laya.timer.once(this.timeout, this, this.onTimeOut)
        }
        clear() {
            this.startTime = 0, Laya.timer.clear(this, this.onTimeOut), this.finished = !0, this._timeOutNum = 0, this.loadingCloser && this.loadingCloser(), this.onClearHandler && this.onClearHandler.run(), st.remove(this);
            var t = this.opt;
            t && t.noLoading && 0 != t.silent || gt(), n.put(Ct._sign, this)
        }
        showLoading() {
            ut(), st.add(this, t => {})
        }
        onTimeOut() {
            var t = {
                code: 7,
                message: this.name + "req timeout!transId:" + this.transId,
                handled: !1
            };
            console.error(t), this.opt && this.opt.popTimeOut || (this.reject(t), this.clear())
        }
        resetTimeOut() {
            this._timeOutNum >= this.timeoutMax || (this._timeOutNum++, Laya.timer.clear(this, this.onTimeOut), Laya.timer.once(this.timeout, this, this.onTimeOut))
        }
        reset() {
            this.onClearHandler.recover(), this.onClearHandler = null, this.loadingCloser = null, this.resolve = null, this.reject = null, this.finished = !1, this.name = "", this._timeOutNum = 0, this.transId = 0, Laya.timer.clearAll(this)
        }
    }
    Ct._sign = "p_PendingReqItem", (e = m = m || {})[e.NoneType = 0] = "NoneType", e[e.ErrorAck = 1] = "ErrorAck", e[e.ServerStateNtf = 4] = "ServerStateNtf", e[e.HeartBeatReq = 5] = "HeartBeatReq", e[e.HeartBeatAck = 6] = "HeartBeatAck", e[e.CreateRoleReq = 11] = "CreateRoleReq", e[e.CreateRoleAck = 12] = "CreateRoleAck", e[e.EnterGameReq = 13] = "EnterGameReq", e[e.EnterGameAck = 14] = "EnterGameAck", e[e.CommandReq = 15] = "CommandReq", e[e.CommandAck = 16] = "CommandAck", e[e.UserInfoNtf = 18] = "UserInfoNtf", e[e.AccountInfoChangeNtf = 19] = "AccountInfoChangeNtf", e[e.MessageEventNtf = 20] = "MessageEventNtf", e[e.ItemChangeNtf = 26] = "ItemChangeNtf", e[e.GenerateCatReq = 27] = "GenerateCatReq", e[e.GenerateCatAck = 28] = "GenerateCatAck", e[e.MergeCatReq = 29] = "MergeCatReq", e[e.MergeCatAck = 30] = "MergeCatAck", e[e.GatherGoldReq = 31] = "GatherGoldReq", e[e.GatherGoldAck = 32] = "GatherGoldAck", e[e.DelCatReq = 33] = "DelCatReq", e[e.DelCatAck = 34] = "DelCatAck", e[e.SwitchPosCatReq = 35] = "SwitchPosCatReq", e[e.SwitchPosCatAck = 36] = "SwitchPosCatAck", e[e.BoostGoldReq = 37] = "BoostGoldReq", e[e.BoostGoldAck = 38] = "BoostGoldAck", e[e.GetOffLineGoldReq = 39] = "GetOffLineGoldReq", e[e.GetOffLineGoldAck = 40] = "GetOffLineGoldAck", e[e.GetAirDropCatReq = 41] = "GetAirDropCatReq", e[e.GetAirDropCatAck = 42] = "GetAirDropCatAck", e[e.BoostGoldNtf = 44] = "BoostGoldNtf", e[e.TokensInfoChangeNtf = 46] = "TokensInfoChangeNtf", e[e.GetFreeCatReq = 47] = "GetFreeCatReq", e[e.GetFreeCatAck = 48] = "GetFreeCatAck", e[e.RandomEventReq = 49] = "RandomEventReq", e[e.RandomEventAck = 50] = "RandomEventAck", e[e.GetRandomEventAwardReq = 51] = "GetRandomEventAwardReq", e[e.GetRandomEventAwardAck = 52] = "GetRandomEventAwardAck", e[e.GetRandomEventBoxReq = 53] = "GetRandomEventBoxReq", e[e.GetRandomEventBoxAck = 54] = "GetRandomEventBoxAck", e[e.MergeCatAutoReq = 55] = "MergeCatAutoReq", e[e.MergeCatAutoAck = 56] = "MergeCatAutoAck", e[e.RandomEventChangeNtf = 58] = "RandomEventChangeNtf", e[e.OffLineGoldNtf = 59] = "OffLineGoldNtf", e[e.SyncRechargeNtf = 98] = "SyncRechargeNtf", e[e.ReceiveRechargeReq = 99] = "ReceiveRechargeReq", e[e.ReceiveRechargeAck = 100] = "ReceiveRechargeAck", e[e.JoinClubReq = 103] = "JoinClubReq", e[e.JoinClubAck = 104] = "JoinClubAck", e[e.GetRecruitClubListReq = 105] = "GetRecruitClubListReq", e[e.GetRecruitClubListAck = 106] = "GetRecruitClubListAck", e[e.QuitClubReq = 107] = "QuitClubReq", e[e.QuitClubAck = 108] = "QuitClubAck", e[e.ClubMemberRankReq = 109] = "ClubMemberRankReq", e[e.ClubMemberRankAck = 110] = "ClubMemberRankAck", e[e.GetStatsReq = 111] = "GetStatsReq", e[e.GetStatsAck = 112] = "GetStatsAck", e[e.GetGoldRankListReq = 113] = "GetGoldRankListReq", e[e.GetGoldRankListAck = 114] = "GetGoldRankListAck", e[e.ClubInfoReq = 115] = "ClubInfoReq", e[e.ClubInfoAck = 116] = "ClubInfoAck", e[e.FrensInfoReq = 117] = "FrensInfoReq", e[e.FrensInfoAck = 118] = "FrensInfoAck", e[e.InviteRankListReq = 119] = "InviteRankListReq", e[e.InviteRankListAck = 120] = "InviteRankListAck", e[e.GetClubGoldRankListReq = 121] = "GetClubGoldRankListReq", e[e.GetClubGoldRankListAck = 122] = "GetClubGoldRankListAck", e[e.GetMyRankReq = 123] = "GetMyRankReq", e[e.GetMyRankAck = 124] = "GetMyRankAck", e[e.GoldChangeNtf = 126] = "GoldChangeNtf", e[e.FrensInviterDoubleInfoReq = 127] = "FrensInviterDoubleInfoReq", e[e.FrensInviterDoubleInfoAck = 128] = "FrensInviterDoubleInfoAck", e[e.CreateClubReq = 157] = "CreateClubReq", e[e.CreateClubAck = 158] = "CreateClubAck", e[e.ClubGroupUserNameReq = 159] = "ClubGroupUserNameReq", e[e.ClubGroupUserNameAck = 160] = "ClubGroupUserNameAck", e[e.ClubInfoNtf = 188] = "ClubInfoNtf", e[e.GetWalletAddrReq = 201] = "GetWalletAddrReq", e[e.GetWalletAddrAck = 202] = "GetWalletAddrAck", e[e.BindWalletReq = 203] = "BindWalletReq", e[e.BindWalletAck = 204] = "BindWalletAck", e[e.FishingReq = 251] = "FishingReq", e[e.FishingAck = 252] = "FishingAck", e[e.MyFishInfoReq = 253] = "MyFishInfoReq", e[e.MyFishInfoAck = 254] = "MyFishInfoAck", e[e.FishRankListReq = 255] = "FishRankListReq", e[e.FishRankListAck = 256] = "FishRankListAck", e[e.FishInfoReq = 257] = "FishInfoReq", e[e.FishInfoAck = 258] = "FishInfoAck", e[e.FishRewardPoolReq = 263] = "FishRewardPoolReq", e[e.FishRewardPoolAck = 264] = "FishRewardPoolAck", e[e.GetFishRankRewardReq = 265] = "GetFishRankRewardReq", e[e.GetFishRankRewardAck = 266] = "GetFishRankRewardAck", e[e.FishHistoryReq = 267] = "FishHistoryReq", e[e.FishHistoryAck = 268] = "FishHistoryAck", e[e.FishRodUpReq = 269] = "FishRodUpReq", e[e.FishRodUpAck = 270] = "FishRodUpAck", e[e.GetLaunchListReq = 301] = "GetLaunchListReq", e[e.GetLaunchListAck = 302] = "GetLaunchListAck", e[e.LaunchStakeReq = 303] = "LaunchStakeReq", e[e.LaunchStakeAck = 304] = "LaunchStakeAck", e[e.RetrieveStakeReq = 305] = "RetrieveStakeReq", e[e.RetrieveStakeAck = 306] = "RetrieveStakeAck", e[e.ReceiveLaunchProfitReq = 307] = "ReceiveLaunchProfitReq", e[e.ReceiveLaunchProfitAck = 308] = "ReceiveLaunchProfitAck", e[e.LaunchPoolBonusNtf = 310] = "LaunchPoolBonusNtf", e[e.TonExchangeRateReq = 565] = "TonExchangeRateReq", e[e.TonExchangeRateAck = 566] = "TonExchangeRateAck", e[e.RequestPrePayReq = 567] = "RequestPrePayReq", e[e.RequestPrePayAck = 568] = "RequestPrePayAck", e[e.RequestPayReq = 569] = "RequestPayReq", e[e.RequestPayAck = 570] = "RequestPayAck", e[e.CheckPayReq = 571] = "CheckPayReq", e[e.CheckPayAck = 572] = "CheckPayAck", e[e.PayClubBoosterReq = 573] = "PayClubBoosterReq", e[e.PayClubBoosterAck = 574] = "PayClubBoosterAck", e[e.BCCheckInReq = 575] = "BCCheckInReq", e[e.BCCheckInAck = 576] = "BCCheckInAck", e[e.SysMsgNtf = 602] = "SysMsgNtf", e[e.WatchMsgReq = 603] = "WatchMsgReq", e[e.WatchMsgAck = 604] = "WatchMsgAck", e[e.UnWatchMsgReq = 605] = "UnWatchMsgReq", e[e.UnWatchMsgAck = 606] = "UnWatchMsgAck", e[e.ExDataNtf = 2062] = "ExDataNtf";
    class yt extends Laya.EventDispatcher {
        constructor() {
            super(...arguments), this._pendingReq = {}, this._transId = 0, this._reconnectcount = 0, this._autoReconnect = !0, this._isConnected = !1, this._debugLog = Mmobay.MConfig.showNetLog, this._pingArr = []
        }
        get addr() {
            return this._addr
        }
        get autoReconnect() {
            return this._autoReconnect
        }
        get reconnectcount() {
            return this._reconnectcount
        }
        get isConnected() {
            return this._isConnected
        }
        set reconnectcount(t) {
            this._reconnectcount = t
        }
        set messageHandler(t) {
            this._messageHandler = t
        }
        get averagePing() {
            var t = this._pingArr.reduce((t, e) => t + e, 0) / this._pingArr.length;
            return Math.floor(t)
        }
        addMessageHandler(t) {
            this._messageHandler = Object.assign(this._messageHandler, t)
        }
        connect(t) {
            this._autoReconnect = !0, this._isConnected = !1, this._addr = t, console.log("new socket  by connect");
            let e = new window.WebSocket(t);
            e.binaryType = "arraybuffer", e.onerror = this.onError.bind(this), e.onopen = this.onOpen.bind(this), e.onclose = this.onClose.bind(this), e.onmessage = this.onMessage.bind(this), this.ws = e, this.clean()
        }
        disconnect(t) {
            this._autoReconnect = !!t, this._isConnected && (this._isConnected = !1, this.closeSocket(), console.log("socket clean by disconnect"), this.clean())
        }
        closeSocket() {
            this.ws.close(), this.ws.onerror = null, this.ws.onopen = null, this.ws.onclose = null, this.ws.onmessage = null
        }
        onOpen(t) {
            this._isConnected = !0, this.ws.binaryType = "arraybuffer", this.event(Laya.Event.OPEN, t)
        }
        onMessage(e) {
            var e = protobuf.util.newBuffer(e.data),
                e = pb.CSMessage.decode(e),
                i = m[e.cmdId];
            let s = pb[i];
            if (s) {
                var a = s.decode(e.body),
                    n = e.transId;
                this._debugLog && console.log(`net ack/ntf :  ${i}, ${e.cmdId}, ${e.transId}, ` + JSON.stringify(a));
                let t = this._messageHandler.onHookRecvPacket;
                t && t(a, n), this.handlerMessage(n, i, a)
            } else console.warn(i + " not find in pb")
        }
        handlerMessage(e, i, s) {
            let a = this._pendingReq[e];
            if (a) {
                var t;
                if (a.startTime && (t = Date.newDate().getTime() - a.startTime, 5 <= this._pingArr.length && this._pingArr.shift(), this._pingArr.push(t)), s.constructor.name == pb.ErrorAck.name && 0 != s.code) {
                    let t = {
                        code: s.code,
                        langId: s.langId,
                        handled: !1
                    };
                    a.reject(t), Laya.timer.callLater(this, () => {
                        t.handled || (it.errorSpawnImpl(t.code, t.langId), t.handled = !0)
                    })
                } else a.resolve(s);
                a.clear()
            } else {
                let t = this._messageHandler["on" + i];
                t ? Promise.resolve().then(() => {
                    t(s, e)
                }) : this._messageHandler.onUnknownPacket && this._messageHandler.onUnknownPacket(s, e)
            }
        }
        onClose(t) {
            this._isConnected = !1, console.log("socket clean by onClose"), this.clean(), this.event(Laya.Event.CLOSE, t)
        }
        onError(t) {
            this._isConnected = !1, console.log("socket clean by onError"), this.clean(), this.event(Laya.Event.ERROR, t)
        }
        send(t, e) {
            if (!this._isConnected || 1 < this.ws.readyState) return 0;
            let i = pb.CSMessage.create();
            i.cmdId = e, i.transId = this._transId;
            e = m[e];
            i.body = pb[e].encode(t).finish();
            let s = pb.CSMessage.encode(i).finish(),
                a = (Laya.Browser.onWeiXin ? this.ws.send(s.slice().buffer) : this.ws.send(s), this._debugLog && console.log("net req :", e, i.cmdId, i.transId, t), this._messageHandler.onHookSendPacket);
            return a && a(t, 0), this._transId
        }
        sendAndWait(o, h, t, r) {
            return new Promise((i, s) => {
                var a = ++this._transId,
                    n = this.send(o, h);
                if (0 == n) s({
                    code: 6,
                    message: "Network disconnected"
                });
                else {
                    if (-1 == n) return it.errorSpawnImpl(5, "message too long"), void s({
                        code: 5,
                        message: "message too long"
                    });
                    let t = this._messageHandler.onHookSendPacket;
                    t && t(o, a);
                    n = m[h];
                    let e = Ct.create();
                    e.transId = a, e.name = n, e.startTime = Date.newDate().getTime(), e.open(i, s, Laya.Handler.create(this, this.clearPendingReq, [a]), r), this._pendingReq[a] = e
                }
            })
        }
        clearPendingReq(t) {
            delete this._pendingReq[t]
        }
        clean(e = !0) {
            for (var i in this._transId = 0, this._pendingReq) {
                let t = this._pendingReq[i];
                t && (i = {
                    code: 6,
                    message: t.name + " network disconnected"
                }, console.error(i), e && t.reject(i), t.clear())
            }
            this._pendingReq = {}
        }
        reset() {
            this.offAll(), this.disconnect(), this._autoReconnect = !0, this._isConnected = !1
        }
    }
    const vt = tt.create(200);
    class ft extends Laya.EventDispatcher {
        constructor() {
            super(...arguments), this._http = new Laya.Browser.window.XMLHttpRequest
        }
        static create(t) {
            let e = n.get(ft._sign, ft);
            return null == t.noLoading && (t.noLoading = !0), t.noLoading || t.silent || !it.loadingImpl || (e._showLoadingItem = {
                finished: !1
            }, vt.add(e._showLoadingItem, t => {
                t.finished || (t.loadingCloser = it.loadingImpl())
            })), e._retryTimes = t.retryTimes || 0, e._opt = t || et, e
        }
        get status() {
            return this._http.status
        }
        send(t, e = null, i = "get", s = "text", a = null) {
            this._requestInfo = {
                url: t,
                data: e,
                method: i,
                responseType: s,
                headers: a
            }, this.doSend()
        }
        doSend() {
            let {
                url: t,
                data: e,
                method: i,
                responseType: s,
                headers: a
            } = this._requestInfo, n = (this._responseType = s, this._data = null, this._http);
            if ("get" == i && (t += "?" + e), n.open(i, t, !0), a)
                for (let t = 0; t < a.length - 1; t += 2) n.setRequestHeader(a[t], a[t + 1]);
            else e && "string" != typeof e ? n.setRequestHeader("Content-Type", "application/json") : n.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
            n.responseType = "arraybuffer" !== s ? "text" : "arraybuffer", n.onerror = t => this.onError(t), n.onload = t => this.onLoad(t), "get" == i ? n.send() : n.send(e)
        }
        onLoad(t) {
            var e = this._http,
                i = void 0 !== e.status ? e.status : 200;
            200 === i || 204 === i || 266 === i || 0 === i ? this.complete() : this.error("[" + e.status + "]" + e.statusText + ":" + e.responseURL)
        }
        onError(t) {
            if (0 < this._retryTimes) return this._retryTimes--, void Laya.timer.once(this._opt.retryInterval || 1e3, this, this.doSend);
            this.error("Request failed Status:" + this._http.status + " text:" + this._http.statusText)
        }
        complete() {
            this.clear();
            let e = !0;
            try {
                var t = this._http;
                "json" === this._responseType ? this._data = JSON.parse(t.responseText) : "xml" === this._responseType ? this._data = Laya.Utils.parseXMLFromString(t.responseText) : this._data = t.response || t.responseText
            } catch (t) {
                e = !1, this.error(t.message)
            }
            e && this.event(Laya.Event.COMPLETE, Array.isArray(this._data) ? [this._data] : this._data)
        }
        error(t) {
            this.clear(), this.event(Laya.Event.ERROR, t)
        }
        clear() {
            let t = this._http,
                e = this._showLoadingItem;
            e && (e.finished = !0, e.loadingCloser && e.loadingCloser()), this._showLoadingItem = null, t.onerror = t.onload = null
        }
        reset() {
            this.offAll(), Laya.timer.clear(this, this.doSend), this._requestInfo = null, this._responseType = null, this._data = null, this._showLoadingItem = null, this._opt = null, this._retryTimes = 0
        }
        release() {
            0 < this._retryTimes || n.put(ft._sign, this)
        }
    }
    ft._sign = "p_HttpRequest";
    const bt = "yyyy/mm/dd HH:MM:ss",
        kt = /d{1,4}|m{1,4}|yy(?:yy)?|([HhMs])\1?|[LloSZWN]/g;

    function wt(t, e = bt) {
        let i = !1;
        "u" == e.charAt(0) && (e = e.slice(1), i = !0);
        "g" == e.charAt(0) && (e = e.slice(1));
        var s = i ? "getUTC" : "get",
            a = t[s + "Date"](),
            n = (t[s + "Day"](), t[s + "Month"]()),
            o = t[s + "FullYear"](),
            h = t[s + "Hours"](),
            r = t[s + "Minutes"](),
            l = t[s + "Seconds"]();
        t[s + "Milliseconds"](), i || t.getTimezoneOffset();
        let c = {
            d: a,
            dd: St(a),
            m: n + 1,
            mm: St(n + 1),
            yy: String(o).slice(2),
            yyyy: o,
            h: h % 12 || 12,
            hh: St(h % 12 || 12),
            H: h,
            HH: St(h),
            M: r,
            MM: St(r),
            s: l,
            ss: St(l)
        };
        return e = e.replace(kt, t => "mm" == t || "dd" == t ? +c[t] + "" : c[t])
    }

    function St(t, e = 2) {
        let i = String(t);
        for (; i.length < e;) i = "0" + i;
        return i
    }
    let xt = {
        booster: 1,
        randomEvent: 2,
        randomEventOffLine: 3
    };
    let Lt = {
            clubBooster: 1e4,
            booster: 10001,
            randomEventTime: 10002,
            randomEventBox: 10003,
            randomEventBoxOffLine: 10004
        },
        Dt = {
            normalGoods: 1,
            clubBooster: 2,
            bcCheckIn: 3,
            onlyOnceGoods: 4
        },
        It = {
            en: 1,
            tc: 2,
            jp: 3,
            vi: 4,
            ko: 5,
            fr: 6,
            ptbr: 7,
            tr: 8,
            ru: 9,
            es: 10,
            th: 11,
            ind: 12
        };
    let Rt = {
            roll: 1,
            fish: 2
        },
        Tt = {
            lang: 1,
            copper: 2,
            fishweight: 3,
            fishcoin: 4
        },
        Et = {
            ban: 1,
            forbidTalk: 2
        },
        At = {
            close: 1,
            free: 2,
            chain: 3,
            fishCoin: 4
        },
        Mt = {
            box: 1,
            multiple: 2
        },
        Nt = {
            client: 1,
            gateway: 2,
            game: 3,
            gamedb: 4,
            world: 5,
            login: 6,
            tgbot: 7,
            gmt: 8,
            hybrid: 9,
            pay: 10,
            rank: 11,
            task: 12
        };
    let Pt = {
        fish: 1
    };
    let Ft = {
        0: 1e3,
        1: 1001,
        2: 1002,
        3: 1003,
        4: 1004,
        5: 1045,
        6: 1046
    };

    function Bt(t) {
        return (t += "").replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    }
    var p, C, Ut, y, Gt;
    let qt = {
        cn: "й‡ЌеђЇжёёж€ЏеђЋз”џж•€",
        en: "It will take effect after restarting the game",
        jp: "г‚Ігѓјгѓ г‚’е†Ќиµ·е‹•гЃ—гЃ¦жњ‰еЉ№еЊ–гЃ™г‚‹",
        tc: "й‡Ќе•“йЃЉж€ІеѕЊз”џж•€",
        vi: "CГі hiб»‡u lб»±c sau khi khб»џi Д‘б»™ng lбєЎi trГІ chЖЎi",
        ko: "кІЊмћ„ мћ¬м‹њмћ‘ м‹њ м Ѓмљ©",
        fr: "RedГ©marrer pour prendre effet",
        ptbr: "Reinicie para entrar em efeito",
        tr: "GeГ§erli olmasД± iГ§in yeniden baЕџlat",
        ru: "РџРµСЂРµР·Р°РїСѓСЃС‚РёС‚Рµ, С‡С‚РѕР±С‹ РёР·РјРµРЅРµРЅРёСЏ РІСЃС‚СѓРїРёР»Рё РІ СЃРёР»Сѓ",
        es: "ReiniciaВ paraВ queВ tengaВ efecto",
        th: "аёЎаёµаёњаёҐаё«аёҐаё±аё‡аё€аёІаёЃаёЈаёµаёЄаё•аёІаёЈа№Њаё—а№ЂаёЃаёЎа№ѓаё«аёЎа№€",
        ind: "BukaВ ulangВ gameВ agarВ perubahanВ dapatВ berlaku."
    };

    function v(t, ...e) {
        let i = "en";
        for (const a in It)
            if (Mmobay.Utils.getLanguage() == It[a]) {
                i = a;
                break
            } let s = function(t, e) {
            if (2064 == t) return qt[e] || qt.en || "";
            let i = "";
            switch (e) {
                case "en":
                    var s = Data.getLang(t);
                    s && (i = s.en);
                    break;
                case "jp":
                    s = Data.getLangJP && Data.getLangJP(t);
                    s && (i = s.jp);
                    break;
                case "cn":
                    s = Data.getLangCN && Data.getLangCN(t);
                    s && (i = s.cn);
                    break;
                case "tc":
                    s = Data.getLangTC && Data.getLangTC(t);
                    s && (i = s.tc);
                    break;
                case "vi":
                    s = Data.getLangVI && Data.getLangVI(t);
                    s && (i = s.vi);
                    break;
                case "ko":
                    s = Data.getLangKO && Data.getLangKO(t);
                    s && (i = s.ko);
                    break;
                case "fr":
                    s = Data.getLangFR && Data.getLangFR(t);
                    s && (i = s.fr);
                    break;
                case "ptbr":
                    s = Data.getLangPTBR && Data.getLangPTBR(t);
                    s && (i = s.ptbr);
                    break;
                case "tr":
                    s = Data.getLangTR && Data.getLangTR(t);
                    s && (i = s.tr);
                    break;
                case "ru":
                    s = Data.getLangRU && Data.getLangRU(t);
                    s && (i = s.ru);
                    break;
                case "es":
                    s = Data.getLangES && Data.getLangES(t);
                    s && (i = s.es);
                    break;
                case "th":
                    s = Data.getLangTH && Data.getLangTH(t);
                    s && (i = s.th);
                    break;
                case "ind":
                    s = Data.getLangIND && Data.getLangIND(t);
                    s && (i = s.ind)
            }
            return i = "" == i && (e = Data.getLang(t)) ? e.en : i
        }(t, i);
        return s ? 0 < e.length ? s.format.apply(s, e) : s : ""
    }

    function Ot(t, e, i, s) {
        t -= i, i = e - s;
        return Math.sqrt(t * t + i * i)
    }

    function Ht(s, e, a, n, o, h) {
        var r = [.3 * 1.5, .75, .6 * 1.5, .75];
        for (let t = 0; t < e; t++) {
            var l = .1 * Math.randRange(8, 10),
                l = [150, 600 * l, 400 * l];
            let t = new Laya.Image,
                e = (h ? h.addChild(t) : dt(t, c.Effect), t.anchorX = t.anchorY = .5, t.scale(r[0], r[0]), t.skin = s, t.pos(a.x, a.y), new Laya.TimeLine),
                i = new Laya.TimeLine;
            e.to(t, {
                scaleX: r[1],
                scaleY: r[1]
            }, l[0]).to(t, {
                y: t.y - Math.randRange(0, 100),
                x: t.x + Math.randRange(-100, 100),
                scaleX: r[2],
                scaleY: r[2]
            }, l[1], Laya.Ease.circOut).to(t, {
                x: n.x,
                y: n.y,
                scaleX: r[3],
                scaleY: r[3]
            }, l[2], null), e.once(Laya.Event.COMPLETE, null, () => {
                i.destroy(), e.destroy(), t.destroy(), o && o()
            }), t.onDestroy = () => {
                e.total && e.destroy(), i.total && i.destroy()
            }, e.play(0, !1)
        }
    }

    function Wt(t) {
        let e = t.toString(),
            i = "",
            s = e.length;
        for (; 0 < s;) i = e.slice(Math.max(s - 3, 0), s) + i, 0 < (s -= 3) && (i = "," + i);
        return i
    }

    function f(t) {
        var e = Math.ceil(Math.log10(t));
        if (e <= 6) return t;
        if (6 < e && e <= 9) return Math.floor(t / Math.pow(10, 3)) + "K";
        if (e <= 12) return Math.floor(t / Math.pow(10, 6)) + "M";
        if (e <= 15) return Math.floor(t / Math.pow(10, 9)) + "B";
        if (e <= 18) return Math.floor(t / Math.pow(10, 12)) + "T";
        if (e <= 21) return Math.floor(t / Math.pow(10, 15)) + "Q";
        var i = ["a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m", "n", "o", "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z"];
        let s = [];
        var e = Math.floor((e - 22) / 3),
            a = e / i.length;
        return s[1] = Math.floor(a), s[0] = e - Math.floor(a) * i.length, Math.floor(t / Math.pow(10, 18) / Math.pow(10, 26 * s[1] * 3) / Math.pow(10, 3 * s[0])) + "" + i[s[1]] + i[s[0]]
    }

    function Vt() {
        return (window.GameUrlParas || {}).botname
    }

    function Yt(t) {
        window.Telegram && window.Telegram.WebApp.openTelegramLink(t)
    }

    function Xt() {
        window.Telegram && window.Telegram.WebApp.close()
    }

    function zt() {
        window.Telegram && window.Telegram.WebApp.disableClosingConfirmation()
    }

    function jt() {
        let t = Date.newDate();
        return t.setMinutes(0, 0, 0), t.setHours(t.getHours() + 1, 0), t.getTime()
    }

    function $t(t) {
        var t = t.split("."),
            e = t[1] || 0;
        return Intl.NumberFormat().format(+t[0]) + "." + e
    }(i = p = p || {})[i.Succ = 0] = "Succ", i[i.Unkown = 1] = "Unkown", i[i.SysError = 2] = "SysError", i[i.ParamsError = 3] = "ParamsError", i[i.ConfigError = 4] = "ConfigError", i[i.NetError = 5] = "NetError", i[i.NetDisconnect = 6] = "NetDisconnect", i[i.ReqTimeout = 7] = "ReqTimeout", i[i.ConnectTimeout = 8] = "ConnectTimeout", i[i.PwdError = 9] = "PwdError", i[i.NoRole = 10] = "NoRole", i[i.NoAccount = 11] = "NoAccount", i[i.DupAccount = 12] = "DupAccount", i[i.FuncNotOpen = 13] = "FuncNotOpen", i[i.OtherLogined = 14] = "OtherLogined", i[i.ItemNotEnough = 15] = "ItemNotEnough", i[i.EatMax = 16] = "EatMax", i[i.LvlMax = 17] = "LvlMax", i[i.CantBuySelfGoods = 18] = "CantBuySelfGoods", i[i.GoodsPriceError = 19] = "GoodsPriceError", i[i.NoGoods = 20] = "NoGoods", i[i.TradeNumLiimit = 21] = "TradeNumLiimit", i[i.NotYourGoods = 22] = "NotYourGoods", i[i.GoodsSold = 23] = "GoodsSold", i[i.CopperNotEnough = 24] = "CopperNotEnough", i[i.TradeError = 25] = "TradeError", i[i.PlayerNotEnough = 26] = "PlayerNotEnough", i[i.InvalidData = 27] = "InvalidData", i[i.NoData = 28] = "NoData", i[i.AbnormalData = 29] = "AbnormalData", i[i.HasGot = 30] = "HasGot", i[i.Nonstandard = 31] = "Nonstandard", i[i.NoUserData = 32] = "NoUserData", i[i.NoItem = 33] = "NoItem", i[i.IsAct = 34] = "IsAct", i[i.NotAct = 35] = "NotAct", i[i.LvMax = 36] = "LvMax", i[i.NoClub = 37] = "NoClub", i[i.WaitClubCheck = 38] = "WaitClubCheck", i[i.ClubMbSizeLimit = 39] = "ClubMbSizeLimit", i[i.NoPrivileges = 40] = "NoPrivileges", i[i.HadClub = 41] = "HadClub", i[i.ClubApplied = 42] = "ClubApplied", i[i.ViceChairmanFull = 43] = "ViceChairmanFull", i[i.ClubNameDup = 44] = "ClubNameDup", i[i.MemberOffClub = 45] = "MemberOffClub", i[i.ChairmanCantOff = 46] = "ChairmanCantOff", i[i.IllegalRequest = 47] = "IllegalRequest", i[i.CantEquipArms = 48] = "CantEquipArms", i[i.InCD = 49] = "InCD", i[i.CreateRoleErr = 50] = "CreateRoleErr", i[i.ClubErr = 51] = "ClubErr", i[i.TradeErr = 52] = "TradeErr", i[i.WorldServerErr = 53] = "WorldServerErr", i[i.DBServerErr = 54] = "DBServerErr", i[i.PassUnable = 55] = "PassUnable", i[i.vitMax = 56] = "vitMax", i[i.soldOut = 57] = "soldOut", i[i.vitNotEnough = 58] = "vitNotEnough", i[i.InBattle = 59] = "InBattle", i[i.MCNotEnough = 60] = "MCNotEnough", i[i.TapTokenNotEnough = 61] = "TapTokenNotEnough", i[i.NoWearSkin = 62] = "NoWearSkin", i[i.NoSkin = 63] = "NoSkin", i[i.NoHero = 64] = "NoHero", i[i.UpLvLimit = 65] = "UpLvLimit", i[i.InputTooLong = 66] = "InputTooLong", i[i.IllegalChar = 67] = "IllegalChar", i[i.IsUsed = 68] = "IsUsed", i[i.CodeIsUsed = 69] = "CodeIsUsed", i[i.MailServerErr = 70] = "MailServerErr", i[i.WalletIsBind = 71] = "WalletIsBind", i[i.WalletBindFail = 72] = "WalletBindFail", i[i.WalletError = 73] = "WalletError", i[i.HasBindWallet = 74] = "HasBindWallet", i[i.InSettle = 75] = "InSettle", i[i.BanAccount = 76] = "BanAccount", i[i.BeKickoff = 77] = "BeKickoff", i[i.MapOver = 78] = "MapOver", i[i.NoTimes = 79] = "NoTimes", i[i.CannotBuy = 80] = "CannotBuy", i[i.GameOutTime = 81] = "GameOutTime", i[i.SessExpire = 82] = "SessExpire", i[i.NoBindWallet = 83] = "NoBindWallet", i[i.ItemReturned = 84] = "ItemReturned", i[i.PaymentSuccess = 85] = "PaymentSuccess", i[i.PaymentFail = 86] = "PaymentFail", i[i.NotSupportPurchase = 87] = "NotSupportPurchase", i[i.BindingSuccess = 88] = "BindingSuccess", i[i.MailSendSuccess = 89] = "MailSendSuccess", i[i.AccountBound = 90] = "AccountBound", i[i.LoginFail = 91] = "LoginFail", i[i.LoginSuccess = 92] = "LoginSuccess", i[i.ActivityOver = 93] = "ActivityOver", i[i.HasTeam = 94] = "HasTeam", i[i.NoTeam = 95] = "NoTeam", i[i.TeamMemberMax = 96] = "TeamMemberMax", i[i.TeamBattling = 97] = "TeamBattling", i[i.OnlyLeaderCanDo = 98] = "OnlyLeaderCanDo", i[i.NoTeamMember = 99] = "NoTeamMember", i[i.RankRewardOver = 100] = "RankRewardOver", i[i.CannotJoin = 101] = "CannotJoin", i[i.AccountNameInvalid = 102] = "AccountNameInvalid", i[i.PwdInvalid = 103] = "PwdInvalid", i[i.AccessDenied = 104] = "AccessDenied", i[i.WalletSignError = 105] = "WalletSignError", i[i.Maintain = 106] = "Maintain", i[i.WalletVerifyFail = 107] = "WalletVerifyFail", i[i.SecurityPwdInvalid = 108] = "SecurityPwdInvalid", i[i.PleaseSetSecurityPwd = 109] = "PleaseSetSecurityPwd", i[i.AlreadyOpenSkipPwd = 110] = "AlreadyOpenSkipPwd", i[i.NotOpenSkipPwd = 111] = "NotOpenSkipPwd", i[i.IsSet = 112] = "IsSet", i[i.NoTimesToday = 113] = "NoTimesToday", i[i.Cd12Hours = 114] = "Cd12Hours", i[i.Cd24Hours = 115] = "Cd24Hours", i[i.VerifyCodeError = 116] = "VerifyCodeError", i[i.TodayMaxWinCount = 117] = "TodayMaxWinCount", i[i.EmailBeBoundWeb = 118] = "EmailBeBoundWeb", i[i.EmailDupBindError = 119] = "EmailDupBindError", i[i.EleNotEnough = 120] = "EleNotEnough", i[i.ChatServerErr = 121] = "ChatServerErr", i[i.ForbidTalk = 122] = "ForbidTalk", i[i.MonthCardActived = 123] = "MonthCardActived", i[i.InvalidCode = 124] = "InvalidCode", i[i.ExpireCode = 125] = "ExpireCode", i[i.EmailBeBoundHasAsset = 126] = "EmailBeBoundHasAsset", i[i.EmailNotBound = 127] = "EmailNotBound", i[i.FantasyNotEnough = 128] = "FantasyNotEnough", i[i.SkinNoEle = 129] = "SkinNoEle", i[i.CanNotClearSP = 130] = "CanNotClearSP", i[i.ApprovalPending = 131] = "ApprovalPending", i[i.NotUser = 132] = "NotUser", i[i.NotAddFriendSelf = 133] = "NotAddFriendSelf", i[i.UnFriend = 134] = "UnFriend", i[i.FriendMax = 135] = "FriendMax", i[i.FriendExist = 136] = "FriendExist", i[i.NotWearSameTypeRune = 137] = "NotWearSameTypeRune", i[i.NotWearRuneRough = 138] = "NotWearRuneRough", i[i.NotResetRuneRough = 139] = "NotResetRuneRough", i[i.TooFarAway = 140] = "TooFarAway", i[i.VigorNotEnough = 141] = "VigorNotEnough", i[i.VigorMax = 142] = "VigorMax", i[i.DurableNotEnough = 143] = "DurableNotEnough", i[i.DurableMax = 144] = "DurableMax", i[i.TreasureNow = 145] = "TreasureNow", i[i.TransferBufFail = 146] = "TransferBufFail", i[i.NotOpenMap = 147] = "NotOpenMap", i[i.FFriendMax = 148] = "FFriendMax", i[i.InLive = 149] = "InLive", i[i.WebAccountBeBound = 150] = "WebAccountBeBound", i[i.GameAccountBeBound = 151] = "GameAccountBeBound", i[i.SeasonOver = 152] = "SeasonOver", i[i.BattleEnd = 153] = "BattleEnd", i[i.DiamondNotEnough = 154] = "DiamondNotEnough", i[i.WealthNotEnough = 155] = "WealthNotEnough", i[i.NoSeats = 156] = "NoSeats", i[i.KittyNotEnough = 157] = "KittyNotEnough", i[i.FishNotEntough = 158] = "FishNotEntough", i[i.GoodsOnceBuy = 160] = "GoodsOnceBuy", i[i.ItemGone = 161] = "ItemGone", i[i.ClubNotExist = 162] = "ClubNotExist", i[i.ClubOnList = 163] = "ClubOnList", i[i.RankServerErr = 164] = "RankServerErr", (r = C = C || {})[r.Succ = 1] = "Succ", r[r.Unkown = 2] = "Unkown", r[r.SysError = 3] = "SysError", r[r.ParamsError = 4] = "ParamsError", r[r.ConfigError = 5] = "ConfigError", r[r.NetError = 6] = "NetError", r[r.NetDisconnect = 7] = "NetDisconnect", r[r.ReqTimeout = 8] = "ReqTimeout", r[r.ConnectTimeout = 9] = "ConnectTimeout", r[r.PwdError = 10] = "PwdError", r[r.NoRole = 11] = "NoRole", r[r.NoAccount = 12] = "NoAccount", r[r.DupAccount = 13] = "DupAccount", r[r.FuncNotOpen = 14] = "FuncNotOpen", r[r.OtherLogined = 15] = "OtherLogined", r[r.ItemNotEnough = 16] = "ItemNotEnough", r[r.EatMax = 17] = "EatMax", r[r.LvlMax = 18] = "LvlMax", r[r.CantBuySelfGoods = 19] = "CantBuySelfGoods", r[r.GoodsPriceError = 20] = "GoodsPriceError", r[r.NoGoods = 21] = "NoGoods", r[r.TradeNumLiimit = 22] = "TradeNumLiimit", r[r.NotYourGoods = 23] = "NotYourGoods", r[r.GoodsSold = 24] = "GoodsSold", r[r.CopperNotEnough = 25] = "CopperNotEnough", r[r.TradeError = 26] = "TradeError", r[r.PlayerNotEnough = 27] = "PlayerNotEnough", r[r.InvalidData = 28] = "InvalidData", r[r.NoData = 29] = "NoData", r[r.AbnormalData = 30] = "AbnormalData", r[r.HasGot = 31] = "HasGot", r[r.Nonstandard = 32] = "Nonstandard", r[r.NoUserData = 33] = "NoUserData", r[r.NoItem = 34] = "NoItem", r[r.IsAct = 35] = "IsAct", r[r.NotAct = 36] = "NotAct", r[r.LvMax = 37] = "LvMax", r[r.NoClub = 38] = "NoClub", r[r.WaitClubCheck = 39] = "WaitClubCheck", r[r.ClubMbSizeLimit = 40] = "ClubMbSizeLimit", r[r.NoPrivileges = 41] = "NoPrivileges", r[r.HadClub = 42] = "HadClub", r[r.ClubApplied = 43] = "ClubApplied", r[r.ViceChairmanFull = 44] = "ViceChairmanFull", r[r.ClubNameDup = 45] = "ClubNameDup", r[r.MemberOffClub = 46] = "MemberOffClub", r[r.ChairmanCantOff = 47] = "ChairmanCantOff", r[r.IllegalRequest = 48] = "IllegalRequest", r[r.CantEquipArms = 49] = "CantEquipArms", r[r.InCD = 50] = "InCD", r[r.CreateRoleErr = 51] = "CreateRoleErr", r[r.ClubErr = 52] = "ClubErr", r[r.TradeErr = 53] = "TradeErr", r[r.WorldServerErr = 54] = "WorldServerErr", r[r.DBServerErr = 55] = "DBServerErr", r[r.PassUnable = 56] = "PassUnable", r[r.vitMax = 57] = "vitMax", r[r.soldOut = 58] = "soldOut", r[r.vitNotEnough = 59] = "vitNotEnough", r[r.InBattle = 60] = "InBattle", r[r.MCNotEnough = 62] = "MCNotEnough", r[r.TapTokenNotEnough = 61] = "TapTokenNotEnough", r[r.NoWearSkin = 63] = "NoWearSkin", r[r.NoSkin = 64] = "NoSkin", r[r.NoHero = 65] = "NoHero", r[r.UpLvLimit = 66] = "UpLvLimit", r[r.InputTooLong = 67] = "InputTooLong", r[r.IllegalChar = 68] = "IllegalChar", r[r.IsUsed = 69] = "IsUsed", r[r.CodeIsUsed = 70] = "CodeIsUsed", r[r.MailServerErr = 71] = "MailServerErr", r[r.WalletIsBind = 72] = "WalletIsBind", r[r.WalletBindFail = 73] = "WalletBindFail", r[r.WalletError = 74] = "WalletError", r[r.HasBindWallet = 75] = "HasBindWallet", r[r.InSettle = 76] = "InSettle", r[r.BanAccount = 77] = "BanAccount", r[r.BeKickoff = 78] = "BeKickoff", r[r.MapOver = 79] = "MapOver", r[r.NoTimes = 80] = "NoTimes", r[r.CannotBuy = 81] = "CannotBuy", r[r.GameOutTime = 82] = "GameOutTime", r[r.SessExpire = 83] = "SessExpire", r[r.NoBindWallet = 84] = "NoBindWallet", r[r.ItemReturned = 85] = "ItemReturned", r[r.PaymentSuccess = 86] = "PaymentSuccess", r[r.PaymentFail = 87] = "PaymentFail", r[r.NotSupportPurchase = 88] = "NotSupportPurchase", r[r.BindingSuccess = 89] = "BindingSuccess", r[r.MailSendSuccess = 90] = "MailSendSuccess", r[r.AccountBound = 91] = "AccountBound", r[r.LoginFail = 92] = "LoginFail", r[r.LoginSuccess = 93] = "LoginSuccess", r[r.ActivityOver = 94] = "ActivityOver", r[r.HasTeam = 95] = "HasTeam", r[r.NoTeam = 96] = "NoTeam", r[r.TeamMemberMax = 97] = "TeamMemberMax", r[r.TeamBattling = 98] = "TeamBattling", r[r.OnlyLeaderCanDo = 99] = "OnlyLeaderCanDo", r[r.NoTeamMember = 100] = "NoTeamMember", r[r.RankRewardOver = 101] = "RankRewardOver", r[r.CannotJoin = 102] = "CannotJoin", r[r.AccountNameInvalid = 103] = "AccountNameInvalid", r[r.PwdInvalid = 104] = "PwdInvalid", r[r.AccessDenied = 105] = "AccessDenied", r[r.WalletSignError = 106] = "WalletSignError", r[r.Maintain = 107] = "Maintain", r[r.WalletVerifyFail = 108] = "WalletVerifyFail", r[r.SecurityPwdInvalid = 109] = "SecurityPwdInvalid", r[r.PleaseSetSecurityPwd = 110] = "PleaseSetSecurityPwd", r[r.AlreadyOpenSkipPwd = 111] = "AlreadyOpenSkipPwd", r[r.NotOpenSkipPwd = 112] = "NotOpenSkipPwd", r[r.IsSet = 113] = "IsSet", r[r.NoTimesToday = 116] = "NoTimesToday", r[r.Cd12Hours = 117] = "Cd12Hours", r[r.Cd24Hours = 118] = "Cd24Hours", r[r.VerifyCodeError = 121] = "VerifyCodeError", r[r.TodayMaxWinCount = 122] = "TodayMaxWinCount", r[r.EmailBeBoundWeb = 123] = "EmailBeBoundWeb", r[r.EmailDupBindError = 124] = "EmailDupBindError", r[r.EleNotEnough = 125] = "EleNotEnough", r[r.ChatServerErr = 127] = "ChatServerErr", r[r.ForbidTalk = 128] = "ForbidTalk", r[r.MonthCardActived = 129] = "MonthCardActived", r[r.InvalidCode = 130] = "InvalidCode", r[r.ExpireCode = 131] = "ExpireCode", r[r.EmailBeBoundHasAsset = 132] = "EmailBeBoundHasAsset", r[r.EmailNotBound = 133] = "EmailNotBound", r[r.FantasyNotEnough = 134] = "FantasyNotEnough", r[r.SkinNoEle = 135] = "SkinNoEle", r[r.CanNotClearSP = 136] = "CanNotClearSP", r[r.ApprovalPending = 138] = "ApprovalPending", r[r.NotUser = 139] = "NotUser", r[r.NotAddFriendSelf = 140] = "NotAddFriendSelf", r[r.UnFriend = 141] = "UnFriend", r[r.FriendMax = 143] = "FriendMax", r[r.FriendExist = 144] = "FriendExist", r[r.NotWearSameTypeRune = 145] = "NotWearSameTypeRune", r[r.NotWearRuneRough = 146] = "NotWearRuneRough", r[r.NotResetRuneRough = 147] = "NotResetRuneRough", r[r.TooFarAway = 148] = "TooFarAway", r[r.VigorNotEnough = 149] = "VigorNotEnough", r[r.VigorMax = 150] = "VigorMax", r[r.DurableNotEnough = 151] = "DurableNotEnough", r[r.DurableMax = 152] = "DurableMax", r[r.TreasureNow = 153] = "TreasureNow", r[r.TransferBufFail = 154] = "TransferBufFail", r[r.NotOpenMap = 155] = "NotOpenMap", r[r.FFriendMax = 156] = "FFriendMax", r[r.InLive = 157] = "InLive", r[r.WebAccountBeBound = 158] = "WebAccountBeBound", r[r.GameAccountBeBound = 159] = "GameAccountBeBound", r[r.SeasonOver = 160] = "SeasonOver", r[r.BattleEnd = 163] = "BattleEnd", r[r.DiamondNotEnough = 165] = "DiamondNotEnough", r[r.WealthNotEnough = 166] = "WealthNotEnough", r[r.NoSeats = 1027] = "NoSeats", r[r.KittyNotEnough = 168] = "KittyNotEnough", r[r.FishNotEntough = 169] = "FishNotEntough", r[r.GoodsOnceBuy = 170] = "GoodsOnceBuy", r[r.ItemGone = 171] = "ItemGone", r[r.ClubNotExist = 172] = "ClubNotExist", r[r.ClubOnList = 173] = "ClubOnList", r[r.RankServerErr = 175] = "RankServerErr";
    let Kt = {
        [p.Succ]: [C.Succ],
        [p.Unkown]: [C.Unkown],
        [p.SysError]: [C.SysError],
        [p.ParamsError]: [C.ParamsError],
        [p.ConfigError]: [C.ConfigError],
        [p.NetError]: [C.NetError],
        [p.NetDisconnect]: [C.NetDisconnect],
        [p.ReqTimeout]: [C.ReqTimeout],
        [p.ConnectTimeout]: [C.ConnectTimeout],
        [p.PwdError]: [C.PwdError],
        [p.NoRole]: [C.NoRole],
        [p.NoAccount]: [C.NoAccount],
        [p.DupAccount]: [C.DupAccount],
        [p.FuncNotOpen]: [C.FuncNotOpen],
        [p.OtherLogined]: [C.OtherLogined],
        [p.ItemNotEnough]: [C.ItemNotEnough],
        [p.EatMax]: [C.EatMax],
        [p.LvlMax]: [C.LvlMax],
        [p.CantBuySelfGoods]: [C.CantBuySelfGoods],
        [p.GoodsPriceError]: [C.GoodsPriceError],
        [p.NoGoods]: [C.NoGoods],
        [p.TradeNumLiimit]: [C.TradeNumLiimit],
        [p.NotYourGoods]: [C.NotYourGoods],
        [p.GoodsSold]: [C.GoodsSold],
        [p.CopperNotEnough]: [C.CopperNotEnough],
        [p.TradeError]: [C.TradeError],
        [p.PlayerNotEnough]: [C.PlayerNotEnough],
        [p.InvalidData]: [C.InvalidData],
        [p.NoData]: [C.NoData],
        [p.AbnormalData]: [C.AbnormalData],
        [p.HasGot]: [C.HasGot],
        [p.Nonstandard]: [C.Nonstandard],
        [p.NoUserData]: [C.NoUserData],
        [p.NoItem]: [C.NoItem],
        [p.IsAct]: [C.IsAct],
        [p.NotAct]: [C.NotAct],
        [p.LvMax]: [C.LvMax],
        [p.NoClub]: [C.NoClub],
        [p.WaitClubCheck]: [C.WaitClubCheck],
        [p.ClubMbSizeLimit]: [C.ClubMbSizeLimit],
        [p.NoPrivileges]: [C.NoPrivileges],
        [p.HadClub]: [C.HadClub],
        [p.ClubApplied]: [C.ClubApplied],
        [p.ViceChairmanFull]: [C.ViceChairmanFull],
        [p.ClubNameDup]: [C.ClubNameDup],
        [p.MemberOffClub]: [C.MemberOffClub],
        [p.ChairmanCantOff]: [C.ChairmanCantOff],
        [p.IllegalRequest]: [C.IllegalRequest],
        [p.CantEquipArms]: [C.CantEquipArms],
        [p.InCD]: [C.InCD],
        [p.CreateRoleErr]: [C.CreateRoleErr],
        [p.ClubErr]: [C.ClubErr],
        [p.TradeErr]: [C.TradeErr],
        [p.WorldServerErr]: [C.WorldServerErr],
        [p.DBServerErr]: [C.DBServerErr],
        [p.PassUnable]: [C.PassUnable],
        [p.vitMax]: [C.vitMax],
        [p.soldOut]: [C.soldOut],
        [p.vitNotEnough]: [C.vitNotEnough],
        [p.InBattle]: [C.InBattle],
        [p.MCNotEnough]: [C.MCNotEnough],
        [p.TapTokenNotEnough]: [C.TapTokenNotEnough],
        [p.NoWearSkin]: [C.NoWearSkin],
        [p.NoSkin]: [C.NoSkin],
        [p.NoHero]: [C.NoHero],
        [p.UpLvLimit]: [C.UpLvLimit],
        [p.InputTooLong]: [C.InputTooLong],
        [p.IllegalChar]: [C.IllegalChar],
        [p.IsUsed]: [C.IsUsed],
        [p.CodeIsUsed]: [C.CodeIsUsed],
        [p.MailServerErr]: [C.MailServerErr],
        [p.WalletIsBind]: [C.WalletIsBind],
        [p.WalletBindFail]: [C.WalletBindFail],
        [p.WalletError]: [C.WalletError],
        [p.HasBindWallet]: [C.HasBindWallet],
        [p.InSettle]: [C.InSettle],
        [p.BanAccount]: [C.BanAccount],
        [p.BeKickoff]: [C.BeKickoff],
        [p.MapOver]: [C.MapOver],
        [p.NoTimes]: [C.NoTimes],
        [p.CannotBuy]: [C.CannotBuy],
        [p.GameOutTime]: [C.GameOutTime],
        [p.SessExpire]: [C.SessExpire],
        [p.NoBindWallet]: [C.NoBindWallet],
        [p.ItemReturned]: [C.ItemReturned],
        [p.PaymentSuccess]: [C.PaymentSuccess],
        [p.PaymentFail]: [C.PaymentFail],
        [p.NotSupportPurchase]: [C.NotSupportPurchase],
        [p.BindingSuccess]: [C.BindingSuccess],
        [p.MailSendSuccess]: [C.MailSendSuccess],
        [p.AccountBound]: [C.AccountBound],
        [p.LoginFail]: [C.LoginFail],
        [p.LoginSuccess]: [C.LoginSuccess],
        [p.ActivityOver]: [C.ActivityOver],
        [p.HasTeam]: [C.HasTeam],
        [p.NoTeam]: [C.NoTeam],
        [p.TeamMemberMax]: [C.TeamMemberMax],
        [p.TeamBattling]: [C.TeamBattling],
        [p.OnlyLeaderCanDo]: [C.OnlyLeaderCanDo],
        [p.NoTeamMember]: [C.NoTeamMember],
        [p.RankRewardOver]: [C.RankRewardOver],
        [p.CannotJoin]: [C.CannotJoin],
        [p.AccountNameInvalid]: [C.AccountNameInvalid],
        [p.PwdInvalid]: [C.PwdInvalid],
        [p.AccessDenied]: [C.AccessDenied],
        [p.WalletSignError]: [C.WalletSignError],
        [p.Maintain]: [C.Maintain],
        [p.WalletVerifyFail]: [C.WalletVerifyFail],
        [p.SecurityPwdInvalid]: [C.SecurityPwdInvalid],
        [p.PleaseSetSecurityPwd]: [C.PleaseSetSecurityPwd],
        [p.AlreadyOpenSkipPwd]: [C.AlreadyOpenSkipPwd],
        [p.NotOpenSkipPwd]: [C.NotOpenSkipPwd],
        [p.IsSet]: [C.IsSet],
        [p.NoTimesToday]: [C.NoTimesToday],
        [p.Cd12Hours]: [C.Cd12Hours],
        [p.Cd24Hours]: [C.Cd24Hours],
        [p.VerifyCodeError]: [C.VerifyCodeError],
        [p.TodayMaxWinCount]: [C.TodayMaxWinCount],
        [p.EmailBeBoundWeb]: [C.EmailBeBoundWeb],
        [p.EmailDupBindError]: [C.EmailDupBindError],
        [p.EleNotEnough]: [C.EleNotEnough],
        [p.ChatServerErr]: [C.ChatServerErr],
        [p.ForbidTalk]: [C.ForbidTalk],
        [p.MonthCardActived]: [C.MonthCardActived],
        [p.InvalidCode]: [C.InvalidCode],
        [p.ExpireCode]: [C.ExpireCode],
        [p.EmailBeBoundHasAsset]: [C.EmailBeBoundHasAsset],
        [p.EmailNotBound]: [C.EmailNotBound],
        [p.FantasyNotEnough]: [C.FantasyNotEnough],
        [p.SkinNoEle]: [C.SkinNoEle],
        [p.CanNotClearSP]: [C.CanNotClearSP],
        [p.ApprovalPending]: [C.ApprovalPending],
        [p.NotUser]: [C.NotUser],
        [p.NotAddFriendSelf]: [C.NotAddFriendSelf],
        [p.UnFriend]: [C.UnFriend],
        [p.FriendMax]: [C.FriendMax],
        [p.FriendExist]: [C.FriendExist],
        [p.NotWearSameTypeRune]: [C.NotWearSameTypeRune],
        [p.NotWearRuneRough]: [C.NotWearRuneRough],
        [p.NotResetRuneRough]: [C.NotResetRuneRough],
        [p.TooFarAway]: [C.TooFarAway],
        [p.VigorNotEnough]: [C.VigorNotEnough],
        [p.VigorMax]: [C.VigorMax],
        [p.DurableNotEnough]: [C.DurableNotEnough],
        [p.DurableMax]: [C.DurableMax],
        [p.TreasureNow]: [C.TreasureNow],
        [p.TransferBufFail]: [C.TransferBufFail],
        [p.NotOpenMap]: [C.NotOpenMap],
        [p.FFriendMax]: [C.FFriendMax],
        [p.InLive]: [C.InLive],
        [p.WebAccountBeBound]: [C.WebAccountBeBound],
        [p.GameAccountBeBound]: [C.GameAccountBeBound],
        [p.SeasonOver]: [C.SeasonOver],
        [p.BattleEnd]: [C.BattleEnd],
        [p.DiamondNotEnough]: [C.DiamondNotEnough],
        [p.WealthNotEnough]: [C.WealthNotEnough],
        [p.NoSeats]: [C.NoSeats],
        [p.KittyNotEnough]: [C.KittyNotEnough],
        [p.FishNotEntough]: [C.FishNotEntough],
        [p.GoodsOnceBuy]: [C.GoodsOnceBuy],
        [p.ItemGone]: [C.ItemGone],
        [p.ClubNotExist]: [C.ClubNotExist],
        [p.ClubOnList]: [C.ClubOnList],
        [p.RankServerErr]: [C.RankServerErr]
    };

    function Jt(t) {
        return v((t = t, Kt[t] || 0))
    }
    let b = new yt;

    function k(t, e, i, s) {
        return b.sendAndWait(t, e, i, s)
    }
    const Zt = {
        White: "#ffffff",
        Green: "#99FF82",
        Blue: "#4DDBFF",
        Yellow: "#FFF056",
        Orange: "#FF864A",
        Gray: "#D5D5D5",
        DarkGray: "#51413B",
        Brown: "#8F593E",
        Red: "#FF4E4E"
    };
    (h = y = y || {})[h.None = 0] = "None", h[h.Recharge = 1] = "Recharge", h[h.ConnectWalletForBuyFishRecharge = 100] = "ConnectWalletForBuyFishRecharge", h[h.ConnectWalletForClubRecharge = 101] = "ConnectWalletForClubRecharge", h[h.ConnectWalletForSignInSpeed = 102] = "ConnectWalletForSignInSpeed", h[h.CheckOrderForSignInSpeed = 103] = "CheckOrderForSignInSpeed", h[h.ConnectWalletForFirstRecharge = 104] = "ConnectWalletForFirstRecharge", h[h.CheckOrderForFirstRecharge = 105] = "CheckOrderForFirstRecharge", (e = Gt = Gt || {})[e.signIn = 1] = "signIn", e[e.recharge = 2] = "recharge";
    class w {
        static get(t, e = !1) {
            return e || (t += "_" + S.id), Laya.LocalStorage.getJSON(t) || ""
        }
        static set(t, e, i = !1) {
            i || (t += "_" + S.id), Laya.LocalStorage.setJSON(t, e)
        }
        static removeItem(t, e = !1) {
            e || (t += "_" + S.id), Laya.LocalStorage.removeItem(t)
        }
    }
    w.s_musicDisable = "CAT_MUSIC_DISABLE", w.s_soundDisable = "CAT_SOUND_DISABLE", w.s_taskRedCheck = "CAT_TASK_RED_CHECK", w.s_signInSpeedOrderTime = "CAT_SIGN_IN_SPEED_ORDER_TIME", w.s_firstRechargeOrderTime = "CAT_FIRST_RECHARGE_ORDER_TIME";
    let S = new class {
        constructor() {
            this.bag = {}, this.rechargeIds = [], this.bcId = 0, this.offLine = null, this.linkType = y.None, this.fishData = null, this.wCati = "0"
        }
        init(e) {
            if (this.id = e.id, this.name = e.name, this.accountName = e.accountName, this.bag = e.bag, this.wCati = e.wCati, this._icon = +e.icon, this.m_fishCoin = e.fishCoin, this.fishData = e.fishData, N.lunch.stakeCats = e.stakeCats, this.freeCd = +e.exData.speedFreeTime, this.boostEndTime = +e.boostEndTime, this.chainCd = +e.exData.SpeedChainTime, N.cat.initCat(e), this.exdata = e.exData || {}, this.m_gold = e.gold || 0, this.bcId = e.bcId, this.rankGold = e.rankGold, this.randomEvent = e.randomEvent, 0 < this.bcId && (window.mbplatform.blockchainId = this.bcId), window.Telegram) {
                e = window.Telegram.WebApp.initDataUnsafe;
                if (e && e.start_param) {
                    let t = e.start_param;
                    var i, e = t.split("_");
                    "open" == e[0] && e[1] && (this.linkType = e[1], e[1] == y.CheckOrderForSignInSpeed && (i = (new Date).getTime(), w.set(w.s_signInSpeedOrderTime, i)), e[1] == y.CheckOrderForFirstRecharge && (i = (new Date).getTime(), w.set(w.s_firstRechargeOrderTime, i)))
                }
            }
        }
        tokensInfoChange(t) {
            t.info.fishCoinDelta && "0" != t.info.fishCoinDelta && (this.fishCoin = +t.info.fishCoin), t.info.goldDelta && "0" != t.info.goldDelta && (this.gold = +t.info.gold), t.info.wCatiDelta && "0" != t.info.wCatiDelta && (this.wCati = t.info.wCati)
        }
        set fishCoin(t) {
            this.m_fishCoin = t, N.event(l.FISHCOIN_CHANGE)
        }
        set gold(t) {
            this.m_gold = t, N.event(l.UPDATE_ITEM)
        }
        get gold() {
            return this.m_gold
        }
        get fishCoin() {
            return this.m_fishCoin
        }
        updateTokens(t) {}
        get icon() {
            return this._icon
        }
        set icon(t) {
            this._icon = t
        }
        getCountByType(t) {
            return 0
        }
        getBuyedGoods(t) {
            return !(!this.exdata || !this.exdata.buyGoods) && 0 < this.exdata.buyGoods[t]
        }
        addBuyedGoods(t) {
            t <= 0 || (this.exdata.buyGoods || (this.exdata.buyGoods = {}), this.exdata.buyGoods[t] ? this.exdata.buyGoods[t] += 1 : this.exdata.buyGoods[t] = 1)
        }
        updateRecharge(t) {
            t && 0 != t.length ? this.rechargeIds = t : this.rechargeIds = [], this.checkRecharge()
        }
        checkRecharge() {
            var t;
            this.rechargeIds && 0 != this.rechargeIds.length && (t = this.rechargeIds[0], this.receiveRecharge(t).then(t => {
                this.rechargeIds.splice(0, 1), this.checkRecharge()
            }))
        }
        receiveRecharge(t) {
            let e = pb.ReceiveRechargeReq.create();
            return e.id = t, k(e, m.ReceiveRechargeReq, pb.IReceiveRechargeAck).then(t => {
                this.addBuyedGoods(t.GoodsId);
                var e = +t.addFishCoin || 0,
                    i = (0 < e && (this.fishCoin = +t.FishCoin || 0, N.event(l.UPDATE_ITEM)), +t.addGold || 0);
                return i && (this.gold = +t.Gold || 0), e && N.event(l.RECHARGE_SUCCESS, [e, i]), t
            })
        }
        checkFirstReCharge() {
            return !!this.exdata.buyGoods[1001]
        }
        getWalletAddress(t) {
            let e = pb.GetWalletAddrReq.create();
            return e.rawAddress = t, k(e, m.GetWalletAddrReq, pb.IGetWalletAddrAck).then(t => t)
        }
        requestPrePay(t) {
            let e = pb.RequestPrePayReq.create();
            return e.id = t, k(e, m.RequestPrePayReq, pb.IRequestPrePayAck).then(t => t)
        }
        requestPay(t, e = 1) {
            let i = pb.RequestPayReq.create();
            return i.id = t, i.payType = e, k(i, m.RequestPayReq, pb.IRequestPayAck)
        }
        BCCheckIn(t) {
            let e = pb.BCCheckInReq.create();
            return e.checkInType = t, k(e, m.BCCheckInReq, pb.IBCCheckInAck)
        }
        payClubBooster(t, e, i = 1) {
            let s = pb.PayClubBoosterReq.create();
            return s.clubId = t, s.amount = e, s.payType = i, k(s, m.PayClubBoosterReq, pb.IPayClubBoosterAck)
        }
        serverMessageEvent(t) {
            0 < t.retCode && g(Jt(t.retCode)), t.eventType && t.eventType == Lt.clubBooster && N.event(l.RECHARGE_SUCCESS)
        }
        getPurchaseGoods() {
            var t = Data.getChannel(Mmobay.MConfig.channelId);
            if (!t) return [];
            let e = [];
            for (const n in Data.Recharges) {
                var i, s = Data.getRecharge(+n),
                    a = s.id,
                    s = s[t.name];
                s && s.length && ((i = Data.getGoods(a)).type == Dt.normalGoods && e.push({
                    id: a,
                    iconId: +i.iconId,
                    price: +s[1],
                    amount: i.fishCoin,
                    extra: i.extraFishCoin,
                    showDouble: !this.getBuyedGoods(a)
                }))
            }
            return e
        }
        reqRandomEvent() {
            return k(pb.RandomEventReq.create(), m.RandomEventReq, pb.IRandomEventAck).then(t => {
                this.randomEvent = t.randomEventData, N.event(l.RANDOM_EVENT_TIME_CHANGE), N.event(l.UPDATE_SPEED)
            })
        }
        reqGetRandomEventAward(t = At.close) {
            let e = pb.GetRandomEventAwardReq.create();
            return e.opType = t, k(e, m.GetRandomEventAwardReq, pb.IGetRandomEventAwardAck).then(t => {
                this.randomEvent = t.randomEventData, this.fishCoin = +t.fishCoin || 0, N.event(l.UPDATE_ITEM), this.checkRandomBox(), N.event(l.RANDOM_EVENT_TIME_CHANGE), N.event(l.UPDATE_SPEED)
            })
        }
        reqGetRandomEventBox() {
            var t = pb.GetRandomEventBoxReq.create();
            let s = N.cat.allcats;
            return k(t, m.GetRandomEventBoxReq, pb.IGetRandomEventBoxAck, {
                noLoading: !0
            }).then(e => {
                this.randomEvent = e.randomEventData;
                let i = 0;
                for (let t = 0; t < e.cats.length; t++) !s[t] && e.cats[t] && (N.cat.airDropMap[t] = 1, N.cat.allcats[t] = e.cats[t], Laya.timer.once(50 * i, this, t => {
                    N.event(l.AIR_DROP, [t, !1])
                }, [t]), i++);
                N.event(l.UPDATE_CAT)
            })
        }
        reqTonExchangeRate() {
            return k(pb.TonExchangeRateReq.create(), m.TonExchangeRateReq, pb.ITonExchangeRateAck).then(t => t)
        }
        reqClubGroupUserName(t, e) {
            let i = pb.ClubGroupUserNameReq.create();
            return i.clubId = e, i.groupUserId = t, k(i, m.ClubGroupUserNameReq, pb.IClubGroupUserNameAck).then(t => t)
        }
        checkRandomBox() {
            if (S.randomEvent && !(S.randomEvent.boxNum <= 0)) {
                var i = N.cat.allcats;
                let e = 0;
                for (let t = 0; t < i.length; t++) i[t] || e++;
                e && this.reqGetRandomEventBox()
            }
        }
        doInviteAction() {
            Laya.Browser.onAndroid && zt();
            let t = `https://t.me/${Vt()}/gameapp?startapp=`;
            N.club.clubInfo && N.club.clubInfo.id ? t += `r_${N.club.clubInfo.id}_` + this.id : t += "rp_" + this.id;
            var e = encodeURIComponent(`рџ’°Catizen: Unleash, Play, Earn - Where Every Game Leads to an Airdrop Adventure!
рџЋЃLet's play-to-earn airdrop right now!`);
            Yt(`https://t.me/share/url?url=${t}&text=` + e), Laya.Browser.onAndroid && Xt()
        }
        doShareToTg(t, e) {
            zt(), Yt(`https://t.me/${Vt()}?start=sg_${t}_` + e), Xt()
        }
        doCreateClubAction() {
            zt(), Yt("https://t.me/" + Vt() + "?start=cc"), Xt()
        }
        toPremiumTg() {
            zt();
            Yt("https://t.me/premium"), Xt()
        }
        toSquadChat(t, e) {
            this.reqClubGroupUserName(t, e).then(t => {
                zt(), Yt("https://t.me/" + t.groupUserName), Xt()
            })
        }
        toTask() {
            Laya.Browser.onPC && zt(), Yt(`https://t.me/${Vt()}/webapp?startapp=open_1001_0`)
        }
    };
    Mmobay.MConfig.showNetLog && (window.me = S);
    class Qt {
        constructor() {
            this.tapTokenPrice = .013, this.mcTokenPrice = .62
        }
        initAccount(t) {
            this.accountId = t.accountId, this.accountName = t.name, this.status = t.status
        }
        isForbidTalk() {
            return this.status == Et.forbidTalk
        }
        accountInfoChange(t) {
            this.status = t.status
        }
        updateGold(t) {
            t.fishCoin && (S.fishCoin = +t.fishCoin), t.gold && (S.gold = +t.gold)
        }
    }
    Mmobay.MConfig.showNetLog && (window.reqTest = function(t, e, i) {
        t = pb[t].create();
        return Object.assign(t, i), k(t, e, pb.IBindWalletAck).then(t => {
            console.log(t)
        })
    });
    class te {
        updateItem(t) {
            for (var e of t) S.bag[e.id] = e.num;
            N.event(l.UPDATE_ITEM)
        }
        getItemNum(t) {
            return S.bag[t] || 0
        }
        showBox(t) {}
        reqBuyItem(t, e) {}
    }
    var ee = Laya.SoundManager;
    class x {
        constructor() {
            this._musicDisable = !1, this._soundDisable = !1, this._musicVolume = 1, this._soundVolume = 1
        }
        static get instance() {
            return x._instance || (x._instance = new x), x._instance
        }
        init() {
            this._musicDisable = w.get(w.s_musicDisable), this._soundDisable = w.get(w.s_soundDisable)
        }
        get lastMusic() {
            return this._lastMusic
        }
        set lastMusic(t) {
            this._lastMusic = t
        }
        get musicEnable() {
            return !this._musicDisable
        }
        set musicEnable(t) {
            this._musicDisable = !t
        }
        get soundEnable() {
            return !this._soundDisable
        }
        set soundEnable(t) {
            this._soundDisable = !t
        }
        get musicVolume() {
            return this._musicVolume
        }
        set musicVolume(t) {
            this._musicVolume = t, ee.setMusicVolume(t)
        }
        get soundVolume() {
            return this._soundVolume
        }
        set soundVolume(t) {
            this._soundVolume = t, ee.setSoundVolume(t)
        }
        playMusic(t, e = 0, i) {
            t && this.musicEnable && (this._lastMusic = t, t = this.formatUrl(t = "cat/bgm/" + t), this._musicChannel && this._musicChannel.url.includes(t) ? this._musicChannel.isStopped && this._musicChannel.resume() : this._musicChannel = ee.playMusic(t, e, i))
        }
        playSound(t, e = 1, i) {
            t && this.soundEnable && 0 != this.soundVolume && (t = this.formatUrl(t = "cat/sound/" + t), ee.playSound(t, e, i))
        }
        pauseMusic() {
            this._musicChannel && this._musicChannel.pause()
        }
        resumeMusic() {
            this._musicChannel && this._musicChannel.resume()
        }
        stopMusic() {
            ee.stopMusic(), this._musicChannel = null
        }
        stopSound(t) {
            t ? (t = this.formatUrl(t = "cat/sound/" + t), ee.stopSound(t)) : ee.stopAllSound()
        }
        stopAll() {
            ee.stopAll(), this._musicChannel = null
        }
        formatUrl(t) {
            return t = t.replace(".ogg", "mp3")
        }
    }
    class ie {
        constructor() {
            this.cats = [null, null, null, null, null, null, null, null, null, null, null, null], this.goldAniImg = [], this.tempGold = 0, this.airDropTime = 0, this.airDropMap = {}, this.goldMute = !1, this.freeCat = 0, this.buyAuto = !1, this.isAuto = true, this.clickAuto = !1, this.allcats = [null, null, null, null, null, null, null, null, null, null, null, null]
        }
        initCat(t) {
            var e = t.cats;
            for (let t = 0; t < e.length; t++) this.allcats[t] = e[t] || null;
            this.buyAuto = !!t.exData.autoMerge, null === this.isAuto && (this.isAuto = this.buyAuto), this.goldTime = t.goldTime, this.freeCat = t.exData.freeCatLvl;
            t = 1e3 * +Data.gameConf.initCfg.gatherGoldTime;
            this.airDropTime = Date.newDate().getTime() / 1e3, Laya.timer.clearAll(this), Laya.timer.clear(this, this.startLoop), Laya.timer.once(1e3 * this.goldTime + t - Date.newDate().getTime(), this, this.startLoop), Laya.timer.loop(13e3, this, this.reqGetAirDropCat)
        }
        startLoop() {
            let t = 1e3 * +Data.gameConf.initCfg.gatherGoldTime;
            this.reqGather().then(() => {
                Laya.timer.once(1e3 * this.goldTime + t - Date.newDate().getTime(), this, this.startLoop)
            })
        }
        getCats() {
            return this.allcats
        }
        get nowGenerateCat() {
            var t = Data.getShopCat(this.getMyLv());
            return t ? t.generateLvl : 1
        }
        reqGather() {
            return k(new pb.GatherGoldReq, m.GatherGoldReq, pb.IGatherGoldAck, {
                noLoading: !0
            }).then(t => {
                S.m_gold = +t.gold, this.goldTime = t.goldTime
            })
        }
        reqOff(t) {
            let e = new pb.GetOffLineGoldReq;
            return e.Type = t, k(e, m.GetOffLineGoldReq, pb.IGetOffLineGoldAck, {
                noLoading: !0
            }).then(t => {
                S.m_gold = +t.gold, this.goldTime = t.goldTime, S.fishCoin = +t.fishCoin, S.offLine = null, N.event(l.HOME_GOLD_ANI)
            })
        }
        reqSumCat(t) {
            let e = new pb.MergeCatReq;
            return e.indexs = t, k(e, m.MergeCatReq, pb.IMergeCatAck, {
                noLoading: !0
            }).then(t => {
                for (var e of t.cats)
                    if (e > this.getMyLv()) {
                        S.exdata.maxCatLvl = e, N.event("updateShopRed"), N.event(l.UPDATE_CAT), N.event(l.MaxCAT_CHANGE);
                        break
                    } return N.event(l.UPDATE_OUTPUT), t.cats
            })
        }
        reqSwitch(t) {
            let e = new pb.SwitchPosCatReq;
            return e.indexs = t, k(e, m.SwitchPosCatReq, pb.ISwitchPosCatAck, {
                noLoading: !0
            }).then(e => {
                for (let t = 0; t < e.cats.length; t++) this.allcats[t] = e.cats[t] || null;
                return N.event(l.UPDATE_CAT, [!0]), e
            })
        }
        reqDelCat(t) {
            let e = new pb.DelCatReq;
            return e.indexs = [t], k(e, m.DelCatReq, pb.IDelCatAck, {
                noLoading: !0
            }).then(e => {
                for (let t = 0; t < e.cats.length; t++) this.allcats[t] = e.cats[t] || null;
                return N.event(l.UPDATE_CAT, [!0]), N.event(l.UPDATE_OUTPUT), 13 < Date.newDate().getTime() / 1e3 - this.airDropTime && (this.reqGetAirDropCat(), Laya.timer.loop(13e3, this, this.reqGetAirDropCat)), e
            })
        }
        reqSpeed(t) {
            let e = new pb.BoostGoldReq;
            return e.Type = t, k(e, m.BoostGoldReq, pb.IBoostGoldAck).then(t => (S.boostEndTime = t.boostEndTime, S.exdata.speedFreeTime = t.SpeedFreeTime, S.fishCoin = +t.fishCoin, N.event(l.UPDATE_SPEED), N.event(l.UPDATE_ITEM), x.instance.playSound("Speed.mp3"), t))
        }
        reqCreate(e = this.nowGenerateCat, t = !1, i = !1) {
            let s = new pb.GenerateCatReq;
            return s.lvl = e, s.Type = i ? 3 : t ? 2 : 1, k(s, m.GenerateCatReq, pb.IGenerateCatAck, {
                noLoading: !0
            }).then(t => (S.m_gold = +t.gold, S.fishCoin = +t.fishCoin, this.allcats[t.index || 0] = t.catLvl, i && (this.freeCat = S.exdata.freeCatLvl = 0, N.event("updateShopRed")), S.exdata.catNumFish[e] = t.catNumFish, S.exdata.catNum[e] = t.catNum, N.event(l.UPDATE_CAT, [!0]), N.event(l.BUY_CAT, [t]), N.event(l.UPDATE_OUTPUT), N.event(l.UPDATE_ITEM), x.instance.playSound("airdrop3.mp3"), t))
        }
        getNowPrice() {
            return this.getCatCost(this.nowGenerateCat)
        }
        getMyLv() {
            return S.exdata.maxCatLvl || 1
        }
        getOutPutSpeed() {
            return this.getBaseSpeed() * this.getSpeedAdd()
        }
        getSpeedAdd() {
            var t = Date.newDate().getTime(),
                e = Data.getFishEvent(1),
                e = e && e.goldMultiple[S.rankLeague] / 100 || 0;
            return (1e3 * S.boostEndTime > t ? 2 : 1) * (S.randomEvent && 1e3 * +S.randomEvent.multipleTime > t ? 5 : 1) + (S.fishData && 1e3 * +S.fishData.eventTime > t ? e : 0)
        }
        getBaseSpeed() {
            let e = 0;
            for (let t = 0; t < this.allcats.length; t++) {
                var i = this.allcats[t];
                i && !N.lunch.checkCatLunch(t) && (i = Data.getCat(i), e += +i.outGold)
            }
            return e
        }
        getCatCost(t) {
            var e = Data.getCat(t);
            return t > this.getGoldCatLv() ? Math.ceil(+e.baseCostFishCoin * Math.pow(e.priceAddFishCoin, S.exdata.catNumFish[t] || 0)) : Math.ceil(+e.baseCost * Math.pow(e.priceAdd, S.exdata.catNum[t] || 0))
        }
        playCat(e, i, s = "") {
            if (!e || e.skeleton && !e.destroyed) {
                Laya.timer.clearAll(e);
                let t = e.getAniIndexByName(i);
                s.length ? e.play(t, !1, Laya.Handler.create(this, () => {
                    t = e.getAniIndexByName(i), e.play(e.getAniIndexByName(s), !0)
                })) : e.play(t, !0)
            } else e._templet && e._templet.once(Laya.Event.COMPLETE, this, () => {
                let t = e.getAniIndexByName(i);
                s.length ? e.play(t, !1, Laya.Handler.create(this, () => {
                    t = e.getAniIndexByName(i), e.play(e.getAniIndexByName(s), !0)
                })) : e.play(t, !0)
            })
        }
        prepareCat(s, t, e) {
            let a = Data.getCat(t),
                n = a.oldShowId || a.showId,
                o = "",
                h = (o = 200 <= +n ? "fat_" : 100 <= +n ? "chubby_" : "thin_", ["Mane", "Hat", "Body", "Ear_L", "Ear_R", "Eye_White", "Eyes", "Head", "Leg_LB", "Leg_LF", "Leg_RB", "Leg_RF", "Mouth", "Nose", "Tail", "Tongue"]),
                r = 0;
            Laya.loader.load("cat/catImage/cat_" + n + ".atlas", Laya.Handler.create(this, () => {
                for (let i of h) {
                    if (r++, "Hat" == i) {
                        var t = a.hatId;
                        let e = t ? `cat/ui_cat/hat${t}.png` : "cat/ui_cat/hat.png";
                        Laya.loader.load(e, Laya.Handler.create(this, () => {
                            var t = Laya.loader.getRes(e);
                            s.setSlotSkin(o + i, t)
                        }))
                    } else {
                        t = Laya.loader.getRes("cat/catImage/cat_" + n + "/" + i + ".png");
                        if (!t) continue;
                        s.setSlotSkin(o + i, t)
                    }
                    r == h.length && e && e.run()
                }
            }))
        }
        getFishCoinLv() {
            var t = Data.getShopCat(this.getMyLv());
            return t ? t.fishCoinLvl : 1
        }
        getGoldCatLv() {
            var t = Data.getShopCat(this.getMyLv());
            return t ? t.goldLvl : 1
        }
        checkIsBoost() {
            return 1e3 * S.boostEndTime > Date.newDate().getTime()
        }
        reqGetAirDropCat() {
            if (this.allcats.filter(t => !t).length && !(this.checkNew() || S.randomEvent && S.randomEvent.boxNum)) return k(new pb.GetAirDropCatReq, m.GetAirDropCatReq, pb.IGetAirDropCatAck, {
                noLoading: !0
            }).then(e => {
                if (-1 != e.airdropIndex) {
                    if (this.airDropTime = +e.airdropTime, -(this.airDropMap[e.airdropIndex] = 1) != e.airdropIndex) {
                        for (let t = 0; t < e.cats.length; t++) this.allcats[t] = e.cats[t] || null;
                        N.event(l.AIR_DROP, e.airdropIndex)
                    }
                    N.event(l.UPDATE_CAT)
                }
            })
        }
        getCv(t, e) {
            return `${t}_${"male"==e?"Man":"Female"}_${["A","C","E","F","G","J","R","V"][Math.floor(4*Math.random())]}.mp3`
        }
        checkNew() {
            return "0" == S.rankGold && !this.allcats.find(t => !!t)
        }
        reqFreeCat() {
            return k(new pb.GetFreeCatReq, m.GetFreeCatReq, pb.IGetFreeCatAck, {
                noLoading: !0
            }).then(t => {
                this.freeCat = t.catLvl
            })
        }
        reqBuyAuto() {
            return k(new pb.MergeCatAutoReq, m.MergeCatAutoReq, pb.IMergeCatAutoAck, {
                noLoading: !0
            }).then(t => {
                this.buyAuto = !!t.autoMerge, S.exdata.autoMerge = t.autoMerge, N.event("buyAuto")
            })
        }
        doGoldRain(e) {
            for (let t = 0; t < 50; t++) {
                let t = new Laya.Image("cat/ui_item/coin.png");
                this.goldAniImg.push(t), t.y = -50, t.visible = !1, e.addChild(t), this.doGoldAni(t, e)
            }
        }
        doGoldAni(t, e) {
            t.x = Math.ceil(Math.random() * e.width - 20), t.alpha = Math.random() + .5, t.rotation = 360 * Math.random(), t.skewX = 5 * Math.random(), Laya.timer.once(2700 * Math.random(), t, () => {
                t.visible = !0, Laya.Tween.to(t, {
                    y: e.height + 50
                }, 1e3 * Math.random() + 1500, null, Laya.Handler.create(this, () => {
                    t.y = -50, t.visible = !1, this.doGoldAni(t, e)
                }))
            })
        }
        clearGoldRain() {
            for (var t of this.goldAniImg) Laya.Tween.clearAll(t), t.destroy();
            this.goldAniImg = []
        }
        findMaxCat() {
            let t = 0;
            for (var e of this.allcats) e > t && (t = e);
            return t
        }
    }
    class se {
        constructor() {
            this.m_fishPool = 0
        }
        reqFishRank() {
            return k(new pb.FishRankListReq, m.FishRankListReq, pb.IFishRankListAck).then(t => t.rankList)
        }
        reqMyFishInfo() {
            return k(new pb.MyFishInfoReq, m.MyFishInfoReq, pb.IMyFishInfoAck, {
                noLoading: !0
            }).then(t => t)
        }
        reqFishPool(t = !1) {
            return k(new pb.FishRewardPoolReq, m.FishRewardPoolReq, pb.IFishRewardPoolAck, {
                noLoading: t
            }).then(t => {
                this.m_fishPool = +t.count * N.cat.getBaseSpeed()
            })
        }
        getFishArr() {
            if (this.m_fishs) return this.m_fishs;
            for (var t in this.m_fishs = [], Data.fishs) {
                t = Data.getFish(+t);
                this.m_fishs.push(t)
            }
            return this.m_fishs
        }
        getRankDetail() {
            if (this.m_fishRewards) return this.m_fishRewards;
            for (var t in this.m_fishRewards = [], Data.fishSettles) {
                t = Data.getFishSettle(+t);
                this.m_fishRewards.push(t)
            }
            return this.m_fishRewards
        }
        reqFishing(t) {
            let e = pb.FishingReq.create();
            return e.color = t, k(e, m.FishingReq, pb.IFishingAck).then(t => (N.bag.updateItem(t.items), S.gold = +t.gold, S.fishCoin = +t.fishCoin, S.fishData = t.fishData, N.event(l.FISHDATA_CHANGE), t))
        }
        reqFishRodUp() {
            return k(pb.FishRodUpReq.create(), m.FishRodUpReq, pb.IFishRodUpAck).then(t => (S.exdata.fishRobLvl = t.FishRodLvl, S.fishCoin = +t.fishCoin, t))
        }
        formatWeight(t) {
            return 1e3 < t ? t / 1e3 + "T" : t + "KG"
        }
    }
    class ae {
        reqFrensInfo() {
            return k(pb.FrensInfoReq.create(), m.FrensInfoReq, pb.IFrensInfoAck).then(t => t)
        }
        reqFrensInviterDoubleInfo() {
            return k(pb.FrensInviterDoubleInfoReq.create(), m.FrensInviterDoubleInfoReq, pb.IFrensInviterDoubleInfoAck).then(t => t)
        }
        reqInviteRankList() {
            return k(pb.InviteRankListReq.create(), m.InviteRankListReq, pb.IInviteRankListAck).then(t => t)
        }
    }
    let ne = new class {
        onErrorAck(t, e) {
            t.code == p.OtherLogined || t.code == p.BanAccount || t.code == p.BeKickoff ? N.login.handleErrorAck(t.code) : t.code == p.Maintain || t.code == p.AccessDenied ? N.login.handleMaintainErrorAck(t.code) : g(Jt(t.code))
        }
        onHookRecvPacket(t, e) {
            N.login.onHookRecvPacket(t, e)
        }
        onHookSendPacket(t, e) {
            N.login.onHookSendPacket(t, e)
        }
        onEnterGameAck(t, e) {
            N.login.onEnterGameAck(t, !0)
        }
        onServerStateNtf(t, e) {
            N.login.onServerState(t.serverType, t.offline)
        }
        onUserInfoNtf(t, e) {
            S.init(t.userInfo)
        }
        onAccountInfoChangeNtf(t, e) {
            N.account.accountInfoChange(t)
        }
        onMessageEventNtf(t) {
            S.serverMessageEvent(t)
        }
        onSyncRechargeNtf(t) {
            S.updateRecharge(t.ids)
        }
        onTokensInfoChangeNtf(t) {
            S.tokensInfoChange(t), N.lunch.reqLunchList().then(() => {
                N.event("updateLunch")
            })
        }
        onClubInfoNtf(t) {
            N.club.clubInfo = t.club
        }
        onGoldChangeNtf(t) {
            N.account.updateGold(t)
        }
        onSysMsgNtf(t) {
            N.sysNotice.updateSys(t)
        }
        onBoostGoldNtf(t) {
            S.exdata.SpeedChainTime = t.SpeedChainTime, S.boostEndTime = t.boostEndTime, S.exdata.speedFreeTime = t.SpeedFreeTime, N.event(l.UPDATE_SPEED)
        }
        onRandomEventChangeNtf(t) {
            S.randomEvent = t.randomEventData, N.event(l.RANDOM_EVENT_TIME_CHANGE), N.event(l.UPDATE_SPEED), S.checkRandomBox()
        }
        onOffLineGoldNtf(t) {
            S.offLine = +t.offGold && f(t.offGold), N.event(l.UPDATE_OFFLINEGOLD)
        }
        onLaunchPoolBonusNtf(t) {
            for (var e of N.lunch.m_lunchs)
                if (e.id == t.launchId) {
                    if (e.catPool.id == t.poolId) {
                        e.catPool.waitScore = t.waitScore;
                        break
                    }
                    if (e.fishPool.id == t.poolId) {
                        e.fishPool.waitScore = t.waitScore;
                        break
                    }
                } N.event(l.POOLBONUS, [t])
        }
    };
    var oe = new class {
        constructor() {
            this._timeMap = {}
        }
        checkLimit(t, e, i = !1) {
            return this._timeMap[t] ? (i && g("operating too frequently"), !1) : (this._timeMap[t] = !0, Laya.timer.once(e, this, this.onTimeDelay, [t], !1), !0)
        }
        onTimeDelay(t) {
            delete this._timeMap[t]
        }
    };

    function he(t, e = 200, i = !1) {
        return oe.checkLimit(t, e, i)
    }

    function L(t, e, i, s) {
        var a, n = arguments.length,
            o = n < 3 ? e : null === s ? s = Object.getOwnPropertyDescriptor(e, i) : s;
        if ("object" == typeof Reflect && "function" == typeof Reflect.decorate) o = Reflect.decorate(t, e, i, s);
        else
            for (var h = t.length - 1; 0 <= h; h--)(a = t[h]) && (o = (n < 3 ? a(o) : 3 < n ? a(e, i, o) : a(e, i)) || o);
        3 < n && o && Object.defineProperty(e, i, o)
    }

    function D(h, r) {
        const l = "_modelEvents";
        return function(t, e, i) {
            let s;
            if (t.hasOwnProperty(l)) s = t[l];
            else {
                var a = t[l];
                if (t[l] = s = [], a)
                    for (var n in a) {
                        var o = a[n];
                        o.isPri || (s[n] = o)
                    }
            }
            s.push({
                eventType: h,
                handler: i.value,
                isPri: r
            })
        }
    }
    class re extends t.cat.views.fish.FishAutoDlgUI {
        onAwake() {
            super.onAwake(), this.m_view_Count.setData(1, Math.floor(S.fishCoin / +Data.gameConf.fishCfg.costCoin), 1), this.updateView()
        }
        updateView() {
            var t = Math.max(1, this.m_view_Count.count) * +Data.gameConf.fishCfg.costCoin;
            this.m_txt_Sel.text = "/" + t, this.m_txt_Num.text = S.fishCoin + "", this.m_txt_Num.color = S.fishCoin >= t ? "#764428" : Zt.Red
        }
        onClickAuto() {
            this.closeDialog(this.m_view_Count.count ? o.Yes : o.No, [this.m_rad_Stop.selected, this.m_view_Count.count])
        }
    }
    L([D(l.COUNT_CHANGE)], re.prototype, "updateView", null);
    class le extends t.cat.views.fish.FishHistoryCellViewUI {
        dataChanged(t) {
            t ? this.dataSource = t : t = this.dataSource, Object.assign(this.m_div_Tip.style, {
                fontSize: 18,
                bold: !0,
                color: +t.param[1].val == Data.getFish(101).name ? Zt.Yellow : Zt.White,
                leading: 3,
                wordWrap: !0,
                width: 500
            }), Mmobay.MConfig.channelId == Mmobay.MConst.CHANNEL_MANTLE && +t.param[1].val == Data.getFish(123).name && (t.param[1].val = Data.getFish(126).name), this.m_div_Tip.innerHTML = N.sysNotice.parseSysMsg(t) + "", this.height = this.m_div_Tip.contextHeight + 4
        }
    }

    function ce(n, e = "D:HH:MM:ss") {
        n < 0 && (n = 0);
        let t = /D|([HhMs])\1?|S/,
            o = -1,
            h = -1,
            r = [],
            l = [];

        function i(e, t, i) {
            var s = Math.floor(+n / e);
            if (r.push(i), l.push(s), 0 < s ? ((h = -1) == o && (o = i), n = +n % e) : -1 == h && (h = i), t) {
                var [e, a = 2] = [s];
                let t = String(e);
                for (; t.length < a;) t = "0" + t;
                return t
            }
            return s + ""
        }
        let s = 0,
            a = !1,
            c = "";
        for (; c != e;) "" != c && (e = c), c = e.replace(t, t => {
            switch (s = 0, a = !1, t) {
                case "D":
                    s = 86400, a = !0;
                    break;
                case "hh":
                case "HH":
                    a = !0;
                case "h":
                case "H":
                    s = 3600;
                    break;
                case "MM":
                    a = !0;
                case "M":
                    s = 60;
                    break;
                case "ss":
                    a = !0;
                case "s":
                case "S":
                    s = 1
            }
            return i(s, a, e.indexOf(t))
        });
        let m = "",
            d = e.indexOf("#");
        if (-1 < d && (m = -1 == o ? e.slice(d, d + 1) : e.slice(d, o)), -1 < (d = e.indexOf("&")) && ("" != m && (m += "|"), -1 == h ? m += e.slice(d, d + 1) : m += e.slice(h, d + 1)), -1 < (d = e.indexOf("@"))) {
            "" != m ? m += "|@" : m += "@";
            for (let t = 0; t < r.length; t++) 0 == l[t] && (m = (m += "|") + e.slice(r[t], null == r[t + 1] ? d : r[t + 1]))
        }
        t = new RegExp(m, "g");
        let _ = (e = e.replace(t, "")).split(":");
        return 4 == _.length && "00" == _[0] && (_.shift(), e = _.join(":")), e
    }
    class I {
        constructor(t, e, i, s) {
            this.disposed = !1, this._endTime = t, this._interval = e, this._timeLabel = i, this._format = s
        }
        static create(t, e = 1e3, i, s = "D:HH:MM:ss") {
            return new I(t, e, i, s)
        }
        bindLabel(t) {
            this._timeLabel = t
        }
        set endTime(t) {
            this._endTime != t && (this._endTime = t)
        }
        get endTime() {
            return this._endTime
        }
        start() {
            Laya.timer.loop(this._interval, this, this.onTimerLoop), this.onTimerLoop()
        }
        onTimerLoop() {
            var t = Date.newDate().getTime();
            let e = this._endTime - t,
                i = (e <= 0 && (Laya.timer.clear(this, this.onTimerLoop), e = 0), e = Math.round(e / 1e3), "");
            if (i = null == this._format ? ce(e) : ce(e, this._format), this._timeLabel) {
                if (this._timeLabel.destroyed) return void this.dispose();
                this._timeLabel.text = i
            }
            this.onTick && this.onTick(e), e <= 0 && Laya.timer.once(this._interval || 1e3, this, () => {
                this.onEnd && this.onEnd(), this.dispose()
            })
        }
        dispose() {
            Laya.timer.clear(this, this.onTimerLoop), this._endTime = void 0, this._format = void 0, this._interval = void 0, this._timeLabel = null, this.onTick && (this.onTick = null), this.onEnd && (this.onEnd = null), this.disposed = !0
        }
    }
    class me extends t.cat.views.fish.FishRewardDetailDlgUI {
        constructor() {
            super(...arguments), this.m_sel = 0
        }
        onAwake() {
            super.onAwake(), this.updateView(), me.instance = this
        }
        onDestroy() {
            super.onDestroy(), me.instance = null
        }
        updateView() {
            N.fish.reqMyFishInfo().then(t => {
                t = this.getRank(+t.myRank);
                t && this.m_view_Me.dataChanged(null, {
                    settleCfg: t,
                    isSelf: !0
                }), this.m_view_Me.visible = !!t, this.m_txt_No.visible = !t;
                let e = [],
                    i = N.fish.getRankDetail();
                i.forEach(t => {
                    e.push({
                        settleCfg: t,
                        isSelf: !1
                    })
                }), this.m_lst_Rank.array = e
            })
        }
        getRank(t) {
            if (!t || t < 0) return null;
            for (var e in Data.fishSettles) {
                e = Data.getFishSettle(+e);
                if (+e.start <= t && +e.end >= t) return e
            }
        }
        onSelectType() {
            this.updateView()
        }
    }
    class de extends t.cat.views.fish.FishRewardRuleDlgUI {}
    class _e extends t.cat.views.fish.FishRankDlgUI {
        onAwake() {
            super.onAwake(), N.fish.reqFishRank().then(t => {
                this.updateView(t)
            })
        }
        onDestroy() {
            super.onDestroy(), Laya.timer.clearAll(this), this.tick && this.tick.dispose(), this.tick_pool && this.tick_pool.dispose()
        }
        updateView(t) {
            this.tick && this.tick.dispose();
            let e = this.tick = I.create((i = Date.getMondayZeroTime().addDays(7).getTime(), 0 < (s = Date.newDate().getTime() - i) ? (s = Math.ceil(s / 6048e5), Date.getMondayZeroTime().addDays(7 * (s + 1)).getTime()) : i), 1e3, this.m_txt_Time);
            var i, s;
            e.onEnd = () => {
                N.fish.reqFishRank().then(t => {
                    this.updateView(t)
                })
            }, e.start();
            let a = [];
            t.forEach(t => {
                a.push({
                    rankData: t,
                    isSelf: !1
                })
            }), this.m_lst_Rank.array = a, N.fish.reqMyFishInfo().then(t => {
                this.m_view_Me.visible = t.myRank && 0 < +t.myRank, this.m_txt_No.visible = !this.m_view_Me.visible, this.m_view_Me.visible && this.m_view_Me.dataChanged(null, {
                    rankData: {
                        userId: S.id,
                        rank: t.myRank,
                        score: t.myScore,
                        rankKey: t.myRankKey,
                        name: S.name,
                        icon: S.icon,
                        channelID: Mmobay.MConfig.channelId
                    },
                    isSelf: !0
                })
            }), this.updatePool(), Laya.timer.loop(1e4, this, () => {
                this.updatePool(!0)
            })
        }
        updatePool(t = !1) {
            N.fish.reqFishPool(t).then(() => {
                this.checkBonusShow()
            })
        }
        checkBonusShow() {
            if (this.m_txt_BonusNum.text) {
                if (this.m_oldPool != N.fish.m_fishPool) {
                    var i = Date.newDate().addMilliseconds(1e3).getTime();
                    this.tick_pool = I.create(i, 80);
                    let t = 0,
                        e = N.fish.m_fishPool - this.m_oldPool;
                    this.tick_pool.onTick = () => {
                        8 < t ? (this.m_oldPool = N.fish.m_fishPool, this.m_txt_BonusNum.text = f(N.fish.m_fishPool)) : this.m_txt_BonusNum.text = f(this.m_oldPool + e / 8 * t), t++
                    }, this.tick_pool.start()
                }
            } else this.m_oldPool = N.fish.m_fishPool, this.m_txt_BonusNum.text = f(N.fish.m_fishPool)
        }
        onClickDetail() {
            _(me)
        }
        onClickInfo() {
            _(de)
        }
    }
    class ue extends t.cat.views.fish.FishRuleDlgUI {}
    class ge extends t.cat.views.fish.FishSuccDlgUI {
        constructor(t, e = !1, i = !1) {
            super(), this.m_data = null, this.m_isAuto = !1, this.m_isFomo = !1, this.m_data = t, this.m_isAuto = e, this.m_isFomo = i
        }
        onAwake() {
            super.onAwake(), this.showUI(), x.instance.playSound("getfish.mp3")
        }
        showUI() {
            var t = this.m_data;
            let e = t.fishId;
            Mmobay.MConfig.channelId == Mmobay.MConst.CHANNEL_MANTLE && 123 == e && (e = 126);
            var i, s = Data.getFish(e),
                a = (this.m_txt_Title.text = s && v(s.name), Data.getFishEvent(2)),
                n = a.goldMultiple[S.rankLeague] || 0,
                a = a.fishCoinMultiple || 0;
            0 < +this.m_data.addFishCoin ? (this.m_txt_FishCoin.text = this.m_isFomo ? "x" + f(+this.m_data.addFishCoin / a) : "x" + f(this.m_data.addFishCoin), this.m_box_FishCoin.visible = !0, this.m_isFomo && 0 < +a ? (this.m_box_Fomo.visible = !0, this.m_img_GetFish.height = 190, this.m_txt_Fomo.text = "x" + a, this.m_box_GoldT.visible = !0, this.m_img_Total.skin = "cat/ui_item/8.png", this.m_txt_Total.text = f(+this.m_data.addFishCoin), this.height = 820) : (this.height = 730, this.m_img_GetFish.height = 100, this.m_box_Weight.centerY = 0)) : 0 < +this.m_data.addgold ? (this.m_box_Gold.visible = this.m_box_GoldT.visible = !0, this.m_txt_Speed.text = f(N.cat.getBaseSpeed()) + "/s", this.m_img_SpeedBg.width = this.m_txt_Speed.width + 40 + 10, a = s.sellWorth, this.m_txt_Times.text = " x" + Math.floor(a / 60), i = S.exdata.fishRobLvl || 0, i = Data.getFishRod(i), this.m_isFomo && i ? (this.height = 920, this.m_img_GetFish.height = 280, this.m_box_Rod.top = 115, this.m_box_Fomo.visible = this.m_box_Rod.visible = !0, this.m_txt_Fomo.text = "x" + n, this.m_txt_Rod.text = "x" + f(i.multiple), this.m_txt_Total.text = f(N.cat.getBaseSpeed() * a * +i.multiple * n)) : this.m_isFomo ? (this.height = 810, this.m_img_GetFish.height = 190, this.m_box_Fomo.visible = !0, this.m_txt_Fomo.text = "x" + n, this.m_txt_Total.text = f(N.cat.getBaseSpeed() * a * n)) : i ? (this.height = 810, this.m_img_GetFish.height = 190, this.m_box_Rod.visible = !0, this.m_txt_Rod.text = "x" + f(i.multiple), this.m_txt_Total.text = f(a * N.cat.getBaseSpeed() * +i.multiple)) : (this.height = 730, this.m_img_GetFish.height = 100, this.m_box_Rod.visible = !1, this.m_txt_Total.text = f(a * N.cat.getBaseSpeed()))) : (124 == s.id ? (this.m_txt_TipsNoFish.text = v(1048), this.m_img_RightCoin.skin = "cat/ui_fish/earn2.png") : 125 == s.id && (this.m_txt_TipsNoFish.text = v(1047), this.m_img_RightCoin.skin = "cat/ui_fish/earn3.png"), this.height = 650, this.m_img_GetFish.height = 130, this.m_img_TotalGold.visible = !1, this.m_txt_TipsNoFish.visible = !0, this.m_box_Rod.visible = this.m_box_FishCoin.visible = this.m_box_Gold.visible = !1, this.m_box_Weight.centerY = 0, this.m_img_LeftCoin.visible = this.m_img_RightCoin.visible = !0), this.m_img_Fish.skin = this.m_img_FishSmall.skin = `cat/ui_fish/${e}.png`, this.m_txt_Weight.text = N.fish.formatWeight(t.weight), t.newMax == t.myNewMax && t.newMax > t.oldMax ? (this.m_view_New.destroy(), this.m_img_Top.visible = !0) : t.myNewMax > t.myOldMax ? (this.m_img_Top.destroy(), this.m_view_New.visible = !0) : (this.m_img_Top.destroy(), this.m_view_New.destroy()), this.m_isAuto ? (this.m_btn_CloseB.visible = !0, this.m_btn_Continue.visible = !1, this.m_box_Continue.visible = !1) : (this.m_txt_Num.text = S.fishCoin + "", this.m_txt_Need.text = "/" + Data.gameConf.fishCfg.costCoin, this.m_btn_CloseB.visible = !1, this.m_btn_Continue.visible = !0, this.m_box_Continue.visible = !0)
        }
        onClickContinue() {
            this.closeDialog(), N.event(l.DO_CONTINUE_FISH)
        }
        onClickShare() {
            let t = this.m_data.fishId;
            Mmobay.MConfig.channelId == Mmobay.MConst.CHANNEL_MANTLE && 123 == t && (t = 126), S.doShareToTg(2, t)
        }
    }
    class pe extends Laya.EventDispatcher {
        constructor() {
            super(...arguments), this._isLoading = !1, this._isLoaded = !1, this._reference = 0, this._activeTime = 0
        }
        static registerTimer() {
            Laya.timer.loop(3e4, null, pe.checkUnusedRes)
        }
        static checkUnusedRes() {
            if (pe._resRef.size) {
                var e, i, s = Date.newDate().getTime();
                let t = pe._resRef;
                for ([e, i] of t) i.canDestroy(s) && (i.destroy(), t.delete(e))
            }
        }
        static create(t) {
            let e = pe._resRef.get(t);
            return e || (e = new pe, pe._resRef.set(t, e)), e.init(t), e
        }
        init(t) {
            this._url = t, this._reference++, this._activeTime = Date.newDate().getTime(), this._templet && !this._templet.destroyed || (this._isLoading = !1, this._isLoaded = !1, this._templet = new Laya.SpineTemplet_3_x, this._templet.once(Laya.Event.COMPLETE, this, this.onLoadComplete), this._templet.once(Laya.Event.ERROR, this, this.onLoadError))
        }
        destroy() {
            this.offAll(), this._templet && (this._templet.offAll(), this._templet.destroy(), this._templet = null)
        }
        canDestroy(t) {
            return !(0 < this._reference) && !(t - this._activeTime < 6e4)
        }
        recover() {
            this._reference--
        }
        loadAni() {
            this._isLoaded ? this.event(Laya.Event.COMPLETE) : this._isLoading || (this._isLoading = !0, this._templet.loadAni(this._url))
        }
        buildSkeleton() {
            return this._templet.buildArmature()
        }
        onLoadComplete() {
            this._isLoading = !1, this._isLoaded = !0, this._templet.offAll(), 0 < this._reference && this.event(Laya.Event.COMPLETE)
        }
        onLoadError() {
            this._isLoading = !1, this._templet.offAll(), 0 < this._reference && this.event(Laya.Event.ERROR)
        }
    }
    pe._resRef = new Map, pe.registerTimer();
    class R extends Laya.Sprite {
        constructor() {
            super(), this._index = -1, this._offset = [], this.size(100, 100).pivot(50, 50)
        }
        static create(t) {
            let e = n.get(R._sign, R);
            e.setData(t);
            var i = t.px || 0,
                s = t.py || 0,
                a = t.scale || 1;
            return e.pos(i, s), e.scale(a, a), e.zOrder = t.zOrder || 0, t.alpha || 0 == t.alpha ? e.alpha = t.alpha : e.alpha = 1, t.parent && t.parent.addChild(e), e
        }
        get skeleton() {
            return this._skeleton
        }
        setData(t) {
            this._url = t.url, this._autoPlay = !!t.autoPlay, this._autoRemove = !!t.autoRemove, this._loop = !!t.loop, this._rate = t.rate || 1, this._offset = t.offset || [], this._templet = pe.create(this._url), this._templet.once(Laya.Event.COMPLETE, this, this.onLoadComplete), this._templet.once(Laya.Event.ERROR, this, this.onLoadError), this._templet.loadAni()
        }
        onDestroy() {
            this._templet && (this._templet.off(Laya.Event.COMPLETE, this, this.onLoadComplete), this._templet.off(Laya.Event.ERROR, this, this.onLoadError), this._templet.recover(), this._templet = null), this._skeleton = null
        }
        recover() {
            this.destroyed || (this.offAll(), this.removeSelf(), this._url = null, this._rate = 1, this._autoPlay = !1, this._autoRemove = !1, this._loop = !1, this._loaded = !1, this._index = -1, this._settedPos = !1, this._offset = [], this._playHandler && this._playHandler.recover(), this._playHandler = null, this._templet && (this._templet.off(Laya.Event.COMPLETE, this, this.onLoadComplete), this._templet.off(Laya.Event.ERROR, this, this.onLoadError), this._templet.recover(), this._templet = null), this._skeleton && !this._skeleton.destroyed && this._skeleton.destroy(), this._skeleton = null, n.put(R._sign, this))
        }
        play(t = 0, e = !1, i = null) {
            this._index == t && this._loop == e || (e && (i = null), this._autoPlay = !0, this._index = t, this._loop = e, this._playHandler = i, this._play())
        }
        stop() {
            this._skeleton && this._skeleton.stop()
        }
        _play() {
            this._loaded && this._skeleton && ((this._index < 0 || this._index >= this._skeleton.getAnimNum()) && (this._index = 0), this._skeleton.play(this._index, this._loop), this.event(Laya.Event.START), this._settedPos || (this._settedPos = !0, this._offset.length ? this._skeleton.pos(50 - this._offset[0], 100 - this._offset[1]) : this._skeleton.pos(50, 100)))
        }
        onLoadComplete() {
            if (!this.destroyed) {
                this._loaded = !0;
                let t = this._skeleton = this._templet.buildSkeleton();
                t.playbackRate(this._rate), t.on(Laya.Event.STOPPED, this, this.onPlayComplete), this.addChild(t), this._autoPlay && this._play()
            }
        }
        onLoadError() {
            console.log("load spine error==>" + this._url)
        }
        onPlayComplete() {
            if (this._autoRemove && this.recover(), this._playHandler) {
                var e = this._playHandler.caller;
                if (e && e.destroyed) return this._playHandler.recover(), void(this._playHandler = null);
                let t = this._playHandler;
                this._playHandler = null, t.run()
            }
        }
        getAniIndexByName(e) {
            return this.skeleton ? this.skeleton.skeleton.data.animations.findIndex(t => t.name == e) : 0
        }
    }
    R._sign = "p_Spine";
    class Ce extends t.cat.views.fish.FishRewardDlgUI {
        constructor(t, e) {
            super(), this.m_rank = e, this.m_data = t
        }
        onAwake() {
            super.onAwake(), this.updateView()
        }
        updateView() {
            this.m_txt_Desc.text = v(1037, this.m_rank), this.m_txt_BonusNum.text = f(this.m_data)
        }
    }
    class ye extends t.cat.views.recharge.RechargeProcessingDlgUI {
        constructor() {
            super(...arguments), this.m_waitTimes = 30
        }
        onAwake() {
            super.onAwake(), this.m_txt_Time.text = this.m_waitTimes + "s", Laya.timer.loop(1e3, this, this.startWait)
        }
        onDestroy() {
            super.onDestroy(), Laya.timer.clear(this, this.startWait)
        }
        onRechargeSuccess() {
            this.closeDialog()
        }
        startWait() {
            this.m_waitTimes--, this.m_txt_Time.text = this.m_waitTimes + "s", this.m_waitTimes <= 0 && (Laya.timer.clear(this, this.startWait), this.m_txt_Time.visible = !1, this.m_txt_Info.visible = !1, this.m_txt_Timeount.visible = !0)
        }
    }
    L([D(l.RECHARGE_SUCCESS)], ye.prototype, "onRechargeSuccess", null);
    class ve extends t.cat.views.home.ChooseWalletDlgUI {
        onClickMetamask(t) {
            this.closeDialog(o.Yes, "metamask")
        }
        onClickOkx(t) {
            this.closeDialog(o.Yes, "okx")
        }
        onClickBitget(t) {
            this.closeDialog(o.Yes, "bitget")
        }
        onClickBybit(t) {
            this.closeDialog(o.Yes, "bybit")
        }
    }
    class fe extends t.cat.views.home.PurchaseMethodDlgUI {
        constructor(t) {
            super(), this.m_data = t
        }
        onAwake() {
            super.onAwake(), Mmobay.MConfig.channelId == Mmobay.MConst.CHANNEL_MANTLE ? (this.m_box_Content.height = 420, this.m_btn_TonWallet.visible = !1, this.m_btn_TonConnect.visible = !1, this.m_btn_Mantle.visible = !0) : (this.m_box_Content.height = Mmobay.MConfig.isTonKeeper ? 420 : 480, this.m_btn_TonWallet.visible = !Mmobay.MConfig.isTonKeeper, this.m_btn_TonConnect.visible = !0, this.m_btn_Mantle.visible = !1, Mmobay.MConfig.isTonKeeper && (this.m_btn_TonConnect.y = this.m_btn_TonWallet.y)), Mmobay.MConfig.channelId == Mmobay.MConst.CHANNEL_MANTLE ? this.m_txt_PriceTon.text = this.m_data.mntPrice.toFixed(2) + "MNT" : this.m_txt_PriceTon.text = this.m_data.tonPrice.toFixed(2) + "TON", this.m_txt_PriceUsd.text = "= $" + this.m_data.price, this.updateWallet()
        }
        onDestroy() {
            super.onDestroy(), Laya.timer.clear(this, this.delayUnlockChainOperate)
        }
        updateWallet() {
            if (!N.wallet.connected) return this.m_btn_Wallet.visible = !1, void(this.m_btn_Disconnect.visible = !1);
            N.wallet.convertAddress().then(t => {
                var e;
                this.destroyed || (e = t.length, this.m_btn_Wallet.visible = !0, this.m_txt_Wallet.text = t.substring(0, 4) + "..." + t.substring(e - 4, e))
            })
        }
        onRechargeSuccess() {
            this.closeDialog()
        }
        connectWallet() {
            1 == this.m_data.type ? S.linkType = y.ConnectWalletForFirstRecharge : 2 == this.m_data.type ? S.linkType = y.ConnectWalletForBuyFishRecharge : 3 == this.m_data.type && (S.linkType = y.ConnectWalletForClubRecharge), N.wallet.connect().then(t => {
                this.destroyed || Laya.timer.once(500, this, () => {
                    this.destroyed || this.sendTransaction()
                })
            })
        }
        checkPayData(t) {
            return new Promise((e, i) => {
                (3 == this.m_data.type ? S.payClubBooster(this.m_data.clubId, this.m_data.price, t).then(t => {
                    if (Mmobay.MConfig.channelId == Mmobay.MConst.CHANNEL_LOCAL) return i();
                    e(t.payData)
                }) : S.requestPay(this.m_data.goodsId, t).then(t => {
                    if (Mmobay.MConfig.channelId == Mmobay.MConst.CHANNEL_LOCAL) return i();
                    e(t.payData)
                })).catch(() => {
                    i()
                })
            })
        }
        sendTransaction() {
            1 == this.m_data.type && (S.linkType = y.CheckOrderForFirstRecharge);
            let e = this.m_payData.amount,
                i = this.m_payData.walletAddress,
                s = this.m_payData.payload;
            Mmobay.MConfig.channelId == Mmobay.MConst.CHANNEL_MANTLE && Laya.Browser.onMobile ? _(ve, {
                showEffect: !1,
                retainPopup: !0
            }).then(t => {
                t.wait().then(t => {
                    t.type == o.Yes && (this.lockChainOperate(), N.wallet.sendTransaction(e, i, s, Gt.recharge, t.data).then(() => {
                        this.destroyed || this.closeDialog(o.Yes)
                    }).catch(() => {
                        this.unlockChainOperate()
                    }))
                })
            }) : (this.lockChainOperate(), N.wallet.sendTransaction(e, i, s, Gt.recharge).then(() => {
                this.destroyed || this.closeDialog(o.Yes)
            }).catch(t => {
                this.unlockChainOperate(), t && 2 == t.code && g("Insufficient funds")
            }))
        }
        playWait() {
            if (Mmobay.MConfig.channelId == Mmobay.MConst.CHANNEL_MANTLE) return this.m_box_Mantle.visible = !1, this.m_img_MantleWait.visible = !0, this.m_btn_Mantle.disabled = !0, void this.ani2.play(0, !0);
            this.m_btn_TonWallet.mouseEnabled = !1, this.m_box_TonConnect.visible = !1, this.m_img_TonConnectWait.visible = !0, this.m_btn_TonConnect.disabled = !0, this.ani3.play(0, !0)
        }
        stopWait() {
            if (Mmobay.MConfig.channelId == Mmobay.MConst.CHANNEL_MANTLE) return this.m_box_Mantle.visible = !0, this.m_img_MantleWait.visible = !1, this.m_btn_Mantle.disabled = !1, void this.ani2.stop();
            this.m_btn_TonWallet.mouseEnabled = !0, this.m_box_TonConnect.visible = !0, this.m_img_TonConnectWait.visible = !1, this.m_btn_TonConnect.disabled = !1, this.ani3.stop()
        }
        lockChainOperate() {
            Laya.timer.once(6e4, this, this.delayUnlockChainOperate), this.playWait()
        }
        unlockChainOperate() {
            Laya.timer.clear(this, this.delayUnlockChainOperate), this.stopWait()
        }
        delayUnlockChainOperate() {
            this.stopWait()
        }
        onClickWallet(t) {
            var e = this.m_btn_Disconnect.visible;
            this.m_btn_Disconnect.visible = !e
        }
        onClickDisconnect(t) {
            N.wallet.disconnect()
        }
        onClickTonWallet(t) {
            this.checkPayData(1).then(t => {
                Laya.Browser.onPC && zt(), Yt(t.paylink), this.closeDialog(o.Yes, {
                    isTonWallet: !0
                })
            })
        }
        onClickTonConnect(t) {
            this.checkPayData(2).then(t => {
                this.m_payData = t, N.wallet.connected ? this.sendTransaction() : this.connectWallet()
            })
        }
        onClickMantle(t) {
            this.checkPayData(3).then(t => {
                this.m_payData = t, Laya.Browser.onMobile || N.wallet.connected ? this.sendTransaction() : this.connectWallet()
            })
        }
    }
    L([D(l.WALLET_CONNECTED), D(l.WALLET_DISCONNECT)], fe.prototype, "updateWallet", null), L([D(l.RECHARGE_SUCCESS)], fe.prototype, "onRechargeSuccess", null);
    class T extends t.cat.views.recharge.RechargeDlgUI {
        onAwake() {
            super.onAwake(), this.m_view_FishCoin.removePlus(), this.showUI()
        }
        showUI() {
            var t = S.getPurchaseGoods();
            this.m_lst_Goods.array = t
        }
        onSelectGoods(t) {
            if (-1 != t) {
                let s = this.m_lst_Goods.selectedItem;
                s && (this.m_lst_Goods.selectedIndex = -1, S.requestPrePay(s.id).then(t => {
                    let e = 0,
                        i = 0;
                    Mmobay.MConfig.channelId == Mmobay.MConst.CHANNEL_MANTLE ? i = parseFloat(t.mntPrice) : e = parseFloat(t.tonPrice);
                    t = {
                        type: 2,
                        price: s.price,
                        tonPrice: e,
                        mntPrice: i,
                        goodsId: s.id
                    };
                    _(fe, {
                        params: [t],
                        showEffect: !1,
                        retainPopup: !0
                    }).then(t => {
                        t.wait().then(t => {
                            t.type == o.Yes && (t.data && t.data.isTonWallet ? this.showPayProcessing(3e3) : this.showPayProcessing())
                        })
                    })
                }))
            }
        }
        showPayProcessing(t = 100) {
            Laya.timer.once(t, this, () => {
                this.destroyed || _(ye, {
                    retainPopup: !0
                })
            })
        }
    }
    L([D(l.UPDATE_ITEM)], T.prototype, "showUI", null);
    class be extends t.cat.views.fish.FishItemViewUI {
        constructor(t) {
            super(), this.m_data = null, this.m_tl = null, this.m_data = t
        }
        onDestroy() {
            super.onDestroy(), this.m_tl && (this.m_tl.destroy(), this.m_tl = null)
        }
        onAwake() {
            super.onAwake();
            let t = this.m_data.fishId;
            Mmobay.MConfig.channelId == Mmobay.MConst.CHANNEL_MANTLE && 123 == t && (t = 126), this.m_img_Fish.skin = `cat/ui_fish/${t}.png`, 124 == t ? (this.m_img_Coin.skin = "", this.m_txt_Add.text = v(1048)) : 125 == t ? (this.m_img_Coin.skin = "", this.m_txt_Add.text = v(1047)) : 0 < +this.m_data.addFishCoin ? (this.m_txt_Add.text = "+" + f(this.m_data.addFishCoin), this.m_img_Coin.skin = "cat/ui_item/8.png") : (this.m_txt_Add.text = "+" + f(this.m_data.addgold), this.m_img_Coin.skin = "cat/ui_item/coin.png"), this.width = this.m_box_Con.width + 5
        }
        doAniShow() {
            this.visible = !0;
            let t = this.m_tl = new Laya.TimeLine;
            var e = this.y,
                i = 0 < (S.exdata.fishRobLvl || 0) ? 750 : 1500;
            t.to(this, {
                y: e - 120
            }, i).to(this, {
                y: e - 240,
                alpha: .3
            }, i), t.on(Laya.Event.COMPLETE, this, () => {
                this.destroy()
            }), t.play()
        }
    }
    class ke extends t.cat.views.fish.FishUpgradeDlgUI {
        onAwake() {
            super.onAwake(), this.showUI()
        }
        onDestroy() {
            super.onDestroy()
        }
        showUI() {
            var t = N.cat.getMyLv(),
                e = S.exdata.fishRobLvl || 0,
                i = Data.getFishRod(e),
                e = Data.getFishRod(e + 1);
            if (!e) return this.m_txt_Tips.visible = !0, this.m_txt_Tips.text = "MAX", this.m_txt_Tips.bottom = 100, this.m_txt_Tips.fontSize = 32, this.m_txt_Cur.text = "x" + f(i.multiple), this.m_txt_NextTip.text = this.m_txt_CurTip.text, this.m_img_Cur.visible = !1, this.m_img_Arrow.visible = !1, this.m_btn_Upgrade.visible = !1, this.m_box_Need.visible = !1, void(this.height = 420);
            e && t >= e.catMaxLvl ? (this.m_btn_Upgrade.disabled = !1, this.m_txt_Tips.visible = !1, this.m_txt_Next.text = "x" + f(e.multiple), this.m_txt_Cur.text = "x" + f(i && i.multiple || 0), this.m_txt_Num.text = S.fishCoin + "", this.m_txt_Need.text = "/" + e.costFishCoin, this.m_box_Need.visible = !0) : e && (this.m_box_Need.visible = !1, this.m_txt_Tips.visible = !0, this.m_btn_Upgrade.disabled = !0, this.m_txt_Tips.text = v(1049, e.catMaxLvl), this.m_txt_Next.text = "x" + f(e.multiple), this.m_txt_Cur.text = "x" + f(i && i.multiple || 0))
        }
        onClickUpgrade() {
            N.fish.reqFishRodUp().then(() => {
                g(v(1033)), this.showUI()
            })
        }
    }
    class we extends t.cat.views.fish.FishDlgUI {
        constructor() {
            super(), this.m_tl = null, this.isAuto = !1, this.autoNumArr = [], this.checkStop = !1, this.m_ygSpine = null, this.m_fomoSpine = null, this.m_eventMaxNum = 10, this.m_Cfg = [
                [287, 287, 20, 4],
                [245, 245, 56, 3],
                [204, 204, 98, 2],
                [155, 155, 139, 1],
                [115, 115, 188, 2],
                [75, 75, 228, 3],
                [30, 30, 268, 4]
            ]
        }
        onDestroy() {
            super.onDestroy(), this.clearTimeLine(), N.cat.goldMute = !1, x.instance.playMusic("BGM_Cafe.mp3"), N.sysNotice.reqUnWatch(Pt.fish)
        }
        onAwake() {
            super.onAwake(), this.addTitle(), N.cat.goldMute = !0, x.instance.playMusic("BGM_Excavate.mp3"), this.m_pan_Panel.elasticEnabled = !1, this.ani1.on(Laya.Event.COMPLETE, this, this.doEndFish), this.showUI(), this.m_txt_Need.text = "/" + Data.gameConf.fishCfg.costCoin, N.sysNotice.reqFishHistory().then(t => {
                for (let e of t.list) u(le, {}).then(t => {
                    this.destroyed ? t.destroy() : (t.dataChanged(e), this.m_box_Vbox.addChild(t))
                });
                N.sysNotice.reqWatch(Pt.fish)
            }), this.checkUpGradeShow(), this.checkFomoAni()
        }
        showUI() {
            var t = S.fishCoin;
            this.m_txt_Num.text = t + "", this.m_btn_Fish.visible = !1, this.m_btn_Start.visible = !0, this.m_btn_Auto.visible = !0, this.m_txt_Gold.text = f(S.gold) || "0", this.showFishBait(), this.showMyFishInfo()
        }
        showMyFishInfo() {
            N.fish.reqMyFishInfo().then(e => {
                if (!this.destroyed && (this.m_txt_NoRecord.visible = +e.myRank < 0, this.m_box_Rank.visible = 0 < +e.myRank, +e.rewardGold && _(Ce, {
                        params: [e.rewardGold, e.rewardRank]
                    }), 0 < +e.myRank)) {
                    this.m_txt_SelfRank.text = e.myRank + "", this.m_txt_Weight.text = N.fish.formatWeight(+e.myScore);
                    let t = e.myRankKey;
                    Mmobay.MConfig.channelId == Mmobay.MConst.CHANNEL_MANTLE && 123 == t && (t = 126), this.m_img_FishRank.skin = `cat/ui_fish/${t}.png`
                }
            })
        }
        showFishBait() {
            var t = S.fishCoin;
            this.m_txt_Num.text = t + "", this.m_txt_Num.color = t >= +Data.gameConf.fishCfg.costCoin ? Zt.Green : Zt.Red
        }
        showFishAni() {
            var t;
            this.m_ygSpine || (t = S.exdata.fishRobLvl || 0, this.m_ygSpine = R.create({
                url: "cat/spine/yugan.json",
                parent: this.m_box_Ani,
                px: this.m_img_Rod.x,
                py: this.m_img_Rod.y,
                autoPlay: !1,
                rate: 0 < t ? 1.5 : 1
            }));
            let e = this.m_ygSpine;
            this.m_btn_Start.visible = !1, this.m_img_Rod.visible = !1, this.m_box_Area.visible = !1, this.m_btn_Auto.visible = !1, this.m_btn_Upgrade.visible = !1, this.m_img_RodShine.visible = !1, x.instance.playSound("fish1.mp3"), e.play(0, !1, Laya.Handler.create(null, () => {
                this.m_img_Bar.visible = !0, this.m_btn_Fish.visible = !0, this.m_btn_Fish.disabled = !1, this.showBarAni()
            }))
        }
        showBarAni() {
            let t = this.m_img_Icon;
            this.clearTimeLine(), this.m_tl = new Laya.TimeLine, t.x = 40, this.m_tl.to(t, {
                x: 310
            }, 1e3).to(t, {
                x: 40
            }, 1e3), this.m_tl.play(0, !0)
        }
        doEndFish() {
            var t = this.m_Cfg.find(t => this.m_img_Icon.x > t[0]);
            if (t) {
                let e = 0 < S.fishData.eventCount;
                N.fish.reqFishing(t[3]).then(t => {
                    this.destroyed || (this.showUI(), _(ge, {
                        params: [t, !1, e],
                        closeOnSide: !0
                    }), this.m_btn_Fish.visible = !1, this.m_img_Bar.visible = !1, this.m_btn_Start.visible = !0, this.checkUpGradeShow())
                })
            }
        }
        onClickStart() {
            if (S.fishCoin >= +Data.gameConf.fishCfg.costCoin) return this.showFishAni();
            _(T, {
                closeOnSide: !0
            })
        }
        onClickFish() {
            var t;
            this.m_ygSpine || (t = S.exdata.fishRobLvl || 0, this.m_ygSpine = R.create({
                url: "cat/spine/yugan.json",
                parent: this.m_box_Ani,
                px: this.m_img_Rod.x,
                py: this.m_img_Rod.y,
                autoPlay: !1,
                rate: 0 < t ? 1.5 : 1
            }));
            let e = this.m_ygSpine;
            this.m_img_Rod.visible = !1, e.play(1, !1, Laya.Handler.create(null, () => {})), this.clearTimeLine(), this.showArea(), this.ani1.play(0, !1), this.m_btn_Fish.disabled = !0
        }
        showArea() {
            var t = this.m_Cfg.find(t => this.m_img_Icon.x > t[0]);
            t ? (this.m_box_Area.left = t[1], this.m_box_Area.right = t[2], this.m_box_Area.visible = !0) : this.m_box_Area.visible = !1
        }
        onClickInfo() {
            _(ue)
        }
        clearTimeLine() {
            this.m_tl && (this.m_tl.destroy(), this.m_tl = null)
        }
        addSys(e) {
            if (50 <= this.m_box_Vbox.numChildren) {
                let t = this.m_box_Vbox.removeChildAt(this.m_box_Vbox.numChildren - 1);
                t.destroy()
            }
            u(le, {}).then(t => {
                this.destroyed ? t.destroy() : (t.dataChanged(e), this.m_box_Vbox.addChildAt(t, 0))
            })
        }
        onClickAuto() {
            _(re).then(t => {
                t.wait().then(e => {
                    if (e.type == o.Yes) {
                        this.isAuto = !0, this.m_btn_Start.visible = !1, this.m_btn_Auto.visible = !1, this.m_box_Auto.visible = !0, this.checkStop = !!e.data[0], this.autoNumArr = [1, e.data[1]], this.m_txt_Item.text = "(" + this.autoNumArr[0] + "/" + this.autoNumArr[1] + ")", this.m_img_Rod.visible = !1;
                        e = S.exdata.fishRobLvl || 0;
                        this.m_ygSpine || (this.m_ygSpine = R.create({
                            url: "cat/spine/yugan.json",
                            parent: this.m_box_Ani,
                            px: this.m_img_Rod.x,
                            py: this.m_img_Rod.y,
                            autoPlay: !1,
                            rate: 0 < e ? 1.5 : 1
                        }));
                        let t = this.m_ygSpine;
                        x.instance.playSound("fish1.mp3"), t.play(0, !1, Laya.Handler.create(null, () => {})), this.m_btn_Upgrade.visible = !1, this.m_img_RodShine.visible = !1, this.doAutoFish(), Laya.timer.loop(0 < e ? 400 : 800, this, () => {
                            this.doAutoFish()
                        })
                    }
                })
            })
        }
        doAutoFish() {
            var t;
            this.m_txt_Item.text = "(" + this.autoNumArr[0] + "/" + this.autoNumArr[1] + ")", this.m_img_Rod.visible = !1, this.m_ygSpine || (t = S.exdata.fishRobLvl || 0, this.m_ygSpine = R.create({
                url: "cat/spine/yugan.json",
                parent: this.m_box_Ani,
                px: this.m_img_Rod.x,
                py: this.m_img_Rod.y,
                autoPlay: !1,
                rate: 0 < t ? 1.5 : 1
            }));
            let i = this.m_ygSpine;
            i.play(1, !1, Laya.Handler.create(null, () => {
                x.instance.playSound("getfish.mp3"), i._index = -1, this.autoNumArr[0]++;
                let e = 0 < S.fishData.eventCount;
                N.fish.reqFishing(1).then(t => {
                    this.destroyed || (this.showMyFishInfo(), this.showAutoFish(t), this.autoNumArr[0] > this.autoNumArr[1] ? this.onClickStop() : this.checkStop && t.myNewMax > t.myOldMax && (_(ge, {
                        params: [t, !0, e],
                        closeOnSide: !0
                    }).then(t => {
                        t.wait().then(() => {
                            this.doAutoFish();
                            var t = S.exdata.fishRobLvl || 0;
                            Laya.timer.loop(0 < t ? 400 : 800, this, () => {
                                this.doAutoFish()
                            })
                        })
                    }), Laya.timer.clearAll(this)))
                })
            }))
        }
        showAutoFish(t) {
            u(be, {
                params: [t]
            }).then(t => {
                this.destroyed ? t.destroy() : (this.addChild(t), t.x = 0, t.y = 525, t.doAniShow())
            })
        }
        onClickStop() {
            this.isAuto = !1, this.m_btn_Start.visible = !0, this.m_btn_Auto.visible = !0, this.m_box_Auto.visible = !1, Laya.timer.clearAll(this), this.checkUpGradeShow()
        }
        onClickRank() {
            _(_e)
        }
        updateGold() {
            this.m_txt_Gold.text = f(S.gold) || "0";
            var t = S.fishCoin;
            this.m_txt_Num.text = t + "", this.showFishBait()
        }
        onClickPlus(t) {
            _(T, {
                closeOnSide: !0
            })
        }
        checkUpGradeShow() {
            var t = N.cat.getMyLv(),
                e = S.exdata.fishRobLvl || 0,
                e = Data.getFishRod(e + 1);
            e && t >= e.catMaxLvl ? (this.m_btn_Upgrade.scale(1, 1), this.m_btn_Upgrade.visible = !0, this.m_img_RodShine.visible = !0, this.ani4.play()) : (208 <= t && e ? (this.m_btn_Upgrade.gray = !0, this.m_btn_Upgrade.scale(.7, .7)) : this.m_btn_Upgrade.visible = !1, this.m_img_RodShine.visible = !1, this.ani4.stop())
        }
        checkFomoAni() {
            var t = S.fishData && S.fishData.eventCount || 0;
            if (!(0 < t)) return this.m_fomoSpine && (this.m_fomoSpine.destroy(), this.m_fomoSpine = null), this.m_eventMaxNum = 10, void(this.m_pbr_Score.visible = !1);
            t > this.m_eventMaxNum && (this.m_eventMaxNum += 10 * Math.ceil((t - this.m_eventMaxNum) / 10)), this.m_pbr_Score.value = t / this.m_eventMaxNum, this.m_txt_FomoNum.text = t + "/" + this.m_eventMaxNum, this.m_pbr_Score.visible = !0, this.m_fomoSpine || (this.m_fomoSpine = R.create({
                url: "cat/spine/fomo.json",
                parent: this.m_box_Ani,
                px: 50,
                py: 450,
                autoPlay: !1,
                zOrder: -1
            })), this.m_fomoSpine.play(0, !0)
        }
        onClickUpgrade() {
            _(ke).then(t => {
                t.wait().then(() => {
                    this.destroyed || this.checkUpGradeShow()
                })
            })
        }
    }
    L([D(l.FISHCOIN_CHANGE)], we.prototype, "showFishBait", null), L([D(l.DO_CONTINUE_FISH)], we.prototype, "onClickStart", null), L([D(l.UPDATE_FISH_SYS)], we.prototype, "addSys", null), L([D(l.UPDATE_ITEM)], we.prototype, "updateGold", null), L([D(l.FISHDATA_CHANGE)], we.prototype, "checkFomoAni", null);
    class Se extends t.cat.views.home.ShopDlgUI {
        constructor() {
            super(...arguments), this.m_mouseDown = !1, this.m_mouseY = 0, this.m_scrollDis = 0
        }
        onAwake() {
            super.onAwake(), this.updateShowView(!0), this.m_lst_Cat.elasticEnabled = !1
        }
        updateShowView(t = !1) {
            this.m_lst_Cat.array = new Array(Data.maxCats).fill(null), this.updateGold();
            var e = Data.getShopCat(N.cat.getMyLv()),
                t = (t && (N.cat.freeCat ? this.m_lst_Cat.scrollTo(Math.max(0, N.cat.freeCat - 5)) : this.m_lst_Cat.scrollTo(Math.max(0, Math.max(e.fishCoinLvl, e.goldLvl) - 5))), this.m_lst_Cat.array = Object.keys(Data.Cats), Data.gameConf.initCfg.openFuc.split(",")),
                e = N.cat.getMyLv();
            this.m_box_Add.visible = e >= +t[0], this.m_view_FishCoin.hideBg()
        }
        updateGold() {
            this.m_txt_Money.text = f(S.gold) + ""
        }
        onClickGoldPlus() {
            this.closeDialog(), d(we)
        }
    }
    L([D(l.MaxCAT_CHANGE)], Se.prototype, "updateShowView", null), L([D(l.BUY_CAT)], Se.prototype, "updateGold", null);
    class xe extends t.cat.views.home.SpeedDlgUI {
        constructor() {
            super(...arguments), this.m_speedEndTime = +S.boostEndTime, this.m_freeEndTime = +S.exdata.speedFreeTime, this.m_CEndTime = +S.exdata.SpeedChainTime, this.m_spineRock = null
        }
        onAwake() {
            super.onAwake(), this.m_spineRock || (this.m_spineRock = R.create({
                url: "cat/spine/icon_effects_rocket.json",
                parent: this,
                px: 280,
                py: 180,
                autoPlay: !1
            })), Mmobay.MConfig.channelId == Mmobay.MConst.CHANNEL_MANTLE ? this.m_img_Chain.skin = "cat/ui_comm/mantle.png" : this.m_img_Chain.skin = "cat/ui_comm/ton.png", this.updateView(), this.m_txt_Time1.text = Math.ceil(+Data.gameConf.upSpeedCfg.freeTime / 60) + "min", this.m_txt_Time2.text = Math.ceil(+Data.gameConf.upSpeedCfg.costTime / 60) + "min", this.m_txt_Time3.text = Math.ceil(+Data.gameConf.upSpeedCfg.chainTime / 60) + "min", this.m_txt_Cost.text = +Data.gameConf.upSpeedCfg.costFish + ""
        }
        onDestroy() {
            super.onDestroy(), Laya.timer.clear(this, this.endChainConfirm), Laya.timer.clear(this, this.delayUnlockChainOperate)
        }
        updateView() {
            this.m_speedEndTime = +S.boostEndTime, this.m_freeEndTime = +S.exdata.speedFreeTime, this.m_CEndTime = +S.exdata.SpeedChainTime, this.m_pbr_Time.value = 0, this.m_txt_Time.visible = !1;
            var t = 1e3 * this.m_speedEndTime - Date.newDate().getTime();
            0 < t ? (this.m_tick && this.m_tick.dispose(), this.m_pbr_Time.value = t / (1e3 * +Data.gameConf.upSpeedCfg.maxTime), this.m_tick = I.create(1e3 * this.m_speedEndTime, 1e3, this.m_txt_Time), this.m_tick.start(), this.m_tick.onTick = () => {
                var t = 1e3 * this.m_speedEndTime - Date.newDate().getTime();
                this.m_pbr_Time.value = t / (1e3 * +Data.gameConf.upSpeedCfg.maxTime)
            }, this.m_tick.onEnd = () => {
                this.updateView(), N.event(l.UPDATE_SPEED)
            }, this.m_txt_Time.visible = !0, this.m_spineRock.play(0, !0), this.m_spineRock.visible = !0, this.m_img_Rock.visible = !1) : (this.m_img_Rock.visible = !0, this.m_spineRock.visible = !1), this.m_tickFree && this.m_tickFree.dispose(), 1e3 * this.m_freeEndTime > Date.newDate().getTime() ? (this.m_btn_FreeCd.visible = !0, this.m_btn_Free.visible = !1, this.m_tickFree = I.create(1e3 * +this.m_freeEndTime, 1e3, this.m_txt_FreeCd), this.m_tickFree.start(), this.m_tickFree.onEnd = () => {
                this.updateView()
            }) : (this.m_btn_FreeCd.visible = !1, this.m_btn_Free.visible = !0), this.m_tickChain && this.m_tickChain.dispose(), 1e3 * this.m_CEndTime > Date.newDate().getTime() ? (this.m_btn_ChainCd.visible = !0, this.m_btn_Chain.visible = !1, this.m_btn_Wait.visible = !1, this.ani1.stop(), this.m_tickChain = I.create(1e3 * +this.m_CEndTime, 1e3, this.m_txt_ChainCd), this.m_tickChain.start(), this.m_tickChain.onEnd = () => {
                this.updateView()
            }, Laya.timer.clear(this, this.endChainConfirm), w.removeItem(w.s_signInSpeedOrderTime)) : (this.m_btn_ChainCd.visible = !1, this.checkChainConfirm())
        }
        playWait() {
            this.m_btn_Chain.visible = !1, this.m_btn_Wait.visible = !0, this.ani1.play(0, !0)
        }
        stopWait() {
            this.m_btn_Chain.visible = !0, this.m_btn_Wait.visible = !1, this.ani1.stop()
        }
        checkChainConfirm() {
            Laya.timer.clear(this, this.delayUnlockChainOperate), Laya.timer.clear(this, this.endChainConfirm);
            var t, e = w.get(w.s_signInSpeedOrderTime) || 0;
            let i = 0;
            if (e && (e = e + 4e4, t = (new Date).getTime(), i = e - t), 0 < i) return this.playWait(), void Laya.timer.once(i, this, this.endChainConfirm);
            this.stopWait(), w.removeItem(w.s_signInSpeedOrderTime)
        }
        endChainConfirm() {
            w.removeItem(w.s_signInSpeedOrderTime), this.stopWait()
        }
        lockChainOperate() {
            this.playWait(), Laya.timer.once(6e4, this, this.delayUnlockChainOperate)
        }
        unlockChainOperate() {
            Laya.timer.clear(this, this.delayUnlockChainOperate), this.stopWait()
        }
        delayUnlockChainOperate() {
            this.stopWait()
        }
        onClickFree() {
            1e3 * this.m_freeEndTime > Date.newDate().getTime() || N.cat.reqSpeed(1).then(t => {
                S.exdata.speedFreeTime = this.m_freeEndTime = +t.SpeedFreeTime, S.boostEndTime = this.m_speedEndTime = +t.boostEndTime, N.event(l.SPEED_FREE), this.updateView()
            })
        }
        onClickChain() {
            S.BCCheckIn(xt.booster).then(t => {
                Mmobay.MConfig.channelId != Mmobay.MConst.CHANNEL_LOCAL && (this.m_payData = t.payData, Mmobay.MConfig.channelId == Mmobay.MConst.CHANNEL_MANTLE && Laya.Browser.onMobile || N.wallet.connected ? this.sendTransaction() : this.connectWallet())
            })
        }
        onClickBuy() {
            return S.fishCoin < +Data.gameConf.upSpeedCfg.costFish ? _(T, {
                closeOnSide: !0
            }) : this.m_speedEndTime - Date.newDate().getTime() / 1e3 + 3 > +Data.gameConf.upSpeedCfg.maxTime ? g(v(1029)) : void N.cat.reqSpeed(2).then(t => {
                g(v(1033)), S.boostEndTime = this.m_speedEndTime = +t.boostEndTime, this.updateView()
            })
        }
        connectWallet() {
            S.linkType = y.ConnectWalletForSignInSpeed, N.wallet.connect().then(t => {
                this.destroyed || Laya.timer.once(500, this, () => {
                    this.sendTransaction()
                })
            })
        }
        sendTransaction() {
            if (this.m_payData) {
                S.linkType = y.CheckOrderForSignInSpeed;
                let e = this.m_payData.walletAddress,
                    i = this.m_payData.payload;
                Mmobay.MConfig.channelId == Mmobay.MConst.CHANNEL_MANTLE && Laya.Browser.onMobile ? _(ve, {
                    showEffect: !1,
                    retainPopup: !0
                }).then(t => {
                    t.wait().then(t => {
                        t.type == o.Yes && (this.lockChainOperate(), N.wallet.sendTransaction(8e6, e, i, Gt.signIn, t.data).then(() => {
                            var t;
                            this.destroyed || (t = (new Date).getTime(), w.set(w.s_signInSpeedOrderTime, t), this.checkChainConfirm())
                        }).catch(() => {
                            this.unlockChainOperate()
                        }))
                    })
                }) : (this.lockChainOperate(), N.wallet.sendTransaction(8e6, e, i, Gt.signIn).then(() => {
                    var t;
                    this.destroyed || (t = (new Date).getTime(), w.set(w.s_signInSpeedOrderTime, t), this.checkChainConfirm())
                }).catch(t => {
                    this.unlockChainOperate(), t && 2 == t.code && g("Insufficient gas")
                }))
            }
        }
    }
    L([D(l.UPDATE_SPEED)], xe.prototype, "updateView", null);
    class Le extends t.cat.views.home.UpGradeDlgUI {
        constructor(t) {
            super(), this.cat = t
        }
        onAwake() {
            super.onAwake(), this.updateView(), x.instance.playSound("NewCat.mp3")
        }
        updateView() {
            var t = Data.getCat(this.cat);
            this.m_txt_OutPut.text = f(t.outGold) + "/s", this.m_view_Lv.setData(t.id);
            let e = R.create({
                url: "cat/spine/" + t.showId + ".json",
                parent: this,
                px: 257,
                py: 300,
                scale: 1,
                autoRemove: !1,
                alpha: 1
            });
            e.visible = !1, this.createPre(), this.ani1.addLabel("boom", 8), this.ani1.on(Laya.Event.LABEL, this, () => {
                R.create({
                    url: "cat/spine/boom.json",
                    parent: this,
                    px: 200,
                    py: 200,
                    autoRemove: !0,
                    alpha: 1,
                    autoPlay: !0,
                    scale: 1
                })
            }), this.ani1.on(Laya.Event.COMPLETE, this, () => {
                this.m_view_Lv.visible = !0, N.cat.playCat(e, "happy", "pose"), e.visible = !0
            }), this.ani1.play(0, !1)
        }
        createPre() {
            var t = R.create({
                    url: "cat/spine/" + Data.getCat(this.cat - 1).showId + ".json",
                    parent: this.m_box_L,
                    px: 50,
                    py: 100,
                    scale: 1,
                    autoRemove: !0,
                    alpha: 1
                }),
                t = (N.cat.playCat(t, "squat idle"), R.create({
                    url: "cat/spine/" + Data.getCat(this.cat - 1).showId + ".json",
                    parent: this.m_box_R,
                    px: 50,
                    py: 100,
                    scale: 1,
                    autoRemove: !0,
                    alpha: 1
                }));
            N.cat.playCat(t, "squat idle")
        }
        onClickShare() {
            S.doShareToTg(1, +Data.getCat(this.cat).showId)
        }
    }
    class De extends t.cat.views.squad.SquadBoostDlgUI {
        constructor(t) {
            super(), this.m_lastIndex = -1, this.m_clubId = 0, this.m_clubId = t
        }
        onAwake() {
            super.onAwake(), this.addTitle(), N.club.reqGetRecruitListClub().then(t => {
                this.showUI(t)
            })
        }
        showUI(t) {
            t = this.checkPriceShow(t);
            this.m_lst_Price.array = t, this.m_lst_Price.visible = 0 < t.length, this.m_lst_Price.selectedIndex = 0
        }
        onDestroy() {
            super.onDestroy()
        }
        checkPriceShow(i) {
            var t = i.find(t => t.id == this.m_clubId),
                s = t && t.boostVal || 0,
                a = (i = i.filter(t => t.boostVal >= +Data.gameConf.initCfg.clubMinBoost)).findIndex(t => t.id == this.m_clubId);
            let n = [];
            for (let t = 0, e = i.length; t < e; t++) {
                var o = i[t];
                if (0 == t && o.id == this.m_clubId) {
                    n.push({
                        price: 100,
                        pIndex: 0
                    });
                    break
                }
                if (15 <= t || -1 != a && t >= a) break;
                0 != t && 1 != t && 2 != t && 3 != t && 4 != t && 9 != t && 14 != t || n.push({
                    price: o.boostVal - s + 1,
                    pIndex: t
                })
            }
            return -1 == a && i.length < 15 && n.push({
                price: +Data.gameConf.initCfg.clubMinBoost - s,
                pIndex: i.length
            }), n
        }
        onSelectPrice() {
            if (-1 != this.m_lst_Price.selectedIndex && this.m_lst_Price.selectedItem) {
                if (-1 != this.m_lastIndex) {
                    let t = this.m_lst_Price.getItem(this.m_lastIndex);
                    t.isSelect = !1, this.m_lst_Price.changeItem(this.m_lastIndex, t)
                }
                let t = this.m_lst_Price.getItem(this.m_lst_Price.selectedIndex);
                t.isSelect = !0, this.m_lst_Price.changeItem(this.m_lst_Price.selectedIndex, t), this.m_lastIndex = this.m_lst_Price.selectedIndex, this.m_lst_Price.selectedIndex = -1
            }
        }
        onClickBoost() {
            var t = this.m_lst_Price.getItem(this.m_lastIndex);
            if (t) {
                let s = t.price;
                S.reqTonExchangeRate().then(t => {
                    let e = 0,
                        i = 0;
                    Mmobay.MConfig.channelId == Mmobay.MConst.CHANNEL_MANTLE ? i = +t.Usd2Mnt * s : e = +t.Usd2Ton * s;
                    t = {
                        type: 3,
                        price: s,
                        tonPrice: e,
                        mntPrice: i,
                        clubId: this.m_clubId
                    };
                    _(fe, {
                        params: [t],
                        showEffect: !1,
                        retainPopup: !0
                    })
                })
            }
        }
        onClickSquad() {
            d(Me)
        }
    }
    class Ie extends t.cat.views.squad.TotalScoreDetailDlgUI {
        constructor(t) {
            super(), this.m_showData = null, this.m_showData = t
        }
        onAwake() {
            super.onAwake(), this.showUI()
        }
        showUI() {
            this.m_txt_Earned.text = f(this.m_showData.totalEarned), this.m_txt_Burned.text = "-" + f(this.m_showData.spentAndBurned), this.m_txt_TBalance.text = f(+this.m_showData.totalEarned - +this.m_showData.spentAndBurned)
        }
        onDestroy() {
            super.onDestroy()
        }
        onClickOk() {
            this.closeDialog()
        }
    }
    class Re extends t.cat.views.squad.TotalScoreShowDlgUI {
        constructor() {
            super(...arguments), this.m_showData = null
        }
        onAwake() {
            super.onAwake(), this.addTitle(), N.club.reqGetStats().then(t => {
                this.m_showData = t, this.showUI()
            })
        }
        showUI() {
            this.m_txt_Total.text = f(+this.m_showData.totalEarned - +this.m_showData.spentAndBurned), this.m_txt_TPlayers.text = Wt(this.m_showData.totalPlayers || 0), this.m_txt_DailyNum.text = Wt(this.m_showData.dailyUsers || 0), this.m_txt_NumOl.text = Wt(this.m_showData.online || 0), this.m_txt_NumPrem.text = Wt(this.m_showData.premiumPlayers || 0);
            var i = N.club.getRandomIco(12);
            for (let e = 0; e < 12; e++) {
                let t = this["m_view_Head" + e];
                t && t.setHeadShow({
                    isCircle: !0,
                    icoUrl: i[e],
                    borderLvl: 5,
                    notShowChain: !0
                })
            }
        }
        onDestroy() {
            super.onDestroy()
        }
        onClickDetailTxt() {
            this.m_showData && _(Ie, {
                params: [this.m_showData],
                closeOnSide: !0
            })
        }
        onClickInvite() {
            S.doInviteAction()
        }
    }
    class Te extends t.cat.views.squad.RankCellViewUI {
        dataChanged(t, e) {
            e ? this.dataSource = e : e = this.dataSource;
            var i, s = e.rankData;
            this.m_img_Rank.visible = +s.rank <= 3, +s.rank <= 3 && (this.m_img_Rank.skin = `cat/ui_rank/img_ranking_number_${+s.rank}.png`), this.m_txt_Rank.visible = 3 < +s.rank, this.m_txt_Rank.text = s.rank + "", this.m_txt_Name.text = s.name, this.m_img_Score.visible = !0, this.m_txt_Score.text = f(s.score) || "0", this.m_txt_Score.color = 2 == e.league ? "#ffffff" : "#cccccc", this.m_view_Head.setHeadShow({
                isCircle: !0,
                icoUrl: s.ico,
                uname: s.name,
                borderLvl: e.league,
                channelId: s.channelId,
                notShowChain: s.isClubList
            }), this.m_img_tri.visible = s.isClubList;
            let a = 0;
            a = s.isClubList ? (i = s.id == (N.club.clubInfo && N.club.clubInfo.id), this.m_txt_Desc.text = i ? "Your" : "", this.m_txt_Name.width = i ? 185 : 240) : (i = s.id == S.id, this.m_txt_Desc.text = i ? "You" : "", this.m_txt_Name.width = i ? 185 : 240), this.m_txt_Name._tf.lines.toString() != this.m_txt_Name.text ? (this.m_txt_Over.right = a - this.m_txt_Name._tf.textWidth - 30 + 3, this.m_txt_Over.visible = !0) : this.m_txt_Over.visible = !1, this.m_img_Line.skin = `cat/ui_rank/line${e.league}.png`, this.m_img_BarBg.visible = !!e.isSelf, this.m_img_BarBg.skin = `cat/ui_rank/border2${e.league}.png`
        }
    }
    Te.CheckFlagNum = 0;
    class Ee extends t.cat.views.squad.SquadRankListDlgUI {
        constructor(t = 0, e = !1) {
            super(), this.m_listType = 0, this.m_listTypeP = 0, this.m_league = 0, this.m_selfLeague = 0, this.m_selfRankGold = 0, this.m_selfIndex = -1, this.m_cellPool = [], this.m_cellDataList = [], this.m_cellCheck = {}, this.m_headShowed = !1, this.m_txtColorCfg = {
                0: ["#D5a281", "#cd6f32"],
                1: ["#8a91b1", "#5f6eaf"],
                2: ["#f0be2e", "#e89300"],
                3: ["#8595cd", "#323e72"],
                4: ["#69b2ea", "#1082d9"],
                5: ["#c5a7ff", "#7a33c1"],
                6: ["#c5a7ff", "#8454d4"]
            }, this.m_league = t, this.m_selfLeague = S.rankLeague, this.m_selfRankGold = +S.rankGold, this.m_listTypeP = e ? 1 : 0
        }
        onAwake() {
            super.onAwake(), this.addTitle(), this.m_txt_No.visible = !0, this.m_pan_Con.vScrollBar.on(Laya.Event.CHANGE, this, this.onScrollChange), this.changeLeagueShow(), this.changeStatusShow()
        }
        onDestroy() {
            super.onDestroy(), this.removePool()
        }
        onClickStats() {
            d(Re)
        }
        onClickLeft() {
            0 != this.m_league && (this.m_league--, this.changeLeagueShow())
        }
        onClickRight() {
            6 != this.m_league && (this.m_league++, this.changeLeagueShow())
        }
        changeLeagueShow() {
            this.m_img_AdaptBg.skin = `cat/ui_bg/${this.changeImgUrl()}.png`, this.m_img_Level.skin = `cat/ui_notpack/cup_${this.changeImgUrl()}.png`, this.m_img_BorderBg2.skin = this.m_img_BorderBg3.skin = `cat/ui_rank/border${this.changeImgUrl()}.png`, this.m_img_Line.skin = `cat/ui_rank/line${this.changeImgUrl()}.png`, this.m_img_BarBg.skin = "cat/ui_rank/border10.png", this.m_img_Left.disabled = 0 == this.m_league, this.m_img_Right.disabled = 6 == this.m_league, this.m_img_Left.alpha = 0 == this.m_league ? .7 : 1, this.m_img_Right.alpha = 6 == this.m_league ? .7 : 1;
            var t = Data.gameConf.initCfg.minerLeagues.split(","),
                e = Data.gameConf.initCfg.clubLeagues.split(","),
                i = (this.m_txt_Level.text = v(1006, v(Ft[this.m_league])), this.getRankList(), N.club.clubInfo && N.club.clubInfo.league || -1),
                s = N.club.clubInfo && N.club.clubInfo.rankGold;
            let a = 0;
            0 == this.m_listTypeP ? (a = this.m_selfLeague, this.onClickPersonal()) : (a = i, this.onClickSquad()), this.m_league == a ? (this.m_txt_Tips.visible = !1, this.m_box_ScoreBar.visible = !0, this.m_pbr_Score.skin = `cat/ui_notpack/process${this.changeImgUrl()}.png`, 0 == this.m_listTypeP ? (this.m_txt_Score.text = f(this.m_selfRankGold) + "/" + f(+t[this.m_league + 1] || 0), this.m_pbr_Score.value = this.m_selfRankGold / +t[this.m_league + 1] || 0) : (this.m_txt_Score.text = f(s) + "/" + f(+e[this.m_league + 1] || 0), this.m_pbr_Score.value = +s / +e[this.m_league + 1] || 0)) : (0 == this.m_listTypeP ? this.m_txt_Tips.text = v(1005, f(+t[this.m_league])) : this.m_txt_Tips.text = v(1005, f(+e[this.m_league])), this.m_txt_Tips.visible = !0, this.m_box_ScoreBar.visible = !1), 0 == this.m_listType ? (this.m_txt_Day.color = this.m_txtColorCfg[this.m_league][1], this.m_txt_Week.color = this.m_txtColorCfg[this.m_league][0]) : (this.m_txt_Week.color = this.m_txtColorCfg[this.m_league][1], this.m_txt_Day.color = this.m_txtColorCfg[this.m_league][0]), 0 == this.m_listTypeP ? (this.m_txt_Personal.color = this.m_txtColorCfg[this.m_league][1], this.m_txt_Squad.color = this.m_txtColorCfg[this.m_league][0]) : (this.m_txt_Squad.color = this.m_txtColorCfg[this.m_league][1], this.m_txt_Personal.color = this.m_txtColorCfg[this.m_league][0]), this.m_txt_Score.color = this.m_txt_Tips.color = 2 == this.m_league ? "#ffffff" : "#cccccc", this.resetShowHeadView()
        }
        changeStatusShow() {
            N.club.reqGetStats().then(t => {
                this.m_headShowed = !0, this.m_txt_TotalPlayers.text = Wt(t.totalPlayers) + " Catizens";
                var i = N.club.getRandomIco(3);
                for (let e = 0; e < 3; e++) {
                    let t = this["m_view_Head" + e];
                    t && t.setHeadShow({
                        isCircle: !0,
                        icoUrl: i[e],
                        borderLvl: this.changeImgUrl(),
                        notShowChain: !0
                    })
                }
            })
        }
        resetShowHeadView() {
            if (this.m_headShowed)
                for (let i = 0; i < 3; i++) {
                    let t = this["m_view_Head" + i],
                        e = t.m_data;
                    t && (e.borderLvl = this.m_league, t.setHeadShow(e))
                }
        }
        onClickDay() {
            Laya.Tween.to(this.m_img_BarBg2, {
                x: 9
            }, 200), 0 != this.m_listType && (this.m_listType = 0, this.changeLeagueShow())
        }
        onClickWeek() {
            Laya.Tween.to(this.m_img_BarBg2, {
                x: 247
            }, 200), 1 != this.m_listType && (this.m_listType = 1, this.changeLeagueShow())
        }
        onClickPersonal() {
            Laya.Tween.to(this.m_img_BarBg, {
                x: 24
            }, 200), 0 != this.m_listTypeP && (this.m_listTypeP = 0, this.changeLeagueShow())
        }
        onClickSquad() {
            Laya.Tween.to(this.m_img_BarBg, {
                x: 262
            }, 200), 1 != this.m_listTypeP && (this.m_listTypeP = 1, this.changeLeagueShow())
        }
        onClickRankCell(t) {
            0 != this.m_listTypeP && t.target.dataSource && (t = t.target.dataSource, d(Ae, {
                params: [t.rankData.id]
            }))
        }
        getRankList() {
            0 == this.m_listTypeP ? N.club.reqGetGoldRankList(this.m_league, this.m_listType).then(t => {
                let i = [];
                if (t.rankList.forEach(t => {
                        i.push({
                            rankData: {
                                rank: +t.rank,
                                ico: t.icon + "",
                                isClubList: !1,
                                name: t.name,
                                id: t.userId,
                                score: +t.score,
                                channelId: t.channelID
                            },
                            league: this.changeImgUrl()
                        })
                    }), this.reSetListCon(), this.m_cellDataList = i, this.m_box_ListCon.visible = 0 < i.length, this.m_box_ListCon.height = 94 * i.length, this.onScrollChange(), this.m_txt_No.visible = 0 == i.length, this.m_box_Bottom.height = Math.max(this.m_box_ListCon.y + this.m_box_ListCon.height + 20, 400), t.myInfo) {
                    let e = {
                        rankData: {
                            id: t.myInfo.userId,
                            score: +t.myInfo.score,
                            rank: +t.myInfo.rank,
                            ico: t.myInfo.icon + "",
                            isClubList: !1,
                            name: t.myInfo.name,
                            channelId: t.myInfo.channelID
                        },
                        league: this.changeImgUrl(),
                        isSelf: !0
                    };
                    this.m_view_Self.dataChanged(null, e), this.m_view_Self.visible = !0, this.m_selfIndex = i.findIndex(t => t.rankData.id == e.rankData.id), 3 < this.m_selfIndex || this.m_selfIndex < 0 ? (this.m_view_Self.visible = !0, this.m_pan_Con.height = 1026, this.m_img_BorderBg3.bottom = -94) : 0 <= this.m_selfIndex && (this.m_view_Self.visible = !1, this.m_pan_Con.height = 1120, this.m_img_BorderBg3.bottom = 0)
                } else this.m_selfIndex = -1, this.m_view_Self.visible = !1, this.m_pan_Con.height = 1120, this.m_img_BorderBg3.bottom = 0;
                this.m_pan_Con.refresh()
            }) : 1 == this.m_listTypeP && (this.m_view_Self.visible = !1, N.club.reqGetClubGoldRankList(this.m_league, this.m_listType).then(t => {
                if (!this.destroyed) {
                    let i = [];
                    if (t.rankList.forEach(t => {
                            i.push({
                                rankData: {
                                    rank: +t.rank,
                                    ico: t.icon + "",
                                    isClubList: !0,
                                    name: t.name,
                                    id: t.id,
                                    score: +t.score
                                },
                                league: this.changeImgUrl()
                            })
                        }), this.reSetListCon(), this.m_cellDataList = i, this.m_box_ListCon.visible = 0 < i.length, this.m_box_ListCon.height = 94 * i.length, this.onScrollChange(), this.m_txt_No.visible = 0 == i.length, this.m_box_Bottom.height = Math.max(this.m_box_ListCon.y + this.m_box_ListCon.height + 20, 400), t.myRank) {
                        let e = {
                            rankData: {
                                id: t.myRank.id,
                                score: +t.myRank.score,
                                rank: +t.myRank.rank,
                                ico: t.myRank.icon + "",
                                isClubList: !0,
                                name: t.myRank.name
                            },
                            league: this.changeImgUrl(),
                            isSelf: !0
                        };
                        this.m_view_Self.dataChanged(null, e), this.m_view_Self.visible = !0, this.m_selfIndex = i.findIndex(t => t.rankData.id == e.rankData.id), 3 < this.m_selfIndex || this.m_selfIndex < 0 ? (this.m_view_Self.visible = !0, this.m_pan_Con.height = 1026, this.m_img_BorderBg3.bottom = -94) : 0 <= this.m_selfIndex && (this.m_view_Self.visible = !1, this.m_pan_Con.height = 1120, this.m_img_BorderBg3.bottom = 0)
                    } else this.m_selfIndex = -1, this.m_view_Self.visible = !1, this.m_pan_Con.height = 1120, this.m_img_BorderBg3.bottom = 0;
                    this.m_pan_Con.refresh()
                }
            }))
        }
        onScrollChange() {
            var t = this.m_pan_Con.vScrollBar.value;
            this.checkCellViewShow(t), this.m_selfIndex < 4 || (t > 112 + 94 * (this.m_selfIndex - 4) ? (this.m_view_Self.visible = !1, this.m_pan_Con.height = 1120, this.m_img_BorderBg3.bottom = 0) : (this.m_view_Self.visible = !0, this.m_pan_Con.height = 1026, this.m_img_BorderBg3.bottom = -94))
        }
        checkCellViewShow(t) {
            var e = Math.floor(t / 94);
            for (let t = e - 10; t < e + 10; t++) this.createCell(t)
        }
        createCell(t) {
            var e = this.m_cellDataList;
            e[t] && !this.m_cellCheck[t] && (this.m_cellCheck[t] = 1, this.getCellView(e[t], t))
        }
        getCellView(e, i) {
            let t = this.m_cellPool.shift();
            t ? (t.dataChanged(i, e), t.y = 94 * i, this.m_box_ListCon.addChild(t)) : u(Te, {}).then(t => {
                this.destroyed ? t.destroy() : (t.dataChanged(i, e), t.y = 94 * i, this.m_box_ListCon.addChild(t))
            })
        }
        removePool() {
            this.m_cellPool.forEach(t => {
                t.destroy()
            }), this.m_cellPool.length = 0
        }
        reSetListCon() {
            for (let t = this.m_box_ListCon.numChildren - 1; 0 <= t; t--) {
                var e = this.m_box_ListCon.removeChildAt(t);
                this.m_cellPool.push(e)
            }
            for (var t in this.m_cellCheck) delete this.m_cellCheck[t];
            this.m_cellCheck = {}
        }
        changeImgUrl() {
            return 5 == this.m_league || 6 == this.m_league ? this.m_league + 1 : this.m_league
        }
    }
    class Ae extends t.cat.views.squad.SquadInfoDlgUI {
        constructor(t = 0) {
            super(), this.m_clubId = 0, this.m_listType = 0, this.m_clubData = null, this.m_cellPool = [], this.m_cellDataList = [], this.m_cellCheck = {}, this.m_txtColorCfg = {
                0: ["#D5a281", "#cd6f32"],
                1: ["#8a91b1", "#5f6eaf"],
                2: ["#f0be2e", "#e89300"],
                3: ["#8595cd", "#323e72"],
                4: ["#69b2ea", "#1082d9"],
                5: ["#c5a7ff", "#7a33c1"],
                6: ["#c5a7ff", "#8454d4"]
            }, this.m_clubId = t
        }
        onAwake() {
            super.onAwake(), this.addTitle(), this.m_txt_No.visible = !0, this.m_pan_Con.vScrollBar.on(Laya.Event.CHANGE, this, this.onScrollChange), this.getClubInfoShow()
        }
        getClubInfoShow() {
            N.club.reqClubInfo(this.m_clubId).then(t => {
                this.m_clubData = t.club, this.showUI(t.club)
            })
        }
        showUI(t) {
            this.m_img_AdaptBg.skin = `cat/ui_bg/${this.changeImgUrl(t.league)}.png`, this.m_img_BoxBg.skin = this.m_img_Border1.skin = `cat/ui_rank/border${this.changeImgUrl(t.league)}.png`, this.m_img_Line.skin = `cat/ui_rank/line${this.changeImgUrl(t.league)}.png`, this.m_img_SLine.skin = `cat/ui_rank/line${this.changeImgUrl(t.league)}.png`, N.club.clubInfo && N.club.clubInfo.id == this.m_clubId ? (this.m_btn_Invite.visible = this.m_btn_Leave.visible = this.m_btn_Boost.visible = !0, this.m_btn_Join.visible = !1, this.m_txt_Desc.text = this.showSquadTxtByNum(t.population), this.m_txt_Desc.visible = !0, this.m_box_Con.y = 523, this.m_box_Con.height = 404, this.m_btn_Boost2.visible = !1, this.m_btn_Boost.visible = !0) : (this.m_btn_Invite.visible = this.m_btn_Leave.visible = !1, this.m_btn_Join.visible = this.m_btn_Boost.visible = !0, this.m_txt_Desc.visible = !1, this.m_box_Con.y = 390, this.m_box_Con.height = 306, this.m_btn_Boost.visible = !1, this.m_btn_Boost2.visible = !0), this.m_box_ListCon.y = this.m_box_Con.y + this.m_box_Con.height + 24, this.m_img_Cup.skin = `cat/ui_notpack/cup${this.changeImgUrl(t.league)}.png`, this.m_txt_Level.text = v(Ft[t.league]), this.m_view_Head.setHeadShow({
                isCircle: !1,
                uname: t.name,
                icoUrl: t.icon + "",
                borderLvl: this.changeImgUrl(t.league),
                notShowChain: !0
            }), this.m_txt_MemberNum.text = t.population + "";
            let e = t.name;
            var i, s;
            this.m_txt_Name.text = e, 300 < this.m_txt_Name.width && (i = e.length, s = Math.ceil((this.m_txt_Name.width - 300) / 20), this.m_txt_Name.text = e.slice(0, (i - s) / 2) + "..." + e.slice(i - (i - s) / 2)), this.m_txt_Score.text = f(t.rankGold), this.getRankList()
        }
        onClickInvite() {
            S.doInviteAction()
        }
        onClickLeave() {
            _t({
                button: K.YesNo,
                msg: v(1030, this.m_clubData.name),
                title: v(1034),
                okTxt: v(1035)
            }).then(t => {
                t.type == o.Yes && N.club.reqQuitClub().then(() => {
                    this.getClubInfoShow()
                })
            })
        }
        onClickBoost() {
            d(De, {
                params: [this.m_clubId]
            })
        }
        onClickLeague() {
            this.m_clubData && d(Ee, {
                params: [this.m_clubData.league, !0]
            })
        }
        onClickJoin() {
            this.m_btn_Join.disabled = !0, N.club.reqJoinClub(this.m_clubId).then(t => {
                this.showUI(t.club), this.m_btn_Join.disabled = !1
            })
        }
        changeTxtColor() {
            0 == this.m_listType ? (this.m_txt_Day.color = this.m_txtColorCfg[this.m_clubData.league][1], this.m_txt_Week.color = this.m_txtColorCfg[this.m_clubData.league][0]) : (this.m_txt_Week.color = this.m_txtColorCfg[this.m_clubData.league][1], this.m_txt_Day.color = this.m_txtColorCfg[this.m_clubData.league][0])
        }
        onClickDay() {
            0 != this.m_listType && (this.m_listType = 0, Laya.Tween.to(this.m_img_BarBg, {
                x: 8
            }, 200), this.getRankList())
        }
        onClickWeek() {
            1 != this.m_listType && (this.m_listType = 1, Laya.Tween.to(this.m_img_BarBg, {
                x: 244
            }, 200), this.getRankList())
        }
        getRankList() {
            this.changeTxtColor(), N.club.reqClubMemberRank(this.m_clubId, this.m_listType).then(t => {
                let e = [];
                t.rankList.forEach(t => {
                    e.push({
                        rankData: {
                            rank: +t.rank,
                            ico: t.icon + "",
                            isClubList: !1,
                            name: t.name,
                            score: +t.score,
                            id: t.userId,
                            channelId: t.channelID
                        },
                        league: this.m_clubData.league
                    })
                }), this.m_cellDataList = e, this.reSetListCon();
                t = e.length;
                this.m_txt_No.visible = 0 == t, this.m_box_SquadCon.height = 94 * t, this.m_box_ListCon.height = Math.max(this.m_box_SquadCon.y + 94 * t + 20, 380), this.onScrollChange()
            })
        }
        onClickShare() {
            var t = this.m_clubData.groupId,
                e = this.m_clubData.id;
            S.toSquadChat(t, e)
        }
        onDestroy() {
            super.onDestroy(), this.removePool()
        }
        showSquadTxtByNum(e) {
            var t = [
                [1e4, 0, 1007],
                [3e3, 1e4, 1008],
                [700, 3e3, 1009],
                [300, 700, 1010],
                [100, 300, 1011],
                [30, 100, 1012],
                [15, 30, 1013],
                [11, 15, 1014],
                [0, 11, 1015]
            ];
            return v(t.find(t => {
                if (+t[0] <= e && (!t[1] || e < +t[1])) return !0
            })[2]) || v(t[8][2])
        }
        onScrollChange() {
            var t = this.m_pan_Con.vScrollBar.value;
            this.checkCellViewShow(t)
        }
        checkCellViewShow(t) {
            var e = Math.floor(t / 94);
            for (let t = e - 10; t < e + 10; t++) this.createCell(t)
        }
        createCell(t) {
            var e = this.m_cellDataList;
            e[t] && !this.m_cellCheck[t] && (this.m_cellCheck[t] = 1, this.getCellView(e[t], t))
        }
        getCellView(e, i) {
            let t = this.m_cellPool.shift();
            t ? (t.dataChanged(i, e), t.y = 94 * i, this.m_box_SquadCon.addChild(t)) : u(Te, {}).then(t => {
                this.destroyed ? t.destroy() : (t.dataChanged(i, e), t.y = 94 * i, this.m_box_SquadCon.addChild(t))
            })
        }
        removePool() {
            this.m_cellPool.forEach(t => {
                t.destroy()
            }), this.m_cellPool.length = 0
        }
        reSetListCon() {
            for (let t = this.m_box_SquadCon.numChildren - 1; 0 <= t; t--) {
                var e = this.m_box_SquadCon.removeChildAt(t);
                this.m_cellPool.push(e)
            }
            for (var t in this.m_cellCheck) delete this.m_cellCheck[t];
            this.m_cellCheck = {}
        }
        changeImgUrl(t) {
            return 5 == t || 6 == t ? t + 1 : t
        }
    }
    class Me extends t.cat.views.squad.JoinSquadListDlgUI {
        onAwake() {
            super.onAwake(), this.addTitle(), this.m_lst_Squad.visible = !1, N.club.reqGetRecruitListClub().then(t => {
                this.m_lst_Squad.array = t, this.m_lst_Squad.visible = !0
            })
        }
        onDestroy() {
            super.onDestroy(), Laya.timer.clearAll(this)
        }
        onSelectSquad() {
            var t; - 1 != this.m_lst_Squad.selectedIndex && (t = this.m_lst_Squad.getItem(this.m_lst_Squad.selectedIndex)) && (this.m_lst_Squad.selectedIndex = -1, d(Ae, {
                params: [t.id]
            }))
        }
        onClickOtherSquad() {
            S.doCreateClubAction()
        }
    }
    class Ne extends t.cat.views.squad.InviteDetailShowDlgUI {
        constructor(t) {
            super(), this.m_showDouble = !1, this.m_showDouble = t
        }
        onAwake() {
            super.onAwake(), this.addTitle(), this.showUI()
        }
        onDestroy() {
            super.onDestroy()
        }
        showUI() {
            var s = Data.gameConf.initCfg.inviterNormalGolds.split(","),
                a = Data.gameConf.initCfg.inviterPremiumGolds.split(",");
            for (let i = 0; i < s.length; i++) {
                let t = this["m_txt_inviteB" + i],
                    e = this["m_txt_inviteP" + i];
                t && (t.text = "+" + s[i]), e && (e.text = "+" + a[i])
            }
            this.m_box_Double.visible = this.m_box_Double2.visible = this.m_showDouble
        }
        onClickInvite() {
            S.doInviteAction()
        }
        onClickDetails() {
            S.toPremiumTg()
        }
    }
    class Pe extends t.cat.views.squad.InvitePartyKingsDlgUI {
        onAwake() {
            super.onAwake(), this.addTitle(), N.invite.reqInviteRankList().then(t => {
                this.showUI(t)
            })
        }
        onDestroy() {
            super.onDestroy()
        }
        showUI(t) {
            this.m_lst_User.array = t.rankList
        }
        onClickInvite() {
            S.doInviteAction()
        }
    }
    class Fe extends t.cat.views.squad.FriendCellViewUI {
        dataChanged(t, e) {
            e ? this.dataSource = e : e = this.dataSource, this.m_txt_AddScore.text = "+" + f(e.income), this.m_txt_Score.text = f(e.rankGold), this.m_txt_Name.text = e.name, this.m_txt_Level.text = v(Ft[e.league]), this.m_img_Cup.skin = `cat/ui_notpack/cup${this.changeImgUrl(e.league)}.png`;
            var i = this.m_txt_Name.width;
            this.m_txt_Name._tf.lines.toString() != this.m_txt_Name.text ? (this.m_txt_Over.right = i - this.m_txt_Name._tf.textWidth - 25 + 3, this.m_txt_Over.visible = !0) : this.m_txt_Over.visible = !1, this.m_view_Head.setHeadShow({
                isCircle: !0,
                icoUrl: e.icon + "",
                uname: e.name,
                borderLvl: 5,
                channelId: e.channelID
            })
        }
        changeImgUrl(t) {
            return 5 == t || 6 == t ? t + 1 : t
        }
    }
    class Be extends t.cat.views.squad.FrenZoneDlgUI {
        constructor() {
            super(...arguments), this.m_cellPool = [], this.m_cellDataList = [], this.m_cellCheck = {}, this.m_showDouble = !1, this.m_ticker = null
        }
        onAwake() {
            super.onAwake(), this.addTitle(), this.m_pan_Con.vScrollBar.on(Laya.Event.CHANGE, this, this.onScrollChange), N.invite.reqFrensInfo().then(t => {
                this.showUI(t)
            })
        }
        onDestroy() {
            super.onDestroy(), this.removePool(), this.m_ticker && (this.m_ticker.dispose(), this.m_ticker = null)
        }
        showUI(t) {
            this.m_cellDataList = t.friendList;
            var e = t.friendList.length,
                e = (this.onScrollChange(), 0 < t.inviteCount && (this.m_txt_Title.text = 1 == e ? v(1031) : v(1032, t.inviteCount)), this.m_img_NoFriend.visible = e <= 0, this.m_box_ListCon.height = 150 * e, 0 == e ? (this.m_box_Friend.height = 250, this.m_img_ConBg.bottom = 50) : (1 < e ? (this.m_box_Friend.height = 150 * e + 185, this.m_img_ConBg.bottom = 85) : this.m_box_Friend.height = 200, this.m_pan_Con.refresh()), Data.gameConf.initCfg.inviterNormalGolds.split(",")),
                i = Data.gameConf.initCfg.inviterPremiumGolds.split(",");
            this.m_txt_inviteBase0.text = "+" + e[0], this.m_txt_invitePr0.text = "+" + i[0], this.m_txt_Total.text = "+" + f(t.fishCoin), N.invite.reqFrensInviterDoubleInfo().then(t => {
                this.checkDoubleShow(t)
            })
        }
        checkDoubleShow(t) {
            var e = Date.newDate().getTime(),
                i = 1e3 * +t.startTime,
                t = 1e3 * +t.endTime;
            this.m_showDouble = i < e && e < t, this.m_showDouble ? (this.m_box_Double.visible = !0, this.m_box_Event.visible = !0, this.m_box_EventOut.y = 403, this.m_ticker = I.create(t, 1e3, this.m_txt_TimeEnd), this.m_ticker.start()) : (this.m_box_Event.visible = !1, this.m_box_Double.visible = !1, this.m_box_EventOut.y = 153), this.m_box_Con.height = this.m_box_EventOut.height + this.m_box_EventOut.y + 50, this.m_pan_Con.refresh()
        }
        onClickTopLeaders(t) {
            d(Pe)
        }
        onClickDetails() {
            d(Ne, {
                params: [this.m_showDouble]
            })
        }
        onClickInvite() {
            S.doInviteAction()
        }
        onScrollChange() {
            var t = this.m_pan_Con.vScrollBar.value;
            this.checkCellViewShow(t)
        }
        checkCellViewShow(t) {
            var e = Math.floor(t / 150);
            for (let t = e - 10; t < e + 10; t++) this.createCell(t)
        }
        createCell(t) {
            var e = this.m_cellDataList;
            e[t] && !this.m_cellCheck[t] && (this.m_cellCheck[t] = 1, this.getCellView(e[t], t))
        }
        getCellView(e, i) {
            let t = this.m_cellPool.shift();
            t ? (t.dataChanged(i, e), t.y = 150 * i, this.m_box_ListCon.addChild(t)) : u(Fe, {}).then(t => {
                this.destroyed ? t.destroy() : (t.dataChanged(i, e), t.y = 150 * i, this.m_box_ListCon.addChild(t))
            })
        }
        removePool() {
            this.m_cellPool.forEach(t => {
                t.destroy()
            }), this.m_cellPool.length = 0
        }
        reSetListCon() {
            for (let t = this.m_box_ListCon.numChildren - 1; 0 <= t; t--) {
                var e = this.m_box_ListCon.removeChildAt(t);
                this.m_cellPool.push(e)
            }
            for (var t in this.m_cellCheck) delete this.m_cellCheck[t];
            this.m_cellCheck = {}
        }
    }
    class Ue extends t.cat.views.home.OffLineDlgUI {
        constructor(t) {
            super(), this.m_off = t
        }
        onAwake() {
            super.onAwake(), this.updateView()
        }
        updateView() {
            this.m_txt_Price.text = this.m_off, this.m_txt_FishCoin.text = Data.gameConf.offLineCfg.costFish, S.exdata.maxCatLvl < 10 && (this.m_img_R.visible = this.m_btn_Get.visible = !1, this.m_img_L.centerX = this.m_btn_Free.centerX = .5)
        }
        onClickFree() {
            N.cat.reqOff(0).then(() => {
                this.closeDialog(o.Yes)
            })
        }
        onClickGet() {
            if (S.fishCoin < +Data.gameConf.offLineCfg.costFish) return _(T, {
                closeOnSide: !0
            });
            N.cat.reqOff(1).then(() => {
                this.closeDialog(o.Yes)
            })
        }
    }
    class Ge extends t.cat.views.common.FingerViewUI {}
    class qe extends t.cat.views.home.FirstRechargeDlgUI {
        constructor() {
            super(...arguments), this.m_goodId = 1001
        }
        onAwake() {
            super.onAwake(), this.showUI()
        }
        onDestroy() {
            super.onDestroy(), Laya.timer.clear(this, this.endConfirm)
        }
        showUI() {
            var t, e = Data.getGoods(this.m_goodId),
                e = (this.m_img_Ton.visible = !0, this.m_img_Mantle.visible = !1, this.m_txt_FishCoin.text = Wt(e.fishCoin), this.m_txt_Gold.text = Wt(+e.gold), this.m_btn_Buy.label = "$" + e.price, w.get(w.s_firstRechargeOrderTime) || 0);
            let i = 0;
            e && (e = e + 4e4, t = (new Date).getTime(), i = e - t), i <= 0 ? (this.m_btn_Buy.visible = !0, this.m_btn_Wait.visible = !1, this.ani3.stop(), w.removeItem(w.s_firstRechargeOrderTime)) : (this.m_btn_Buy.visible = !1, this.m_btn_Wait.visible = !0, this.ani3.play(0, !0), Laya.timer.clear(this, this.endConfirm), Laya.timer.once(i, this, this.endConfirm))
        }
        endConfirm() {
            w.removeItem(w.s_firstRechargeOrderTime), this.showUI()
        }
        doClose() {
            this.closeDialog()
        }
        onClickBuy(t) {
            let s = Data.getGoods(this.m_goodId);
            S.requestPrePay(this.m_goodId).then(t => {
                let e = 0,
                    i = 0;
                Mmobay.MConfig.channelId == Mmobay.MConst.CHANNEL_MANTLE ? i = parseFloat(t.mntPrice) : e = parseFloat(t.tonPrice);
                t = {
                    type: 1,
                    price: s.price,
                    tonPrice: e,
                    mntPrice: i,
                    goodsId: this.m_goodId
                };
                _(fe, {
                    params: [t],
                    showEffect: !1,
                    retainPopup: !0
                }).then(t => {
                    t.wait().then(t => {
                        t.type == o.Yes && (t.data && t.data.isTonWallet ? this.showPayProcessing(3e3) : (t = (new Date).getTime(), w.set(w.s_firstRechargeOrderTime, t), this.showUI(), this.showPayProcessing()))
                    })
                })
            })
        }
        showPayProcessing(t = 100) {
            Laya.timer.once(t, this, () => {
                this.destroyed || _(ye, {
                    retainPopup: !0
                })
            })
        }
    }
    L([D(l.RECHARGE_SUCCESS)], qe.prototype, "doClose", null);
    class Oe extends t.cat.views.home.RandomEventsDlgUI {
        constructor(t, e = !1) {
            super(), this.m_spine = null, this.m_spineStr = "", this.m_isAuto = !1, this.m_spineStr = t, this.m_isAuto = e
        }
        onAwake() {
            super.onAwake();
            var t = S.randomEvent;
            t && (x.instance.playSound("random.mp3"), this.m_spine || (this.m_spine = R.create({
                url: "cat/spine/" + this.m_spineStr + ".json",
                parent: this.m_box_Spine,
                px: 50,
                py: 150,
                autoPlay: !1
            }), t.type == Mt.multiple ? (this.m_spine.play(2, !0), this.m_txt_Middle.text = v(1041), this.m_txt_Right.text = v(1040)) : (this.m_spine.play(3, !0), this.m_txt_Middle.text = v(1043), this.m_txt_Right.text = v(1042))), Mmobay.MConfig.channelId == Mmobay.MConst.CHANNEL_MANTLE ? this.m_img_Chain.skin = "cat/ui_comm/mantle.png" : this.m_img_Chain.skin = "cat/ui_comm/ton.png", t.type == Mt.multiple ? (t = Data.gameConf.randomEventCfg.multipleTimes.split(","), this.m_txt_Time1.text = Math.ceil(+t[0] / 60) + "min", this.m_txt_Time2.text = Math.ceil(+t[2] / 60) + "min", this.m_txt_Time3.text = Math.ceil(+t[1] / 60) + "min") : (t = Data.gameConf.randomEventCfg.boxNums.split(","), this.m_txt_Time1.text = "+" + t[0], this.m_txt_Time2.text = "+" + t[2], this.m_txt_Time3.text = "+" + t[1]), this.m_txt_Cost.text = +Data.gameConf.randomEventCfg.costFish + "", this.m_isAuto && N.cat.buyAuto && Laya.timer.once(1e4, this, () => {
                this.onClickFree()
            }))
        }
        onClickFree() {
            S.reqGetRandomEventAward(At.free).then(t => {
                this.closeDialog(o.Yes)
            })
        }
        onClickChain() {
            S.BCCheckIn(xt.randomEvent).then(t => {
                this.m_btn_Chain.disabled = this.m_btn_Buy.disabled = this.m_btn_Free.disabled = !0, this.m_txt_Time3.visible = !1, this.m_img_Wait.visible = !0, this.ani1.play(), this.m_payData = t.payData, Oe.ChainFlag = !0, Mmobay.MConfig.channelId != Mmobay.MConst.CHANNEL_LOCAL && (Mmobay.MConfig.channelId == Mmobay.MConst.CHANNEL_MANTLE && Laya.Browser.onMobile || N.wallet.connected ? this.sendTransaction() : this.connectWallet())
            })
        }
        onClickBuy() {
            S.fishCoin < +Data.gameConf.randomEventCfg.costFish ? _(T, {
                closeOnSide: !0
            }) : S.reqGetRandomEventAward(At.fishCoin).then(t => {
                this.closeDialog(o.Yes)
            })
        }
        connectWallet() {
            N.wallet.connect().then(t => {
                this.destroyed || Laya.timer.once(500, this, () => {
                    this.sendTransaction()
                })
            })
        }
        sendTransaction() {
            if (this.m_payData) {
                this.m_payData.amount;
                let e = this.m_payData.walletAddress,
                    i = this.m_payData.payload;
                Mmobay.MConfig.channelId == Mmobay.MConst.CHANNEL_MANTLE && Laya.Browser.onMobile ? _(ve, {
                    showEffect: !1,
                    retainPopup: !0
                }).then(t => {
                    t.wait().then(t => {
                        t.type == o.Yes && N.wallet.sendTransaction(8e6, e, i, Gt.signIn, t.data)
                    })
                }) : N.wallet.sendTransaction(8e6, e, i, Gt.signIn).then(() => {}).catch(t => {
                    t && 2 == t.code && g("Insufficient gas")
                })
            }
        }
        doClose() {
            this.closeDialog(o.Yes)
        }
    }
    Oe.ChainFlag = !1, L([D(l.RANDOM_EVENT_TIME_CHANGE)], Oe.prototype, "doClose", null);
    class He extends t.cat.views.home.AutoDlgUI {
        onAwake() {
            super.onAwake(), this.m_txt_Now.text = Data.gameConf.initCfg.autoCost
        }
        onClickBuy() {
            if (S.fishCoin < +Data.gameConf.initCfg.autoCost) return _(T, {
                closeOnSide: !0
            });
            N.cat.reqBuyAuto().then(() => {
                g(v(1033)), this.closeDialog()
            })
        }
    }
    class We extends t.cat.views.lunchPool.BoostMiningDlgUI {
        onAwake() {
            super.onAwake(), this.showUI()
        }
        onDestroy() {
            super.onDestroy(), Laya.timer.clearAll(this)
        }
        showUI() {
            var t = N.lunch,
                e = Data.gameConf.initCfg.inviterLaunchMax,
                i = Data.gameConf.initCfg.inviterLaunchRatio,
                s = Data.gameConf.initCfg.inviterLaunchTime,
                a = 1e3 * +t.boostEndTime,
                n = Date.newDate().getTime();
            this.m_txt_Per.text = "+" + i + "%", this.m_txt_inviteNum.text = t.inviterNum + "/" + e, +t.inviterNum < +e ? (this.m_txt_inviteNum.visible = !0, this.m_pbr_Invite.value = t.inviterNum / +e, this.m_btn_Invite.visible = !0, this.m_txt_Tips.visible = !1) : n < a && (this.m_btn_Invite.visible = !1, this.m_txt_Tips.visible = !0, this.m_pbr_Invite.value = (a - n) / 864e5, this.m_txt_inviteNum.visible = !1, this.m_tick && this.m_tick.dispose(), this.m_tick = I.create(a, 1e3, this.m_txt_Time), this.m_tick.start(), this.m_txt_Time.visible = !0, Laya.Tween.to(this.m_pbr_Invite, {
                value: 0
            }, a - n)), Object.assign(this.m_div_Info.style, {
                fontSize: 22,
                bold: !0,
                color: "#764428",
                leading: 3
            }), this.m_div_Info._element.width = 420, this.m_div_Info.innerHTML = v(2027, "&nbsp;" + e + "&nbsp;", "&nbsp;" + +s / 3600), this.m_div_Info.visible = !0
        }
        onClickInvite() {
            S.doInviteAction()
        }
    }
    L([D("updateLunchList")], We.prototype, "showUI", null);
    class Ve extends t.cat.views.lunchPool.AssetsDlgUI {
        onAwake() {
            super.onAwake(), this.updateView()
        }
        updateView() {
            this.m_lst_Assets.array = [{
                name: "$wCATI",
                num: S.wCati,
                icon: "cat/ui_item/wcati.png"
            }]
        }
    }
    class Ye extends Laya.EventDispatcher {
        constructor(t = !1) {
            super(), this._percent = 0, this._totalTime = 1e3, this.sa = -90, this.ea = 270, this._isReverse = !1, this._showTime = 0, this._isReverse = t
        }
        set showTime(t) {
            this._showTime = t
        }
        get showTime() {
            return this._showTime
        }
        get totalTime() {
            return this._totalTime
        }
        set totalTime(t) {
            this._totalTime != t && (this._totalTime = t)
        }
        get isReverse() {
            return this._isReverse
        }
        set isReverse(t) {
            this._isReverse != t && (this._isReverse = t)
        }
        bindTarget(t, e, i, s, a, n) {
            this.target && this.target.off(Laya.Event.UNDISPLAY, this, this.dispose), t && t.off(Laya.Event.UNDISPLAY, this, this.dispose), (this.target = t).once(Laya.Event.UNDISPLAY, this, this.dispose), this.mx = e, this.my = i, this.rad = s || t.width >> 1, a && (this.perLabel = a), n && (this.timeLabel = n), this.updateValue()
        }
        set percent(t) {
            this._percent != t && (this._percent = t, this.updateValue())
        }
        get percent() {
            return this._percent
        }
        get currentAngle() {
            var t = this._percent * this.totalAngle;
            return this._isReverse ? this.ea - t : this.sa + t
        }
        updateValue() {
            this.mask || (this.mask = new Laya.Sprite);
            let t = this.mask.graphics;
            t.clear();
            var e = Math.max(this._percent, .01) * this.totalAngle;
            this._percent < 1 ? this._isReverse ? t.drawPie(this.mx, this.my, this.rad, this.ea - e, this.ea, "#ff0000") : t.drawPie(this.mx, this.my, this.rad, this.sa, this.sa + e, "#ff0000") : t.drawCircle(this.mx, this.my, this.rad, "#ff0000"), this.target && (this.target.mask = this.mask), this._showTime && this.timeLabel && (this.timeLabel.text = ce((this._showTime - Date.newDate().getTime()) / 1e3, "MM:ss")), this.perLabel && (this.perLabel.text = 100 - Math.floor(100 * this._percent) + "%"), this.update && this.update.run(), this.event(Laya.Event.CHANGED)
        }
        tweenValue(t, e, i) {
            this.clearTween(), e = e || (t - this._percent) * this._totalTime, this.tween = Laya.Tween.to(this, {
                percent: t
            }, e, Laya.Ease.linearIn, Laya.Handler.create(this, () => {
                i && i.run(), this.tween = null
            }))
        }
        clearTween() {
            this.tween && (this.tween.clear(), this.tween = null)
        }
        set startAngle(t) {
            this.sa = t
        }
        set endAngle(t) {
            this.ea = t
        }
        get totalAngle() {
            return this.ea - this.sa
        }
        dispose() {
            this.clearTween(), this.target && this.target.off(Laya.Event.UNDISPLAY, this, this.dispose), this.target && (this.target.mask = null), this.target = null, this.mask && this.mask.destroy(!0), this.mask = null, this.perLabel = null, this.timeLabel = null, this.update = void 0
        }
    }
    class Xe extends t.cat.views.lunchPool.LunchDetailViewUI {
        constructor(t) {
            super(), this.m_data = t
        }
        onAwake() {
            super.onAwake(), this.updateView()
        }
        updateView() {
            this.updateCatPool(this.m_data.catPool), this.updateFishPool(this.m_data.fishPool)
        }
        updateCatPool(t) {
            this.m_txt_Sum1.text = Intl.NumberFormat().format(+this.m_data.totalScore * t.scoreRate / 100) + "", this.m_txt_Daily1.text = Intl.NumberFormat().format(Math.min(+this.m_data.totalScore * t.scoreRate / 100, Math.floor(+this.m_data.totalScore * t.scoreRate / 100 / ((+this.m_data.endTime - +this.m_data.startTime) / 24 / 3600)))), this.m_txt_Hour1.text = Intl.NumberFormat().format(+t.hourScoreLimit), this.m_txt_Stake1.text = Intl.NumberFormat().format(+t.totalStake || 0) + " $", this.m_txt_Day1.text = +ce(+this.m_data.endTime - +this.m_data.startTime, "D") + " day/s", this.m_txt_Join1.text = (t.totalPlayer || 0) + ""
        }
        updateFishPool(t) {
            this.m_txt_Sum2.text = Intl.NumberFormat().format(+this.m_data.totalScore * t.scoreRate / 100) + "", this.m_txt_Daily2.text = Intl.NumberFormat().format(Math.min(+this.m_data.totalScore * t.scoreRate / 100, Math.floor(+this.m_data.totalScore * t.scoreRate / 100 / ((+this.m_data.endTime - +this.m_data.startTime) / 24 / 3600)))), this.m_txt_Hour2.text = Intl.NumberFormat().format(+t.hourScoreLimit), this.m_txt_Stake2.text = Intl.NumberFormat().format(+t.totalStake || 0) + " Fish", this.m_txt_Day2.text = +ce(+this.m_data.endTime - +this.m_data.startTime, "D") + " day/s", this.m_txt_Join2.text = (t.totalPlayer || 0) + ""
        }
    }
    class ze extends t.cat.views.lunchPool.StakeCatDlgUI {
        constructor(t) {
            super(), this.m_data = t
        }
        onAwake() {
            super.onAwake(), this.updateView()
        }
        updateView() {
            var t = N.cat.findMaxCat();
            if (!t) return this.m_txt_Value.text = "0 $", this.m_view_Lv.visible = !1, void(this.m_img_Mask.visible = !0);
            var e = Data.getCat(t).stakeVal,
                e = (this.m_txt_Value.text = e + " $", Data.getCat(t).showId);
            let i = 200 <= +e ? .4 : .5;
            210 < t && (s = +Data.getCat(t).oldShowId, i = 200 <= s ? .5 : 100 <= s ? .45 : .38);
            var s = R.create({
                url: "cat/spine/" + e + ".json",
                px: this.width / 2,
                py: this.height / 2 - 100,
                scale: 2.2 * i,
                autoRemove: !1,
                alpha: 1
            });
            this.addChildAt(s, 1), N.cat.playCat(s, "pose"), this.m_view_Lv.setData(t), t < this.m_data.catPool.stakeLimit && (this.m_txt_Limit.visible = !0, this.m_btn_Ok.visible = !1, this.m_txt_Desc.visible = !1, this.m_txt_Limit.text = "The minimum level for staking cats is" + this.m_data.catPool.stakeLimit)
        }
        onClickOk() {
            +N.cat.findMaxCat() < this.m_data.catPool.stakeLimit || (N.lunch.reqStack(this.m_data.catPool.id, 0, this.m_data.id), this.closeDialog())
        }
    }
    class je extends t.cat.views.lunchPool.StakeFishDlgUI {
        constructor(t) {
            super(), this.m_data = t
        }
        onAwake() {
            super.onAwake(), this.m_view_Fish.setData(1, Math.max(S.fishCoin, this.m_data.fishPool.stakeLimit), this.m_data.fishPool.stakeLimit, ""), this.updateView()
        }
        updateView() {
            this.m_txt_Stake.text = this.m_view_Fish.count + "/", this.m_txt_Num.text = S.fishCoin + "", this.m_txt_Num.color = S.fishCoin >= this.m_data.fishPool.stakeLimit ? "#764428" : Zt.Red
        }
        onClickOk() {
            if (S.fishCoin < this.m_data.fishPool.stakeLimit) return _(T, {});
            N.lunch.reqStack(this.m_data.fishPool.id, this.m_view_Fish.count, this.m_data.id), this.closeDialog()
        }
    }
    L([D(l.FISHCOIN_CHANGE), D(l.COUNT_CHANGE)], je.prototype, "updateView", null);
    class $e extends t.cat.views.lunchPool.StakeCatBackDlgUI {
        constructor(t) {
            super(), this.m_data = t
        }
        onAwake() {
            super.onAwake(), this.updateView()
        }
        updateView() {
            let e;
            for (var t in N.lunch.stakeCats)
                if (N.lunch.stakeCats[t].launchId == this.m_data.id) {
                    e = N.cat.allcats[+t];
                    break
                } if (e) {
                var i = Data.getCat(e).showId;
                let t = 200 <= +i ? .4 : .5;
                210 < e && (s = +Data.getCat(e).oldShowId, t = 200 <= s ? .5 : 100 <= s ? .45 : .38);
                var s = R.create({
                    url: "cat/spine/" + i + ".json",
                    px: this.width / 2,
                    py: this.height / 2 - 60,
                    scale: 2.2 * t,
                    autoRemove: !1,
                    alpha: 1
                });
                this.addChildAt(s, 1), N.cat.playCat(s, "pose"), this.m_view_Lv.setData(e)
            }
        }
        onClickOk() {
            N.lunch.reqStack(this.m_data.catPool.id, 0, this.m_data.id, 1), this.closeDialog()
        }
    }
    class Ke extends t.cat.views.lunchPool.StakeFishBackDlgUI {
        constructor(t) {
            super(), this.m_data = t
        }
        onAwake() {
            super.onAwake(), this.updateView()
        }
        updateView() {}
        onClickOk() {
            N.lunch.reqStack(this.m_data.fishPool.id, this.m_data.fishPool.myStake, this.m_data.id, 1), this.closeDialog()
        }
    }
    class Je extends t.cat.views.lunchPool.LunchInfoViewUI {
        constructor(t) {
            super(), this.m_mask1 = new Ye, this.m_mask2 = new Ye, this.m_data = t
        }
        onEnable() {
            super.onEnable(), this.updateView()
        }
        onDestroy() {
            super.onDestroy(), this.m_mask1 && this.m_mask1.dispose(), this.m_mask2 && this.m_mask2.dispose()
        }
        updateView() {
            if (this.m_data = N.lunch.getLunchById(this.m_data.id), this.m_data && !this.destroyed) {
                var t;
                if (Date.newDate().getTime() / 1e3 > +this.m_data.endTime) return this.m_pan_Panel.visible = !1, this.m_box_End.visible = !0, t = v(Data.getLaunch(this.m_data.id).name), this.m_txt_End1.text = $t(this.m_data.catPool.gotScore) + " " + t, void(this.m_txt_End2.text = $t(this.m_data.fishPool.gotScore) + " " + t);
                this.updateCatPool(this.m_data.catPool), this.updateFishPool(this.m_data.fishPool), this.m_img_Icon1.skin = this.m_img_Icon2.skin = "cat/" + Data.getLaunch(this.m_data.id).icon
            }
        }
        updateCatPool(t) {
            var e = Date.newDate().getTime() / 1e3,
                i = v(Data.getLaunch(this.m_data.id).name);
            this.m_btn_In1.visible = +this.m_data.endTime > e, this.m_btn_In1.disabled = !!t.myStake, this.m_btn_Out1.visible = !!t.myStake && this.m_btn_In1.visible, this.m_txt_Peo1.text = (t.totalPlayer || 0) + "", this.m_txt_Sum1.text = Intl.NumberFormat().format(+this.m_data.catPool.totalStake || 0) + " $", this.m_txt_Got1.text = $t(t.gotScore) + " " + i, this.m_txt_Wait1.text = $t(t.waitScore) + " " + i, this.m_txt_MyScore1.text = Intl.NumberFormat().format(+t.myStake || 0) + " $", this.m_btn_Get1.visible = this.m_btn_In1.visible && 0 < +t.waitScore, this.m_mask1 && this.m_mask1.dispose(), this.m_box_Cd1.visible = !!t.myStake && e > +this.m_data.startTime, this.m_box_Cd1.visible && (i = jt(), this.m_mask1.bindTarget(this.m_img_Cd1, this.m_img_Cd1.width / 2, this.m_img_Cd1.height / 2, null, null, this.m_txt_Time1), this.m_mask1.clearTween(), this.m_mask1.showTime = i, this.m_mask1.percent = 1 - (i - Date.newDate().getTime()) / 36e5, this.m_mask1.tweenValue(1, i - Date.newDate().getTime(), Laya.Handler.create(this, () => {
                this.updateView()
            })))
        }
        updateFishPool(t) {
            var e = Date.newDate().getTime() / 1e3,
                i = (this.m_btn_In2.visible = +this.m_data.endTime > e, this.m_txt_Peo2.text = (t.totalPlayer || 0) + "", v(Data.getLaunch(this.m_data.id).name));
            this.m_btn_Out2.visible = this.m_btn_In2.visible && !!t.myStake, this.m_txt_Sum2.text = Intl.NumberFormat().format(+this.m_data.fishPool.totalStake || 0) + " Fish", this.m_txt_Got2.text = $t(t.gotScore) + " " + i, this.m_txt_Wait2.text = $t(t.waitScore) + " " + i, this.m_txt_MyScore2.text = Intl.NumberFormat().format(+t.myStake || 0) + " Fish", this.m_btn_Get2.visible = this.m_btn_In1.visible && 0 < +t.waitScore, this.m_mask2 && this.m_mask2.dispose(), this.m_box_Cd2.visible = !!t.myStake && e > +this.m_data.startTime, this.m_box_Cd2.visible && (i = jt(), this.m_mask2.bindTarget(this.m_img_Cd2, this.m_img_Cd2.width / 2, this.m_img_Cd2.height / 2, null, null, this.m_txt_Time2), this.m_mask2.clearTween(), this.m_mask2.showTime = i, this.m_mask2.percent = 1 - (i - Date.newDate().getTime()) / 36e5, this.m_mask2.tweenValue(1, i - Date.newDate().getTime(), Laya.Handler.create(this, () => {
                this.updateView()
            })))
        }
        onClickGet1() {
            N.lunch.reqReward(this.m_data.catPool.id, this.m_data.id)
        }
        onClickGet2() {
            N.lunch.reqReward(this.m_data.fishPool.id, this.m_data.id)
        }
        onClickIn1() {
            _(ze, {
                params: [this.m_data]
            })
        }
        onClickIn2() {
            _(je, {
                params: [this.m_data]
            })
        }
        onClickOut1() {
            _($e, {
                params: [this.m_data]
            })
        }
        onClickOut2() {
            _(Ke, {
                params: [this.m_data]
            })
        }
        onClickBuy2() {
            _(T, {
                closeOnSide: !0
            })
        }
        updateBonus(t) {
            var e = v(Data.getCat(t.launchId).name);
            t.launchId == this.m_data.id && (t.poolId == this.m_data.catPool.id ? (this.ani1.play(0, !1), this.m_txt_Add1.text = +t.addWaitScore + e) : t.poolId == this.m_data.fishPool.id && (this.ani2.play(0, !1), this.m_txt_Add2.text = +t.addWaitScore + e)), this.updateView()
        }
    }
    L([D(l.UPDATE_LUNCH)], Je.prototype, "updateView", null), L([D(l.POOLBONUS)], Je.prototype, "updateBonus", null);
    class Ze extends t.cat.views.lunchPool.LunchDlgUI {
        constructor(t) {
            super(), this.m_data = t
        }
        onAwake() {
            super.onAwake(), this.addTitle(), this.title && (this.title.top = -10), this.m_box_Stack.setupCls([{
                cls: Je,
                params: [this.m_data]
            }, {
                cls: Xe,
                params: [this.m_data]
            }]), this.updateView(), this.m_tab_Tab.selectedIndex = 0
        }
        onDestroy() {
            super.onDestroy(), this.m_tick && this.m_tick.dispose(), this.m_tickBoost && this.m_tickBoost.dispose()
        }
        onSelectTab(t) {
            this.m_box_Stack.changeIndex(t)
        }
        updateView() {
            this.m_img_Icon.skin = "cat/" + Data.getLaunch(this.m_data.id).icon, this.m_txt_Name.text = v(this.m_data.name), this.m_txt_Sum.text = Intl.NumberFormat().format(+this.m_data.totalScore), this.m_img_State.skin = "cat/ui_lunch/preparation.png", this.m_txt_Last.text = +ce(+this.m_data.endTime - +this.m_data.startTime, "D") + " day/s";
            var t = Date.newDate().getTime() / 1e3;
            t < +this.m_data.startTime ? (this.m_txt_TimeDesc.text = v(11001), this.m_tick = I.create(1e3 * +this.m_data.startTime, 1e3, this.m_txt_Time, "D:HH:MM:ss"), this.m_tick.onEnd = () => {
                this.updateView()
            }, this.m_tick.start()) : t < +this.m_data.endTime ? (this.m_txt_TimeDesc.text = v(11003), this.m_img_State.skin = "cat/ui_lunch/mining.png", this.m_tick = I.create(1e3 * +this.m_data.endTime, 1e3, this.m_txt_Time, "D:HH:MM:ss"), this.m_tick.onEnd = () => {
                this.updateView()
            }, this.m_tick.start()) : (this.m_txt_TimeDesc.text = v(11002), this.m_img_State.skin = "cat/ui_lunch/completed.png", this.m_txt_Time.text = wt(Date.newDate(1e3 * +this.m_data.endTime), "yyyy-mm-dd")), this.checkBoostShow()
        }
        onClickBoost() {
            _(We)
        }
        onClickAsset() {
            _(Ve)
        }
        checkBoostShow() {
            var t = Data.gameConf.initCfg.inviterLaunchMax,
                e = (this.m_txt_Per.text = "+" + Data.gameConf.initCfg.inviterLaunchRatio + "%", 1e3 * +N.lunch.boostEndTime),
                i = Date.newDate().getTime();
            !(+N.lunch.inviterNum < +t) && i < e ? (this.m_tickBoost && this.m_tickBoost.dispose(), this.m_tickBoost = I.create(e, 1e3, this.m_txt_BoostEnd), this.m_tickBoost.start(), this.m_btn_Boost.label = "", this.m_box_Speed.visible = !0, Laya.timer.once(e - i, this, () => {
                this.checkBoostShow()
            })) : (this.m_box_Speed.visible = !1, this.m_btn_Boost.label = v(2028))
        }
    }
    L([D("updateLunch")], Ze.prototype, "updateView", null);
    class Qe extends t.cat.views.lunchPool.LunchCellViewUI {
        constructor(t) {
            super(), this.m_mask1 = new Ye, this.m_mask2 = new Ye, this.m_data = t
        }
        onAwake() {
            super.onAwake(), this.updateView()
        }
        onDestroy(t) {
            super.onDestroy(), this.m_tick && this.m_tick.dispose(), this.m_mask1 && this.m_mask1.dispose(), this.m_mask2 && this.m_mask2.dispose()
        }
        updateView() {
            let e = this.m_data;
            this.on(Laya.Event.CLICK, this, () => {
                d(Ze, {
                    params: [e]
                })
            }), this.m_data = e, this.m_img_Icon.skin = this.m_img_Icon1.skin = this.m_img_Icon2.skin = "cat/" + Data.getLaunch(e.id).icon, this.m_btn_Stake1.visible = this.m_btn_Stake2.visible = !0, this.m_img_Cd1.visible = this.m_img_Cd2.visible = !1, this.m_txt_Name.text = v(e.name) + "", this.m_txt_Sum.text = Intl.NumberFormat().format(+e.totalScore), this.m_txt_Last.text = +ce(+e.endTime - +e.startTime, "D") + " day/s";
            var i = Date.newDate().getTime() / 1e3;
            if (this.m_tick && this.m_tick.dispose(), this.m_txt_CatDesc1.text = v(e.catPool.scoreRate) + "%", this.m_txt_FishDesc1.text = v(e.fishPool.scoreRate) + "%", this.m_txt_CatDesc1.visible = this.m_txt_FishDesc1.visible = i < +e.startTime, this.m_txt_FishDesc2.visible = this.m_txt_FishDesc3.visible = this.m_txt_FishDesc4.visible = this.m_txt_Stake1.visible = this.m_txt_Stake2.visible = this.m_txt_Sum1.visible = this.m_txt_Sum2.visible = this.m_txt_People1.visible = this.m_txt_People2.visible = this.m_txt_CatDesc2.visible = this.m_txt_CatDesc3.visible = this.m_txt_CatDesc4.visible = !this.m_txt_CatDesc1.visible, i < +e.startTime ? (this.m_img_State.skin = "cat/ui_lunch/preparation.png", this.m_txt_TimeDesc.text = v(11001), this.m_tick = I.create(1e3 * +e.startTime, 1e3, this.m_txt_Time, "D:HH:MM:ss"), this.m_tick.onEnd = () => {
                    this.updateView()
                }, this.m_tick.start(), this.m_txt_CatDesc1.text = v(11004, e.catPool.scoreRate + "%"), this.m_txt_FishDesc1.text = v(11004, e.fishPool.scoreRate + "%")) : (i < +e.endTime ? (this.m_txt_TimeDesc.text = v(11003), this.m_img_State.skin = "cat/ui_lunch/mining.png", this.m_tick = I.create(1e3 * +e.endTime, 1e3, this.m_txt_Time, "D:HH:MM:ss"), this.m_tick.onEnd = () => {
                    this.updateView()
                }, this.m_tick.start(), s = jt(), this.m_box_Cd1.visible = !!e.catPool.myStake, e.catPool.myStake && (this.m_mask1.bindTarget(this.m_img_Cd1, this.m_img_Cd1.width / 2, this.m_img_Cd1.height / 2, null, null, this.m_txt_Time1), this.m_mask1.clearTween(), this.m_mask1.showTime = s, this.m_mask1.percent = 1 - (s - Date.newDate().getTime()) / 36e5, this.m_mask1.tweenValue(1, s - Date.newDate().getTime(), Laya.Handler.create(this, () => {
                    this.updateView(), N.event("updateLunch")
                }))), this.m_box_Cd2.visible = !!e.fishPool.myStake, e.fishPool.myStake && (this.m_mask2.bindTarget(this.m_img_Cd2, this.m_img_Cd2.width / 2, this.m_img_Cd2.height / 2, null, null, this.m_txt_Time2), this.m_mask2.clearTween(), this.m_mask2.showTime = s, this.m_mask2.percent = 1 - (s - Date.newDate().getTime()) / 36e5, this.m_mask2.tweenValue(1, s - Date.newDate().getTime(), Laya.Handler.create(this, () => {
                    this.updateView(), N.event("updateLunch")
                })))) : (this.m_txt_FishDesc2.visible = this.m_txt_Stake2.visible = this.m_txt_CatDesc2.visible = this.m_txt_Stake1.visible = !1, this.m_img_State.skin = "cat/ui_lunch/completed.png", this.m_txt_TimeDesc.text = v(11002), this.m_btn_Stake1.visible = this.m_btn_Stake2.visible = !1, this.m_txt_Time.text = wt(Date.newDate(1e3 * +e.endTime), "yyyy-mm-dd")), e.catPool.myStake && (this.m_btn_Stake1.visible = !1, this.m_img_Cd1.visible = !0), this.m_txt_Stake1.text = Intl.NumberFormat().format(+e.catPool.myStake || 0) + " $", this.m_txt_People1.text = Intl.NumberFormat().format(+e.catPool.totalPlayer || 0) + "", this.m_txt_Sum1.text = Intl.NumberFormat().format(+e.catPool.totalStake) + " $", e.fishPool.myStake && (this.m_btn_Stake2.visible = !1, this.m_img_Cd2.visible = !0), this.m_txt_Stake2.text = Intl.NumberFormat().format(+e.fishPool.myStake || 0) + " Fish", this.m_txt_People2.text = Intl.NumberFormat().format(+e.fishPool.totalPlayer || 0) + "", this.m_txt_Sum2.text = Intl.NumberFormat().format(+e.fishPool.totalStake) + " Fish"), i < +e.endTime) {
                this.height = 800;
                let t = 0;
                var s = 1e3 * +N.lunch.boostEndTime;
                t = i < s ? 2 : 1, this.m_spine || (this.m_spine = R.create({
                    url: "cat/spine/miningboost.json",
                    parent: this,
                    px: this.width / 2,
                    py: 250
                })), this.m_spine.play(0, !0), i > +e.startTime && (e.catPool.myStake || e.fishPool.myStake) && this.m_spine.play(t, !0), this.m_spine.visible = !0, this.m_box_Vbox.y = 330
            } else this.height = 690, this.m_box_Vbox.y = 230, this.m_spine && (this.m_spine.visible = !1)
        }
        updateLunch() {
            this.m_data && (this.m_data = N.lunch.getLunchById(this.m_data.id), this.updateView())
        }
    }
    L([D(l.UPDATE_LUNCH), D(l.UPDATE_LUNCH)], Qe.prototype, "updateLunch", null);
    class ti extends t.cat.views.lunchPool.LunchListDlgUI {
        constructor() {
            super(...arguments), this.m_tickBoost = null
        }
        onAwake() {
            super.onAwake(), N.lunch.isLunchDlg = !0, this.addTitle(), this.title && (this.title.top = -10), this.getLunchInfo()
        }
        onDestroy() {
            super.onDestroy(), N.lunch.isLunchDlg = !1, this.m_tickBoost && this.m_tickBoost.dispose()
        }
        updateView() {
            this.m_box_Vbox.destroyChildren();
            for (var t of N.lunch.m_lunchs) u(Qe, {
                params: [t]
            }).then(t => {
                this.m_box_Vbox.addChild(t)
            })
        }
        onClickBoost() {
            _(We)
        }
        onClickAsset() {
            _(Ve)
        }
        getLunchInfo() {
            N.lunch.reqLunchList().then(t => {
                this.updateView(), this.checkBoostShow(t)
            })
        }
        checkBoostShow(t) {
            var e = Data.gameConf.initCfg.inviterLaunchMax,
                i = (this.m_txt_Per.text = "+" + Data.gameConf.initCfg.inviterLaunchRatio + "%", 1e3 * +t.BoostEndTime),
                s = Date.newDate().getTime();
            !(+t.inviterNum < +e) && s < i ? (this.m_tickBoost && this.m_tickBoost.dispose(), this.m_tickBoost = I.create(i, 1e3, this.m_txt_BoostEnd), this.m_tickBoost.start(), this.m_btn_Boost.label = "", this.m_box_Speed.visible = !0, Laya.timer.once(i - s, this, () => {
                this.getLunchInfo()
            })) : (this.m_box_Speed.visible = !1, this.m_btn_Boost.label = v(2028))
        }
    }
    L([D("updateLunch")], ti.prototype, "updateView", null);
    class E extends t.cat.views.home.OfficeDlgUI {
        constructor() {
            super(...arguments), this.catSpines = [], this.m_spineRock = null, this.m_spineRandom = null, this.m_randomShowed = !1, this.m_offLineShowed = !1, this.m_customScaleFlag = 50, this.m_speedScale = 4, this.m_speedFlag = !1, this.m_isCustoming = !1, this.m_isCustoming2 = !1, this.customingCatSpines = [], this.m_speedCustomNum = 0, this.m_speedTemp = [], this.m_speedPeople = [], this.m_airDrops = {}, this.m_mouseCat = -1, this.count = 0, this.m_checkTime = 0, this.m_flag = 0
        }
        onAwake() {
            super.onAwake(), this.hitTestPrior = !1, this.updateBg(), Laya.timer.clearAll(this), this.checkNew(), this.checkOpenMenu(), this.checkFreeBoostRed(), this.updateView(), this.updateOutPut(), this.updateGold(), this.updateShopRed(), this.checkTaskRed(), this.checkLink(), this.checkSoundImgShow(), this.updateRechargeShow(), this.checkOffLine(), this.checkGoldRain(), S.checkRandomBox(), this.updateAuto(), this.checkCustom(), this.checkInviteDouble(), Laya.timer.loop(2e3, this, this.checkCreateTip), Laya.timer.loop(5e3, this, this.checkFreeCat);
            var t = Mmobay.adaptOffsetWidth;
            this.m_box_Squad.x = 270 + t / 3, this.m_btn_ReCharge.x = 6 - t / 2 * (2 / 3), this.m_btn_Mine.x = 107 - t / 2 * (1 / 3), this.m_btn_Shop.x = 360 + t / 2 * (1 / 3), this.m_btn_Invite.x = 461 + t / 2 * (2 / 3), x.instance.playMusic("BGM_Cafe.mp3"), this.m_box_Rank.on(Laya.Event.CLICK, this, () => {
                this.onClickRank()
            });
            for (let e = 0; e < N.cat.allcats.length; e++) {
                let t = N.cat.allcats[e];
                t && Laya.timer.frameOnce(e % 2 + 1, this, () => {
                    this.createIndexCat(e, t)
                })
            }
            Laya.timer.frameLoop(2, this, () => {
                for (let e = 0; e < this.m_box_Con.numChildren; e++) {
                    let t = this.m_box_Con.getChildAt(e);
                    "people" == t.name && (this.m_isCustoming2, t.zOrder = t.y), t && (t.zOrder = t.y)
                }
            }), Laya.timer.once(1e4, this, this.findCustomCat), this.updateClubShow(), this.updateRankShow(), this.updateSpeed(), Laya.timer.once(2e3, this, () => {
                this.checkCatSpeed()
            }), this.on(Laya.Event.MOUSE_DOWN, this, this.clearSumTip), Laya.timer.loop(5e3, this, this.checkSum), this.m_randomShowed || Laya.timer.loop(5e3, this, this.checkShowRandomEvent), N.cat.isAuto && Laya.timer.frameOnce(12, this, () => {
                this.buyAuto()
            })
        }
        updateBg(t) {
            let e = N.club.getLeagueByScore(+S.rankGold);
            if (5 <= (e = (e = t ? t : e) < 0 ? 6 : e)) {
                this.m_img_Wall.skin = `cat/ui_bg/wall${e+1}.png`, this.m_img_Hall.skin = `cat/ui_bg/office${e+1}.png`, this.m_img_Bg.skin = `cat/ui_bg/office${e+1}_1.png`, this.m_img_Door.visible = this.m_img_Door2.visible = !1;
                let t = this["rank" + e];
                t.play(0, !1)
            } else this.m_img_Wall.skin = "cat/ui_bg/wall1.png", this.m_img_Hall.skin = "cat/ui_bg/office1.png", this.m_img_Bg.skin = "cat/ui_bg/office1_1.png", this.m_img_Door.visible = this.m_img_Door2.visible = !0, this.rank1.play(0, !1)
        }
        checkLink() {
            S.linkType == y.Recharge || S.linkType == y.ConnectWalletForBuyFishRecharge ? _(T) : S.linkType == y.ConnectWalletForClubRecharge ? this.onClickSquad() : S.linkType == y.ConnectWalletForSignInSpeed ? _(xe) : S.linkType == y.ConnectWalletForFirstRecharge && _(qe)
        }
        checkCreateTip() {
            4 <= N.cat.getMyLv() || 4 <= this.count || this.m_finger && this.m_finger.visible ? Laya.timer.clear(this, this.checkCreateTip) : this.getSumIndex().length || (this.m_finger ? (this.count++, this.m_finger.visible = !0) : (this.count++, u(Ge, {
                params: []
            }).then(t => {
                this.addChild(t), t.centerX = +t.width / 2, (this.m_finger = t).y = this.m_btn_Generate.y + t.height - 67
            })))
        }
        clearSumTip() {
            this.m_img_SumTip.visible = !1, Laya.Tween.clearAll(this.m_img_SumTip), Laya.timer.loop(5e3, this, this.checkSum)
        }
        checkOffLine() {
            S.offLine && S.offLine.length ? (s.instance.removeAllPopup(), _(Ue, {
                params: [S.offLine]
            }).then(t => {
                t.wait().then(() => {
                    this.m_offLineShowed = !0, this.checkShowRandomEvent(!0)
                })
            }), S.offLine = 0) : (this.m_offLineShowed = !0, this.checkShowRandomEvent(!0))
        }
        onDestroy() {
            super.onDestroy(), Laya.timer.clearAll(this)
        }
        updateGold() {
            this.m_txt_Gold.text = f(S.gold), this.updateCoinBgSize()
        }
        updateCoinBgSize() {
            this.m_img_SpeedBg.width = this.m_txt_Speed.width + 22;
            let t = Math.max(this.m_txt_Gold.width, 93) + 32;
            Laya.timer.callLater(this, () => {
                this.m_img_CoinBg.width = this.m_img_SpeedBg.width + 10 + t + 10 + 50 + 25, this.m_box_SpeedBox.width = this.m_img_SpeedBg.width, Laya.timer.callLater(this, () => {
                    this.m_box_Plus.x = this.m_img_CoinBg.x + this.m_txt_Gold.x + this.m_txt_Gold.width + 4
                })
            })
        }
        updateOutPut(t = !1) {
            this.updateFuc(), this.checkOpenMenu(), t || (t = N.cat.nowGenerateCat, this.m_txt_Lv.text = t + "", !this.m_nowCatSpine || this.m_nowCatSpine.destroyed ? (this.m_nowCatSpine = R.create({
                url: "cat/spine/" + Data.getCat(t).showId + ".json",
                parent: this,
                px: 75,
                py: 60,
                scale: .7,
                autoRemove: !1,
                alpha: 1
            }), N.cat.playCat(this.m_nowCatSpine, "squat idle"), this.m_btn_Generate.addChildAt(this.m_nowCatSpine, 0)) : +this.m_nowCatSpine.name != t && (this.m_nowCatSpine.destroy(), this.m_nowCatSpine = R.create({
                url: "cat/spine/" + Data.getCat(t).showId + ".json",
                parent: this,
                px: 75,
                py: 64,
                scale: .7,
                autoRemove: !1,
                alpha: 1
            }), N.cat.playCat(this.m_nowCatSpine, "squat idle"), this.m_btn_Generate.addChildAt(this.m_nowCatSpine, 1)), this.m_txt_Price.text = f(N.cat.getNowPrice()) + "", this.m_txt_Speed.text = f(N.cat.getOutPutSpeed()) + "/s", this.m_img_SpeedAdd.visible = 0 < N.cat.getSpeedAdd() - 1, this.m_txt_SpeedAdd.text = "+" + 100 * (N.cat.getSpeedAdd() - 1) + "%", Laya.timer.callLater(this, () => {
                this.destroyed || (this.m_img_SpeedAdd.width = this.m_txt_SpeedAdd.width + 20)
            }), this.updateCoinBgSize())
        }
        onClickPlus() {
            d(we).then(t => {
                t.wait().then(() => {
                    this.destroyed || this.checkGoldRain()
                })
            })
        }
        updateView() {
            this.updateCat()
        }
        updateCat() {
            this.m_lst_Cat.array = N.cat.getCats()
        }
        checkShowRandomEvent(t = !1) {
            if (!this.m_randomShowed && this.m_offLineShowed) {
                var e = S.randomEvent,
                    i = N.cat.getMyLv(),
                    i = Data.getRandomEvent(i),
                    s = Date.newDate().getTime(),
                    a = e && 1e3 * +e.time || 0;
                if (i)
                    if (this.m_spineRandom) t && this.m_spineRandom.event(Laya.Event.CLICK, [null, !0]);
                    else if (e) {
                    if (e.isDone && s - a > 1e3 * i.interval) S.reqRandomEvent().then(() => {
                        this.checkShowRandomEvent(t)
                    });
                    else if (!e.isDone)
                        if (!e.isDone && s - a > 1e3 * i.interval + 1e3) S.reqRandomEvent().then(() => {
                            this.checkShowRandomEvent(t)
                        });
                        else if (t || e.isDone || !(s - a > 1e3 * +Data.gameConf.randomEventCfg.disappearTime)) {
                        let i = ["duck", "pepe", "doge"][Math.randRange(0, 2)],
                            e = R.create({
                                url: "cat/spine/" + i + ".json",
                                px: Math.randRange(50, 500),
                                py: Math.randRange(40, 400),
                                scale: .6,
                                autoPlay: !0,
                                autoRemove: !1,
                                alpha: 1,
                                zOrder: 1,
                                offset: [-50, -200]
                            });
                        this.m_box_Con.addChild(e), (this.m_spineRandom = e).size(200, 300), e.pivot(100, 250), e.on(Laya.Event.CLICK, this, (t, e = !1) => {
                            this.clearRandomSpine(), Laya.timer.clear(this, this.checkShowRandomEvent), _(Oe, {
                                params: [i, null, e]
                            }).then(t => {
                                t.wait().then(t => {
                                    t.type != o.No && t.type != o.None || Oe.ChainFlag || S.reqGetRandomEventAward(At.close), Laya.timer.loop(5e3, this, this.checkShowRandomEvent)
                                })
                            })
                        }), this.doRandomSpineAni(), Laya.timer.once(1e4, this, () => {
                            u(Ge, {
                                params: []
                            }).then(t => {
                                e.destroyed ? t.destroy() : (e.addChild(t), t.centerX = +t.width / 2, t.y = 150)
                            })
                        }), t && e.event(Laya.Event.CLICK, [null, !0])
                    }
                } else S.reqRandomEvent().then(() => {
                    this.checkShowRandomEvent(t)
                })
            }
        }
        doRandomSpineAni() {
            let s = this.m_spineRandom;
            if (s) {
                var a = S.randomEvent,
                    n = Date.newDate().getTime(),
                    o = a && 1e3 * +a.time || 0;
                let e = !1,
                    t = (!a.isDone && n - o > 1e3 * +Data.gameConf.randomEventCfg.disappearTime && (e = !0), 0),
                    i = 0;
                i = (t = e ? .5 < Math.random() ? Math.randRange(-80, -20) : Math.randRange(580, 640) : Math.randRange(50, 520), Math.randRange(50, 400)), t > s.x ? s.scaleX = -1 * Math.abs(s.scaleX) : s.scaleX = +Math.abs(s.scaleX), s.play(0, !0);
                a = Ot(t, i, s.x, s.y);
                Laya.Tween.to(s, {
                    x: t,
                    y: i
                }, a / .1 * 2 / (this.m_speedFlag ? this.m_speedScale : 1), null, Laya.Handler.create(this, t => {
                    e ? (N.cat.isAuto && S.reqGetRandomEventAward(At.free), this.clearRandomSpine()) : s.play(1, !1, Laya.Handler.create(this, () => {
                        this.doRandomSpineAni()
                    }))
                }))
            }
        }
        clearRandomSpine() {
            this.m_spineRandom && (Laya.Tween.clearAll(this.m_spineRandom), this.m_spineRandom.destroy(), this.m_spineRandom = null)
        }
        onClickFish() {
            d(we).then(t => {
                t.wait().then(() => {
                    this.destroyed || this.checkGoldRain()
                })
            })
        }
        updateRechargeShow() {}
        onClickReCharge() {
            _(S.checkFirstReCharge() ? T : qe)
        }
        onClickSquad() {
            N.club.clubInfo ? d(Ae, {
                params: [N.club.clubInfo.id]
            }) : d(Me)
        }
        onClickGenerate() {
            let e = -1;
            for (let t = 0; t < 12; t++)
                if (!N.cat.allcats[t]) {
                    e = t;
                    break
                } return -1 == e ? g(v(1027)) : S.gold < N.cat.getCatCost(N.cat.nowGenerateCat) ? g(v(168)) : void N.cat.reqCreate()
        }
        refreshOutPut() {
            this.aniOutChange.play(0, !1), this.m_txt_Speed.text = f(N.cat.getOutPutSpeed()) + "/s", this.m_img_SpeedAdd.visible = 0 < N.cat.getSpeedAdd() - 1, this.m_txt_SpeedAdd.text = "+" + 100 * (N.cat.getSpeedAdd() - 1) + "%", Laya.timer.callLater(this, () => {
                this.destroyed || (this.m_img_SpeedAdd.width = this.m_txt_SpeedAdd.width + 20)
            }), this.updateCoinBgSize()
        }
        buyCat(t) {
            this.m_finger && (this.m_finger.visible = !1), Laya.timer.loop(2e3, this, this.checkCreateTip), this.m_lst_Cat.changeItem(t.index, t.catLvl), this.createIndexCat(t.index, t.catLvl), this.m_txt_Price.text = f(N.cat.getNowPrice()) + ""
        }
        createIndexCat(t, e = N.cat.nowGenerateCat) {
            this.m_lst_Cat.changeItem(t, e), this.catSpines[t] && (this.catSpines[t].destroy(), this.catSpines[t] = null);
            let i = .6;
            var s = Data.getCat(e),
                s = +s.oldShowId || +s.showId;
            200 <= s ? i = .66 : s < 100 && (i = .55);
            let a = this.catSpines[t] = R.create({
                url: "cat/spine/" + Data.getCat(e).showId + ".json",
                px: Math.randRange(50, 500),
                py: Math.randRange(40, 400),
                scale: i,
                autoPlay: !0,
                autoRemove: !1,
                alpha: 1,
                zOrder: 1
            });
            this.m_box_Con.addChild(a), a.name = e + "", !a.skeleton || a.destroyed ? a._templet.once(Laya.Event.COMPLETE, this, () => {
                this.catAniStep(Math.floor(4 * Math.random()), a, t)
            }) : this.catAniStep(Math.floor(4 * Math.random()), a, t)
        }
        catAniStep(e, i, s) {
            if (!i.destroyed && i._templet)
                if (this.m_isCustoming) N.cat.playCat(i, "squat idle");
                else {
                    i._index = -1;
                    let t = 0;
                    switch (e) {
                        case 0:
                            t = i.getAniIndexByName("pose"), .5 < Math.random() ? i.play(t, !1, Laya.Handler.create(this, () => {
                                this.catAniStep(1, i, s)
                            })) : this.catAniStep(1, i, s);
                            break;
                        case 1:
                            0 < Math.random() ? (t = i.getAniIndexByName("tongue"), i.play(t, !1, Laya.Handler.create(this, () => {
                                this.catAniStep(2, i, s)
                            }))) : (t = i.getAniIndexByName("squat"), i.play(t, !1, Laya.Handler.create(this, () => {
                                t = .5 < Math.random() ? i.getAniIndexByName("squat idle") : i.getAniIndexByName("squat idle2"), i.play(t, !1, Laya.Handler.create(this, () => {
                                    this.catAniStep(2, i, s)
                                }))
                            })));
                            break;
                        case 2:
                            var a = [
                                    ["stretch"],
                                    ["walk"],
                                    ["walk"],
                                    ["walk"],
                                    ["run"],
                                    ["run"],
                                    ["break"],
                                    ["walk", "fall", "fall idle"],
                                    ["walk", "sleep", "stretch"],
                                    ["walk", "hungry", "stretch"],
                                    ["run", "fall", "fall idle"],
                                    ["fall", "run"]
                                ],
                                a = a[Math.randRange(0, a.length - 1)];
                            this.catAniStepEx(i, a, 0, s);
                            break;
                        case 3:
                            .5 < Math.random() ? (t = i.getAniIndexByName("tongue"), i.play(t, !1, Laya.Handler.create(this, () => {
                                this.catAniStep(0, i, s)
                            }))) : (t = i.getAniIndexByName("squat"), i.play(t, !1, Laya.Handler.create(this, () => {
                                t = .5 < Math.random() ? i.getAniIndexByName("squat idle") : i.getAniIndexByName("squat idle2"), i.play(t, !1, Laya.Handler.create(this, () => {
                                    this.catAniStep(0, i, s)
                                }))
                            })))
                    }
                }
        }
        catAniStepEx(e, i, s, a) {
            if (this.m_isCustoming) N.cat.playCat(e, "squat idle");
            else if (i[s])
                if (e._index = -1, "run" == i[s] || "walk" == i[s]) {
                    var n = this.doCatMovePos(e),
                        o = Ot(n.x, n.y, e.x, e.y);
                    let t = 0;
                    t = "run" == i[s] ? o / .2 * 2 : o / .1 * 2, n.x > e.x ? e.scaleX = -1 * Math.abs(e.scaleX) : e.scaleX = +Math.abs(e.scaleX);
                    o = e.getAniIndexByName(i[s]);
                    e.play(o, !0), s++, Laya.Tween.to(e, {
                        x: n.x,
                        y: n.y
                    }, t / (this.m_speedFlag ? this.m_speedScale : 1), null, Laya.Handler.create(this, t => {
                        this.catAniStepEx(e, i, t, a)
                    }, [s]))
                } else {
                    o = e.getAniIndexByName(i[s]);
                    "sleep" == i[s] || "hungry" == i[s] ? (Laya.timer.once(3e3, e, () => {
                        e && !e.destroyed && (s++, this.catAniStepEx(e, i, s, a))
                    }), e.play(o, !0)) : e.play(o, !1, Laya.Handler.create(this, () => {
                        s++, this.catAniStepEx(e, i, s, a)
                    }))
                }
            else this.catAniStep(3, e, a)
        }
        doCatMovePos(t) {
            let e = {
                x: 0,
                y: 0
            };
            return e.x = Math.randRange(50, 520), e.y = Math.randRange(50, 400), e
        }
        onClickSpeed() {
            _(xe)
        }
        onClickMine() {
            d(ti)
        }
        updateSpeed() {
            N.cat.checkIsBoost() ? this.ani13.play(0, !0) : this.ani13.stop(), this.checkCatSpeed()
        }
        checkCatSpeed() {
            for (var t of this.catSpines) t && t._skeleton && t._skeleton.playbackRate(N.cat.checkIsBoost() ? this.m_speedScale : 1)
        }
        onClickShop() {
            _(Se)
        }
        moveCat(i) {
            if (!this.destroyed) {
                let t = .5;
                var s, a = Data.getCat(i.catId);
                210 < a.id ? (s = +a.oldShowId, t = 200 <= s ? .5 : 100 <= s ? .45 : .38) : 200 <= +a.showId && (t = .4), this.m_tempCat = R.create({
                    url: "cat/spine/" + a.showId + ".json",
                    parent: this.m_box_Temp,
                    px: 70,
                    py: 130,
                    scale: t,
                    autoPlay: !1,
                    autoRemove: !1,
                    alpha: 1
                }), !this.m_tempCat.skeleton || this.m_tempCat.destroyed ? this.m_tempCat._templet.once(Laya.Event.COMPLETE, this, () => {
                    N.cat.playCat(this.m_tempCat, "walk")
                }) : N.cat.playCat(this.m_tempCat, "walk");
                let e = this.m_lst_Cat.getCell(i.index);
                this.m_lst_Cat.once(Laya.Event.MOUSE_DOWN, this, t => {
                    !N.cat.airDropMap[i.index] && N.cat.allcats[i.index] && (N.lunch.checkCatLunch(i.index) ? 0 == N.lunch.m_lunchs.length ? N.lunch.reqLunchList().then(() => {
                        _($e, {
                            params: [N.lunch.getLunchById(N.lunch.stakeCats[i.index].launchId)]
                        })
                    }) : _($e, {
                        params: [N.lunch.getLunchById(N.lunch.stakeCats[i.index].launchId)]
                    }) : (this.m_mouseCat = i.index, t = Laya.Point.TEMP.setTo(t.stageX, t.stageY), t = this.m_lst_Cat.globalToLocal(t), this.m_box_Temp.x = t.x, this.m_box_Temp.y = t.y, e.visible = !1, this.m_box_Temp.visible = !0, this.m_img_SumTip.visible = !1, N.event(l.CAT_MATCH, i.catId), this.showDelete(!0)))
                }), this.m_lst_Cat.on(Laya.Event.MOUSE_MOVE, this, t => {
                    t = Laya.Point.TEMP.setTo(t.stageX, t.stageY), t = this.m_lst_Cat.globalToLocal(t);
                    this.m_box_Temp.x = t.x, this.m_box_Temp.y = t.y
                }), this.m_lst_Cat.once(Laya.Event.MOUSE_UP, this, t => {
                    this.m_mouseCat = -1, this.m_box_Temp.visible && (this.m_box_Temp.visible = !1), this.m_tempCat && this.m_tempCat.destroy(), this.m_tempCat = null, this.m_lst_Cat.offAll(), N.event(l.CAT_MATCH), N.cat.airDropMap[i.index] || !N.cat.allcats[i.index] || N.lunch.checkCatLunch(i.index) ? this.showDelete(!1) : (e.visible = !0, this.checkChangeCell(i, i.index, t), this.checkDel(i.index))
                }), this.m_lst_Cat.once(Laya.Event.MOUSE_OUT, this, () => {
                    this.m_mouseCat = -1, this.m_box_Temp.visible && (this.m_box_Temp.visible = !1), this.m_tempCat && this.m_tempCat.destroy(), this.m_tempCat = null, this.m_lst_Cat.offAll(), N.event(l.CAT_MATCH), this.showDelete(!1), i && N.cat.allcats[i.index] && (e.visible = !0, N.event(l.SHAKE_CAT, !0))
                })
            }
        }
        checkDel(e) {
            this.mouseX > this.m_btn_Delete.x && this.mouseX < this.m_btn_Delete.width + this.m_btn_Delete.x && this.mouseY > this.m_btn_Delete.y && this.mouseY < this.m_btn_Delete.height + this.m_btn_Delete.y ? _t({
                button: K.YesNo,
                msg: v(1044)
            }).then(t => {
                t.type == o.Yes && N.cat.allcats[e] ? N.cat.reqDelCat(e).then(() => {
                    this.m_isCustoming ? this.customingCatSpines.push(this.catSpines[e]) : (this.catSpines[e]._templet.offAll(), this.catSpines[e] && this.catSpines[e].destroy()), this.catSpines[e] = null, this.m_lst_Cat.changeItem(e, null);
                    let t = R.create({
                        url: "cat/spine/smoke.json",
                        parent: this,
                        px: this.m_btn_Delete.x + this.m_btn_Delete.width / 2,
                        py: this.m_btn_Delete.y,
                        autoRemove: !0
                    });
                    this.m_img_Del.visible = !1, x.instance.playSound("Delete.mp3"), this.showDelete(!1), t.play(0, !1), S.checkRandomBox()
                }) : (this.m_img_Del.visible = !1, this.showDelete(!1))
            }) : this.showDelete(!1)
        }
        showDelete(t) {
            (this.m_btn_Delete.visible = t) ? (this.ani5.play(0, !0), this.m_img_Del.visible = !0) : this.ani5.stop(), this.m_btn_Generate.visible = this.m_btn_ReCharge.visible = this.m_btn_Invite.visible = this.m_btn_Shop.visible = this.m_btn_Mine.visible = !t;
            var t = Data.gameConf.initCfg.openFuc.split(","),
                e = N.cat.getMyLv();
            this.m_btn_Auto.visible = this.m_btn_Generate.visible && e >= +t[2]
        }
        checkChangeCell(a, n, t) {
            if (he("checkMouse", 500)) {
                var e = this.m_lst_Cat.cells;
                for (let s = 0; s < e.length; s++) {
                    let i = e[s];
                    if (1 != N.cat.airDropMap[s] && !N.lunch.checkCatLunch(s) && (s != n && i.hitTestPoint(t.stageX, t.stageY))) {
                        if (!i.dataSource || a.catId && i.dataSource != a.catId) {
                            this.m_lst_Cat.changeItem(n, i.dataSource), this.m_lst_Cat.changeItem(s, a.catId), N.cat.reqSwitch([n, s]).then(() => {});
                            var o = this.catSpines[n];
                            this.catSpines[n] = this.catSpines[s], this.catSpines[s] = o, N.event(l.SHAKE_CAT, !0), N.cat.allcats = this.m_lst_Cat.array
                        } else {
                            if (a.catId == Data.maxCats) return;
                            let e = N.cat.getMyLv();
                            N.cat.reqSumCat([n, s]).then(t => {
                                -1 != this.m_mouseCat && N.event(l.CAT_MATCH, [this.m_mouseCat]), Laya.timer.loop(2e3, this, this.checkCreateTip), e != N.cat.getMyLv() ? _(Le, {
                                    params: [N.cat.getMyLv()]
                                }) : i.playSumAni(t[s]), this.m_lst_Cat.changeItem(n, null), this.m_isCustoming ? this.customingCatSpines.push(this.catSpines[s], this.catSpines[n]) : (this.catSpines[n] && (this.catSpines[n]._templet.offAll(), this.catSpines[n].destroy()), this.catSpines[s] && (this.catSpines[s]._templet.offAll(), this.catSpines[s].destroy())), this.catSpines[s] = null, this.catSpines[n] = null, this.createIndexCat(s, a.catId + 1), i.dataSource = t[s], this.m_lst_Cat.changeItem(s, i.dataSource), N.cat.allcats[s] = i.dataSource, N.cat.allcats[n] = null, this.refreshOutPut(), 13 < Date.newDate().getTime() / 1e3 - N.cat.airDropTime && 11 == N.cat.allcats.filter(t => !!t).length && (N.cat.reqGetAirDropCat(), Laya.timer.loop(13e3, N.cat, N.cat.reqGetAirDropCat)), S.checkRandomBox()
                            })
                        }
                        return
                    }
                }
                N.event(l.SHAKE_CAT, !0)
            }
        }
        onClickRank() {
            d(Ee, {
                params: [S.rankLeague]
            }).then(t => {
                t.wait().then(() => {
                    this.updateRankShow()
                })
            })
        }
        onClickInvite() {
            d(Be)
        }
        updateClubShow() {
            if (this.m_box_HasSquad.visible = !!N.club.clubInfo, this.m_box_NoSquad.visible = !N.club.clubInfo, N.club.clubInfo) {
                let t = N.club.clubInfo.name;
                this.m_txt_Squad.text = t;
                var e = this.m_txt_Squad._tf.lines.toString().length;
                t.length > e && (this.m_txt_Squad.text = t.slice(0, 4) + "..." + t.slice(t.length - 3)), this.m_txt_SquadScore.text = f(N.club.clubInfo.rankGold), this.m_txt_League.text = v(Ft[N.club.clubInfo.league]), this.m_img_Cup.skin = `cat/ui_notpack/cup${this.changeImgUrl(N.club.clubInfo.league)}.png`
            }
        }
        updateRankShow() {
            N.club.reqGetMyRank().then(t => {
                this.m_txt_SelfLeague.text = v(Ft[t.league]), this.m_img_RankCup.skin = `cat/ui_notpack/cup${this.changeImgUrl(t.league)}.png`, this.m_txt_SelfLeague.y, this.m_txt_SelfRank.visible = !0, t.rank ? 1 == t.rank ? this.m_txt_SelfRank.text = t.rank + "st" : 2 == t.rank ? this.m_txt_SelfRank.text = t.rank + "nd" : 3 == t.rank ? this.m_txt_SelfRank.text = t.rank + "rd" : this.m_txt_SelfRank.text = t.rank + "th" : this.m_txt_SelfRank.text = ""
            })
        }
        showGoldAni(t = 0, e) {
            x.instance.playSound("CatGem.mp3"), Ht("cat/ui_item/coin.png", 16, {
                x: 280,
                y: 300
            }, {
                x: this.m_img_Gold.localToGlobal(Laya.Point.TEMP.setTo(0, 0)).x + 40 - Mmobay.adaptOffsetWidth / 2,
                y: 580
            }, () => {
                this.updateGold(), this.aniGold.play(0, !1)
            }, this)
        }
        findCustomCat() {
            this.catSpines.find(t => !!t && !t.destroyed) ? (this.m_speedFlag = N.cat.checkIsBoost(), this.boostCustom()) : Laya.timer.once(1e4, this, this.findCustomCat)
        }
        stopCat(i) {
            for (let t = 0; t < this.catSpines.length; t++) {
                let e = this.catSpines[t];
                var s, a;
                e && this.catSpines[i] && (Laya.Tween.clearAll(e), Laya.timer.clearAll(e), t != i && (s = [this.catSpines[i].x + Math.randRange(-80, 60), this.catSpines[i].y + Math.randRange(1, 50)], a = Ot(e.x, e.y, s[0], s[1]), e.x > s[0] ? e.scaleX = Math.abs(e.scaleX) : e.scaleX = -Math.abs(e.scaleX), Laya.Tween.to(e, {
                    x: s[0],
                    y: s[1]
                }, a / .2 * 2 / (this.m_speedFlag ? this.m_speedScale : 1) * (Math.random() / 2 + .5), null, Laya.Handler.create(this, t => {
                    e.scaleX = Math.abs(e.scaleX), N.cat.playCat(e, "squat idle")
                })), N.cat.playCat(e, "run")))
            }
        }
        randomPeople(s, a) {
            var t, e, i = s,
                n = a,
                o = Math.randRange(1, 3);
            for (t of ["left_shoe", "right_shoe"]) {
                var h = i.getSlotByName(t);
                i.replaceSlotSkinName(t, h.currDisplayData.name, n + "/shoe_0" + o)
            }
            l = s, m = a, d = Math.randRange(1, 3), c = l.getSlotByName("eyes"), l.replaceSlotSkinName("eye", c.currDisplayData.name, m + "/eye_0" + d);
            var r, l = s,
                c = a,
                m = Math.randRange(1, 3),
                d = "hair",
                _ = ("female" == c && .5 < Math.random() ? (e = l.getSlotByName("hair_long"), l.replaceSlotSkinName("hair_long", e.currDisplayData ? e.currDisplayData.name : "", "female/hair_long_0" + m)) : (e = l.getSlotByName(d), l.replaceSlotSkinName(d, e.currDisplayData ? e.currDisplayData.name : "", c + "/hair_0" + m)), l = s, d = a, e = Math.randRange(1, 3), c = "jacket", m = l.getSlotByName(c), l.replaceSlotSkinName(c, m.currDisplayData.name, d + `/${c}_0` + e), l = s, m = a, d = Math.randRange(1, 3), c = "face", C = l.getSlotByName(c), l.replaceSlotSkinName(c, C.currDisplayData.name, m + "/face_0" + d), s),
                u = a,
                g = Math.randRange(1, 3);
            for (r of ["sleeve_left", "sleeve_right"]) {
                var p = _.getSlotByName(r);
                _.replaceSlotSkinName(r, p.currDisplayData.name, u + `/jacket_0${g}_sleeve`)
            }
            var l = s,
                c = (0, l.getSlotByName("pants_left")),
                C = ["male/pants_01_f", "male/pants_02_f", "male/pants_03_f"],
                m = Math.floor(3 * Math.random()),
                c = (l.replaceSlotSkinName("pants_left", c.currDisplayData.name, C[m]), l.getSlotByName("pants_right")),
                C = ["male/pants_01", "male/pants_02", "male/pants_03"];
            l.replaceSlotSkinName("pants_right", c.currDisplayData.name, C[m]);
            {
                d = s, l = a;
                let t = Math.randRange(0, 2),
                    e = "smile mouth",
                    i = "";
                i = "female" == l ? "skin_base/smile-mouth-girlnew" : "skin_base/smilemouth-man", l = d.getSlotByName(e), d.replaceSlotSkinName(e, l.currDisplayData ? l.currDisplayData.name : "", i + ["1", "2"][t])
            }
        }
        boostCustom() {
            this.m_speedCustomNum = this.catSpines.filter(t => !!t).length;
            let e = 0;
            this.m_checkTime = Date.newDate().getTime(), this.m_flag++, this.m_flag = this.m_flag % 10;
            for (var i of this.catSpines)
                if (i) {
                    e++;
                    let t = new Laya.Templet;
                    t.once(Laya.Event.COMPLETE, this, s, [t, i, e, this.m_flag]), t.loadAni("cat/spine/people.sk")
                }

            function s(o, h, r, l) {
                let c = o.buildArmature(1),
                    m = (o.showSkinByIndex(c._boneSlotDic, 2, !0), c.playbackRate(this.m_speedFlag ? this.m_speedScale : 1), c.visible = !0, c.x = 146, c.y = 45, c.zOrder = 1, c.name = "people", ["female", "male"][Math.floor(2 * Math.random())]),
                    d = (this.randomPeople(c, m), this.m_isCustoming = !0, +h.name);
                Laya.timer.once(5200 * r / (this.m_speedFlag ? this.m_speedScale : 1), this, () => {
                    N.cat.prepareCat(c, d, Laya.Handler.create(this, () => {
                        if (!h || h.destroyed || l != this.m_flag) return this.m_speedTemp.push(o), void this.m_speedPeople.push(c);
                        h && (Laya.Tween.clearAll(h), Laya.timer.clearAll(h), h.scaleX = Math.abs(h.scaleX), N.cat.playCat(h, "pose"));
                        let t = h.x - 55;
                        var e = Data.getCat(d),
                            e = +e.oldShowId || +e.showId;
                        let i = h.y + 31;
                        200 <= e ? (t = h.x - 90 + 16, i = h.y + 34) : e < 100 && (i = h.y + 28);
                        var s = Ot(c.x, c.y, t, i);
                        let a, n = (a = s / .2 * 2, 0);
                        n = 200 <= e ? 2 : 100 <= e ? 0 : 6, c.scaleX = 1, this.aniDoor.play(0, !1), N.cat.goldMute || 1 != r || x.instance.playSound("SFX_DoorBell.mp3"), c.play("wave", !0), N.cat.goldMute || x.instance.playSound(N.cat.getCv("Hello", m)), this.m_box_Con.addChildAt(c, 0), Laya.timer.once(2e3 / (this.m_speedFlag ? this.m_speedScale : 1), this, () => {
                            c && (c.play("walk", !0), Laya.Tween.to(c, {
                                x: t,
                                y: i
                            }, a / (this.m_speedFlag ? this.m_speedScale : 1), null, Laya.Handler.create(this, t => {
                                let e = 0;
                                c.zOrder = 0, this.m_isCustoming2 = !0;
                                var i = +Data.getCat(+h.name).showId;
                                e = i < 100 ? 5800 : i < 200 ? 5e3 : 2800, Laya.timer.once(e / (this.m_speedFlag ? this.m_speedScale : 1), this, () => {
                                    h.visible = !0, Laya.timer.once(this.m_speedFlag ? 3800 / this.m_speedScale : 1e3, this, () => {
                                        var s, a, t, n, e;
                                        this.m_speedTemp.push(o), this.m_speedPeople.push(c), s = c, a = this, t = m, n = l, s.play("walk", !0), N.cat.goldMute || x.instance.playSound(N.cat.getCv("Thanks", t)), s.scaleX = 50 < s.x ? -Math.abs(s.scaleX) : Math.abs(s.scaleX), t = Ot(s.x, s.y, 146, 20), e = 0, e = t / .2, Laya.Tween.to(s, {
                                            x: 146,
                                            y: 20
                                        }, e / (a.m_speedFlag ? a.m_speedScale : 1), null, Laya.Handler.create(a, t => {
                                            if (a.aniDoor.play(0, !1), a.m_speedCustomNum--, s.visible = !1, s.removeSelf(), 0 == a.m_speedCustomNum && n == a.m_flag) {
                                                a.m_checkTime = Date.newDate().getTime(), a.m_isCustoming = !1, a.m_isCustoming2 = !1;
                                                for (let t = 0; t < a.catSpines.length; t++) a.catSpines[t] && a.catAniStep(2, a.catSpines[t], t);
                                                for (let t = 0; t < a.customingCatSpines.length; t++) a.customingCatSpines[t] && (a.customingCatSpines[t]._templet && a.customingCatSpines[t]._templet.offAll(), a.customingCatSpines[t] && a.customingCatSpines[t].destroy());
                                                a.customingCatSpines = [];
                                                for (var e of a.m_speedTemp) e.destroy(), e = null;
                                                for (var i of a.m_speedPeople) i.destroy(), i = null;
                                                a.m_speedTemp = [], a.m_speedPeople = [], a.updateGold(), a.aniGold.play(0, !1), Laya.timer.once(5e3, a, a.findCustomCat)
                                            }
                                        })), N.cat.goldMute || x.instance.playSound("CatGem.mp3"), Ht("cat/ui_item/coin.png", 16, {
                                            x: h.x,
                                            y: h.y + 180
                                        }, {
                                            x: this.m_img_Gold.localToGlobal(Laya.Point.TEMP.setTo(0, 0)).x + 40 - Mmobay.adaptOffsetWidth / 2,
                                            y: 580
                                        }, () => {}, this)
                                    }), c.play(this.m_speedFlag ? "dance" : "happy", !1)
                                }), c.play(n, !1), h.visible = !1
                            })))
                        })
                    }))
                })
            }
        }
        airDrop(i, s = !0) {
            if (!s || he("airdrop", 1e3)) {
                let t = this.m_lst_Cat.getCell(i);
                s = t.localToGlobal(Laya.Point.TEMP.setTo(0, 0));
                let e = this.m_airDrops[i] = R.create({
                    url: "cat/spine/cathome.json",
                    parent: this,
                    px: s.x + 45 - Mmobay.adaptOffsetWidth / 2,
                    py: s.y + 50 - Mmobay.adaptOffsetHeight / 2,
                    scale: .8,
                    autoRemove: !1,
                    alpha: 1
                });
                e.play(0, !1, Laya.Handler.create(this, () => {
                    e && !e.destroyed && (e.play(1, !0), Laya.timer.once(5e3, this, (t, e) => {
                        this.opAirDrop(t, e)
                    }, [i, !1]))
                }))
            }
        }
        opAirDrop(i, s = !0) {
            if (this.m_airDrops[i] && N.cat.airDropMap[i]) {
                this.m_airDrops[i].skeleton.playbackRate(3);
                let e = N.cat.allcats[i];
                this.m_airDrops[i].play(2, !1, Laya.Handler.create(this, () => {
                    this.m_airDrops[i].destroy(), this.m_airDrops[i] = null, N.cat.airDropMap[i] = 0
                })), Laya.timer.once(700, this, () => {
                    s && x.instance.playSound("airdrop3.mp3"), this.m_lst_Cat.changeItem(i, e), e && this.createIndexCat(i, e);
                    let t = this.m_lst_Cat.getCell(this.m_mouseCat); - 1 != this.m_mouseCat && (t.visible = !1)
                })
            }
        }
        onClickTask() {
            this.checkTaskRed(), S.toTask()
        }
        checkTaskRed() {
            var t, e = Data.gameConf.initCfg.openFuc.split(",");
            N.cat.getMyLv() < +e[1] || (e = Mmobay.LocalStorage.get(w.s_taskRedCheck), t = Date.newDate().getTime(), !e || 864e5 < t - e ? (this.m_img_TaskRed.visible = !0, Mmobay.LocalStorage.set(w.s_taskRedCheck, t)) : this.m_img_TaskRed.visible = !1)
        }
        checkNew() {
            N.cat.checkNew() && u(Ge, {
                params: []
            }).then(t => {
                this.addChild(t), t.centerX = +t.width / 2, (this.m_finger = t).y = this.m_btn_Generate.y + t.height - 67
            })
        }
        checkOpenMenu() {
            var t = Data.gameConf.initCfg.openMenu.split(","),
                e = N.cat.getMyLv();
            this.m_btn_ReCharge.gray = e < +t[0], this.m_btn_Speed.gray && e >= +t[1] && this.checkFreeBoostRed(!0), this.m_btn_Speed.gray = e < +t[1], this.m_btn_Shop.gray && e >= +t[2] && this.updateShopRed(), this.m_btn_Shop.gray = e < +t[2], this.m_btn_Invite.gray = e < +t[3], this.m_btn_Mine.gray = e < +t[4], this.m_btn_ReCharge.mouseEnabled = e >= +t[0], this.m_btn_Speed.mouseEnabled = e >= +t[1], this.m_btn_Shop.mouseEnabled = e >= +t[2], this.m_btn_Invite.mouseEnabled = e >= +t[3], this.m_btn_Mine.mouseEnabled = e >= (+t[4] || 0)
        }
        checkSum() {
            if (!N.cat.isAuto && -1 == this.m_mouseCat) {
                var i = this.getSumIndex();
                if (i.length) {
                    let t = this.m_lst_Cat.getCell(i[0]),
                        e = this.m_lst_Cat.getCell(i[1]);
                    var i = new Laya.Point(10 - Mmobay.adaptOffsetWidth / 2, 91 - Mmobay.adaptOffsetHeight / 2 - 24),
                        i = t.localToGlobal(i),
                        s = new Laya.Point(10 - Mmobay.adaptOffsetWidth / 2, 91 - Mmobay.adaptOffsetHeight / 2 - 24),
                        s = e.localToGlobal(s);
                    this.doSumTip(i, s)
                }
            }
        }
        getSumIndex() {
            var i = N.cat.allcats;
            let s = [];
            var a = i.length,
                t = Data.maxCats;
            for (let e = 0; e < a && !s.length; e++) {
                var n = i[e];
                if (n && !N.cat.airDropMap[e] && e != this.m_mouseCat && n != t && !N.lunch.checkCatLunch(e))
                    for (let t = e + 1; t < a; t++) {
                        var o = i[t];
                        if (o && !N.cat.airDropMap[t] && t != this.m_mouseCat && !N.lunch.checkCatLunch(t) && n == o) {
                            s = [e, t];
                            break
                        }
                    }
            }
            return s
        }
        doSumTip(t, e) {
            this.m_img_SumTip.visible = !0, this.m_img_SumTip.x = t.x, this.m_img_SumTip.y = t.y;
            t = Ot(t.x, t.y, e.x, e.y);
            Laya.Tween.to(this.m_img_SumTip, {
                x: e.x,
                y: e.y
            }, 5 * t, null, Laya.Handler.create(this, () => {
                Laya.timer.once(200, this, this.checkSum)
            }), 200)
        }
        checkFreeBoostRed(t = !1) {
            Laya.timer.clear(this, this.checkFreeBoostRed);
            var e = Date.newDate().getTime() - 1e3 * +S.exdata.speedFreeTime;
            this.m_img_RedSpeed.visible = 0 < e && (!this.m_btn_Speed.gray || t), !this.m_img_RedSpeed.visible && e < 0 && Laya.timer.once(1e3 - e, this, this.checkFreeBoostRed)
        }
        onClickSound() {
            var t = x.instance.soundEnable;
            x.instance.soundEnable = !t, x.instance.musicEnable = !t, w.set(w.s_musicDisable, t), w.set(w.s_soundDisable, t), t ? x.instance.stopAll() : x.instance.playMusic("BGM_Cafe.mp3"), this.checkSoundImgShow()
        }
        checkSoundImgShow() {
            var t = x.instance.soundEnable;
            this.m_img_NoSound.visible = !t
        }
        updateShopRed(t = !1) {
            var e = Data.getShopCat(N.cat.getMyLv()).freeCd;
            e && (Laya.timer.once(1e3 * e, this, this.updateShopRed), N.cat.reqFreeCat().then(() => {
                this.m_img_RedShop.visible = (t || !this.m_btn_Shop.gray) && !!N.cat.freeCat
            }))
        }
        checkFreeCat() {
            N.cat.freeCat && N.cat.isAuto && 12 != N.cat.allcats.filter(t => !!t).length && N.cat.reqCreate(N.cat.freeCat, !1, !0).then(() => {
                g("Auto Feed")
            })
        }
        updateAuto() {
            this.m_img_AutoRed.visible = !N.cat.buyAuto && this.m_btn_Auto.visible && !N.cat.clickAuto
        }
        buyAuto() {
            this.updateAuto(), N.cat.isAuto = !0, this.ani8.play(0, !0), Laya.timer.loop(500, this, this.checkAuto), this.checkFreeCat()
        }
        onClickAuto() {
            if (N.cat.clickAuto = !0, this.m_img_AutoRed.visible = !1, !N.cat.buyAuto) return _(He);
            N.cat.isAuto = !N.cat.isAuto, N.cat.isAuto ? (this.ani8.play(0, !0), Laya.timer.loop(500, this, this.checkAuto), this.checkFreeCat()) : (Laya.timer.clearAll(this.checkAuto), this.ani8.stop(), Laya.timer.loop(5e3, this, this.checkSum)), this.m_img_StopAuto.visible = !N.cat.isAuto
        }
        checkAuto() {
            if (N.cat.isAuto && !N.lunch.isLunchDlg) {
                let s = this.getSumIndex();
                if (N.cat.isAuto && this.m_img_RedSpeed.visible && N.cat.reqSpeed(1).then(() => {
                        N.event(l.SPEED_FREE), g("Auto Boost")
                    }), s.length) {
                    let i = N.cat.allcats[s[1]];
                    N.cat.reqSumCat(s).then(t => {
                        -1 != this.m_mouseCat && N.event(l.CAT_MATCH, [this.m_mouseCat]), Laya.timer.loop(2e3, this, this.checkCreateTip);
                        let e = this.m_lst_Cat.getCell(s[1]);
                        e.playSumAni(i + 1), this.m_lst_Cat.changeItem(s[0], null), this.m_isCustoming ? this.customingCatSpines.push(this.catSpines[s[0]], this.catSpines[s[1]]) : (this.catSpines[s[0]] && (this.catSpines[s[0]]._templet.offAll(), this.catSpines[s[0]].destroy()), this.catSpines[s[1]] && (this.catSpines[s[1]]._templet.offAll(), this.catSpines[s[1]].destroy())), this.catSpines[s[0]] = null, this.catSpines[s[1]] = null, this.createIndexCat(s[1], i + 1), this.m_lst_Cat.changeItem(s[1], t[s[1]]), N.cat.allcats[s[0]] = null, N.cat.allcats[s[1]] = t[s[1]], this.refreshOutPut(), 13 < Date.newDate().getTime() / 1e3 - N.cat.airDropTime && 11 == N.cat.allcats.filter(t => !!t).length && (N.cat.reqGetAirDropCat(), Laya.timer.loop(14e3, N.cat, N.cat.reqGetAirDropCat)), S.checkRandomBox()
                    })
                } else 12 == N.cat.allcats.filter(t => !!t).length && this.delLastCat()
            }
        }
        delLastCat() {
            let t = !1;
            for (var e in N.cat.airDropMap)
                if (N.cat.airDropMap[e]) {
                    t = !0;
                    break
                } if (!t) {
                let e = 0,
                    i = -1;
                var s = Data.getCat(N.cat.getMyLv()).airdrop[0].k;
                for (let t = 0; t < N.cat.allcats.length; t++) {
                    var a = N.cat.allcats[t];
                    s <= a || (!e || a < e) && (e = a, i = t)
                }
                0 <= i && i != this.m_mouseCat && N.cat.reqDelCat(i).then(() => {
                    let t = this.m_lst_Cat.getCell(i),
                        e = R.create({
                            url: "cat/spine/smoke.json",
                            parent: this,
                            px: t.localToGlobal(Laya.Point.TEMP.setTo(0, 0)).x + 30,
                            py: t.localToGlobal(Laya.Point.TEMP.setTo(0, 0)).y,
                            autoRemove: !0
                        });
                    x.instance.playSound("Delete.mp3"), e.play(0, !1), this.m_isCustoming ? this.customingCatSpines.push(this.catSpines[i]) : (this.catSpines[i]._templet.offAll(), this.catSpines[i] && this.catSpines[i].destroy()), this.catSpines[i] = null, this.m_lst_Cat.changeItem(i, null), S.checkRandomBox(), N.event(l.CAT_MATCH), this.showDelete(!1)
                })
            }
        }
        checkGoldRain() {
            var t = S.randomEvent,
                e = S.fishData,
                i = Date.newDate().getTime();
            t && i < 1e3 * +t.multipleTime || e && i < 1e3 * +e.eventTime ? (t = t && 1e3 * +t.multipleTime - i, e = e && 1e3 * +e.eventTime - i, this.m_box_Rain.numChildren || N.cat.doGoldRain(this.m_box_Rain), Laya.timer.clear(this, this.doReCheckGoldRain), Laya.timer.once(Math.max(t, e, 0), this, this.doReCheckGoldRain)) : N.cat.clearGoldRain()
        }
        doReCheckGoldRain() {
            N.event(l.UPDATE_SPEED), this.checkGoldRain()
        }
        updateFuc() {
            var t = Data.gameConf.initCfg.openFuc.split(","),
                e = N.cat.getMyLv();
            !this.m_btn_Task.visible && e >= +t[1] && this.checkTaskRed(), this.m_box_Plus.visible = this.m_btn_Fish.visible = this.m_txt_Fish.visible = this.m_img_Fish.visible = e >= +t[0], this.m_btn_Task.visible = this.m_img_Task1.visible = this.m_txt_Task.visible = e >= +t[1], this.m_btn_Auto.visible = e >= +t[2] && this.m_btn_Generate.visible, this.m_img_AutoRed.visible = !N.cat.buyAuto && this.m_btn_Auto.visible && !N.cat.clickAuto
        }
        changeImgUrl(t) {
            return 5 == t || 6 == t ? t + 1 : t
        }
        checkCustom() {
            Laya.timer.loop(5e3, this, () => {
                if (this.m_checkTime && 90 < (Date.newDate().getTime() - this.m_checkTime) / 1e3) {
                    this.m_checkTime = 0, Laya.timer.clear(this, this.findCustomCat), this.updateGold();
                    for (let t = 0; t < this.customingCatSpines.length; t++) this.customingCatSpines[t] && (this.customingCatSpines[t]._templet && this.customingCatSpines[t]._templet.offAll(), this.customingCatSpines[t] && this.customingCatSpines[t].destroy());
                    this.customingCatSpines = [], this.findCustomCat()
                }
            })
        }
        checkInviteDouble() {
            N.invite.reqFrensInviterDoubleInfo().then(t => {
                var e = Date.newDate().getTime(),
                    i = 1e3 * +t.startTime,
                    t = 1e3 * +t.endTime;
                this.m_box_Double.visible = i < e && e < t
            })
        }
    }
    L([D("leaguechange")], E.prototype, "updateBg", null), L([D(l.UPDATE_OUTPUT)], E.prototype, "clearSumTip", null), L([D(l.UPDATE_OFFLINEGOLD)], E.prototype, "checkOffLine", null), L([D(l.UPDATE_ITEM)], E.prototype, "updateGold", null), L([D(l.UPDATE_CAT)], E.prototype, "updateOutPut", null), L([D(l.UPDATE_ITEM)], E.prototype, "updateRechargeShow", null), L([D(l.UPDATE_OUTPUT), D(l.UPDATE_SPEED)], E.prototype, "refreshOutPut", null), L([D(l.BUY_CAT)], E.prototype, "buyCat", null), L([D(l.UPDATE_SPEED)], E.prototype, "updateSpeed", null), L([D(l.MOVE_CAT)], E.prototype, "moveCat", null), L([D(l.CLUB_UPDATE)], E.prototype, "updateClubShow", null), L([D(l.HOME_GOLD_ANI)], E.prototype, "showGoldAni", null), L([D(l.AIR_DROP)], E.prototype, "airDrop", null), L([D(l.OPNE_AIR_DROP)], E.prototype, "opAirDrop", null), L([D(l.SPEED_FREE), D("buyAuto")], E.prototype, "checkFreeBoostRed", null), L([D("updateShopRed")], E.prototype, "updateShopRed", null), L([D("buyAuto")], E.prototype, "buyAuto", null), L([D(l.RANDOM_EVENT_TIME_CHANGE)], E.prototype, "checkGoldRain", null);
    class ei extends t.cat.views.recharge.RechargeSuccessDlgUI {
        constructor(t, e) {
            super(), this.m_amount = 0, this.m_gold = 0, this.m_amount = t, this.m_gold = e
        }
        onAwake() {
            super.onAwake(), this.height = this.m_amount || this.m_gold ? 480 : 400, this.m_box_Fish.visible = 0 < this.m_amount, this.m_box_Gold.visible = 0 < this.m_gold, 0 < this.m_amount && (this.m_txt_Amount.text = Wt(this.m_amount)), 0 < this.m_gold && (this.m_txt_Gold.text = Wt(this.m_gold))
        }
    }
    class ii extends t.cat.views.entrance.GameEntranceUI {
        constructor() {
            super(), this.m_resArr = [], this.size(560, 1120), this.zOrder = 100, this.centerX = this.centerY = 0, this.mouseThrough = !0, Laya.timer.loop(12e5, this, () => {
                Laya.Scene.gc()
            })
        }
        static init() {
            dt(ii.instance = new ii, c.Main)
        }
        play() {
            var t, e;
            Mmobay.gameDispatcher.event(Mmobay.MEvent.PACK_LOAD_DONE), t = E, e = $, ct(t, c.Main, e)
        }
        onRechargeSuccess(t, e) {
            _(ei, {
                params: [t, e],
                retainPopup: !0
            })
        }
        checkLoadRes() {
            this.silenceLoadRes()
        }
        silenceLoadRes() {
            var t;
            this.m_resArr.length && (t = this.m_resArr.shift(), Laya.loader.load(t, Laya.Handler.create(this, () => {
                this.silenceLoadRes()
            }), null, Laya.Loader.ATLAS, 4))
        }
    }
    L([D(l.RECHARGE_SUCCESS)], ii.prototype, "onRechargeSuccess", null);
    class A extends t.cat.views.common.LoadingViewUI {
        static show() {
            if (A.s_count++, A.s_instance) A.s_instance.play();
            else {
                let t = new A;
                t.openView().then(() => {
                    A.s_instance || A.s_count <= 0 ? t.destroy() : (dt(A.s_instance = t, c.Loading), t.play())
                })
            }
        }
        static reduce() {
            A.s_count = Math.max(A.s_count - 1, 0), !A.s_instance || 0 < A.s_count || A.s_instance.stop()
        }
        static clear() {
            A.s_instance && (A.s_count = 0, A.s_instance.stop())
        }
        play() {
            this.visible = !0, this.ani1.isPlaying || this.ani1.play(0, !0)
        }
        stop() {
            this.visible = !1, this.ani1.stop()
        }
    }
    A.s_count = 0;
    class si extends t.cat.views.common.ToastViewUI {
        constructor(t) {
            super(), this.m_info = t
        }
        onAwake() {
            super.onAwake(), this.centerX = this.centerY = 0, this.m_txt_Info.text = this.m_info, this.ani1.once(Laya.Event.COMPLETE, null, () => {
                this.destroy()
            }), this.ani1.play(0, !1)
        }
    }
    class ai extends t.cat.views.common.MsgBoxUI {
        constructor(t) {
            super(), this.m_option = t
        }
        onAwake() {
            super.onAwake(), this.m_option.disCloseOnSide && (this.closeOnSide = !1), this.m_option.leading && (ai.s_style.leading = this.m_option.leading), this.m_option.fontSize && (ai.s_style.fontSize = this.m_option.fontSize), Object.assign(this.m_div_Msg.style, ai.s_style), this.m_div_Msg.innerHTML = Bt(this.m_option.msg), this.m_option.title && (this.m_txt_Title.text = this.m_option.title);
            var t = (this.m_option.button & K.Yes) == K.Yes,
                e = (this.m_option.button & K.No) == K.No;
            this.m_btn_Sure.visible = t, this.m_btn_Cancel.visible = e, this.m_option.okTxt && (this.m_btn_Sure.label = this.m_option.okTxt), t && !e && (this.m_btn_Sure.centerX = 0), !t && e && (this.m_btn_Cancel.centerX = 0), this.m_div_Msg.x = (this.m_pan_Msg.width - this.m_div_Msg.contextWidth) / 2, this.m_div_Msg.y = Math.max(0, (this.m_pan_Msg.height - this.m_div_Msg.contextHeight) / 2)
        }
        onDestroy() {
            super.onDestroy(), ai.s_style.leading = 4
        }
        onClickSure(t) {
            this.closeDialog(o.Yes)
        }
        onClickCancel(t) {
            this.closeDialog(o.No)
        }
    }
    ai.s_style = {
        fontSize: 24,
        bold: !0,
        color: "#764428",
        leading: 4,
        wordWrap: !0
    };
    class ni extends t.cat.views.common.WifiViewUI {
        static show() {
            if (ni.s_instance) ni.s_instance.play();
            else {
                let t = new ni;
                t.openView().then(() => {
                    ni.s_instance ? t.destroy() : (dt(ni.s_instance = t, c.Loading), t.play())
                })
            }
        }
        static clear() {
            ni.s_instance && ni.s_instance.stop()
        }
        play() {
            this.visible = !0, this.ani1.isPlaying || this.ani1.play(0, !0)
        }
        stop() {
            this.visible = !1, this.ani1.stop()
        }
    }

    function oi() {
        N.init(), mt({
            modelEventsDispatcher: N,
            opCheckLimit: he,
            msgBoxImpl: ai,
            wifiImpl: ni,
            toastImpl: si,
            loadingImpl: A
        });
        var t, e = {
            baseUrl: Mmobay.MConfig.loginUrl,
            loadingImpl: () => ut(),
            errorSpawnImpl: (t, e) => {
                -1 != t && -2 != t && g(Bt((e = Jt(t) || e) || "unknown error"))
            }
        };
        for (t in e = e || et) it[t] = e[t];
        pb.pbContext = protobuf.parse('syntax = "proto3";\tpackage pb; \tmessage ItemInfo {\t  int32 id = 1;    \t  int64 num = 2;   \t  int64 delta = 3; \t}\tmessage ItemDeltaInfo {\t  int32 id = 1;    \t  int32 delta = 2; \t}\tmessage TokensInfo {\t  string fishCoinDelta = 1;    \t  string fishCoin = 2;    \t  string goldDelta = 3;    \t  string gold = 4;    \t}\tmessage TokensChangeInfo {\t  string fishCoinDelta = 1;    \t  string fishCoin = 2;    \t  string goldDelta = 3;    \t  string gold = 4;    \t  string wCatiDelta = 5;    \t  string wCati = 6;    \t}\tmessage Count {\t  int32 count = 1;       \t  int64 refreshTime = 2; \t}\tmessage FishData {\t  map<int32, int32> counts = 1; \t  int64 refreshTime = 2;        \t  int32 fishNum = 3;\t  repeated float sumR = 4;\t  int64 eventTime = 5;\t  int32 eventCount = 6;\t}\tmessage ExData {\t  map<int32, int32> times = 1;     \t  map<int32, int32> catNum = 2;     \t  map<int32, int32> catNumFish = 3;     \t  int32 maxCatLvl = 5; \t  int64 speedFreeTime = 6;\t  int64 offLine = 7;\t  map<int32, int32> buyGoods = 9;     \t  int64 SpeedChainTime = 10;\t  int32 freeCatLvl = 11;\t  repeated int64 pendingCheckIns = 12;     \t  int32 autoMerge = 13;     \t  int32 fishRobLvl = 14;\t}\tmessage RandomEventData {\t    int32 isDone = 1;\t    int32 type = 2; \t    int64 time = 3; \t    int32 boxNum = 4; \t    int64 multipleTime = 5; \t    int32 isOffLineDone = 6;\t}\tmessage SysMsgParam {\t  string val = 1;    \t  int32 valType = 2; \t}\tmessage UserInfo {\t  int32 id = 1;\t  int32 accountId = 2;\t  string accountName = 3;\t  int32 sex = 4;\t  string name = 5;\t  int64 icon = 6;\t  string gold = 7;\t  string rankGold = 8;\t  repeated int32 cats = 9;\t  int64 goldTime = 10;\t  string offGold = 11;\t  int64 boostEndTime = 12;\t  int64 offTime = 13;\t  string fishCoin = 14; \t  map<int32, int64> bag = 15;\t  map<int32, Count> counts = 16;       \t  ExData exData = 17;                  \t  FishData fishData = 18;              \t  string wallet = 19;   \t  int32 bcId = 20;     \t  int32 Inviter = 21; \t  RandomEventData randomEvent = 22;\t  int64 loginTime = 23; \t  map<int32, StakeCat> stakeCats = 24; \t  string wCati = 25; \t  int32 channelID = 26;         \t}\tmessage StakeCat {\t    int32 launchId = 1;\t    int64 endTime = 2;\t}\tmessage ServerTimeInfo {\t  int64 serverTime = 1;       \t  int32 serverZoneTime = 2;   \t  int64 todayZeroTime = 3;    \t  int64 mondayZeroTime = 4;   \t}\tmessage RankUser {\t  int32 userId = 1;\t  int64 rank = 2; \t  string name = 3;\t  int64 icon = 4;\t  string clubName = 5;      \t  string score = 6;          \t  int32 rankKey = 7;        \t  repeated int32 rankKeys = 8;        \t  int32 character = 9;\t  int32 channelID = 10;         \t}\tmessage RankClub {\t  int32 id = 1;\t  int32 rank = 2;\t  string name = 3;\t  int64 icon = 4;\t  int32 population = 5; \t  string score = 6;        \t}\tmessage ArenaClubRank {\t  repeated RankClub rankList = 1; \t}\tmessage Location {\t  int32 x = 1;\t  int32 y = 2;\t}\tmessage CountInfo {\t  int32 countType = 1;\t  int32 count = 2;\t}\tmessage entropy {\t  map<int32, float> Data = 1;\t}\tmessage InviterUser{\t  int32 id = 1;\t  int32 rank = 2;\t  int64 icon = 3;\t  string name = 4;\t  int32 inviteCount = 5;\t  string income = 6;\t  int32 league = 7;\t  string rankGold = 8;\t  int32 channelID = 9;         \t}\tmessage LaunchPool{\t    int32 id = 1; \t    int32 type = 2; \t    int32 scoreRate = 3; \t    int64 totalPlayer = 4;\t    int64 totalStake = 5;\t    int64 myStake = 6;\t    string waitScore = 7;\t    string gotScore = 8;\t    int32 stakeLimit = 9;\t    string hourScoreLimit = 10;\t }\t message Launch {\t    int32 id = 1;\t    int32 name = 2;\t    int64 startTime = 3;\t    int64 endTime = 4;\t    string totalScore = 5;\t    LaunchPool catPool = 6;\t    LaunchPool fishPool = 7;\t} \tmessage ItemChangeNtf {\t  repeated ItemInfo items = 1;\t}\tmessage CountsChangeNtf {\t  map<int32, Count> counts = 1;       \t}\tmessage CSMessage {\t  int32 cmdId = 1; \t  int32 transId = 2;\t  bytes body = 3; \t}\tmessage BindWalletReq {\t  int32 msgId = 1;\t  string wallet = 2;\t  string sign = 3;\t}\tmessage BindWalletAck {}\tmessage GenerateCatReq{\t    int32 lvl = 1;\t    int32 Type = 2;\t}\tmessage GenerateCatAck{\t    int32 index = 1;\t    int32 catLvl = 2;\t    string gold = 3;\t    string fishCoin = 4;\t    int32 catNum = 5;\t    int32 catNumFish = 6;\t}\tmessage MergeCatReq {\t    repeated int32 indexs = 1;\t}\tmessage MergeCatAck {\t    repeated int32 cats = 1;\t}\tmessage MergeCatAutoReq {\t}\tmessage MergeCatAutoAck {\t    string fishCoin = 1;\t    int32 autoMerge = 2;     \t}\tmessage DelCatReq{\t  repeated int32 indexs = 1;\t}\tmessage DelCatAck {\t  repeated int32 cats = 1;\t}\tmessage GetAirDropCatReq{\t}\tmessage GetAirDropCatAck {\t    repeated int32 cats = 1;\t    int32 airdropIndex = 2;\t    int64 airdropTime = 3;\t}\tmessage GetFreeCatReq{\t}\tmessage GetFreeCatAck {\t    int32 catLvl = 1;\t}\tmessage SwitchPosCatReq{\t    repeated int32 indexs = 1;\t}\tmessage SwitchPosCatAck {\t  repeated int32 cats = 1;\t}\tmessage GatherGoldReq{}\tmessage GatherGoldAck{\t    string gold = 1;\t    int64 goldTime = 2;\t}\tmessage OffLineGoldNtf{\t    string offGold = 1;\t}\tmessage GetOffLineGoldReq{\t    int64 Type = 1;\t}\tmessage GetOffLineGoldAck{\t    string gold = 1;\t    string offGold = 2;\t    int64 goldTime = 3;\t    string fishCoin = 4;\t}\tmessage BoostGoldReq{\t    int32 Type = 1;\t}\tmessage BoostGoldAck{\t    int64 boostEndTime = 1;\t    int64 SpeedFreeTime = 2;\t    string fishCoin = 3;\t    int64 SpeedChainTime = 4;\t}\tmessage BoostGoldNtf {\t    int64 boostEndTime = 1;\t    int64 SpeedFreeTime = 2;\t    int64 SpeedChainTime = 3;\t}\tmessage CreateClubReq {\t    string name = 1;\t    int32 currencyType = 2;\t}\tmessage CreateClubAck {\t    ClubInfo club = 1;\t    repeated MemberInfo members = 2; \t}\tmessage JoinClubReq{\t    int32 id = 1;\t}\tmessage JoinClubAck{\t    ClubInfo club = 1;\t}\tmessage ClubInfo {\t    int32 id = 1;\t    int64 icon = 2;\t    string name = 3;\t    int32 league = 4;\t    int32 population = 5;\t    int32 chairmanId = 6;\t    string rankGold = 7;                  \t    int32 boostVal = 8;           \t    string groupId = 9;\t}\tmessage ClubInfoNtf {\t    ClubInfo club = 1;               \t}\tmessage GetRecruitClubListReq{}\tmessage GetRecruitClubListAck{\t    repeated ClubInfo list = 1;\t}\tmessage QuitClubReq{}\tmessage QuitClubAck{\t    int32 success = 1;\t}\tmessage MemberInfo{\t    int32 id = 1;\t    int32 rank = 2;\t    int64 icon = 3;\t    string name = 4;\t    string rankValue = 5;\t    int32 clubId = 6;\t}\tmessage inviteRankPlayer{\t    string icon = 1;\t    string name = 2;\t    int32 inviteCount = 3;\t    string totalIncome = 4;\t}\tmessage ClubMemberRankReq{\t    int32 id = 1;\t    int32 timeType = 2;\t}\tmessage ClubMemberRankAck{\t    repeated RankUser rankList = 1;\t    RankUser myRank = 2;\t}\tmessage GetStatsReq{}\tmessage GetStatsAck{\t    string totalBalance = 1;\t    int32 totalPlayers = 2;\t    int32 dailyUsers = 3;\t    int32 online = 4;\t    string totalEarned = 5;\t    string spentAndBurned = 6;\t    repeated int64 icons = 7;\t    int32 premiumPlayers = 8;\t}\tmessage GetGoldRankListReq{\t    int32 league = 1; \t    int32 timeType = 2; \t}\tmessage GetGoldRankListAck{\t    RankUser myInfo = 1;\t    repeated RankUser rankList = 2;\t}\tmessage GetMyRankReq{}\tmessage GetMyRankAck{\t    int32 rank = 1;\t    int32 league = 2;\t    string rankGold = 3;\t}\tmessage GetClubGoldRankListReq{\t    int32 league = 1; \t    int32 timeType = 2; \t}\tmessage GetClubGoldRankListAck{\t    repeated RankClub rankList = 1;\t    RankClub myRank = 2;\t}\tmessage clubMemberPlayer{\t    string icon = 1;\t    string name = 2;\t    string rankValue = 3;\t}\tmessage ClubInfoReq{\t    int32 id = 1;\t}\tmessage ClubInfoAck{\t    ClubInfo club = 1;               \t}\tmessage FrensInfoReq{}\tmessage FrensInfoAck{\t    repeated InviterUser friendList = 1;\t    string fishCoin = 2;\t    int32 inviteCount = 3;\t}\tmessage FrensInviterDoubleInfoReq{}\tmessage FrensInviterDoubleInfoAck{\t    int64 startTime = 1;\t    int64 endTime = 2;\t}\tmessage InviteRankListReq{}\tmessage InviteRankListAck{\t    InviterUser myInfo = 1;\t    repeated InviterUser rankList = 2;\t}\tmessage GoldChangeNtf {\t    string gold = 1;\t    string fishCoin = 2;\t}\tmessage RandomEventReq {}\tmessage RandomEventAck {\t    RandomEventData randomEventData = 1;\t}\tmessage GetRandomEventAwardReq {\t    int32 opType = 1;\t}\tmessage GetRandomEventAwardAck { \t    string fishCoin = 1;\t    RandomEventData randomEventData = 2;\t}\tmessage GetRandomEventBoxReq {}\tmessage GetRandomEventBoxAck {\t    repeated int32 cats = 1;\t    RandomEventData randomEventData = 2;\t}\tmessage  MessageEventNtf {\t    int32 retCode = 1;    \t    string msg = 2; \t    int32 eventType = 3; \t  }\tmessage ExitClubReq {\t  string pwd = 1;\t}\tmessage ExitClubAck {\t    int64 exitTime = 1;\t} \tmessage ClubGroupUserNameReq {\t  string groupUserId = 1;\t  int32 clubId = 2; \t}\tmessage ClubGroupUserNameAck {\t  string groupUserName = 1;\t}\tmessage ErrorAck {\t  int32 code = 1;\t  int32 langId = 2; \t} \tmessage ServerStateNtf {\t  int32 serverType = 1; \t  int32 offline = 2;    \t}\tmessage HeartBeatReq { \t}\tmessage HeartBeatAck { \t}\tmessage JumpServerReq {\t  int32 jumpTo = 1; \t  int32 serverId = 2; \t}\tmessage JumpServerAck {\t  int32 serverId = 1;  \t  int32 mapId = 2;     \t  int32 logicType = 3; \t  int32 logicId = 4;   \t}\tmessage GetLaunchListReq{}\tmessage GetLaunchListAck{\t    repeated Launch launchList = 1;\t    int32 inviterNum = 2;\t    int64 BoostEndTime = 3;\t}\tmessage LaunchStakeReq{\t    int32 launchId = 1;\t    int32 poolId = 2;\t    int64 stakeNum = 3;\t    int32 isRetrieve = 4; \t}\tmessage LaunchStakeAck{\t    string fishCoin = 1;\t    map<int32, StakeCat> stakeCats = 2;\t    int64 totalPlayer = 3;\t    int64 totalStake = 4;\t    int64 myStake = 5;\t}\tmessage RetrieveStakeReq{\t    int32 launchId = 1;\t    int32 poolId = 2;\t    int64 retrieveNum = 3;\t}\tmessage RetrieveStakeAck{\t    LaunchPool poolInfo = 1;\t    string fishCoin = 2;\t    map<int32, StakeCat> stakeCats = 3;\t}\tmessage ReceiveLaunchProfitReq{\t    int32 launchId = 1;\t    int32 poolId = 2;\t}\tmessage ReceiveLaunchProfitAck{\t    string wCATI = 1;\t    string waitScore = 2;\t    string gotScore = 3;\t} \tmessage LaunchPoolBonusNtf{\t    int32 launchId = 1;\t    int32 poolId = 2;\t    string addWaitScore = 3;\t    string waitScore = 4;\t}\tmessage EnterGameReq {\t  int32 accountId = 1;\t  int32 serverId = 2;\t  string token = 3;\t  string name = 4;\t  int32 time = 5;\t  int32 sex = 6;         \t  string nickName = 7;   \t  string newNickName = 8;   \t  int32 relogin = 9;     \t  string inviteCode = 10; \t  int32 userId = 11;  \t  int32 bcId = 12;    \t  int32 inviterId = 13; \t  int32 inviterClubId = 14; \t}\tmessage EnterGameAck {\t  int32 code = 1;\t  int32 serverId = 2;\t  UserInfo userInfo = 3;\t  ServerTimeInfo serverTimeInfo = 4;\t  int32 bcId = 5;\t}\tmessage CreateRoleReq {\t  int32 sex = 1; \t  string nickName = 2;\t}\tmessage CreateRoleAck {\t  UserInfo userInfo = 1;\t  ServerTimeInfo serverTimeInfo = 2;\t}\tmessage CommandReq { \t    string command = 1; \t    int32 rev = 2;\t}\tmessage CommandAck { string extra = 1;}\tmessage GetCommentTokenReq {}\tmessage GetCommentTokenAck {\t  string token = 1;\t  int64 ts = 2;\t  int32 militaryGrade = 3;\t}\tmessage UserInfoNtf { UserInfo userInfo = 1; }\tmessage RequestPrePayReq { \t  int32 id = 1; \t}\tmessage RequestPrePayAck {\t  int32 id = 1;  \t  string tonPrice = 2;\t  string mntPrice = 3; \t}\tmessage RequestPayReq { \t  int32 id = 1; \t  int32 payType = 2;    \t}\tmessage RequestPayAck {\t  PayData payData = 1;\t}\tmessage CheckPayReq { \t  string checkData = 1; \t  PayData payData = 2;\t  string  transId = 3;      \t}\tmessage CheckPayAck {\t  int32 isSucc = 1;\t}\tmessage PayData {\t  int32 rechargeId = 1;\t  string productID = 2;\t  string price = 3;   \t  string orderNo = 4;\t  string payload = 5;    \t  string paylink  = 6; \t  string amount = 7;  \t  string walletAddress = 8;  \t}\tmessage PayClubBoosterReq { \t  int32 clubId = 1;     \t  int32 amount = 2;     \t  int32 payType = 3;    \t}\tmessage PayClubBoosterAck {\t  PayData payData = 1;\t}\tmessage BCCheckInReq { \t  int32 checkInType = 1;      \t}\tmessage BCCheckInAck {\t  PayData payData = 1;\t}\tmessage TonExchangeRateReq{\t}\tmessage TonExchangeRateAck { \t  string Ton2Usd = 1;      \t  string Usd2Ton = 2;      \t  string Mnt2Usd = 3;      \t  string Usd2Mnt = 4;      \t}\tmessage SysMsgNtf { SysMsg msg = 1; }\tmessage SysMsg {\t  int32 msgType = 1; \t  int32 msgId = 2;\t  repeated SysMsgParam param = 3;\t  string msg = 4;\t  int32 extra1 = 5;\t  int32 extra2 = 6;\t}\tmessage WatchMsgReq {\t  int32 watchType = 1;\t  int32 extParam = 2; \t}\tmessage WatchMsgAck {}\tmessage UnWatchMsgReq { int32 watchType = 1; }\tmessage UnWatchMsgAck {}\tmessage ExDataNtf{\t  ExData exData = 1; \t}\tmessage FishingReq {\t  int32 color = 1; \t}\tmessage FishingAck {\t  repeated ItemInfo items = 1; \t  int32 weight = 2;\t  int32 fishId = 3;\t  int32 myOldMax = 4; \t  int32 myNewMax = 5; \t  int32 oldMax = 6;   \t  int32 newMax = 7;   \t  string addgold = 8;\t  string gold = 9;\t  string addFishCoin = 10; \t  string fishCoin = 11;\t  FishData fishData = 12;\t}\tmessage FishRodUpReq{\t}\tmessage FishRodUpAck{\t  int32 FishRodLvl = 1;\t  string fishCoin = 3;\t}\tmessage MyFishInfoReq {}\tmessage MyFishInfoAck {\t  int64 myRank = 1;\t  int32 myScore = 2;\t  int32 myRankKey = 3;\t  string gold = 4; \t  string rewardGold = 5; \t  int64 rewardRank = 6; \t  int32 fishRobLvl = 7;\t}\tmessage GetFishRankRewardReq {}\tmessage GetFishRankRewardAck {\t  repeated ItemInfo Reward = 1; \t}\tmessage FishRankListReq {}\tmessage FishRankListAck {repeated RankUser rankList = 1;}\tmessage FishInfoReq {\t  int32 id = 1; \t}\tmessage FishInfoAck {\t  int32 maxWeight = 1;\t  string name = 2; \t}\tmessage FishRewardPoolReq {}\tmessage FishRewardPoolAck {int64 count = 1;}\tmessage FishHistoryReq {}\tmessage FishHistoryAck {repeated SysMsg list = 1;}\tmessage SyncRechargeNtf {\t  repeated int32 ids = 1; \t}\tmessage ReceiveRechargeReq {int32 id = 1;}\tmessage ReceiveRechargeAck {\t  string addFishCoin = 1;\t  string FishCoin = 2; \t  int32 GoodsId = 3;     \t  string addGold = 4; \t  string Gold = 5; \t}\tmessage AccountInfoChangeNtf {\t  int32 status = 1;   \t  string wallet = 2; \t  int64 accountStatusEndTime = 3;\t}\tmessage TokensInfoChangeNtf {\t  TokensChangeInfo info = 1;\t}\tmessage RandomEventChangeNtf{\t    RandomEventData randomEventData = 1;\t}\tmessage GetWalletAddrReq {\t  string rawAddress = 1; \t}\tmessage GetWalletAddrAck {\t  string Address = 1; \t}\t'), Laya.Stat.enable()
    }

    function hi() {
        ii.init();
        N.loadData("cat/data.json").then(t => (Mmobay.gameDispatcher.event(Mmobay.MEvent.LOAD_PROGRESS, Mmobay.MConst.LOAD_NET), N.login.enterGame())).then(t => {
            t || console.log("enter game error"), ii.instance.play()
        })
    }
    class ri {
        constructor() {
            this._hideDisconnected = !1, this._isFirstLogin = !0, this._lastSendPackTm = 0, this._lastRecvPackTm = 0
        }
        reqEnterGame(e = !1) {
            let t = pb.EnterGameReq.create();
            var i = Mmobay.Manager.loginMgr.loginData;
            return t.accountId = i.accountId, t.userId = i.userId, t.name = i.name, t.token = i.token, t.time = i.time, t.bcId = window.mbplatform.blockchainId, t.sex = Mmobay.Manager.loginMgr.sex, t.nickName = i.nickName, t.newNickName = Mmobay.Manager.loginMgr.newNickName, t.inviterId = +i.inviterId, t.inviterClubId = i.inviterClubId, t.relogin = e ? 1 : 0, t.inviteCode = i.inviteCode, k(t, m.EnterGameReq, pb.IEnterGameAck, {
                noLoading: !0
            }).then(t => t.code == p.Succ && this.onEnterGameAck(t, e))
        }
        handleErrorAck(t) {
            this._disConnectSocket(), Laya.timer.clear(this, this._callLateReconnect), _t({
                button: K.Yes,
                msg: Jt(t),
                hideClose: !0
            }).then(t => {})
        }
        handleMaintainErrorAck(t) {
            var e;
            console.log("game.handleMaintainErrorAck"), this._disConnectSocket(), Laya.timer.clear(this, this._callLateReconnect), this._hideDisconnected = !0, (b.reconnectcount = 0) < S.id ? _t({
                button: K.Yes,
                msg: Jt(t),
                hideClose: !0
            }).then(t => {
                this.reconnect()
            }) : (e = Laya.Handler.create(null, () => {
                b.reconnectcount = 0, Laya.timer.clear(this, this._callLateReconnect), console.log("click to re enterGame ..."), hi()
            }), t = {
                type: 0,
                msg: Jt(t),
                handler: e
            }, console.log("game.handleMaintainErrorAck send event : CONNECT_GAME_ERROR"), Mmobay.gameDispatcher.event(Mmobay.MEvent.CONNECT_GAME_ERROR, t))
        }
        onEnterGameAck(t, e) {
            var i = Mmobay.Manager.loginMgr.loginData;
            return Date.setStandard(t.serverTimeInfo.serverTime, t.serverTimeInfo.serverZoneTime), Date.setServerDate(t.serverTimeInfo.todayZeroTime, t.serverTimeInfo.mondayZeroTime), this.loginSucc(t.userInfo, t.serverId, e), N.account.initAccount(i), this._isFirstLogin = !1, this._lastSendPackTm = Date.newDate().getTime(), this._lastRecvPackTm = Date.newDate().getTime(), e && N.event(l.REENTER_GAME), Promise.resolve(!0)
        }
        loginSucc(t, e, i) {
            console.log("loginsucc"), this.startHeartBeat(), S.init(t), x.instance.init()
        }
        enterGame() {
            return this.connectGameServer().then(() => this.reqEnterGame()).catch(t => {
                console.log("enterGame error");
                var e = Laya.Handler.create(this, t => {
                        console.log("click to reconnect ..."), t._disConnectSocket(), b.reconnectcount = 0, hi()
                    }, [this]),
                    e = {
                        type: 0,
                        msg: v(167),
                        handler: e
                    };
                return this._hideDisconnected || Mmobay.gameDispatcher.event(Mmobay.MEvent.CONNECT_GAME_ERROR, e), this._hideDisconnected = !1, Promise.reject("enterGame error")
            })
        }
        connectGameServer() {
            return this._disConnectSocketPromise().then(() => {
                return this._watchGameSocket(), t = Mmobay.MConfig.addr, e = ne, b.isConnected && t == b.addr ? Promise.resolve(void 0) : (b.connect(t), b.messageHandler = e, clearTimeout(Ut), new Promise((t, e) => {
                    b.once(Laya.Event.OPEN, null, () => {
                        clearTimeout(Ut), t(void 0)
                    }), b.once(Laya.Event.CLOSE, null, () => {
                        clearTimeout(Ut), e("socket close")
                    }), b.once(Laya.Event.ERROR, null, t => {
                        clearTimeout(Ut), e(t || "socket error")
                    }), Ut = setTimeout(() => {
                        var t = {
                            code: 8,
                            message: "connect timeout"
                        };
                        console.error(t), b.disconnect(!1), e(t)
                    }, 2e4)
                }));
                var t, e
            })
        }
        _disConnectSocketPromise() {
            return new Promise((t, e) => {
                let i = b;
                i.offAll(), i.isConnected ? (i.once(Laya.Event.CLOSE, this, t), i.disconnect(!1), Laya.Render.isConchApp && b.event(Laya.Event.CLOSE)) : t()
            })
        }
        _watchGameSocket() {
            let t = b;
            t.offAll(), t.once(Laya.Event.CLOSE, this, () => {
                N.event(l.NET_DISCONNECTED), b.reconnectcount++, b.autoReconnect && b.reconnectcount < 4 ? this.reconnect() : (console.log("_watchGameSocket " + b.reconnectcount), pt(), this._isFirstLogin || this.popDisconnectMsg("gameServer closed"))
            }), t.once(Laya.Event.ERROR, this, () => {})
        }
        reconnect() {
            nt && nt.show(), Laya.timer.clear(this, this._callLateReconnect), this._disConnectSocket(), N.event(l.NET_DISCONNECTED), Laya.timer.once(1e3, this, this._callLateReconnect)
        }
        _callLateReconnect() {
            return this.connectGameServer().then(() => (pt(), this.reqEnterGame(!0))).then(() => {
                b.reconnectcount = 0, console.log("_callLateReconnect reqEnterGame ok, GameEvent.NET_RECONNECTED"), N.event(l.NET_RECONNECTED)
            }).catch(t => {})
        }
        _disConnectSocket() {
            let t = b;
            t.offAll(), t.disconnect(!1), this.stopHeartBeat()
        }
        startHeartBeat() {
            this.stopHeartBeat(), Laya.timer.loop(1e3, this, this.sendHeartBeat)
        }
        stopHeartBeat() {
            this._lastSendPackTm = 0, Laya.timer.clear(this, this.sendHeartBeat)
        }
        sendHeartBeat() {
            var t = Date.newDate().getTime();
            if (9e3 <= t - this._lastRecvPackTm) this.reconnect();
            else if (!(t - this._lastSendPackTm < 3e3)) return k(pb.HeartBeatReq.create(), m.HeartBeatReq, pb.IHeartBeatAck, {
                noLoading: !0
            }).then(t => t)
        }
        onHookSendPacket(t, e) {
            this._lastSendPackTm = Date.newDate().getTime()
        }
        onHookRecvPacket(t, e) {
            this._lastRecvPackTm = Date.newDate().getTime()
        }
        onServerState(t, e) {
            t == Nt.game && 1 == e && (this._disConnectSocket(), this.popDisconnectMsg())
        }
        popDisconnectMsg(t) {
            b.reconnectcount = 0, this.reconnect()
        }
    }
    Mmobay.MConfig.showNetLog && (window.sendCommand = function(e) {
        if (Mmobay.MConfig.showNetLog) {
            let t = pb.CommandReq.create();
            return t.command = e, k(t, m.CommandReq, pb.ICommandAck).then(t => (console.log("command:", e), t))
        }
    });
    class li {
        constructor() {
            this.m_lunchs = [], this.stakeCats = {}, this.isLunchDlg = !1, this.boostEndTime = 0, this.inviterNum = 0
        }
        reqLunchList() {
            return k(new pb.GetLaunchListReq, m.GetLaunchListReq, pb.IGetLaunchListAck, {
                noLoading: !0
            }).then(t => (this.m_lunchs = (t.launchList || []).sort((t, e) => +e.startTime - +t.startTime), this.inviterNum = t.inviterNum, this.boostEndTime = +t.BoostEndTime, N.event("updateLunchList"), t))
        }
        reqStack(i, t, s, e = 0) {
            let a = new pb.LaunchStakeReq;
            return a.poolId = i, a.launchId = s, a.stakeNum = t, a.isRetrieve = e, k(a, m.LaunchStakeReq, pb.ILaunchStakeAck, {
                noLoading: !0
            }).then(t => {
                S.fishCoin = +t.fishCoin, this.stakeCats = t.stakeCats;
                for (var e of this.m_lunchs)
                    if (s == e.id) {
                        e.catPool.id == i ? (e.catPool.totalStake = t.totalStake, e.catPool.myStake = t.myStake, e.catPool.totalPlayer = t.totalPlayer) : e.fishPool.id == i && (e.fishPool.myStake = t.myStake, e.fishPool.totalStake = t.totalStake, e.fishPool.totalPlayer = t.totalPlayer);
                        break
                    } g(v(1)), N.event(l.UPDATE_OUTPUT), N.event(l.UPDATE_LUNCH, !0)
            })
        }
        reqReward(i, s) {
            let t = new pb.ReceiveLaunchProfitReq;
            return t.poolId = i, t.launchId = s, k(t, m.ReceiveLaunchProfitReq, pb.IReceiveLaunchProfitAck, {
                noLoading: !0
            }).then(t => {
                for (var e of this.m_lunchs)
                    if (s == e.id) {
                        e.catPool.id == i ? (e.catPool.gotScore = t.gotScore, e.catPool.waitScore = t.waitScore) : e.fishPool.id == i && (e.fishPool.gotScore = t.gotScore, e.fishPool.waitScore = t.waitScore);
                        break
                    } S.wCati = t.wCATI, g(v(1)), N.event(l.UPDATE_LUNCH, !0)
            })
        }
        getNowLunch() {
            var t, e = Date.newDate().getTime();
            let i;
            for (t of this.m_lunchs)
                if (1e3 * +t.endTime > e && +t.startTime < e) {
                    i = t;
                    break
                } return i
        }
        updateLunchInfo(e) {
            for (let t = 0; t < this.m_lunchs.length; t++) {
                var i = this.m_lunchs[t];
                if (i.catPool.id == e.id) {
                    this.m_lunchs[t].catPool = e;
                    break
                }
                if (i.fishPool.id == e.id) {
                    this.m_lunchs[t].fishPool = e;
                    break
                }
            }
        }
        checkCatLunch(t) {
            var e = Date.newDate().getTime(),
                t = this.stakeCats[t];
            return !!(t && e < 1e3 * +t.endTime)
        }
        getLunchById(t) {
            let e = null;
            for (var i of this.m_lunchs)
                if (t == i.id) {
                    e = i;
                    break
                } return e
        }
    }
    class ci {
        constructor() {
            this.clubInfo = null, this.statusImgArr = []
        }
        reqClubInfo(e) {
            let t = new pb.ClubInfoReq;
            return t.id = e, k(t, m.ClubInfoReq, pb.IClubInfoAck).then(t => (this.clubInfo && this.clubInfo.id == e && (this.clubInfo = t.club, N.event(l.CLUB_UPDATE)), t))
        }
        reqJoinClub(t) {
            let e = new pb.JoinClubReq;
            return e.id = t, k(e, m.JoinClubReq, pb.IJoinClubAck).then(t => (this.clubInfo = t.club, N.event(l.CLUB_UPDATE), t))
        }
        reqQuitClub() {
            return k(new pb.QuitClubReq, m.QuitClubReq, pb.IQuitClubAck).then(t => (this.clubInfo = null, N.event(l.CLUB_UPDATE), t))
        }
        reqGetRecruitListClub() {
            return k(new pb.GetRecruitClubListReq, m.GetRecruitClubListReq, pb.IGetRecruitClubListAck).then(t => t.list)
        }
        reqGetGoldRankList(t = 0, e = 0) {
            let i = new pb.GetGoldRankListReq;
            return i.league = t, i.timeType = e, k(i, m.GetGoldRankListReq, pb.IGetGoldRankListAck).then(t => t)
        }
        reqGetClubGoldRankList(t = 0, e = 0) {
            let i = new pb.GetClubGoldRankListReq;
            return i.league = t, i.timeType = e, k(i, m.GetClubGoldRankListReq, pb.IGetClubGoldRankListAck).then(t => t)
        }
        reqGetMyRank() {
            return k(new pb.GetMyRankReq, m.GetMyRankReq, pb.IGetMyRankAck).then(t => (S.rankGold = t.rankGold, S.rankGoldRank = t.rank, S.rankLeague = t.league, N.event("leaguechange"), t))
        }
        reqClubMemberRank(t, e = 0) {
            let i = new pb.ClubMemberRankReq;
            return i.id = t, i.timeType = e, k(i, m.ClubMemberRankReq, pb.IClubMemberRankAck).then(t => t)
        }
        reqGetStats() {
            return k(new pb.GetStatsReq, m.GetStatsReq, pb.IGetStatsAck).then(t => (this.statusImgArr = t.icons || [], t))
        }
        getLeagueByScore(e) {
            let t = Data.gameConf.initCfg.minerLeagues.split(",");
            return t.findIndex(t => e < +t) - 1
        }
        getRandomIco(e) {
            let i = this.statusImgArr.slice();
            for (let t = 0; t < e; t++) {
                var s = t + Math.floor(Math.random() * (i.length - t));
                [i[t], i[s]] = [i[s], i[t]]
            }
            let t = i.slice(0, e);
            return S.icon && -1 == t.indexOf(S.icon) && t.splice(2, 0, S.icon), t
        }
    }
    class M extends t.cat.views.common.SystemNoticeUI {
        static showSystemMsg(t) {
            M.s_msgData.push(t), M.s_loadinged ? M.s_instance && M.s_instance.reset() : (M.s_loadinged = !0, u(M, {}).then(t => {
                (M.s_instance = t).top = 200, t.centerX = 0, dt(t, c.System), t.playMsg()
            }))
        }
        onAwake() {
            super.onAwake(), this.mouseEnabled = !1, this.mouseThrough = !0, Object.assign(this.m_div_Tip.style, {
                fontSize: 18,
                bold: !0,
                color: "#FFFFFF",
                leading: 3,
                wordWrap: !0
            }), this.m_div_Tip._element.width = 2e3
        }
        onDestroy() {
            super.onDestroy(), M.s_loadinged = !1, M.s_instance = null
        }
        reset() {
            this.m_tl && (this.m_tl.destroy(), this.m_tl = null), M.s_msgData.length ? this.playMsg() : (this.m_div_Tip.innerHTML = "", this.visible = !1, this.destroy())
        }
        playMsg() {
            var t = M.s_msgData.shift(),
                t = (this.m_div_Tip._element.width = 2500, this.m_div_Tip.innerHTML = t, this.m_div_Tip.contextWidth < this.m_pan_Con.width ? (t = (this.m_pan_Con.width - this.m_div_Tip.contextWidth) / 2, this.m_div_Tip.x = t < 140 ? 140 : t) : this.m_div_Tip.x = 140, this.visible = !0, this.m_tl = new Laya.TimeLine, +this.m_div_Tip.contextWidth + 100),
                e = 1e3 * Math.floor(t / 100);
            this.m_tl.to(this.m_div_Tip, {
                x: -t
            }, e, null, 1500), this.m_tl.once(Laya.Event.COMPLETE, this, () => {
                this.reset()
            }), this.m_tl.play()
        }
    }
    M.s_loadinged = !1, M.s_msgData = [];
    class mi {
        constructor() {
            this.watchTypes = {}
        }
        updateSys(t) {
            switch (t.msg.msgType) {
                case Rt.roll:
                    var e = this.parseSysMsg(t.msg);
                    M.showSystemMsg(e);
                    break;
                case Rt.fish:
                    N.event(l.UPDATE_FISH_SYS, t.msg)
            }
        }
        reqUnWatch(e) {
            if (e) {
                let t = pb.UnWatchMsgReq.create();
                return t.watchType = e, delete this.watchTypes[e], k(t, m.UnWatchMsgReq, pb.IUnWatchMsgAck, {
                    noLoading: !0
                })
            }
        }
        reqFishHistory() {
            return k(pb.FishHistoryReq.create(), m.FishHistoryReq, pb.IFishHistoryAck).then(t => t)
        }
        reqWatch(e) {
            if (e) {
                let t = pb.WatchMsgReq.create();
                return t.watchType = e, this.watchTypes[e] = 1, k(t, m.WatchMsgReq, pb.IWatchMsgAck, {
                    noLoading: !0
                })
            }
        }
        reEnterGame() {
            for (var t in this.watchTypes) this.reqWatch(parseInt(t))
        }
        parseSysMsg(t) {
            if (t.msg && !t.msgId) return t.msg;
            var e, i;
            let s = [];
            for (e of t.param) e.valType == Tt.lang ? s.push(v(+e.val)) : e.valType == Tt.copper ? (i = e.val, s.push(f(i / 60) + "min<img style='height: 20px;width:20px' src='cat/ui_home/img_main_iconsmall_gold.png' />")) : e.valType == Tt.fishcoin ? s.push(+e.val + "<img style='height: 20px;width:20px' src='cat/ui_item/8.png' />") : e.valType == Tt.fishweight ? s.push(+e.val / 1e3 + "t") : s.push((i = e.val, !1 ? i.replace(" & ", function(t) {
                return {
                    " & ": "&amp;"
                } [t]
            }) : i.replace(/[<>&]/g, function(t) {
                return {
                    "<": "&lt;",
                    ">": "&gt;",
                    "&": "&amp;"
                } [t]
            })));
            t = Data.getSysMsg(t.msgId);
            return t ? v(t.msg, s) : ""
        }
    }
    class di {
        constructor() {
            if (this.m_convertAddress = "", Mmobay.MConfig.channelId == Mmobay.MConst.CHANNEL_MANTLE) return Laya.Browser.onMobile ? void CatizenWallet.Caller.init(Mmobay.MConfig.chainNet, !Mmobay.MConfig.isMantleRelease) : (CatizenWallet.Provider.init(Mmobay.MConfig.chainNet, !Mmobay.MConfig.isMantleRelease), void CatizenWallet.Provider.subscribe(t => {
                t.connected ? N.event(l.WALLET_CONNECTED) : N.event(l.WALLET_DISCONNECT)
            }));
            let t = this.m_tonConnect = new window.TON_CONNECT_UI.TonConnectUI({
                manifestUrl: Mmobay.MConfig.tonConnectManifestUrl
            });
            t.setConnectRequestParameters({
                state: "ready",
                value: {
                    tonProof: "success"
                }
            }), t.connectionRestored.then(t => {
                t ? (console.log("Connection restored."), N.event(l.WALLET_CONNECTED)) : console.log("Connection was not restored.")
            })
        }
        get connected() {
            return Mmobay.MConfig.channelId == Mmobay.MConst.CHANNEL_MANTLE ? !Laya.Browser.onMobile && CatizenWallet.Provider.connected : this.m_tonConnect.connected
        }
        connect() {
            return Mmobay.MConfig.channelId == Mmobay.MConst.CHANNEL_MANTLE ? Laya.Browser.onMobile ? Promise.reject("not support") : CatizenWallet.Provider.connect() : (Laya.Browser.onPC && zt(), new Promise((e, i) => {
                const s = this.m_tonConnect.onStatusChange(t => {
                        if (console.log("onStatusChange==>" + JSON.stringify(t)), s(), !t) return i("wallet info is null");
                        t = t.account.address;
                        e(t)
                    }),
                    a = this.m_tonConnect.onModalStateChange(t => {
                        console.log("onModalStateChange==>" + JSON.stringify(t)), "closed" == t.status && (a(), "wallet-selected" != t.closeReason && (s(), i("failed")))
                    });
                this.m_tonConnect.uiOptions = {
                    actionsConfiguration: {
                        twaReturnUrl: this.formatBotLink()
                    }
                }, this.m_tonConnect.openModal().then(() => {
                    console.log("openModal success")
                }).catch(t => {
                    console.log("openModal error==>" + JSON.stringify(t)), s(), a(), i("open modal error")
                })
            }))
        }
        disconnect() {
            return Mmobay.MConfig.channelId == Mmobay.MConst.CHANNEL_MANTLE ? Laya.Browser.onMobile ? Promise.reject("not support") : CatizenWallet.Provider.disconnect().then(() => {
                Laya.timer.once(100, this, () => {
                    N.event(l.WALLET_DISCONNECT)
                })
            }) : this.m_tonConnect.disconnect().then(() => {
                this.m_convertAddress = "", Laya.timer.once(100, this, () => {
                    N.event(l.WALLET_DISCONNECT)
                })
            })
        }
        sendTransaction(s, a, n, t, e = "") {
            var i;
            return Mmobay.MConfig.channelId == Mmobay.MConst.CHANNEL_MANTLE ? (i = S.id + Date.now() + "", t == Gt.signIn ? Laya.Browser.onMobile ? CatizenWallet.Caller.gameSignIn(e, i, n) : CatizenWallet.Provider.gameSignIn(n) : Laya.Browser.onMobile ? CatizenWallet.Caller.recharge(e, i, s + "", n) : CatizenWallet.Provider.recharge(s + "", n)) : (Laya.Browser.onPC && zt(), new Promise((t, e) => {
                this.m_tonConnect.uiOptions = {
                    actionsConfiguration: {
                        twaReturnUrl: this.formatBotLink()
                    }
                };
                var i = {
                    validUntil: Math.floor(Date.now() / 1e3) + 360,
                    messages: [{
                        address: a,
                        amount: s,
                        payload: n
                    }]
                };
                this.m_tonConnect.sendTransaction(i).then(() => {
                    console.log("transaction success"), t()
                }).catch(t => {
                    console.log("transaction error==>" + JSON.stringify(t)), e()
                })
            }))
        }
        convertAddress() {
            return new Promise((e, t) => {
                if (this.connected)
                    if (Mmobay.MConfig.channelId == Mmobay.MConst.CHANNEL_MANTLE) {
                        if (Laya.Browser.onMobile) return t("not support");
                        var i = CatizenWallet.Provider.address;
                        e(i)
                    } else this.m_convertAddress ? e(this.m_convertAddress) : (i = this.m_tonConnect.wallet.account.address, S.getWalletAddress(i).then(t => {
                        this.m_convertAddress = t.Address, e(t.Address)
                    }).catch(() => {
                        t("convert address error")
                    }));
                else t("wallet disconnect!")
            })
        }
        formatBotLink() {
            return `https://t.me/${Vt()}/gameapp?startapp=open_` + S.linkType
        }
    }
    class _i extends Laya.EventDispatcher {
        constructor() {
            super(...arguments), this._dataLoaded = !1, this.langJsonUrl = ""
        }
        init() {
            this.lunch = new li, this.sysNotice = new mi, this.fish = new se, this.account = new Qt, this.wallet = new di, this.login = new ri, this.bag = new te, this.cat = new ie, this.club = new ci, this.invite = new ae
        }
        loadData(i, s = !1) {
            return new Promise((e, t) => {
                Laya.loader.loadP(i).then(() => {
                    var t;
                    Data.buildData(Laya.Loader.getRes(i)), Laya.loader.clearRes(i), "" != N.langJsonUrl && (t = Laya.Loader.getRes(N.langJsonUrl)) && (Data.buildData(t), Laya.loader.clearRes(N.langJsonUrl)), s && (this._dataLoaded = !0, this.dispatch(l.DATA_LOADED)), e(0)
                })
            })
        }
        get dataLoaded() {
            return this._dataLoaded
        }
        dispatch(...t) {
            t.forEach(t => this.event(t))
        }
    }
    var N = new _i;
    Mmobay.MConfig.showNetLog && (window.manager = N);
    class ui extends t.cat.views.common.CountViewUI {
        constructor() {
            super(...arguments), this.m_count = 0, this.m_times = 1, this.m_clickTimes = []
        }
        get count() {
            return this.m_count
        }
        set count(t) {
            this.m_count = t, this.m_sli_Count.value = this.m_count, this.onChangeCount()
        }
        onDestroy() {
            super.onDestroy(), this.m_btn_Minus.offAll(), this.m_btn_Plus.offAll(), Laya.timer.clearAll(this)
        }
        setData(t = 10, e = 100, i = 0, s = 1022, a = 1, n = 1) {
            this.m_txtLang = s, this.m_times = n, 0 < t ? this.m_step = t : (t = Math.abs(t), this.m_step = Math.ceil((e - i) * t / 100)), this.m_sli_Count.value = 0, this.m_sli_Count.max = e, this.m_sli_Count.min = i, this.m_sli_Count.value = a, this.onChangeCount(), this.m_btn_Minus.offAll(), this.m_btn_Plus.offAll(), this.m_btn_Minus.on(Laya.Event.MOUSE_DOWN, this, t => {
                Laya.timer.once(500, this, () => {
                    Laya.timer.loop(100, this, () => {
                        this.onClickMinus(t, !1)
                    })
                }), Laya.timer.once(5e3, this, () => {
                    Laya.timer.clearAll(this), Laya.timer.loop(30, this, () => {
                        this.onClickMinus(t, !1)
                    })
                }), this.m_btn_Minus.scale(.8, .8)
            }), this.m_btn_Plus.on(Laya.Event.MOUSE_DOWN, this, t => {
                Laya.timer.once(500, this, () => {
                    Laya.timer.loop(100, this, () => {
                        this.onClickPlus(t, !1)
                    })
                }), Laya.timer.once(5e3, this, () => {
                    Laya.timer.clearAll(this), Laya.timer.loop(30, this, () => {
                        this.onClickPlus(t, !1)
                    })
                }), this.m_btn_Plus.scale(.8, .8)
            }), this.m_btn_Minus.on(Laya.Event.MOUSE_UP, this, () => {
                Laya.timer.clearAll(this), this.m_btn_Minus.scale(1, 1)
            }), this.m_btn_Plus.on(Laya.Event.MOUSE_UP, this, () => {
                Laya.timer.clearAll(this), this.m_btn_Plus.scale(1, 1)
            }), this.m_btn_Minus.on(Laya.Event.MOUSE_OUT, this, () => {
                Laya.timer.clearAll(this), this.m_btn_Minus.scale(1, 1)
            }), this.m_btn_Plus.on(Laya.Event.MOUSE_OUT, this, () => {
                Laya.timer.clearAll(this), this.m_btn_Plus.scale(1, 1)
            })
        }
        onClickPlus(t, e = !0) {
            var i = this.m_sli_Count.max;
            !i || this.m_count >= i || e && !this.setCheckTime(Date.newDate().getTime()) || (e = this.m_count + this.m_step / this.m_times, this.m_count = Math.min(i, e), this.m_sli_Count.value = this.m_count * this.m_times)
        }
        onClickMinus(t, e = !0) {
            var i = this.m_sli_Count.min;
            this.m_count <= i || e && !this.setCheckTime(Date.newDate().getTime()) || (e = this.m_count - this.m_step / this.m_times, this.m_count = Math.max(i, e), this.m_sli_Count.value = this.m_count * this.m_times)
        }
        onChangeCount() {
            if (this.m_sli_Count.max <= 0) {
                let t = this.m_sli_Count.getChildAt(1);
                t.x = 0, this.m_count = 0
            } else this.m_count = this.m_sli_Count.value / this.m_times;
            this.m_txt_Num.text = v(this.m_txtLang, this.m_count), N.event(l.COUNT_CHANGE, this.m_count)
        }
        setCheckTime(t) {
            return this.m_clickTimes.push(t), 4 < this.m_clickTimes.length && this.m_clickTimes.shift(), 4 == this.m_clickTimes.length && this.m_clickTimes[3] - this.m_clickTimes[0] < 1e3 && he("limit", 1e3) && g(v(164)), !0
        }
    }
    class gi extends t.cat.views.common.FishCoinViewUI {
        onAwake() {
            super.onAwake(), this.updateCoin()
        }
        updateCoin() {
            this.m_txt_Coin.text = S.fishCoin + ""
        }
        removePlus() {
            this.m_box_Plus.destroy()
        }
        hideBg() {
            this.m_img_Bg.visible = !1
        }
        onClickPlus(t) {
            _(T, {
                closeOnSide: !0
            })
        }
    }
    L([D(l.UPDATE_ITEM), D(l.FISHCOIN_CHANGE)], gi.prototype, "updateCoin", null);
    class pi extends t.cat.views.common.LvViewUI {
        setData(t) {
            this.m_txt_Lv.text = "" + t
        }
    }
    class Ci extends t.cat.views.fish.FishRankCellViewUI {
        dataChanged(t, e) {
            if (e ? this.dataSource = e : e = this.dataSource, e) {
                this.m_txt_Rank.visible = 3 < +e.rankData.rank, this.m_img_Rank.visible = +e.rankData.rank <= 3, 3 < +e.rankData.rank ? this.m_txt_Rank.text = e.rankData.rank + "" : this.m_img_Rank.skin = `cat/ui_rank/img_ranking_number_${e.rankData.rank}.png`, this.m_txt_Name.text = e.rankData.name, this.m_txt_Score.text = N.fish.formatWeight(+e.rankData.score);
                let t = e.rankData.rankKey;
                Mmobay.MConfig.channelId == Mmobay.MConst.CHANNEL_MANTLE && 123 == t && (t = 126), this.m_img_Fish.skin = `cat/ui_fish/${t}.png`, this.m_img_Line.visible = !e.isSelf, this.m_view_Head.setHeadShow({
                    isCircle: !0,
                    icoUrl: e.rankData.icon,
                    uname: e.rankData.name,
                    borderLvl: 5,
                    channelId: e.rankData.channelID
                })
            }
        }
    }
    class yi extends t.cat.views.squad.HeadViewUI {
        constructor() {
            super(...arguments), this.m_awaked = !1, this.m_data = null
        }
        onAwake() {
            super.onAwake(), this.m_awaked = !0, this.m_data && this.setHeadShow(this.m_data)
        }
        setHeadShow(t) {
            this.m_awaked ? ((this.m_data = t).isCircle ? (this.m_img_Mask.skin = "cat/ui_item/8.png", this.m_img_Board.left = this.m_img_Board.right = this.m_img_Board.top = this.m_img_Board.bottom = -1, this.m_img_Board.skin = `cat/ui_rank/head1${t.borderLvl}.png`) : (this.m_img_Mask.skin = "cat/ui_rank/headMask.png", this.m_img_Board.left = this.m_img_Board.right = this.m_img_Board.top = this.m_img_Board.bottom = -4, this.m_img_Board.skin = `cat/ui_rank/head${t.borderLvl}.png`), this.m_img_Mask.size(this.width, this.height), "" != t.icoUrl && +t.icoUrl ? (this.m_img_Head.skin = "https://game.catizen.ai/tgcatimgs/" + t.icoUrl + ".jpg", this.m_img_Head.visible = !0, this.m_box_Default.visible = !1) : (this.m_box_Default.visible = !0, this.m_img_Head.visible = !1, this.m_txt_Show.text = t.uname && t.uname.slice(0, 2) || "Na"), t.notShowChain ? this.m_img_Chain.visible = !1 : (this.m_img_Chain.visible = !0, t.channelId && 1 != t.channelId ? this.m_img_Chain.skin = `cat/ui_rank/m_chain_${t.channelId}.png` : this.m_img_Chain.skin = "cat/ui_rank/m_chain_1.png"), this.visible = !0) : this.m_data = t
        }
    }
    class vi extends t.cat.views.fish.FishRewardDetailCellViewUI {
        dataChanged(t, e) {
            var i;
            e ? this.dataSource = e : e = this.dataSource, e && (i = e.settleCfg.id <= 3, this.m_txt_Rank.visible = !0, this.m_img_Line.visible = !e.isSelf, i ? (this.m_txt_Rank.x = 95, this.m_txt_Rank.text = v([1017, 1018, 1019][e.settleCfg.id - 1]), this.m_img_Rank.skin = `cat/ui_rank/img_ranking_number_${e.settleCfg.id}.png`, this.m_img_Rank.visible = !0) : (this.m_txt_Rank.x = 55, e.settleCfg.start == e.settleCfg.end ? this.m_txt_Rank.text = v(1021, e.settleCfg.start) : this.m_txt_Rank.text = v(1021, e.settleCfg.start + "~" + e.settleCfg.end), this.m_img_Rank.visible = !1), this.m_txt_Desc.text = v(1020, e.settleCfg.rewardRate), i = f(Math.floor(N.fish.m_fishPool * e.settleCfg.rewardRate / 100)), this.m_txt_Reward.text = i + "", this.m_img_RewardBg.width = 10 + Math.max(65, this.m_txt_Reward.width) + 50)
        }
    }
    class fi extends t.cat.views.home.SumCatViewUI {
        constructor() {
            super(...arguments), this.m_index = null
        }
        onAwake() {
            super.onAwake(), this.on(Laya.Event.MOUSE_DOWN, this, () => {
                1 == N.cat.airDropMap[this.m_index] ? N.event(l.OPNE_AIR_DROP, [this.m_index]) : this.dataSource && 0 < this.dataSource && N.event(l.MOVE_CAT, {
                    cat: this,
                    index: this.m_index,
                    catId: this.dataSource
                })
            })
        }
        dataChanged(e, i) {
            if (this.m_view_Lv.visible = !1, this.m_index = e, i ? this.dataSource = i : i = this.dataSource, this.m_spine && this.m_spine.destroy(), this.m_view_Lv.visible = !1, i && !(i < 0)) {
                this.m_view_Lv.visible = !0, this.m_view_Lv.setData(i);
                e = Data.getCat(i).showId;
                let t = .5;
                var s;
                200 <= +e && (t = .4), 210 < i && (s = +Data.getCat(i).oldShowId, t = 200 <= s ? .5 : 100 <= s ? .45 : .38), this.m_spine = R.create({
                    url: "cat/spine/" + e + ".json",
                    parent: this.m_box_Cat,
                    px: 30,
                    py: 50,
                    scale: t,
                    autoRemove: !1,
                    alpha: 1
                }), N.cat.playCat(this.m_spine, "squat idle"), this.addChild(this.m_view_Lv), i && i < 0 && (this.m_view_Lv.visible = this.m_spine.visible = !1), this.updateLunch()
            }
        }
        matchEquip(t) {
            t && t == this.dataSource ? this.m_img_Sum.visible = !0 : this.m_img_Sum.visible = !1
        }
        playSumAni(s) {
            if (s != Data.maxCats) {
                var a = Data.getCat(s - 1).showId;
                let t = 1,
                    e = (200 <= +a ? t = .8 : 210 < s - 1 && (s = +Data.getCat(s - 1).oldShowId, t = 200 <= s ? 1 : 100 <= s ? .9 : .76), this.m_box_Cat.visible = !1, R.create({
                        url: "cat/spine/" + a + ".json",
                        parent: this.m_box_L,
                        px: 50,
                        py: 100,
                        scale: t,
                        autoRemove: !1,
                        alpha: 1
                    })),
                    i = R.create({
                        url: "cat/spine/" + a + ".json",
                        parent: this.m_box_R,
                        px: 50,
                        py: 100,
                        scale: t,
                        autoRemove: !1,
                        alpha: 1
                    });
                i.stop(), e.stop(), this.ani1.addLabel("boom", 8), x.instance.playSound("UI_Tips.mp3"), this.ani1.once(Laya.Event.LABEL, this, () => {
                    R.create({
                        url: "cat/spine/boom.json",
                        parent: this,
                        px: 0,
                        py: 0,
                        autoRemove: !0,
                        alpha: 1,
                        autoPlay: !0
                    })
                }), this.ani1.once(Laya.Event.COMPLETE, this, () => {
                    this.m_box_L.destroyChildren(), this.m_box_R.destroyChildren(), this.m_box_Cat.visible = !0
                }), N.cat.playCat(e, "squat idle"), N.cat.playCat(i, "squat idle"), this.ani1.play(0, !1)
            }
        }
        updateLunch() {
            this.m_img_Mine.visible = N.lunch.checkCatLunch(this.m_index), this.dataSource && (this.m_spine.visible = this.m_view_Lv.visible = !this.m_img_Mine.visible)
        }
    }
    L([D(l.CAT_MATCH)], fi.prototype, "matchEquip", null), L([D("updateLunch"), D(l.UPDATE_LUNCH), D(l.POOLBONUS)], fi.prototype, "updateLunch", null);
    class bi extends t.cat.views.home.ShopCellViewUI {
        dataChanged(i, s) {
            if (this.m_index = i, s ? this.dataSource = +s : s = this.dataSource, s) {
                this.m_view_Lv.setData(+s), this.m_spine && this.m_spine.destroy();
                var a = Data.getCat(s),
                    n = N.cat.getGoldCatLv(),
                    t = N.cat.getFishCoinLv(),
                    e = n < s && s <= t,
                    e = (this.m_btn_Buy.skin = `cat/ui_comm/img_public_btn_big_${e?"green":"blue"}.png`, this.m_txt_Buy.strokeColor = e ? "#4a7408" : "#764428", this.m_img_Cost.skin = e ? "cat/ui_item/8.png" : "cat/ui_item/coin.png", this.m_txt_Buy.text = f(N.cat.getCatCost(s)) + "", this.m_txt_Out.text = "+" + f(a.outGold) + "/s", s <= Math.max(n, t));
                if (e) {
                    this.m_btn_Buy.visible = !0;
                    let t = .5,
                        e = 35;
                    a = +Data.getCat(s).showId;
                    200 <= a ? (t = .4, e = 55) : 100 <= a && (e = 50, t = .45), 210 < s && (200 <= (n = +Data.getCat(s).oldShowId) ? (t = .4, e = 55) : 100 <= n && (e = 50, t = .45)), this.m_img_Lock.visible = this.m_img_Mask.visible = !1, this.m_spine = R.create({
                        url: "cat/spine/" + Data.getCat(s).showId + ".json",
                        parent: this,
                        px: this.m_img_Mask.x + 30,
                        py: this.m_img_Mask.y + e,
                        scale: 1.44 * t,
                        autoRemove: !1,
                        alpha: 1,
                        zOrder: 1
                    }), this.m_spine.name = i + "", N.cat.playCat(this.m_spine, "squat idle")
                } else this.m_img_Lock.visible = this.m_img_Mask.visible = !0, this.m_btn_Buy.visible = !1;
                this.m_btn_Free.visible = N.cat.freeCat && N.cat.freeCat == s, this.m_btn_Free.visible && (this.m_btn_Buy.visible = !1), Laya.timer.callLater(this, () => {
                    this.m_img_SpeedBg.width = this.m_txt_Out.width + 35 + 15
                }), this.addChild(this.m_view_Lv), this.m_img_Clip.rotation = s % 2 == 0 ? Math.randRange(-20, 5) : Math.randRange(5, 20)
            }
        }
        onClickFree() {
            N.cat.reqCreate(this.dataSource, !1, !0).then(() => {
                g(v(1033)), this.dataChanged(this.m_index, this.dataSource)
            })
        }
        onClickBuy() {
            let e = -1;
            for (let t = 0; t < 12; t++)
                if (!N.cat.allcats[t]) {
                    e = t;
                    break
                } if (-1 == e) return g(v(1027));
            var t = this.dataSource > N.cat.getGoldCatLv();
            if ((t ? S.fishCoin : S.gold) < N.cat.getCatCost(this.dataSource)) {
                if (!t) return g(v(168));
                _(T)
            }
            N.cat.reqCreate(this.dataSource, t).then(() => {
                g(v(1033)), this.m_txt_Buy.text = f(N.cat.getCatCost(this.dataSource)) + ""
            })
        }
    }
    class ki extends t.cat.views.lunchPool.AssetCellViewUI {
        dataChanged(t, e) {
            e ? this.dataSource = e : e = this.dataSource, e && (this.m_txt_Cost.text = "", this.m_txt_Name.text = e.name, this.m_txt_Num.text = Intl.NumberFormat().format(e.num) + "", this.m_img_Icon.skin = e.icon)
        }
    }
    class wi extends Laya.Box {
        constructor() {
            super(...arguments), this._constructors = [], this._items = {}, this._creatings = {}
        }
        onDestroy() {
            for (const e in this._items) {
                let t = this._items[e];
                t.destroyed || t.destroy()
            }
            this._items = {}
        }
        setupCls(t) {
            this._constructors = t
        }
        changeIndex(t) {
            var e = "item" + t;
            if (this._curName != e) {
                if (this._curName) {
                    let t = this._items[this._curName];
                    t && t.removeSelf()
                }
                this._curName = e;
                e = this._items[e];
                e ? this.addChild(e) : this.createItem(t)
            }
        }
        createItem(t) {
            let e = "item" + t;
            this._creatings[e] || (t = this._constructors[t]) && (this._creatings[e] = !0, u(t.cls, {
                params: t.params || []
            }).then(t => {
                this.destroyed ? t.destroy() : (this._creatings[e] = !1, t.name = e, this._items[e] = t, e == this._curName && this.addChild(t))
            }))
        }
    }
    class Si extends t.cat.views.recharge.RechargeCellViewUI {
        dataChanged(t) {
            var e = this.dataSource;
            e && (this.m_img_Icon.skin = `cat/ui_recharge/fc${e.iconId}.png`, this.m_img_Double.visible = e.showDouble, this.m_txt_Price.text = "$ " + e.price, this.m_txt_FishNum.text = v(1023, e.amount), this.m_txt_DoubleNum.text = "+" + e.amount, this.m_img_Extra.visible = !e.showDouble && 0 < +e.extra, this.m_txt_ExtraFish.text = "+" + e.extra)
        }
    }
    class xi extends t.cat.views.squad.BoostCellViewUI {
        dataChanged(t, e) {
            e ? this.dataSource = e : e = this.dataSource, this.m_img_Select.visible = !!e.isSelect;
            let i = "";
            i = 0 == e.pIndex ? "1st" : 1 == e.pIndex ? "2nd" : 2 == e.pIndex ? "3rd" : e.pIndex + 1 + "th", this.m_txt_Price.text = i + " - $ " + e.price
        }
    }
    class Li extends t.cat.views.squad.FriendInviteCellViewUI {
        dataChanged(t, e) {
            e ? this.dataSource = e : e = this.dataSource, this.m_img_Rank.visible = e.rank <= 3, e.rank <= 3 && (this.m_img_Rank.skin = `cat/ui_rank/img_ranking_number_${e.rank}.png`), this.m_txt_Rank.visible = 3 < e.rank, this.m_txt_Rank.text = e.rank + "", this.m_txt_Get.text = "+" + e.income, this.m_txt_FrenNum.text = e.inviteCount + " frens", this.m_txt_Name.text = e.name;
            var i = this.m_txt_Name.width;
            this.m_txt_Name._tf.lines.toString() != this.m_txt_Name.text ? (this.m_txt_Over.right = i - this.m_txt_Name._tf.textWidth - 25 + 3, this.m_txt_Over.visible = !0) : this.m_txt_Over.visible = !1, this.m_view_Head.setHeadShow({
                isCircle: !0,
                icoUrl: e.icon,
                uname: e.name,
                borderLvl: 5,
                channelId: e.channelID
            })
        }
    }
    class Di extends t.cat.views.squad.SquadCellViewUI {
        dataChanged(t, e) {
            e ? this.dataSource = e : e = this.dataSource, this.m_txt_Level.text = v(Ft[e.league]), this.m_txt_Name.text = e.name, this.m_img_Cup.skin = `cat/ui_notpack/cup${e.league}.png`, this.m_view_Head.setHeadShow({
                isCircle: !1,
                icoUrl: e.icon + "",
                uname: e.name,
                borderLvl: 5,
                notShowChain: !0
            })
        }
    }
    class P {
        constructor() {}
        static init() {
            var t = Laya.ClassUtils.regClass;
            t("logic/views/common/CountView.ts", ui), t("logic/views/common/FishCoinView.ts", gi), t("logic/views/common/LoadingView", A), t("logic/views/common/LvView.ts", pi), t("logic/views/common/WifiView.ts", ni), t("logic/views/fish/FishHistoryCellView.ts", le), t("logic/views/fish/FishItemView.ts", be), t("logic/views/fish/FishRankCellView.ts", Ci), t("logic/views/squad/HeadView.ts", yi), t("logic/views/fish/FishRewardDetailCellView.ts", vi), t("logic/views/home/SumCatView.ts", fi), t("logic/views/home/ShopCellView.ts", bi), t("logic/views/lunchPool/AssetCellView.ts", ki), t("logic/views/lunchPool/LunchCellView.ts", Qe), t("logic/base/ui/SuperStack.ts", wi), t("logic/views/recharge/RechargeCellView.ts", Si), t("logic/views/squad/BoostCellView.ts", xi), t("logic/views/squad/FriendCellView.ts", Fe), t("logic/views/squad/FriendInviteCellView.ts", Li), t("logic/views/squad/SquadCellView.ts", Di), t("logic/views/squad/RankCellView.ts", Te)
        }
    }
    P.width = 560, P.height = 1120, P.scaleMode = "showall", P.screenMode = "vertical", P.alignV = "middle", P.alignH = "center", P.startScene = "cat/views/common/BuyItemDlg.scene", P.sceneRoot = "", P.debug = !1, P.stat = !1, P.physicsDebug = !1, P.exportSceneToJson = !0, P.init();
    new class {
        constructor() {
            var t;
            this.m_configUrl = "cat/fileconfig.json", this.m_uiUrl = "cat/ui.json", Mmobay.gameDispatcher.event(Mmobay.MEvent.LOAD_PROGRESS, Mmobay.MConst.LOAD_CFG), P.stat && Laya.Stat.show(), Laya.alertGlobalError(!0), (t = Laya.ClassUtils.regClass)("Animation", a), t("Button", G), t("CheckBox", q), t("ComboBox", O), t("HBox", H), t("VBox", W), t("Scene", z), t("View", j), t("Dialog", Q), Laya.AtlasInfoManager.enable(this.m_configUrl, Laya.Handler.create(this, this.onConfigLoaded)), this.createAssistScrollView()
        }
        onConfigLoaded() {
            oi(), Laya.MouseManager.multiTouchEnabled = !1, Laya.loader.clearRes(this.m_configUrl);
            let e = [];
            Mmobay.MConfig.loadUI && e.push({
                url: this.m_uiUrl,
                type: Laya.Loader.PLF
            });
            [].forEach(t => {
                e.push({
                    url: t + ".png",
                    type: Laya.Loader.IMAGE
                })
            });
            if ([].forEach(t => {
                    e.push({
                        url: t + ".atlas",
                        type: Laya.Loader.ATLAS
                    })
                }), !e.length) return this.onResLoaded(!0);
            Laya.loader.load(e, Laya.Handler.create(this, this.onResLoaded))
        }
        onResLoaded(t) {
            window.Telegram && window.Telegram.WebApp.enableClosingConfirmation(), hi()
        }
        createAssistScrollView() {
            if (Laya.Browser.onAndroid) try {
                let t = Laya.Browser.getElementById("assist-scroll-container");
                if (!t) return;
                t.style.width = window.innerWidth, t.style.height = window.innerHeight;
                let i = Laya.Browser.createElement("ul");
                var e = window.innerWidth + 2e3;
                i.style.width = e, i.style.position = "relative", i.style.left = -1e3, t.appendChild(i);
                for (let e = 0; e < 20; e++) {
                    let t = Laya.Browser.createElement("li");
                    t.style.height = 200, t.textContent = "" + e, i.appendChild(t)
                }
                Laya.timer.once(200, this, () => {
                    t.scrollTop = 200
                })
            } catch (t) {
                console.log(t)
            }
        }
    }
}();
