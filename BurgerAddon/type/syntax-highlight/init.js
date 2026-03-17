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

BgE.registerTypeModule('SyntaxHighlight', {
    beforeOpen: function (editorDialog, type, data) {
        // BurgerEditor が data-bge を使って input.php のフォームに値を自動バインドする。
        // code 要素には hljs が生成したマークアップが格納されている可能性があるため、
        // テキストに正規化してからフォームへ流し込む。
        if (!data || typeof data['sh-code'] !== 'string') {
            return;
        }

        data['sh-code'] = normalizeSyntaxHighlightCode(data['sh-code']);
    },

    open: function (editorDialog, type) {
        // チェックボックスの状態を現在のブロックデータから復元する。
        // BurgerEditor は checkbox を自動復元しないため open() で手動設定する
        // （download-file addon と同じパターン）。
        var savedData = type.export();
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
        // 完了ボタン押下時、code要素のinnerHTMLではなくフォームの textarea の値から取るため
        // hljs マークアップが混入することはないが、念のため正規化する
        if (typeof newValues['sh-code'] === 'string') {
            newValues['sh-code'] = normalizeSyntaxHighlightCode(newValues['sh-code']);
        }
    },

    change: function (value, type) {
        var $wrapper = $(type.el);
        var $pre = $wrapper.find('pre');
        var $code = $wrapper.find('code');
        // value['sh-code'] には常に生コードが入っている（data-bge="sh-code" がついた
        // code 要素の innerHTML として BurgerEditor が import/export する）
        var rawCode = normalizeSyntaxHighlightCode(value['sh-code'] || '');
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
            var text = $code[0].innerText;
            navigator.clipboard.writeText(text).then(function () {
                btn.textContent = 'Copied!';
                setTimeout(function () { btn.textContent = 'Copy'; }, 2000);
            });
        });
    },
});
