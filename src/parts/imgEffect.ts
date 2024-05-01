import { Color, DoubleSide, Mesh, MeshBasicMaterial, Object3D, PlaneGeometry, ShaderMaterial, Vector2 } from "three";
import { Canvas, CanvasConstructor } from "../webgl/canvas";
import { Util } from "../libs/util";
import { Func } from "../core/func";
import { Capture } from "../webgl/capture";
import { ImgEffectShader } from "../glsl/imgEffectShader";
import { TexLoader } from "../webgl/texLoader";
import { MousePointer } from "../core/mousePointer";

export class ImgEffect extends Canvas {
  private _con: Object3D
  private _mesh2: Array<Mesh> = []

  // ベース映像作成用
  private _line: number = 10
  private _blockCon: Object3D
  private _imgs: Array<Mesh> = []

  private _texNum:number = Func.val(50, 100)
  private _cap: Array<Capture> = []
  private _renderCnt: number = 0

  constructor(opt: CanvasConstructor) {
    super(opt)

    this._con = new Object3D()
    this.mainScene.add(this._con)

    this._blockCon = new Object3D()

    const imgNum = this._line * this._line
    const geo = new PlaneGeometry(1, 1)
    const mat = new MeshBasicMaterial({
      map: TexLoader.instance.get('./assets/sample_0.png'),
      transparent: true,
      side: DoubleSide,
    })
    for(let i = 0; i < imgNum; i++) {
      const logo = new Mesh(geo, mat)
      this._blockCon.add(logo)
      this._imgs.push(logo)
    }

    for(let i = 0; i < this._texNum; i++) {
      this._cap.push(new Capture())
    }

    this._renderCnt = 0
    this._makeMesh()
    this._resize()
  }


  private _makeMesh(): void {
    for(let i = 0; i < this._texNum; i++) {
      const m = new Mesh(
        new PlaneGeometry(1, 1),
        new ShaderMaterial({
          vertexShader:ImgEffectShader.vertexShader,
          fragmentShader:ImgEffectShader.fragmentShader,
          transparent:true,
          uniforms:{
            range:{value:new Vector2(i * (1 / this._texNum), (i + 1) * (1 / this._texNum))},
            col:{value:new Color(0x000000).offsetHSL(Util.map(i, 0, 2, 0, this._texNum - 1), 1, 0.5)},
            time:{value:0},
            mouse:{value:new Vector2()},
            tex:{value:this._cap[(i + this._renderCnt) % this._texNum].texture()},
          }
        })
      )
      this._con.add(m)
      this._mesh2.push(m)
    }
  }


  protected _update(): void {
    super._update()

    const sw = Func.sw()
    const sh = Func.sh()

    const mx = MousePointer.instance.easeNormal.x
    const my = MousePointer.instance.easeNormal.y

    this._blockCon.position.x = mx * sw * 0.5
    this._blockCon.position.y = my * sh * -0.5
    // this._blockCon.rotation.z += 0.01
    // this._blockCon.rotation.y = Util.radian(MousePointer.instance.easeNormal.x * 90)
    // this._blockCon.rotation.z = Util.radian(mx * 45)

    const baseSize = ((Func.sw() * 1) / this._line)
    // const offsetX = (this._c * 1) % baseSize

    this._imgs.forEach((m:any, i:number) => {
      const size = baseSize
      // const sizeY = size * 0.35
      const ix = i % this._line
      const iy = Math.floor(i / this._line)
      m.scale.set(size, size, 1)
      m.position.x = ix * size - (size * this._line * 0.5) + size * 0.25
      m.position.y = iy * size - (size * this._line * 0.5) + size * 0

      // m.position.x += offsetX * (iy % 2 == 0 ? 1 : -1)
    })

    const mouse = new Vector2(Util.map(MousePointer.instance.easeNormal.x, 0, 1, -1, 1), -1 * Util.map(MousePointer.instance.easeNormal.y, 0, 1, -1, 1))
    this._mesh2.forEach((m:any, i:number) => {
      // const s = Math.max(this.renderSize.width, this.renderSize.height) * 1
      m.scale.set(this.renderSize.width, this.renderSize.height, 1)
      this._setUni(m, 'col', new Color(0x000000).offsetHSL(Util.map(Math.cos(i * 0.05 + this._c * 0.01), 0, 1, -1, 1), 1, 0.5))
      this._setUni(m, 'time', this._c)
      this._setUni(m, 'mouse', mouse)
      this._setUni(m, 'tex', this._cap[(((this._texNum - 1) - i) + this._renderCnt) % this._texNum].texture())
    })

    this._con.add(this._blockCon)

    // ベース映像のレンダリング
    if(this._c % 1 == 0) {
      const cap = this._cap[this._renderCnt % this._texNum]
      cap.add(this._blockCon)

      this.renderer.setClearColor(0x000000, 1)
      cap.render(this.renderer, this.cameraOrth)
      if(this._c % 1 == 0) this._renderCnt++
    }

    this.renderer.setClearColor(0x000000, 1)
    this.renderer.render(this.mainScene, this.cameraOrth)
  }


  protected _resize(): void {
    super._resize()

    const w = Func.sw()
    const h = Func.sh()

    this.renderSize.width = w
    this.renderSize.height = h

    let pixelRatio: number = window.devicePixelRatio || 1
    this._cap.forEach((c:Capture) => {
      c.setSize(w * 1, h * 1, pixelRatio)
    })

    this._updateOrthCamera(this.cameraOrth, w, h)
    this._updatePersCamera(this.cameraPers, w, h)

    this.renderer.setPixelRatio(pixelRatio)
    this.renderer.setSize(w, h)
    // this.renderer.clear()
  }
}
