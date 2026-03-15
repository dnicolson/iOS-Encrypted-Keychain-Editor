# iOS Keychain Backup Editor

<p align="center">
  <img src="./screenshot.png">
</p>

Allows editing of the iOS keychain without a jailbreak by updating the `keychain-backup.plist` file of an encrypted backup.

This repository is a basic React frontend for [irestore](https://github.com/dnicolson/node-irestore) with a simple Node.js backend to stitch together various Keychain pieces. It’s beyond the scope of this project to rebuild and transfer a full backup in the browser. The intended output is an updated encrypted `keychain-backup.plist`, which you can insert back into a backup with `irestore`.

Not all Keychain items are editable as `ThisDeviceOnly` items are only able to be decrypted with the hardware `0x835` key which is unique to each device.

This technique was originally developed to allow [signing in to Feedly](https://gist.github.com/dnicolson/73c9f7359db9f61b3621a1e4918aa136) with Reeder 4 on older iOS devices.

## Running

1. `git clone git@github.com:dnicolson/iOS-Encrypted-Keychain-Editor.git`
2. `cd iOS-Encrypted-Keychain-Editor`
1. `npm install`
2. `npm run start`

## Editing a Keychain
1. Create an encrypted backup with iTunes/Finder or iMazing
2. Enter the absolute path and password into iOS Keychain Backup Editor
3. Make edits to the Keychain
4. Click "Download Keychain Backup"
5. Run:

   ```bash
   irestore /path/to/backup restore KeychainDomain /tmp/backup-keychaindomain
   cp ~/Downloads/keychain-backup.plist /tmp/backup-keychaindomain/keychain-backup.plist
   irestore /path/to/backup unrestore KeychainDomain /tmp/backup-keychaindomain /path/to/backup-updated
   rm -rf /tmp/backup-keychaindomain
   ```

6. Restore the new backup

## License

MIT License.
