const url = `wss://${window.location.host}/wss/signalling/`
const socket = new WebSocket(url)
// UI components:
// let notificationModal
const VidCallAlert = (remoteUser) => {
    const content = `
    <div id='notification-modal' class="video-call-notification absolute z-10 top-0 left-0 bg-gray-800 w-full h-full flex items-center justify-center">
        <div class="content p-6 bg-white rounded-lg shadow-md max-w-md">
            <h1 class="text-xl font-semibold mb-4">Incoming Call</h1>
            <p class="text-gray-700 mb-4">Call from <span class="font-bold">${remoteUser}</span></p>
            <div onclick='this.parentElement.remove()' class="flex justify-center space-x-4">
                <button onclick="acceptCall(this)" class="bg-green-600 text-white px-6 py-3 rounded-full hover:bg-green-700">Accept</button>
                <button onclick="rejectCall(this)" class="bg-red-600 text-white px-6 py-3 rounded-full hover:bg-red-700">Reject</button>
            </div>
        </div>
    </div>
    `
    document.body.innerHTML += content;
    notificationModal = document.getElementById('notification-modal')
}

const acceptCall = (e) => {
    notificationModal.remove()
    console.log("Call Accepted", e)
}

const rejectCall = (e) => {
    notificationModal.remove()
    console.log("Call rejected")
}

socket.onopen = (e) => {
    console.log('Socket Connected')
    socket.send(JSON.stringify({ message: 'PING' }))
    console.log('Message Sent')
};

function handleVidCallNot({ content, remote_user }) {
    console.log(`Video call from ${remote_user}`)
    VidCallAlert(remote_user)
}

socket.onmessage = function (e) {
    const { type, message } = JSON.parse(e.data)
    if (type === 'videocall.notification') {
        handleVidCallNot(message)
    }
}