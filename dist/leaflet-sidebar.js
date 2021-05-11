const HOST = "http://10.0.37.174";
const PORT = 8088;
var date = new Date();


/*台风路径绘制函数*/
function Typhoon(map) {
    this.typhoon = {}

    // 全部扇形对象
    this.tyPrimitives = [];

    this.myLayerGroupLine = new L.LayerGroup(); //主点线清除方法
    this.myLayerGroupPoint = new L.LayerGroup(); //主点清除方法
    this.myLayerGroupMode = new L.LayerGroup(); //模型标签
    this.myForecastLine = new L.LayerGroup(); //预测线段
    this.myForecastPoint = new L.LayerGroup(); //预测线点

    this.timer = null;
    var self = this;

    this._pathDataHandler = function (typhoonPathData, callback) {
        // 数据转换
        var polylinePoints = []; //主点坐标
        var radius = {}; // 主点风圈、其它信息
        var pointlayerImages = []; // 主点图片信息

        // 台风信息
        var typhoonName = typhoonPathData[0]['TCNAME_CN'];
        var typhoonNumber = typhoonPathData[0]['TCID'];
        //预测信息
        var forecastList = [];
        var forecastInfo = {};
        var forecastNumber = 1;

        for (var i = 0; i < typhoonPathData.length; i++) {
            var item = typhoonPathData[i];
            if (item.IS_PRED == 0) {
                polylinePoints.push([Number(item['LAT']), Number(item['LON'])]);
                var typhoonStrong = item['TC_I'];
                var typhoonImage = this.typhoonImageRank(typhoonStrong);
                radius[i] = {
                    radius7: item.TC_30KTS.split(','),
                    radius10: item.TC_50KTS.split(','),
                    radius12: item.TC_64KTS.split(','),
                    lat: item.LAT,
                    lng: item.LON,
                    movedirection: item.TC_D,
                    movespeed: item.TC_S,
                    strong: item.TC_I,
                    pressure: item.PRES,
                    speed: item.WND,
                    time: formatTime(item.TC_TIME),
                    name: typhoonName,
                    number: typhoonNumber
                }
                pointlayerImages[i] = {
                    icon: L.icon({
                        iconUrl: typhoonImage,
                        iconSize: [8, 8]
                    })
                }
            } else {
                forecastList.push([Number(item.LAT), Number(item.LON)]);
                forecastInfo[forecastNumber] = {
                    lat: Number(item.LAT),
                    lng: Number(item.LON),
                    time: formatTime(item.TC_TIME),
                    strong: item.TC_I,
                    speed: item.WND,
                    name: typhoonName,
                    pressure: item.PRES,
                    number: typhoonNumber
                }
                forecastNumber++;
            }
        }

        forecastList = [polylinePoints[polylinePoints.length - 1]].concat(forecastList);
        forecastInfo[0] = radius[polylinePoints.length - 1]

        var info = {
            polylinePoints: polylinePoints,
            radius: radius,
            pointlayerImages: pointlayerImages,
            typhoonName: typhoonName,
            typhoonNumber: typhoonNumber,
            forecastList: forecastList,
            forecastInfo: forecastInfo
        }
        callback(info);
    }

    this.typhoonImageRank = function (typhoonStrong) {
        var typhoon_point_image = '';
        switch (typhoonStrong) {
            case "TD":
                typhoon_point_image = '../images/t-01.png';
                break;
            case "TS":
                typhoon_point_image = '../images/t-02.png';
                break;
            case "STS":
                typhoon_point_image = '../images/t-03.png';
                break;
            case "TY":
                typhoon_point_image = '../images/t-04.png';
                break;
            case "STY":
                typhoon_point_image = '../images/t-05.png';
                break;
            case "SuperTY":
                typhoon_point_image = '../images/t-06.png';
                break;
            default:
                typhoon_point_image = '../images/t-01.png';
                break;
        }
        return typhoon_point_image;
    }

    this.getTyphoonInfoHtml = function (info, Pointtype) {
        var html = "";
        if (Pointtype == 'main') {
            var radius7 = info.radius7;
            var radius10 = info.radius10;
            var radius12 = info.radius12;

            html = ` <div class="typhone_info">
                <div class="flex info_title">
                ${info.number}-${info.name}
                </div>
                <div class="info_list">
                    <span><strong>过去时间</strong>: ${info.time}<br></span>
                    <span><strong>中心位置</strong>: ${info.lng}°E，${info.lat}°N<br></span>
                    <span><strong>最大风力</strong>: ${info.strong}<br></span>
                    <span><strong>最大风速</strong>: ${info.speed ? info.speed : "0"} 米/秒<br></span>
                    <span><strong>中心气压</strong>: ${info.pressure ? info.pressure : "0"} 百帕<br></span>
                    <span><strong>移动速度</strong>: ${info.speed ? info.speed : "0"}公里/小时<br></span>
                    <span><strong>移动方向</strong>: ${info.movedirection}</span>
                    <div class="typhoon_circle">
                        <div class="circle_item">
                                <div class="circle_detail">
                                    <span><strong>7 级风圈: </strong></span>
                                    <span>${radius7[0] ? radius7[0] : '--'},</span>
                                    <span>${radius7[1] ? radius7[1] : '--'},</span>
                                    <span>${radius7[2] ? radius7[2] : '--'},</span>
                                    <span>${radius7[3] ? radius7[3] : '--'}</span>
                                </div>
                        </div>
                        <div class="circle_item">
                                    <div class="circle_detail">
                                        <span><strong>10级风圈: </strong></span>
                                        <span>${radius10[0] ? radius10[0] : '--'},</span>
                                        <span>${radius10[1] ? radius10[1] : '--'},</span>
                                        <span>${radius10[2] ? radius10[2] : '--'},</span>
                                        <span>${radius10[3] ? radius10[3] : '--'}</span>
                                    </div>
                                </div>
                        </div>
                        <div class="circle_item">
                                <div class="circle_detail">
                                <span><strong>12级风圈: </strong></span>
                                    <span>${radius12[0] ? radius12[0] : '--'},</span>
                                    <span>${radius12[1] ? radius12[1] : '--'},</span>
                                    <span>${radius12[2] ? radius12[2] : '--'},</span>
                                    <span>${radius12[3] ? radius12[3] : '--'}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>`;
        } else {
            html = `<div class="typhone_info">
                        <div class="flex info_title">
                            ${info.number}-${info.name}
                        </div>
                        <div class="info_list">
                            <div class="info_organ">
                            <span><strong>预报机构: 中国气象局<br></strong></span>
                            <span><strong>预计时间</strong>: ${info.time}</span>
                            </div>
                        <div>
                            <span><strong>中心位置</strong>: ${info.lng}°E，${info.lat}°N</span>
                        </div>
                        <div>
                            <span><strong>最大风力</strong>: ${info.strong}</span>
                        </div>
                        <div>
                            <span><strong>最大风速</strong>: ${info.speed != "" ? info.speed : "0"} 米/秒</span>
                        </div>
                        <div>
                            <span><strong>中心气压</strong>: ${info.pressure != "" ? info.pressure : "0"} 百帕</span>
                        </div>
                    </div>`;
        }
        return html;
    }

    // 清除单个风圈
    this.removeCircle = function () {
        for (var j = 0; j < this.tyPrimitives.length; j++) {
            map.removeLayer(this.tyPrimitives[j]);
        }
    }

    // 绘制预测点和线
    this.drawForecastPointLine = function (forecastL, forecastI) {
        var forecastline = L.polyline(forecastL, {
            weight: 2,
            dashArray: '5, 5',
            color: 'white'
            // className: 'forecast',
        });
        this.myForecastLine.addLayer(forecastline);
        map.addLayer(this.myForecastLine);
        forecastL.forEach((item, index) => {
            if (index == 0) { return }
            var strong = forecastI[index].strong;
            var image = this.typhoonImageRank(strong);
            var forecastPointImage = L.icon({
                iconUrl: image,
                iconSize: [8, 8]
            });
            var forecastPoint = L.marker(item, { icon: forecastPointImage }).bindPopup(
                this.getTyphoonInfoHtml(forecastI[index], 'pred'), {
                offset: [0, -30],
                className: 'forecastInfo'
            }
            ).closePopup();
            this.myForecastPoint.addLayer(forecastPoint);
            map.addLayer(this.myForecastPoint)
        })

    }

    this.animateDrawLine = async function (data) {

        var typhoonAllInfo = data;

        this.allpoints = await typhoonAllInfo.polylinePoints;
        this.polyline = L.polyline(this.allpoints, { color: "#00BFFF" }).addTo(map);
        map.fitBounds(this.polyline.getBounds());
        map.removeLayer(this.polyline);
        this.pointlayerImages = typhoonAllInfo.pointlayerImages;
        this.radius = typhoonAllInfo.radius;
        this.typhoonName = typhoonAllInfo.typhoonName;
        this.typhoonNumber = typhoonAllInfo.typhoonNumber;
        this.forecastList = typhoonAllInfo.forecastList;
        this.forecastInfo = typhoonAllInfo.forecastInfo;
        
        this.myLayerGroupLine.clearLayers();
        this.myLayerGroupPoint.clearLayers();
        this.myLayerGroupMode.clearLayers();

        this.myForecastLine.clearLayers();
        this.myForecastPoint.clearLayers();

        var markermode;
        var lineLayer;
        var pointLayer;
        var labelLayer;
        var length = this.allpoints.length;

        var drawPoints = [];
        var count = 0;
        var typhoonIcon = L.icon({
            iconUrl: '../images/typhoon.png',
            iconSize: [20, 20]
        })

        //添加台风编号
        var typhoonIconfirst = L.icon({
            iconUrl: '../images/typhoon.png',
            iconSize: [1, 1]
        });
        labelLayer = L.marker([this.radius[0].lat, this.radius[0].lng], {
            icon: typhoonIconfirst,
            title: "我是谁",
            riseOnHover: true,
            keyboard: true
        }).bindTooltip(this.typhoonNumber + "-" + this.typhoonName, {
            direction: 'right',
            offset: [10, 0],
            permanent: true,
            opacity: "1",
            className: "labelName"
        }).openTooltip();
        this.myLayerGroupPoint.addLayer(labelLayer);
        map.addLayer(this.myLayerGroupPoint);
        //定时器100ms，动态的塞入坐标数据
        var self = this;
        this.timer = setInterval(
            async function () {
                //循环台风路径中的每个点，设置定时器依次描绘
                if (count < length) {
                    drawPoints.push(self.allpoints[count]);
                    count++;
                    //清除之前绘制的折线图层
                    if (lineLayer && count !== length) {
                        map.removeLayer(lineLayer);
                        lineLayer = null;
                    }
                    //清除之前的marker图层
                    if (markermode && count !== length) {
                        map.removeLayer(markermode);
                        markermode = null;
                    }
                    if (self.tyPrimitives.length != 0) {
                        self.removeCircle()
                    }
                    //最新数据点drawPoints绘制折线
                    lineLayer = L.polyline(drawPoints, { color: "#00BFFF" })
                    self.myLayerGroupLine.addLayer(lineLayer);
                    map.addLayer(self.myLayerGroupLine);
                    //根据最新的数据组最后一个绘制marker

                    if (count === length) {
                        map.removeLayer(markermode);

                        self.drawForecastPointLine(self.forecastList, self.forecastInfo);
                        self.drawSingleCircle(drawPoints[count - 1], count - 1, self.radius)
                        pointLayer = L.marker(drawPoints[count - 1], { icon: self.pointlayerImages[count - 1].icon });
                        self.myLayerGroupPoint.addLayer(pointLayer);
                        map.addLayer(self.myLayerGroupPoint);

                        markermode = L.marker(drawPoints[length - 1], {
                            icon: L.icon({
                                iconUrl: "../images/typhoon.png",
                                iconSize: [30, 30]
                            })
                        }).bindPopup(
                            self.getTyphoonInfoHtml(self.radius[count - 1], "main"), {
                            offset: [0, -10],
                            opacity: 0.9,
                            className: "typhoonInfo"
                        }
                        ).openPopup();
                        self.myLayerGroupMode.addLayer(markermode);
                        map.addLayer(self.myLayerGroupMode);

                        //如果是路径最后一个点，自动弹出信息框
                        console.log(self.radius[count - 1]);
                        console.log(drawPoints[count - 1]);
                        self.popup = await self.drawPopup(drawPoints[count - 1], self.radius[count - 1]);
                    } else {
                        self.drawSingleCircle(drawPoints[count - 1], count, self.radius)
                        pointLayer = L.marker(drawPoints[count - 1], {
                            icon: self.pointlayerImages[count - 1].icon,
                            title: "我是谁",
                            riseOnHover: true,
                            keyboard: true
                        }).bindPopup(
                            self.getTyphoonInfoHtml(self.radius[count - 1], "main"), {
                            offset: [0, -10],
                            opacity: 0.9,
                            className: "typhoonInfo"
                        }
                        ).closePopup();
                        self.myLayerGroupPoint.addLayer(pointLayer);
                        map.addLayer(self.myLayerGroupPoint);

                        //取已绘制点数组中最后一个点，放置台风标志
                        markermode = L.marker(drawPoints[count - 1], {
                            icon: typhoonIcon
                        });
                        self.myLayerGroupMode.addLayer(markermode);
                        map.addLayer(self.myLayerGroupMode);
                    }
                } else {
                    //取完数据后清除定时器
                    clearInterval(self.timer);
                }
            }, 20);
    }

    //绘制单个风圈（7，10，12级）
    this.drawSingleCircle = function(latlng, count, r) {

        var radius7 = r[count].radius7;
        var radius10 = r[count].radius10;
        var radius12 = r[count].radius12;
        //绘制七级风圈
        if (radius7.length > 1) {
            var radiusNorthEast7 = radius7[0] / 100
            var radiusSouthEast7 = radius7[1] / 100
            var radiusNorthWast7 = radius7[2] / 100
            var radiusSouthWest7 = radius7[3] / 100
            var primitiveFill = new this.setvisible(latlng, radiusNorthEast7, "NorthEast", "green")
            this.tyPrimitives.push(primitiveFill);
            primitiveFill = new this.setvisible(latlng, radiusSouthEast7, "SouthEast", "green")
            this.tyPrimitives.push(primitiveFill);
            primitiveFill = new this.setvisible(latlng, radiusNorthWast7, "SouthWest", "green")
            this.tyPrimitives.push(primitiveFill);
            primitiveFill = new this.setvisible(latlng, radiusSouthWest7, "NorthWest", "green")
            this.tyPrimitives.push(primitiveFill);
        }
        //绘制十级风圈
        if (radius10.length > 1) {
            var radiusNorthEast10 = radius10[0] / 100
            var radiusSouthEast10 = radius10[1] / 100
            var radiusNorthWast10 = radius10[2] / 100
            var radiusSouthWest10 = radius10[3] / 100
            primitiveFill = new this.setvisible(latlng, radiusNorthEast10, "NorthEast", "pink")
            this.tyPrimitives.push(primitiveFill);
            primitiveFill = new this.setvisible(latlng, radiusSouthEast10, "SouthEast", "pink")
            this.tyPrimitives.push(primitiveFill);
            primitiveFill = new this.setvisible(latlng, radiusNorthWast10, "SouthWest", "pink")
            this.tyPrimitives.push(primitiveFill);
            primitiveFill = new this.setvisible(latlng, radiusSouthWest10, "NorthWest", "pink")
            this.tyPrimitives.push(primitiveFill);
        }
        if (radius12.length > 1) {
            //绘制十二级风圈
            var radiusNorthEast12 = radius12[0] / 100
            var radiusSouthEast12 = radius12[1] / 100
            var radiusNorthWast12 = radius12[2] / 100
            var radiusSouthWest12 = radius12[3] / 100
            primitiveFill = new this.setvisible(latlng, radiusNorthEast12, "NorthEast", "red")
            this.tyPrimitives.push(primitiveFill);
            primitiveFill = new this.setvisible(latlng, radiusSouthEast12, "SouthEast", "red")
            this.tyPrimitives.push(primitiveFill);
            primitiveFill = new this.setvisible(latlng, radiusNorthWast12, "SouthWest", "red")
            this.tyPrimitives.push(primitiveFill);
            primitiveFill = new this.setvisible(latlng, radiusSouthWest12, "NorthWest", "red")
            this.tyPrimitives.push(primitiveFill);
        }
    }


    //绘制台风风圈方法
    this.setvisible = function (latlng, semiMinorAxis, anglex, color) {
        var anglexdirection = {
            NorthEast: [0, 90],
            SouthEast: [90, 180],
            SouthWest: [180, 270],
            NorthWest: [270, 360]
        };
        var points3 = getPoints(latlng, semiMinorAxis, anglexdirection[anglex][0], anglexdirection[anglex][1], 1000);
        var primitiveFill = new L.polygon(points3, {
            color: color,
            fillColor: color,
            fillOpacity: 0.4,
            opacity: 0.4,
            weight: 1,
            smoothFactor: 0,
            stroke: false,
        }).addTo(map);
        return primitiveFill;

        function getPoints(center, radius, startAngle, endAngle, pointNum) {
            var sin;
            var cos;
            var x;
            var y;
            var angle;
            var points = new Array();
            points.push(center);
            for (var i = 0; i <= pointNum; i++) {
                angle = startAngle + (endAngle - startAngle) * i / pointNum;
                sin = Math.sin(angle * Math.PI / 180);
                cos = Math.cos(angle * Math.PI / 180);
                y = center[0] + radius * cos;
                x = center[1] + radius * sin;
                points[i] = [y, x];
            }
            var point = points;
            point.push(center);
            return point;
        }
    }

    // 外部绘制台风弹窗接口
    this.drawPopup = async function (latlng, data) {

        var contents = self.getTyphoonInfoHtml(data, "main")
        var pop = L.popup({offset:[0, -10]})
            .setLatLng(latlng)
            .setContent(contents)
            .openOn(map);
        return new Promise(function(resolve){
            resolve(pop);
        })
    }

    // 外部绘制风圈接口
    this.drawSingleCircleOut = function (latlng, data) {
        // console.log(r)
        var radius7 = data.radius7;
        var radius10 = data.radius10;
        var radius12 = data.radius12;
        var tyPrimitives = [];
        //绘制七级风圈
        if (radius7.length > 1) {
            var radiusNorthEast7 = radius7[0] / 100
            var radiusSouthEast7 = radius7[1] / 100
            var radiusNorthWast7 = radius7[2] / 100
            var radiusSouthWest7 = radius7[3] / 100
            var primitiveFill = new this.setvisible(latlng, radiusNorthEast7, "NorthEast", "green")
            tyPrimitives.push(primitiveFill);
            primitiveFill = new this.setvisible(latlng, radiusSouthEast7, "SouthEast", "green")
            tyPrimitives.push(primitiveFill);
            primitiveFill = new this.setvisible(latlng, radiusNorthWast7, "SouthWest", "green")
            tyPrimitives.push(primitiveFill);
            primitiveFill = new this.setvisible(latlng, radiusSouthWest7, "NorthWest", "green")
            tyPrimitives.push(primitiveFill);
        }
        //绘制十级风圈
        if (radius10.length > 1) {
            var radiusNorthEast10 = radius10[0] / 100
            var radiusSouthEast10 = radius10[1] / 100
            var radiusNorthWast10 = radius10[2] / 100
            var radiusSouthWest10 = radius10[3] / 100
            primitiveFill = new this.setvisible(latlng, radiusNorthEast10, "NorthEast", "pink")
            tyPrimitives.push(primitiveFill);
            primitiveFill = new this.setvisible(latlng, radiusSouthEast10, "SouthEast", "pink")
            tyPrimitives.push(primitiveFill);
            primitiveFill = new this.setvisible(latlng, radiusNorthWast10, "SouthWest", "pink")
            tyPrimitives.push(primitiveFill);
            primitiveFill = new this.setvisible(latlng, radiusSouthWest10, "NorthWest", "pink")
            tyPrimitives.push(primitiveFill);
        }
        if (radius12.length > 1) {
            //绘制十二级风圈
            var radiusNorthEast12 = radius12[0] / 100
            var radiusSouthEast12 = radius12[1] / 100
            var radiusNorthWast12 = radius12[2] / 100
            var radiusSouthWest12 = radius12[3] / 100
            primitiveFill = new this.setvisible(latlng, radiusNorthEast12, "NorthEast", "red")
            tyPrimitives.push(primitiveFill);
            primitiveFill = new this.setvisible(latlng, radiusSouthEast12, "SouthEast", "red")
            tyPrimitives.push(primitiveFill);
            primitiveFill = new this.setvisible(latlng, radiusNorthWast12, "SouthWest", "red")
            tyPrimitives.push(primitiveFill);
            primitiveFill = new this.setvisible(latlng, radiusSouthWest12, "NorthWest", "red")
            tyPrimitives.push(primitiveFill);
        }
        return tyPrimitives
    };

    // 外部删除风圈接口
    this.removeCircleOut = function (tyPrimitives) {
        for (var j = 0; j < tyPrimitives.length; j++) {
            map.removeLayer(tyPrimitives[j]);
        }
    };

    // 删除所有已绘制的图形
    this.typhoon.deleteTyphoon = function () {
        clearInterval(self.timer);
        self.removeCircle();
        if (self.popup){self.popup.remove();}
        self.myLayerGroupLine.clearLayers();
        self.myLayerGroupPoint.clearLayers();
        self.myLayerGroupMode.clearLayers();
        self.myForecastLine.clearLayers();
        self.myForecastPoint.clearLayers();
    }

    // 是否显示预测路径
    this.typhoon.forecastIsShow = function (isShow) {
        if (isShow === true) {
            self.drawForecastPointLine(self.forecastList, self.forecastInfo);
        } else {
            self.myForecastLine.clearLayers();
            self.myForecastPoint.clearLayers();
        }
    }

    // 是否重播
    this.typhoon.replay = function (typhoonPathInfo) {
        this.deleteTyphoon();
        this.show(typhoonPathInfo);
    }

    this.typhoon.show = async function (typhoonPathInfo) {
        self._pathDataHandler(typhoonPathInfo, async (data) => {
        self.animateDrawLine(data)
        });
    }

}

