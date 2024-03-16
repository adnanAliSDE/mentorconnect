let initialX;
let initialY;

// Function to handle the start of the drag event
function dragStart(event) {
    initialX = event.clientX - parseFloat(getComputedStyle(event.target).left);
    initialY = event.clientY - parseFloat(getComputedStyle(event.target).top);
    console.log(`Drag start x:${initialX} y:${initialY}`)
}

// Function to handle the dragging event
function drag(event) {
    event.preventDefault();
    const x = event.clientX;
    const y = event.clientY;
    event.target.style.left = `${x}px`;
    event.target.style.top = `${y}px`;
    console.log(event.target)
    console.log(`Drag event x:${x} y:${y}`)

}

// Function to handle the end of the drag event
function dragEnd(event) {
    console.log(event.target)
    // console.log(`Drag event x:${x} y:${y}`)
    // Code to handle the end of the drag event
}

// Function to load mentor's video feed dynamically
function loadMentorVideo() {
    console.log("Loading mentor's video feed...");
    // Code to load mentor's video feed
}

// Function to load user's video feed dynamically
function loadUserVideo() {
    console.log("Loading user's video feed...");
    // Code to load user's video feed
}

// Function to handle video toggle (on/off)
let isVideoOn = true;
function toggleVideo() {
    const videoIcon = document.getElementById('videoToggleIcon').firstElementChild;

    if (isVideoOn) {
        console.log("Video Off");
        videoIcon.classList.remove('fa-video');
        videoIcon.classList.add('fa-video-slash');
        isVideoOn = false
    } else {
        console.log("Video On");
        videoIcon.classList.remove('fa-video-slash');
        videoIcon.classList.add('fa-video');
        isVideoOn = true
    }
}

// Function to handle mute/unmute toggle
function toggleMute() {
    console.log("Toggling mute/unmute...");
    // Code to toggle microphone mute/unmute

    // Example code for icon switching
    const muteIcon = document.getElementById('muteToggleIcon').firstElementChild;
    if (muteIcon.classList.contains('fa-microphone')) {
        muteIcon.classList.remove('fa-microphone');
        muteIcon.classList.add('fa-microphone-slash');
    } else {
        muteIcon.classList.remove('fa-microphone-slash');
        muteIcon.classList.add('fa-microphone');
    }
}

// Function to handle call end
function endCall() {
    console.log("Ending call...");
    // Code to end the call and navigate back to previous screen
}

// Function to handle change camera
function changeCamera() {
    console.log("Changing camera...");
    // Code to change camera if available
}

// Event listener to load video feeds when the page loads
window.addEventListener('load', function () {
    loadMentorVideo();
    loadUserVideo();
});

// Event listeners for UI buttons
document.getElementById('videoToggleIcon').addEventListener('click', toggleVideo);
document.getElementById('muteToggleIcon').addEventListener('click', toggleMute);
document.getElementById('endCallButton').addEventListener('click', endCall);
document.getElementById('changeCameraButton').addEventListener('click', changeCamera);

// Event listeners for drag events
const selfUserVideo = document.getElementById('selfUserVideo')

selfUserVideo.addEventListener('dragstart', dragStart);
selfUserVideo.addEventListener('drag', drag);
selfUserVideo.addEventListener('dragend', dragEnd);


// Function to update content of call status modal
function updateCallStatus(content) {
    const callStatusContent = document.getElementById('callStatusContent');
    callStatusContent.textContent = content;
}

// Function to toggle visibility of call status modal with animation
const modal = document.getElementById('callStatusModal');
const container = document.querySelector('.modal-container');
function toggleCallStatusModal() {
    modal.classList.toggle('hidden');
    container.classList.toggle('scale-0');
    container.classList.toggle('scale-1');
}


const remoteUser = window.location.pathname.split('/').at(-1)
updateCallStatus(`Connecting to ${remoteUser}...`)

let isModalOpen = false
const showModal = (open = true) => {
    if (open && !isModalOpen) {
        toggleCallStatusModal()
    } else if (!open && isModalOpen) {
        toggleCallStatusModal()
    }
}