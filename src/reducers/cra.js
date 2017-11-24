import {combineReducers} from 'redux';
import {cr} from '../utils/util';
import {PUSH_CRA_LIST} from '../actions/craAction';

export default combineReducers({
	cralist: cr([], {
        [PUSH_CRA_LIST](state, {list}) { return list }
    })

})