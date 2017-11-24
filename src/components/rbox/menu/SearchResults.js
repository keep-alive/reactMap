import React from 'react';
import styles from './_SearchResults.css';
import {
  Table,
  Icon
} from 'antd';
import * as yd from '../../../scripts/youdaomap';

class SearchResults extends React.Component {
  constructor() {
    super();
    this.state = {
      tableContent: null,
      mapContent: null
    }
    this.columns = [{
      title: '屏编号',
      dataIndex: 'pbh',
      key: 'pbh',
      width: 150
    }, {
      title: '屏名称',
      dataIndex: 'pmc',
      key: 'pmc',
      width: 150
    }];
  }
  componentDidMount() {
    this.setState({
      tableContent: this.props.bYdYdps,
      mapContent: this.props.jsonMap
    });
    yd.displayDeviceLayer(this.props.jsonMap);
  }
  componentWillReceiveProps() {
    this.setState({
      tableContent: this.props.bYdYdps,
      mapContent: this.props.jsonMap
    });
    yd.displayDeviceLayer(this.props.jsonMap);
  }
  render() {
    return (
      <div>
    <Table dataSource={this.state.tableContent} columns={this.columns} scroll={{y: 250 }} pagination={false}/>
      </div>
    )
  }
}


export default SearchResults