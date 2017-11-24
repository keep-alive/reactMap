import React from 'react';
import ReactDOM from 'react-dom';
import {
    Radio,
    Slider,
    Select,
    Checkbox,
    Table,
    Button,
    DatePicker,
    Tooltip,
    Row,
    InputNumber,
    Col,
    Icon,
    TimePicker,
    Modal,
    message
} from 'antd';
import QueueAnim from 'rc-queue-anim';
import styles from '../_toolBar.css';
import UpdateIndexStyle from './_updateIndex.css'
import * as CI from '../../../scripts/CongestionIndex';
import * as Ds from '../../../libs/DataService';
import * as lmsg from '../../../libs/lmsg';

class updateIndex extends React.Component {
    constructor() {
        super();
        this.state = {
            active: null
        }
    }
    mountTrafficConditions() {
        this.setState({
            active: !this.state.active
        });
        if (!document.getElementById('updateDetails')) {
            this.setState({
                active: !this.state.active
            });
            ReactDOM.render(
                <UpdateIndexPanel/>, document.getElementById("presetBox")
            )
        } else {
            this.setState({
                active: !this.state.active
            });
            ReactDOM.unmountComponentAtNode(document.getElementById("presetBox"))
        }
        this.props.callbackParent({
            status1: !this.state.active,
            status2: this.state.active,
            status3: !this.state.active,
            status4: !this.state.active,
            status5: !this.state.active,
        });
    }
    componentWillReceiveProps(nextProps) {
        this.setState({
            active: nextProps.isActive.active_Update
        })
    }
    componentWillMount() {
        this.setState({
            active: this.props.isActive.active_Update
        });
    }
    render() {
        return (

            <div>
        <li id="trafficConditions" onClick={() => this.mountTrafficConditions() }>
                    <div type="traffic">
                        <span className={this.state.active ? styles.satellite_active : styles.satellite}>更新</span>
                    </div>
                </li>
            </div>
        )
    }
    componentDidMount() {
        //监听单个指数更新
        lmsg.subscribe('openModal_updIdx', (data) => {
            showModal_updIdx(data);
        });
        localStorage.removeItem('openModal_updIdx');
    }
}
const RadioButton = Radio.Button;
const RadioGroup = Radio.Group;
const DropOption = Select.Option;
const RangePicker = DatePicker.RangePicker;
const columns = [{
    title: "名称",
    dataIndex: "name"
}, {
    title: "指数",
    dataIndex: "index"
}];


