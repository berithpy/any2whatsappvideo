const { ipcRenderer } = require('electron')
const cheers = require('cheers-alert')
const qs = (selector) => document.querySelector(selector)
const status = qs('.status')
const holder = qs('.holder')
let encodingPercentage = 0

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
  let path = f.path.replace(f.name, '')
  let convertion ={
    name: f.name,
    path: path,
    id: path+f.name
  }
  ipcRenderer.send('video-dropped', convertion)

  ipcRenderer.on(`encoding-progress-${convertion.id}`, (event, percentage) => {
    encodingPercentage = percentage
    card.innerHTML = `<span class='details'>Currently converting:"<span class='file'>${f.path}</span>"</span> <progress value='${encodingPercentage}' max='100'>${encodingPercentage} %</progress>`
  })

  card.addEventListener('click', (event) => {
    event.preventDefault()
    ipcRenderer.send('folder-to-open', f.path)
  })

  ipcRenderer.on('encoding-succesful', (event, succ) => {
    holder.removeChild(holder.lastChild)
    cheers.success({
      title: 'Success!',
      message: 'Video re-encoded!',
      alert: 'slideleft',
      icon: 'fa-user',
      duration: 3
    })
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

ipcRenderer.on('main-error', (event, error) => {
  cheers.warning({
    title: 'Warning',
    message: 'There was a problem with the main script',
    alert: 'slideleft',
    icon: 'fa-user',
    duration: 3
  })
})


