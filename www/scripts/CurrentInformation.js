$(function () {
    var hasFilledSportRecord = false;

    initialize();

    /* Page initialization */
    function initialize() {
        if (sessionStorage.getItem('token')) {
            var token = 'Bearer ' + sessionStorage.getItem('token');

            $.LoadingOverlay("show");

            $('#date-input').datepicker({
                dateFormat: 'yy/mm/dd',
                defaultDate: new Date(),
                onSelect: function (textDate) {
                    $.LoadingOverlay("show");

                    getSportRecord(token, textDate.split('/').join(''), function () {
                        $.LoadingOverlay("hide");
                    });
                }
            });

            $('#date-input').datepicker('setDate', moment(new Date()).format('YYYY/MM/DD'));

            $('div[name=Div_DefaultHide]').hide();

            $('input[type=radio][name=RBTN_Sport]').change(function () {
                if (this.value == 'Y') {
                    $("#Div_SportTime").show();
                }
                else if (this.value == 'N') {
                    $("#Div_SportTime").hide();
                }
            });

            $('input[type=checkbox]').change(function () {
                var Div_ID = 'Div' + (this.id).substring(2);

                if (this.checked)
                    $("#" + Div_ID).show();
                else
                    $("#" + Div_ID).hide();
            });

            $('#Btn_Enter').click(function () {
                if (hasFilledSportRecord) {
                    var decision = confirm('確定修改紀錄？');

                    if (decision) {
                        $.LoadingOverlay("show");

                        saveSportRecord(token, 'update', function () {
                            $.LoadingOverlay("hide");
                        });
                    }
                } else {
                    $.LoadingOverlay("show");

                    saveSportRecord(token, 'insert', function () {
                        $.LoadingOverlay("hide");
                    });
                }
            });

            async.parallel([
                async.apply(getUserData, token),
                async.apply(getInspectionData, token),
                async.apply(getSportRecord, token, moment(new Date()).format('YYYYMMDD'))
            ], function (err, result) {
                if (err)
                    alert('系統錯誤，請聯絡系統管理員！');
                else {
                    var gender = result[0].Gender;
                    var kidneyFailureStage = result[1].stage;

                    checkData(gender, kidneyFailureStage);
                }

                $.LoadingOverlay("hide");
            });
        }
    }

    /* 取得使用者最新的檢測紀錄 */
    function getInspectionData(token, callback) {
        $.ajax({
            method: 'GET',
            url: webService.url + 'inspectionData',
            headers: {
                Authorization: token
            }
        }).done(function (data) {
            $('#weight').text(data.Weight);
            $('#systolicBloodPressure').text(data.SBP);
            $('#diastolicBloodPressure').text(data.DBP);
            $('#waist').text(data.Waist);
            $('#HbA1C').text(data.HbA1C);
            $('#ACSugar').text(data.ACSugar);
            $('#BUN').text(data.BUN);
            $('#creatinine').text(data.Creatinine);
            $('#eGFR').text(data.eGFR);
            $('#TCH').text(data.TCH);
            $('#TG').text(data.TG);
            $('#LDL').text(data.LDL);
            $('#UACR').text(data.UACR);

            callback && callback(null, data);
        }).fail(function (jqXHR, textStatus, errorThrown) {
            callback && callback(true, null);
        });
    }

    /* 取得使用者的運動紀錄 */
    function getSportRecord(token, dateString, callback) {
        $.ajax({
            method: 'GET',
            url: webService.url + 'appInfo/' + dateString,
            headers: {
                Authorization: token
            }
        }).done(function (data) {
            if (data) {
                if (data.movement === 'Y') {
                    $('input[name="RBTN_Sport"][value="Y"]').prop("checked", true).change();
                    $('#sportTime').val(data.Movement_Time);
                } else
                    $('input[name="RBTN_Sport"][value="N"]').prop("checked", true).change();

                if (data.Day_Record)
                    $('#Input_records').val(data.Day_Record);
                else
                    $('#Input_records').val('');

                hasFilledSportRecord = true;
            } else {
                $('input[name="RBTN_Sport"][value="N"]').prop("checked", true).change();
                $('#Input_records').val("");
                $('#sportTime').val('1');
                $('#Input_records').val('');

                hasFilledSportRecord = false;
            }

            callback && callback(null, data);
        }).fail(function (jqXHR, textStatus, errorThrown) {
            callback && callback(true, null);
        });
    }

    function getUserData(token, callback) {
        $.ajax({
            method: 'GET',
            url: webService.url + 'customData',
            headers: {
                Authorization: token
            }
        }).done(function (data) {
            callback && callback(null, data);
        }).fail(function () {
            callback && callback(true, null);
        });
    }

    /* 儲存運動紀錄 */
    function saveSportRecord(token, type, callback) {
        var method = null;

        if (type === 'update')
            method = 'PUT';
        else if (type === 'insert')
            method = 'POST';

        var sportRecord = {
            textDate: $('#date-input').val().split('/').join(''),
            hasSport: $('input:radio[name="RBTN_Sport"]:checked').val(),
            movementTime: $('#sportTime').val(),
            remark: ($('#Input_records').val() !== '') ? $('#Input_records').val() : null
        }

        if (sportRecord.hasSport === 'N')
            sportRecord.movementTime = null;

        console.log(sportRecord);

        $.ajax({
            method: method,
            url: webService.url + 'appInfo/',
            headers: {
                'Authorization': token,
                'Content-Type': 'application/json'
            },
            cache: false,
            data: JSON.stringify(sportRecord),
        }).done(function (data) {
            console.log(data);

            callback && callback(data);
        }).fail(function (jqXHR, textStatus, errorThrown) {
            alert('系統錯誤，請聯絡系統管理員！');

            callback && callback();
        });
    }

    /* 檢查各項數據之標準值 */
    function checkData(gender, kidneyFailureStage) {
        /* 收縮壓 */
        if (parseInt($('#systolicBloodPressure').text()) >= 130)
            $('#systolicBloodPressure').addClass('P_Abnormal');
        /* 舒張壓 */
        if (parseInt($('#diastolicBloodPressure').text()) >= 85)
            $('#systolicBloodPressure').addClass('P_Abnormal');
        /* 腰圍 */
        if (gender == '1') {
            if (parseInt($('#waist').text()) >= 90)
                $('#waist').addClass('P_Abnormal');
        } else if (gender == '2') {
            if (parseInt($('#waist').text()) >= 80)
                $('#waist').addClass('P_Abnormal');
        }
        /* 糖化血色素 */
        if (parseFloat($('#HbA1C').text()) >= 6.5)
            $('#HbA1C').addClass('P_Abnormal');
        /* 空腹血糖 */
        if (parseInt($('#ACSugar').text()) >= 100)
            $('#ACSugar').addClass('P_Abnormal');
        /* 尿素氮 */
        if (parseInt($('#BUN').text()) < 8 || parseInt($('#BUN').text()) > 23)
            $('#BUN').addClass('P_Abnormal');
        /* 肌酸酐 */
        if (parseFloat($('#creatinine').text()) < 0.6 || parseFloat($('#creatinine').text()) > 1.4)
            $('#creatinine').addClass('P_Abnormal');
        /* 總膽固醇 */
        if (parseInt($('#TCH').text()) < 110 || parseInt($('#TCH').text()) > 200)
            $('#TCH').addClass('P_Abnormal');
        /* 三酸甘油酯 */
        if (parseInt($('#TG').text()) >= 150)
            $('#TG').addClass('P_Abnormal');
        /* 低密度脂蛋白 */
        if (parseInt($('#LDL').text()) < 100)
            $('#LDL').addClass('P_Abnormal');
        /* 蛋白尿 */
        if (parseInt($('#UACR').text()) < 150)
            $('#UACR').addClass('P_Abnormal');
        /* 腎絲球過濾率 */
        switch (kidneyFailureStage) {
            case 'Stage1':
                if (parseInt($('#eGFR').text()) >= 90)
                    $('#eGFR').addClass('P_Abnormal');
                break;
            case 'Stage2':
                if (parseInt($('#eGFR').text()) > 89 || parseInt($('#eGFR').text()) < 60)
                    $('#eGFR').addClass('P_Abnormal');
                break;
            case 'Stage3':
                if (parseInt($('#eGFR').text()) > 59 || parseInt($('#eGFR').text()) < 30)
                    $('#eGFR').addClass('P_Abnormal');
                break;
            case 'Stage3a':
                if (parseInt($('#eGFR').text()) > 59 || parseInt($('#eGFR').text()) < 45)
                    $('#eGFR').addClass('P_Abnormal');
                break;
            case 'Stage3b':
                if (parseInt($('#eGFR').text()) > 44 || parseInt($('#eGFR').text()) < 30)
                    $('#eGFR').addClass('P_Abnormal');
                break;
            case 'Stage4':
                if (parseInt($('#eGFR').text()) > 29 || parseInt($('#eGFR').text()) < 15)
                    $('#eGFR').addClass('P_Abnormal');
                break;
            case 'Stage5':
                if (parseInt($('#eGFR').text()) < 15)
                    $('#eGFR').addClass('P_Abnormal');
                break;
        }
    }
});