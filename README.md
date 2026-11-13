🧮 Subnet Calc
A simple desktop subnet calculator for Windows. Enter an IP address and CIDR prefix and instantly get the full network breakdown. No installation required.

✨ Features
IPv4 subnet calculation from an IP address with CIDR notation (e.g. 192.168.1.10/24)
Network details at a glance:
Network address
Broadcast address
Subnet mask and wildcard mask
First and last usable host
Total and usable host count
Instant results as you type
Input validation with clear feedback for invalid IPs or prefixes
Portable: a single .exe, no installer and no admin rights needed
Offline: no internet connection or account required
📥 Download
Go to the Releases page.
Download subnet-calc.exe (about 100 MB).
Double-click to run. No installation needed.
Note: Windows may show a SmartScreen warning because the app isn't code-signed. Click More info → Run anyway to continue.

💻 Requirements
Windows 10 or 11 (64-bit)
🛠️ Tech Stack
Layer	Technology
Desktop shell	Electron
UI	React
Build tooling	electron-vite (Vite)
Packaging	electron-builder
Language	JavaScript (JSX)
❓ FAQ
Why is the file around 100 MB? The app is built with Electron, which bundles its own browser engine (Chromium) so it runs on any Windows PC without extra software. The calculator itself is tiny, but the bundled engine makes up most of the size.

Why does the first launch take a moment? The portable build unpacks itself to a temporary folder on startup. Later launches are usually faster.

📝 License
All rights reserved. (Change this if you want to pick a license.)