let inventorContainer = document.getElementById('inventors_container');
let inventorOrbit = document.getElementById('inventors_orbit');
let teamContainer = document.getElementById('team_container');
let teamOrbit = document.getElementById('team_orbit');

function hoverInfo(elem) {
    let narrative = document.getElementById('narrative');
    let children = narrative.children;

    for (let i = 0; i < children.length; i++) {
        children[i].style.width = '0';
    }
    children[elem.dataset.idx].style.width = '100%';
}

function leftZoomIn() {
    inventorContainer.classList.remove('to_hidden');
    inventorOrbit.style.scale = '1';
    teamContainer.classList.add('to_hidden');
    teamOrbit.style.scale = '1.2';
}

function rightZoomOut() {
    teamContainer.classList.remove('to_hidden');
    teamOrbit.style.scale = '1';
    inventorContainer.classList.add('to_hidden');
    inventorOrbit.style.scale = '0.5';
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