class UpdateIndexPanel extends React.Component {
    constructor() {
        super();
        this.state = {
            CbtnChecked: false,
            RbtnChecked: false,
            selectedRowKeys: [],
            loading: false,
            isLoaded: false,
            updateToggle: true,
            craType: null,
            ConLevel: null,
            T1Checked: false,
            T2Checked: false,
            T3Checked: false,
            updateMins: null,
            newIndex: 1,
            StartTime: null,
            EndTime: null,
            dataList: null,
            selectIDs: null,
            radioVal: 1
        }
        this.selectCongestion = this.selectCongestion.bind(this);
        this.selectCRA = this.selectCRA.bind(this);
        this.onSelectChange = this.onSelectChange.bind(this);
        this.updateIndexVal = this.updateIndexVal.bind(this);
        this.loadData = this.loadData.bind(this);
        this.getStartTime = this.getStartTime.bind(this);
        this.getEndTime = this.getEndTime.bind(this);
        this.switchRadio = this.switchRadio.bind(this);
        this.updateMins = this.updateMins.bind(this);
        this.getIndex = this.getIndex.bind(this);
        this.onSelectChange = this.onSelectChange.bind(this);

    }
    componentWillUnmount() {
        //lmap.removeEchartsLayer();
        CI.clearLayer();
    }
    selectCongestion(e) {
        if (e) {
            this.setState({
                CbtnChecked: true,
                ConLevel: e.target.value
            });
        }
    }
    selectCRA(value) {
        if (value) {
            this.setState({
                RbtnChecked: true,
                craType: value
            });
        }
    }
    loadData() {
        if (this.state.isLoaded) {
            this.setState({
                isLoaded: false
            });
        };
        this.setState({
            loading: true
        });
        let param = {
            type: this.state.craType,
            level: this.state.ConLevel
        };
        Ds.DataService("/trafficindex_map/zsLevel.do", param,
            (resp) => {
                let data4Table = [];
                if (resp.aaData.length < 1) {
                    message.error('没有查到符合数据', 5); //alert("没有查到符合数据"); 
                    this.setState({
                        loading: false,
                        isLoaded: false,
                    });
                } else {
                    for (var i = 0; i < resp.aaData.length; i++) {
                        data4Table.push({
                            name: resp.aaData[i].name,
                            index: resp.aaData[i].jtzs,
                            id: resp.aaData[i].id,
                            key: i
                        });
                    };
                    this.setState({
                        loading: false,
                        isLoaded: true,
                        dataList: data4Table
                    });
                }

            },
            (e) => {
                console.log(e);
                //alert("加载失败");
                message.error('加载失败', 5);
                this.setState({
                    loading: false,
                    isLoaded: false,
                });
            });
    }
    updateIndexVal() {

        this.setState({
            loading: true
        });
        let zsUpdate = {

            start: this.state.StartTime,
            end: this.state.EndTime,
            time: this.state.updateMins,
            zs: this.state.newIndex.toString(),
            type: this.state.craType.toString(),
            ids: this.state.selectIDs.toString()

        };

        Ds.DataService('/trafficindex_map/zsUpdate.do', zsUpdate,
            (resp) => {
                this.setState({
                    selectedRowKeys: [],
                    loading: false,
                });
                if (resp.errorCode == 'success') {
                    //alert('保存成功！');
                    message.success('保存成功！', 5);
                } else {
                    message.error('保存失败' + resp.errorText, 5);
                    //alert('保存失败', resp.errorText);
                }
            },
            (e) => {
                console.log = (e);
                message.error('后台传输错误！', 5);
                //alert("后台传输错误！")
            });

    }
    onSelectChange(selectedRowKeys) {
        //console.log('selectedRowKeys changed: ', selectedRowKeys);
        let list = this.state.dataList;
        let selectID = [];
        selectedRowKeys.map((item) => {
            selectID.push(list[item].id)
        });
        this.setState({
            selectIDs: selectID
        });
        this.setState({
            selectedRowKeys
        });
    }

