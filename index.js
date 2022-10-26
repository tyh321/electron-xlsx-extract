//app 模块，控制整个应用程序的事件生命周期。
//BrowserWindow 模块，它创建和管理程序的窗口。

const { app, BrowserWindow, ipcMain, dialog } = require('electron');
// const path = require('path');

let mainWindow;

//在 Electron 中，只有在 app 模块的 ready 事件被激发后才能创建浏览器窗口
app.on('ready', () => {
    //创建一个窗口
    mainWindow = new BrowserWindow({
        // resizable: false, //不允许用户改变窗口大小
        width: 800, //设置窗口宽高
        height: 600,
        // icon: iconPath, //应用运行时的标题栏图标
        webPreferences: {
            // backgroundThrottling: false, //设置应用在后台正常运行
            nodeIntegration: true, //设置能在页面使用nodejs的API
            contextIsolation: false,
            enableRemoteModule: true, // 可以使用remote
            // preload: path.join(__dirname, './preload.js'),
        },
    });

    //窗口加载html文件
    mainWindow.loadFile('./src/main.html');

    //增加该配置
    require('@electron/remote/main').initialize();
    require('@electron/remote/main').enable(mainWindow.webContents);
});

ipcMain.on('button:click', () => {
    dialog
        .showOpenDialog({
            filters: [{ name: 'Xlsx', extensions: ['xlsx'] }],
        })
        .then(async response => {
            try {
                const { XLSX } = require('xlsx-extract');

                const filePath = response.filePaths[0];

                let arr = [];

                await new Promise((resolve, reject) => {
                    new XLSX()
                        .extract(filePath)
                        .on('row', function (row) {
                            arr.push(row);
                            mainWindow.webContents.send('setCount', row);
                        })
                        .on('end', function (row) {
                            mainWindow.webContents.send('setRow', arr);
                            resolve();
                        })
                        .on('error', function (err) {
                            mainWindow.webContents.send('setRow', err);
                            reject(err);
                        });
                });
            } catch (error) {
                mainWindow.webContents.send('setRow', error);
            }
        });
});
