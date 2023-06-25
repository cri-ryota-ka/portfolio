/* ----------
マウスイベント
---------- */
function constMouseOverEvent(point) {
    point.style.color = '#fff';
    point.style.backgroundColor = '#000';
}

export function leftMouseOverEvent(point) {
    constMouseOverEvent(point);
    point.style.borderRadius = '4px 0 0 4px';
}

export function rightMouseOverEvent(point) {
    constMouseOverEvent(point);
    point.style.borderRadius = '0 4px 4px 0';
}

export function mouseOutEvent(point) {
    point.style.color = null;
    point.style.backgroundColor = null;
    point.style.borderRadius = null;
}

/* ----------
入力チェックイベント
---------- */
// 入力エラーチェック
function syntaxCheck(value) {
    if (value == {}) {
        openModal('入力を取得できません\n\n複数回表示される場合は\nページの再読み込みお願いいたします', 'error');
        return false;
    }
    return true;
}

function addErrorMessage(point, message) {
    const errorMessage = `<div class="error-message" style="color:#ff0000;height:20px;font-size:15px;">${message}</div>`;
    point.style.marginBottom = '0';
    return point.insertAdjacentHTML('afterend', errorMessage);
}

export function removeErrorMessage(removePoint, fixPoint) {
    fixPoint.style.marginBottom = '20px';
    return removePoint.remove();
}

export function checkError(value, errorMessagePoint, alreadyMessagePoint) {
    if(!syntaxCheck(value)) return false;

    // 入力値エラー
    if (value == null || !value.match(/\S/g)) {
        if (alreadyMessagePoint !== undefined
            && alreadyMessagePoint.textContent === '入力してください'
        ) return false;
        
        addErrorMessage(errorMessagePoint, '入力してください');
        return false;
    }
    return true;
}
