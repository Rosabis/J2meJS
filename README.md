[中文说明](readme_zh.md)

## License

Copyright © 2026 Rosabis & Zixing.

J2meJS is free software, released under the **GNU General Public License version 2 (GPL-2.0)**. You may redistribute and/or modify it under the terms of that license.

This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the [GNU General Public License](LICENSE) for more details.

You should have received a copy of the GNU General Public License along with this program. If not, see <https://www.gnu.org/licenses/>.

### Network deployment and the source-code obligation

J2meJS is a purely client-side application. The browser downloads the full program and application data into local storage (including IndexedDB) and executes everything on the user's own device; no program code runs on the server.

For this reason, making a **modified** build available from any web server or network service delivers a complete, runnable copy to every visitor and therefore constitutes **distribution** under the GNU General Public License version 2. As required by Sections 2(b) and 3 of that License, if you distribute a modified version, you must make the complete corresponding source code of your modified version available to every recipient, at no charge. This restates existing License terms and is not an additional restriction.

Hosting a modified build on a server — or having its data stored in IndexedDB — does **not** exempt you from this obligation.

### Third-party assets

The emoji graphics under `java/style/emoji/` and `kaios/style/emoji/` are adapted from graphics originally © 2014 Twitter, Inc. and other contributors, and are licensed separately under **CC-BY 4.0** (<https://creativecommons.org/licenses/by/4.0/>). Their license terms are independent of this project's GPL-2.0 license.

If you accept the terms of the license, here are two versions of this software:

- [KaiOS version](https://rosabis.github.io/J2meJS/kaios/)
- [Normal version](https://rosabis.github.io/J2meJS/java/)
