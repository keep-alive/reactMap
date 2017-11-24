export const DataService = (api_path, param, a, b) => {

    window.$.ajax({
        type: 'POST',
        url: _DataService + api_path,
        data: param,
        dataType: 'json',
        async: false,
        success: a,
        error: b
    });
};