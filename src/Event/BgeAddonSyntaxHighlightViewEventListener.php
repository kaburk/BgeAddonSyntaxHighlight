<?php
declare(strict_types=1);
/**
 * BgeAddonSyntaxHighlight
 *
 * @copyright     Copyright (c) kaburk
 * @link          https://github.com/kaburk/BgeAddonSyntaxHighlight
 * @license       https://opensource.org/licenses/mit-license.php MIT License
 */

namespace BgeAddonSyntaxHighlight\Event;

use BaserCore\Event\BcViewEventListener;
use BaserCore\Utility\BcUtil;
use Cake\Event\EventInterface;
use Cake\View\View;

/**
 * BgeAddonSyntaxHighlight View Event Listener
 *
 * フロントエンドに highlight.js と highlightjs-line-numbers.js を注入する
 */
class BgeAddonSyntaxHighlightViewEventListener extends BcViewEventListener
{

    /**
     * 登録イベント
     *
     * @var array
     */
    public $events = [
        'beforeLayout',
    ];

    /**
     * beforeLayout
     *
     * フロントエンドのページに highlight.js 関連ファイルを読み込む
     *
     * @param EventInterface $event
     * @return void
     */
    public function beforeLayout(EventInterface $event)
    {
        /** @var View $View */
        $View = $event->getSubject();

        // 管理画面は除外（管理画面向けは load.php が担当）
        if (BcUtil::isAdminSystem()) {
            return;
        }

        // メール・RSS等のレイアウトは除外
        $excludeViewPath = [
            'email/text',
            'Blog/rss',
            'Feed',
        ];
        if (in_array($View->getTemplatePath(), $excludeViewPath)) {
            return;
        }

        $View->BcBaser->css(
            'BgeAddonSyntaxHighlight.bge-addon-syntax-highlight',
            false
        );
        $View->BcBaser->css(
            'BgeAddonSyntaxHighlight.vendor/highlight-theme.min',
            false
        );
        $View->BcBaser->js(
            'BgeAddonSyntaxHighlight.vendor/highlight.min',
            false,
            ['defer' => 'defer']
        );
        $View->BcBaser->js(
            'BgeAddonSyntaxHighlight.vendor/highlightjs-line-numbers.min',
            false,
            ['defer' => 'defer']
        );

        // フロントエンド初期化インラインスクリプト
        $initScript = <<<'JS'
document.addEventListener('DOMContentLoaded', function() {
    // data-sh-code 属性は base64 エンコードされているためデコードする
    function decodeCode(str) {
        if (typeof str !== 'string' || !str) { return str; }
        try {
            return decodeURIComponent(escape(atob(str)));
        } catch (e) {
            return str;
        }
    }

    if (typeof hljs !== 'undefined') {
        document.querySelectorAll('[data-bgb="syntax-highlight"] pre code').forEach(function(el) {
            // 管理画面でハイライト済みの HTML が保存されているため、そのまま表示する。
            // 再度 highlightElement() するとハイライト済みの警告が出るうえ、
            // 行番号テーブルの textContent には改行が無く、コードが1行に潰れてしまう。
            if (el.getAttribute('data-highlighted') === 'yes' || el.querySelector('table.hljs-ln')) {
                return;
            }
            var pre = el.closest('pre');
            var lineNumbers = pre && (
                pre.getAttribute('data-line-numbers') === '1' ||
                pre.getAttribute('data-line-numbers') === 'true'
            );

            hljs.highlightElement(el);

            if (lineNumbers && typeof hljs.lineNumbersBlock === 'function') {
                hljs.lineNumbersBlock(el);
            }
        });
    }
    document.querySelectorAll('[data-bgb="syntax-highlight"] .bge-sh-copy-btn').forEach(function(btn) {
        btn.addEventListener('click', function() {
            var wrapper = btn.closest('.bge-sh-wrapper');
            if (!wrapper) return;
            var code = wrapper.querySelector('code');
            if (!code) return;
            // data-sh-code 属性から生テキストを取得（行番号テキストの混入を防ぐ）
            var text = code.getAttribute('data-sh-code') || code.innerText;
            // data-sh-code 属性は base64 エンコードされているためデコードする
            var rawCode = decodeCode(text || '');
            navigator.clipboard.writeText(rawCode).then(function() {
                btn.textContent = 'Copied!';
                setTimeout(function() { btn.textContent = 'Copy'; }, 2000);
            });
        });
    });
});
JS;
        $View->append('script', '<script>' . $initScript . '</script>');
    }

}
