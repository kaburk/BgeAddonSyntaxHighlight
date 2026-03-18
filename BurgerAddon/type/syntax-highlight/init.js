/// <reference path="../../@types/BgE.d.ts" />
'use strict';

function normalizeSyntaxHighlightCode(value) {
    if (typeof value !== 'string') {
        return value;
    }

    // hljs マークアップがなければそのまま返す
    if (value.indexOf('hljs') === -1) {
        return value;
    }

    var container = document.createElement('div');
    container.innerHTML = value;

    // hljs-line-numbers.js が生成したテーブル構造の場合:
    // td.hljs-ln-code ごとに1行分のコードが格納されているため
    // textContent を取り出して改行で結合して元のコードを復元する。
    // （td.hljs-ln-numbers の行番号テキストは取得しない）
    var codeCells = container.querySelectorAll('td.hljs-ln-code');
    if (codeCells.length > 0) {
        return Array.prototype.map.call(codeCells, function (td) {
            // 空行は &nbsp; (\u00a0) が挿入されるため空文字に正規化
            var text = td.textContent;
            return text === '\u00a0' ? '' : text;
        }).join('\n');
    }

    // 通常の hljs span 構造（行番号なし）の場合:
    // textContent はハイライト span を除去しつつ改行を保持する
    return container.textContent || '';
}

function isLineNumbersEnabled(value) {
    return value === true || value === 1 || value === '1' || value === 'true';
}

// BurgerEditor の ioFilter は "<" 始まりの値を HTML としてパースするため
// "< ?php" 等が "< !--?php" に変換されてしまう。
// sh-code は DOM 書き込み前に base64 エンコードし、読み出し時にデコードすることで回避する。
function encodeCode(str) {
    if (typeof str !== 'string') { return str; }
    try {
        return btoa(unescape(encodeURIComponent(str)));
    } catch (e) {
        return str;
    }
}

function decodeCode(str) {
    if (typeof str !== 'string' || !str) { return str; }
    try {
        return decodeURIComponent(escape(atob(str)));
    } catch (e) {
        // 旧形式データ（hljs HTML 等）のフォールバック
        return normalizeSyntaxHighlightCode(str);
    }
}

BgE.registerTypeModule('SyntaxHighlight', {
    beforeOpen: function (editorDialog, type, data) {
        // BurgerEditor のフォーム自動バインドは ioFilter を1通るため、
        // ここで data をデコードしても textarea に設定したときに再度夈止される。
        // デコード処理は open() で行う。
    },

    open: function (editorDialog, type) {
        // type.export() から base64 のまま取得し、
        // jQuery.val() で textarea に直接セットする。
        // jQuery.val() は ioFilter を通らないため "< ?php" 等が届まれずに表示される。
        // （BurgerEditor のフォーム自動バインドは open() より前に実行されるためここで上書きする）。
        var savedData = type.export();
        editorDialog.$el.find('[name="bge-sh-code"]').val(decodeCode(savedData['sh-code'] || ''));

        // チェックボックスの状態を現在のブロックデータから復元する。
        // BurgerEditor は checkbox を自動復元しないため open() で手動設定する。
        editorDialog.$el.find('[name="bge-sh-line-numbers"]').prop(
            'checked',
            isLineNumbersEnabled(savedData['sh-line-numbers'])
        );

        var updatePreview = function () {
            var lang = editorDialog.$el.find('[name="bge-sh-language"]').val();
            var code = editorDialog.$el.find('[name="bge-sh-code"]').val();
            var lineNumbers = editorDialog.$el.find('[name="bge-sh-line-numbers"]').is(':checked');
            var $previewCode = editorDialog.$el.find('.bge-sh-preview code');
            var $previewPre = editorDialog.$el.find('.bge-sh-preview pre');

            // クリアして再設定（highlightElement は一度実行するとクラスが固定されるため）
            $previewCode.removeClass().removeAttr('data-highlighted');
            $previewPre.removeAttr('data-line-numbers');
            $previewCode.text(code || '');

            if (lang && lang !== 'auto') {
                $previewCode.addClass('language-' + lang);
            }

            hljs.highlightElement($previewCode[0]);

            if (lineNumbers) {
                $previewPre.attr('data-line-numbers', '1');
                hljs.lineNumbersBlock($previewCode[0]);
            }
        };

        editorDialog.$el.find('[name="bge-sh-language"], [name="bge-sh-line-numbers"]').on('change', updatePreview);
        editorDialog.$el.find('[name="bge-sh-code"]').on('input', updatePreview);

        // 初回プレビュー
        updatePreview();
    },

    beforeChange: function (newValues) {
        // BurgerEditor が merge() で値を DOM に書き込む際に ioFilter を適用する。
        // ioFilter は "<" 始まりの値を HTML としてパースしてしまうため、
        // 事前に base64 エンコードして "<" が先頭に来ないようにする。
        if (typeof newValues['sh-code'] === 'string') {
            newValues['sh-code'] = encodeCode(newValues['sh-code']);
        }
    },

    change: function (value, type) {
        var $wrapper = $(type.el);
        var $pre = $wrapper.find('pre');
        var $code = $wrapper.find('code');
        // data-sh-code 属性は base64 エンコードされているためデコードする
        var rawCode = decodeCode(value['sh-code'] || '');
        var lang = value['sh-language'];
        var lineNumbers = isLineNumbersEnabled(value['sh-line-numbers']);

        // 再ハイライトのためにリセット
        $code.removeClass().removeAttr('data-highlighted');
        $pre.removeAttr('data-line-numbers');
        $pre.find('table.hljs-ln').remove();
        $code.text(rawCode);

        if (lang && lang !== 'auto') {
            $code.addClass('language-' + lang);
        }

        hljs.highlightElement($code[0]);

        if (lineNumbers) {
            $pre.attr('data-line-numbers', '1');
            hljs.lineNumbersBlockSync($code[0]);
        }

        // コピーボタンのイベントを紐付け（重複防止のため一度外す）
        $wrapper.find('.bge-sh-copy-btn').off('click').on('click', function () {
            var btn = this;
            // data-sh-code 属性から生テキストを取得（行番号テキストの混入を防ぐ）
            var text = $code[0].getAttribute('data-sh-code') || $code[0].innerText;
            navigator.clipboard.writeText(text).then(function () {
                btn.textContent = 'Copied!';
                setTimeout(function () { btn.textContent = 'Copy'; }, 2000);
            });
        });
    },
});
