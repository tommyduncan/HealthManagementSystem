$(function () {
    var user = {
        username: null,
        password: null
    };

    initialize();

    /* Page initialization */
    function initialize() {
        $('#Btn_Login').click(function () {
            user.username = $('#TB_ID').val();
            user.password = $('#TB_PW').val();

            if (user.username && user.password) {
                login(user);
            } else {
                alert('請輸入帳號或密碼！');
            }
        });
    }

    /* Login function */
    function login(user) {
        $.ajax({
            method: 'POST',
            url: webService.url + 'users/login',
            data: user
        }).done(function (data, textStatus, jqXHR) {
            if (!data.error) {
                console.log(jqXHR.getResponseHeader('Authorization'));
                sessionStorage.token = jqXHR.getResponseHeader('Authorization');

                location.href = './CurrentInformation.html';
            }
        }).fail(function (jqXHR, textStatus, errorThrown) {
            alert(jqXHR.responseJSON.errorMsg);
        });
    }
});