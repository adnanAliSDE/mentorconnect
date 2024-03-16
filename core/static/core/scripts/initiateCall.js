const callStatusModal = document.querySelector('#callStatusModal');
function init() {
    const callData = JSON.stringify({
        type: "call.initiate",
        message: {
            recvr: window.location.href.split('/').at(-1)
        }
    })
    if (socket.readyState === 1) {
        socket.send(callData)
    }
    socket.onmessage = (e) => {
        const data = JSON.parse(e.data)
        if (data.message.content === "remote_offline") {
            callStatusModal.querySelector('#callStatusContent').innerHTML = `<p>User unavailable.Try again after some time</p>
            <button onclick=window.history.back() class='mt-3 bg-green-600 text-white px-4 py-2 rounded-md'>Go Back</button>
            `
            callStatusModal.classList.remove('hidden')
        }
        else if (data.message.status === 'accept') {
            socket.close(3001)
            callStatusModal.querySelector('#callStatusContent').innerHTML = `Call accepted connecting now...`
            // callStatusModal.classList.remove('hidden')
            const url = `${window.location.origin}/videocall/${data.message.remote_user}?outgoing=true`
            socket.close(3001)
            window.location.href = url
        }
        // console.log(data.message);
    }
}
socket.onopen = init
