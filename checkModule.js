
/*
객체 배열에서 객체의 키값과 일치하는 데이터 반환하는 함수
*/
exports.getItem = function(arr, key, val) {
    var result = {};
    arr.some(function(item) {
        if (item[key] == val) {
            result = item;
        }
    });
    return result;
};

/*
빈 객체인지 체크(빈객체:false, 객체내용있음:true)하는 함수
*/
exports.isNotEmptyObj = function(obj) {
    return !(Object.keys(obj).length === 0 && JSON.stringify(obj) === JSON.stringify({}));
};
