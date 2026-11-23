/*
 * J2meJS - a Java ME emulator implemented in JavaScript.
 * Copyright (C) 2026 Rosabis & Zixing
 * 
 * This program is free software; you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation; version 2 of the License only.
 * 
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 * 
 * You should have received a copy of the GNU General Public License along
 * with this program; if not, see <https://www.gnu.org/licenses/>.
 * 
 * Network use and the source code obligation:
 * J2meJS is a purely client-side application. The browser downloads the full
 * program and data into local storage (including IndexedDB) and runs everything
 * on the user's own device; no program code is executed on the server. Serving
 * a modified build from any web server therefore delivers a full, runnable copy
 * to every visitor and constitutes distribution under the GNU General Public
 * License version 2. As required by Sections 2(b) and 3 of that License, you
 * must make the complete corresponding source code of your modified version
 * available to every recipient at no charge. This restates existing License
 * terms and is not an additional restriction; neither network deployment nor
 * storage in IndexedDB exempts you from this obligation.
 */

/* -*- Mode: Java; tab-width: 2; indent-tabs-mode: nil; c-basic-offset: 2 -*- */
/* vim: set shiftwidth=2 tabstop=2 autoindent cindent expandtab: */

'use strict';

/**
 * 存档管理器UI初始化 (index.html专用)
 * 处理存档导入导出的用户交互
 */
(function() {
  var exportBtn = null;
  var importBtn = null;
  var importInput = null;

  // 等待DOM加载完成
  function initSaveManager() {
    exportBtn = document.getElementById('export-save-index-btn');
    importBtn = document.getElementById('import-save-index-btn');
    importInput = document.getElementById('importSaveFileIndex');

    // 如果按钮不存在，创建它们
    if (!exportBtn || !importBtn) {
      createSaveManagerButtons();
    }

    // 绑定事件
    bindEvents();

    console.log('SaveManager (index) initialized successfully');
  }

  /**
   * 创建存档管理按钮
   */
  function createSaveManagerButtons() {
    var buttonGroup = document.querySelector('.button-group');
    if (!buttonGroup) {
      console.warn('Button group container not found');
      return;
    }

    // 创建导出按钮
    exportBtn = document.createElement('button');
    exportBtn.id = 'export-save-index-btn';
    exportBtn.className = 'btn';
    exportBtn.textContent = (window.I18n && I18n.t) ? I18n.t('btn.exportSaves') : '导出所有存档';

    // 创建导入按钮
    importBtn = document.createElement('button');
    importBtn.id = 'import-save-index-btn';
    importBtn.className = 'btn';
    importBtn.textContent = (window.I18n && I18n.t) ? I18n.t('btn.importSaves') : '导入存档ZIP';

    // 添加到按钮组
    buttonGroup.appendChild(exportBtn);
    buttonGroup.appendChild(importBtn);

    importInput = document.getElementById('importSaveFileIndex');
  }

  /**
   * 绑定事件处理器
   */
  function bindEvents() {
    if (exportBtn) {
      exportBtn.addEventListener('click', function(e) {
        e.preventDefault();
        exportSaveData();
      });
    }

    if (importBtn) {
      importBtn.addEventListener('click', function(e) {
        e.preventDefault();
        if (importInput) {
          importInput.click();
        }
      });
    }

    if (importInput) {
      importInput.addEventListener('change', function(e) {
        if (e.target.files.length > 0) {
          importSaveData(e.target.files[0]);
        }
      });
    }
  }

  /**
   * 导出存档数据到ZIP文件
   */
  function exportSaveData() {
    // 显示导出提示
    showStatusMessage((window.I18n && I18n.t) ? I18n.t('save.exporting') : '正在导出所有存档...', 'info');

    // 调用SaveManager导出
    if (typeof SaveManager !== 'undefined' && SaveManager.exportSaveToZip) {
      SaveManager.exportSaveToZip('j2me-all-games', function(zipBlob) {
        if (zipBlob) {
          // 生成文件名
          var filename = generateSaveFilename('j2me-all-games');
          // 下载ZIP文件
          SaveManager.downloadZip(zipBlob, filename);
          showStatusMessage((window.I18n && I18n.t) ? I18n.t('save.exportOk') : '存档导出成功!', 'success');
        } else {
          showStatusMessage((window.I18n && I18n.t) ? I18n.t('save.exportFail') : '存档导出失败，请检查是否有存档数据!', 'error');
        }
      });
    } else {
      showStatusMessage((window.I18n && I18n.t) ? I18n.t('save.notReady') : '存档管理器未初始化!', 'error');
    }
  }

  /**
   * 从ZIP文件导入存档数据
   */
  function importSaveData(zipFile) {
    // 显示导入确认对话框
    var confirmed = confirm(
      (window.I18n && I18n.t) ? I18n.t('save.confirmImport') :
      '导入存档将覆盖当前所有存档数据，确定要继续吗?\n\n建议在导入前先导出当前存档作为备份!'
    );

    if (confirmed) {
      performImport(zipFile);
    }
  }

  /**
   * 执行实际的导入操作
   */
  function performImport(zipFile) {
    showStatusMessage((window.I18n && I18n.t) ? I18n.t('save.importing') : '正在导入存档...', 'info');

    if (typeof SaveManager !== 'undefined' && SaveManager.importSaveFromZip) {
      SaveManager.importSaveFromZip(zipFile, function(success) {
        if (success) {
          showStatusMessage((window.I18n && I18n.t) ? I18n.t('save.importOk') : '存档导入成功!页面将重新加载...', 'success');
          // 延迟重新加载页面以应用新存档
          setTimeout(function() {
            location.reload();
          }, 2000);
        } else {
          showStatusMessage((window.I18n && I18n.t) ? I18n.t('save.importFail') : '存档导入失败!请检查ZIP文件格式是否正确。', 'error');
        }
      });
    } else {
      showStatusMessage((window.I18n && I18n.t) ? I18n.t('save.notReady') : '存档管理器未初始化!', 'error');
    }
  }

  /**
   * 生成存档文件名
   */
  function generateSaveFilename(gameName) {
    var now = new Date();
    var dateStr = now.toISOString().replace(/[:.]/g, '-').split('T')[0];
    var timeStr = now.toTimeString().split(' ')[0].replace(/:/g, '-');
    return gameName + '_save_' + dateStr + '_' + timeStr + '.zip';
  }

  /**
   * 显示状态消息
   */
  function showStatusMessage(message, type) {
    type = type || 'info';
    console.log('[' + type.toUpperCase() + '] ' + message);

    // 创建一个简单的通知div
    var notification = document.createElement('div');
    notification.className = 'save-manager-notification';
    notification.textContent = message;

    // 设置样式
    notification.style.cssText = 'position: fixed; top: 20px; left: 50%; transform: translateX(-50%); ' +
      'padding: 15px 25px; border-radius: 5px; color: white; font-weight: bold; ' +
      'z-index: 10000; box-shadow: 0 4px 6px rgba(0,0,0,0.1);';

    // 根据类型设置背景色
    if (type === 'success') {
      notification.style.backgroundColor = '#4CAF50';
    } else if (type === 'error') {
      notification.style.backgroundColor = '#f44336';
    } else {
      notification.style.backgroundColor = '#2196F3';
    }

    document.body.appendChild(notification);

    // 3秒后自动关闭
    setTimeout(function() {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification);
      }
    }, 3000);
  }

  // 页面加载后初始化
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initSaveManager);
  } else {
    initSaveManager();
  }
})();
