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

let peerConnection = new RTCPeerConnection(servers)

let init = async () => {
    localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false })
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

let createOffer = async () => {
    peerConnection.onicecandidate = async (event) => {
        console.log('Candidate: ', event)

        if (event.candidate) {
            socket.send(
                JSON.stringify({ type: 'candidate', message: { candidate: event.candidate } })
            )
        }
    };

    const offer = await peerConnection.createOffer();
    await peerConnection.setLocalDescription(offer);
    console.log("Offer: ", offer)
    socket.send(
        JSON.stringify({ type: 'offer', message: { offer } })
    )
}

let createAnswer = async (offer) => {
    peerConnection.onicecandidate = async (event) => {
        console.log('Candidate: ', event)

        if (event.candidate) {
            socket.send(
                JSON.stringify({ type: 'candidate', message: { candidate: event.candidate } })
            )
        }
    };

    await peerConnection.setRemoteDescription(offer);

    let answer = await peerConnection.createAnswer();
    await peerConnection.setLocalDescription(answer);
    console.log("Answer: ", answer)
    socket.send(
        JSON.stringify({ type: 'answer', message: { answer } })
    )

}

let addAnswer = async (answer) => {
    console.log('RTC connection successfull.')
    if (!peerConnection.currentRemoteDescription) {
        peerConnection.setRemoteDescription(answer);
    }
    showModal(open = false)
}

init()


// Main logic

socket.onopen = (e) => {

    if (isOutgoing === 'true') {
        createOffer()
    }

}

socket.onmessage = (e) => {
    const { type, message } = JSON.parse(e.data)
    console.log('Message recvd: ', message)
    if (type === 'call.offer') {
        createAnswer(message.offer)
    }
    else if (type === 'call.answer') {
        addAnswer(message.answer)
    }
    else if (type === 'call.candidate') {
        peerConnection.addIceCandidate(message.candidate)
    }
}
