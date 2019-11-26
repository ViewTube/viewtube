export default {
  inserted(el, binding) {
    let click = (evt) => {
      if (binding.value(evt, el)) {
        document.body.removeEventListener('click', click)
      }
    }
    document.body.addEventListener('click', click, true)
  }
}
