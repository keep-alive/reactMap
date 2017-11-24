import React from 'react';
import ReactDOM from 'react-dom';
import {
    Slider,
    Checkbox,
    Button,
    Progress,
    DatePicker,
    Tooltip,
    InputNumber,
    Row,
    Col,
    TimePicker,
    message,
    Spin
} from 'antd';
import QueueAnim from 'rc-queue-anim';
import styles from '../_toolBar.css';
import trafficStyles from './_traffic.css'
import * as CI from '../../../scripts/CongestionIndex';
import * as Ds from '../../../libs/DataService';
import * as lmap from '../../../libs/lmap';

class Traffic extends React.Component {
    constructor() {
        super();
        this.state = {
            active: null
        }
    }
    componentWillMount() {
        this.setState({
            active: this.props.isActive.active_Traffic
        });
    }
    componentWillReceiveProps(nextProps) {
        this.setState({
            active: nextProps.isActive.active_Traffic
        })
    }
    mountTrafficConditions() {
        this.setState({
            active: !this.state.active
        })
        if (!document.getElementById('detailedRoad')) {
            ReactDOM.render(
                <TrafficConditions/>, document.getElementById("presetBox")
            )
        } else {
            ReactDOM.unmountComponentAtNode(document.getElementById("presetBox"))
        }
        this.props.callbackParent({
            status1: this.state.active,
            status2: !this.state.active,
            status3: !this.state.active,
            status4: !this.state.active,
            status5: !this.state.active,
        });
    }
    render() {
        return (
            <div>
                <li id="trafficConditions" onClick={() => this.mountTrafficConditions() }>
                    <div type="traffic">
                        <span className={this.state.active ? styles.traffic_active : styles.traffic}>路况</span>
                    </div>
                </li>
            </div>
        )
    }
    componentDidMount() {}
}

class TrafficConditions extends React.Component {
    constructor() {
        super();
        this.state = {
            forecast: true,
            playback: false
        }
    }
    forecast() {
        this.setState({
            forecast: true,
            playback: false
        });
        ReactDOM.render(
            <Forecast/>, document.getElementById('traffic_detailed')
        )
        CI.clearLayer();
    }
    playback() {
        this.setState({
            forecast: false,
            playback: true
        });
        ReactDOM.render(
            <Playback/>, document.getElementById('traffic_detailed')
        )
        CI.clearLayer();
    }
    componentWillUnmount() {
        //lmap.removeEchartsLayer();
        CI.clearLayer();
    }
    render() {
        return (
            <div className={trafficStyles.boxpanel}  id="detailedRoad">
                <div className={trafficStyles.panel_header}>
                    <ul className={trafficStyles.panel_tab}>
                        <li className={this.state.forecast ? trafficStyles.panel_tab_li_active : trafficStyles.panel_tab_li} id="traffic_current" type="current" onClick={() => this.forecast() }>预测</li>
                        <li className={this.state.playback ? trafficStyles.panel_tab_li_active : trafficStyles.panel_tab_li} id="traffic_forecast" type="forecast" onClick={() => this.playback() }>回放</li>
                    </ul>
                    <div className={trafficStyles.traffic_tag}>
                        <span className={trafficStyles.smooth_jam}>畅通</span>
                        <ul className={trafficStyles.traffic_level}>
                            <li className={trafficStyles.traffic_level_1}></li>
                            <li className={trafficStyles.traffic_level_2}></li>
                            <li className={trafficStyles.traffic_level_3}></li>
                            <li className={trafficStyles.traffic_level_4}></li>
                            <li className={trafficStyles.traffic_level_5}></li>
                        </ul>
                        <span className={trafficStyles.smooth_jam}>拥堵</span>
                    </div>
                </div>
                <div className={trafficStyles.panel_body} id="traffic_detailed">

                </div>
            </div>
        )
    }
    componentDidMount() {
        ReactDOM.render(
            <Forecast/>, document.getElementById('traffic_detailed')
        );
    }
}

