var host = 'https://www.googleapis.com/customsearch/v1?cx=011634901688220916863:3tda1geanei&key=AIzaSyCIA6ZbPp4i99e1HCVGGQly0_8RjLGFta8&q='
var auth
var firestore
var user
var loadedNum = 0
var loadGoal = 7
var ingredients = []
var list = []
var iNames = {}
var searchResults
var iData
var selected = []
var removed = []
var added = []
var urlRegexp = /^(?:(?:https?|ftp):\/\/)?(?:(?!(?:10|127)(?:\.\d{1,3}){3})(?!(?:169\.254|192\.168)(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)(?:\.(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)*(?:\.(?:[a-z\u00a1-\uffff]{2,})))(?::\d{2,5})?(?:\/\S*)?$/

$.get('assets/Ingredients.txt', function(data) {
  iData = data
})

function index(searchResults, id) {
  fetch(`https://recipe-index.herokuapp.com/?url=${searchResults.link}`)
    .then(response => response.json())
    .then(data => {
      ingredients.push(data)
      if (data[data.length - 1]) {
        $(`#results${id} .more`).before(`<label class="container"><input type="checkbox" id="${'select' + String(ingredients.length - 1)}" onclick="addRecipe(this)"><a href="${searchResults.link}" target="_blank" rel="noopener noreferrer">${searchResults.htmlTitle}</a></label><br>`)
        getServings(`#select${ingredients.length - 1}`)
      }
      console.log(ingredients);
    })
}

function getServings(elem) {
  // console.log($(elem).next().attr('href'))
  fetch(`https://recipe-index-2.herokuapp.com/?url=${$(elem).next().attr('href')}`)
    .then(response => response.text())
    .then(data => {
      console.log(data)
      $(elem).parent().append(`<span style="font-size: 0.75rem;"> (${data.substr(data.lastIndexOf(':') + 2)})</span>`)
    })
}

function addRecipe(elem) {
  if (elem.checked) {
    var r = ingredients[$(elem).attr('id').split('select')[1]]
    var rID = $(elem).next().text() + ';' + $(elem).attr('id').split('select')[1]
    r.push(rID)
    list.push(r)
    iNames[rID] = {}
    for (n in r) {
      if (n < r.length - 2) {
        var ingItem = r[n].replace(/\ \((.*)\)|[*]/g, '')
        if ((ingItem.match(/\n↵/g) || []).length > 1) {
          nLine = Math.max(ingItem.lastIndexOf('\n'), ingItem.lastIndexOf('↵'))
          ingItem = ingItem.slice(0, nLine) + ingItem.slice(nLine).replace(/[\n↵]/g, ', ')
        }
        ingItem = ingItem.replace(/[\n↵—;]/g, ' ').replace(/ {2,}/g, ' ').split(/[,;]/g)[0].split(' ')
        var poss = ''
        if (ingItem.length > 2) {
          var stopNum = ingItem.length - 1
        } else {
          var stopNum = ingItem.length
        }
        for (var w = 1; w < stopNum; w++) {
          var testw = ''
          if (' pound wedges to if is as or and chopped peeled minced pressed shredded sliced package packed cooked such boneless lean see flat fresh -'.search(' ' + ingItem[ingItem.length - w]) != -1) {
            console.log('continue');
            continue
          } else if (w == 1 || poss != '') {
            for (var j = 1; j < w + 1; j++) {
              testw = testw + ingItem[ingItem.length - j]
            }
          } else {
            testw = ingItem[ingItem.length - w]
          }
          if (iData.search(testw) != -1) {
            poss = testw
          } else if (testw[testw.length - 1] == 's') {
            if (iData.search(testw.substring(0, testw.length - 1)) != -1) {
              poss = testw.substring(0, testw.length - 1)
            }
          }
        }
        if (poss != '') {
          if (!(poss in iNames[rID])) {
            iNames[rID][poss] = []
          }
          iNames[rID][poss].push(r[n])
        } else {
          iNames[rID][r[n]] = [r[n]]
        }
      }
    }
    console.log(iNames)
    $(elem).parent().parent().prev().show(100)
    $(elem).parent().next().remove()
    $(elem).parent().appendTo($(elem).parent().parent().prev())
    $(elem).parent().parent().append('<br>')
    $(elem).parent().parent().parent().parent().css('width', '25%')
    if ($(elem).parent().parent().height() / parseFloat($('body').css('font-size')) >= 15) {
      $(elem).parent().parent().height(15 * parseFloat($('body').css('font-size')))
    }
    $(elem).parent().parent().next().css('height', 'fit-content')
    if ($(elem).parent().parent().next().height() / parseFloat($('body').css('font-size')) >= 15) {
      $(elem).parent().parent().next().height(15 * parseFloat($('body').css('font-size')))
    }
    $(elem).parent().parent().parent().css('margin-bottom', 'auto')
    $(elem).parent().parent().parent().parent().height(Math.max($(elem).parent().parent().parent().height(), $(elem).parent().parent().height() + $(elem).parent().parent().next().height() + 175))
    saveRecipes($(elem).parent().parent().parent().attr('id').split('day')[1])
  } else {
    var id = $(elem).parent().parent().next().attr('id')
    id = id.charAt(id.length - 1)
    for (recipe in list) {
      if (list[recipe][list[recipe].length - 1].split(';')[1] == $(elem).attr('id').split('select')[1]) {
        list[recipe] = ['null;0']
      }
    }
    console.log($(elem).next().text() + ';' + $(elem).attr('id').split('select')[1]);
    delete iNames[$(elem).next().text() + ';' + $(elem).attr('id').split('select')[1]]
    ingredients[$(elem).attr('id').split('select')[1]].pop()
    $(elem).parent().next().remove()
    $(elem).parent().insertBefore(`#results${id} .more`)
    $(`#results${id} .more`).before('<br>')
    if ($(elem).parent().parent().prev().html() == '') {
      $(elem).parent().parent().prev().hide(100)
      $(elem).parent().parent().css('height', 'fit-content')
    }
    $(elem).parent().parent().parent().parent().css('width', '25%')
    if ($(elem).parent().parent().prev().height() / parseFloat($('body').css('font-size')) >= 15) {
      $(elem).parent().parent().prev().height(15 * parseFloat($('body').css('font-size')))
    }
    $(elem).parent().parent().css('height', 'fit-content')
    $(elem).parent().parent().prev().css('height', 'fit-content')
    if ($(elem).parent().parent().height() / parseFloat($('body').css('font-size')) >= 15) {
      $(elem).parent().parent().height(15 * parseFloat($('body').css('font-size')))
    }
    $(elem).parent().parent().parent().css('margin-bottom', $(elem).parent().parent().height() + $(elem).parent().parent().prev().height())
    // $(elem).parent().parent().parent().parent().height($(elem).parent().parent().height() + $(elem).parent().parent().prev().height())
    saveRecipes(id)
  }
}

function search(elem) {
  var id = $(elem).attr('id')
  id = id.charAt(id.length - 1)
  $('#results' + id).removeClass('show')
  setTimeout(function() {
    $('#results' + id).addClass('show')
    $('#day' + id).css('margin-bottom', '15.5em')
  }, 100)
  var search = $('#search' + id).val()
  if (urlRegexp.test(search)) {
    fetch(`https://recipe-index.herokuapp.com/?url=${search}`)
      .then(response => response.json())
      .then(data => {
        $(`#results${id}`).children('.more').remove()
        $(`#results${id}`).append(`<button class="more" id="more${id}.11" onclick="showMore(this)" style="opacity:0;">Load More ↓</button>`)
        ingredients.push(data)
        var length = ingredients.length - 1
        if (data[data.length - 1]) {
          fetch('https://textance.herokuapp.com/title/' + search)
            .then(response => response.text())
            .then(data => {
              console.log(data)
              $(`#results${id} .more`).before(`<label class="container"><input type="checkbox" id="${'select' + String(length)}" onclick="addRecipe(this)"><a href="${search}" target="_blank" rel="noopener noreferrer">${data}</a></label>`)
              getServings(`#select${length}`)
              $(`#results${id} .more`).before('<br>')
              $(`#select${String(length)}`).click()
            })
        }
        console.log(ingredients)
      })
  } else {
    var results = []
    console.log(search)
    fetch(host + search)
      .then(response => response.json())
      .then(data => {
        $('#results' + id).html('')
        console.log(data)
        for (var i = 0; i < 10; i++) {
          searchResults = data.items[i]
          index(searchResults, id)
        }
        $('#results' + id).append(`<button class="more" id="more${id}.11" onclick="showMore(this)">Load More ↓</button>`)
      })
  }
}

function showMore(elem) {
  var id = $(elem).parent().attr('id')
  id = id.charAt(id.length - 1)
  var search = $('#search' + id).val()
  var startNum = $(elem).attr('id').split('.')[1]
  var results = []
  console.log(search);
  fetch(host + search + '&start=' + startNum)
    .then(response => response.json())
    .then(data => {
      console.log(data)
      for (var i = 0; i < 10; i++) {
        searchResults = data.items[i]
        index(searchResults, id)
      }
      $(elem).attr('id', `more${id}.${Number(startNum) + 10}`)
    })
}

function saveRecipes(id) {
  var urls = {}
  $(`#day${id} .chosentext .container`).each(function() {
    recipeid = `${$(this).children('a').text()};${$(this).children('input').attr('id').split('select')[1]}`
    urls[recipeid] = $(this).children('a').attr('href')
  })
  var d = new Date()
  d.setDate(new Date().getDate() + Number(id) - 1)
  firestore.doc(`users/${user['uid']}/plans/${d.toLocaleDateString('en-US').replace(/\//g, '-')}`).set({
      urls: urls
    })
    .then(function() {
      console.log('done')
      console.log(urls)
      loadedNum++
      if (loadedNum == loadGoal) {
        console.log('goal reached' + loadedNum);
        firestore.doc(`users/${user['uid']}`).onSnapshot((doc) => {
          if ('ingredients' in doc.data()) {
            selected = doc.data()['ingredients']
          }
          if ('removed' in doc.data()) {
            removed = doc.data()['removed']
          }
          if ('added' in doc.data()) {
            added = doc.data()['added']
            console.log('added: ', added);
          }
          $('#save').click()
        })
      }
    })
    .catch(e => {
      console.error(e)
    })
}

function saveIngredient(ing, ctg) {
  firestore.doc(`users/${user['uid']}`).get()
    .then((doc) => {
      if (doc) {
        if ('ingredients' in doc.data()) {
          selected = doc.data()['ingredients']
        }
        if ('removed' in doc.data()) {
          removed = doc.data()['removed']
        }
        if ('added' in doc.data()) {
          added = doc.data()['added']
        }
      }
      var ingText = $(ing).parent().clone().children().remove().end().text()
      console.log('ingText: ', ingText);
      if (ing.checked) {
        if (ctg == 'userInput') {
          added.push($(ing).next().val())
          console.log('added: ', added);
        } else {
          if (removed.includes(ingText)) {
            removed.splice(removed.indexOf($(ing).next().val()), 1)
            console.log('removed: ', removed)
          }
          selected.push(ctg)
        }
      } else {
        if (ctg == 'userInput') {
          added.splice(added.indexOf($(ing).next().val()), 1)
          console.log('added: ', added)
        } else {
          console.log('remove ', ingText)
          removed.push(ingText)
        }
      }
      firestore.doc(`users/${user['uid']}/`).set({
          ingredients: selected,
          removed: removed,
          added: added
        })
        .then(function() {
          console.log('done')
        })
        .catch(e => {
          console.error(e)
        })
    })
    .catch(e => {
      console.error(e)
    })
}

function removeIngredient(ing, ctg) {
  $(ing).parent().toggleClass('removed')
  if (ing.checked) {
    $(ing).parent().css('font-weight', 'bold')
  } else {
    $(ing).parent().css('font-weight', 'normal')
  }
  saveIngredient(ing, ctg)
}

function appendAddOption(elem) {
  var i = 0
  $('#list .addIngredient').each((index, element) => {
    if ($(element).val() == '') {
      i++
    }
  })
  console.log(i);
  if (i <= 1) {
    $('#list').append(`<div class="ing removed"><input type="checkbox" onclick="removeIngredient(this, 'userInput')"><input type="text" class="addIngredient" onclick="appendAddOption(this)"></div>`)
  }
}

function save() {
  $('#list').show(100)
  $('#list').html(`<h3>Shopping List</h3><button style="background-color: white;border: white;cursor: pointer;" onclick="printArea('list')"><svg viewBox="0 0 24 24" id="printList">
  <path d="M18,3H6V7H18M19,12A1,1 0 0,1 18,11A1,1 0 0,1 19,10A1,1 0 0,1 20,11A1,1 0 0,1 19,12M16,19H8V14H16M19,8H5A3,3 0 0,0 2,11V17H6V21H18V17H22V11A3,3 0 0,0 19,8Z"></path>
  </svg></button>`)
  var ingredientsAdded = false
  var iNames1 = {}
  var ctgs = []
  for (var [recipe, categories] of Object.entries(iNames)) {
    for (var [category, ingredients] of Object.entries(categories)) {
      if (!(category in iNames1)) {
        iNames1[category] = []
        ctgs.push(category)
      }
      for (var ingredient of ingredients) {
        iNames1[category].push(ingredient + ':.' + recipe)
      }
    }
  }
  ctgs.sort()
  console.log(iNames1)
  var removed1 = removed
  for (var ctg of ctgs) {
    var num = iNames1[ctg].length
    for (var i of iNames1[ctg]) {
      $('#list').append(`<div class='ing removed'><input type="checkbox" onclick="removeIngredient(this, '${ctg}')">${i.split(':.')[0]}<span class="rText">${i.split(':.')[1].split(';')[0]}</span></div>`)
      if (selected.includes(ctg)) {
        if (removed.includes(i.split(':.')[0])) {
          num--
          removed1.splice(removed1.indexOf(i.split(':.')[0]), 1)
          console.log(removed1);
        } else {
          $('#list div.ing').last().toggleClass('removed')
          $('#list div.ing').last().css('font-weight', 'bold')
          $('#list div.ing').last().children('input').prop('checked', 'true')
        }
      }
    }
    if (num == 0) {
      firestore.doc('/users/' + user['uid']).get().then(doc => {
        if (doc && doc.data()) {
          selected.splice(selected.indexOf(ctg), 1)
          console.log(selected)
          firestore.doc('/users/' + user['uid']).update({
            ingredients: selected,
            removed: removed1
          })
        }
      }).catch(e => console.log(e))
    }
  }
  console.log('added: ', added);
  for (var add of added) {
    console.log(add);
    ingredientsAdded = true
    $('#list').append(`<div class="ing"><input type="checkbox" onclick="removeIngredient(this, 'userInput')" checked><input type="text" class="addIngredient" value="${add}" onclick="appendAddOption(this)"></div>`)
  }
  if ($('#list').text().trim() == 'Shopping List' && !ingredientsAdded) {
    $('#list').append('<p>You have no ingredients in your shopping list :(</p>')
  }
  $('#list').append(`<div class="ing"><input type="checkbox" onclick="removeIngredient(this, 'userInput')"><input type="text" class="addIngredient" onclick="appendAddOption(this)"></div>`)
}

function printArea() {
  var win = window.open('', '', 'width=900,height=650')
  win.document.write(`<link href="https://fonts.googleapis.com/css?family=Poppins:400,600&display=swap" rel="stylesheet"><link rel="stylesheet" type="text/css" href="./styles/main.css"><style>div{font-weight:normal !important;}.rText{display:none;}#printList{display:none;}.removed{display:none;}</style>` + document.getElementById('list').innerHTML)
  win.document.close()
  win.focus()
  win.print()
}

function getRecipes(i, d) {
  firestore.doc(`users/${user['uid']}/plans/${d.toLocaleDateString('en-US').replace(/\//g, '-')}`).get()
    .then((doc) => {
      if (doc && doc.exists) {
        for (var [recipe] of Object.entries(doc.data()['urls'])) {
          $(`#search${i + 1}`).val(doc.data()['urls'][recipe])
          $(`#submit${i + 1}`).click()
          loadGoal++
        }
      }
      loadedNum++
      if (loadedNum == loadGoal) {
        console.log('goal reached' + loadedNum)
        firestore.doc(`users/${user['uid']}`).onSnapshot((doc) => {
          console.log('snapshot')
          console.log(doc.data());
          if ('ingredients' in doc.data()) {
            selected = doc.data()['ingredients']
          }
          if ('removed' in doc.data()) {
            removed = doc.data()['removed']
          }
          if ('added' in doc.data()) {
            added = doc.data()['added']
            console.log('added: ', added);
          }
          $('#save').click()
        })
      }
    })
    .catch(e => {
      console.log(e)
    })
}

$(document).ready(function() {

  $.getScript('/scripts/login.js')
    .fail(function() {
      auth = firebase.auth()
      firestore = firebase.firestore()

      auth.onAuthStateChanged((u) => {
        if (u) {
          user = u
          if (!user['emailVerified']) {
            auth.signOut().then(() => {
              window.location.replace('/verify.html')
            }).catch((e) => {
              console.log(e)
            })
          } else {
            console.log('/users/' + user['uid']);
            firestore.doc('/users/' + user['uid']).get().then((doc) => {
              if (!doc.exists) {
                firestore.doc('/users/' + user['uid']).set({
                    ingredients: []
                  })
                  .then(function() {
                    for (var i = 0; i < 7; i++) {
                      var d = new Date()
                      d.setDate(d.getDate() + i)
                      $(`#day${i + 1} h3`).text(d.toString().slice(0, 4))
                      getRecipes(i, d)
                    }
                  })
                  .catch(e => {
                    console.error(e)
                  })
              } else if (doc && doc.exists) {
                for (var i = 0; i < 7; i++) {
                  var d = new Date()
                  d.setDate(d.getDate() + i)
                  $(`#day${i + 1} h3`).text(d.toString().slice(0, 4))
                  getRecipes(i, d)
                }
              }
            })
          }
          console.log(user)
        } else {
          console.log('Not Logged In')
          showLogin()
          console.log(showLogin());
        }
      })
    })

  $(document).on('keypress', function(e) {
    if (e.which == 13) {
      $('#submit' + $(':focus').attr('id').charAt($(':focus').attr('id').length - 1)).click()
    }
  })
})
