const remote_user = window.location.pathname.split('/').at(-1)
const url = `wss://${window.location.hostname}/wss/RTC/${remote_user}/`
const socket = new WebSocket(url)

// WebRTC stuff
let peerConnection = new RTCPeerConnection()
let localStream;
let remoteStream;

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
    console.log("I am createOffer.");

    try {
        const offer = await peerConnection.createOffer();
        await peerConnection.setLocalDescription(offer);
        console.log("Local description set successfully.");

        // Return the status object when local description is set
        return { status: "ok" };
    } catch (error) {
        console.error("Error creating or setting local description:", error);
        throw error; // Propagate the error
    }
};

// Set up the onicecandidate event handler
let offerSDP={}
peerConnection.onicecandidate = (event) => {
    // Event that fires off when a new offer ICE candidate is created
    if (event.candidate) {
        console.log("offer ICE fired");
        offerSDP.o = JSON.stringify(peerConnection.localDescription);
        console.log(offerSDP);
    }
};


let answerSDP;
let createAnswer = async (offer) => {
    offer = JSON.parse(offer)
    peerConnection.onicecandidate = async (event) => {
        //Event that fires off when a new answer ICE candidate is created
        if (event.candidate) {
            console.log('Adding answer candidate...:', event.candidate)
            answerSDP = JSON.stringify(peerConnection.localDescription)
        }
    };

    await peerConnection.setRemoteDescription(offer);

    let answer = await peerConnection.createAnswer();
    await peerConnection.setLocalDescription(answer);
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

socket.onopen = async (e) => {
    const o = await createOffer()
    console.log(o);
    setTimeout(() => {
        if (isOutgoing === 'true') {
            if (offerSDP.o != undefined) {
                socket.send(JSON.stringify({ "type": "offer", "message": { "offerSDP": offerSDP.o } }))
                console.log(offerSDP);
            }
            else {
                console.log('Offer undefined');
            }
        }
    }, 5000);
}

socket.onmessage = (e) => {
    const { type, message } = JSON.parse(e.data)
    console.log(type, message)
    if (type === 'call.offer') {
        createAnswer(message.offerSDP)
        setTimeout(() => {
            socket.send(
                socket.send(JSON.stringify({ type: "answer", message: { answerSDP } }))
            )
        }, 5000);
    }
    else if (type === 'call.answer') {
        addAnswer(message.answerSDP)
    }
}