export default {
  inserted(el, binding) {
    let f = (evt) => {
      if (binding.value(evt, el)) {
        el.removeEventListener('scroll', f)
      }
    }
    el.addEventListener('scroll', f)
  }
}
