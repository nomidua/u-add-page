/***
 * uCoz Add Page Tools
 * Version: 1.0
 * Updated: 09.10.2026
 * Служебный скрипт для страницы добавления/редактирования материала uCoz.
 *
 * Подключение (в шаблоне страницы добавления, после $BODY$, БЕЗ async/defer):
 *   <script>window.uzCfg={imgW:800,imgH:451,imgUsers:['user1'],prUsers:['user1','user2']};</script>
 *   <script src="https://cdn.jsdelivr.net/gh/nomidua/clean-html-script@main/clean-html.js?v=$YEAR$$MONTH$$DAY$"></script>
 *   <script src="https://cdn.jsdelivr.net/gh/nomidua/u-add-page@main/u-add-page.js?v=$YEAR$$MONTH$$DAY$"></script>
 *
 * Настройки (window.uzCfg, все необязательные):
 *   imgW, imgH   — ширина/высота первого изображения (по умолчанию 800x451)
 *   imgUsers     — логины (в нижнем регистре), для которых ставится размер первого изображения
 *   prUsers      — логины (в нижнем регистре), для которых автоматически ставится «PR»
 *   Если списка нет — соответствующая функция не работает.
 *
 * Блоки:
 * 1. Панель кнопок в тулбаре редактора (uzEd)
 * 2. Кнопка «Умная очистка HTML» (функция cleanHTMLContent из clean-html.js)
 * 3. «Вставить содержание» (после 1-го абзаца / до 1-го заголовка)
 * 4. Очистка и замена кавычек при сохранении
 * 5. Ширина и высота первого изображения
 * 6. Редирект после сохранения
 * 7. Автоматический PR по пользователю
 ***/