class Forecast extends React.Component {
    constructor() {
        super();
        this.onSliderChange = this.onSliderChange.bind(this);
        this.startForcast = this.startForcast.bind(this);
        this.getCheckOption = this.getCheckOption.bind(this);
        this.clearForcast = this.clearForcast.bind(this);
        this.state = {
            inputValue: 1,
            checked: false,
            isLoading: false,
            isLoaded: false,
            CraType: null,

        };
    }
    onSliderChange(val) {
        this.setState({
            inputValue: val
        });
    }
    getCheckOption(value) {
        let CheckOptions = '';
        switch (value.length) {
            case 0:
                CheckOptions = "";
                break;
            case 1:
                CheckOptions = value[0];
                break;
            case 2:
                CheckOptions = value[0] + "-" + value[1];
                break;
            case 3:
                CheckOptions = "cross-road-region";
                break;
        }
        if (CheckOptions.length !== 0) this.setState({
            checked: true,
            CraType: CheckOptions
        });
    }
    startForcast() {
        let self = this;
        this.setState({
            isLoading: true
        });
        let param = {
            type: this.state.CraType,
            time: this.state.inputValue
        }
        Ds.DataService('/trafficindex_map/forecast.do', param,
            (resp) => {
                if (markerPlayBack) CI.clearLayer();
                self.setState({
                    isLoading: false,
                    isLoaded: true
                });
                if (resp.aaData.features.length == 0) {
                    //alert('没有查询到相应信息');
                    message.error('没有查询到相应信息', 5);
                    self.setState({
                        isLoading: false,
                        isLoaded: false
                    });
                }
                let geo_playback = resp.aaData;
                CI.displayCommonLayer(geo_playback);
                //markerPlayBack = CI.playback(geo_playback);
            },
            (e) => {
                console.log(e)
            });
    }
    clearForcast() {
        CI.clearLayer();
        this.setState({
            isLoaded: false
        });
    }
    render() {
        let b = new Date;
        let c = b.getFullYear();
        let d = b.getMonth() + 1;
        d = d < 10 ? "0" + d : d;
        let e = b.getDate();
        e = e < 10 ? "0" + e : e;
        let f = b.getHours();
        f = f < 10 ? "0" + f : f;
        let g = b.getMinutes().toString();
        g = g < 10 ? "0" + g : g;
        return (
            <div className={trafficStyles.panel_body}>
                    <Row>
                        <Col span={4}>{"当前时间: "}</Col>
                        <Col span={6}>{c+"-"+d+"-"+e}</Col>
                        <Col span={6}>{f+":"+g}</Col>
                    </Row>
                    <Row>
                        <Col span={4}></Col>
                        <Col span={12}><CheckboxGroup className={trafficStyles.checkboxes} options={CRA_options} onChange={this.getCheckOption} /></Col>
                    </Row>
                    <Row>
                        <Col span={4}>{"预测时间:"}</Col>
                        <Col span={14}>
                            <Slider min={0} max={30} onChange={this.onSliderChange} step={5} value={this.state.inputValue} />
                        </Col>
                        <Col span={6}>
                            <InputNumber style={{width:'60px'}} min={1} max={30} value={this.state.inputValue} step={5} onChange={this.onSliderChange}/>
                            {' 分钟'}
                        </Col>
                       
                    </Row>
                    <Row>
                        <Col span={4}></Col>
                        <Col span={6}>
                            <Button type="primary" loading={this.state.isLoading} className={trafficStyles.button_primary} onClick={this.startForcast} disabled={!this.state.checked}>
                              {this.state.isLoaded ? "加载数据" :"加载数据" }
                            </Button>
                        </Col>
                        <Col span={6}>
                            <Button type="ghost" style={{borderRadius: '2px', marginLeft:'40px'}} onClick={this.clearForcast} disabled={!this.state.isLoaded}>
                              {"清空图层"}
                            </Button>
                        </Col>
                        <Col span={2} className={trafficStyles.date} id="dateNow"></Col>

                    </Row>
            </div>
        )
    }
}

const RangePicker = DatePicker.RangePicker;
const CheckboxGroup = Checkbox.Group;
var progressInterval = null;
const CRA_options = [{
    label: "路口",
    value: "cross"

}, {
    label: "路段",
    value: "road"
}, {
    label: "区域",
    value: "region"
}];
const CRA_options2 = [{
    label: "路口",
    value: "cross"

}, {
    label: "路段",
    value: "road",
    disabled: true
}, {
    label: "区域",
    value: "region",
    disabled: true
}];

var markerPlayBack;

class Playback extends React.Component {
    constructor() {
        super();
        /*callback函数里的this不同，需要bind*/
        this.getTimeRange = this.getTimeRange.bind(this);
        this.getCheckOption = this.getCheckOption.bind(this);
        this.loadingData = this.loadingData.bind(this);
        this.play = this.play.bind(this);
        this.clear = this.clear.bind(this);
        this.reload = this.reload.bind(this);
        this.state = {
            startTime: null,
            endTime: null,
            loading: false,
            isLoaded: false,
            isPlaying: false,
            playingBtn: false,
            percent: 0,
            each_percent: 0,
            checkedOptions: []
        }

    }
    play() {
        markerPlayBack.start();
        this.setState({
            playingBtn: !this.state.playingBtn,
            isPlaying: !this.state.isPlaying
        });

    }

    clear() {
        if (markerPlayBack) {
            markerPlayBack.clearLayer();
        }

        this.setState({
            isPlaying: false,
            playingBtn: false
        });
    }
    reload() {
        this.clear();
        this.loadingData();
    }

