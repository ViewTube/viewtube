// Written by Aaron Längert
// Adapted to Vue.js directive by Maurice Oegerli

const Ripple = {
  bind(el: HTMLElement, binding: any) {
    const me = binding.def;
    el.style.overflow = 'hidden';
    el.style.position = 'relative';
    el.classList.add('ripple');

    el.addEventListener(
      'touchstart',
      function (e) {
        me.rippleStart(e);
      },
      { passive: true }
    );
    el.addEventListener(
      'touchmove',
      function (e: any) {
        if ((e.target as any).hasAttribute('ripple-cancel-on-move')) {
          me.rippleRetrieve(e);
          return;
        }
        if (
          !document
            .elementFromPoint(e.touches[0].clientX, e.touches[0].clientY)
            .className.includes('ripple')
        ) {
          me.rippleRetrieve(e);
        }
      },
      { passive: true }
    );
    el.addEventListener(
      'touchend',
      function (e) {
        me.rippleEnd(e);
      },
      { passive: true }
    );
    el.addEventListener(
      'mousedown',
      function (e) {
        me.rippleStart(e);
      },
      { passive: true }
    );
    el.addEventListener(
      'mouseup',
      function (e) {
        me.rippleEnd(e);
      },
      { passive: true }
    );
    el.addEventListener(
      'mousemove',
      function (e) {
        if (
          (e.target as any).hasAttribute('ripple-cancel-on-move') &&
          (e.movementX !== 0 || e.movementY !== 0)
        ) {
          me.rippleRetrieve(e);
        }
      },
      { passive: true }
    );
    el.addEventListener(
      'mouseleave',
      function (e) {
        me.rippleRetrieve(e);
      },
      { passive: true }
    );
    el.addEventListener(
      'transitionend',
      function (e) {
        const target = e.target as any;
        if (target.getAttribute('animating') === '2' || target.getAttribute('animating') === '3') {
          target.style.transition = 'none';
          target.style.transform = 'translate(-50%, -50%) scale(0.15)';
          target.style.boxShadow = 'none';
          target.setAttribute('animating', '0');
        }
      },
      { passive: true }
    );
    // if not there, create a ripple div inside the element
    if (me.getRippleContainer(el) === el) {
      const rippleContainer = document.createElement('div');
      rippleContainer.classList.add('rippleContainer');
      rippleContainer.style.display = 'block';
      rippleContainer.style.height = '200px';
      rippleContainer.style.width = '200px';
      rippleContainer.style.padding = '0px 0px 0px 0px';
      rippleContainer.style.borderRadius = '50%';
      rippleContainer.style.position = 'absolute';
      rippleContainer.style.top = '0px';
      rippleContainer.style.left = '0px';
      rippleContainer.style.opacity = 0 as any;
      rippleContainer.style.zIndex = 999999 as any;
      rippleContainer.style.transform = 'translate(-50%, -50%) scale(0.15)';
      rippleContainer.style.backgroundColor = 'transparent';

      el.appendChild(rippleContainer);
    }
  },

  rippleStart(e: any) {
    const rippleContainer = this.getRippleContainer(e.target);
    if (
      (rippleContainer.getAttribute('animating') === '0' ||
        !rippleContainer.hasAttribute('animating')) &&
      e.target.className.includes &&
      e.target.className.includes('ripple')
    ) {
      rippleContainer.setAttribute('animating', '1');
      const offsetX =
        typeof e.offsetX === 'number'
          ? e.offsetX
          : e.touches[0].clientX - e.target.getBoundingClientRect().left;
      const offsetY =
        typeof e.offsetY === 'number'
          ? e.offsetY
          : e.touches[0].clientY - e.target.getBoundingClientRect().top;
      // fullCoverRadius is the longest distance between the touch and the corners of the element where the event fired
      const fullCoverRadius = Math.max(
        Math.sqrt(Math.pow(offsetX, 2) + Math.pow(offsetY, 2)),
        Math.sqrt(
          Math.pow(e.target.clientWidth - offsetX, 2) + Math.pow(e.target.clientHeight - offsetY, 2)
        ),
        Math.sqrt(Math.pow(offsetX, 2) + Math.pow(e.target.clientHeight - offsetY, 2)),
        Math.sqrt(Math.pow(offsetY, 2) + Math.pow(e.target.clientWidth - offsetX, 2))
      );
      const expandTime = e.target.getAttribute('ripple-press-expand-time') || 0.4;
      rippleContainer.style.transition =
        'transform ' + expandTime + 's ease-out, box-shadow 0.1s linear, opacity 0.1s';
      rippleContainer.style.background = e.target.getAttribute('ripple-color') || '#efefef';
      rippleContainer.style.opacity = e.target.getAttribute('ripple-opacity') || '0.2';
      rippleContainer.style.boxShadow = e.target.getAttribute('ripple-shadow') || 'none';
      rippleContainer.style.top = offsetY + 'px';
      rippleContainer.style.left = offsetX + 'px';
      rippleContainer.style.transform =
        'translate(-50%, -50%) scale(' + fullCoverRadius / 100 + ')';
    }
  },

  rippleEnd(e: any) {
    const rippleContainer = this.getRippleContainer(e.target);
    if (rippleContainer.getAttribute('animating') === '1') {
      rippleContainer.setAttribute('animating', '2');
      const background = window
        .getComputedStyle(rippleContainer, null)
        .getPropertyValue('background');
      const destinationRadius = e.target.clientWidth + e.target.clientHeight;
      rippleContainer.style.transition = 'none';
      const expandTime = e.target.getAttribute('ripple-release-expand-time') || 0.4;
      rippleContainer.style.transition =
        'transform ' +
        expandTime +
        's linear, background ' +
        expandTime +
        's linear, opacity ' +
        expandTime +
        's ease-in-out';
      rippleContainer.style.transform =
        'translate(-50%, -50%) scale(' + destinationRadius / 100 + ')';
      rippleContainer.style.background = 'radial-gradient(transparent 10%, ' + background + ' 40%)';
      rippleContainer.style.opacity = '0';
      // fire custom event and execute js given in onrippleclick attribute
      e.target.dispatchEvent(
        new CustomEvent('ripple-button-click', {
          target: e.target
        } as any)
      );
    }
  },

  rippleRetrieve(e: any) {
    const rippleContainer = this.getRippleContainer(e.target);
    if (rippleContainer.style.transform === 'translate(-50%, -50%) scale(0.15)') {
      rippleContainer.setAttribute('animating', '0');
    }
    if (rippleContainer.getAttribute('animating') === '1') {
      rippleContainer.setAttribute('animating', '3');
      const collapseTime = e.target.getAttribute('ripple-leave-collapse-time') || 0.2;
      rippleContainer.style.transition = 'box-shadow ' + collapseTime + 's linear, opacity 0.2s';
      rippleContainer.style.boxShadow = 'none';
      // rippleContainer.style.transform = 'translate(-50%, -50%) scale(0.15)'
      rippleContainer.style.opacity = '0';
    }
  },
  // returns the ripple div by scanning all children. If not found, return the argument
  getRippleContainer(el: any) {
    const children = el.childNodes;
    for (let i = 0; i < children.length; i++) {
      try {
        if (children[i].className.includes('rippleContainer')) {
          return children[i];
        }
      } catch (err) {}
    }
    return el;
  }
};

export default Ripple;