    getStartTime(value, dateString) {
        let d = new Date();
        var month = d.getMonth() + 1;
        var today = d.getFullYear() + "-" + month + "-" + d.getDate();
        this.setState({
            T1Checked: true,
            StartTime: today + " " + dateString
        })

    }
    getEndTime(value, dateString) {
        let d = new Date();
        var month = d.getMonth() + 1;
        var today = d.getFullYear() + "-" + month + "-" + d.getDate();
        this.setState({
            T2Checked: true,
            EndTime: today + " " + dateString
        })
    }
    updateMins(val) {
        this.setState({
            updateMins: val
        });
    }
    switchRadio(e) {
        this.setState({
            T3Checked: true,
            StartTime: null,
            EndTime: null,
            updateMins: null,
            radioVal: e.target.value
        });
        switch (e.target.value) {
            case 1:
                this.setState({
                    updateToggle: true
                });
                break;
            case 2:
                this.setState({
                    updateToggle: false
                });
                break;
            default:
                break;
        }

    }
    getIndex(val) {
        this.setState({
            newIndex: val
        })
    }
    render() {
        const {
            loading,
            selectedRowKeys
        } = this.state;
        const rowSelection = {
            selectedRowKeys,
            onChange: this.onSelectChange,
        };
        const hasSelected = selectedRowKeys.length > 0;
        const newArray = (start, end) => {
            const result = [];
            for (let i = start; i < end; i++) {
                result.push(i);
            }
            return result;
        }
        const myDate = new Date();
        const changeIndexPanel = this.state.updateToggle ? [
            <div  key={'aa'}>
            <Row>
            <Col span={4}>
        <RadioGroup onChange={this.switchRadio} defaultValue={1}>
                <Radio style={{
                  display: 'block',
                  height: '30px',
                  lineHeight: '30px',
                }} key="a" value={1}>方法1</Radio>
                    <Radio style={{
                  display: 'block',
                  height: '30px',
                  lineHeight: '30px',
                }} key="b" value={2}>方法2</Radio>
        </RadioGroup>
            </Col>
            <Col span={18}>
            {"更新时段: "}
            <TimePicker disabledSeconds={()=>{return newArray(0, 60).filter(value => value % 5 !== 0);}} onChange={this.getStartTime} hideDisabledOptions getPopupContainer={() => document.getElementById('updateDetails')}/> 
            {"~"}
        <TimePicker disabledSeconds={()=>{return newArray(0, 60).filter(value => value % 5 !== 0);}} onChange={this.getEndTime} hideDisabledOptions getPopupContainer={() => document.getElementById('updateDetails')}/> < br / >
            {"更新指数: "}
            <InputNumber style={{marginTop: 3}} min={0} max={10} defaultValue={1} step={0.1} onChange={this.getIndex}></InputNumber>
            <Button className={UpdateIndexStyle.button_primary} style={{marginLeft:30}} type="primary" onClick={this.updateIndexVal}
                    disabled={!hasSelected || !this.state.T1Checked || !this.state.T2Checked} loading={loading}>更新</Button>
            </Col>
            </Row>
            </div>
        ] : [
            <div  key={'bb'}>
            <Row>
            <Col span={4}>
        <RadioGroup onChange={this.switchRadio} value={this.state.radioVal} defaultValue={1}>
                <Radio style={{
                  display: 'block',
                  height: '30px',
                lineHeight: '30px',
                }} key="a" value={1}>方法1</Radio>
                    <Radio style={{
                  display: 'block',
                  height: '30px',
                  lineHeight: '30px',
                }} key="b" value={2}>方法2</Radio>
        </RadioGroup>
            </Col>
            <Col span={18}>
            
            <Row>
            <Col span={5}>{"更新分钟:"}</Col>
            <Col span={10}>
            <Slider  min={1} max={500} onChange={this.updateMins} value={this.state.updateMins} />
              </Col>
              <Col span={4}>
                  <InputNumber min={1} max={500} style={{ marginLeft: '2px' }}
                    value={this.state.updateMins} onChange={this.updateMins}/>
                    </Col>
                    </Row>
            <Row>
           
            {"更新指数: "}
        <InputNumber style={{marginTop: 3, marginLeft:'10px'}} min={0} max={10} defaultValue={1} step={0.1} onChange={this.getIndex}></InputNumber>
            <Button className={UpdateIndexStyle.button_primary} style={{marginLeft:'48px'}} type="primary" onClick={this.updateIndexVal}
                    disabled={!hasSelected || !this.state.T3Checked} loading={loading}>更新</Button>
              </Row>  
            </Col>
            </Row>
            </div>
        ];
        var ConListPanel = this.state.isLoaded ? [
            <QueueAnim key={'aaa'} delay={1000} className="queue-simple">
            <div key={'a'}>
                <div key={'bbb'} style={{ marginBottom: 8 }}>
                  <span style={{ marginLeft: 20 }}>{hasSelected ? `您已选择 ${selectedRowKeys.length} 个对象` : ''}</span>
                </div>
                <Table rowKey={'key'} size="small" rowSelection={rowSelection} columns={columns} dataSource={this.state.dataList} />

                <div key={'ccc'} className={UpdateIndexStyle.QueContent} >
                        {changeIndexPanel}
                    </div>
                
                
          </div>
            </QueueAnim>
        ] : null;

        return (
            <div className={UpdateIndexStyle.boxpanel}  id="updateDetails">
                <div className={UpdateIndexStyle.panel_header}>
                    
                   <span className={UpdateIndexStyle.tab1}>指数批量更新</span>                       
                    <div className={UpdateIndexStyle.traffic_tag}>
                        <span className={UpdateIndexStyle.smooth_jam}>畅通</span>
                        <ul className={UpdateIndexStyle.traffic_level}>
                            <li className={UpdateIndexStyle.traffic_level_1}></li>
                            <li className={UpdateIndexStyle.traffic_level_2}></li>
                            <li className={UpdateIndexStyle.traffic_level_3}></li>
                            <li className={UpdateIndexStyle.traffic_level_4}></li>
                            <li className={UpdateIndexStyle.traffic_level_5}></li>
                        </ul>
                        <span className={UpdateIndexStyle.smooth_jam}>拥堵</span>
                    </div>
                </div>
                <div className={UpdateIndexStyle.panel_body} id="traffic_detailed">
                <div className={UpdateIndexStyle.selectCra} >
                                <Select style={{ width: 80 }} placeholder={"请选择"} getPopupContainer={() => document.getElementById('updateDetails')} onChange={this.selectCRA}>
                                  <DropOption key={'q'} value="cross">路口</DropOption>
                                  <DropOption key={'w'} value="road">路段</DropOption>
                                  <DropOption key={'e'} value="region">区域</DropOption>
                                </Select>
                </div>    
                     <div className={UpdateIndexStyle.radio_btnGroup}>
                        <RadioGroup  onChange={this.selectCongestion}>
                          <RadioButton key={'1'} value="1">畅通</RadioButton>
                          <RadioButton key={'2'} value="2">基本</RadioButton>
                          <RadioButton key={'3'} value="3">一般</RadioButton>
                          <RadioButton key={'4'} value="4">拥堵</RadioButton>
        <RadioButton key={'5'} value="5">严重</RadioButton>
                        </RadioGroup>
                      </div>
                    <Button className={UpdateIndexStyle.button_primary} type="primary" icon="cloud-upload" 
                     loading={this.state.loading} onClick={this.loadData} disabled = {!this.state.CbtnChecked || !this.state.RbtnChecked} > 
                     {"加载数据"}
                    </Button>
                    <QueueAnim key={"b"} className={UpdateIndexStyle.QueContent} 
                    animConfig={[{ opacity: [1, 0], translateY: [0, 50] },{ opacity: [1, 0], translateY: [0, -50] }]} >
        {ConListPanel}
                    </QueueAnim>
        
                
                
                    
                </div>
            </div>
        )
    }

}
const newArray = (start, end) => {
    const result = [];
    for (let i = start; i < end; i++) {
        result.push(i);
    }
    return result;
}
var slider_value = null;
var onSliderTimeChange = (va) => {
    slider_value = va;
}

var showModal_updIdx = (data) => {
    Modal.confirm({
        title: '更新指数信息',
        content: (<div id="signal_update">
                    {'请输入更新的指数, 当前的指数为：'+ data.index+ '  '}<br/>
                    {'更新的分钟： '}<Slider id="timeLong" min={1} max={20} step={1} onChange={onSliderTimeChange}/>
                    {'更新的指数： '}<InputNumber id="newIndexVal" defaultValue={data.index} min={1} max={10} step={0.1}/>  
                  </div>),
        onOk() {
            var sendNewIndParam = {
                ids: data.id,
                zs: document.getElementById('newIndexVal').value,
                time: slider_value,
                type: data.type,
                start: null,
                end: null
            };
            Ds.DataService('/trafficindex_map/zsUpdate.do', sendNewIndParam, (resp) => {
                if (resp.errorCode == 'success') message.success('保存成功', 5); //alert('保存成功');
                else message.error('保存失败', 5); //alert('保存失败');
            }, (e) => {
                message.error('保存失败', 5);
                //alert('保存失败');
            });
        },
        onCancel() {}
    });
}

export default updateIndex