function copyText(text,callback) {
    if (navigator.clipboard) {
        // 使用 Clipboard API 复制文本
        navigator.clipboard.writeText(text).then(() => {
            // 提示复制成功
            callback && callback();
        }, (err) => {
            // 提示复制失败
            callback && callback(err);
        });
    } else {
        onExecCommand(text,callback);
    }

}

function onExecCommand(val,callback) {
    let input = document.createElement('input');
    input.setAttribute('readonly', 'readonly');
    input.setAttribute('value', val);
    input.style.position = "absolute";
    input.style.opacity = 0;
    input.style.left = "-999999px";
    input.style.top = "-999999px";
    input.style.display = "none";
    document.body.appendChild(input);
    input.focus();
    input.select();
    input.setSelectionRange(0, 9999);
    // ios必须先选中文字且不支持 input.select();
    selectText(input, 0, val.length);
    if (document.execCommand('copy')) {
        document.execCommand('copy');
        callback && callback();
    }
    document.body.removeChild(input);
}

// 选择文本。createTextRange(setSelectionRange)是input方法
function selectText(textbox, startIndex, stopIndex) {
    if (textbox.createTextRange) {//ie
        const range = textbox.createTextRange();
        range.collapse(true);
        range.moveStart('character', startIndex);//起始光标
        range.moveEnd('character', stopIndex - startIndex);//结束光标
        range.select();//不兼容苹果
    } else {//firefox/chrome
        textbox.setSelectionRange(startIndex, stopIndex);
        textbox.focus();
    }
}

export { copyText };
