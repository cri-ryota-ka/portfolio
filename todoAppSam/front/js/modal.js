import { TODOUPDATEURL, TODODELETEOURL } from './urls.js';
import { checkError } from './event.js';

/* ----------
モーダル開閉
---------- */
// モーダルの種類切り替え
export function openModal(obj, type) {
    const modal = document.getElementById('modal');
    const text = document.getElementById('modal__text');
    const leftButton = document.getElementById('modal__leftbutton');
    const rightButton = document.getElementById('modal__rightbutton');
    const overlay = document.getElementById('modal__overlay');

    if (type == 'update') {
        const index = Array.from(document.getElementsByClassName('ToDo__list')).indexOf(obj.parentNode);
        const objTimestamp = obj.childNodes[0].textContent;
        const objTitle = obj.childNodes[1].textContent;
        const objText = obj.childNodes[2].textContent;

        function removeButtonEvent() {
            leftButton.removeEventListener('click', leftHandler);
            rightButton.removeEventListener('click', rightHandler);
            return;
        }
        function leftHandler() {
            removeButtonEvent();
            return closeModal();
        };
        function rightHandler() {
            const updateTitle = document.getElementById('modal__update--title');
            const updateText = document.getElementById('modal__update--text');
            const updateFormSet = document.getElementById('modal__update');
            const errorMessageCheckPoint = text.childNodes[1];
            if (!checkError(updateTitle.value, updateFormSet, errorMessageCheckPoint)) return;
            if (!checkError(updateText.value, updateFormSet, errorMessageCheckPoint)) return;
            const indexJson = JSON.stringify({
                "timestamp": parseInt(objTimestamp, 10),
                "title": updateTitle.value,
                "text": updateText.value
            });
            removeButtonEvent();
            return updateToDo(index, indexJson);
        };

        text.textContent = '';
        const modalUpdateTitle = `<input type="text" id="modal__update--title" value="${objTitle}" placeholder="タイトル" maxlength="32">`;
        const modalUpdateText = `<textarea id="modal__update--text" placeholder="本文" maxlength="1024">${objText}</textarea>`;
        const modalUpdateFormSet = `<p id="modal__update">${modalUpdateTitle}${modalUpdateText}</p>`;
        text.insertAdjacentHTML('beforeend', modalUpdateFormSet);
        leftButton.textContent = 'キャンセル';
        rightButton.textContent = '更新';
        leftButton.addEventListener('click', leftHandler);
        rightButton.addEventListener('click', rightHandler);
        modal.classList.add('open');
        overlay.classList.add('open');
        return;
    }

    if (type == 'delete') {
        const index = Array.from(document.getElementsByClassName('ToDo__list')).indexOf(obj.parentNode);
        const objTimestamp = obj.parentNode.childNodes[0].childNodes[0].textContent;
        const objTitle = obj.parentNode.childNodes[0].childNodes[1].textContent;
        const objText = obj.parentNode.childNodes[0].childNodes[2].textContent;
        const indexJson = JSON.stringify({
            "timestamp": parseInt(objTimestamp, 10),
            "title": objTitle,
            "text": objText
        });
        function removeButtonEvent() {
            leftButton.removeEventListener('click', leftHandler);
            rightButton.removeEventListener('click', rightHandler);
            return;
        }
        function leftHandler() {
            removeButtonEvent();
            return closeModal();
        };
        function rightHandler() {
            removeButtonEvent();
            return doneToDo(index, indexJson);
        };

        text.textContent = `${objTitle} を\n完了します`;
        leftButton.textContent = 'キャンセル';
        rightButton.textContent = '完了';
        leftButton.addEventListener('click', leftHandler);
        rightButton.addEventListener('click', rightHandler);
        modal.classList.add('open');
        overlay.classList.add('open');
        return;
    }

    if (type == 'error') {
        text.textContent = obj;
        leftButton.textContent = '閉じる';
        modal.classList.add('error');
        overlay.classList.add('open');
        return;
    }

    if (type == 'reload') {
        text.textContent = "処理に失敗しました\n\nページの再読み込みお願いいたします";
        modal.classList.add('reload');
        overlay.classList.add('open');
        return;
    }
    return console.log('none modal type');
}

// モーダル閉じる
function closeModal() {
    const modal = document.getElementById('modal');
    const overlay = document.getElementById('modal__overlay');
    
    modal.classList.remove('open');
    modal.classList.remove('error');
    overlay.classList.remove('open');
    return;
}

document.getElementById('modal__leftbutton').addEventListener('click', function() {
    return closeModal();
});

// リスト更新
function updateToDo(index, indexJson) {
    const indexList = document.getElementsByClassName('ToDo__list')[index];
    const itemTitle = indexList.childNodes[0].childNodes[1];
    const itemText = indexList.childNodes[0].childNodes[2];
    itemTitle.textContent = JSON.parse(indexJson).title;
    itemText.textContent = JSON.parse(indexJson).text;

    fetch(TODOUPDATEURL, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json'
        },
        body: indexJson
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
    return closeModal();
}

// リスト完了
function doneToDo(index, indexJson) {
    const indexList = document.getElementsByClassName('ToDo__list')[index];
    indexList.remove();

    fetch(TODODELETEOURL, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json'
        },
        body: indexJson
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
    return closeModal();
}
