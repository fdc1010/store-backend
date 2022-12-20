class ArrayHelper {
  chunk(array, chunkSize) {
    var R = [];
    for (var i = 0; i < array.length; i += chunkSize)
      R.push(array.slice(i, i + chunkSize));
    return R;
  }
}

module.exports = new ArrayHelper();