(function () {
  'use strict';

  if (window.uzAddPageLoaded) return;
  window.uzAddPageLoaded = true;

  var cfg = window.uzCfg || {};

  // ===== 1. Панель кнопок в тулбаре редактора =====
  window.uzEd = window.uzEd || {
    i: function (t) { return t.replace(/;/g, '!important;'); },
    bar: function (r) {
      var c = document.querySelector('#nwM23') || document.querySelector('.manTdText'),
          w = document.getElementById('uz-edbar');
      if (!w && c) {
        w = document.createElement('div');
        w.id = 'uz-edbar';
        w.style.cssText = uzEd.i('position:absolute;top:10px;right:8px;z-index:9999;display:flex;flex-direction:column;align-items:flex-end;gap:9px;margin:0;padding:0;width:auto;background:none;border:none;');
        getComputedStyle(c).position === 'static' && (c.style.position = 'relative');
        c.appendChild(w);
        var e = window.CKEDITOR && CKEDITOR.instances.message;
        if (e) {
          var m = function () {
            var t = e.container && e.container.$.querySelector('.cke_top');
            if (t) {
              getComputedStyle(t).position === 'static' && (t.style.position = 'relative');
              w.style.setProperty('top', '8px', 'important');
              t.appendChild(w);
            }
          };
          e.status === 'ready' ? m() : e.on('instanceReady', m);
        }
      }
      w && w.appendChild(r);
    }
  };

  var BTN = 'display:inline-block;float:none;position:static;width:auto;min-width:0;min-height:0;max-height:none;height:24px;line-height:16px;margin:0;padding:4px 8px;box-sizing:border-box;border:none;border-radius:3px;cursor:pointer;color:#fff;font-size:12px;font-weight:normal;text-transform:none;text-shadow:1px 1px #00000052;';

  // ===== 2. Кнопка «Умная очистка HTML» =====
  document.addEventListener('DOMContentLoaded', function () {
    var s = document.createElement('style');
    s.textContent = '.edtTypeMenu::before,.edtTypeMenu::after{content:""!important}';
    document.head.appendChild(s);
    var r = document.createElement('div'), b = document.createElement('button');
    r.style.cssText = uzEd.i('display:flex;align-items:center;gap:4px;order:2;margin:0;padding:0;');
    b.type = 'button';
    b.innerHTML = 'Умная очистка HTML';
    b.style.cssText = uzEd.i(BTN + 'background:linear-gradient(270deg,rgb(42,123,155) 0,rgb(87,199,133) 65%);');
    b.onclick = function () { if (typeof cleanHTMLContent === 'function') cleanHTMLContent(); };
    r.appendChild(b);
    uzEd.bar(r);
  });

  // ===== 3. Вставить содержание =====
  window.generateTableOfContents = function (mode) {
    if (typeof CKEDITOR === 'undefined' || !CKEDITOR.instances.message) return;
    var html = CKEDITOR.instances.message.getData();
    if (!html) return;
    var tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;
    var h2s = tempDiv.querySelectorAll('h2');
    if (h2s.length === 0) { alert('Не найдено заголовков H2!'); return; }
    if (h2s.length === 1) { alert('Только один H2 — содержание не требуется!'); return; }
    var firstParaEl = tempDiv.querySelector('p');
    var textForLang = firstParaEl ? (firstParaEl.textContent || firstParaEl.innerText) : (h2s[0].textContent || h2s[0].innerText);
    var isUkrainian = /[іїєґІЇЄҐ]/i.test(textForLang);
    var title = isUkrainian ? 'Зміст' : 'Содержание';
    var translitMap = {'а':'a','б':'b','в':'v','г':'g','д':'d','е':'e','ё':'yo','ж':'zh','з':'z','и':'i','й':'y','к':'k','л':'l','м':'m','н':'n','о':'o','п':'p','р':'r','с':'s','т':'t','у':'u','ф':'f','х':'h','ц':'ts','ч':'ch','ш':'sh','щ':'shch','ъ':'','ы':'y','ь':'','э':'e','ю':'yu','я':'ya','і':'i','ї':'yi','є':'ye','ґ':'g','А':'A','Б':'B','В':'V','Г':'G','Д':'D','Е':'E','Ё':'Yo','Ж':'Zh','З':'Z','И':'I','Й':'Y','К':'K','Л':'L','М':'M','Н':'N','О':'O','П':'P','Р':'R','С':'S','Т':'T','У':'U','Ф':'F','Х':'H','Ц':'Ts','Ч':'Ch','Ш':'Sh','Щ':'Shch','Ъ':'','Ы':'Y','Ь':'','Э':'E','Ю':'Yu','Я':'Ya','І':'I','Ї':'Yi','Є':'Ye','Ґ':'G'};
    function translit(text) { return text.split('').map(function (ch) { return translitMap[ch] || ch; }).join(''); }
    function slugify(text) {
      var slug = translit(text);
      slug = slug.replace(/[^a-zA-Z0-9\s]/g, '');
      slug = slug.trim().toLowerCase();
      var words = slug.split(/\s+/);
      if (words.length > 5) words = words.slice(0, 5);
      return words.join('-');
    }
    var tocItems = [], usedIds = {};
    h2s.forEach(function (h2) {
      var text = (h2.textContent || h2.innerText).replace(/<br\s*\/?>/gi, ' ').trim();
      var baseId = slugify(text), id = baseId, counter = 1;
      while (usedIds[id]) { id = baseId + '-' + counter; counter++; }
      usedIds[id] = true;
      var h2Html = h2.outerHTML;
      if (h2Html.indexOf('id=') !== -1) { h2Html = h2Html.replace(/\sid="[^"]*"/, '').replace(/\sid='[^']*'/, ''); }
      h2Html = h2Html.replace(/<h2/, '<h2 id="' + id + '"');
      h2.outerHTML = h2Html;
      tocItems.push('<li><a href="#' + id + '">' + text + '</a></li>');
    });
    var tocHTML = '<div class="table-of-contents"><details' + (tocItems.length > 10 ? '' : ' open') + '><summary class="table-of-contents-title">' + title + '</summary><ul>' + tocItems.join('') + '</ul></details></div>';
    html = tempDiv.innerHTML;
    var fh = html.search(/<h2[\s>]/i);
    var firstP = html.match(/<p[^>]*>[\s\S]*?<\/p>/i);
    if (mode === 'h2' && fh > -1) { html = html.slice(0, fh) + tocHTML + html.slice(fh); }
    else if (firstP) { html = html.replace(firstP[0], firstP[0] + tocHTML); }
    else { html = tocHTML + html; }
    CKEDITOR.instances.message.setData(html);
  };

  document.addEventListener('DOMContentLoaded', function () {
    var r = document.createElement('div'), s = document.createElement('select'), b = document.createElement('button');
    r.style.cssText = uzEd.i('display:flex;align-items:center;gap:4px;order:1;margin:0;padding:0;');
    s.innerHTML = '<option value="p">После 1-го абзаца</option><option value="h2">До 1-го заголовка</option>';
    s.style.cssText = uzEd.i('display:inline-block;float:none;position:static;width:auto;min-width:0;min-height:0;max-height:none;height:24px;line-height:16px;margin:0;padding:0 4px;box-sizing:border-box;font-size:12px;border:1px solid #ccc;border-radius:3px;background:#fff;color:#333;text-transform:none;');
    b.type = 'button';
    b.innerHTML = 'Вставить содержание';
    b.style.cssText = uzEd.i(BTN + 'background:linear-gradient(270deg,rgb(155,123,42) 0,rgb(199,163,87) 65%);');
    b.onclick = function () { generateTableOfContents(s.value); };
    r.appendChild(s);
    r.appendChild(b);
    uzEd.bar(r);
  });

  // ===== 4. Очистка и замена кавычек при сохранении =====
  (function () {
    var f = document.getElementById('addEntForm');
    if (!f) return;
    f.addEventListener('submit', function (e) {
      var fields = [].slice.call(e.target.querySelectorAll('input[name="title"],input[name="meta_title"],textarea[name="meta_description"]'));
      [].slice.call(e.target.querySelectorAll('.charcount.an,.charcount.des')).forEach(function (x) { fields.push(x.previousElementSibling); });
      fields.forEach(function (i) {
        if (!i || !i.matches('input,textarea')) return;
        i.value = i.value.replace(/"([^"]*)"/g, '«$1»').replace(/"/g, '″');
      });
    }, true);
  })();

  // ===== 5. Ширина и высота первого изображения =====
  (function () {
    var users = cfg.imgUsers || [];
    var u = document.getElementById('usr29Bl');
    if (!u || users.indexOf(u.textContent.trim().toLowerCase()) === -1) return;
    var W = cfg.imgW || 800, H = cfg.imgH || 451;
    var ob = new MutationObserver(function () {
      var w = document.querySelector('[name=iws1]'), h = document.querySelector('[name=ihs1]');
      if (w && h) { w.value = W; h.value = H; ob.disconnect(); }
    });
    ob.observe(document.body, { childList: true, subtree: true });
  })();

  // ===== 6. Редирект после сохранения =====
  (function () {
    if (!window.jQuery) return;
    var int = setInterval(function () {
      var redir = jQuery('.myWinCont a').attr('href');
      if (redir != undefined) { window.location.href = redir; clearInterval(int); }
    }, 5);
  })();

  // ===== 7. Автоматический PR по пользователю =====
  (function () {
    var n = cfg.prUsers || [];
    if (!n.length || !(window.uCoz && uCoz.addEdit && uCoz.addEdit.isAdd)) return;
    var f = document.getElementById('addEntForm'), u = document.getElementById('usr29Bl');
    if (!f || !u) return;
    var row = [].slice.call(f.querySelectorAll('tr')).find(function (r) { return r.cells && r.cells[0] && /^PR\b/i.test(r.cells[0].textContent.trim()); });
    var p = row && row.querySelector('input[type="text"]');
    if (!p) return;
    var a = 0, m = 0, l = '';
    var c = function (v) { v ? p.style.setProperty('background', 'rgba(164,227,186,.2)', 'important') : p.style.removeProperty('background'); };
    var s = function () {
      var x = u.textContent.trim().toLowerCase();
      if (l && x !== l) m = 0;
      l = x;
      if (!m && n.indexOf(x) !== -1 && !p.value.trim()) { p.value = 'PR'; a = 1; c(1); }
      else if (n.indexOf(x) === -1 && a && p.value === 'PR') { p.value = ''; a = 0; c(0); }
    };
    p.addEventListener('input', function () { m = 1; a = 0; c(0); });
    s();
    new MutationObserver(s).observe(u.parentElement, { childList: true, subtree: true, characterData: true });
    f.addEventListener('submit', s, true);
  })();

})();
