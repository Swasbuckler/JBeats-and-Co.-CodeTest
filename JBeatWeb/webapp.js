const track = document.getElementById('co_track');
const team_desc = document.getElementById('desc_list');
let currentDesc;

window.addEventListener('mousemove', moveDrag);

window.addEventListener('touchmove', moveDrag);

track.addEventListener('mousedown', moveDown);

track.addEventListener('touchstart', moveDown);

window.addEventListener('mouseup', moveUp);

window.addEventListener('touchend', moveUp);

function moveDrag(e) {
    let client_X;
    if (e.type == 'mousemove') { client_X = e.clientX; }
    else if (e.type == 'touchmove') { client_X = e.touches[0].clientX; }

    if(track.dataset.mouseDownAt === "0") return;

    const mousePos = parseFloat(track.dataset.mouseDownAt) - client_X;
    const maxDist = 190;
    
    let dist = ((track.scrollWidth / track.offsetWidth) * mousePos) * -1; 
    let nextDist = parseFloat(track.dataset.prevDist) + dist; 

    if (nextDist > maxDist) {
        track.prepend(track.lastElementChild);
        nextDist = nextDist - maxDist;
        track.dataset.prevDist = nextDist;
        track.dataset.mouseDownAt = client_X;
    }
    if (nextDist < -maxDist) {
        track.append(track.firstElementChild);
        nextDist = nextDist + maxDist;
        track.dataset.prevDist = nextDist;
        track.dataset.mouseDownAt = client_X;
    }

    track.dataset.dist = nextDist;

    track.style.transform = `translateX(${nextDist}px)`;
}

function moveDown(e) {
    let client_X;
    if (e.type == 'mousedown') { client_X = e.clientX; }
    else if (e.type == 'touchstart') { client_X = e.touches[0].clientX; }

    track.dataset.mouseDownAt = client_X;
}

function moveUp(e) {
    track.dataset.mouseDownAt = "0";
    track.dataset.prevDist = track.dataset.dist;
}

function hoverReplace(elem) {
    currentDesc = elem.lastElementChild.cloneNode(true);
    team_desc.prepend(currentDesc);
    currentDesc.classList.add('team_desc_in');
    currentDesc.animate({transform: `translateY(0px)`
    }, { duration: 250, fill: "forwards" });

    let lastDesc = currentDesc.nextElementSibling;
    lastDesc.classList.remove('team_desc_in');
    lastDesc.classList.add('team_desc_out');
    lastDesc.animate({transform: `translateY(50px)`
    }, { duration: 250, fill: "forwards" });
    lastDesc.addEventListener('animationend', function(e) {
        lastDesc.remove();
    });
}

function dropInfo(elem) {
    let thisParent = elem.parentElement;
    let arrow = elem.lastElementChild;
    if (!elem.dataset.open) {
        for (let i = 1; i < thisParent.children.length; i++) {
            thisParent.children[i].style.display = 'flex';
        }
        arrow.style.borderTopWidth = '0px';
        arrow.style.borderBottomWidth = '5px';
        elem.dataset.open = "1";
    } else {
        for (let i = 1; i < thisParent.children.length; i++) {
            thisParent.children[i].style.display = 'none';
        }
        arrow.style.borderTopWidth = '5px';
        arrow.style.borderBottomWidth = '0px';
        elem.dataset.open = "";
    }
}