    getTimeRange(value, dateString) {
        if (this.state.isLoaded) this.clear();
        let StartTime = dateString[0];
        let EndTime = dateString[1];
        this.setState({
            startTime: StartTime,
            endTime: EndTime,
            isLoaded: false,
            percent: 0
        });
        if (this.state.playingBtn) this.setState({
            playingBtn: !this.state.playingBtn
        });

    }
    getCheckOption(value) {
        let CheckOptions = '';
        switch (value.length) {
            case 0:
                CheckOptions = "";
                break;
            case 1:
                CheckOptions = value[0];
                break;
            case 2:
                CheckOptions = value[0] + "-" + value[1];
                break;
            case 3:
                CheckOptions = "cross-road-region";
                break;
        }
        if (this.state.isLoaded) this.clear();
        this.setState({
            checkedOptions: CheckOptions,
            isLoaded: false,
            percent: 0
        });
        if (this.state.playingBtn) this.setState({
            playingBtn: !this.state.playingBtn
        });
    }

    loadingData() {
        if (this.state.startTime == null || this.state.endTime == null || this.state.checkedOptions.length == 0) {
            message.warning("请选择信息后查询", 3); //alert("请选择信息后查询");
            return;
        }
        let self = this;

        this.setState({
            loading: true,
            playingBtn: false
        });
        CI.clearLayer();
        setTimeout(() => {
            var param1 = {
                kssj: self.state.startTime,
                jssj: self.state.endTime,
                type: self.state.checkedOptions
            }

            Ds.DataService("/trafficindex_map/hisPlayBack.do", param1,
                (data) => {
                    let geo_playback = data.aaData;
                    if (geo_playback.features.length < 1) {
                        self.setState({
                            loading: false,
                            isLoaded: false
                        });
                        //alert("没有相应信息");
                        message.error('没有查询到相应信息', 5);
                    } else {
                        self.setState({
                            loading: false,
                            isLoaded: true
                        })
                        var percent_length = geo_playback.features[0].properties.index.length;
                        var each_percent = Math.round(100 / percent_length);
                        self.setState({
                            each_percent: each_percent
                        });
                        markerPlayBack = CI.playback(geo_playback);
                    }
                }, (e) => {
                    //alert('后台传输错误');
                    message.error('后台传输错误', 5);
                    console.log(e);
                });
        }, 1000);

    }
    disabledDate(current) {
        // can not select days after today
        return current && current.valueOf() > Date.now();
    }
    componentWillUnmount() {
        if (progressInterval) clearInterval(progressInterval);
        if (markerPlayBack) this.clear();
    }
    render() {
        const player_panel = this.state.isLoaded ? [
            <QueueAnim key='QueueAnim11' delay={500} className="queue-simple">
            <div key={'a'} id="hisPlayer" className={trafficStyles.hisPlayer_panel}>

                    <Button key={'2'} className={trafficStyles.hisPlayer_btn1} type="ghost"  onClick={this.reload} loading={this.state.loading} size="large" icon="reload">重新加载</Button>    
                    <Button key={'4'} className={trafficStyles.hisPlayer_btn1} type="primary" onClick={this.play} size="large" icon={this.state.playingBtn ? "pause" : "play-circle"}>开始/暂停</Button>
                    <Button key={'6'} className={trafficStyles.hisPlayer_btn1} type="ghost" onClick={this.clear} size="large" icon="file-excel">清空图层</Button>
                </div>
                </QueueAnim>
        ] : null;
        return (
            <div className={trafficStyles.panel_body}>
                <div>
                <Spin spinning={this.state.loading}>
                <ul id="ul1">
                    <li>{"时间区间: "}<RangePicker showTime disabledDate={this.disabledDate} format="YYYY-MM-DD HH:mm:ss" 
                    onChange={this.getTimeRange} getCalendarContainer={trigger=>trigger.parentNode} />
                    </li><br/>
                   <li><CheckboxGroup className={trafficStyles.checkboxes} options={CRA_options2} onChange={this.getCheckOption} />
                    </li><br/>
                     <Button className={trafficStyles.button_primary} style={{marginLeft:'150px'}} type="primary" size="large" icon="cloud-upload" 
                     loading={this.state.loading} onClick={this.loadingData} disabled={this.state.isLoaded}>{this.state.isLoaded ? "加载数据" : "加载数据"}</Button>
                    <br/>
                    <li className={trafficStyles.splitline_H}></li><br/>
                    </ul>
                    </Spin>
                </div>
                <br/>
                    <div className={trafficStyles.QueContent}>
                        {player_panel}
                    </div>
            </div>
        )
    }
    componentDidMount() {

    }
}

export default Traffic