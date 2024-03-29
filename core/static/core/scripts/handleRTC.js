const servers = {
    iceServers: [
        {
            urls: ['stun:stun1.l.google.com:19302', 'stun:stun2.l.google.com:19302']
        }
    ]
}

let peerConnection = new RTCPeerConnection(servers)
let localStream;
let remoteStream;

let init = async () => {
    const mediaConstraints = {
        video: {
            width: { min: 640, ideal: 1920, max: 1920 },
            height: { min: 400, ideal: 1080 },
        }, audio: true
    }
    localStream = await navigator.mediaDevices.getUserMedia(mediaConstraints)
    remoteStream = new MediaStream()

    document.getElementById('self-video-element').srcObject = localStream
    document.getElementById('remote-video-element').srcObject = remoteStream

    localStream.getTracks().forEach((track) => {
        peerConnection.addTrack(track, localStream);
    });

    peerConnection.ontrack = (event) => {
        event.streams[0].getTracks().forEach((track) => {
            remoteStream.addTrack(track);
        });
    };
}

const remote_user = window.location.pathname.split('/').at(-1)
const url = `wss://${window.location.hostname}/wss/RTC/${remote_user}/`
const socket = new WebSocket(url)



let createOffer = async () => {
    peerConnection.onicecandidate = async (event) => {

        //Event that fires off when a new offer ICE candidate is created
        if (event.candidate) {
            // document.getElementById('offer-sdp').value = JSON.stringify(peerConnection.localDescription)
            const candidate = JSON.stringify(event.candidate)
            socket.send(
                JSON.stringify({ type: 'candidate', message: { candidate } })
            )
            console.log("candidate sent", candidate)
        }
    };

    let offer = await peerConnection.createOffer();
    await peerConnection.setLocalDescription(offer);
    offer = JSON.stringify(offer)
    socket.send(
        JSON.stringify({ type: 'offer', message: { offer } })
    )
}

let createAnswer = async (offer) => {
    offer = JSON.parse(offer)

    peerConnection.onicecandidate = async (event) => {
        //Event that fires off when a new answer ICE candidate is created
        if (event.candidate) {
            console.log('Adding answer candidate...:', event.candidate)
            // document.getElementById('answer-sdp').value = JSON.stringify(peerConnection.localDescription)
            candidate = JSON.stringify(event.candidate)
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

let addAnswer = async (answer) => {
    console.log('Add answer triggerd')
    answer = JSON.parse(answer)
    console.log('answer:', answer)
    if (!peerConnection.currentRemoteDescription) {
        peerConnection.setRemoteDescription(answer);
    }
}

init()

const queryString = window.location.search;
const params = new URLSearchParams(queryString);
const isOutgoing = params.get('outgoing');
socket.onopen = function (e) {
    if (isOutgoing === 'true') {
        setTimeout(createOffer, 10 * 1000)
    }
}

const callStatusModal=document.getElementById('callStatusModal')
socket.onmessage = ({ data }) => {
    const { type, message } = JSON.parse(data)
    if (type === 'call.offer') {
        callStatusModal.classList.add('hidden')
        createAnswer(message.offer)
    }
    else if (type === 'call.candidate') {
        peerConnection.addIceCandidate(JSON.parse(message.candidate))
    }
    else if (type === 'call.answer') {
        callStatusModal.classList.add('hidden')
        addAnswer(message.answer)
    }
}