function first(o) {
    for (var p in o) {
        if (o.hasOwnProperty(p)) {
            return o[p];
        }
    }
}

function length(o) {
    var len = 0;
    for (var p in o) {
        if (o.hasOwnProperty(p)) {
            len++;
        }
    }
    return len;
}

function each(o, cb) {
    for (var p in o) {
        if (o.hasOwnProperty(p)) {
            cb(o[p], p, o);
        }
    }
}

function prepend(parent, el) {
    if (parent.children.length) {
        parent.insertBefore(el, parent.children[0]);
    } else {
        parent.appendChild(el);
    }
}

function formatTime(t) {
    var year = t.slice(0, 4) || '0000';
    var month = t.slice(4, 6) || '00';
    var day = t.slice(6, 8) || '00';
    var hour = t.slice(8, 10) || '00';

    return year + '年' + month + '月' + day + '天' + hour + '时';
}

L.Control.Sidebar = L.Control.extend(/** @lends L.Control.Sidebar.prototype */ {
    includes: (L.Evented.prototype || L.Mixin.Events),

    /*
    typhoonYears
    */
    _createTyphoonYearElement: function (year) {
        var curRow = L.DomUtil.create('div', 'selectTyphoonRow');
        var space = L.DomUtil.create('div', 'selectLeftDiv allImgs checkboxNoChecked');
        space.setAttribute('id', year);
        space.innerHTML = '&nbsp;';
        var value = L.DomUtil.create('div', 'selectRightDiv');
        value.innerHTML = String(year);
        curRow.appendChild(space);
        curRow.appendChild(value);

        return curRow;
    },

    _createTyphoonYearElements: function () {
        var content = L.DomUtil.create('div', 'list');
        for (let i = 0; i < this._years.length; i++) {
            const element = this._years[i];
            content.appendChild(this._createTyphoonYearElement(element));
        }
        var yearContent = L.DomUtil.create('div', 'typhoonListContent');
        yearContent.setAttribute('id', 'yearListContent');
        yearContent.appendChild(content);

        var yearHeader = L.DomUtil.create('div', 'typhoonListTitle');
        var title = L.DomUtil.create('div', 'title');
        title.type = 'text-align:center;';
        title.innerHTML = '所选年份';
        yearHeader.appendChild(title);
        this._containerYear.appendChild(yearHeader);
        this._containerYear.appendChild(yearContent);
    },

    _onYearClick: function (e) {
        /*
        1. 将前一个选中的年份设置为未选中
        2. 将当前选中的年份设置未选中
        3. 打印根据_selectTyphoonList查询到的数据
        */
        e.preventDefault();
        var year = e.currentTarget.getAttribute('id');
        this._selectedYear = year;
        if (this._previousYear && this._previousYear != this._selectedyear) {
            var previousSelectedRow = document.getElementById(this._previousYear);
            L.DomUtil.removeClass(previousSelectedRow, 'checkboxChecked');
            L.DomUtil.addClass(previousSelectedRow, 'checkboxNoChecked')
        };
        L.DomUtil.removeClass(e.currentTarget, 'checkboxNoChecked');
        L.DomUtil.addClass(e.currentTarget, 'checkboxChecked')
        this._previousYear = this._selectedYear;
        this._selectedTyphoonList = this._typhoonList[year];
        this._previousTyphoon = undefined;
        this._renderTyphoonList();
    },
    _attachYearEvents: function () {
        this._years.forEach(function (y) {
            var e = this._getYearCellById(y);
            if (e) {
                e.addEventListener('click', this._onYearClick.bind(this));
            }
        }.bind(this));
    },
    _getYearCellById: function (id) {
        var els = this._containerYear.getElementsByClassName('selectLeftDiv')
        for (var i = 0; i < els.length; i++) {
            if (els[i].getAttribute('id') == id) {
                return els[i];
            }
        }
    },

    _selectTyphoonList: function (year, callback) {
        var url = HOST + ":" + String(PORT) + '/TyphoonList'
        var year = year || date.getFullYear();
        var params = {
            year: year,
        }
        $.ajax({
            url: url,
            method: 'POST',
            dataType: "json",
            data: params,
            success: function (res) {
                if (res.code != 200) {
                    console.log(res.message);
                }
                callback(res.data);
            }
        })
    },
    _renderYear: function () {
        this._containerYear.innerHTML = '';
        this._createTyphoonYearElements();
        this._attachYearEvents();
    },


    /*
    typhoonList
    */
    _renderTyphoonList: function () {
        this._containerTyphoon.innerHTML = '';
        this._createTyphoonListElements();
        this._attachTyphoonListEvents();
    },

    _createTyphoonListElement: function (line) {
        // line: tcid, tcname_cn, tcname_en, tcstatus
        var curLineElement = L.DomUtil.create('div', 'tableTr');
        curLineElement.setAttribute('id', line['TCID']);
        var lineKeysList = ['TCID', 'TCNAME_CN', 'TCNAME_EN', 'TCSTATUS'];
        for (var i = 0; i < lineKeysList.length; i++) {
            var key = lineKeysList[i];
            var keyContent = L.DomUtil.create('span');
            keyContent.innerHTML = line[key];
            curLineElement.appendChild(keyContent);
        }
        return curLineElement;

    },

    _createTyphoonListElements: function () {
        // 表格标题
        var title = L.DomUtil.create('div', 'tableTitle');
        var titleContentList = ['台风编码', '台风名称', '英文名称', '运行状态'];
        for (let i = 0; i < titleContentList.length; i++) {
            const c = titleContentList[i];
            var titleContent = L.DomUtil.create('span')
            titleContent.innerHTML = c;
            title.appendChild(titleContent);
        }
        this._containerTyphoon.appendChild(title);

        // 表格内容
        this._tcidList = [];
        var content = L.DomUtil.create('div', 'tableList');
        content.innerHTML = ''
        for (let i = 0; i < this._selectedTyphoonList.length; i++) {
            const line = this._selectedTyphoonList[i];
            this._tcidList.push(line['TCID']);
            var curLineElement = this._createTyphoonListElement(line);
            content.appendChild(curLineElement);
        }
        this._containerTyphoon.appendChild(content);
    },

    _attachTyphoonListEvents: function () {
        this._tcidList.forEach(function (y) {
            var e = this._getTyphoonCellById(y);
            if (e) {
                e.addEventListener('click', this._onTyphoonListClick.bind(this));
            }
        }.bind(this));
    },

    _onTyphoonListClick: function (e) {

        e.preventDefault();
        var tcid = e.currentTarget.getAttribute('id');
        this._selectTyphoon = tcid;
        if (this._previousTyphoon === undefined) {
            L.DomUtil.addClass(e.currentTarget, 'typhoonSelected');
        } else if (this._previousTyphoon === this._selectTyphoon) {
            L.DomUtil.removeClass(e.currentTarget, 'typhoonSelected');
            this._selectTyphoon = undefined;
        } else {
            var previousTyphoonEl = this._getTyphoonCellById(this._previousTyphoon);
            L.DomUtil.removeClass(previousTyphoonEl, 'typhoonSelected');
            L.DomUtil.addClass(e.currentTarget, 'typhoonSelected');
        }
        this._previousTyphoon = tcid;
        this._currentTyphoonInfo = [];
        this._renderTyphoonInfo();
    },

    _getTyphoonCellById: function (tcid) {
        var els = this._containerTyphoon.getElementsByClassName('tableTr')
        for (var i = 0; i < els.length; i++) {
            if (els[i].getAttribute('id') == tcid) {
                return els[i];
            }
        }
    },

    _selectTyphoonInfo: function (tcid, callback) {
        var url = HOST + ':' + PORT + '/TyphoonInfo';
        var tcid = tcid || 2102;
        var params = {
            tcid: tcid,
        };
        $.ajax({
            url: url,
            method: 'POST',
            dataType: 'json',
            data: params,
            success: function (res) {
                if (res.code != 200) {
                    console.log(res.message);
                }
                callback(res);
            }
        })

    },

    /*
    typhoonInfo
    */
    _cleanTyphoonInfo: function () {
        var self = this;
        return new Promise(function (resolve, reject) {
            self._selectTyphoonInfo(self._selectTyphoon, async function (res) {
                var typhoonInfoData = await res.data;
                var currentTyphoonInfo = [];
                for (let i = 0; i < typhoonInfoData.length; i++) {
                    const d = typhoonInfoData[i];
                    d['IS_PRED'] = 0;
                    currentTyphoonInfo.push(d);
                    if ((i == typhoonInfoData.length - 1) && (d['PRED'].length > 0)) {
                        for (let j = 0; j < d['PRED'].length; j++) {
                            var item = {
                                'TC_TIME': d['PRED'][j][0],
                                'LON': d['PRED'][j][1],
                                'LAT': d['PRED'][j][2],
                                'WND': d['PRED'][j][3],
                                'PRES': d['PRED'][j][4],
                                'TC_I': d['PRED'][j][5],
                                'IS_PRED': 1
                            }
                            currentTyphoonInfo.push(item);
                        }
                    }
                }
                resolve(currentTyphoonInfo);
            })
        })
    },

    _renderTyphoonInfo: function () {
        /*
        底图显示，显示台风路径
        */
        this._containerTyphoonInfo.innerHTML = '';
        this._createTyphoonInfoElements();
        // this._attachTyphoonInfoEvents();
    },

    _createTyphoonInfoElement: function (line) {
        var currentElement = L.DomUtil.create('div', 'tableTr');
        currentElement.setAttribute('id', line[0]);
        for (var i = 0; i < line.length; i++) {
            var key = line[i];
            var keyContent = undefined;
            if (i == 0) {
                keyContent = L.DomUtil.create('time');
                key = formatTime(key);
            } else if (i == 1) {
                keyContent = L.DomUtil.create('latlng');
            } else {
                keyContent = L.DomUtil.create('span');
            }
            keyContent.innerHTML = key;
            currentElement.appendChild(keyContent);
        }
        return currentElement;
    },

    _createTyphoonInfoElements: function () {
        this._containerTyphoonInfo.innerHTML = '';
        var title = L.DomUtil.create('div', 'tablePointTitle');
        var titleContentList = ['过去时间', '经纬度', '台风强度', '台风偏向', '风速(m/s)', '气压(hPa)', '移速(km/h)']
        for (let i = 0; i < titleContentList.length; i++) {
            const c = titleContentList[i];
            var titleContent = ''
            if (i == 0) {
                titleContent = 'time'
            } else if (i == 1) {
                titleContent = 'latlng'
            } else {
                titleContent = 'span'
            }
            var titleContentE = L.DomUtil.create(titleContent);
            titleContentE.innerHTML = c;
            title.appendChild(titleContentE);
        }


        this._currentTyphoonInfo = [];
        this._containerTyphoonInfo.appendChild(title);
        let content = L.DomUtil.create('div', 'tableList');
        content.innerHTML = '';
        var self = this;
        if (this._selectTyphoon === undefined) { return; }
        this._cleanTyphoonInfo(this._selectTyphoon).then(
            async (data) => {
                data.forEach((d) => {
                    self._currentTyphoonInfo.push(d);
                    var time = d['TC_TIME'];
                    var latlng = d['LON'] + 'E/' + d['LAT'] + 'N';
                    var tci = d['TC_I'];
                    var tcd = d['TC_D'];
                    var tcs = d['WND'];
                    var pres = d['PRES'];
                    var tcss = d['TC_S'] || 0;
                    var line = [time, latlng, tci, tcd, tcs, pres, tcss];

                    var currentElement = self._createTyphoonInfoElement(line);
                    content.appendChild(currentElement);
                })
                self._containerTyphoonInfo.appendChild(content);

                // 关闭前一个台风的风场、风圈、弹窗
                if (self._previousWindMap) {
                    self._previousWindMap.remove();
                    self._previousWindMap = undefined;
                }

                if (self.tyPrimitives != undefined) {
                    self.typhoon.removeCircleOut(self.tyPrimitives);
                    self.tyPrimitives = undefined;
                    self._previousTyphoonData = undefined;
                }




                // ATTACH ELMENTS
                this._currentTyphoonInfo.forEach(function (y) {
                    var e = this._getTyphoonInfoCellById(y['TC_TIME']);
                    if (e) {
                        e.addEventListener('click', this._onTyphoonInfoClick.bind(this));
                    }
                    }.bind(this));
                self.typhoon.typhoon.replay(self._currentTyphoonInfo);
            })
    },

    _onTyphoonInfoClick: function (e) {

        this._selectTyphoonTime = e.currentTarget.getAttribute('id');

        ////////////////////////////////////////////////////////////////
        // 列表显示切换
        if (this._previousTyphoonTime === undefined) {
            L.DomUtil.addClass(e.currentTarget, 'timeSelect');
            this._previousTyphoonTime = this._selectTyphoonTime;
        } else if (this._previousTyphoonTime == this._selectTyphoonTime) {
            L.DomUtil.removeClass(e.currentTarget, 'timeSelect');
            this._previousTyphoonTime = undefined;
        } else {
            var previouseElement = this._getTyphoonInfoCellById(this._previousTyphoonTime);
            if (previouseElement) {
                L.DomUtil.removeClass(previouseElement, 'timeSelect');
            }
            L.DomUtil.addClass(e.currentTarget, 'timeSelect');
            this._previousTyphoonTime = this._selectTyphoonTime;
        }

        ////////////////////////////////////////////////////////////////
        // 风场切换
        self = this;
        this._selectWindInfo(this._selectTyphoonTime, (res) => {
            if (res.data === undefined) {
                if (self._previousWindMap) {
                    self._previousWindMap.remove();
                    self._previousWindMap = undefined;
                }

                console.log('当前时间(' + formatTime(self._selectTyphoonTime) + ')无风场')
                return;
            }
            var data = res.data;
            var refTime = data['WND_TIME']
            var jsonData = [];
            jsonData.push({
                "header": {
                    "parameterCategory": 2,
                    "parameterNumber": 2,
                    "lo1": data['LON1'],
                    "la1": data['LAT1'],
                    "dx": data['DX'],
                    "dy": data['DY'],
                    "nx": data['NX'],
                    "ny": data['NY'],
                    "refTime": refTime.slice(0, 4) + '-' + refTime.slice(4, 6) + '-' + refTime.slice(6, 8) + 'T' + refTime.slice(8, 10) + ':00:00.000Z',
                    "forecastTime": 0,
                    "scanMode": 0
                },
                "data": data['DATA']['u']
            });
            jsonData.push({
                "header": {
                    "parameterCategory": 2,
                    "parameterNumber": 3,
                    "lo1": data['LON1'],
                    "la1": data['LAT1'],
                    "dx": data['DX'],
                    "dy": data['DY'],
                    "nx": data['NX'],
                    "ny": data['NY'],
                    "refTime": refTime.slice(0, 4) + '-' + refTime.slice(4, 6) + '-' + refTime.slice(6, 8) + 'T' + refTime.slice(8, 10) + ':00:00.000Z',
                    "forecastTime": 0,
                    "scanMode": 0
                },
                "data": data['DATA']['v'].map((item) => { return -item; })
            })
            self._selectWindMap = L.velocityLayer({
                displayValues: true,
                displayOptions: {
                    velocityType: formatTime(this._selectTyphoonTime),
                    position: 'bottomleft',
                    emptyString: 'No wind data'
                },
                data: jsonData,
                maxVelocity: 10

            })
            if (self._previousWindMap == undefined) {
                self._selectWindMap.addTo(this._map);
                self._previousWindMap = self._selectWindMap;
            } else if (self._previousWindMap.options.displayOptions.velocityType ==
                this._selectWindMap.options.displayOptions.velocityType) {
                self._previousWindMap.remove();
                self._previousWindMap = undefined;
            } else {
                self._previousWindMap.remove();
                self._previousWindMap = self._selectWindMap;
                self._selectWindMap.addTo(this._map);
            }
        }); 

        /////////////////////////////////////////////////////////////
        // 风圈和popup切换
        var tmpFun = async function(){
            self._selectTyphoonData = await self._getTyphoonInfoDataById(self._selectTyphoonTime);
            self.typhoon._pathDataHandler([self._selectTyphoonData], async (d) => {
                var loc = d.polylinePoints[0];
                var r = d.radius[0];
                self.typhoon.removeCircleOut(self.typhoon.tyPrimitives);
                if (self._previousTyphoonData == undefined) {
                    self.tyPrimitives = self.typhoon.drawSingleCircleOut(loc, r);
                    self.typhoon.drawPopup(loc, r);
                    self._previousTyphoonData = self._selectTyphoonData;
                } else if (self._previousTyphoonData.TC_TIME != self._selectTyphoonData.TC_TIME){
                    self.typhoon.removeCircleOut(self.tyPrimitives);
                    self.tyPrimitives = self.typhoon.drawSingleCircleOut(loc, r);
                    self.typhoon.drawPopup(loc, r);
                    self._previousTyphoonData = self._selectTyphoonData;
                } else {
                    self.typhoon.removeCircleOut(self.tyPrimitives);
                    self._previousTyphoonData = self._selectTyphoonData;
                }
            });
        };
        tmpFun();

    },

    _getTyphoonInfoCellById: function (time) {
        var currentElement = document.getElementById(time);
        return currentElement
    },

    _getTyphoonInfoDataById: async function (time) {
        var len = this._currentTyphoonInfo.length;
        for (var i = 0; i < len; i++) {
            var y = this._currentTyphoonInfo[i];
            if (y.TC_TIME == time) {
                break;
            }
        }
        return new Promise(function(resolve){resolve(y)});
    },

    _selectWindInfo: function (time, callback) {
        var url = HOST + ':' + PORT + '/Windinfo'
        var year = date.getFullYear();
        var month = date.getMonth();
        var day = date.getDate();
        var hour = date.getHours();

        var time = time ||
            year + (month < 9 ? '0' : '') + (month + 1) + (day < 10 ? '0' : '') + day + (hour < 10 ? '0' : '') + hour;
        time = time.length < 12 ? time + '00' : time;
        var params = {
            windtime: time,
        }
        $.ajax({
            url: url,
            method: 'POST',
            dataType: 'json',
            data: params,
            success: function (res) {
                if (res.code != 200) {
                    console.log(res.message);
                }
                callback(res);
            }
        })

    },


    /*
    iconMaps
    */
    _getActiveLayer: function () {
        if (this._activeLayerId) {
            return this._maps[this._activeLayerId];
        } else if (length(this._maps)) {
            return first(this._maps);
        } else {
            return null;
        }
    },

    _getPreviousLayer: function () {
        var activeLayer = this._getActiveLayer();
        if (!activeLayer) {
            return null;
        } else if (this._previousLayerId) {
            return this._maps[this._previousLayerId];
        } else {
            return find(this._maps, function (l) {
                return l.id !== activeLayer.id;
            }.bind(this)) || null;
        }
    },

    _switchMapLayers: function () {
        if (!this._map) {
            return;
        }
        var activeLayer = this._getActiveLayer();
        var previousLayer = this._getPreviousLayer();
        if (previousLayer) {
            this._map.removeLayer(previousLayer.layer);
        } else {
            each(this._maps, function (layerObject) {
                var layer = layerObject.layer;
                this._map.removeLayer(layer);
            }.bind(this));
        }
        if (activeLayer) {
            this._map.addLayer(activeLayer.layer);
        }
    },

    _arrangeLayers: function () {
        var behaviors = function () {
            var layers = [];
            each(this._maps, function (l) {
                if (l.id) { layers.push(l) }
            });
            return layers;
        };
        return behaviors.apply(this, arguments);
    },

    _createLayerElement: function (layerObj) {
        // 为当前layer实例创建html内容
        var el = L.DomUtil.create('div', 'leaflet-iconLayers-layer');
        // 如果当前layer有标题语句，则创建标题语句
        if (layerObj.title) {
            // 标题：增加layerTitleContainer和layerTitle类
            // 图标：增加layerCheckIcon类
            var titleContainerEl = L.DomUtil.create('div', 'leaflet-iconLayers-layerTitleContainer');
            var titleEl = L.DomUtil.create('div', 'leaflet-iconLayers-layerTitle');
            var checkIconEl = L.DomUtil.create('div', 'leaflet-iconLayers-layerCheckIcon');
            titleEl.innerHTML = layerObj.title;
            titleContainerEl.appendChild(titleEl);
            el.appendChild(titleContainerEl);
            el.appendChild(checkIconEl);
        }
        // 如果有图片链接，创建style的值
        if (layerObj.icon) {
            el.setAttribute('style', 'background-image: url(\'' + layerObj.icon + '\')');
        }
        return el;
    },

    _createLayerElements: function () {
        var currentRow, layerCell;
        var layers = this._arrangeLayers();
        var activeLayerId = this._getActiveLayer() && this._getActiveLayer().id;

        for (var i = 0; i < layers.length; i++) {
            if (i % this.options.maxLayersInRow === 0) {
                currentRow = L.DomUtil.create('div', 'leaflet-iconLayers-layersRow');
                if (this.options.position.indexOf('bottom') === -1) {
                    this._containerformap.appendChild(currentRow);
                } else {
                    prepend(this._containerformap, currentRow);
                }
            }
            layerCell = L.DomUtil.create('div', 'leaflet-iconLayers-layerCell');
            layerCell.setAttribute('data-layerid', layers[i].id);
            if (layers[i].id === activeLayerId) {
                L.DomUtil.addClass(layerCell, 'leaflet-iconLayers-layerCell_active');
            }
            if (this._expandDirection === 'left') {
                L.DomUtil.addClass(layerCell, 'leaflet-iconLayers-layerCell_expandLeft');
            } else {
                L.DomUtil.addClass(layerCell, 'leaflet-iconLayers-layerCell_expandRight');
            }
            layerCell.appendChild(this._createLayerElement(layers[i]));

            if (this.options.position.indexOf('right') === -1) {
                currentRow.appendChild(layerCell);
            } else {
                prepend(currentRow, layerCell);
            }
        }
    },

    _onLayerClick: function (e) {
        e.stopPropagation();
        var layerId = e.currentTarget.getAttribute('data-layerid');
        var layer = this._maps[layerId];
        this.setActiveLayer(layer.layer);
        // this.expand();
    },

    _attachLayerEvents: function () {
        each(this._maps, function (l) {
            var e = this._getLayerCellByLayerId(l.id);
            if (e) {
                e.addEventListener('click', this._onLayerClick.bind(this));
            }
        }.bind(this));
    },

    _renderLayer: function () {
        this._containerformap.innerHTML = '';
        this._createLayerElements();
        this._attachLayerEvents();
    },

    _getLayerCellByLayerId: function (id) {
        var els = this._containerformap.getElementsByClassName('leaflet-iconLayers-layerCell');
        for (var i = 0; i < els.length; i++) {
            if (els[i].getAttribute('data-layerid') == id) {
                return els[i];
            }
        }
    },

    options: {
        position: 'left',
        // 底图设置，显示栏每行最大显示个数
        maxLayersInRow: 4,
    },

    initialize: function (layers, options) {
        var i, child;
        L.setOptions(this, options);
        this.setMaps(layers);

        ////////////////////////////////////////////////////////////////
        // sidebar的构造函数
        // 底图设置，内置属性赋值
        this._expandDirection = (this.options.position.indexOf('left') !== -1) ? 'right' : 'left';
        this.on('activelayerchange', this._switchMapLayers, this);

        // Find sidebar HTMLElement
        this._sidebar = L.DomUtil.get('sidebar');

        // Attach .sidebar-left/right class
        L.DomUtil.addClass(this._sidebar, 'sidebar-' + this.options.position);

        // Attach touch styling if necessary
        if (L.Browser.touch)
            L.DomUtil.addClass(this._sidebar, 'leaflet-touch');

        // Find sidebar > div.sidebar-content
        for (i = this._sidebar.children.length - 1; i >= 0; i--) {
            child = this._sidebar.children[i];
            if (child.tagName == 'DIV' &&
                L.DomUtil.hasClass(child, 'sidebar-content'))
                this._container = child;
        }

        // Find sidebar ul.sidebar-tabs > li, sidebar .sidebar-tabs > ul > li
        this._tabitems = this._sidebar.querySelectorAll('ul.sidebar-tabs > li, .sidebar-tabs > ul > li');
        for (i = this._tabitems.length - 1; i >= 0; i--) {
            this._tabitems[i]._sidebar = this;
        }

        // Find sidebar > div.sidebar-content > div.sidebar-pane
        this._panes = [];
        this._closeButtons = [];
        for (i = this._container.children.length - 1; i >= 0; i--) {
            child = this._container.children[i];
            if (child.tagName == 'DIV' &&
                L.DomUtil.hasClass(child, 'sidebar-pane')) {
                this._panes.push(child);

                var closeButtons = child.querySelectorAll('.sidebar-close');
                for (var j = 0, len = closeButtons.length; j < len; j++)
                    this._closeButtons.push(closeButtons[j]);
            }
        }
        ////////////////////////////////////////////////////////////////


        ////////////////////////////////////////////////////////////////
        // 底图的初始化
        // map的elements构造
        this._containerformap = L.DomUtil.create('div', 'leaflet-iconLayers');
        L.DomUtil.addClass(this._containerformap, 'leaflet-iconLayers_' + this.options.position);

        this._renderLayer();
        this._switchMapLayers();
        document.getElementById('basic-map').appendChild(this._containerformap)



        ////////////////////////////////////////////////////////////////
        // 台风年份列表初始化
        this._years = [];
        this._typhoonList = {};
        var self = this;
        this._previousYear = null;
        this._selectedYear = null;
        this._selectedTyphoonList = [];
        for (let y = date.getFullYear(); y >= 1949; y--) {
            self._years.push(y);
            self._typhoonList[y] = [];
            self._selectTyphoonList(y, async function (data) {
                await data;
                data.forEach(function (d) {
                    self._typhoonList[y].push({
                        TCID: d['TCID'],
                        TCNAME_CN: d['TCNAME_CN'],
                        TCNAME_EN: d['TCNAME_EN'],
                        TCSTATUS: d['TCSTATUS']
                    });
                });
            });
        }
        this._containerYear = L.DomUtil.create('div', 'typhoonList');
        this._containerYear.type = "display: block";
        this._renderYear();
        document.getElementById('typhoon-info').appendChild(this._containerYear);


        ////////////////////////////////////////////////////////////////
        // 台风列表初始化
        this._showTyphoonList = [];
        this._containerTyphoon = L.DomUtil.create('div', 'typhoonPointList')
        this._containerTyphoon.type = "display: block";
        this._containerParentTyphoon = L.DomUtil.create('div', 'typhoonInfoList')
        this._renderTyphoonList();
        this._containerParentTyphoon.appendChild(this._containerTyphoon);
        document.getElementById('typhoon-info').appendChild(this._containerParentTyphoon);


        ////////////////////////////////////////////////////////////////
        // 台风信息初始化
        this._showTyphoonInfo = [];
        this._containerTyphoonInfo = L.DomUtil.create('div', 'typhoonPPointList');
        this._containerTyphoonInfo.type = "display: block";
        this._containerParentTyphoonInfo = L.DomUtil.create('div', 'typhoonPointInfoList')
        this._renderTyphoonInfo();
        this._containerParentTyphoonInfo.appendChild(this._containerTyphoonInfo);
        document.getElementById('wind-info').appendChild(this._containerParentTyphoonInfo);


        ////////////////////////////////////////////////////////////////
        // 风场数据初始化
        this._selectWindMap = undefined;
        this._previousWindMap = undefined;
        this.on('activeWindChange', this._switchWindLayers, this);

    },

    /**
     * Add this sidebar to the specified map.
     *
     * @param {L.Map} map
     * @returns {Sidebar}
     */
    addTo: function (map) {
        var i, child;

        this._map = map;
        this.typhoon = new Typhoon(this._map);

        for (i = this._tabitems.length - 1; i >= 0; i--) {
            child = this._tabitems[i];
            var sub = child.querySelector('a');
            if (sub.hasAttribute('href') && sub.getAttribute('href').slice(0, 1) == '#') {
                L.DomEvent
                    .on(sub, 'click', L.DomEvent.preventDefault)
                    .on(sub, 'click', this._onClick, child);
            }
        }

        for (i = this._closeButtons.length - 1; i >= 0; i--) {
            child = this._closeButtons[i];
            L.DomEvent.on(child, 'click', this._onCloseClick, this);
        }

        return this;
    },

    onAdd: function (map) { },


    /**
     * Remove this sidebar from the map.
     *
     * @param {L.Map} map
     * @returns {Sidebar}
     */

    remove: function (map) {
        var i, child;

        this._map = null;

        for (i = this._tabitems.length - 1; i >= 0; i--) {
            child = this._tabitems[i];
            L.DomEvent.off(child.querySelector('a'), 'click', this._onClick);
        }

        for (i = this._closeButtons.length - 1; i >= 0; i--) {
            child = this._closeButtons[i];
            L.DomEvent.off(child, 'click', this._onCloseClick, this);
        }

        return this;
    },

    setMaps: function (layers) {
        this._maps = {};
        if (typeof layers === 'string') { return }
        layers = Array.from(layers);
        layers.map(function (layer) {
            var id = L.stamp(layer.layer);
            this._maps[id] = L.extend(layer, {
                id: id
            });
        }.bind(this));
        if (this._containerformap) {
            this._render();
        }
    },

    setActiveLayer: function (layer) {
        var l = layer && this._maps[L.stamp(layer)];
        if (!l || l.id === this._activeLayerId) {
            return;
        }
        this._previousLayerId = this._activeLayerId;
        this._activeLayerId = l.id;
        if (this._container) {
            this._renderLayer();
        }
        this.fire('activelayerchange', {
            layer: layer
        });
    },

    /**
     * Open sidebar (if necessary) and show the specified tab.
     *
     * @param {string} id - The id of the tab to show (without the # character)
     */
    open: function (id) {
        var i, child;

        // hide old active contents and show new content
        for (i = this._panes.length - 1; i >= 0; i--) {
            child = this._panes[i];
            if (child.id == id)
                L.DomUtil.addClass(child, 'active');
            else if (L.DomUtil.hasClass(child, 'active'))
                L.DomUtil.removeClass(child, 'active');
        }

        // remove old active highlights and set new highlight
        for (i = this._tabitems.length - 1; i >= 0; i--) {
            child = this._tabitems[i];
            if (child.querySelector('a').hash == '#' + id)
                L.DomUtil.addClass(child, 'active');
            else if (L.DomUtil.hasClass(child, 'active'))
                L.DomUtil.removeClass(child, 'active');
        }

        this.fire('content', { id: id });

        // open sidebar (if necessary)
        if (L.DomUtil.hasClass(this._sidebar, 'collapsed')) {
            this.fire('opening');
            L.DomUtil.removeClass(this._sidebar, 'collapsed');
        }
        return this;
    },

    /**
     * Close the sidebar (if necessary).
     */
    close: function () {
        // remove old active highlights
        for (var i = this._tabitems.length - 1; i >= 0; i--) {
            var child = this._tabitems[i];
            if (L.DomUtil.hasClass(child, 'active'))
                L.DomUtil.removeClass(child, 'active');
        }

        // close sidebar
        if (!L.DomUtil.hasClass(this._sidebar, 'collapsed')) {
            this.fire('closing');
            L.DomUtil.addClass(this._sidebar, 'collapsed');
        }

        return this;
    },

    /**
     * @private
     */
    _onClick: function () {
        if (L.DomUtil.hasClass(this, 'active'))
            this._sidebar.close();
        else if (!L.DomUtil.hasClass(this, 'disabled'))
            this._sidebar.open(this.querySelector('a').hash.slice(1));
    },

    /**
     * @private
     */
    _onCloseClick: function () {
        this.close();
    },
});

L.control.sidebar = function (layers, options) {
    return new L.Control.Sidebar(layers, options);
};
