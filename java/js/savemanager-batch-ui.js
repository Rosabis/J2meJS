/* -*- Mode: Java; tab-width: 2; indent-tabs-mode: nil; c-basic-offset: 2 -*- */
/* vim: set shiftwidth=2 tabstop=2 autoindent cindent expandtab: */

'use strict';

/**
 * 存档管理器UI初始化 - indexbatch.html版本
 * 处理存档导入导出的用户交互
 */
(function() {
  function tt(key) {
    return (window.I18n && I18n.t) ? I18n.t(key) : key;
  }

  // 等待DOM和fs加载完成
  function initSaveManager() {
    var importInput = document.getElementById('importSaveFileBatch');

    if (!importInput) {
      console.log('SaveManager Batch UI elements not found, retrying...');
      setTimeout(initSaveManager, 500);
      return;
    }

    // 文件选择事件
    importInput.addEventListener('change', function(e) {
      if (e.target.files.length > 0) {
        importSaveData(e.target.files[0]);
      }
    });

    console.log('SaveManager Batch initialized successfully');
  }

  /**
   * 导出存档数据到ZIP文件
   */
  window.exportSaveDataBatch = function() {
    if (typeof SaveManager === 'undefined') {
      alert(tt('save.notLoaded'));
      return;
    }

    console.log('[Batch Export] Starting export, fs type:', typeof fs);
    console.log('[Batch Export] fs.exportStore type:', typeof fs?.exportStore);

    // 显示导出提示
    showStatusMessage(tt('save.exportingBatch'), 'info');

    // 调用SaveManager导出
    if (typeof SaveManager !== 'undefined' && SaveManager.exportSaveToZip) {
      SaveManager.exportSaveToZip('j2me_batch', function(zipBlob) {
        console.log('[Batch Export] Export completed, zipBlob:', zipBlob);
        if (zipBlob) {
          // 生成文件名
          var filename = generateSaveFilename('j2me_batch');
          console.log('[Batch Export] Downloading as:', filename);
          // 下载ZIP文件
          SaveManager.downloadZip(zipBlob, filename);
          showStatusMessage(tt('save.exportOk'), 'success');
        } else {
          console.error('[Batch Export] Export returned null');
          showStatusMessage(tt('save.exportFail'), 'error');
        }
      });
    } else {
      showStatusMessage(tt('save.notReady'), 'error');
    }
  }

  /**
   * 触发导入存档文件选择
   */
  window.triggerImportSaveBatch = function() {
    var importInput = document.getElementById('importSaveFileBatch');
    if (importInput) {
      importInput.click();
    } else {
      alert(tt('save.importNotReady'));
    }
  }

  /**
   * 从ZIP文件导入存档数据
   */
  function importSaveData(zipFile) {
    if (typeof SaveManager === 'undefined') {
      alert(tt('save.notLoaded'));
      return;
    }

    // 显示导入确认对话框
    showConfirmDialog(
      tt('save.confirmImportTitle'),
      tt('save.confirmImportBody'),
      function(confirmed) {
        if (confirmed) {
          performImport(zipFile);
        }
      }
    );
  }

  /**
   * 执行实际的导入操作
   */
  function performImport(zipFile) {
    showStatusMessage(tt('save.importing'), 'info');

    if (typeof SaveManager !== 'undefined' && SaveManager.importSaveFromZip) {
      SaveManager.importSaveFromZip(zipFile, function(success) {
        if (success) {
          showStatusMessage(tt('save.importOk'), 'success');
          // 延迟重新加载页面以应用新存档
          setTimeout(function() {
            location.reload();
          }, 2000);
        } else {
          showStatusMessage(tt('save.importFail'), 'error');
        }
      });
    } else {
      showStatusMessage(tt('save.notReady'), 'error');
    }
  }

  /**
   * 生成存档文件名
   */
  function generateSaveFilename(prefix) {
    var now = new Date();
    var dateStr = now.toISOString().replace(/[:.]/g, '-').split('T')[0];
    var timeStr = now.toTimeString().split(' ')[0].replace(/:/g, '-');
    return prefix + '_save_' + dateStr + '_' + timeStr + '.zip';
  }

  /**
   * 显示状态消息
   */
  function showStatusMessage(message, type) {
    type = type || 'info';
    console.log('[' + type.toUpperCase() + '] ' + message);
    
    // 使用简单的alert显示错误，成功消息用console
    if (type === 'error') {
      alert(message);
    } else if (type === 'success') {
      alert(message);
    } else {
      // info级别可以只在console显示
      console.log(message);
    }
  }

  /**
   * 显示确认对话框
   */
  function showConfirmDialog(title, message, callback) {
    var confirmed = confirm(message);
    callback(confirmed);
  }

  // 页面加载后初始化
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initSaveManager);
  } else {
    initSaveManager();
  }
})();
