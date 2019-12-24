/* eslint-disable no-sequences */
/* eslint-disable eqeqeq */
/* eslint-disable no-unused-expressions */
export default {
  reloadCaptcheck() {
    document.getElementsByClassName('captcheck_container')[0].innerHTML = ''
    this.initCaptcheck()
  },
  initCaptcheck() {
    function m(c, g) {
      document.getElementById('captcheck_' + c + '_answer_' + g).checked = !0
      return !1
    }

    function n(c) {
      var g = document.getElementById('captcheck_' + c + '_alt_question_button')
      var b = document.getElementById('captcheck_' + c + '_question_image')
      var d = document.getElementById('captcheck_' + c + '_question_access')
      var f = document.getElementById('captcheck_' + c + '_answer_images')
      c = document.getElementById('captcheck_' + c + '_answer_access')
      g.innerHTML == '&gt; Text mode' ? (g.innerHTML = '&gt; Image mode', b.style.display =
        'none', d.style.display = 'initial', f.style.display = 'none', c.style.display = 'initial', c.innerHTML = "<input type='text' name='captcheck_selected_answer' aria-label='Type your answer here.' autocomplete='off' autofill='off'/>") : (g.innerHTML = '&gt; Text mode', b.style.display = 'initial', d.style.display = 'none', f.style.display = 'initial', c.style.display = 'none', c.innerHTML = '')
    }
    var k = ''
    Array.prototype.forEach.call(document.getElementsByClassName('captcheck_container'), function (c) {
      c.dataset.stylenonce && (k = c.dataset.stylenonce)
      var g = new XMLHttpRequest()
      g.open('GET', 'https://captcheck.netsyms.com/api.php?action=new', !0)
      g.onreadystatechange = function () {
        if (this.readyState == 4) {
          var b = this.status
          var d = this.responseText
          if (c.innerHTML.trim() == '') {
            var f = document.createElement('div')
            f.setAttribute('class', 'captcheck_box')
            c.appendChild(f)
            if (b == 200) {
              d = JSON.parse(d)
              b = d.id_prefix
              for (var h = "<div class='captcheck_answer_images' id='captcheck_" + b + "_answer_images'>", e = 0, g = d.answers.length; e < g; e++) {
                h += "<a class='captcheck_answer_label' href='' data-prefix='" +
                  b + "' data-answer='" + d.answers[e] + "' tabindex='0' aria-role='button'><input id='captcheck_" + b + '_answer_' + d.answers[e] + "' type='radio' name='captcheck_selected_answer' value='" + d.answers[e] + "' data-prefix='" + b + "' data-answer='" + d.answers[e] + "' /><img src='" + ('https://captcheck.netsyms.com/api.php?action=img&s=' + d.session + '&c=' + d.answers[e]) + "' data-prefix='" + b + "' data-answer='" + d.answers[e] + "'/></a>"
              }
              h += '</div>'
              e = document.createElement('div')
              e.innerHTML = h + "<div class='captcheck_answer_access' id='captcheck_" +
                b + "_answer_access'></div>"
              h = document.createElement('div')
              h.setAttribute('class', 'captcheck_label_message')
              h.setAttribute('id', 'captcheck_' + b + '_label_message')
              h.innerHTML = "<span class='captcheck_question_image' id='captcheck_" + b + "_question_image'>" + d.question_i + "</span><span class='captcheck_question_access' id='captcheck_" + b + "_question_access'>" + d.question_a + "</span><a href='' class='captcheck_alt_question_button' data-prefix='" + b + "' id='captcheck_" + b + "_alt_question_button' aria-role='button' aria-label='Switch between image and text question' tabindex='0'>&gt; Text mode</a>"
              f.appendChild(h)
              f.appendChild(e)
              h = document.createElement('span')
              h.innerHTML = "<input type='hidden' name='captcheck_session_code' value='" + d.session + "' />"
              f.appendChild(h)
              f = document.querySelectorAll('.captcheck_answer_label[data-prefix="' + b + '"]')
              for (e = 0; e < f.length; e++) {
                f[e].addEventListener('click', function (a) {
                  m(a.target.getAttribute('data-prefix'), a.target.getAttribute('data-answer'))
                  a.preventDefault()
                }), f[e].addEventListener('keydown', function (a) {
                  if (a.key === 'Enter' || a.which === 13 || a.keyCode === 13 ||
                    a.key === ' ' || a.which === 32 || a.keyCode === 32) m(a.target.getAttribute('data-prefix'), a.target.getAttribute('data-answer')), a.preventDefault()
                })
              }
              document.querySelector('.captcheck_alt_question_button[data-prefix="' + b + '"]').addEventListener('click', function (a) {
                n(a.target.getAttribute('data-prefix'))
                a.preventDefault()
              })
              document.querySelector('.captcheck_alt_question_button[data-prefix="' + b + '"]').addEventListener('keydown', function (a) {
                if (a.key === 'Enter' || a.which === 13 || a.keyCode === 13 || a.key === ' ' || a.which ===
                  32 || a.keyCode === 32) n(a.target.getAttribute('data-prefix')), a.preventDefault()
              })
            } else f.innerHTML = "<span class='captcheck_error_message'>There was a problem loading the CAPTCHA.</span>"
          }
        }
      }
      g.send()
    })
    var l = document.createElement('style')
    k != '' && l.setAttribute('nonce', k)
    l.innerHTML = '.captcheck_box{font-family:Ubuntu,Arial,sans-serif;color:black;border:1px solid #e0e0e0;border-radius:3px;display:inline-block;padding:3px;margin:5px 2px 5px 1px;background-color:#f5f5f5;text-decoration:none}.captcheck_label_message,.captcheck_label_message b{color:black;font-family:Ubuntu,Roboto,Arial,sans-serif}.captcheck_answer_label{border:0}.captcheck_answer_label>input{visibility:hidden;position:absolute}.captcheck_answer_label>input+img{cursor:pointer;border:2px solid transparent;border-radius:3px;min-width:32px;width:18%;max-width:64px}.captcheck_answer_label>input:checked+img{cursor:pointer;border:2px solid #424242;border-radius:3px}.captcheck_error_message{color:red}.captcheck_question_image{display:initial}.captcheck_question_access{display:none}.captcheck_alt_question_button{float:right;font-size:80%;cursor:pointer;color:inherit;text-decoration:inherit;border:0}.captcheck_answer_images{display:initial}.captcheck_answer_access{display:none}'
    document.body.appendChild(l)
  }
}
