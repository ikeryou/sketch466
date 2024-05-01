import { Mesh, OrthographicCamera, PerspectiveCamera, Points, Scene, WebGLRenderer } from 'three'
import { MyDisplay } from '../core/myDisplay'
import { Rect } from '../libs/rect'
import { DisplayConstructor } from '../libs/display'

export interface CanvasConstructor extends DisplayConstructor {
  transparent: boolean
}

export class Canvas extends MyDisplay {
  public cameraPers: PerspectiveCamera
  public cameraOrth: OrthographicCamera

  public renderer: WebGLRenderer
  public mainScene: Scene

  public isRender: boolean = true
  public renderSize: Rect = new Rect()

  constructor(opt: CanvasConstructor) {
    super(opt)
    
    const renderParam: any = {
      canvas: this.el,
      antialias: false,
      preserveDrawingBuffer: true,
      powerPreference: 'low-power',
    }

    // 透過設定
    if (opt.transparent) {
      renderParam.premultipliedAlpha = true
      renderParam.alpha = true
    }

    this.renderer = new WebGLRenderer(renderParam)
    this.renderer.autoClear = true
    this.renderer.setClearColor(0xffffff, 1)

    this.mainScene = new Scene()

    this.cameraPers = this._makePersCamera()
    this._updatePersCamera(this.cameraPers, 10, 10)

    this.cameraOrth = this._makeOrthCamera()
    this._updateOrthCamera(this.cameraOrth, 10, 10)
  }

  init() {
    super.init()
  }

  protected _makePersCamera(): PerspectiveCamera {
    return new PerspectiveCamera(60, 1, 0.0000001, 500000)
  }
  protected _makeOrthCamera(): OrthographicCamera {
    return new OrthographicCamera(1, 1, 1, 1)
  }

  protected _updatePersCamera(camera: PerspectiveCamera, w: number = 10, h: number = 10) {
    camera.aspect = w / h
    camera.updateProjectionMatrix()
    camera.position.z = h / Math.tan((camera.fov * Math.PI) / 360) / 2
  }

  protected _updateOrthCamera(camera: OrthographicCamera, w: number = 10, h: number = 10) {
    camera.left = -w * 0.5
    camera.right = w * 0.5
    camera.top = h * 0.5
    camera.bottom = -h * 0.5
    camera.near = -10000
    camera.far = 10000
    camera.updateProjectionMatrix()
    camera.position.set(0, 0, 1000)
  }

  protected _update(): void {
    super._update()
  }

  protected _setUni(m: Mesh | Points, name: string, val: any): void {
    const uni = this._getUni(m)
    uni[name].value = val
  }

  protected _getUni(mesh: any): any {
    return mesh.material.uniforms
  }
}
