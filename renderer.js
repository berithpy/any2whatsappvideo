const { ipcRenderer } = require('electron')
const cheers = require('cheers-alert')
const qs = (selector) => document.querySelector(selector)
const status = qs('.status')
const holder = qs('.holder')


const reset = () => {
  if (!Object.keys(adb.tasks).length) {
    holder.classList.remove('active')
    holder.classList.add('ready')
  }
}

const createCard = () => {
  const card = document.createElement('div')
  card.setAttribute('class', 'card')
  return card
}

const push = (f) => {
  const card = createCard()
  holder.appendChild(card)
  let path = f.path.replace(f.name,'')

  card.innerHTML = `<span class='details'>Currently converting:"<span class='file'>${f.path}</span>"</span>`

  // card.setAttribute('data-uid', 123)
  ipcRenderer.send('video-dropped', `${f.name}@@@${path}`)
  card.addEventListener('click', (event) => {
    event.preventDefault()
    ipcRenderer.send('folder-to-open',f.path)
    //here we should open the destination folder and maybe close it when its done
    
  })
}

holder.ondragover = () => {
  holder.classList.add('over')
  return false
}

holder.ondragleave = holder.ondragend = () => {
  holder.classList.remove('over')
  return false
}

holder.ondrop = (e) => {
  e.preventDefault()
    for (let f of e.dataTransfer.files) {
    if (contains(f.type, 'video')) {
      push(f)
      holder.classList.remove('ready', 'over')
      holder.classList.add('active')
    } else {
      cheers.warning({
        title: 'Warning',
        message: 'Not a video',
        alert: 'slideleft',
        icon: 'fa-user',
        duration: 3
      })
    }
  }
  return false
}

function contains(str, subStr) {
  return str.indexOf(subStr) >= 0
}

ipcRenderer.on('main-error',(event,error)=>{
  cheers.warning({
    title: 'Warning',
    message: 'There was a problem with the main script',
    alert: 'slideleft',
    icon: 'fa-user',
    duration: 3
  })
})