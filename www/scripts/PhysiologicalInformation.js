$(function () {
    var config = null;
    var dateColumn = [];
    var dataset = {};

    initialize();

    /* Page initialization */
    function initialize() {
        if (sessionStorage.getItem('token')) {
            var token = 'Bearer ' + sessionStorage.getItem('token');

            $.LoadingOverlay("show");

            $("#Div_SportTime").hide();
            $('div[name=Div_Avg_DefaultHide]').hide();
            $('input[type=checkbox]').prop("checked", false);

            $('input[name="daterange"]').daterangepicker({
                locale: {
                    format: 'YYYY/MM/DD'
                }
            }, function (start, end, label) {
                $.LoadingOverlay("show");

                $('div[name=Div_Avg_DefaultHide]').hide();
                $('input[type=checkbox]').prop("checked", false);

                getDateColumn(start.format('YYYY/MM/DD'), end.format('YYYY/MM/DD'));

                getInspectionData(token, start.format('YYYY/MM/DD').split('/').join(''), end.format('YYYY/MM/DD').split('/').join(''), function (data) {
                    processDataset(data);

                    $.LoadingOverlay("hide");
                });
            });

            $('input[type=checkbox]').change(function () {
                var Div_ID = 'Div' + (this.id).substring(2); //Get ID
                var Div_Chart_ID = 'Div' + (this.id).substring(2) + '_IMG';
                var Canvas_ID = 'Canvas' + (this.id).substring(2);
                var DataName = 'Data' + (this.id).substring(2);
                if (this.checked) {
                    $("#" + Div_ID).show(); //Display the Div
                    //Show the Chart
                    $("#" + Div_Chart_ID).append("<canvas id='" + Canvas_ID + "'></canvas>");
                    var ChartTitle = $('#' + Div_ID).children().children().html();
                    if (Div_ID != "Div_BloodPressure") {
                        SetConfig(ChartTitle, ChartTitle, DataName);
                    }
                    else {
                        DataName = 'Data' + (this.id).substring(2) + '_H';
                        var DataName2 = 'Data' + (this.id).substring(2) + '_L';
                        SetConfig_TwoData('舒張壓', '收縮壓', '血壓', DataName, DataName2);
                    }
                    var ctx = document.getElementById(Canvas_ID).getContext("2d");
                    var myChart = new Chart(ctx, config);
                }
                else {
                    $("#" + Div_ID).hide();//Hide the Div
                    //Remove the Chart
                    $("#" + Div_Chart_ID).empty();
                }
            });

            var dateRange = $('input[name="daterange"]').val();
            var startDate = dateRange.split(' - ')[0];
            var endDate = dateRange.split(' - ')[1];

            getDateColumn(startDate, endDate);

            getInspectionData(token, startDate.split('/').join(''), endDate.split('/').join(''), function (data) {
                processDataset(data);

                $.LoadingOverlay("hide");
            });
        }
    }

    /* 取得日期區間的檢測資料 */
    function getInspectionData(token, startDate, endDate, callback) {
        $.ajax({
            method: 'GET',
            url: webService.url + 'inspectionData/' + startDate + '/' + endDate,
            headers: {
                Authorization: token
            }
        }).done(function (data) {
            callback && callback(data);
        }).fail(function (jqXHR, textStatus, errorThrown) {
            callback && callback();
        });
    }

    /* 取得日期區間的所有日期 */
    function getDateColumn(startDate, endDate) {
        var startDate = new Date(startDate);
        var endDate = new Date(endDate);
        var dateDiff = moment(endDate).diff(startDate, 'day');

        dateColumn = [];
        for (var i = 0; i <= dateDiff; i++) {
            dateColumn.push(moment(startDate).add(i, 'days').format('MM/DD'));
        }
    }

    /* 處理 dataset 陣列 */
    function processDataset(inspectionDataList) {
        /* 初始化 dataset 陣列 */
        dataset['Data_Weight'] = new Array(dateColumn.length);
        dataset['Data_BloodPressure_L'] = new Array(dateColumn.length);
        dataset['Data_BloodPressure_H'] = new Array(dateColumn.length);
        dataset['Data_WC'] = new Array(dateColumn.length);
        dataset['Data_GH'] = new Array(dateColumn.length);
        dataset['Data_FBS'] = new Array(dateColumn.length);
        dataset['Data_UN'] = new Array(dateColumn.length);
        dataset['Data_Creatinine'] = new Array(dateColumn.length);
        dataset['Data_GFR'] = new Array(dateColumn.length);
        dataset['Data_Cholesterol'] = new Array(dateColumn.length);
        dataset['Data_TG'] = new Array(dateColumn.length);
        dataset['Data_LDL'] = new Array(dateColumn.length);
        dataset['Data_Proteinuria'] = new Array(dateColumn.length);

        /* 塞檢測資料進 dataset 陣列 */
        for (var i in inspectionDataList) {
            var month = inspectionDataList[i].Inspectionday.substring(4, 6);
            var day = inspectionDataList[i].Inspectionday.substring(6, 8);
            var inspectionDate = month + '/' + day;
            var index = dateColumn.indexOf(inspectionDate);

            dataset['Data_Weight'][index] = inspectionDataList[i].Weight;
            dataset['Data_BloodPressure_L'][index] = inspectionDataList[i].DBP;
            dataset['Data_BloodPressure_H'][index] = inspectionDataList[i].SBP;
            dataset['Data_WC'][index] = inspectionDataList[i].Waist;
            dataset['Data_GH'][index] = inspectionDataList[i].HbA1C;
            dataset['Data_FBS'][index] = inspectionDataList[i].ACSugar;
            dataset['Data_UN'][index] = inspectionDataList[i].BUN;
            dataset['Data_Creatinine'][index] = inspectionDataList[i].Creatinine;
            dataset['Data_GFR'][index] = inspectionDataList[i].eGFR;
            dataset['Data_Cholesterol'][index] = inspectionDataList[i].TCH;
            dataset['Data_TG'][index] = inspectionDataList[i].TG;
            dataset['Data_LDL'][index] = inspectionDataList[i].LDL;
            dataset['Data_Proteinuria'][index] = inspectionDataList[i].UACR;
        }
    }

    function SetConfig(LB_data, LB_title, DataName) {
        config = {
            type: 'line',
            data: {
                labels: dateColumn,
                datasets: [{
                    label: LB_data,
                    backgroundColor: '#A3D5D2',
                    borderColor: '#A3D5D2',
                    data: dataset[DataName],
                    fill: false,
                }]
            },
            options: {
                responsive: true,
                title: {
                    display: true,
                    text: LB_title
                },
                tooltips: {
                    mode: 'index',
                    intersect: false,
                },
                hover: {
                    mode: 'nearest',
                    intersect: true
                },
                scales: {
                    xAxes: [{
                        display: true,
                        scaleLabel: {
                            display: true,
                            labelString: 'Date'
                        }
                    }],
                    yAxes: [{
                        display: true,
                        scaleLabel: {
                            display: true,
                            labelString: 'Value'
                        }
                    }]
                }
            }
        };
    }

    function SetConfig_TwoData(LB_data, LB_data2, LB_title, DataName, DataName2) {
        config = {
            type: 'line',
            data: {
                labels: dateColumn,
                datasets: [{
                    label: LB_data,
                    backgroundColor: '#A3D5D2',
                    borderColor: '#A3D5D2',
                    data: dataset[DataName],
                    fill: false,
                }, {
                    label: LB_data2,
                    fill: false,
                    backgroundColor: '#ECD287',
                    borderColor: '#ECD287',
                    data: dataset[DataName2],
                }]
            },
            options: {
                responsive: true,
                title: {
                    display: true,
                    text: LB_title
                },
                tooltips: {
                    mode: 'index',
                    intersect: false,
                },
                hover: {
                    mode: 'nearest',
                    intersect: true
                },
                scales: {
                    xAxes: [{
                        display: true,
                        scaleLabel: {
                            display: true,
                            labelString: 'Date'
                        }
                    }],
                    yAxes: [{
                        display: true,
                        scaleLabel: {
                            display: true,
                            labelString: 'Value'
                        }
                    }]
                }
            }
        };
    }
});