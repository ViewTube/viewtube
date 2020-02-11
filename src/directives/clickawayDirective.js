export default {
  inserted(el, binding) {
    const click = (evt) => {
      if (binding.value(evt, el)) {
        document.body.removeEventListener('click', click)
      }
    }
    document.body.addEventListener('click', click, true)
  }
}
