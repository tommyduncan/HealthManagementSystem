$(function () {
    var config = null;
    var dateColumn = [];
    var dataset = {
        Data_Weight: {},
        Data_BloodPressure_L: {},
        Data_BloodPressure_H: {},
        Data_WC: {},
        Data_GH: {},
        Data_FBS: {},
        Data_UN: {},
        Data_Creatinine: {},
        Data_GFR: {},
        Data_Cholesterol: {},
        Data_TG: {},
        Data_LDL: {},
        Data_Proteinuria: {}
    };

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
        dataset.Data_Weight.values = new Array(dateColumn.length);
        dataset.Data_BloodPressure_L.values = new Array(dateColumn.length);
        dataset.Data_BloodPressure_H.values = new Array(dateColumn.length);
        dataset.Data_WC.values = new Array(dateColumn.length);
        dataset.Data_GH.values = new Array(dateColumn.length);
        dataset.Data_FBS.values = new Array(dateColumn.length);
        dataset.Data_UN.values = new Array(dateColumn.length);
        dataset.Data_Creatinine.values = new Array(dateColumn.length);
        dataset.Data_GFR.values = new Array(dateColumn.length);
        dataset.Data_Cholesterol.values = new Array(dateColumn.length);
        dataset.Data_TG.values = new Array(dateColumn.length);
        dataset.Data_LDL.values = new Array(dateColumn.length);
        dataset.Data_Proteinuria.values = new Array(dateColumn.length);

        /* 塞檢測資料進 dataset 陣列 */
        for (var i in inspectionDataList) {
            var month = inspectionDataList[i].Inspectionday.substring(4, 6);
            var day = inspectionDataList[i].Inspectionday.substring(6, 8);
            var inspectionDate = month + '/' + day;
            var index = dateColumn.indexOf(inspectionDate);

            dataset.Data_Weight.values[index] = inspectionDataList[i].Weight;
            dataset.Data_BloodPressure_L.values[index] = inspectionDataList[i].DBP;
            dataset.Data_BloodPressure_H.values[index] = inspectionDataList[i].SBP;
            dataset.Data_WC.values[index] = inspectionDataList[i].Waist;
            dataset.Data_GH.values[index] = inspectionDataList[i].HbA1C;
            dataset.Data_FBS.values[index] = inspectionDataList[i].ACSugar;
            dataset.Data_UN.values[index] = inspectionDataList[i].BUN;
            dataset.Data_Creatinine.values[index] = inspectionDataList[i].Creatinine;
            dataset.Data_GFR.values[index] = inspectionDataList[i].eGFR;
            dataset.Data_Cholesterol.values[index] = inspectionDataList[i].TCH;
            dataset.Data_TG.values[index] = inspectionDataList[i].TG;
            dataset.Data_LDL.values[index] = inspectionDataList[i].LDL;
            dataset.Data_Proteinuria.values[index] = inspectionDataList[i].UACR;
        }
        
        findMinMaxValue();
        setMinMaxValue();
    }

    function findMinMaxValue() {
        $.each(dataset, function (key, data) {
            var min = max = null;

            for (var i in data.values) {
                if (typeof data.values[i] !== 'undefined') {
                    if (!min && !max)
                        min = max = data.values[i];
                    else {
                        if(min > data.values[i])
                            min = data.values[i];
                        if(max < data.values[i])
                            max = data.values[i];
                    }
                }
            }
            dataset[key].min = min;
            dataset[key].max = max;
        });
    }

    function setMinMaxValue() {
        $('#min_weight').text(dataset.Data_Weight.min);
        $('#max_weight').text(dataset.Data_Weight.max);

        $('#min_SBP').text(dataset.Data_BloodPressure_H.min);
        $('#max_SBP').text(dataset.Data_BloodPressure_H.max);
        $('#min_DBP').text(dataset.Data_BloodPressure_L.min);
        $('#max_DBP').text(dataset.Data_BloodPressure_L.max);

        $('#min_waist').text(dataset.Data_WC.min);
        $('#max_waist').text(dataset.Data_WC.max);

        $('#min_HbA1C').text(dataset.Data_GH.min);
        $('#max_HbA1C').text(dataset.Data_GH.max);

        $('#min_ACSugar').text(dataset.Data_FBS.min);
        $('#max_ACSugar').text(dataset.Data_FBS.max);

        $('#min_BUN').text(dataset.Data_UN.min);
        $('#max_BUN').text(dataset.Data_UN.max);

        $('#min_creatinine').text(dataset.Data_Creatinine.min);
        $('#max_creatinine').text(dataset.Data_Creatinine.max);

        $('#min_eGFR').text(dataset.Data_GFR.min);
        $('#max_eGFR').text(dataset.Data_GFR.max);

        $('#min_TCH').text(dataset.Data_Cholesterol.min);
        $('#max_TCH').text(dataset.Data_Cholesterol.max);

        $('#min_TG').text(dataset.Data_TG.min);
        $('#max_TG').text(dataset.Data_TG.max);

        $('#min_LDL').text(dataset.Data_LDL.min);
        $('#max_LDL').text(dataset.Data_LDL.max);

        $('#min_UACR').text(dataset.Data_Proteinuria.min);
        $('#max_UACR').text(dataset.Data_Proteinuria.max);
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
                    data: dataset[DataName].values,
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
                    data: dataset[DataName].values,
                    fill: false,
                }, {
                    label: LB_data2,
                    fill: false,
                    backgroundColor: '#ECD287',
                    borderColor: '#ECD287',
                    data: dataset[DataName2].values,
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