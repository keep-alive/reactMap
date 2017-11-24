import React from 'react';
import styles from './_SearchResults.css';
import {
    Collapse,
    Icon
} from 'antd';

const Panel = Collapse.Panel;

class SearchResults extends React.Component {

    render() {
        var xh_road = 0,
            xh_cross = 0,
            xh_area = 0;
        var crossResults = this.props.cross;
        var roadResults = this.props.road;
        var regionResults = this.props.region;
        if (crossResults.length == 0) {
            crossResults = [{
                'id': '',
                'jtzs': '暂无数据',
                'xh': '0',
                'name': '暂无数据'
            }];


        }
        if (roadResults.length == 0) {
            roadResults = [{
                'id': '',
                'jtzs': '暂无数据',
                'xh': '0',
                'name': '暂无数据'
            }];
        }
        if (regionResults.length == 0) {
            regionResults = [{
                'id': '',
                'jtzs': '暂无数据',
                'xh': '0',
                'name': '暂无数据'
            }];
        }
        return (

            <Collapse
                defaultActiveKey={ ['1'] }
                accordion>
        <Panel
               header={ '路口信息' }
               key="1">
          <div className={ styles.content }>
            <table className={ styles.bordered }>
              <thead>
                <tr>
                  <th>
                    #编号
                  </th>
                  <th>
                    路口名称
                  </th>
                  <th>
                    路口指数
                  </th>
                </tr>
              </thead>
              <tbody>
                { crossResults.map((item) => {
                    xh_cross = xh_cross + 1;
                    return <tr key={ item.id }>
                             <td>
                               { xh_cross }
                             </td>
                             <td>
                               { item.name }
                             </td>
                             <td className={ item.index > 8 ? styles.font_color5 :
                                             item.index > 6 ? styles.font_color4 :
                                             item.index > 4 ? styles.font_color3 :
                                             item.index > 2 ? styles.font_color2 :
                                             styles.font_color1 }>
                               { item.jtzs }
                             </td>
                           </tr>
                  }) }
              </tbody>
            </table>
          </div>
        </Panel>
        <Panel
               header={ '路段信息' }
               key="2">
          <div className={ styles.content }>
            <table className={ styles.bordered }>
              <thead>
                <tr>
                  <th>
                    #编号
                  </th>
                  <th>
                    路段名称
                  </th>
                  <th>
                    路段指数
                  </th>
                </tr>
              </thead>
              <tbody>
                { roadResults.map((item) => {
                    xh_road = xh_road + 1;
                    return <tr key={ item.id }>
                             <td>
                               { xh_road }
                             </td>
                             <td>
                               { item.name }
                             </td>
                             <td className={ item.index > 8 ? styles.font_color5 :
                                             item.index > 6 ? styles.font_color4 :
                                             item.index > 4 ? styles.font_color3 :
                                             item.index > 2 ? styles.font_color2 :
                                             styles.font_color1 }>
                               { item.jtzs }
                             </td>
                           </tr>
                  }) }
              </tbody>
            </table>
          </div>
        </Panel>
        <Panel
               header={ '区域信息' }
               key="3">
          <div className={ styles.content }>
            <table className={ styles.bordered }>
              <thead>
                <tr>
                  <th>
                    #编号
                  </th>
                  <th>
                    区域名称
                  </th>
                  <th>
                    区域指数
                  </th>
                </tr>
              </thead>
              <tbody>
                { regionResults.map((item) => {
                    xh_area = xh_area + 1;
                    return <tr key={ item.id }>
                             <td>
                               { xh_area }
                             </td>
                             <td>
                               { item.name }
                             </td>
                             <td className={ item.index > 8 ? styles.font_color5 :
                                             item.index > 6 ? styles.font_color4 :
                                             item.index > 4 ? styles.font_color3 :
                                             item.index > 2 ? styles.font_color2 :
                                             styles.font_color1 }>
                               { item.jtzs }
                             </td>
                           </tr>
                  }) }
              </tbody>
            </table>
          </div>
        </Panel>
      </Collapse>



        )
    }
}


export default SearchResults