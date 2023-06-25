import { TODOPOSTOURL } from './urls.js';
import { openModal } from './modal.js';
import { leftMouseOverEvent, rightMouseOverEvent, mouseOutEvent, checkError, removeErrorMessage } from './event.js';

/* ----------
リスト作成
---------- */
// リスト作成
document.getElementById('input__form--button').addEventListener('click', function() {
    const timestamp = Date.now();
    const inputForm = document.getElementById('input__form');
    const errorMessageCheckPoint = inputForm.parentNode.childNodes[2];
    const inputTitle = document.getElementById('input__form--title');
    const inputText = document.getElementById('input__form--text');
    if (!checkError(inputTitle.value, inputForm, errorMessageCheckPoint)) return;
    if (!checkError(inputText.value, inputForm, errorMessageCheckPoint)) return;

    fetch(TODOPOSTOURL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            "timestamp": timestamp,
            "title": inputTitle.value,
            "text": inputText.value
        })
    }) .then(function(res) {
        if (res.ok) {
            return res.json();
        } else {
            openModal("", "reload");
            return console.log(res);
        }
    }) .then(function(res) {
        return console.log(res);
    });
    
    const updateTimestampID = `update__timestamp--${timestamp}`;
    const deleteTimestampId = `delete__timestamp--${timestamp}`;
    const itemTimestamp = `<div class="ToDo__list--timestamp">${timestamp}</div>`;
    const itemTitle = `<div class="ToDo__list--title">${inputTitle.value}</div>`;
    const itemText = `<div class="ToDo__list--text">${inputText.value}</div>`;
    const itemSet = `<div class="ToDo__list--set" id="${updateTimestampID}">${itemTimestamp}${itemTitle}${itemText}</div>`;
    const itemDeleteButton = `<button type="button" class="ToDo__list--button" id="${deleteTimestampId}">完了</button>`;

    const addListParent = document.getElementById('index__list--list');
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

    inputTitle.value = '';
    inputText.value = '';
    if(errorMessageCheckPoint.textContent === '入力してください') removeErrorMessage(errorMessageCheckPoint, inputForm);
    return;
});
