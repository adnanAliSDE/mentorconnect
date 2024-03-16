console.log("Linked Video Call RTC")
const remote_user = window.location.pathname.split('/').at(-1)
const url = `wss://${window.location.hostname}/wss/RTC/${remote}/`
console.log(url)
const socket = new WebSocket(url)
console.log("Starting RTC process",socket.readyState)

// Populating Feeds

// Call End Handling
