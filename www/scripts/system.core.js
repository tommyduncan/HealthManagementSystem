$(function () {
    if (!sessionStorage.getItem('token')) {
        alert('請先登入！');

        location.href = './index.html';
    }

    $('#logout_btn').click(function () {
        sessionStorage.removeItem('token');

        location.href = './index.html';
    });
})