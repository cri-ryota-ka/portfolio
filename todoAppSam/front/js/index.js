import { TODOGETOURL } from './urls.js';
import { openModal } from './modal.js';
import { leftMouseOverEvent, rightMouseOverEvent, mouseOutEvent } from './event.js';

/* ----------
ページ読み込み時の動作
---------- */
window.addEventListener('DOMContentLoaded', function() {
    fetch(TODOGETOURL, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    }) .then(function(res) {
        if (res.ok) {
            return res.json();
        } else {
            openModal("", "reload");
            return console.log(res.json());
        }
    }) .then(function(res) {
        const addListParent = document.getElementById('index__list--list');
        for (let i = 0; i < res.length; i++) {
            const updateTimestampID = `update__timestamp--${res[i].timestamp}`;
            const deleteTimestampId = `delete__timestamp--${res[i].timestamp}`;
            const itemTimestamp = `<div class="ToDo__list--timestamp">${res[i].timestamp}</div>`;
            const itemTitle = `<div class="ToDo__list--title">${res[i].title}</div>`;
            const itemText = `<div class="ToDo__list--text">${res[i].text}</div>`;
            const itemSet = `<div class="ToDo__list--set" id="${updateTimestampID}">${itemTimestamp}${itemTitle}${itemText}</div>`;
            const itemDeleteButton = `<button type="button" class="ToDo__list--button" id="${deleteTimestampId}">完了</button>`;

            const addListItem = `<li class="ToDo__list">${itemSet}${itemDeleteButton}</li>`;
            addListParent.insertAdjacentHTML('beforeend', addListItem);
            // updateEvents
            document.getElementById(updateTimestampID).addEventListener('mouseover', function() {
                return leftMouseOverEvent(this);
            });
            document.getElementById(updateTimestampID).addEventListener('mouseout', function() {
                return mouseOutEvent(this);
            });
            document.getElementById(updateTimestampID).addEventListener('click', function() {
                return openModal(this, 'update');
            });

            // deleteEvents
            document.getElementById(deleteTimestampId).addEventListener('mouseover', function() {
                return rightMouseOverEvent(this);
            });
            document.getElementById(deleteTimestampId).addEventListener('mouseout', function() {
                return mouseOutEvent(this);
            });
            document.getElementById(deleteTimestampId).addEventListener('click', function() {
                return openModal(this, 'delete');
            });
        }
        return console.log('complete get all todo list from DB');
    });
    return;
});
