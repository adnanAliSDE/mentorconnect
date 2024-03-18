const remote_user = window.location.pathname.split('/').at(-1)
const url = `wss://${window.location.hostname}/wss/RTC/${remote_user}/`
const socket = new WebSocket(url)

// WebRTC 
const queryString = window.location.search;
const params = new URLSearchParams(queryString);
const isOutgoing = params.get('outgoing');

let localStream;
let remoteStream;

const servers = {
    iceServers: [
        {
            urls: ['stun:stun1.l.google.com:19302', 'stun:stun2.l.google.com:19302']
        }
    ]
}

const peerConnection = new RTCPeerConnection(servers)

const init = async () => {
    localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false })
    remoteStream = new MediaStream()
    document.getElementById('self-video-element').srcObject = localStream
    document.getElementById('remote-video-element').srcObject = remoteStream

    peerConnection.ontrack = (event) => {
        console.log('pc ontrack: ', event)
        event.streams[0].getTracks().forEach((track) => {
            remoteStream.addTrack(track);
        });
    };

    localStream.getTracks().forEach((track) => {
        peerConnection.addTrack(track, localStream);
        console.log("Localstream Track: ", track)
    });
}

const createOffer = async () => {
    peerConnection.onicecandidate = async (event) => {
        if (event.candidate) {
            socket.send(
                JSON.stringify({ type: 'candidate', message: { candidate: event.candidate } })
            )
        }
    };

    let offer = await peerConnection.createOffer();
    await peerConnection.setLocalDescription(offer);

    offer = JSON.stringify(offer)
    socket.send(
        JSON.stringify({ type: 'offer', message: { offer } })
    )
}

const createAnswer = async (offer) => {
    offer = JSON.parse(offer)
    peerConnection.onicecandidate = async (event) => {

        if (event.candidate) {
            let candidate = JSON.stringify(event.candidate)
            socket.send(
                JSON.stringify({ type: 'candidate', message: { candidate } })
            )
        }
    };

    await peerConnection.setRemoteDescription(offer);

    let answer = await peerConnection.createAnswer();
    await peerConnection.setLocalDescription(answer);
    answer = JSON.stringify(answer)
    socket.send(
        JSON.stringify({ type: 'answer', message: { answer } })
    )

}

const addAnswer = async (answer) => {
    answer = JSON.parse(answer)
    if (!peerConnection.currentRemoteDescription) {
        peerConnection.setRemoteDescription(answer);
    }
}

socket.onopen = (e) => {
    if (isOutgoing === 'true') {
        createOffer()
    }
}

let isConnectionSuccess = false
socket.onmessage = async ({ data }) => {
    const { type, message } = JSON.parse(data)

    switch (type) {
        case 'call.offer':
            await createAnswer(message.offer)
            isConnectionSuccess = true
            break;

        case 'call.answer':
            await addAnswer(message.answer)
            isConnectionSuccess = true
            break;

        case 'call.candidate':
            await peerConnection.addIceCandidate(JSON.parse(message.candidate))
            break;

        default:
            break;
    }

    if (isConnectionSuccess) {
        console.log("Connection success.")
        showModal(open = false)
    }
}