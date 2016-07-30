/**
 * @file  根据数值生成图表
 * @author <a href="www.xiaoluo.win" >Choiwa</a>
 * @version 0.1
 */


/**
 * 生成年月日
 * @param {Num} dat 当前日期
 * @return {String}     日期
 */

function getDateStr(dat) {
    var y = dat.getFullYear();
    var m = dat.getMonth() + 1;
    m = m < 10 ? '0' + m : m;
    var d = dat.getDate();
    d = d < 10 ? '0' + d : d;
    return y + '-' + m + '-' + d;
}

function randomBuildData(seed) {
    var returnData = {};
    var leng = 82;
    var dat = new Date('2016-01-01');
    var datStr = '';
    for (var i = 1; i < leng; i++) {
        datStr = getDateStr(dat);
        returnData[datStr] = Math.ceil(Math.random() * seed);
        returnData.length = leng;
        dat.setDate(dat.getDate() + 1);
    }
    return returnData;
}

function addEvent(o, s, fn) {
    o.attachEvent ? o.attachEvent('on' + s, fn) : o.addEventListener(s, fn, false);
    return o;
}

var aqiSourceData = {
    '北京': randomBuildData(500),
    '上海': randomBuildData(300),
    '广州': randomBuildData(200),
    '深圳': randomBuildData(100),
    '成都': randomBuildData(300),
    '西安': randomBuildData(500),
    '福州': randomBuildData(100),
    '厦门': randomBuildData(100),
    '沈阳': randomBuildData(500)
};

// 用于渲染图表的数据
var chartData = {};

// 记录当前页面的表单选项
var pageState = {
    nowSelectCity: -1,
    nowGraTime: 'day'
};

/**
 * 渲染图表
 * @param  {Array} data  数据
 * @param  {String} option  天周月
 * @return {obj}      dom对象
 */
function renderChart(data, option) {
    var aqiWrap = document.querySelector('.aqi-chart-wrap');
    var ul = document.createElement('ul');

    function createLi(num,width){
        var li = document.createElement('li'),
            bgcolor = returnColor(num);
        li.style.backgroundColor = bgcolor;
        li.style.width = width;
        li.style.height = num + 'px';
        li.style.cssFloat = 'left';
        li.style.marginTop = (500 - num) + 'px';
        return li;
    }
    // 天
    function doday(data) {
        var length = data.length; //考虑自适应时可以用到
        for (key in data) {
            var num = parseInt(data[key]);
            var li = createLi(num,'10px');
            ul.appendChild(li);
        }
        aqiWrap.appendChild(ul);
    }
    // 周
    function doweek(data) {
        var newArr = weekAverage(7, data);
        for (var i = 0; i < newArr.length; i++) {
            var num = newArr[i];
            var li = createLi(num,'30px');
            ul.appendChild(li);
        }
        aqiWrap.appendChild(ul);
    }
    // 月
    function domonth(data) {
        var newArr = monthAverage(data)
        for (var i = 0; i < newArr.length; i++) {
            var num = newArr[i];
            var li = createLi(num,'50px');
            ul.appendChild(li);
        }
        aqiWrap.appendChild(ul);
    }

    switch (option) {
        case 'day':
            doday(data);
            break;

        case 'week':
            doweek(data);
            break;

        case 'month':
            domonth(data);
            break;
        default:
    }
}
/**
 * 求平均值
 * @param  {Num} num  几天
 * @param  {Array} data 数组
 * @return {Array}      新的数组
 */
function weekAverage(num, data) {
    var i = 0;
    var arr = [];
    var average = 0;
    var remainder = data.length % num;
    for (var key in data) {
        if (key == 'length') {
            console.log(key)
        } else {
            var f = false;
            i++;
            average = average + parseInt(data[key])
            if (i == num) {
                arr.push(Math.round(average / num));
                average = 0;
                i = 0;
            }
        }
    }
    if (remainder > 0) {
        arr.push(Math.round(average / remainder))
    }
    return arr;
}

function monthAverage(data) {
    var arr = [];
    var temp = [];
    var i = 1;
    for (var key in data) {
        var im = parseInt(key.slice(5, 7))
        if (im == i) {
            arr.push(data[key]);
        }
        if ((im != i) && im) {
            temp.push(arr);
            arr = [];
            arr.push(data[key]);
            i++;
        }
    }
    temp.push(arr);
    var ave = [];
    var numave = 0;
    for (var i = 0; i < temp.length; i++) {
        for (var j = 0; j < temp[i].length; j++) {
            numave = numave + temp[i][j]
        }
        ave.push(Math.round(numave / temp[i].length));
        numave = 0;
    }

    return ave;
}



//根据空气质量值返回不同的颜色
/**
 * 根据数值返回颜色
 * @param  {Num} num 数值
 * @return {String}     颜色值
 */
function returnColor(num) {
    if (num > 400) {
        return '#000000';
    } else if (num > 300) {
        return '#7D0478';
    } else if (num > 200) {
        return '#FE0002';
    } else if (num > 100) {
        return '#0202FF';
    } else if (num > 0) {
        return '#047F00';
    }
}

/**
 * 日、周、月的radio事件点击时的处理函数
 */
function pageStateChange() {
    // 确定是否选项发生了变化
    // 设置对应数据
    // 渲染之前把原来的图表干掉
    var liList = document.querySelector('.aqi-chart-wrap');
    if (liList.querySelector('ul')) {
        liList.querySelector('ul').remove();
    }
    // 调用图表渲染函数
    var city = pageState.nowSelectCity;
    renderChart(aqiSourceData[city], pageState.nowGraTime);
}

/**
 * 初始化日、周、月的radio事件，当点击时，调用函数graTimeChange
 */
function initGraTimeForm() {
    var fgt = document.getElementById('form-gra-time');
    addEvent(fgt, 'click', function(e) {
        if (pageState.nowGraTime != e.target.value && e.target.value) {
            pageState.nowGraTime = e.target.value;
            pageStateChange()
        }
    })
}

/**
 * 初始化城市Select下拉选择框中的选项
 */
function initCitySelector() {
    var select = document.getElementById('city-select');
    for (var key in aqiSourceData) {
        var option = document.createElement('option')
        option.textContent = key;
        select.appendChild(option)
    }
    addEvent(select, 'click', function(e) {
        var city = e.target.querySelector('option:checked').textContent;
        if (pageState.nowSelectCity != city) {
            pageState.nowSelectCity = city
            pageStateChange()
        }
    })

    // 读取aqiSourceData中的城市，然后设置id为city-select的下拉列表中的选项
    // 给select设置事件，当选项发生变化时调用函数citySelectChange
    // renderChart(aqiSourceData['北京'], '月');
}

/**
 * 初始化图表需要的数据格式
 */
function initAqiChartData() {
    // 将原始的源数据处理成图表需要的数据格式
    // 处理好的数据存到 chartData 中
}

/**
 * 初始化函数
 */
function init() {
    initGraTimeForm()
    initCitySelector();
    initAqiChartData();
}

init();
