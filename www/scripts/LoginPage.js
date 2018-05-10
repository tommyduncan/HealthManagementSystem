$(function () {
    var user = {
        username: null,
        password: null
    };
    var rememberLoginInfo = false;

    initialize();

    /* Page initialization */
    function initialize() {
        if (!localStorage.getItem('rememberLoginInfo') || localStorage.getItem('rememberLoginInfo') === 'false') {
            rememberLoginInfo = false;
        } else {
            rememberLoginInfo = true;
        }

        if(rememberLoginInfo)
            $('#CB_RememberPW').prop('checked', true);

        if (localStorage.getItem('username') && localStorage.getItem('password')) {
            $('#TB_ID').val(AES_Decode(localStorage.getItem('username')));
            $('#TB_PW').val(AES_Decode(localStorage.getItem('password')));
        }

        $('#Btn_Login').click(function () {
            user.username = $('#TB_ID').val();
            user.password = $('#TB_PW').val();

            if (user.username && user.password) {
                login(user);
            } else {
                alert('請輸入帳號或密碼！');
            }
        });

        $('#CB_RememberPW').change(function () {
            var Div_ID = 'Div' + (this.id).substring(2);

            if (this.checked) {
                rememberLoginInfo = true;
                localStorage.setItem('rememberLoginInfo', 'true');
            } else {
                rememberLoginInfo = false;
                localStorage.setItem('rememberLoginInfo', 'false');
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
                sessionStorage.setItem('token', jqXHR.getResponseHeader('Authorization'));

                if (rememberLoginInfo) {
                    localStorage.setItem('username', AES_Encode($('#TB_ID').val()));
                    localStorage.setItem('password', AES_Encode($('#TB_PW').val()));
                } else {
                    localStorage.removeItem('username');
                    localStorage.removeItem('password');
                }

                location.href = './CurrentInformation.html';
            }
        }).fail(function (jqXHR, textStatus, errorThrown) {
            alert(jqXHR.responseJSON.errorMsg);
        });
    }

    function AES_Encode(string) {
        return CryptoJS.AES.encrypt(string, app.secret).toString();
    }

    function AES_Decode(encodeString) {
        return CryptoJS.AES.decrypt(encodeString, app.secret).toString(CryptoJS.enc.Utf8);
    }
});