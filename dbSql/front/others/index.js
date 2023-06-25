// init
window.addEventListener("DOMContentLoaded", function() {
    fetch("/fetch_user", {
        method: "get",
        headers: {}
    }).then(function(res) {
        if (!res.ok) return console.log(`error: ${res}`);
        return res.json();
    }).then(function(res) {
        const selectUserEdit = document.getElementById("main_user_edit_select");
        const selectUserInsertInfo = document.getElementById("main_info_request_select");
        for(let i = 0; i < res.length; i ++) {
            const addNo = `<option value="${res[i].id}">${res[i].id}</option>`;
            selectUserEdit.insertAdjacentHTML("beforeend", addNo);
            selectUserInsertInfo.insertAdjacentHTML("beforeend", addNo);
        }

        const tbody = document.getElementById("main_user_get_list_tbody");
        for(let i = 0; i < res.length; i ++) {
            const no = `<td>${res[i].id}</td>`;
            const name = `<td>${res[i].name}</td>`;
            const addItem = `<tr>${no}${name}</tr>`;
            tbody.insertAdjacentHTML("beforeend", addItem);
        }
        return;
    });

    this.fetch("/fetch_info", {
        method: "get",
        headers: {}
    }).then(function(res) {
        if (!res.ok) return console.log(`error: ${res}`);
        return res.json();
    }).then(function(res) {
        const select = document.getElementById("main_info_delete_select");
        for(let i = 0; i < res.length; i ++) {
            const addNo = `<option value="${res[i].id}">${res[i].id}</option>`;
            select.insertAdjacentHTML("beforeend", addNo);
        }

        const tbody = document.getElementById("main_info_get_list_tbody");
        for(let i = 0; i < res.length; i ++) {
            const no = `<td>${res[i].id}</td>`;
            const info = `<td>${res[i].info}</td>`;
            const addItem = `<tr>${no}${info}</tr>`;
            tbody.insertAdjacentHTML("beforeend", addItem);
        }
    });

    fetch("/fetch", {
        method: "get",
        headers: {}
    }).then(function(res) {
        if (!res.ok) return console.log(`error: ${res}`);
        return res.json();
    }).then(function(res) {
        const tbody = document.getElementById("main_user-info_get_list_tbody");
        for(let i = 0; i < res.length; i ++) {
            const no = `<td>${res[i].id}</td>`;
            const name = `<td>${res[i].name}</td>`;
            const info = `<td>${res[i].info}</td>`;
            const addItem = `<tr>${no}${name}${info}</tr>`;
            tbody.insertAdjacentHTML("beforeend", addItem);
        }
    });

    return;
});

// user
document.getElementById("main_user_request_button").addEventListener("click", function() {
    const text = document.getElementById("main_user_request_text");
    const errorMessagePoint = document.getElementById("main_user_request");
    if (!checkErrorString(text.value, errorMessagePoint)) return;

    const body = JSON.stringify({
        name: text.value
    });
    fetch("/fetch_user", {
        method: "post",
        headers: {
            "Content-Type": "application/json"
        },
        body: body
    }).then(function(res) {
        if (!res.ok) return console.log(`error: ${res}`);
        return;
    });

    return text.value = "";
});

document.getElementById("main_user_edit_button").addEventListener("click", function() {
    const select = document.getElementById("main_user_edit_select");
    const selectNumber = Number(select.value);
    const text = document.getElementById("main_user_edit_text");
    const errorMessagePoint = document.getElementById("main_user_edit");
    if (!checkErrorNumber(selectNumber, errorMessagePoint)) return;
    if (!checkErrorString(text.value, errorMessagePoint)) return;

    const body = JSON.stringify({
        id: selectNumber,
        name: text.value
    });

    fetch("/fetch_user", {
        method: "put",
        headers: {
            "Content-Type": "application/json"
        },
        body: body
    }).then(function(res) {
        if (!res.ok) return console.log(`error: ${res}`);
        return;
    });

    select.value = 0;
    text.value = "";
    return;
});

// info
document.getElementById("main_info_request_button").addEventListener("click", function() {
    const select = document.getElementById("main_info_request_select");
    const selectNumber = Number(select.value);
    const text = document.getElementById("main_info_request_text");
    const errorMessagePoint = document.getElementById("main_info_request");
    if (!checkErrorNumber(selectNumber, errorMessagePoint)) return;
    if (!checkErrorString(text.value, errorMessagePoint)) return;

    const body = JSON.stringify({
        user_id: selectNumber,
        info: text.value
    });

    fetch("/fetch_info", {
        method: "post",
        headers: {
            "Content-Type": "application/json"
        },
        body: body
    }).then(function(res) {
        if (!res.ok) return console.log(`error: ${res}`);
        return;
    });

    select.value = 0;
    text.value = "";
    return;
});

document.getElementById("main_info_delete_button").addEventListener("click", function() {
    const select = document.getElementById("main_info_delete_select");
    const selectNumber = Number(select.value);
    const errorMessagePoint = document.getElementById("main_info_delete");
    if (!checkErrorNumber(selectNumber, errorMessagePoint)) return;

    const body = JSON.stringify({
        id: selectNumber
    });

    fetch("/fetch_info", {
        method: "delete",
        headers: {
            "Content-Type": "application/json"
        },
        body: body
    }).then(function(res) {
        if (!res.ok) return console.log(`error: ${res}`);
        return;
    });

    return select.value = 0;
});

// error_string
function checkErrorString(value, errorMessagePoint) {
    // 構文エラー
    if (value == {}) {
        errorMessagePoint.insertAdjacentHTML("afterend", '<div style="color:#ff0000;">再読み込みしてください</div>');
        return false;
    };

    // から入力エラー
    if (value == null || !value.match(/\S/g)) {
        errorMessagePoint.insertAdjacentHTML("afterend", '<div style="color:#ff0000;">入力してください</div>');
        return false;
    }
    return true;
};

// error_number
function checkErrorNumber(value, errorMessagePoint) {
    // 構文エラー
    if (value == {}) {
        errorMessagePoint.insertAdjacentHTML("afterend", '<div style="color:#ff0000;">再読み込みしてください</div>');
        return false;
    };

    // 数字エラー
    if (value === 0 || value == null) {
        errorMessagePoint.insertAdjacentHTML("afterend", '<div style="color:#ff0000;">選択してください</div>');
        return false;
    };
    return true;
};
