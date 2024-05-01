import { ImgEffect } from './parts/imgEffect'
import './style.css'

new ImgEffect({
  el: document.querySelector('.l-canvas') as HTMLElement,
  transparent: false,
})
