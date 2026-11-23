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
 * SaveManager - 用于导入导出游戏存档到ZIP文件
 * 支持将IndexedDB中的存档数据导出为ZIP文件,或从ZIP文件导入存档
 * 使用JSZip库进行ZIP文件操作
 */
var SaveManager = (function() {
  
  return {
    /**
     * 导出存档到ZIP文件
     * @param {string} gameName - 游戏名称
     * @param {Function} callback - 完成回调,参数为ZIP Blob
     */
    exportSaveToZip: function(gameName, callback) {
      if (typeof JSZip === 'undefined') {
        console.error('JSZip library not loaded');
        if (callback) callback(null);
        return;
      }

      if (typeof fs === 'undefined') {
        console.error('FileSystem not available');
        if (callback) callback(null);
        return;
      }

      // 等待fs初始化完成
      var doExport = function() {
        console.log('[SaveManager] doExport called, checking fs.exportStore...');
        if (typeof fs.exportStore !== 'function') {
          console.error('FileSystem exportStore not available');
          if (callback) callback(null);
          return;
        }

        console.log('[SaveManager] Calling fs.exportStore...');
        // 导出IndexedDB中的所有数据
        fs.exportStore(function(blob) {
          console.log('[SaveManager] fs.exportStore returned, blob size:', blob?.size);
          var reader = new FileReader();
          reader.onload = function() {
            try {
              console.log('[SaveManager] Parsing save data...');
              var saveData = JSON.parse(reader.result);
              console.log('[SaveManager] Save data keys:', Object.keys(saveData));
              var zip = new JSZip();

              // 将每个存档文件添加到ZIP
              Object.keys(saveData).forEach(function(key) {
                var record = saveData[key];
                if (!record.isDir && record.data) {
                  // 转换路径为有效的文件名
                  var filename = key.replace(/^\//, '').replace(/\//g, '_');
                  if (filename.length === 0) filename = 'root.dat';

                  // 添加元数据JSON
                  var metadata = {
                    path: key,
                    isDir: record.isDir,
                    size: record.size,
                    mtime: record.mtime
                  };

                  // 添加数据文件
                  var dataBytes = new Uint8Array(record.data);
                  zip.file('saves/' + filename, dataBytes);

                  // 添加元数据文件
                  var metaJson = JSON.stringify(metadata);
                  zip.file('metadata/' + filename + '.json', metaJson);
                }
              });

              // 添加游戏信息和导出时间
              var info = {
                gameName: gameName || 'Unknown',
                exportDate: new Date().toISOString(),
                version: '1.0'
              };
              zip.file('info.json', JSON.stringify(info, null, 2));

              // 生成ZIP文件
              zip.generateAsync({
                type: 'blob',
                compression: 'DEFLATE',
                compressionOptions: { level: 6 }
              }).then(function(zipBlob) {
                if (callback) callback(zipBlob);
              }).catch(function(err) {
                console.error('Failed to generate ZIP:', err);
                if (callback) callback(null);
              });
            } catch (e) {
              console.error('Failed to create ZIP:', e);
              if (callback) callback(null);
            }
          };
          reader.onerror = function() {
            console.error('Failed to read export data');
            if (callback) callback(null);
          };
          reader.readAsText(blob);
        });
      };

      // 检查是否等待initFS
      if (typeof initFS !== 'undefined' && initFS.then) {
        initFS.then(doExport).catch(function(err) {
          console.error('Failed to initialize FS:', err);
          if (callback) callback(null);
        });
      } else {
        // 如果没有initFS，直接执行
        doExport();
      }
    },

    /**
     * 从ZIP文件导入存档
     * @param {Blob} zipBlob - ZIP文件blob
     * @param {Function} callback - 完成回调
     */
    importSaveFromZip: function(zipBlob, callback) {
      if (typeof JSZip === 'undefined') {
        console.error('JSZip library not loaded');
        if (callback) callback(false);
        return;
      }

      if (typeof fs === 'undefined') {
        console.error('FileSystem not available');
        if (callback) callback(false);
        return;
      }

      var doImport = function() {
        if (typeof fs.importStore !== 'function') {
          console.error('FileSystem importStore not available');
          if (callback) callback(false);
          return;
        }

        // 加载ZIP文件
        var reader = new FileReader();
        reader.onload = function() {
          JSZip.loadAsync(reader.result).then(function(zip) {
            // 收集所有存档数据
            var saveData = {};
            var processedCount = 0;

            // 处理所有文件
            var promises = [];
            zip.forEach(function(relativePath, zipEntry) {
              if (!zipEntry.dir) {
                promises.push(zipEntry.async('uint8array').then(function(data) {
                  return {
                    path: relativePath,
                    data: data
                  };
                }));
              }
            });

            Promise.all(promises).then(function(files) {
              files.forEach(function(file) {
                if (file.path.startsWith('saves/')) {
                  var data = file.data;

                  // 读取对应的元数据文件
                  var metaFilename = 'metadata/' + file.path.replace('saves/', '') + '.json';
                  var metadata = null;

                  var metaFile = files.find(function(f) {
                    return f.path === metaFilename;
                  });

                  if (metaFile) {
                    try {
                      var metaText = String.fromCharCode.apply(null, metaFile.data);
                      metadata = JSON.parse(metaText);
                    } catch (e) {
                      console.warn('Failed to parse metadata:', e);
                    }
                  }

                  if (!metadata) {
                    metadata = {
                      path: '/' + file.path.replace('saves/', '').replace(/_/g, '/'),
                      isDir: false,
                      size: data.length,
                      mtime: Date.now()
                    };
                  }

                  saveData[metadata.path] = {
                    isDir: metadata.isDir || false,
                    size: metadata.size || data.length,
                    mtime: metadata.mtime || Date.now(),
                    data: Array.prototype.slice.call(data)
                  };
                  processedCount++;
                }
              });

              // 先导出现有数据，然后合并（不清空，只覆盖）
              fs.exportStore(function(existingBlob) {
                var reader = new FileReader();
                reader.onload = function() {
                  try {
                    var existingData = JSON.parse(reader.result);
                    
                    // 合并数据：ZIP中的数据覆盖现有数据
                    Object.keys(saveData).forEach(function(key) {
                      existingData[key] = saveData[key];
                    });
                    
                    // 导入合并后的数据
                    var importBlob = new Blob([JSON.stringify(existingData)]);
                    fs.importStore(importBlob, function() {
                      console.log('Successfully imported/merged', processedCount, 'save files');
                      if (callback) callback(true);
                    });
                  } catch (e) {
                    console.error('Failed to merge save data:', e);
                    if (callback) callback(false);
                  }
                };
                reader.onerror = function() {
                  console.error('Failed to read existing data');
                  if (callback) callback(false);
                };
                reader.readAsText(existingBlob);
              });
            }).catch(function(err) {
              console.error('Failed to process ZIP files:', err);
              if (callback) callback(false);
            });
          }).catch(function(err) {
            console.error('Failed to load ZIP:', err);
            if (callback) callback(false);
          });
        };
        reader.onerror = function() {
          console.error('Failed to read ZIP file');
          if (callback) callback(false);
        };
        reader.readAsArrayBuffer(zipBlob);
      };

      // 检查是否等待initFS
      if (typeof initFS !== 'undefined' && initFS.then) {
        initFS.then(doImport).catch(function(err) {
          console.error('Failed to initialize FS:', err);
          if (callback) callback(false);
        });
      } else {
        // 如果没有initFS，直接执行
        doImport();
      }
    },

    /**
     * 下载导出的ZIP文件
     * @param {Blob} zipBlob - ZIP文件blob
     * @param {string} filename - 下载的文件名
     */
    downloadZip: function(zipBlob, filename) {
      if (typeof saveAs !== 'undefined') {
        // 使用FileSaver.js
        saveAs(zipBlob, filename);
      } else {
        // 使用原生下载
        var url = URL.createObjectURL(zipBlob);
        var a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        setTimeout(function() { URL.revokeObjectURL(url); }, 1000);
      }
    }
  };
})();

// 导出模块
if (typeof module !== 'undefined' && module.exports) {
  module.exports = SaveManager;
}
