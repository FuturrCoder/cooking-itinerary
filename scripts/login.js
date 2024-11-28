function showLogin() {
  $('#mBackground').removeClass('hide')
}

function closeLogin() {
  $('#mBackground').addClass('hide')
}

window.onclick = function(e) {
  if (!e.target.matches('.dropbtn')) {
    $('#accountDropdown').addClass('hide')
  }
}

$(document).ready(function() {
  let firebaseConfig = {} // redacted

  firebase.initializeApp(firebaseConfig)
  firebase.analytics()

  let auth = firebase.auth()
  let loggedIn = false
  let login = $('#login')
  let logout = $('#logout')
  let signup = $('#signup')

  window.onclick = function(event) {
    if (event.target === $('#mBackground')) {
      closeLogin()
    }
  }

  $('#resend').click(function() {
    if (!loggedIn) {
      showLogin()
    } else {
      auth.currentUser.sendEmailVerification().then(function() {
        auth.signOut().catch((e) => {
          console.log(e)
        })
        $('#resendm').css('color', 'mediumseagreen')
        $('#resendm').text('Done')
        setInterval(function() {
          $('#resendm').text('')
        }, 5000)
      }).catch(e => {
        $('#resendm').css('color', 'crimson')
        $('#resendm').text('Error')
        setInterval(function() {
          $('#resendm').text('')
        }, 5000)
        console.error(e)
      })
    }
  })

  $('#glogin').click(function() {
    let provider = new firebase.auth.GoogleAuthProvider()
    auth.signInWithRedirect(provider)
    auth.getRedirectResult().then(function(result) {
      console.log(result)
    }).catch(e => {
      $('.message').text('Error')
      $('.message').addClass('err')
      console.error(error)
    })
  })

  $('#loginc').click(function() {
    $('.loginMode').removeClass('hide')
    $('.signupMode').addClass('hide')
  })

  $('#signupc').click(function() {
    $('.signupMode').removeClass('hide')
    $('.loginMode').addClass('hide')
  })

  $('#account').submit(e => {
    e.preventDefault()
  })

  login.click(function() {
    $('.message').text('')
    $('.message').removeClass('err')
    let promise = auth.signInWithEmailAndPassword($('#emailInput').val(), $('#passwordInput').val()).then(() => {
      closeLogin()
    }).catch(e => {
      switch (e.code.split('auth/')[1]) {
        case 'wrong-password':
          $('.message').text('Incorrect Password')
          $('.message').addClass('err')
          break
        default:
          $('.message').text('Error')
          $('.message').addClass('err')
      }
      console.error(e)
    })
  })

  signup.click(function() {
    if ($('#passwordInput').val() == $('#confirm').val()) {
      $('.message').text('')
      $('.message').removeClass('err')
      let promise = auth.createUserWithEmailAndPassword($('#emailInput').val(), $('#passwordInput').val()).then(response => {
        console.log(response['user'])
        auth.currentUser.sendEmailVerification().then(function() {
          auth.signOut().then(() => {
            window.location.href = '/verify.html'
          }).catch((e) => {
            console.log(e)
          })
        }).catch(e => {
          console.error(e)
        })
      }).catch(e => {
        switch (e.code.split('auth/')[1]) {
          case 'invalid-email':
            $('.message').text('Email is Invalid')
            $('.message').addClass('err')
            break
          default:
            $('.message').text('Error')
            $('.message').addClass('err')
        }
        console.error(e)
      })
    } else {
      $('.message').text('Passwords don\'t match')
      $('.message').addClass('err')
    }
  })

  logout.click(function() {
    auth.signOut().then(() => {
      window.location.reload(false)
    }).catch((e) => {
      console.log(e)
    })
  })

  auth.onAuthStateChanged(user => {
    if (user) {
      console.log(user)
      console.log(CryptoJS.MD5(user.email.trim().toLowerCase()).toString())
      if (user.photoURL == null) {
        firebase.auth().currentUser.updateProfile({
          photoURL: `https://www.gravatar.com/avatar/${CryptoJS.MD5(user.email.trim().toLowerCase()).toString()}?size=512&d=identicon`
        }).catch((e) => {
          console.error(e)
        })
      } else {
        console.log(user.photoURL);
        $('#accountIcon').css('background-image', `url("${user.photoURL}")`)
      }
      loggedIn = true
      $('.notLoggedIn').css('display', 'none')
      $('.loggedIn').css('display', 'block')
    } else {
      loggedIn = false
      console.log('Not Logged In')
      $('.notLoggedIn').css('display', 'block')
      $('.loggedIn').css('display', 'none')
    }
  })
})
