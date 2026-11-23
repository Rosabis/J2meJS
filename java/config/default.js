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

"use strict";var MIDlet={name:"aMIDlet",SMSDialogVerificationText:"This app sent you an SMS. Type the message you received here:",SMSDialogTimeout:3e5,SMSDialogTimeoutText:"left",SMSDialogReceiveFilter:function(e){return e},wakeUpAlarm:6e4,shouldStartBackgroundService:function(){return!0}},config={main:"com/sun/midp/main/MIDletSuiteLoader",ignoredFiles:new Set,invokeThreshold:10,backwardBranchThreshold:10,runtimeCompilation:"1",maxFps:"0",speed:"1",fontSmall:"18",fontMedium:"22",fontLarge:"26",keyLayout:"nokia"},APP_BASE_DIR="./";config.autosize="1",config.logConsole="web";